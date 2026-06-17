// ─── Almacén del refresh_token de Drive — cifrado at-rest con la VMK ──────────
//
// ADR: project/development/10_SYNC_ARCHITECTURE.md §11.4 / §11.6.
//
// El refresh_token es la credencial que permite la reconexión automática (§11.2).
// Es un bearer token: se guarda vía `encryptedStorage`, es decir CIFRADO con la
// VMK y disponible solo tras el unlock (misma posición de seguridad que el resto
// del vault local). La clave `fh_sync_refresh` NO está en la whitelist de
// encryptedStorage, así que se cifra como cualquier dato sensible.
//
// Riesgo asumido (§11.6): el token vive en el dispositivo. Mitigado por el cifrado
// con la VMK, el scope acotado a `drive.appdata` y la revocación en el borrado.
// ─────────────────────────────────────────────────────────────────────────────

import {
  getEncryptedItem,
  setEncryptedItem,
  removeEncryptedItem,
} from '../encryptedStorage';

const REFRESH_KEY = 'fh_sync_refresh';

/** Persiste el refresh_token (cifrado con la VMK). Requiere unlock. */
export function saveRefreshToken(token: string): void {
  setEncryptedItem(REFRESH_KEY, token);
}

/** Lee el refresh_token guardado, o null si no hay (o la app está bloqueada). */
export function loadRefreshToken(): string | null {
  return getEncryptedItem(REFRESH_KEY);
}

/** Borra el refresh_token (desconexión con borrado / cambio de cuenta). */
export function clearRefreshToken(): void {
  removeEncryptedItem(REFRESH_KEY);
}
