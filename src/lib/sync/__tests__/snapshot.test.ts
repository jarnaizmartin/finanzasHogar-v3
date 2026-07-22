import { describe, it, expect } from 'vitest';
import { buildSyncSnapshot, findMergeDuplicates, type SnapshotParts } from '../snapshot';
import type { RealExpense } from '../../../types';
import { mkAccount, mkRealExpense } from '../../../test-fixtures';

const baseParts = (over: Partial<SnapshotParts> = {}): SnapshotParts => ({
  accounts: [],
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
  timestamp: 12345,
  ...over,
});

// Movimiento mínimo para la heurística de duplicados.
const mov = (
  id: string,
  amount: number,
  valueDate: string,
  over: Partial<RealExpense> = {}
): RealExpense => mkRealExpense({ id, amount, valueDate, type: 'expense', ...over });

describe('buildSyncSnapshot', () => {
  it('ensambla todas las colecciones y escalares con el timestamp', () => {
    const accounts = [mkAccount({ id: 'a', updatedAt: 1 })];
    const snap = buildSyncSnapshot(baseParts({ accounts, timestamp: 999 }));
    expect(snap.timestamp).toBe(999);
    expect(snap.accounts).toBe(accounts);
    expect(snap.baseCurrency).toBe('EUR');
    expect(snap.displayCurrency).toBe('USD');
    expect(snap.dark).toBe(true);
    expect(snap.licenseState).toEqual({ plan: 'lifetime' });
  });

  it('incluye los tombstones (no filtra entidades borradas)', () => {
    const realExpenses = [
      mov('m1', 10, '2026-01-01'),
      mov('m2', 20, '2026-01-02', { deletedAt: 5 }),
    ];
    const snap = buildSyncSnapshot(baseParts({ realExpenses }));
    expect(snap.realExpenses).toHaveLength(2);
  });
});

describe('findMergeDuplicates', () => {
  it('marca un movimiento nuevo que coincide con uno local preexistente', () => {
    const before = [mov('local1', 50, '2026-03-10')];
    const after = [...before, mov('remote1', 50, '2026-03-11')]; // ±1 día, mismo importe/tipo
    const dups = findMergeDuplicates(before, after);
    expect(dups).toEqual([{ id: 'remote1', duplicateOf: 'local1' }]);
  });

  it('no marca un movimiento nuevo que no coincide con nada', () => {
    const before = [mov('local1', 50, '2026-03-10')];
    const after = [...before, mov('remote1', 999, '2026-03-11')];
    expect(findMergeDuplicates(before, after)).toEqual([]);
  });

  it('no marca movimientos que ya existían localmente (no son nuevos del merge)', () => {
    const before = [mov('local1', 50, '2026-03-10'), mov('local2', 50, '2026-03-10')];
    // local2 coincide con local1 pero ya estaba antes → no se marca
    expect(findMergeDuplicates(before, before)).toEqual([]);
  });

  it('ignora los tombstones nuevos', () => {
    const before = [mov('local1', 50, '2026-03-10')];
    const after = [...before, mov('remote1', 50, '2026-03-10', { deletedAt: 9 })];
    expect(findMergeDuplicates(before, after)).toEqual([]);
  });

  it('no cuenta como preexistente un movimiento local borrado', () => {
    const before = [mov('local1', 50, '2026-03-10', { deletedAt: 9 })];
    const after = [...before, mov('remote1', 50, '2026-03-10')];
    // El único candidato local está borrado → el nuevo no se marca
    expect(findMergeDuplicates(before, after)).toEqual([]);
  });

  it('respeta tipo distinto (income vs expense) → no es duplicado', () => {
    const before = [mov('local1', 50, '2026-03-10', { type: 'income' })];
    const after = [...before, mov('remote1', 50, '2026-03-10', { type: 'expense' })];
    expect(findMergeDuplicates(before, after)).toEqual([]);
  });

  it('respeta la ventana de ±2 días (fuera → no es duplicado)', () => {
    const before = [mov('local1', 50, '2026-03-10')];
    const after = [...before, mov('remote1', 50, '2026-03-20')];
    expect(findMergeDuplicates(before, after)).toEqual([]);
  });
});
