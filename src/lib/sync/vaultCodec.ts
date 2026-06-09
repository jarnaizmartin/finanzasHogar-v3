// ─── Codec del vault — snapshot ⇄ blob cifrado ───────────────────────────────
//
// ADR: project/development/10_SYNC_ARCHITECTURE.md §5 (Capa A) y §8.3 (casos límite).
//
// Serializa un SyncSnapshot a un fichero cifrado (el "vault") que viaja a Drive, y
// de vuelta. Reutiliza el cifrado ya probado de backups (AES-GCM 256 + PBKDF2 200k):
// la llave se deriva de la contraseña maestra y NUNCA viaja → cero-conocimiento.
//
// Resuelve dos casos límite del §8.3:
//  • Contraseña distinta en otro dispositivo → no descifra → WRONG_PASSWORD.
//  • Blob escrito por una app más nueva (schemaVersion mayor) → SCHEMA_TOO_NEW
//    (nunca corromper: mejor pedir actualizar la app).
//
// Función pura (sin red ni estado de app), testeable con Web Crypto.
// ─────────────────────────────────────────────────────────────────────────────

import {
  encryptBackupPayload,
  decryptBackupPayload,
  type EncryptionInfo,
} from '../backupCrypto';
import { SyncError } from './types';
import type { SyncSnapshot } from './mergeSnapshots';

/** Versión del formato del vault. Subir SOLO ante cambios incompatibles. */
export const VAULT_SCHEMA_VERSION = 1;

type VaultFile = {
  app: 'FinanzasHogar';
  kind: 'sync-vault';
  schemaVersion: number;
  timestamp: number; // público (no cifrado) — permite ordenar sin descifrar
  encryption: EncryptionInfo;
  ciphertext: string;
};

/** Cifra un snapshot y lo serializa al texto que se guarda en Drive. */
export async function encodeVault(
  snapshot: SyncSnapshot,
  password: string
): Promise<string> {
  const { encryption, ciphertext } = await encryptBackupPayload(
    snapshot,
    password
  );
  const file: VaultFile = {
    app: 'FinanzasHogar',
    kind: 'sync-vault',
    schemaVersion: VAULT_SCHEMA_VERSION,
    timestamp: snapshot.timestamp,
    encryption,
    ciphertext,
  };
  return JSON.stringify(file);
}

/** Descifra y valida el contenido de un vault descargado de Drive. */
export async function decodeVault(
  content: string,
  password: string
): Promise<SyncSnapshot> {
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
    !parsed.encryption ||
    typeof parsed.ciphertext !== 'string'
  ) {
    throw new SyncError('INVALID_VAULT', 'el contenido no es un vault de sync');
  }
  if (parsed.schemaVersion > VAULT_SCHEMA_VERSION) {
    throw new SyncError('SCHEMA_TOO_NEW');
  }
  try {
    return await decryptBackupPayload<SyncSnapshot>(
      parsed.encryption,
      parsed.ciphertext,
      password
    );
  } catch {
    // AES-GCM falla genéricamente si la clave es incorrecta o el blob está dañado.
    // En el flujo de sync, la causa esperada es contraseña distinta (§8.3).
    throw new SyncError('WRONG_PASSWORD');
  }
}
