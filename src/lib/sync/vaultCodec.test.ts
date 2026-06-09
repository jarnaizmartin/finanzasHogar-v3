import { describe, it, expect } from 'vitest';
import { encodeVault, decodeVault, readVaultHeader, VAULT_SCHEMA_VERSION } from './vaultCodec';
import { deriveSyncKey, generateSyncSalt } from './syncKey';
import type { SyncSnapshot } from './mergeSnapshots';

const PASSWORD = 'contraseña-maestra-fuerte';
const FAST = 1_000; // iteraciones bajas en test para no ralentizar PBKDF2

function makeSnap(over: Partial<SyncSnapshot> = {}): SyncSnapshot {
  return {
    timestamp: 1_700_000_000_000,
    accounts: [{ id: 'a', updatedAt: 1 } as never],
    categories: [],
    projections: [],
    realExpenses: [],
    goals: [],
    bankFormats: [],
    categoryRules: [],
    baseCurrency: 'EUR',
    displayCurrency: 'USD',
    dark: true,
    licenseState: { plan: 'lifetime' },
    ...over,
  };
}

// Empareja: deriva la clave desde una contraseña usando el salt+iteraciones de un blob.
async function keyFor(password: string, blob: string) {
  const { syncSalt, kdfIterations } = readVaultHeader(blob);
  return deriveSyncKey(password, syncSalt, kdfIterations);
}

describe('vaultCodec (basado en clave)', () => {
  it('round-trip: encode → decode devuelve el snapshot intacto', async () => {
    const snap = makeSnap();
    const salt = generateSyncSalt();
    const key = await deriveSyncKey(PASSWORD, salt, FAST);
    const blob = await encodeVault(snap, key, salt, FAST);
    const out = await decodeVault(blob, key);
    expect(out).toEqual(snap);
  });

  it('emparejamiento: otro dispositivo deriva la clave desde la cabecera y descifra', async () => {
    const snap = makeSnap();
    const salt = generateSyncSalt();
    const key = await deriveSyncKey(PASSWORD, salt, FAST);
    const blob = await encodeVault(snap, key, salt, FAST);
    // 2º dispositivo: solo tiene el blob y la contraseña.
    const pairedKey = await keyFor(PASSWORD, blob);
    expect(await decodeVault(blob, pairedKey)).toEqual(snap);
  });

  it('expone timestamp, kind, schemaVersion y syncSalt en claro', async () => {
    const salt = generateSyncSalt();
    const key = await deriveSyncKey(PASSWORD, salt, FAST);
    const blob = await encodeVault(makeSnap({ timestamp: 42 }), key, salt, FAST);
    const parsed = JSON.parse(blob);
    expect(parsed.timestamp).toBe(42);
    expect(parsed.kind).toBe('sync-vault');
    expect(parsed.schemaVersion).toBe(VAULT_SCHEMA_VERSION);
    expect(parsed.syncSalt).toBe(salt);
    expect(parsed.kdfIterations).toBe(FAST);
  });

  it('contraseña distinta → WRONG_PASSWORD', async () => {
    const salt = generateSyncSalt();
    const key = await deriveSyncKey(PASSWORD, salt, FAST);
    const blob = await encodeVault(makeSnap(), key, salt, FAST);
    const wrongKey = await keyFor('otra-contraseña-distinta', blob);
    await expect(decodeVault(blob, wrongKey)).rejects.toMatchObject({
      code: 'WRONG_PASSWORD',
    });
  });

  it('blob de una app más nueva → SCHEMA_TOO_NEW', async () => {
    const salt = generateSyncSalt();
    const key = await deriveSyncKey(PASSWORD, salt, FAST);
    const blob = await encodeVault(makeSnap(), key, salt, FAST);
    const tampered = JSON.parse(blob);
    tampered.schemaVersion = VAULT_SCHEMA_VERSION + 1;
    await expect(decodeVault(JSON.stringify(tampered), key)).rejects.toMatchObject({
      code: 'SCHEMA_TOO_NEW',
    });
    // readVaultHeader también debe rechazar el esquema demasiado nuevo
    expect(() => readVaultHeader(JSON.stringify(tampered))).toThrow();
  });

  it('contenido no-JSON → INVALID_VAULT', async () => {
    const key = await deriveSyncKey(PASSWORD, generateSyncSalt(), FAST);
    await expect(decodeVault('no soy json {', key)).rejects.toMatchObject({
      code: 'INVALID_VAULT',
    });
  });

  it('JSON válido pero ajeno → INVALID_VAULT', async () => {
    const key = await deriveSyncKey(PASSWORD, generateSyncSalt(), FAST);
    await expect(decodeVault('{"foo":1}', key)).rejects.toMatchObject({
      code: 'INVALID_VAULT',
    });
  });
});
