// ─── Cifrado de backups con AES-GCM 256 + PBKDF2 SHA-256 ─────────────────────
//
// Decisiones técnicas:
//  • AES-GCM (autenticado: detecta manipulación del fichero)
//  • PBKDF2-SHA-256, 200.000 iteraciones (más fuerte que login: 100k)
//  • Salt único de 16 bytes por backup (evita rainbow tables)
//  • IV único de 12 bytes por backup (requisito de AES-GCM)
//  • Web Crypto API nativa (la misma que ya usas para TOTP)
//
// Estructura del fichero v2.0 (cifrado):
//  - Metadata PÚBLICA (counts, fecha, label) → permite preview sin password
//  - Ciphertext: JSON.stringify(data) cifrado con AES-GCM

const PBKDF2_ITERATIONS = 200_000;
const KEY_LENGTH_BITS = 256;
const SALT_BYTES = 16;
const IV_BYTES = 12;

// ── Helpers de codificación ──────────────────────────────────────────────────
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ── Derivación de clave ──────────────────────────────────────────────────────
async function deriveKey(
  password: string,
  salt: Uint8Array<ArrayBuffer>
): Promise<CryptoKey> {
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
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: KEY_LENGTH_BITS },
    false,
    ['encrypt', 'decrypt']
  );
}

// ── Tipos del payload cifrado ────────────────────────────────────────────────
export type EncryptionInfo = {
  algorithm: 'AES-GCM';
  kdf: 'PBKDF2-SHA256';
  iterations: number;
  salt: string; // base64
  iv: string; // base64
};

export type EncryptedBackupFile = {
  app: 'FinanzasHogar';
  version: '2.0';
  format: 'encrypted-aes-gcm';
  // Metadata PÚBLICA (NO cifrada) → preview sin password
  id: string;
  timestamp: number;
  label: string;
  accountsCount: number;
  categoriesCount: number;
  projectionsCount: number;
  realExpensesCount: number;
  goalsCount: number;
  // Cifrado
  encryption: EncryptionInfo;
  ciphertext: string; // base64
};

// ── Encrypt ──────────────────────────────────────────────────────────────────
export async function encryptBackupPayload(
  data: unknown,
  password: string
): Promise<{ encryption: EncryptionInfo; ciphertext: string }> {
  if (!password || password.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres.');
  }
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(password, salt);

  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const ciphertextBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  );

  return {
    encryption: {
      algorithm: 'AES-GCM',
      kdf: 'PBKDF2-SHA256',
      iterations: PBKDF2_ITERATIONS,
      salt: bytesToBase64(salt),
      iv: bytesToBase64(iv),
    },
    ciphertext: bytesToBase64(new Uint8Array(ciphertextBuf)),
  };
}

// ── Decrypt ──────────────────────────────────────────────────────────────────
export async function decryptBackupPayload<T = unknown>(
  encryption: EncryptionInfo,
  ciphertextB64: string,
  password: string
): Promise<T> {
  const salt = base64ToBytes(encryption.salt);
  const iv = base64ToBytes(encryption.iv);
  const key = await deriveKey(password, salt);
  const ciphertext = base64ToBytes(ciphertextB64);

  try {
    const plaintextBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    const json = new TextDecoder().decode(plaintextBuf);
    return JSON.parse(json) as T;
  } catch {
    // AES-GCM lanza error genérico si la clave es incorrecta o el fichero está corrupto
    throw new Error('PASSWORD_INCORRECT_OR_FILE_CORRUPT');
  }
}

// ── Detección de formato del fichero importado ──────────────────────────────
export type BackupFileFormat = 'encrypted-v2' | 'plain-v1' | 'invalid';

export function detectBackupFormat(parsed: unknown): BackupFileFormat {
  const p = parsed as {
    app?: unknown;
    format?: unknown;
    encryption?: unknown;
    ciphertext?: unknown;
    data?: { accounts?: unknown };
  } | null;
  if (!p || p.app !== 'FinanzasHogar') return 'invalid';
  if (p.format === 'encrypted-aes-gcm' && p.encryption && p.ciphertext) {
    return 'encrypted-v2';
  }
  if (p.data && p.data.accounts !== undefined) {
    return 'plain-v1';
  }
  return 'invalid';
}
