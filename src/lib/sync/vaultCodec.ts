// ─── Codec del vault — snapshot ⇄ blob cifrado (basado en CLAVE) ──────────────
//
// ADR: project/development/10_SYNC_ARCHITECTURE.md §5 (Capa A) y §8.3 (casos límite).
//
// Serializa un SyncSnapshot a un fichero cifrado (el "vault") que viaja a Drive y
// de vuelta. Decisión sesión 49 (opción B): cifra con una CLAVE de sync derivada
// de la contraseña maestra (ver syncKey.ts), NUNCA con la contraseña en sí. La
// app deriva esa clave cuando tiene la contraseña en mano y la mantiene en
// memoria → cero-conocimiento frente a la nube y sin guardar la contraseña.
//
// La cabecera del vault es PÚBLICA (no cifrada) e incluye `syncSalt` + iteraciones:
// permite que un 2º dispositivo derive la MISMA clave a partir de la contraseña al
// emparejar (readVaultHeader), sin tener nada más.
//
// Resuelve dos casos límite del §8.3:
//  • Clave incorrecta (contraseña distinta) → no descifra → WRONG_PASSWORD.
//  • Blob de una app más nueva (schemaVersion mayor) → SCHEMA_TOO_NEW.
//
// Funciones puras (solo Web Crypto), testeables.
// ─────────────────────────────────────────────────────────────────────────────

import { SyncError } from './types';
import { encryptWithKey, decryptWithKey, SYNC_KDF_ITERATIONS } from './syncKey';
import type { SyncSnapshot } from './mergeSnapshots';

/** Versión del formato del vault. Subir SOLO ante cambios incompatibles. */
export const VAULT_SCHEMA_VERSION = 1;

type VaultFile = {
  app: 'FinanzasHogar';
  kind: 'sync-vault';
  schemaVersion: number;
  timestamp: number; // público — permite ordenar sin descifrar
  syncSalt: string; // público — para derivar la clave al emparejar
  kdfIterations: number; // público — iteraciones PBKDF2 usadas
  iv: string; // público — IV de AES-GCM
  ciphertext: string;
};

/** Cabecera pública necesaria para derivar la clave (emparejamiento). */
export type VaultHeader = {
  syncSalt: string;
  kdfIterations: number;
};

/** Cifra un snapshot con la clave de sync y lo serializa al texto que va a Drive. */
export async function encodeVault(
  snapshot: SyncSnapshot,
  key: CryptoKey,
  syncSalt: string,
  iterations: number = SYNC_KDF_ITERATIONS
): Promise<string> {
  const { iv, ciphertext } = await encryptWithKey(JSON.stringify(snapshot), key);
  const file: VaultFile = {
    app: 'FinanzasHogar',
    kind: 'sync-vault',
    schemaVersion: VAULT_SCHEMA_VERSION,
    timestamp: snapshot.timestamp,
    syncSalt,
    kdfIterations: iterations,
    iv,
    ciphertext,
  };
  return JSON.stringify(file);
}

/** Valida y parsea la cabecera pública de un vault (no descifra). */
function parseVaultFile(content: string): VaultFile {
  let parsed: VaultFile;
  try {
    parsed = JSON.parse(content) as VaultFile;
  } catch {
    throw new SyncError('INVALID_VAULT', 'el vault no es JSON válido');
  }
  if (
    !parsed ||
    parsed.app !== 'FinanzasHogar' ||
    parsed.kind !== 'sync-vault' ||
    typeof parsed.syncSalt !== 'string' ||
    typeof parsed.iv !== 'string' ||
    typeof parsed.ciphertext !== 'string'
  ) {
    throw new SyncError('INVALID_VAULT', 'el contenido no es un vault de sync');
  }
  if (parsed.schemaVersion > VAULT_SCHEMA_VERSION) {
    throw new SyncError('SCHEMA_TOO_NEW');
  }
  return parsed;
}

/**
 * Lee la cabecera pública (syncSalt + iteraciones) sin descifrar. La usa el flujo
 * de emparejamiento para derivar la clave a partir de la contraseña del usuario.
 */
export function readVaultHeader(content: string): VaultHeader {
  const file = parseVaultFile(content);
  return {
    syncSalt: file.syncSalt,
    kdfIterations: file.kdfIterations || SYNC_KDF_ITERATIONS,
  };
}

/** Descifra y valida el contenido de un vault descargado de Drive. */
export async function decodeVault(
  content: string,
  key: CryptoKey
): Promise<SyncSnapshot> {
  const file = parseVaultFile(content);
  let json: string;
  try {
    json = await decryptWithKey(file.iv, file.ciphertext, key);
  } catch {
    // AES-GCM falla genéricamente si la clave es incorrecta o el blob está dañado.
    // En el flujo de sync, la causa esperada es contraseña distinta (§8.3).
    throw new SyncError('WRONG_PASSWORD');
  }
  try {
    return JSON.parse(json) as SyncSnapshot;
  } catch {
    throw new SyncError('INVALID_VAULT', 'el contenido descifrado no es un snapshot');
  }
}
