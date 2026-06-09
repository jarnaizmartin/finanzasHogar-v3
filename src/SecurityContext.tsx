import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
  createContext,
} from 'react';
import type React from 'react';
import {
  generateSalt,
  hashPassword,
  verifyPassword,
  hashPhrase,
  verifyPhrase,
  verifyTOTP,
  sendEmailCode,
  verifyEmailCode,
  getEmailCodeForDisplay,
  normalizePhrase,
} from './lib/crypto';
import {
  TOTP_GRACE_DEFAULT_MS,
  INACTIVITY_DEFAULT_MS,
  saveTotpLastUnlock,
  isWithinTotpGrace,
} from './securityUtils';
import type { AuthMethod } from './types';

// ─── S.2 — Cifrado at-rest ────────────────────────────────────────────────────
import {
  generateKekSaltInfo,
  deriveKek,
  generateVmk,
  wrapVmk,
  unwrapVmk,
} from './lib/storageCrypto';
import {
  saveWrappedVmk,
  loadWrappedVmk,
  saveKekSaltInfo,
  loadKekSaltInfo,
  setActiveVmk,
  clearActiveVmk,
  destroyVault,
} from './lib/vaultKey';
import { flushPendingWrites } from './lib/encryptedStorage';
import { deriveSyncKey, generateSyncSalt } from './lib/sync/syncKey';

// Clave adicional en localStorage para la VMK envuelta con la frase de recuperación.
// Esto permite que, si el usuario olvida el password, la frase pueda
// desenvolver la VMK y reenvolverla con el password nuevo (sin perder datos).
const VAULT_RECOVERY_KEY_STORAGE = 'fh_vault_key_recovery';
const VAULT_RECOVERY_SALT_STORAGE = 'fh_vault_kek_salt_recovery';

/**
 * Helper interno: monta la VMK al activar seguridad por primera vez.
 *  1. Genera VMK aleatoria
 *  2. La envuelve con la KEK del password (uso normal)
 *  3. La envuelve TAMBIÉN con la KEK de la frase (recuperación)
 *  4. Persiste ambas envolturas + activa la VMK en memoria
 */
async function setupVaultForPassword(
  password: string,
  phrase: string
): Promise<void> {
  // ── 1. Generar VMK fresca
  const vmk = await generateVmk();

  // ── 2. Envolver con KEK del password
  const passwordSaltInfo = generateKekSaltInfo();
  const passwordKek = await deriveKek(password, passwordSaltInfo.salt);
  const passwordWrapped = await wrapVmk(vmk, passwordKek);
  saveKekSaltInfo(passwordSaltInfo);
  saveWrappedVmk(passwordWrapped);

  // ── 3. Envolver con KEK de la frase (para recovery)
  const recoverySaltInfo = generateKekSaltInfo();
  const recoveryKek = await deriveKek(
    normalizePhrase(phrase),
    recoverySaltInfo.salt
  );
  const recoveryWrapped = await wrapVmk(vmk, recoveryKek);
  localStorage.setItem(
    VAULT_RECOVERY_SALT_STORAGE,
    JSON.stringify(recoverySaltInfo)
  );
  localStorage.setItem(
    VAULT_RECOVERY_KEY_STORAGE,
    JSON.stringify(recoveryWrapped)
  );

  // ── 4. Activar VMK en memoria → encryptedStorage hidrata el cache
  setActiveVmk(vmk);
}

/**
 * Helper interno: cambia la KEK del password (recovery o cambio voluntario).
 * Recibe la VMK ya desenvuelta (por la frase o por el password antiguo).
 * Genera un salt nuevo y reenvuelve la VMK con el password nuevo.
 */
async function rewrapVmkWithNewPassword(
  vmk: CryptoKey,
  newPassword: string
): Promise<void> {
  const newSaltInfo = generateKekSaltInfo();
  const newKek = await deriveKek(newPassword, newSaltInfo.salt);
  const newWrapped = await wrapVmk(vmk, newKek);
  saveKekSaltInfo(newSaltInfo);
  saveWrappedVmk(newWrapped);
}

/**
 * Helper interno para flujos de recovery (frase o fichero):
 *  1. Carga la VMK envuelta con la frase (de localStorage)
 *  2. Deriva la KEK desde la frase y desenvuelve la VMK
 *  3. Reenvuelve la VMK con la KEK del password nuevo
 *  4. Activa la VMK en memoria (encryptedStorage hidrata el cache)
 *
 * Si NO hay VMK envuelta de recovery (usuario legacy pre-S.2), lanza error
 * y el caller debe decidir si tratarlo como "sigue sin cifrado".
 */
async function recoverVmkAndRewrap(
  phrase: string,
  newPassword: string
): Promise<void> {
  // ── Cargar la VMK envuelta con la frase
  const recoveryWrappedRaw = localStorage.getItem(VAULT_RECOVERY_KEY_STORAGE);
  const recoverySaltRaw = localStorage.getItem(VAULT_RECOVERY_SALT_STORAGE);
  if (!recoveryWrappedRaw || !recoverySaltRaw) {
    throw new Error('NO_RECOVERY_VMK'); // Usuario legacy sin VMK de recovery
  }

  const recoveryWrapped = JSON.parse(recoveryWrappedRaw);
  const recoverySaltInfo = JSON.parse(recoverySaltRaw);

  // ── Derivar KEK desde la frase y desenvolver la VMK
  const recoveryKek = await deriveKek(
    normalizePhrase(phrase),
    recoverySaltInfo.salt,
    recoverySaltInfo.iterations
  );
  const vmk = await unwrapVmk(recoveryWrapped, recoveryKek);

  // ── Reenvolver con el password nuevo y activar
  await rewrapVmkWithNewPassword(vmk, newPassword);
  setActiveVmk(vmk);
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const SECURITY_STORAGE_KEY = 'fh_security';
const LOCK_STATE_KEY = 'fh_lock_state';
// 🔑 Sync (opción B): salt (NO secreto) para derivar la clave de sync desde la
// contraseña. Se persiste en claro; la CLAVE derivada solo vive en memoria.
const SYNC_SALT_STORAGE = 'fh_sync_salt';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type SecurityState = {
  configured: boolean;
  authMethod: AuthMethod;
  passwordHash: string | null;
  passwordSalt: string | null;
  email: string | null;
  emailVerified: boolean;
  phraseHash: string | null;
  phraseSalt: string | null;
  recoveryFileHash: string | null;
  totpSecret: string | null;
  totpEnabled: boolean;
  inactivityMs: number;
  totpGraceMs: number;
};

type LockState = {
  locked: boolean;
  lockedAt: number | null;
};

// 🔴 FIX 1 — unlock ahora devuelve Promise<boolean> (necesario para TOTP async)
export type SecurityContextType = {
  security: SecurityState;
  isLocked: boolean;
  isConfigured: boolean;
  setupSecurity: (params: {
    authMethod: AuthMethod;
    password?: string;
    totpSecret?: string;
    totpGraceMs?: number;
    phrase: string;
    email?: string;
    forcePhraseHash?: string;
    forcePhraseSalt?: string;
  }) => Promise<void>;
  unlock: (input: string) => Promise<boolean>;
  lock: () => Promise<void>;
  // ⚠️ S.2.6a — Migración legacy
  needsVaultMigration: boolean;
  migrateLegacyToVault: (
    phrase: string
  ) => Promise<{ ok: boolean; error?: string }>;
  sendCode: (email: string) => Promise<{ ok: boolean; error?: string }>;
  verifyCode: (code: string) => { ok: boolean; error?: string };
  getCodeForDisplay: () => string | null;
  recoverWithPhrase: (phrase: string, newPassword: string) => Promise<boolean>;
  setPasswordDirectly: (newPassword: string) => Promise<boolean>;
  validateRecoveryFile: (
    fileContent: string
  ) => { ok: boolean; error?: string };
  recoverWithFile: (
    fileContent: string,
    newPassword: string
  ) => Promise<boolean>;
  updateInactivity: (ms: number) => void;
  updateTotpGrace: (ms: number) => void;
  updateEmail: (email: string) => void;
  clearSecurity: () => void;
  generateRecoveryFile: (phrase: string) => string;
  // 🔑 Sync (opción B) — la clave de sync vive solo en memoria; nunca la contraseña.
  /** Clave de sync en memoria (null si no está configurado o la app está bloqueada). */
  getSyncKey: () => CryptoKey | null;
  /** ¿Hay un salt de sync persistido (sync ya configurado en este dispositivo)? */
  hasSyncSalt: () => boolean;
  /**
   * Activa el sync en el dispositivo primario: verifica la contraseña, genera el
   * salt si no existe, deriva la clave y la mantiene en memoria. Devuelve false si
   * la contraseña no es correcta.
   */
  prepareSyncKey: (password: string) => Promise<boolean>;
  /**
   * Empareja un 2º dispositivo: deriva la clave desde la contraseña y el salt
   * leído de la cabecera del vault remoto, y persiste el salt. La validez de la
   * contraseña la confirma el descifrado del vault (WRONG_PASSWORD si no).
   */
  adoptSyncKey: (password: string, saltB64: string, iterations?: number) => Promise<void>;
  /** Olvida la clave de sync en memoria (no borra el salt). */
  clearSyncKey: () => void;
};

// ─── Estado por defecto ───────────────────────────────────────────────────────
const DEFAULT_SECURITY_STATE: SecurityState = {
  configured: false,
  authMethod: 'password',
  passwordHash: null,
  passwordSalt: null,
  email: null,
  emailVerified: false,
  phraseHash: null,
  phraseSalt: null,
  recoveryFileHash: null,
  totpSecret: null,
  totpEnabled: false,
  inactivityMs: INACTIVITY_DEFAULT_MS,
  totpGraceMs: TOTP_GRACE_DEFAULT_MS,
};

// ─── Helpers de persistencia ──────────────────────────────────────────────────
function loadSecurityState(): SecurityState {
  try {
    const raw = localStorage.getItem(SECURITY_STORAGE_KEY);
    if (!raw) return DEFAULT_SECURITY_STATE;
    return { ...DEFAULT_SECURITY_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SECURITY_STATE;
  }
}

function saveSecurityState(state: SecurityState): void {
  try {
    localStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn(
      '[Security] No se pudo guardar la configuración de seguridad.'
    );
  }
}

function saveLockState(state: LockState): void {
  try {
    localStorage.setItem(LOCK_STATE_KEY, JSON.stringify(state));
  } catch {
    console.warn('[Security] No se pudo guardar el estado de bloqueo.');
  }
}

// ─── Contexto ─────────────────────────────────────────────────────────────────
const SecurityContext = createContext<SecurityContextType | null>(null);

export function useSecurityContext(): SecurityContextType {
  const ctx = useContext(SecurityContext);
  if (!ctx)
    throw new Error(
      'useSecurityContext debe usarse dentro de <SecurityProvider>'
    );
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [security, setSecurity] = useState<SecurityState>(() =>
    loadSecurityState()
  );

  // ⚠️ S.2.6a — Flag que indica que el usuario acaba de hacer unlock pero
  // es LEGACY (sin VMK). La UI debe mostrar el modal pidiéndole la frase
  // para activar el cifrado at-rest.
  const [needsVaultMigration, setNeedsVaultMigration] =
    useState<boolean>(false);

  // ⚠️ S.2.6a — Cache temporal del password entre unlock y migración.
  // Se guarda en ref (no en estado) para evitar exponerlo en React DevTools
  // y se limpia inmediatamente tras la migración o al hacer lock.
  const pendingPasswordRef = useRef<string | null>(null);

  // 🔑 Clave de sync (opción B): SOLO en memoria, nunca persiste. Se deriva de la
  // contraseña al hacer unlock (si hay salt) o al activar/emparejar el sync.
  const syncKeyRef = useRef<CryptoKey | null>(null);

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const s = loadSecurityState();
    if (!s.configured) return false;
    if (
      s.authMethod === 'totp' &&
      isWithinTotpGrace(s.totpGraceMs ?? TOTP_GRACE_DEFAULT_MS)
    ) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    saveSecurityState(security);
  }, [security]);

  // ── Bloqueo por inactividad ────────────────────────────────────────────────
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetInactivityTimer = useCallback(() => {
    if (!security.configured || !security.inactivityMs) return;
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      setIsLocked(true);
      saveLockState({ locked: true, lockedAt: Date.now() });
    }, security.inactivityMs);
  }, [security.configured, security.inactivityMs]);

  useEffect(() => {
    if (!security.configured || isLocked) return;
    // F4.2 — Si hay migración pendiente, NO activar el inactivity timer.
    // Si el usuario tarda en escribir la frase, el lock cancelaría la
    // migración (limpia pendingPasswordRef) y quedaría imposible de completar
    // sin volver a desbloquear. Mejor dar tiempo ilimitado al modal.
    if (needsVaultMigration) return;
    const events = [
      'mousedown',
      'mousemove',
      'keydown',
      'touchstart',
      'scroll',
    ];
    events.forEach((e) => window.addEventListener(e, resetInactivityTimer));
    resetInactivityTimer();
    return () => {
      events.forEach((e) =>
        window.removeEventListener(e, resetInactivityTimer)
      );
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [security.configured, isLocked, needsVaultMigration, resetInactivityTimer]);

  // ── setupSecurity ─────────────────────────────────────────────────────────
  // ⚠️ S.2 — Ahora es ASYNC porque genera la VMK con Web Crypto.
  const setupSecurity = useCallback(
    async ({
      authMethod,
      password,
      totpSecret,
      totpGraceMs,
      phrase,
      email,
      forcePhraseHash,
      forcePhraseSalt,
    }: {
      authMethod: AuthMethod;
      password?: string;
      totpSecret?: string;
      totpGraceMs?: number;
      phrase: string;
      email?: string;
      forcePhraseHash?: string;
      forcePhraseSalt?: string;
    }): Promise<void> => {
      const salt = generateSalt();
      const phraseSalt = forcePhraseSalt ?? generateSalt();

      const newState: SecurityState = {
        ...DEFAULT_SECURITY_STATE,
        configured: true,
        authMethod,
        phraseHash: forcePhraseHash ?? hashPhrase(phrase, phraseSalt),
        phraseSalt,
        email: email ?? null,
        emailVerified: false,
        inactivityMs: INACTIVITY_DEFAULT_MS,
      };

      if (authMethod === 'password' && password) {
        newState.passwordHash = hashPassword(password, salt);
        newState.passwordSalt = salt;

        // ── S.2 — Generar VMK y envolverla con KEK del password + KEK de la frase
        // A partir de aquí, todas las escrituras a localStorage van cifradas.
        try {
          await setupVaultForPassword(password, phrase);
        } catch (err) {
          console.error('[Security] Error montando la VMK:', err);
          throw new Error(
            'No se pudo activar el cifrado de datos. Inténtalo de nuevo.'
          );
        }
      }

      if (authMethod === 'totp' && totpSecret) {
        newState.totpSecret = totpSecret;
        newState.totpEnabled = true;
        newState.totpGraceMs = totpGraceMs ?? TOTP_GRACE_DEFAULT_MS;
        // ⚠️ S.2 — TOTP-only NO activa cifrado at-rest (no hay password-secreto).
        // Estos usuarios serán migrados a password en S.2.6.
      }

      setSecurity(newState);
      setIsLocked(false);
    },
    []
  );

  // 🔴 FIX 1 — unlock ahora es async y verifica TOTP correctamente
  // ⚠️ S.2 — Tras un unlock por password exitoso, desenvolvemos la VMK
  //          y la activamos en memoria → encryptedStorage hidrata el cache.
  const unlock = useCallback(
    async (input: string): Promise<boolean> => {
      if (security.authMethod === 'password') {
        if (!security.passwordHash || !security.passwordSalt) return false;
        const ok = verifyPassword(
          input,
          security.passwordHash,
          security.passwordSalt
        );
        if (!ok) return false;

        // ── S.2 — Desenvolver la VMK con la KEK derivada del password ──────
        // Si el usuario tiene VMK envuelta (configurada en S.2.4b o posterior),
        // la activamos. Si no la tiene (usuario legacy pre-S.2), seguimos
        // sin cifrado — la migración a VMK ocurrirá en S.2.6.
        const wrappedVmk = loadWrappedVmk();
        const kekSaltInfo = loadKekSaltInfo();

        if (wrappedVmk && kekSaltInfo) {
          try {
            const kek = await deriveKek(
              input,
              kekSaltInfo.salt,
              kekSaltInfo.iterations
            );
            const vmk = await unwrapVmk(wrappedVmk, kek);
            setActiveVmk(vmk);
          } catch (err) {
            // Esto NO debería pasar nunca: si verifyPassword pasó, la KEK derivada
            // del mismo input debería desenvolver la VMK. Si falla, hay corrupción.
            console.error(
              '[Security] Password OK pero VMK no se pudo desenvolver:',
              err
            );
            return false;
          }
        } else {
          // ── S.2.6a — Usuario LEGACY: password OK pero no hay VMK envuelta.
          // Cacheamos el password (en memoria, no persistido) y marcamos que
          // se necesita migración. La UI mostrará un modal pidiendo la frase.
          pendingPasswordRef.current = input;
          setNeedsVaultMigration(true);
        }

        // 🔑 Sync (opción B): si el sync ya está configurado (hay salt), deriva la
        // clave de sync en memoria desde la contraseña recién verificada. La
        // contraseña NO se almacena. Best-effort: un fallo no impide el unlock.
        try {
          const syncSalt = localStorage.getItem(SYNC_SALT_STORAGE);
          if (syncSalt) {
            syncKeyRef.current = await deriveSyncKey(input, syncSalt);
          }
        } catch (err) {
          console.warn('[Security] No se pudo derivar la clave de sync:', err);
        }

        setIsLocked(false);
        saveLockState({ locked: false, lockedAt: null });
        return true;
      }

      if (security.authMethod === 'totp') {
        // ⚠️ S.2 — TOTP-only NO desbloquea cifrado at-rest (no hay password).
        // Estos usuarios serán migrados a password+TOTP en S.2.6.
        if (!security.totpSecret) return false;
        const ok = await verifyTOTP(security.totpSecret, input);
        if (ok) {
          setIsLocked(false);
          saveLockState({ locked: false, lockedAt: null });
          saveTotpLastUnlock();
        }
        return ok;
      }

      return false;
    },
    [security]
  );

  // ── lock ──────────────────────────────────────────────────────────────────
  // ⚠️ S.2 — Antes de bloquear, persistimos las escrituras pendientes
  //          y limpiamos la VMK de memoria (encryptedStorage limpia el cache).
  const lock = useCallback(async () => {
    try {
      // Forzar persistencia de cualquier escritura cifrada en debounce
      await flushPendingWrites();
    } catch (err) {
      console.error('[Security] Error flusheando escrituras al bloquear:', err);
      // Continuamos con el lock aunque falle: prioridad es bloquear.
    }
    clearActiveVmk(); // → encryptedStorage limpia su cache automáticamente
    // 🔑 Olvidar la clave de sync de memoria al bloquear (se re-deriva al unlock).
    syncKeyRef.current = null;
    // ⚠️ S.2.6a — Si quedó migración pendiente, la cancelamos (se reintentará
    // tras el próximo unlock). Limpiamos también el password cacheado.
    pendingPasswordRef.current = null;
    setNeedsVaultMigration(false);
    setIsLocked(true);
    saveLockState({ locked: true, lockedAt: Date.now() });
  }, []);

  // ── S.2.6a — Migración legacy → vault cifrado ─────────────────────────────
  // Llamado desde la UI tras el primer unlock post-actualización cuando
  // needsVaultMigration === true. El usuario aporta la frase de 12 palabras;
  // si coincide, generamos la VMK, la envolvemos con KEK(password) + KEK(frase)
  // y la activamos → encryptedStorage hidrata el cache (con valores en claro)
  // y los re-persiste cifrados de forma transparente.
  const migrateLegacyToVault = useCallback(
    async (phrase: string): Promise<{ ok: boolean; error?: string }> => {
      if (!needsVaultMigration) {
        return { ok: false, error: 'No hay migración pendiente.' };
      }
      const password = pendingPasswordRef.current;
      if (!password) {
        // Defensivo: el password debería estar cacheado tras unlock.
        return {
          ok: false,
          error:
            'No se encontró el password en memoria. Bloquea y desbloquea de nuevo.',
        };
      }
      if (!security.phraseHash || !security.phraseSalt) {
        return {
          ok: false,
          error: 'No hay frase de recuperación configurada en este perfil.',
        };
      }
      const ok = verifyPhrase(phrase, security.phraseHash, security.phraseSalt);
      if (!ok) {
        return { ok: false, error: 'La frase introducida no es correcta.' };
      }

      try {
        await setupVaultForPassword(password, phrase);
        // Limpieza inmediata del password cacheado y del flag
        pendingPasswordRef.current = null;
        setNeedsVaultMigration(false);
        return { ok: true };
      } catch (err) {
        console.error('[Security] Error en migración legacy:', err);
        return {
          ok: false,
          error: 'No se pudo activar el cifrado. Inténtalo de nuevo.',
        };
      }
    },
    [needsVaultMigration, security.phraseHash, security.phraseSalt]
  );

  // ── Email ─────────────────────────────────────────────────────────────────
  const sendCode = useCallback(
    async (email: string) => sendEmailCode(email),
    []
  );
  const verifyCode = useCallback((code: string) => verifyEmailCode(code), []);
  const getCodeForDisplay = useCallback(() => getEmailCodeForDisplay(), []);

  // ── Recuperación con frase ────────────────────────────────────────────────
  // ⚠️ S.2 — Async: desenvuelve la VMK con la frase y la reenvuelve con
  //          el password nuevo. Sin esto, recovery = pérdida de datos.
  const recoverWithPhrase = useCallback(
    async (phrase: string, newPassword: string): Promise<boolean> => {
      if (!security.phraseHash || !security.phraseSalt) return false;
      const ok = verifyPhrase(phrase, security.phraseHash, security.phraseSalt);
      if (!ok) return false;

      // ── S.2 — Recuperar VMK desde la envoltura de la frase y reenvolverla
      try {
        await recoverVmkAndRewrap(phrase, newPassword);
      } catch (err) {
        console.error('[Security] Error recuperando VMK con frase:', err);
        // Si el usuario es legacy (sin VMK de recovery), continuamos sin cifrado.
        // Si es post-S.2 y falla, es corrupción real → abortar para no dejar
        // a medias el cambio de password.
        if (loadWrappedVmk() !== null) return false;
      }

      const salt = generateSalt();
      setSecurity((prev) => ({
        ...prev,
        passwordHash: hashPassword(newPassword, salt),
        passwordSalt: salt,
        authMethod: 'password',
      }));
      setIsLocked(false);
      return true;
    },
    [security]
  );

  // ── F4.1 — Cambio directo de password tras verificación por email ─────────
  // Usado por LockScreen tras verificar el código de email. NO requiere frase
  // ni password antiguo: confiamos en que verifyCode ya validó la identidad
  // del usuario (tiene acceso a su email).
  //
  // ⚠️ Limitación post-S.2: si el usuario tiene VMK envuelta, NO podemos
  // reenvolverla sin la frase o el password antiguo (no los tenemos).
  // En ese caso devolvemos false y la UI debe redirigir a recovery por frase.
  // Para usuarios SIN VMK (legacy o sin cifrado), el cambio funciona limpio.
  const setPasswordDirectly = useCallback(
    async (newPassword: string): Promise<boolean> => {
      // Si hay VMK envuelta, no podemos hacer el cambio sin la frase
      if (loadWrappedVmk() !== null) {
        console.warn(
          '[Security] setPasswordDirectly bloqueado: hay VMK envuelta. Usa recoverWithPhrase.'
        );
        return false;
      }
      const salt = generateSalt();
      setSecurity((prev) => ({
        ...prev,
        passwordHash: hashPassword(newPassword, salt),
        passwordSalt: salt,
        authMethod: 'password',
      }));
      setIsLocked(false);
      saveLockState({ locked: false, lockedAt: null });
      return true;
    },
    []
  );

  // ── Validación fichero de recuperación ───────────────────────────────────
  const validateRecoveryFile = useCallback(
    (fileContent: string): { ok: boolean; error?: string } => {
      try {
        const parsed = JSON.parse(fileContent);
        if (parsed.type !== 'fh-recovery')
          return {
            ok: false,
            error: 'El fichero no es un fichero de recuperación válido.',
          };
        if (!parsed.phraseHash || !parsed.phraseSalt)
          return {
            ok: false,
            error:
              'El fichero no contiene los datos necesarios para la recuperación.',
          };
        if (
          parsed.phraseHash !== security.phraseHash ||
          parsed.phraseSalt !== security.phraseSalt
        )
          return {
            ok: false,
            error:
              'Este fichero no corresponde a la configuración de seguridad actual. Usa el fichero más reciente.',
          };
        return { ok: true };
      } catch {
        return {
          ok: false,
          error:
            'No se pudo leer el fichero. Asegúrate de que es un .json válido.',
        };
      }
    },
    [security]
  );

  // ── Recuperación con fichero ──────────────────────────────────────────────
  // ⚠️ S.2 — El fichero contiene phraseHash/phraseSalt pero NO la frase en sí.
  //          Para desenvolver la VMK necesitamos la frase real. Por eso ahora
  //          el fichero también contiene la propia frase (cifrada con derivación
  //          desde su propio salt). En recovery legacy (fichero antiguo sin
  //          frase embebida) seguimos sin cifrado.
  //          Ver generateRecoveryFile (S.2 lo ampliará en próximo sub-bloque).
  const recoverWithFile = useCallback(
    async (fileContent: string, newPassword: string): Promise<boolean> => {
      try {
        const parsed = JSON.parse(fileContent);
        if (parsed.type !== 'fh-recovery') return false;
        if (!parsed.phraseHash || !parsed.phraseSalt) return false;
        if (parsed.phraseHash !== security.phraseHash) return false;
        if (parsed.phraseSalt !== security.phraseSalt) return false;

        // ── S.2 — Si el fichero embebe la frase, podemos recuperar la VMK
        if (typeof parsed.phrase === 'string' && parsed.phrase.length > 0) {
          try {
            await recoverVmkAndRewrap(parsed.phrase, newPassword);
          } catch (err) {
            console.error('[Security] Error recuperando VMK con fichero:', err);
            if (loadWrappedVmk() !== null) return false;
          }
        }
        // Si el fichero es legacy (sin parsed.phrase), continuamos sin cifrado.

        const salt = generateSalt();
        setSecurity((prev) => ({
          ...prev,
          passwordHash: hashPassword(newPassword, salt),
          passwordSalt: salt,
          authMethod: 'password',
        }));
        setIsLocked(false);
        return true;
      } catch {
        return false;
      }
    },
    [security]
  );

  // ── Generar fichero de recuperación ──────────────────────────────────────
  // ⚠️ S.2 — Ahora el fichero EMBEBE la frase de 12 palabras (en claro dentro
  //          del JSON). Esto es necesario para que recoverWithFile pueda
  //          desenvolver la VMK sin pedir la frase al usuario.
  //
  //          ⚠️ SEGURIDAD: el fichero pasa a contener la frase en claro.
  //          El usuario DEBE custodiarlo igual que la frase escrita.
  //          Recomendación UI: avisar de esto al descargar el fichero.
  //
  //          La firma cambia: ahora recibe `phrase` (no `password`).
  const generateRecoveryFile = useCallback(
    (phrase: string): string => {
      const salt = generateSalt();
      const content = JSON.stringify({
        type: 'fh-recovery',
        version: '2.0', // ⬆️ versión para distinguir de los antiguos sin frase
        app: 'FinanzasHogar',
        createdAt: Date.now(),
        salt,
        phrase, // ← embebida para permitir desenvolver la VMK
        phraseHash: security.phraseHash,
        phraseSalt: security.phraseSalt,
        authMethod: security.authMethod,
      });
      const fileHash = hashPassword(content, salt);
      setSecurity((prev) => ({ ...prev, recoveryFileHash: fileHash }));
      return content;
    },
    [security]
  );

  // ── 🔑 Sync (opción B): clave de sync en memoria ──────────────────────────
  const getSyncKey = useCallback(() => syncKeyRef.current, []);

  const hasSyncSalt = useCallback(
    () => localStorage.getItem(SYNC_SALT_STORAGE) !== null,
    []
  );

  const prepareSyncKey = useCallback(
    async (password: string): Promise<boolean> => {
      if (
        security.authMethod !== 'password' ||
        !security.passwordHash ||
        !security.passwordSalt
      ) {
        return false;
      }
      if (!verifyPassword(password, security.passwordHash, security.passwordSalt)) {
        return false;
      }
      let salt = localStorage.getItem(SYNC_SALT_STORAGE);
      if (!salt) {
        salt = generateSyncSalt();
        localStorage.setItem(SYNC_SALT_STORAGE, salt);
      }
      syncKeyRef.current = await deriveSyncKey(password, salt);
      return true;
    },
    [security.authMethod, security.passwordHash, security.passwordSalt]
  );

  const adoptSyncKey = useCallback(
    async (password: string, saltB64: string, iterations?: number): Promise<void> => {
      syncKeyRef.current = await deriveSyncKey(password, saltB64, iterations);
      // El salt del vault remoto es público y correcto: persistirlo es seguro.
      localStorage.setItem(SYNC_SALT_STORAGE, saltB64);
    },
    []
  );

  const clearSyncKey = useCallback(() => {
    syncKeyRef.current = null;
  }, []);

  // ── Ajustes ───────────────────────────────────────────────────────────────
  const updateInactivity = useCallback((ms: number) => {
    setSecurity((prev) => ({ ...prev, inactivityMs: ms }));
  }, []);

  const updateTotpGrace = useCallback((ms: number) => {
    setSecurity((prev) => ({ ...prev, totpGraceMs: ms }));
  }, []);

  const updateEmail = useCallback((email: string) => {
    setSecurity((prev) => ({ ...prev, email, emailVerified: true }));
  }, []);

  // ⚠️ S.2 — Al desactivar seguridad también purgamos la VMK y sus envolturas.
  //          Sin esto, quedarían restos cifrados huérfanos en localStorage.
  const clearSecurity = useCallback(() => {
    localStorage.removeItem(SECURITY_STORAGE_KEY);
    localStorage.removeItem(LOCK_STATE_KEY);
    // Borrar VMK activa de memoria + envolturas de password en localStorage
    destroyVault();
    // Borrar también las envolturas de recovery (frase)
    localStorage.removeItem(VAULT_RECOVERY_KEY_STORAGE);
    localStorage.removeItem(VAULT_RECOVERY_SALT_STORAGE);
    // 🔑 Borrar la clave de sync de memoria y su salt persistido.
    syncKeyRef.current = null;
    localStorage.removeItem(SYNC_SALT_STORAGE);
    setSecurity(DEFAULT_SECURITY_STATE);
    setIsLocked(false);
  }, []);

  const value: SecurityContextType = {
    security,
    isLocked,
    isConfigured: security.configured,
    setupSecurity,
    unlock,
    lock,
    needsVaultMigration,
    migrateLegacyToVault,
    sendCode,
    verifyCode,
    getCodeForDisplay,
    recoverWithPhrase,
    setPasswordDirectly,
    validateRecoveryFile,
    recoverWithFile,
    generateRecoveryFile,
    updateInactivity,
    updateTotpGrace,
    updateEmail,
    clearSecurity,
    getSyncKey,
    hasSyncSalt,
    prepareSyncKey,
    adoptSyncKey,
    clearSyncKey,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}
