import { describe, it, expect } from 'vitest';
import {
  computePeriodKeys,
  computePeriodLabel,
  filterPeriodReals,
  computePeriodProjections,
  computeTotals,
  computeCatRows,
  computeGoalSaved,
  computeGoalsStats,
  computeTrendsStats,
} from '../reportsCalc';
import type {
  Account,
  Projection,
  RealExpense,
  SavingsGoal,
} from '../../types';

// ─── Factories ───────────────────────────────────────────────────────────────
const TS = { createdAt: 0, updatedAt: 0 };
const acc = (over: Partial<Account> = {}): Account => ({
  ...TS,
  id: 'a1',
  name: 'Cuenta',
  balance: 1000,
  currency: 'EUR',
  date: '2024-01-01',
  ...over,
});
const proj = (over: Partial<Projection> = {}): Projection => ({
  ...TS,
  id: 'p1',
  name: 'Proj',
  accountId: 'a1',
  categoryId: 'c1',
  type: 'expense',
  amount: 100,
  frequency: 'monthly',
  startDate: '2024-01-01',
  endDate: '',
  ...over,
});
const re = (over: Partial<RealExpense> = {}): RealExpense => ({
  ...TS,
  id: 'r1',
  entryDate: '2024-06-15',
  valueDate: '2024-06-15',
  description: 'x',
  categoryId: 'c1',
  amount: 50,
  currency: 'EUR',
  type: 'expense',
  accountId: 'a1',
  ...over,
});
const goal = (over: Partial<SavingsGoal> = {}): SavingsGoal => ({
  ...TS,
  id: 'g1',
  name: 'Goal',
  emoji: '🎯',
  color: '#000',
  targetAmount: 1000,
  currency: 'EUR',
  deadline: '',
  mode: 'manual',
  currentAmount: 0,
  categoryId: 'c1',
  accountId: 'all',
  autoType: 'income',
  autoStartDate: '2024-01-01',
  ...over,
});
const rates = { EUR: 1, USD: 1.1 };

// ─── computePeriodKeys ───────────────────────────────────────────────────────
describe('computePeriodKeys', () => {
  it('mode=month → 1 sola clave con padding', () => {
    expect(computePeriodKeys('month', 2024, 0, '', '')).toEqual(['2024-01']);
    expect(computePeriodKeys('month', 2024, 11, '', '')).toEqual(['2024-12']);
  });
  it('mode=range mismo mes → 1 clave', () => {
    expect(computePeriodKeys('range', 0, 0, '2024-03', '2024-03')).toEqual(['2024-03']);
  });
  it('mode=range varios meses dentro del mismo año', () => {
    expect(computePeriodKeys('range', 0, 0, '2024-01', '2024-04')).toEqual([
      '2024-01', '2024-02', '2024-03', '2024-04',
    ]);
  });
  it('mode=range cruzando año', () => {
    expect(computePeriodKeys('range', 0, 0, '2023-11', '2024-02')).toEqual([
      '2023-11', '2023-12', '2024-01', '2024-02',
    ]);
  });
  it('mode=range con entrada vacía → array vacío', () => {
    expect(computePeriodKeys('range', 0, 0, '', '')).toEqual([]);
  });
});

// ─── computePeriodLabel ──────────────────────────────────────────────────────
describe('computePeriodLabel', () => {
  it('mode=month → "mes año" en español', () => {
    const l = computePeriodLabel('month', 2024, 5, '', '');
    expect(l.toLowerCase()).toContain('junio');
    expect(l).toContain('2024');
  });
  it('mode=range mismo from/to → devuelve uno', () => {
    expect(computePeriodLabel('range', 0, 0, '2024-03', '2024-03')).toBe('2024-03');
  });
  it('mode=range distintos → "from → to"', () => {
    expect(computePeriodLabel('range', 0, 0, '2024-01', '2024-04')).toBe('2024-01 → 2024-04');
  });
});

// ─── filterPeriodReals ───────────────────────────────────────────────────────
describe('filterPeriodReals', () => {
  it('filtra por monthKey de valueDate', () => {
    const reals = [
      re({ id: '1', valueDate: '2024-06-15' }),
      re({ id: '2', valueDate: '2024-07-01' }),
      re({ id: '3', valueDate: '2024-06-30' }),
    ];
    const r = filterPeriodReals(reals, ['2024-06']);
    expect(r.map((x) => x.id)).toEqual(['1', '3']);
  });
  it('múltiples periodKeys', () => {
    const reals = [
      re({ id: '1', valueDate: '2024-06-15' }),
      re({ id: '2', valueDate: '2024-08-01' }),
    ];
    expect(filterPeriodReals(reals, ['2024-06', '2024-08']).length).toBe(2);
  });
  it('sin claves → vacío', () => {
    expect(filterPeriodReals([re()], [])).toEqual([]);
  });
  it('excluye los traspasos (patrimonio neutro)', () => {
    const reals = [
      re({ id: '1', valueDate: '2024-06-15' }),
      re({ id: 't-out', valueDate: '2024-06-15', isTransfer: true, type: 'expense' }),
      re({ id: 't-in', valueDate: '2024-06-15', isTransfer: true, type: 'income' }),
    ];
    expect(filterPeriodReals(reals, ['2024-06']).map((x) => x.id)).toEqual(['1']);
  });
});

// ─── computePeriodProjections ────────────────────────────────────────────────
describe('computePeriodProjections', () => {
  it('mensual desde enero aplica todos los meses', () => {
    const p = proj({ startDate: '2024-01-01', frequency: 'monthly' });
    const r = computePeriodProjections([p], ['2024-01', '2024-02', '2024-03']);
    expect(r.length).toBe(3);
    expect(r.map((x) => x.mk)).toEqual(['2024-01', '2024-02', '2024-03']);
  });
  it('trimestral solo aplica cada 3 meses', () => {
    const p = proj({ startDate: '2024-01-01', frequency: 'quarterly' });
    const r = computePeriodProjections([p], ['2024-01', '2024-02', '2024-03', '2024-04']);
    expect(r.map((x) => x.mk)).toEqual(['2024-01', '2024-04']);
  });
  it('no aplica antes de startDate', () => {
    const p = proj({ startDate: '2024-06-01' });
    const r = computePeriodProjections([p], ['2024-03', '2024-06']);
    expect(r.map((x) => x.mk)).toEqual(['2024-06']);
  });
  it('respeta endDate', () => {
    const p = proj({ startDate: '2024-01-01', endDate: '2024-02-28' });
    const r = computePeriodProjections([p], ['2024-01', '2024-02', '2024-03']);
    expect(r.map((x) => x.mk)).toEqual(['2024-01', '2024-02']);
  });
  it('frecuencia desconocida → se descarta', () => {
    const p = proj({ frequency: 'weekly' as any });
    expect(computePeriodProjections([p], ['2024-01'])).toEqual([]);
  });
});

// ─── computeTotals ───────────────────────────────────────────────────────────
describe('computeTotals', () => {
  it('suma ingresos y gastos reales', () => {
    const reals = [
      re({ type: 'income', amount: 1000 }),
      re({ type: 'expense', amount: 300 }),
      re({ type: 'expense', amount: 200 }),
    ];
    const t = computeTotals(reals, [], [acc()], 'EUR', 'EUR', rates);
    expect(t.realIncome).toBe(1000);
    expect(t.realExpense).toBe(500);
    expect(t.realNet).toBe(500);
    expect(t.savingsRate).toBe(50);
  });
  it('savingsRate = 0 cuando no hay ingresos', () => {
    const t = computeTotals([re({ type: 'expense', amount: 100 })], [], [acc()], 'EUR', 'EUR', rates);
    expect(t.savingsRate).toBe(0);
  });
  it('separa pIncome y pExpense de proyecciones', () => {
    const periodProjs = [
      { proj: proj({ type: 'income', amount: 500 }), mk: '2024-06' },
      { proj: proj({ type: 'expense', amount: 200 }), mk: '2024-06' },
    ];
    const t = computeTotals([], periodProjs, [acc()], 'EUR', 'EUR', rates);
    expect(t.pIncome).toBe(500);
    expect(t.pExpense).toBe(200);
  });
  it('convierte divisas en proyecciones según cuenta', () => {
    const t = computeTotals(
      [],
      [{ proj: proj({ type: 'expense', amount: 100 }), mk: '2024-06' }],
      [acc({ currency: 'USD' })],
      'EUR',
      'EUR',
      rates
    );
    // 100 USD / 1.1 = ~90.91 EUR
    expect(t.pExpense).toBeCloseTo(90.909, 2);
  });
});

// ─── computeCatRows ──────────────────────────────────────────────────────────
describe('computeCatRows', () => {
  it('agrupa por categoría con proyectado y real', () => {
    const periodProjs = [
      { proj: proj({ categoryId: 'c1', type: 'expense', amount: 200 }), mk: '2024-06' },
    ];
    const reals = [
      re({ categoryId: 'c1', type: 'expense', amount: 150 }),
      re({ categoryId: 'c2', type: 'income', amount: 300 }),
    ];
    const rows = computeCatRows(periodProjs, reals, [acc()], 'EUR', 'EUR', rates);
    expect(rows.length).toBe(2);
    const c1 = rows.find((r) => r.catId === 'c1')!;
    expect(c1.projected).toBe(200);
    expect(c1.real).toBe(150);
  });
  it('expense ordenado antes que income', () => {
    const reals = [
      re({ categoryId: 'cIn', type: 'income', amount: 100 }),
      re({ categoryId: 'cEx', type: 'expense', amount: 50 }),
    ];
    const rows = computeCatRows([], reals, [acc()], 'EUR', 'EUR', rates);
    expect(rows[0].type).toBe('expense');
    expect(rows[1].type).toBe('income');
  });
  it('mismo tipo → ordena por real desc', () => {
    const reals = [
      re({ id: '1', categoryId: 'A', type: 'expense', amount: 100 }),
      re({ id: '2', categoryId: 'B', type: 'expense', amount: 300 }),
      re({ id: '3', categoryId: 'C', type: 'expense', amount: 200 }),
    ];
    const rows = computeCatRows([], reals, [acc()], 'EUR', 'EUR', rates);
    expect(rows.map((r) => r.catId)).toEqual(['B', 'C', 'A']);
  });
  it('categoría solo en proyecciones (sin reales) aparece', () => {
    const periodProjs = [
      { proj: proj({ categoryId: 'cX', type: 'expense', amount: 80 }), mk: '2024-06' },
    ];
    const rows = computeCatRows(periodProjs, [], [acc()], 'EUR', 'EUR', rates);
    expect(rows.length).toBe(1);
    expect(rows[0].real).toBe(0);
    expect(rows[0].projected).toBe(80);
  });
});

// ─── computeGoalSaved ────────────────────────────────────────────────────────
describe('computeGoalSaved', () => {
  it('mode=manual → devuelve currentAmount', () => {
    const g = goal({ mode: 'manual', currentAmount: 750 });
    expect(computeGoalSaved(g, [re()], rates)).toBe(750);
  });
  it('mode=auto → suma reales que cumplen filtros', () => {
    const g = goal({
      mode: 'auto',
      categoryId: 'c1',
      autoType: 'income',
      autoStartDate: '2024-01-01',
    });
    const reals = [
      re({ categoryId: 'c1', type: 'income', amount: 200, valueDate: '2024-06-01' }),
      re({ categoryId: 'c1', type: 'income', amount: 100, valueDate: '2023-12-01' }), // antes
      re({ categoryId: 'c2', type: 'income', amount: 999, valueDate: '2024-06-01' }), // otra cat
      re({ categoryId: 'c1', type: 'expense', amount: 50, valueDate: '2024-06-01' }), // otro tipo
    ];
    expect(computeGoalSaved(g, reals, rates)).toBe(200);
  });
  it('mode=auto convierte divisas a la del goal', () => {
    const g = goal({ mode: 'auto', currency: 'EUR', categoryId: 'c1', autoType: 'income' });
    const reals = [
      re({ categoryId: 'c1', type: 'income', amount: 110, currency: 'USD', valueDate: '2024-06-01' }),
    ];
    expect(computeGoalSaved(g, reals, rates)).toBeCloseTo(100, 2);
  });
});

// ─── computeGoalsStats ───────────────────────────────────────────────────────
describe('computeGoalsStats', () => {
  it('cuenta totales y completados', () => {
    const gs = [
      goal({ id: 'g1', targetAmount: 1000, currentAmount: 1000, mode: 'manual' }),
      goal({ id: 'g2', targetAmount: 500, currentAmount: 200, mode: 'manual' }),
      goal({ id: 'g3', targetAmount: 300, currentAmount: 350, mode: 'manual' }),
    ];
    const s = computeGoalsStats(gs, [], 'EUR', rates);
    expect(s.total).toBe(3);
    expect(s.completed).toBe(2);
    expect(s.totalTarget).toBe(1800);
  });
  it('vacío → todo a cero', () => {
    expect(computeGoalsStats([], [], 'EUR', rates)).toEqual({
      total: 0, completed: 0, totalTarget: 0,
    });
  });
  it('totalTarget convierte divisas', () => {
    const gs = [goal({ targetAmount: 110, currency: 'USD' })];
    const s = computeGoalsStats(gs, [], 'EUR', rates);
    expect(s.totalTarget).toBeCloseTo(100, 2);
  });
});

// ─── computeTrendsStats ──────────────────────────────────────────────────────
describe('computeTrendsStats', () => {
  it('descarta movimientos de cuentas inexistentes', () => {
    const reals = [
      re({ id: '1', accountId: 'a1', valueDate: '2024-06-15' }),
      re({ id: '2', accountId: 'fantasma', valueDate: '2024-06-15' }),
    ];
    const s = computeTrendsStats(reals, [acc({ id: 'a1' })], ['2024-06'], 'EUR', rates);
    expect(s.validExp.length).toBe(1);
  });
  it('descarta movimientos fuera del período', () => {
    const reals = [
      re({ valueDate: '2024-06-15' }),
      re({ id: '2', valueDate: '2024-09-01' }),
    ];
    const s = computeTrendsStats(reals, [acc()], ['2024-06'], 'EUR', rates);
    expect(s.validExp.length).toBe(1);
  });
  it('calcula totales, balance y savRate', () => {
    const reals = [
      re({ type: 'income', amount: 2000, valueDate: '2024-06-01' }),
      re({ type: 'expense', amount: 800, valueDate: '2024-06-15' }),
    ];
    const s = computeTrendsStats(reals, [acc()], ['2024-06'], 'EUR', rates);
    expect(s.totalInc).toBe(2000);
    expect(s.totalExp).toBe(800);
    expect(s.net).toBe(1200);
    expect(s.savRate).toBe(60);
  });
  it('savRate = 0 sin ingresos', () => {
    const reals = [re({ type: 'expense', amount: 100, valueDate: '2024-06-01' })];
    const s = computeTrendsStats(reals, [acc()], ['2024-06'], 'EUR', rates);
    expect(s.savRate).toBe(0);
  });
  it('months ordenados ASC y sin duplicados', () => {
    const reals = [
      re({ id: '1', valueDate: '2024-08-15' }),
      re({ id: '2', valueDate: '2024-06-01' }),
      re({ id: '3', valueDate: '2024-08-30' }),
      re({ id: '4', valueDate: '2024-07-10' }),
    ];
    const s = computeTrendsStats(reals, [acc()], ['2024-06', '2024-07', '2024-08'], 'EUR', rates);
    expect(s.months).toEqual(['2024-06', '2024-07', '2024-08']);
  });
});
