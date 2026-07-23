// ─── Controlador React del sync (C2) — enchufa el bucle puro a la app ─────────
//
// ADR: project/development/10_SYNC_ARCHITECTURE.md §6–§8.
//
// Toda la LÓGICA del sync ya es pura y está probada (runSync, syncOnce, codec,
// merge, snapshot). Este hook es solo el CONTROLADOR: decide cuándo sincronizar
// (gating + disparadores), arma las piezas locales, llama a `runSync` y aplica el
// resultado al estado preservando el LWW. Se valida en navegador real, no por
// unit tests (el transporte se validó en sesión 48).
//
// Gating (las tres a la vez):
//   1. multi-dispositivo activado (flag `fh_sync_enabled`, opt-in en Ajustes).
//   2. sesión de Drive viva (`googleDriveProvider.isConnected()`).
//   3. clave de sync en memoria (`getSyncKey()` != null) + salt persistido.
//
// Disparadores: al abrir (conexión silenciosa) · debounce ~3 s tras cambios en
// `raw` · botón manual "Sincronizar ahora".
//
// ⚠️ LWW: el merge se aplica SIEMPRE con `applySyncedData` (setters crudos), nunca
// con los setters envueltos — re-sellar `updatedAt` corrompería la próxima fusión.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  googleDriveProvider,
  persistPendingRefreshToken,
} from '../lib/sync/googleDriveProvider';
import { runSync } from '../lib/sync/runSync';
import type { MergeDuplicate } from '../lib/sync/snapshot';
import { encodeVault, decodeVault, readVaultHeader } from '../lib/sync/vaultCodec';
import { useToast } from '../contexts/ToastContext';
import { SyncError, type SyncErrorCode } from '../lib/sync/types';
import type { SyncStatus } from '../lib/sync/syncEngine';
import { adoptSyncedLicense } from '../lib/licenseSync';
import { isDemoMode } from '../lib/appMode';
import { useData } from '../contexts/DataContext';
import { useSettings } from '../contexts/SettingsContext';
import { useSecurityContext } from '../SecurityContext';

// Flag de opt-in multi-dispositivo. NO secreto. Lo activa/desactiva el toggle de
// Ajustes (C3). Mientras esté ausente/false, el hook es inerte (app idéntica).
const SYNC_ENABLED_KEY = 'fh_sync_enabled';
// ⚠️ fh_license_state y fh_device_id van EN CLARO (whitelist de
// encryptedStorage: LicenseProvider las lee antes del unlock). Se acceden con
// localStorage directo, igual que licenseManager. Leerlas con getEncryptedItem
// devolvía siempre null → la licencia NUNCA viajaba en el sync.
const LICENSE_KEY = 'fh_license_state';
const DEVICE_ID_KEY = 'fh_device_id';
const DEBOUNCE_MS = 3000;

export type SyncPhase = 'idle' | 'syncing' | 'error';

/** Lo que el hook expone a la UI (Ajustes, indicadores). */
export type SyncController = {
  /** Opt-in multi-dispositivo (persistido en `fh_sync_enabled`). */
  enabled: boolean;
  /** ¿Hay sesión de Drive viva ahora mismo? */
  connected: boolean;
  /** El opt-in está activo pero la reconexión silenciosa al abrir falló: hay que
   *  reconectar manualmente (típico en iOS, donde la sesión de Google no persiste). */
  needsReconnect: boolean;
  /** Volvimos del consentimiento de Google (§11): la conexión OAuth está hecha y
   *  solo falta que el usuario meta la contraseña maestra para terminar de activar. */
  pendingConnect: boolean;
  phase: SyncPhase;
  lastSyncAt: number | null;
  lastStatus: SyncStatus | null;
  /** Código del último error (null si la última pasada fue bien). */
  errorCode: SyncErrorCode | null;
  /** Nº de movimientos que el último merge marcó como posible duplicado (§8.3). */
  duplicateCount: number;
  /** Lista de posibles duplicados del último merge (para la vista de revisión). */
  duplicates: MergeDuplicate[];
  /** Ejecuta una pasada manual ("Sincronizar ahora"). */
  syncNow: () => Promise<void>;
  /** Reconexión interactiva con Drive (botón/banner) + pasada de sync. */
  reconnect: () => Promise<void>;
  /** Activa/desactiva el opt-in multi-dispositivo (toggle de Ajustes). */
  setEnabled: (on: boolean) => void;
  /** Re-lee el estado de conexión de Drive a estado React (tras conectar/desconectar). */
  refreshConnection: () => void;
  /** Olvida el aviso de duplicados (cuando el usuario lo ha revisado). */
  clearDuplicates: () => void;
  /** Limpia el estado de error (tras una recuperación, p. ej. borrar el vault). */
  clearError: () => void;
  /** Olvida la señal de "conexión OAuth a medias" (tras terminar o cancelar). */
  clearPendingConnect: () => void;
};

const OAUTH_PENDING_KEY = 'fh_sync_oauth_pending';
const OAUTH_ERROR_KEY = 'fh_sync_oauth_error';

function readPendingConnect(): boolean {
  try {
    return sessionStorage.getItem(OAUTH_PENDING_KEY) === '1';
  } catch {
    return false;
  }
}

function readEnabledFlag(): boolean {
  try {
    return localStorage.getItem(SYNC_ENABLED_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Controlador del sync. Se monta UNA vez (AppCoreProvider). Inerte mientras el
 * opt-in esté desactivado.
 */
export function useSync(): SyncController {
  const data = useData();
  const settings = useSettings();
  const {
    getSyncKey,
    getSyncSalt,
    prepareSyncKey,
    adoptSyncKey,
    consumePendingSyncPassword,
  } = useSecurityContext();
  const toast = useToast();
  const { t } = useTranslation();

  const {
    raw,
    realExpenses, // lista VIVA — base para detectar duplicados del merge (§8.3)
    applySyncedData,
  } = data;
  const {
    baseCurrency, displayCurrency, dark,
    setBaseCurrency, setDisplayCurrency, setDark,
  } = settings;

  const [enabled, setEnabledState] = useState<boolean>(readEnabledFlag);
  const [connected, setConnected] = useState<boolean>(() => googleDriveProvider.isConnected());
  const [needsReconnect, setNeedsReconnect] = useState<boolean>(false);
  const [pendingConnect, setPendingConnect] = useState<boolean>(readPendingConnect);
  const [phase, setPhase] = useState<SyncPhase>('idle');
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const [lastStatus, setLastStatus] = useState<SyncStatus | null>(null);
  const [errorCode, setErrorCode] = useState<SyncErrorCode | null>(null);
  const [duplicates, setDuplicates] = useState<MergeDuplicate[]>([]);

  // Guarda de concurrencia: una sola pasada a la vez; si llega otra, se encola una.
  const runningRef = useRef(false);
  const pendingRef = useRef(false);
  // Evita un debounce extra en el render de asentamiento tras aplicar un merge.
  const skipDebounceRef = useRef(false);
  // Guarda del auto-finish del redirect: que no se dispare dos veces (StrictMode).
  const autoFinishRef = useRef(false);

  // La pasada real vive en un ref reasignado en cada render → siempre ve los
  // valores frescos (raw, escalares, clave) sin recrear el `syncNow` estable ni
  // re-suscribir los efectos.
  const doSyncRef = useRef<() => Promise<void>>(async () => {});
  doSyncRef.current = async () => {
    // ── Gating ────────────────────────────────────────────────────────────────
    // 🧪 Modo Prueba: NUNCA sincronizar el sandbox demo con la nube del usuario.
    if (isDemoMode()) return;
    if (!enabled) return;
    if (!googleDriveProvider.isConnected()) return;
    const key = getSyncKey();
    const salt = getSyncSalt();
    if (!key || !salt) return;

    if (runningRef.current) {
      pendingRef.current = true; // ya hay una pasada → encolar una más
      return;
    }
    runningRef.current = true;
    setPhase('syncing');

    try {
      const codec = {
        encode: (snapshot: Parameters<typeof encodeVault>[0]) =>
          encodeVault(snapshot, key, salt),
        decode: (content: string) => decodeVault(content, key),
      };

      // La licencia viaja como cadena JSON opaca; el motor de merge la trata
      // como escalar (nunca la degrada a null).
      const licenseState: string | null = localStorage.getItem(LICENSE_KEY);

      const out = await runSync({
        transport: googleDriveProvider,
        codec,
        localParts: {
          accounts: raw.accounts,
          categories: raw.categories,
          projections: raw.projections,
          realExpenses: raw.realExpenses,
          goals: raw.goals,
          bankFormats: raw.bankFormats,
          categoryRules: raw.categoryRules,
          baseCurrency,
          displayCurrency,
          dark,
          licenseState,
          timestamp: Date.now(),
        },
        beforeLiveRealExpenses: realExpenses,
      });

      // ── Aplicar el resultado (solo si el merge trajo cambios remotos) ────────
      if (out.result.remoteChanged) {
        const snap = out.result.snapshot;
        // El próximo cambio de `raw` será el de este apply → no relanzar sync.
        skipDebounceRef.current = true;
        applySyncedData({
          accounts: snap.accounts,
          categories: snap.categories,
          projections: snap.projections,
          realExpenses: snap.realExpenses,
          goals: snap.goals,
          bankFormats: snap.bankFormats,
          categoryRules: snap.categoryRules,
        });
        if (snap.baseCurrency !== baseCurrency) setBaseCurrency(snap.baseCurrency);
        if (snap.displayCurrency !== displayCurrency) setDisplayCurrency(snap.displayCurrency);
        if (snap.dark !== dark) setDark(snap.dark);
        // licenseState nunca se degrada a null en el merge; solo escribir si hay.
        // El deviceId NO se adopta: es de la máquina, no del usuario (ver
        // lib/licenseSync).
        if (typeof snap.licenseState === 'string') {
          const adopted = adoptSyncedLicense(
            snap.licenseState,
            localStorage.getItem(LICENSE_KEY),
            localStorage.getItem(DEVICE_ID_KEY)
          );
          if (adopted) localStorage.setItem(LICENSE_KEY, adopted);
        }
      }

      setDuplicates(out.duplicates);
      setLastStatus(out.result.status);
      setLastSyncAt(Date.now());
      setErrorCode(null);
      setConnected(true);
      setNeedsReconnect(false);
      setPhase('idle');
    } catch (e) {
      const code: SyncErrorCode =
        e instanceof SyncError ? e.code : 'AUTH_FAILED';
      // Diagnóstico beta: el mensaje de UI funde varios códigos en uno genérico.
      // Registramos el código + detalle reales para poder distinguir CONFLICT,
      // INVALID_VAULT, etc. (Safari iOS: inspeccionar vía Web Inspector).
      console.error(
        '[sync] pasada fallida:',
        code,
        e instanceof Error ? e.message : e
      );
      // NETWORK y caducidad de token son transitorios: no son "error" rojo, se
      // reintenta en el siguiente disparador. Token caducado → marca desconectado
      // (Ajustes ofrece reconectar). El resto sí es estado de error visible.
      if (code === 'NETWORK') {
        setPhase('idle');
      } else if (
        code === 'TOKEN_EXPIRED' ||
        code === 'AUTH_FAILED' ||
        code === 'AUTH_CANCELLED'
      ) {
        setConnected(false);
        setErrorCode(code);
        setPhase('idle');
      } else {
        // WRONG_PASSWORD · SCHEMA_TOO_NEW · INVALID_VAULT · NOT_CONFIGURED…
        setErrorCode(code);
        setPhase('error');
      }
    } finally {
      runningRef.current = false;
      if (pendingRef.current) {
        pendingRef.current = false;
        void doSyncRef.current();
      }
    }
  };

  const syncNow = useCallback(() => doSyncRef.current(), []);

  const refreshConnection = useCallback(() => {
    setConnected(googleDriveProvider.isConnected());
  }, []);

  const setEnabled = useCallback((on: boolean) => {
    try {
      localStorage.setItem(SYNC_ENABLED_KEY, on ? 'true' : 'false');
    } catch {
      /* ignore */
    }
    if (!on) setNeedsReconnect(false); // al desactivar, no queda nada que reconectar
    setEnabledState(on);
  }, []);

  const clearDuplicates = useCallback(() => setDuplicates([]), []);

  const clearError = useCallback(() => {
    setErrorCode(null);
    setPhase('idle');
  }, []);

  const clearPendingConnect = useCallback(() => {
    try {
      sessionStorage.removeItem(OAUTH_PENDING_KEY);
    } catch {
      /* ignore */
    }
    setPendingConnect(false);
  }, []);

  // ── Vuelta del redirect de OAuth (procesada en main.tsx, §11) ───────────────
  // Refleja en estado React lo que dejó el arranque: token adoptado (conectado)
  // y/o un error de canje. Se ejecuta una vez al montar (post-unlock).
  useEffect(() => {
    try {
      if (sessionStorage.getItem(OAUTH_ERROR_KEY) === '1') {
        sessionStorage.removeItem(OAUTH_ERROR_KEY);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- refleja en React el resultado del redirect OAuth que el arranque dejó en sessionStorage; I/O externo de una sola pasada, no estado derivado.
        setErrorCode('AUTH_FAILED');
      }
    } catch {
      /* ignore */
    }
    if (googleDriveProvider.isConnected()) setConnected(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Reconexión interactiva (botón "Reconectar" / banner) + pasada de sync ───
  const reconnect = useCallback(async () => {
    try {
      await googleDriveProvider.connect(true);
      setConnected(true);
      setNeedsReconnect(false);
      void doSyncRef.current();
    } catch {
      setConnected(false);
      // mantenemos needsReconnect: el banner/botón sigue ofreciendo reintentar
    }
  }, []);

  // ── Disparador: al abrir (multi-ON) → conexión silenciosa + primera pasada ──
  useEffect(() => {
    if (!enabled) return;
    if (isDemoMode()) return; // 🧪 no conectar Drive mientras exploras el demo
    let cancelled = false;
    (async () => {
      try {
        if (!googleDriveProvider.isConnected()) {
          // 'none': intento silencioso si la sesión de Google sigue viva. Si no,
          // lanza → el usuario reconecta desde Ajustes (no es un error visible).
          await googleDriveProvider.connect(false);
        }
        if (cancelled) return;
        setConnected(true);
        setNeedsReconnect(false);
        void doSyncRef.current();
      } catch {
        // El silencioso falló (sesión de Google no viva, típico en iOS al reabrir):
        // marca que hace falta reconectar a mano → la UI muestra el banner.
        if (!cancelled) {
          setConnected(false);
          setNeedsReconnect(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  // ── Auto-finish del redirect (§11) ──────────────────────────────────────────
  // Al volver del consentimiento de Google completamos la conexión SIN pedir la
  // contraseña otra vez. Dos casos:
  //
  //  (A) MIGRACIÓN — el sync ya estaba ON (hay salt → la syncKey se derivó sola al
  //      desbloquear): persistimos el refresh_token y sincronizamos.
  //
  //  (B) ALTA NUEVA (§11, Opción 2) — aún no hay sync (enabled=false). Usamos la
  //      contraseña que el usuario tecleó al desbloquear (retenida en
  //      SecurityContext solo porque veníamos de un OAuth a medias) para terminar:
  //      si hay vault remoto → emparejar con su salt; si no → primario (genera el
  //      salt). Si no hay contraseña (recarga / TOTP) o algo falla, dejamos
  //      `pendingConnect` y el formulario manual de Ajustes actúa de red de
  //      seguridad. El `autoFinishRef` evita el doble disparo de StrictMode.
  useEffect(() => {
    if (!pendingConnect) return;
    if (!googleDriveProvider.isConnected()) return;
    if (autoFinishRef.current) return;

    // (A) Migración: la clave ya está en memoria.
    if (enabled && getSyncKey()) {
      autoFinishRef.current = true;
      persistPendingRefreshToken();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- orquesta el fin del alta OAuth tras el redirect (estado externo del provider); no es estado derivable en render.
      clearPendingConnect();
      void doSyncRef.current();
      return;
    }

    // (B) Alta nueva: terminar con la contraseña del unlock.
    if (!enabled) {
      const pwd = consumePendingSyncPassword();
      if (!pwd) return; // sin contraseña → el formulario manual es el fallback
      autoFinishRef.current = true;
      void (async () => {
        try {
          const remote = await googleDriveProvider.readVault();
          if (remote) {
            // 2º dispositivo / reinstalación: deriva la clave con el salt remoto.
            const header = readVaultHeader(remote.content);
            await adoptSyncKey(pwd, header.syncSalt, header.kdfIterations);
          } else {
            // Primario: la contraseña ya desbloqueó la app, así que es correcta.
            const ok = await prepareSyncKey(pwd);
            if (!ok) {
              setErrorCode('WRONG_PASSWORD');
              setPhase('error');
              autoFinishRef.current = false;
              return;
            }
          }
          persistPendingRefreshToken();
          setEnabled(true);
          clearPendingConnect();
          toast(t('appShell.sync.connectedToast'), 'success');
          void doSyncRef.current();
        } catch (e) {
          console.error(
            '[sync] auto-completar conexión falló:',
            e instanceof Error ? e.message : e
          );
          const code: SyncErrorCode = e instanceof SyncError ? e.code : 'AUTH_FAILED';
          setErrorCode(code);
          setPhase('error');
          // Dejamos pendingConnect → SyncSettings muestra el form como fallback.
          autoFinishRef.current = false;
        }
      })();
    }
  }, [
    enabled,
    pendingConnect,
    getSyncKey,
    clearPendingConnect,
    consumePendingSyncPassword,
    adoptSyncKey,
    prepareSyncKey,
    setEnabled,
    toast,
    t,
  ]);

  // ── Disparador: debounce ~3 s tras cambios en las colecciones (raw) ─────────
  useEffect(() => {
    if (!enabled) return;
    if (skipDebounceRef.current) {
      // Render de asentamiento tras aplicar un merge: no relanzar.
      skipDebounceRef.current = false;
      return;
    }
    const t = setTimeout(() => void doSyncRef.current(), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [
    enabled,
    raw.accounts, raw.categories, raw.projections, raw.realExpenses,
    raw.goals, raw.bankFormats, raw.categoryRules,
  ]);

  return {
    enabled,
    connected,
    needsReconnect,
    pendingConnect,
    phase,
    lastSyncAt,
    lastStatus,
    errorCode,
    duplicateCount: duplicates.length,
    duplicates,
    syncNow,
    reconnect,
    setEnabled,
    refreshConnection,
    clearDuplicates,
    clearError,
    clearPendingConnect,
  };
}
