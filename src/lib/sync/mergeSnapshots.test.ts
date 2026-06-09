import { describe, it, expect } from 'vitest';
import {
  mergeCollection,
  mergeSnapshots,
  type SyncSnapshot,
} from './mergeSnapshots';

type Item = { id: string; updatedAt: number; deletedAt?: number; v?: string };
const ids = (xs: Item[]) => xs.map((x) => x.id).sort();
const byId = (xs: Item[], id: string) => xs.find((x) => x.id === id);

describe('mergeCollection — LWW por id', () => {
  it('vacío + vacío = vacío', () => {
    expect(mergeCollection<Item>([], [])).toEqual([]);
  });

  it('une ids disjuntos de ambos lados', () => {
    const out = mergeCollection<Item>(
      [{ id: 'a', updatedAt: 1 }],
      [{ id: 'b', updatedAt: 1 }]
    );
    expect(ids(out)).toEqual(['a', 'b']);
  });

  it('gana la versión con updatedAt mayor (remoto más nuevo)', () => {
    const out = mergeCollection<Item>(
      [{ id: 'a', updatedAt: 1, v: 'local' }],
      [{ id: 'a', updatedAt: 2, v: 'remote' }]
    );
    expect(out).toHaveLength(1);
    expect(byId(out, 'a')!.v).toBe('remote');
  });

  it('gana la versión con updatedAt mayor (local más nuevo)', () => {
    const out = mergeCollection<Item>(
      [{ id: 'a', updatedAt: 5, v: 'local' }],
      [{ id: 'a', updatedAt: 2, v: 'remote' }]
    );
    expect(byId(out, 'a')!.v).toBe('local');
  });

  it('un tombstone más nuevo gana y se conserva en la salida', () => {
    const out = mergeCollection<Item>(
      [{ id: 'a', updatedAt: 1, v: 'alive' }],
      [{ id: 'a', updatedAt: 2, deletedAt: 2 }]
    );
    expect(byId(out, 'a')!.deletedAt).toBe(2);
  });

  it('un tombstone más viejo pierde frente a una edición posterior', () => {
    const out = mergeCollection<Item>(
      [{ id: 'a', updatedAt: 1, deletedAt: 1 }],
      [{ id: 'a', updatedAt: 9, v: 'revivido' }]
    );
    expect(byId(out, 'a')!.deletedAt).toBeUndefined();
    expect(byId(out, 'a')!.v).toBe('revivido');
  });

  it('empate de updatedAt: el tombstone gana (no resucita), venga de donde venga', () => {
    const remoteTomb = mergeCollection<Item>(
      [{ id: 'a', updatedAt: 5, v: 'alive' }],
      [{ id: 'a', updatedAt: 5, deletedAt: 5 }]
    );
    expect(byId(remoteTomb, 'a')!.deletedAt).toBe(5);

    const localTomb = mergeCollection<Item>(
      [{ id: 'a', updatedAt: 5, deletedAt: 5 }],
      [{ id: 'a', updatedAt: 5, v: 'alive' }]
    );
    expect(byId(localTomb, 'a')!.deletedAt).toBe(5);
  });

  it('empate total: se mantiene la versión local (sesgo determinista)', () => {
    const out = mergeCollection<Item>(
      [{ id: 'a', updatedAt: 5, v: 'local' }],
      [{ id: 'a', updatedAt: 5, v: 'remote' }]
    );
    expect(byId(out, 'a')!.v).toBe('local');
  });

  it('el resultado no depende del orden de los arrays', () => {
    const local: Item[] = [
      { id: 'a', updatedAt: 3, v: 'la' },
      { id: 'b', updatedAt: 1, v: 'lb' },
    ];
    const remote: Item[] = [
      { id: 'b', updatedAt: 9, v: 'rb' },
      { id: 'a', updatedAt: 1, v: 'ra' },
    ];
    const out1 = mergeCollection<Item>(local, remote);
    const out2 = mergeCollection<Item>([...local].reverse(), [...remote].reverse());
    const norm = (xs: Item[]) =>
      [...xs].sort((p, q) => p.id.localeCompare(q.id)).map((x) => x.v);
    expect(norm(out1)).toEqual(norm(out2));
    // 'a' gana local (3>1), 'b' gana remoto (9>1)
    expect(byId(out1, 'a')!.v).toBe('la');
    expect(byId(out1, 'b')!.v).toBe('rb');
  });
});

// ── mergeSnapshots ────────────────────────────────────────────────────────────
function makeSnap(over: Partial<SyncSnapshot>): SyncSnapshot {
  return {
    timestamp: 0,
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
  };
}

describe('mergeSnapshots', () => {
  it('fusiona cada colección por LWW (unión de ids)', () => {
    const local = makeSnap({
      accounts: [{ id: 'a', updatedAt: 1 } as never],
    });
    const remote = makeSnap({
      accounts: [{ id: 'b', updatedAt: 1 } as never],
    });
    const out = mergeSnapshots(local, remote);
    expect(out.accounts.map((a) => a.id).sort()).toEqual(['a', 'b']);
  });

  it('los escalares vienen del snapshot más reciente', () => {
    const local = makeSnap({ timestamp: 10, dark: false, baseCurrency: 'EUR' });
    const remote = makeSnap({ timestamp: 20, dark: true, baseCurrency: 'USD' });
    const out = mergeSnapshots(local, remote);
    expect(out.dark).toBe(true);
    expect(out.baseCurrency).toBe('USD');
    expect(out.timestamp).toBe(20); // max
  });

  it('licenseState nunca se degrada a null: conserva la licencia del otro lado', () => {
    // El más reciente (remote) no tiene licencia; el local sí → se conserva.
    const local = makeSnap({ timestamp: 10, licenseState: { plan: 'lifetime' } });
    const remote = makeSnap({ timestamp: 20, licenseState: null });
    const out = mergeSnapshots(local, remote);
    expect(out.licenseState).toEqual({ plan: 'lifetime' });
  });
});
