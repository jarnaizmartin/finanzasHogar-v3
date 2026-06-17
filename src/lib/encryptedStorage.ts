// ─── encryptedStorage — capa de cifrado at-rest sobre localStorage (S.2) ─────
//
// Patrón de funcionamiento:
//  1. Tras el unlock, hidratamos un Map<key, plainValue> en memoria descifrando
//     todos los valores cifrados de localStorage. Esto es ASYNC y ocurre UNA VEZ.
//  2. Tras la hidratación, las lecturas son SÍNCRONAS desde el Map (compat con
//     useLocalStorage que es síncrono).
//  3. Las escrituras se aplican SÍNCRONAS al Map y se programan ASYNC con
//     debounce de 100ms para cifrar y persistir en localStorage.
//  4. Al hacer lock, vaciamos el Map (la VMK se va de memoria).
//
// Migración silenciosa:
//  - En la hidratación, si encontramos un valor en CLARO (sin prefijo enc:v1:),
//    lo cargamos al Map igual y programamos su persistencia cifrada.
//    El usuario no se entera: la próxima vez ya estará cifrado.
//
// Whitelist:
//  - Algunas claves NUNCA se cifran porque las necesitamos antes del unlock
//    (decidir si mostrar onboarding/lockscreen, configuración de seguridad, etc.).
//  - Para esas claves, useLocalStorage debe seguir usando localStorage directo.
// ─────────────────────────────────────────────────────────────────────────────

import {
  encryptValue,
  decryptValue,
  isEncrypted,
} from './storageCrypto';
import {
  getActiveVmk,
  subscribeVmkChange,
} from './vaultKey';

// ─── Whitelist de claves que NUNCA se cifran ─────────────────────────────────
// Razones por las que NO se cifran:
//   • Se necesitan ANTES del unlock para decidir qué pantalla mostrar
//   • Son metadata de seguridad (ya cifradas o públicas por diseño)
//   • Son flags de UI no sensibles (tour, onboarding) críticos pre-unlock
export const ENCRYPTION_WHITELIST: readonly string[] = [
  // Configuración de seguridad — se lee antes del unlock
  'fh_security',
  'fh_lock_state',
  'fh_totp_last_unlock',
  // VMK y salt de la KEK — son la base del cifrado, no pueden cifrarse a sí mismas
  'fh_vault_key',
  'fh_vault_kek_salt',
  // Estado de ciclo de vida — se lee antes del unlock para decidir el flujo
  'fh_onboarded',
  'fh_tour_completed',
  'fh_tour_first_time',
  'fh_coach_seen',
  'fh_header_tour_done',
  'fh_view_projections',
  'fh_view_real',
  'fh_gs_visited',
  'fh_setup_highlight',
  'fh_open_security',
  'fh_open_guide',
  // Preferencias de UI — accedidas con localStorage.getItem directo (no useLocalStorage)
  'fh_start_tab',
  // Licencia — se lee al arrancar (LicenseProvider) antes del unlock
  'fh_license_state',
  'fh_device_id', // se lee en getDeviceId() de licenseManager pre-unlock
  // Envolturas de recovery de la VMK — son la base del sistema de recovery,
  // no pueden cifrarse a sí mismas (chicken-and-egg).
  'fh_vault_key_recovery',
  'fh_vault_kek_salt_recovery',
  // Sync (ADR §11) — claves PÚBLICAS leídas/escritas DIRECTO en localStorage por
  // SecurityContext (salt) y useSync (flag), no vía encryptedStorage. Si se
  // cifraran, esos lectores leerían "enc:v1:…" → el salt rompe atob() al derivar
  // la clave de sync y el flag dejaría de valer 'true'. NO son secretos:
  //   · fh_sync_salt: público por diseño (viaja en la cabecera del vault).
  //   · fh_sync_enabled: simple opt-in 'true'/'false'.
  // (El refresh_token, fh_sync_refresh, SÍ se cifra: se accede vía encryptedStorage.)
  'fh_sync_salt',
  'fh_sync_enabled',
];

const WHITELIST_SET = new Set<string>(ENCRYPTION_WHITELIST);

/**
 * Heal-on-boot: si una clave que AHORA está en la whitelist tiene valor
 * cifrado en disco (porque NO estaba whitelisted antes), la borramos.
 * Se regenerará en claro la próxima vez que se escriba.
 *
 * IMPORTANTE: solo borramos si el valor empieza por 'enc:v1:'. Si está en
 * claro, lo respetamos. Esto se ejecuta UNA VEZ al cargar el módulo,
 * antes de que cualquier provider intente leer.
 */
(function healWhitelistOnBoot() {
  try {
    for (const key of WHITELIST_SET) {
      const v = localStorage.getItem(key);
      if (typeof v === 'string' && v.startsWith('enc:v1:')) {
        console.warn(
          `[encryptedStorage] Heal-on-boot: borrando "${key}" (whitelist cifrada legacy)`
        );
        localStorage.removeItem(key);
      }
    }
  } catch (err) {
    console.error('[encryptedStorage] Heal-on-boot falló:', err);
  }
})();

/**
 * Indica si una clave es candidata a cifrarse (está fuera de la whitelist).
 * useLocalStorage debe combinar esto con `isSecurityConfigured()` para decidir
 * si realmente activa el camino cifrado.
 */
 export function shouldEncrypt(key: string): boolean {
  return !WHITELIST_SET.has(key);
}

/**
 * Indica si el usuario tiene seguridad configurada (mira fh_security en claro,
 * que está en la whitelist y por tanto es accesible siempre).
 *
 * Si devuelve false:
 *   • No hay VMK ni la habrá → encryptedStorage no funcionará nunca.
 *   • useLocalStorage debe ir DIRECTO a localStorage en claro.
 *
 * Si devuelve true:
 *   • Puede que la VMK esté activa (desbloqueado) o no (bloqueado).
 *   • useLocalStorage debe ir por encryptedStorage.
 */
 export function isSecurityConfigured(): boolean {
  try {
    const raw = localStorage.getItem('fh_security');
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.configured === true;
  } catch {
    return false;
  }
}

/**
 * Indica si el usuario tiene una VMK envuelta en localStorage (i.e., está
 * usando el sistema de cifrado at-rest de S.2).
 *
 * Esto es DISTINTO de isSecurityConfigured():
 *   • Usuario LEGACY pre-S.2: configured=true, vault=false (datos en claro)
 *   • Usuario post-S.2: configured=true, vault=true (datos cifrados)
 *   • Usuario sin seguridad: configured=false, vault=false
 *
 * useLocalStorage debe usar el camino cifrado SOLO si hasVault() === true.
 * Los legacy seguirán en claro hasta la migración silenciosa de S.2.6.
 */
export function hasVault(): boolean {
  try {
    return localStorage.getItem('fh_vault_key') !== null;
  } catch {
    return false;
  }
}

// ─── Estado interno ──────────────────────────────────────────────────────────

// Cache en memoria de valores DESCIFRADOS (strings JSON tal cual estarían
// en localStorage si no estuvieran cifrados).
const cache = new Map<string, string>();

// Indica si la cache está hidratada (VMK activa + valores descifrados).
// Mientras sea false, los reads devuelven null (igual que localStorage vacío).
let hydrated = false;

// Cola de escrituras pendientes (debounce por clave).
const pendingWrites = new Map<string, ReturnType<typeof setTimeout>>();

// Promesas de escrituras en vuelo (para flushPendingWrites).
const inFlightWrites = new Set<Promise<void>>();

const PERSIST_DEBOUNCE_MS = 100;

// ─── Listeners de cambio de hidratación ──────────────────────────────────────

type HydrationListener = (hydrated: boolean) => void;
const hydrationListeners = new Set<HydrationListener>();

/**
 * Suscribirse a cambios del estado de hidratación.
 * useLocalStorage lo usará para forzar re-renders tras el unlock
 * (los valores que antes devolvían null pasan a estar disponibles).
 */
export function subscribeHydrationChange(cb: HydrationListener): () => void {
  hydrationListeners.add(cb);
  return () => {
    hydrationListeners.delete(cb);
  };
}

function notifyHydrationChange(): void {
  for (const cb of hydrationListeners) {
    try {
      cb(hydrated);
    } catch (err) {
      console.error('[encryptedStorage] Error en listener:', err);
    }
  }
}

export function isHydrated(): boolean {
  return hydrated;
}

// ─── Lectura síncrona desde el cache ─────────────────────────────────────────

/**
 * Lee un valor cifrado del cache en memoria (síncrono).
 * Devuelve null si la cache no está hidratada o la clave no existe.
 *
 * IMPORTANTE: si la clave está en la whitelist, NO uses esta función.
 * Usa localStorage.getItem(key) directamente.
 */
export function getEncryptedItem(key: string): string | null {
  if (!hydrated) return null;
  return cache.get(key) ?? null;
}

// ─── Escritura síncrona al cache + persistencia asíncrona ────────────────────

/**
 * Escribe en el cache (síncrono) y programa la persistencia cifrada (async).
 * Si llega otra escritura para la misma clave antes de 100ms, se reemplaza
 * (debounce) → ahorra ciclos de cifrado en updates rápidos.
 */
export function setEncryptedItem(key: string, value: string): void {
  cache.set(key, value);
  scheduleEncryptedPersist(key, value);
}

/**
 * Elimina un valor del cache y de localStorage (síncrono el cache, async el storage).
 */
export function removeEncryptedItem(key: string): void {
  cache.delete(key);
  // Cancela cualquier escritura pendiente para esta clave
  const pending = pendingWrites.get(key);
  if (pending) {
    clearTimeout(pending);
    pendingWrites.delete(key);
  }
  try {
    localStorage.removeItem(key);
  } catch {}
}

function scheduleEncryptedPersist(key: string, value: string): void {
  // Cancela escritura pendiente previa para esta misma clave (debounce)
  const previous = pendingWrites.get(key);
  if (previous) clearTimeout(previous);

  const timeout = setTimeout(() => {
    pendingWrites.delete(key);
    const promise = persistEncrypted(key, value);
    inFlightWrites.add(promise);
    promise.finally(() => inFlightWrites.delete(promise));
  }, PERSIST_DEBOUNCE_MS);

  pendingWrites.set(key, timeout);
}

async function persistEncrypted(key: string, value: string): Promise<void> {
  const vmk = getActiveVmk();
  if (!vmk) {
    // VMK desapareció antes de poder persistir (lock durante debounce).
    // El valor se queda en cache pero no se persiste. Aceptable: en el
    // próximo unlock la cache estará vacía y se hidratará desde disco.
    console.warn(`[encryptedStorage] No VMK activa al persistir "${key}"`);
    return;
  }
  try {
    const encrypted = await encryptValue(value, vmk);
    localStorage.setItem(key, encrypted);
  } catch (err) {
    console.error(`[encryptedStorage] Error cifrando "${key}":`, err);
  }
}

/**
 * Espera a que todas las escrituras pendientes (debounce + en vuelo) terminen.
 * Útil antes de hacer lock, descargar backup o cerrar la app.
 */
export async function flushPendingWrites(): Promise<void> {
  // Forzar la ejecución inmediata de los debounce pendientes
  for (const [key, timeout] of pendingWrites) {
    clearTimeout(timeout);
    const value = cache.get(key);
    if (value !== undefined) {
      const promise = persistEncrypted(key, value);
      inFlightWrites.add(promise);
      promise.finally(() => inFlightWrites.delete(promise));
    }
  }
  pendingWrites.clear();

  // Esperar a que todas las escrituras en vuelo terminen
  await Promise.allSettled([...inFlightWrites]);
}

// ─── Hidratación: descifra todo el localStorage al cache ─────────────────────

/**
 * Lee todas las claves de localStorage, descifra las que estén cifradas
 * (saltando whitelist) y las mete al cache. Se llama automáticamente al
 * activarse la VMK.
 *
 * Migración silenciosa: las claves en CLARO (sin prefijo enc:v1:) se cargan
 * al cache TAL CUAL y se programa su persistencia cifrada. El usuario no
 * se entera del cambio.
 */
async function hydrateCache(): Promise<void> {
  const vmk = getActiveVmk();
  if (!vmk) {
    console.warn('[encryptedStorage] hydrateCache llamado sin VMK activa');
    return;
  }

  cache.clear();

  const keysToMigrate: Array<[string, string]> = [];
  const corruptKeys: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (WHITELIST_SET.has(key)) continue;

    const raw = localStorage.getItem(key);
    if (raw === null) continue;

    if (isEncrypted(raw)) {
      // Valor cifrado → descifrar y meter al cache
      try {
        const plain = await decryptValue(raw, vmk);
        cache.set(key, plain);
      } catch (err) {
        console.error(`[encryptedStorage] No se pudo descifrar "${key}":`, err);
        corruptKeys.push(key);
      }
    } else {
      // Valor en CLARO → migración silenciosa
      cache.set(key, raw);
      keysToMigrate.push([key, raw]);
    }
  }

  hydrated = true;
  notifyHydrationChange();

  // Programar la persistencia cifrada de los valores migrados.
  // Lo hacemos DESPUÉS de marcar hydrated=true para que la app pueda
  // arrancar inmediatamente sin esperar a las escrituras.
  if (keysToMigrate.length > 0) {
    console.info(
      `[encryptedStorage] Migrando ${keysToMigrate.length} clave(s) a cifrado at-rest`
    );
    for (const [key, value] of keysToMigrate) {
      scheduleEncryptedPersist(key, value);
    }
  }

  if (corruptKeys.length > 0) {
    console.warn(
      `[encryptedStorage] ${corruptKeys.length} clave(s) corruptas o cifradas con otra VMK:`,
      corruptKeys
    );
    // No las borramos automáticamente: pueden ser de un cambio de password
    // a medias o un fallo previo. El usuario las verá vacías y se regenerarán
    // con datos actuales al guardar.
  }
}

// ─── Limpieza del cache (al hacer lock) ──────────────────────────────────────

function clearCacheInternal(): void {
  cache.clear();
  hydrated = false;

  // Cancelar todas las escrituras pendientes (la VMK ya no está)
  for (const timeout of pendingWrites.values()) {
    clearTimeout(timeout);
  }
  pendingWrites.clear();

  notifyHydrationChange();
}
  
  // ─── Inicialización: suscripción al ciclo de vida de la VMK ─────────────────
  //
  // Esto hace que encryptedStorage reaccione AUTOMÁTICAMENTE a unlock/lock
  // sin que el resto del código tenga que llamar a nada explícitamente.
  //
  // IMPORTANTE: este side-effect ocurre al importar el módulo.
  // useLocalStorage importará este módulo → la suscripción queda activa.
  // ─────────────────────────────────────────────────────────────────────────────
  
  subscribeVmkChange((vmk) => {
    if (vmk) {
      // VMK activada (unlock exitoso) → hidratar cache
      hydrateCache().catch((err) => {
        console.error('[encryptedStorage] Error hidratando cache:', err);
      });
    } else {
      // VMK desactivada (lock manual o por inactividad) → limpiar cache
      clearCacheInternal();
    }
  });
  