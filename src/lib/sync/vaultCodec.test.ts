import { describe, it, expect } from 'vitest';
import { encodeVault, decodeVault, VAULT_SCHEMA_VERSION } from './vaultCodec';
import type { SyncSnapshot } from './mergeSnapshots';

const PASSWORD = 'contraseña-maestra-fuerte';

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

describe('vaultCodec', () => {
  it('round-trip: encode → decode devuelve el snapshot intacto', async () => {
    const snap = makeSnap();
    const blob = await encodeVault(snap, PASSWORD);
    const out = await decodeVault(blob, PASSWORD);
    expect(out).toEqual(snap);
  });

  it('expone el timestamp en claro (sin descifrar) para ordenar', async () => {
    const blob = await encodeVault(makeSnap({ timestamp: 42 }), PASSWORD);
    const parsed = JSON.parse(blob);
    expect(parsed.timestamp).toBe(42);
    expect(parsed.kind).toBe('sync-vault');
    expect(parsed.schemaVersion).toBe(VAULT_SCHEMA_VERSION);
  });

  it('contraseña distinta → WRONG_PASSWORD', async () => {
    const blob = await encodeVault(makeSnap(), PASSWORD);
    await expect(decodeVault(blob, 'otra-contraseña-distinta')).rejects.toMatchObject({
      code: 'WRONG_PASSWORD',
    });
  });

  it('blob de una app más nueva → SCHEMA_TOO_NEW', async () => {
    const blob = await encodeVault(makeSnap(), PASSWORD);
    const tampered = JSON.parse(blob);
    tampered.schemaVersion = VAULT_SCHEMA_VERSION + 1;
    await expect(
      decodeVault(JSON.stringify(tampered), PASSWORD)
    ).rejects.toMatchObject({ code: 'SCHEMA_TOO_NEW' });
  });

  it('contenido no-JSON → INVALID_VAULT', async () => {
    await expect(decodeVault('no soy json {', PASSWORD)).rejects.toMatchObject({
      code: 'INVALID_VAULT',
    });
  });

  it('JSON válido pero ajeno → INVALID_VAULT', async () => {
    await expect(decodeVault('{"foo":1}', PASSWORD)).rejects.toMatchObject({
      code: 'INVALID_VAULT',
    });
  });
});
