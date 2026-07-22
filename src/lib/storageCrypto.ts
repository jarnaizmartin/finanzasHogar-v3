// ─── Cifrado at-rest del localStorage (S.2) ──────────────────────────────────
//
// Este módulo provee primitivas criptográficas para:
//  1. Derivar una clave KEK (Key Encryption Key) desde el password del usuario
//  2. Envolver/desenvolver una VMK (Vault Master Key) aleatoria con la KEK
//  3. Cifrar/descifrar valores individuales del localStorage con la VMK
//
// Decisiones técnicas:
//  • AES-GCM 256 (cifrado autenticado: detecta manipulación)
//  • PBKDF2-SHA-256, 250.000 iter para la KEK (más fuerte que backups: 200k)
//  • VMK = clave aleatoria de 256 bits, NO derivada del password
//    → cambiar password solo recifra la VMK, NO los datos
//  • Salt y IV únicos por operación
//  • Formato compacto: "v1:<iv_b64>:<ciphertext_b64>"
//    → prefix "v1:" permite detectar datos cifrados vs en claro (migración)
//
// Diferencias con backupCrypto.ts:
//  • Aquí cifrado de muchos valores pequeños y frecuentes → optimizado
//  • backupCrypto: un fichero grande y esporádico → JSON con metadata
//
// ─────────────────────────────────────────────────────────────────────────────

const PBKDF2_ITERATIONS_KEK = 250_000;
const KEY_LENGTH_BITS = 256;
const SALT_BYTES = 16;
const IV_BYTES = 12;

// Prefijo que identifica un valor cifrado en localStorage.
// Si una clave NO empieza por este prefijo, asumimos que está en claro
// (útil para la migración silenciosa).
export const ENC_PREFIX = 'enc:v1:';

// ─── Helpers de codificación base64 (compactos) ──────────────────────────────
function bytesToB64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function b64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ─── KEK: Key Encryption Key (derivada del password) ─────────────────────────
// La KEK NUNCA cifra datos directamente. Su único propósito es envolver la VMK.
// Esto permite cambiar el password sin tener que recifrar todos los datos.

export type KekSaltInfo = {
  salt: string; // base64
  iterations: number;
};

/**
 * Deriva la KEK desde el password del usuario usando PBKDF2.
 * Devuelve una CryptoKey no exportable (más segura).
 */
export async function deriveKek(
  password: string,
  saltB64: string,
  iterations: number = PBKDF2_ITERATIONS_KEK
): Promise<CryptoKey> {
  if (!password) throw new Error('Password vacío');
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: b64ToBytes(saltB64),
      iterations,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: KEY_LENGTH_BITS },
    false, // ⚠️ no exportable: la KEK nunca debe salir de Web Crypto
    ['wrapKey', 'unwrapKey']
  );
}

/**
 * Genera la información de salt para una nueva KEK.
 * Llamar una sola vez al crear la cuenta o al rotar la KEK.
 */
export function generateKekSaltInfo(): KekSaltInfo {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  return {
    salt: bytesToB64(salt),
    iterations: PBKDF2_ITERATIONS_KEK,
  };
}

// ─── VMK: Vault Master Key (clave aleatoria que cifra todos los datos) ───────
// La VMK se genera una sola vez al activar el cifrado.
// Se guarda envuelta (cifrada) por la KEK en localStorage.
// En memoria, durante la sesión, está desenvuelta y lista para cifrar/descifrar.

export type WrappedVmk = {
  iv: string; // base64 — IV usado al envolver la VMK
  wrapped: string; // base64 — VMK cifrada por la KEK
};

/**
 * Genera una VMK aleatoria nueva. Llamar una sola vez al activar el cifrado.
 * La VMK es exportable (necesario para poder envolverla).
 */
export async function generateVmk(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: KEY_LENGTH_BITS },
    true, // exportable: necesario para wrapKey
    ['encrypt', 'decrypt']
  );
}

/**
 * Envuelve la VMK con la KEK para guardarla cifrada en localStorage.
 * Usar al activar el cifrado o al cambiar la KEK (rotación de password).
 */
export async function wrapVmk(
  vmk: CryptoKey,
  kek: CryptoKey
): Promise<WrappedVmk> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const wrappedBuf = await crypto.subtle.wrapKey(
    'raw', // formato del export interno de la VMK
    vmk,
    kek,
    { name: 'AES-GCM', iv }
  );
  return {
    iv: bytesToB64(iv),
    wrapped: bytesToB64(new Uint8Array(wrappedBuf)),
  };
}

/**
 * Desenvuelve la VMK envuelta usando la KEK derivada del password.
 * Lanza error 'PASSWORD_INCORRECT' si la KEK no es la correcta.
 */
export async function unwrapVmk(
  wrappedVmk: WrappedVmk,
  kek: CryptoKey
): Promise<CryptoKey> {
  try {
    return await crypto.subtle.unwrapKey(
      'raw',
      b64ToBytes(wrappedVmk.wrapped),
      kek,
      { name: 'AES-GCM', iv: b64ToBytes(wrappedVmk.iv) },
      { name: 'AES-GCM', length: KEY_LENGTH_BITS },
      true, // exportable: por si en el futuro hay que reenvolver
      ['encrypt', 'decrypt']
    );
  } catch {
    throw new Error('PASSWORD_INCORRECT');
  }
}

// ─── Cifrado/descifrado de valores individuales con la VMK ───────────────────
// Estas son las funciones que usará encryptedStorage.ts (S.2.3) para cada
// clave del localStorage que toque cifrar.

/**
 * Cifra un string (ya serializado a JSON) con la VMK.
 * Devuelve un string compacto: "enc:v1:<iv_b64>:<ciphertext_b64>"
 */
export async function encryptValue(
  plaintext: string,
  vmk: CryptoKey
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const ciphertextBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    vmk,
    new TextEncoder().encode(plaintext)
  );
  return `${ENC_PREFIX}${bytesToB64(iv)}:${bytesToB64(
    new Uint8Array(ciphertextBuf)
  )}`;
}

/**
 * Descifra un string previamente cifrado con encryptValue.
 * Lanza error si el formato es inválido o la VMK no descifra.
 */
export async function decryptValue(
  encrypted: string,
  vmk: CryptoKey
): Promise<string> {
  if (!encrypted.startsWith(ENC_PREFIX)) {
    throw new Error('NOT_ENCRYPTED');
  }
  const body = encrypted.slice(ENC_PREFIX.length);
  const sepIdx = body.indexOf(':');
  if (sepIdx === -1) throw new Error('INVALID_ENCRYPTED_FORMAT');

  const ivB64 = body.slice(0, sepIdx);
  const ciphertextB64 = body.slice(sepIdx + 1);

  try {
    const plaintextBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: b64ToBytes(ivB64) },
      vmk,
      b64ToBytes(ciphertextB64)
    );
    return new TextDecoder().decode(plaintextBuf);
  } catch {
    throw new Error('DECRYPT_FAILED');
  }
}

/**
 * Comprueba si un valor en localStorage está cifrado (mirando el prefijo).
 * Útil para la migración silenciosa: si NO está cifrado, lo ciframos.
 */
export function isEncrypted(value: string | null): boolean {
  return typeof value === 'string' && value.startsWith(ENC_PREFIX);
}
