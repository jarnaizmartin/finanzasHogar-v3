import { describe, it, expect } from 'vitest';
import { runSync } from '../runSync';
import type { SyncTransport, VaultCodec } from '../syncEngine';
import type { SnapshotParts } from '../snapshot';
import type { SyncSnapshot } from '../mergeSnapshots';
import type { VaultBlob } from '../types';
import type { RealExpense } from '../../../types';

const jsonCodec: VaultCodec = {
  encode: async (s) => JSON.stringify(s),
  decode: async (c) => JSON.parse(c) as SyncSnapshot,
};

class FakeDrive implements SyncTransport {
  blob: VaultBlob | null;
  constructor(initial: VaultBlob | null = null) {
    this.blob = initial;
  }
  async readVault() {
    return this.blob ? { ...this.blob } : null;
  }
  async writeVault(content: string, expected: string | null) {
    if (expected !== (this.blob?.revision ?? null)) {
      const { SyncError } = await import('../types');
      throw new SyncError('CONFLICT');
    }
    this.blob = { content, revision: String((Number(this.blob?.revision) || 0) + 1) };
    return { ...this.blob };
  }
}

const mov = (id: string, amount: number, valueDate: string, over: Partial<RealExpense> = {}): RealExpense =>
  ({ id, amount, valueDate, type: 'expense', updatedAt: 1, ...over }) as RealExpense;

const parts = (over: Partial<SnapshotParts> = {}): SnapshotParts => ({
  accounts: [],
  categories: [],
  projections: [],
  realExpenses: [],
  goals: [],
  bankFormats: [],
  categoryRules: [],
  baseCurrency: 'EUR',
  displayCurrency: 'EUR',
  dark: false,
  licenseState: null,
  timestamp: 1000,
  ...over,
});

const snap = (over: Partial<SyncSnapshot> = {}): SyncSnapshot => ({
  timestamp: 1000,
  accounts: [],
  categories: [],
  projections: [],
  realExpenses: [],
  goals: [],
  bankFormats: [],
  categoryRules: [],
  baseCurrency: 'EUR',
  displayCurrency: 'EUR',
  dark: false,
  licenseState: null,
  ...over,
});

describe('runSync', () => {
  it('sin remoto: crea el vault y no reporta duplicados', async () => {
    const drive = new FakeDrive(null);
    const out = await runSync({
      transport: drive,
      codec: jsonCodec,
      localParts: parts({ realExpenses: [mov('a', 10, '2026-01-01')] }),
      beforeLiveRealExpenses: [mov('a', 10, '2026-01-01')],
    });
    expect(out.result.status).toBe('created');
    expect(out.duplicates).toEqual([]);
  });

  it('merge con movimiento remoto duplicado → lo reporta', async () => {
    const localMov = mov('local1', 50, '2026-03-10');
    const remote = snap({ realExpenses: [mov('remote1', 50, '2026-03-11')] });
    const drive = new FakeDrive({ content: JSON.stringify(remote), revision: '1' });
    const out = await runSync({
      transport: drive,
      codec: jsonCodec,
      localParts: parts({ realExpenses: [localMov] }),
      beforeLiveRealExpenses: [localMov],
    });
    expect(out.result.remoteChanged).toBe(true);
    expect(out.duplicates).toEqual([{ id: 'remote1', duplicateOf: 'local1' }]);
  });

  it('si el remoto no aporta nada nuevo, no busca duplicados', async () => {
    const localMov = mov('local1', 50, '2026-03-10');
    const remote = snap({ realExpenses: [localMov] });
    const drive = new FakeDrive({ content: JSON.stringify(remote), revision: '1' });
    const out = await runSync({
      transport: drive,
      codec: jsonCodec,
      localParts: parts({ realExpenses: [localMov] }),
      beforeLiveRealExpenses: [localMov],
    });
    expect(out.result.remoteChanged).toBe(false);
    expect(out.duplicates).toEqual([]);
  });
});
