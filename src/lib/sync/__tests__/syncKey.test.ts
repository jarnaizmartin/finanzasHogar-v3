import { describe, it, expect } from 'vitest';
import {
  generateSyncSalt,
  deriveSyncKey,
  encryptWithKey,
  decryptWithKey,
} from '../syncKey';

// Iteraciones bajas en tests para que PBKDF2 no ralentice la suite.
const FAST = 1_000;

describe('lib/sync/syncKey', () => {
  it('generateSyncSalt produce salts distintos en base64', () => {
    const a = generateSyncSalt();
    const b = generateSyncSalt();
    expect(a).not.toBe(b);
    expect(() => atob(a)).not.toThrow();
  });

  it('round-trip: misma contraseña + salt descifra lo cifrado', async () => {
    const salt = generateSyncSalt();
    const key = await deriveSyncKey('clave-maestra', salt, FAST);
    const { iv, ciphertext } = await encryptWithKey('hola mundo', key);
    const out = await decryptWithKey(iv, ciphertext, await deriveSyncKey('clave-maestra', salt, FAST));
    expect(out).toBe('hola mundo');
  });

  it('determinista: dos derivaciones con (contraseña, salt) iguales son intercambiables', async () => {
    const salt = generateSyncSalt();
    const k1 = await deriveSyncKey('pw', salt, FAST);
    const k2 = await deriveSyncKey('pw', salt, FAST);
    const { iv, ciphertext } = await encryptWithKey('secreto', k1);
    await expect(decryptWithKey(iv, ciphertext, k2)).resolves.toBe('secreto');
  });

  it('contraseña distinta → no descifra (AES-GCM autenticado lanza)', async () => {
    const salt = generateSyncSalt();
    const good = await deriveSyncKey('correcta', salt, FAST);
    const bad = await deriveSyncKey('incorrecta', salt, FAST);
    const { iv, ciphertext } = await encryptWithKey('dato', good);
    await expect(decryptWithKey(iv, ciphertext, bad)).rejects.toBeTruthy();
  });

  it('salt distinto → clave distinta (no descifra cruzado)', async () => {
    const k1 = await deriveSyncKey('pw', generateSyncSalt(), FAST);
    const k2 = await deriveSyncKey('pw', generateSyncSalt(), FAST);
    const { iv, ciphertext } = await encryptWithKey('dato', k1);
    await expect(decryptWithKey(iv, ciphertext, k2)).rejects.toBeTruthy();
  });

  it('cada cifrado usa un IV distinto', async () => {
    const key = await deriveSyncKey('pw', generateSyncSalt(), FAST);
    const a = await encryptWithKey('mismo texto', key);
    const b = await encryptWithKey('mismo texto', key);
    expect(a.iv).not.toBe(b.iv);
    expect(a.ciphertext).not.toBe(b.ciphertext);
  });

  it('contraseña vacía lanza', async () => {
    await expect(deriveSyncKey('', generateSyncSalt(), FAST)).rejects.toThrow();
  });
});
