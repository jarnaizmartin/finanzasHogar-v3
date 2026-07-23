// ─── Gestión de la VMK (Vault Master Key) — S.2 ──────────────────────────────
//
// Responsabilidades:
//  • Persistir la VMK envuelta (cifrada por la KEK) en localStorage
//  • Mantener la VMK desenvuelta en memoria durante la sesión activa
//  • Notificar a los oyentes (encryptedStorage) cuando la VMK se activa/desactiva
//
// Ciclo de vida:
//  1. Setup inicial (primera vez):
//     - generateVmk() → wrapVmk(vmk, kek) → saveWrappedVmk(wrapped) → setActiveVmk(vmk)
//
//  2. Unlock posterior:
//     - loadWrappedVmk() → unwrapVmk(wrapped, kek) → setActiveVmk(vmk)
//
//  3. Lock / cierre de sesión:
//     - clearActiveVmk()  ← la VMK envuelta SIGUE en localStorage para el próximo unlock
//
//  4. Reset total (clearSecurity):
//     - clearActiveVmk() + removeWrappedVmk()
//
//  5. Cambio de password:
//     - unwrapVmk con KEK vieja → wrapVmk con KEK nueva → saveWrappedVmk
//     - La activeVmk en memoria NO cambia (es la misma clave)
// ─────────────────────────────────────────────────────────────────────────────

import type { WrappedVmk, KekSaltInfo } from './storageCrypto';

// ─── Claves de localStorage (NO cifradas, son metadata de seguridad) ─────────
const VAULT_KEY_STORAGE = 'fh_vault_key'; // VMK envuelta (JSON)
const VAULT_KEK_SALT_STORAGE = 'fh_vault_kek_salt'; // Salt + iter de la KEK (JSON)

// ─── Estado en memoria ───────────────────────────────────────────────────────
let activeVmk: CryptoKey | null = null;

// Listeners para notificar cambios de estado de la VMK (encryptedStorage los usará)
type VmkListener = (vmk: CryptoKey | null) => void;
const listeners = new Set<VmkListener>();

// ─── Persistencia de la VMK envuelta ─────────────────────────────────────────

export function loadWrappedVmk(): WrappedVmk | null {
  try {
    const raw = localStorage.getItem(VAULT_KEY_STORAGE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed.iv !== 'string' ||
      typeof parsed.wrapped !== 'string'
    ) {
      console.warn('[vaultKey] Formato de VMK envuelta inválido');
      return null;
    }
    return parsed as WrappedVmk;
  } catch {
    console.warn('[vaultKey] No se pudo leer la VMK envuelta');
    return null;
  }
}

export function saveWrappedVmk(wrapped: WrappedVmk): void {
  try {
    localStorage.setItem(VAULT_KEY_STORAGE, JSON.stringify(wrapped));
  } catch {
    console.error('[vaultKey] No se pudo guardar la VMK envuelta');
    throw new Error('VAULT_KEY_SAVE_FAILED');
  }
}

export function removeWrappedVmk(): void {
  try {
    localStorage.removeItem(VAULT_KEY_STORAGE);
  } catch { /* ignore */ }
}

export function hasWrappedVmk(): boolean {
  return loadWrappedVmk() !== null;
}

// ─── Persistencia del salt de la KEK ─────────────────────────────────────────

export function loadKekSaltInfo(): KekSaltInfo | null {
  try {
    const raw = localStorage.getItem(VAULT_KEK_SALT_STORAGE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed.salt !== 'string' ||
      typeof parsed.iterations !== 'number'
    ) {
      console.warn('[vaultKey] Formato de KEK salt inválido');
      return null;
    }
    return parsed as KekSaltInfo;
  } catch {
    console.warn('[vaultKey] No se pudo leer el salt de la KEK');
    return null;
  }
}

export function saveKekSaltInfo(info: KekSaltInfo): void {
  try {
    localStorage.setItem(VAULT_KEK_SALT_STORAGE, JSON.stringify(info));
  } catch {
    console.error('[vaultKey] No se pudo guardar el salt de la KEK');
    throw new Error('KEK_SALT_SAVE_FAILED');
  }
}

export function removeKekSaltInfo(): void {
  try {
    localStorage.removeItem(VAULT_KEK_SALT_STORAGE);
  } catch { /* ignore */ }
}

// ─── Gestión de la VMK activa en memoria ─────────────────────────────────────

/**
 * Devuelve la VMK desenvuelta en memoria, o null si no hay sesión activa
 * (app bloqueada o cifrado no configurado).
 */
export function getActiveVmk(): CryptoKey | null {
  return activeVmk;
}

/**
 * Activa la VMK en memoria tras un unlock exitoso.
 * Notifica a todos los listeners (encryptedStorage reacciona).
 */
export function setActiveVmk(vmk: CryptoKey): void {
  activeVmk = vmk;
  notifyListeners();
}

/**
 * Limpia la VMK de memoria (lock manual o por inactividad).
 * NO borra la VMK envuelta del localStorage — el próximo unlock la recuperará.
 */
export function clearActiveVmk(): void {
  if (activeVmk === null) return;
  activeVmk = null;
  notifyListeners();
}

// ─── Sistema de listeners ────────────────────────────────────────────────────

/**
 * Registra un callback que se ejecuta cada vez que la VMK activa cambia.
 * Devuelve función de cleanup.
 *
 * Lo usa encryptedStorage (S.2.3) para hidratar/limpiar su caché en memoria
 * sincronizadamente con el ciclo de unlock/lock.
 */
export function subscribeVmkChange(listener: VmkListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(): void {
  for (const listener of listeners) {
    try {
      listener(activeVmk);
    } catch (err) {
      console.error('[vaultKey] Error en listener:', err);
    }
  }
}

// ─── Reset total (utility para clearSecurity) ────────────────────────────────

/**
 * Borra TODO lo relacionado con la VMK: memoria + localStorage.
 * Solo llamar al hacer reset completo de la app.
 *
 * ⚠️ ATENCIÓN: si hay datos cifrados en localStorage, quedarán
 *    inservibles tras este borrado (no se podrán descifrar nunca).
 *    Por eso clearSecurity debe hacerse SIEMPRE junto con un wipe
 *    de los datos cifrados.
 */
export function destroyVault(): void {
  clearActiveVmk();
  removeWrappedVmk();
  removeKekSaltInfo();
}
