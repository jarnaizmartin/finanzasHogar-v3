// ─── Clave de sync — derivación determinista desde la contraseña maestra ──────
//
// ADR: project/development/10_SYNC_ARCHITECTURE.md §5 (Capa A) y §6 (emparejamiento).
//
// Decisión de arquitectura (sesión 49, opción B): el vault del sync se cifra con
// una CLAVE derivada de la contraseña maestra, NO con la contraseña en sí. La app
// deriva esta clave (AES-GCM 256, NO exportable) cuando tiene la contraseña en
// mano (unlock / activar sync / emparejar) y la mantiene en memoria; la
// CONTRASEÑA nunca se almacena. Posición de seguridad equivalente a la VMK ya
// existente, pero apta para auditoría (no se guarda secreto en claro).
//
// La clave es DETERMINISTA dada (contraseña, syncSalt): todos los dispositivos
// con la misma contraseña y el mismo salt derivan la MISMA clave → pueden
// descifrar el vault del otro. El syncSalt no es secreto: se genera una vez, se
// guarda en local y viaja en la cabecera pública del vault para el emparejamiento.
//
// PBKDF2-SHA-256 250.000 iteraciones (igual que la KEK; más fuerte que los
// backups a 200k, porque el vault vive en la nube y es la superficie más expuesta).
//
// Módulo PURO (solo Web Crypto), testeable por round-trip.
// ─────────────────────────────────────────────────────────────────────────────

export const SYNC_KDF_ITERATIONS = 250_000;
const KEY_LENGTH_BITS = 256;
const SALT_BYTES = 16;
const IV_BYTES = 12;

// ── Helpers base64 ────────────────────────────────────────────────────────────
function bytesToB64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
function b64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Genera un salt aleatorio (base64) para la derivación de la clave de sync. */
export function generateSyncSalt(): string {
  return bytesToB64(crypto.getRandomValues(new Uint8Array(SALT_BYTES)));
}

/**
 * Deriva la clave de sync (AES-GCM 256, NO exportable) desde la contraseña y el
 * salt. Determinista: misma (contraseña, salt, iterations) → misma clave.
 */
export async function deriveSyncKey(
  password: string,
  saltB64: string,
  iterations: number = SYNC_KDF_ITERATIONS
): Promise<CryptoKey> {
  if (!password) throw new Error('Contraseña vacía');
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: b64ToBytes(saltB64), iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: KEY_LENGTH_BITS },
    false, // ⚠️ no exportable: la clave de sync nunca sale de Web Crypto
    ['encrypt', 'decrypt']
  );
}

/** Cifra texto con la clave de sync. IV aleatorio por operación. */
export async function encryptWithKey(
  plaintext: string,
  key: CryptoKey
): Promise<{ iv: string; ciphertext: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const buf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  return { iv: bytesToB64(iv), ciphertext: bytesToB64(new Uint8Array(buf)) };
}

/**
 * Descifra texto cifrado con `encryptWithKey`. Lanza si la clave es incorrecta o
 * el contenido está manipulado (AES-GCM es autenticado).
 */
export async function decryptWithKey(
  ivB64: string,
  ciphertextB64: string,
  key: CryptoKey
): Promise<string> {
  const buf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64ToBytes(ivB64) },
    key,
    b64ToBytes(ciphertextB64)
  );
  return new TextDecoder().decode(buf);
}
