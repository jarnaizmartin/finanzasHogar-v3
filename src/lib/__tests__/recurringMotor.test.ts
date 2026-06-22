import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { applyRecurringProjections } from '../recurringMotor';
import type { Projection, RealExpense } from '../../types';

// ─── Fixtures ────────────────────────────────────────────────────────────────
const FIXED_NOW = new Date('2024-06-15T12:00:00Z'); // currentMonthKey='2024-06', day=15

const accounts = [
  { id: 'acc-1', currency: 'EUR' },
  { id: 'acc-2', currency: 'USD' },
];

const mkProj = (overrides: Partial<Projection> = {}): Projection =>
  ({
    id: 'p1',
    name: 'Netflix',
    isRecurring: true,
    type: 'expense',
    amount: 15,
    categoryId: 'cat-1',
    accountId: 'acc-1',
    frequency: 'monthly',
    startDate: '2024-01-10',
    endDate: null,
    recurringDay: 10,
    lastApplied: null,
    nextOverrideAmount: null,
    ...overrides,
  } as unknown as Projection);

// Helper: ejecuta el motor capturando setters
function run(
  projections: Projection[],
  realExpenses: RealExpense[] = []
) {
  const setRealExpenses = vi.fn();
  const setProjections = vi.fn();
  const result = applyRecurringProjections(
    projections,
    realExpenses,
    setRealExpenses,
    setProjections,
    accounts,
    'EUR'
  );

  // Capturamos lo que se hubiera pasado a setRealExpenses (functional updater)
  let appliedExpenses: RealExpense[] = [];
  if (setRealExpenses.mock.calls.length > 0) {
    const updater = setRealExpenses.mock.calls[0][0];
    appliedExpenses =
      typeof updater === 'function' ? updater(realExpenses) : updater;
    // Sólo las nuevas (excluir las preexistentes)
    appliedExpenses = appliedExpenses.slice(realExpenses.length);
  }

  const updatedProjections = setProjections.mock.calls[0]?.[0] ?? null;

  return {
    result,
    setRealExpenses,
    setProjections,
    appliedExpenses,
    updatedProjections,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('applyRecurringProjections', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Filtros: qué NO se aplica ──────────────────────────────────────────────
  it('ignores non-recurring projections', () => {
    const r = run([mkProj({ isRecurring: false })]);
    expect(r.result.applied).toBe(0);
    expect(r.setRealExpenses).not.toHaveBeenCalled();
    expect(r.setProjections).not.toHaveBeenCalled();
  });

  it('skips projection already applied this month', () => {
    const r = run([mkProj({ lastApplied: '2024-06' })]);
    expect(r.result.applied).toBe(0);
    expect(r.setRealExpenses).not.toHaveBeenCalled();
  });

  it('skips when current day is before chargeDay', () => {
    const r = run([mkProj({ recurringDay: 20 })]); // hoy es día 15
    expect(r.result.applied).toBe(0);
  });

  it('skips when startDate is in the future', () => {
    const r = run([mkProj({ startDate: '2024-12-10' })]);
    expect(r.result.applied).toBe(0);
  });

  it('skips when endDate has passed', () => {
    const r = run([mkProj({ endDate: '2024-03-01' })]);
    expect(r.result.applied).toBe(0);
  });

  it('skips when frequency interval does not match', () => {
    // bimonthly desde enero: aplica en ene, mar, may, jul → junio NO
    const r = run([
      mkProj({ frequency: 'bimonthly', startDate: '2024-01-10' }),
    ]);
    expect(r.result.applied).toBe(0);
  });

  it('skips projections with invalid/unknown frequency', () => {
    const r = run([mkProj({ frequency: 'weekly' as Projection['frequency'] })]);
    expect(r.result.applied).toBe(0);
  });

  // ── Casos felices: gastos / ingresos ───────────────────────────────────────
  it('applies a monthly expense and updates projection', () => {
    const r = run([mkProj()]);
    expect(r.result.applied).toBe(1);
    expect(r.result.duplicates).toBe(0);
    expect(r.appliedExpenses).toHaveLength(1);

    const e = r.appliedExpenses[0];
    expect(e.type).toBe('expense');
    expect(e.amount).toBe(15);
    expect(e.currency).toBe('EUR');
    expect(e.accountId).toBe('acc-1');
    expect(e.categoryId).toBe('cat-1');
    expect(e.valueDate).toBe('2024-06-10');
    expect(e.description).toContain('Netflix');

    expect(r.updatedProjections[0].lastApplied).toBe('2024-06');
    expect(r.updatedProjections[0].nextOverrideAmount).toBe(null);
  });

  it('applies an income type correctly', () => {
    const r = run([mkProj({ type: 'income', name: 'Salary', amount: 2000 })]);
    expect(r.appliedExpenses[0].type).toBe('income');
    expect(r.appliedExpenses[0].amount).toBe(2000);
  });

  it('applies quarterly frequency on matching month', () => {
    // quarterly desde enero: ene, abr, jul → junio NO debería; usemos marzo→jun (sí)
    const r = run([
      mkProj({ frequency: 'quarterly', startDate: '2024-03-10' }),
    ]);
    expect(r.result.applied).toBe(1);
  });

  it('uses nextOverrideAmount when provided', () => {
    const r = run([mkProj({ amount: 15, nextOverrideAmount: 99 })]);
    expect(r.appliedExpenses[0].amount).toBe(99);
    expect(r.updatedProjections[0].nextOverrideAmount).toBe(null);
  });

  it('uses startDate day as fallback when recurringDay is missing', () => {
    const r = run([
      mkProj({ recurringDay: undefined, startDate: '2024-01-08' }),
    ]);
    expect(r.result.applied).toBe(1);
    expect(r.appliedExpenses[0].valueDate).toBe('2024-06-08');
  });

  it('uses baseCurrency when account is missing', () => {
    const r = run([mkProj({ accountId: 'acc-UNKNOWN' })]);
    expect(r.appliedExpenses[0].currency).toBe('EUR');
  });

  it('uses account currency (USD) when account differs from base', () => {
    const r = run([mkProj({ accountId: 'acc-2' })]);
    expect(r.appliedExpenses[0].currency).toBe('USD');
  });

  // ── Transferencias ────────────────────────────────────────────────────────
  it('creates two linked entries for a transfer projection', () => {
    const r = run([
      mkProj({
        type: 'transfer',
        accountId: 'acc-1',
        toAccountId: 'acc-2',
        amount: 500,
      } as Partial<Projection>),
    ]);
    expect(r.result.applied).toBe(1);
    expect(r.appliedExpenses).toHaveLength(2);

    const [out, inc] = r.appliedExpenses;
    expect(out.type).toBe('expense');
    expect(out.accountId).toBe('acc-1');
    expect(out.currency).toBe('EUR');
    expect(inc.type).toBe('income');
    expect(inc.accountId).toBe('acc-2');
    expect(inc.currency).toBe('USD');

    // Mismo transferId
    expect(out.transferId).toBeDefined();
    expect(out.transferId).toBe(inc.transferId);
    expect(out.isTransfer).toBe(true);
    expect(inc.isTransfer).toBe(true);
    expect(out.categoryId).toBe('__transfer__');
  });

  // ── ID determinista (anti-duplicado en multi-dispositivo) ──────────────────
  it('uses a deterministic id derived from projection + month', () => {
    const r = run([mkProj()]);
    expect(r.appliedExpenses[0].id).toBe('auto-p1-2024-06');
  });

  it('uses deterministic ids and transferId for transfer legs', () => {
    const r = run([
      mkProj({
        type: 'transfer',
        accountId: 'acc-1',
        toAccountId: 'acc-2',
        amount: 500,
      } as Partial<Projection>),
    ]);
    const [out, inc] = r.appliedExpenses;
    expect(out.id).toBe('auto-p1-2024-06-out');
    expect(inc.id).toBe('auto-p1-2024-06-in');
    expect(out.transferId).toBe('auto-p1-2024-06-t');
    expect(inc.transferId).toBe('auto-p1-2024-06-t');
  });

  it('generates identical ids across two independent runs (multi-device)', () => {
    // Simula PC e iPhone materializando la MISMA proyección recurrente del mismo
    // mes por separado: deben producir ids idénticos para que el merge del sync
    // los colapse por id en vez de conservar dos copias.
    const deviceA = run([mkProj()]);
    const deviceB = run([mkProj()]);
    expect(deviceA.appliedExpenses[0].id).toBe(deviceB.appliedExpenses[0].id);
  });

  // ── Detección de duplicados ───────────────────────────────────────────────
  it('detects exact duplicate and marks projection with warning (no expense added)', () => {
    const existing: RealExpense[] = [
      {
        id: 'e-existing',
        accountId: 'acc-1',
        categoryId: 'cat-1',
        type: 'expense',
        amount: 15,
        currency: 'EUR',
        valueDate: '2024-06-05',
      } as RealExpense,
    ];
    const r = run([mkProj()], existing);
    expect(r.result.applied).toBe(0);
    expect(r.result.duplicates).toBe(1);
    expect(r.appliedExpenses).toHaveLength(0);
    expect(r.updatedProjections[0].hasDuplicateWarning).toBe(true);
    expect(r.updatedProjections[0].duplicateWarningMonth).toBe('2024-06');
    expect(r.updatedProjections[0].lastApplied).toBe('2024-06');

    expect(r.result.duplicateDetails).toHaveLength(1);
    expect(r.result.duplicateDetails[0]).toMatchObject({
      projectionName: 'Netflix',
      amount: 15,
      currency: 'EUR',
      monthKey: '2024-06',
    });
  });

  it('treats amounts within 5% tolerance as duplicates', () => {
    // 15 ± 5% = [14.25, 15.75]. Un gasto de 15.50 cuenta como duplicado.
    const existing: RealExpense[] = [
      {
        id: 'e-existing',
        accountId: 'acc-1',
        categoryId: 'cat-1',
        type: 'expense',
        amount: 15.5,
        currency: 'EUR',
        valueDate: '2024-06-01',
      } as RealExpense,
    ];
    const r = run([mkProj({ amount: 15 })], existing);
    expect(r.result.duplicates).toBe(1);
  });

  it('does NOT treat amounts beyond 5% tolerance as duplicates', () => {
    // gasto existente de 20 vs proyección de 15 → diff 5 > 0.75 → no duplicado
    const existing: RealExpense[] = [
      {
        id: 'e-existing',
        accountId: 'acc-1',
        categoryId: 'cat-1',
        type: 'expense',
        amount: 20,
        currency: 'EUR',
        valueDate: '2024-06-01',
      } as RealExpense,
    ];
    const r = run([mkProj({ amount: 15 })], existing);
    expect(r.result.duplicates).toBe(0);
    expect(r.result.applied).toBe(1);
  });

  it('does NOT treat expenses from different month as duplicates', () => {
    const existing: RealExpense[] = [
      {
        id: 'e-existing',
        accountId: 'acc-1',
        categoryId: 'cat-1',
        type: 'expense',
        amount: 15,
        currency: 'EUR',
        valueDate: '2024-05-15', // mayo, no junio
      } as RealExpense,
    ];
    const r = run([mkProj()], existing);
    expect(r.result.applied).toBe(1);
    expect(r.result.duplicates).toBe(0);
  });

  // ── Comportamiento global ─────────────────────────────────────────────────
  it('does not call setters when nothing happens', () => {
    const r = run([mkProj({ isRecurring: false })]);
    expect(r.setRealExpenses).not.toHaveBeenCalled();
    expect(r.setProjections).not.toHaveBeenCalled();
  });

  it('handles empty projections list gracefully', () => {
    const r = run([]);
    expect(r.result).toEqual({
      applied: 0,
      duplicates: 0,
      duplicateDetails: [],
    });
  });

  it('processes multiple projections in a single call', () => {
    const r = run([
      mkProj({ id: 'p1', name: 'Netflix', amount: 15 }),
      mkProj({ id: 'p2', name: 'Spotify', amount: 10, categoryId: 'cat-2' }),
    ]);
    expect(r.result.applied).toBe(2);
    expect(r.appliedExpenses).toHaveLength(2);
  });
});
