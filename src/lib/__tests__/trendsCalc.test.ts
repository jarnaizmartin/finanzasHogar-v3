import { describe, it, expect } from 'vitest';
import {
  buildMonthKeys,
  computeMonthlyData,
  computeCategoryData,
  computeStats,
  computeTrendsData,
} from '../trendsCalc';

const rates = { EUR: 1 };
const baseCurrency = 'EUR';

const mkExpense = (overrides = {}) => ({
  accountId: 'acc1',
  entryDate: '2025-01-15',
  type: 'expense',
  amount: 100,
  currency: 'EUR',
  categoryId: 'cat1',
  ...overrides,
});

describe('buildMonthKeys', () => {
  it('returns all keys when rangeMonths is "all"', () => {
    const all = ['2024-11', '2024-12', '2025-01'];
    expect(buildMonthKeys('all', all)).toEqual(all);
  });

  it('returns empty array when allMonthKeys is empty and range is all', () => {
    expect(buildMonthKeys('all', [])).toEqual([]);
  });

  it('returns N month keys for numeric range', () => {
    const keys = buildMonthKeys(3, []);
    expect(keys).toHaveLength(3);
    // keys are in ascending order
    expect(keys[0] < keys[1]).toBe(true);
    expect(keys[1] < keys[2]).toBe(true);
  });
});

describe('computeMonthlyData', () => {
  const monthKeys = ['2025-01'];

  it('computes income, expenses and net correctly', () => {
    const expenses = [
      mkExpense({ type: 'income', amount: 2000, entryDate: '2025-01-10' }),
      mkExpense({ type: 'expense', amount: 800, entryDate: '2025-01-20' }),
    ];
    const [point] = computeMonthlyData(monthKeys, expenses, baseCurrency, rates);
    expect(point.income).toBe(2000);
    expect(point.expenses).toBe(800);
    expect(point.net).toBe(1200);
  });

  it('computes savingsRate as percentage of income', () => {
    const expenses = [
      mkExpense({ type: 'income', amount: 1000, entryDate: '2025-01-01' }),
      mkExpense({ type: 'expense', amount: 750, entryDate: '2025-01-02' }),
    ];
    const [point] = computeMonthlyData(monthKeys, expenses, baseCurrency, rates);
    expect(point.savingsRate).toBe(25);
  });

  it('sets savingsRate to 0 when income is 0', () => {
    const expenses = [mkExpense({ type: 'expense', amount: 100, entryDate: '2025-01-01' })];
    const [point] = computeMonthlyData(monthKeys, expenses, baseCurrency, rates);
    expect(point.savingsRate).toBe(0);
  });

  it('returns zero values for a month with no movements', () => {
    const [point] = computeMonthlyData(monthKeys, [], baseCurrency, rates);
    expect(point.income).toBe(0);
    expect(point.expenses).toBe(0);
    expect(point.net).toBe(0);
  });
});

describe('computeCategoryData', () => {
  it('aggregates expenses by category and sorts descending', () => {
    const expenses = [
      mkExpense({ categoryId: 'cat1', amount: 300 }),
      mkExpense({ categoryId: 'cat1', amount: 200 }),
      mkExpense({ categoryId: 'cat2', amount: 600 }),
    ];
    const categories = [
      { id: 'cat1', name: 'Alimentación', color: '#ff0000' },
      { id: 'cat2', name: 'Transporte', color: '#00ff00' },
    ];
    const result = computeCategoryData(expenses, categories, baseCurrency, rates);
    expect(result[0].categoryId).toBe('cat2');
    expect(result[0].total).toBe(600);
    expect(result[1].total).toBe(500);
  });

  it('ignores income entries', () => {
    const expenses = [
      mkExpense({ type: 'income', amount: 999 }),
      mkExpense({ type: 'expense', amount: 50 }),
    ];
    const categories = [{ id: 'cat1', name: 'Cat', color: '#000' }];
    const result = computeCategoryData(expenses, categories, baseCurrency, rates);
    expect(result).toHaveLength(1);
    expect(result[0].total).toBe(50);
  });

  it('uses fallback name and color for unknown categories', () => {
    const expenses = [mkExpense({ categoryId: 'unknown', amount: 10 })];
    const result = computeCategoryData(expenses, [], baseCurrency, rates);
    expect(result[0].name).toBe('Sin categoría');
    expect(result[0].color).toBe('#94a3b8');
  });
});

describe('computeStats', () => {
  const makeMonthly = (income: number, expenses: number, savingsRate: number) => ({
    monthKey: '2025-01',
    label: 'ene.',
    income,
    expenses,
    net: income - expenses,
    savingsRate,
  });

  it('sums totals correctly', () => {
    const monthly = [makeMonthly(2000, 800, 60), makeMonthly(1500, 1200, 20)];
    const stats = computeStats(monthly, []);
    expect(stats.totalIncome).toBe(3500);
    expect(stats.totalExpenses).toBe(2000);
    expect(stats.totalNet).toBe(1500);
  });

  it('computes avgSavingsRate as mean', () => {
    const monthly = [makeMonthly(1000, 500, 50), makeMonthly(1000, 800, 20)];
    const stats = computeStats(monthly, []);
    expect(stats.avgSavingsRate).toBe(35);
  });

  it('detects upward trend when second half savings is significantly higher', () => {
    const monthly = [
      makeMonthly(1000, 900, 10),
      makeMonthly(1000, 900, 10),
      makeMonthly(1000, 700, 30),
      makeMonthly(1000, 700, 30),
    ];
    const stats = computeStats(monthly, []);
    expect(stats.trend).toBe('up');
  });

  it('detects downward trend when second half savings is significantly lower', () => {
    const monthly = [
      makeMonthly(1000, 700, 30),
      makeMonthly(1000, 700, 30),
      makeMonthly(1000, 900, 10),
      makeMonthly(1000, 900, 10),
    ];
    const stats = computeStats(monthly, []);
    expect(stats.trend).toBe('down');
  });

  it('returns stable when difference is within 2 points', () => {
    const monthly = [
      makeMonthly(1000, 800, 20),
      makeMonthly(1000, 800, 20),
      makeMonthly(1000, 790, 21),
      makeMonthly(1000, 790, 21),
    ];
    const stats = computeStats(monthly, []);
    expect(stats.trend).toBe('stable');
  });

  it('returns 0 avgSavingsRate for empty monthlyData', () => {
    const stats = computeStats([], []);
    expect(stats.avgSavingsRate).toBe(0);
    expect(stats.monthCount).toBe(0);
  });
});

describe('computeTrendsData', () => {
  const accounts = [{ id: 'acc1', name: 'Cuenta 1', balance: 1000, currency: 'EUR' }];
  const categories = [{ id: 'cat1', name: 'Alimentación', color: '#f00' }];
  const expenses = [
    mkExpense({ entryDate: '2025-01-10', type: 'income', amount: 2000 }),
    mkExpense({ entryDate: '2025-01-20', type: 'expense', amount: 800 }),
  ];

  it('returns null when no month keys can be built', () => {
    const result = computeTrendsData('all', 'all', accounts, [], categories, rates, baseCurrency);
    expect(result).toBeNull();
  });

  it('returns data for matching expenses', () => {
    const result = computeTrendsData('all', 'all', accounts, expenses, categories, rates, baseCurrency);
    expect(result).not.toBeNull();
    expect(result!.monthlyData).toHaveLength(1);
    expect(result!.stats.totalIncome).toBe(2000);
    expect(result!.stats.totalExpenses).toBe(800);
  });

  it('filters by accountFilter', () => {
    const otherExpense = mkExpense({ accountId: 'acc2', entryDate: '2025-01-05', amount: 500 });
    const result = computeTrendsData('all', 'acc1', accounts, [...expenses, otherExpense], categories, rates, baseCurrency);
    expect(result!.filteredAccounts).toHaveLength(1);
    expect(result!.filteredAccounts[0].id).toBe('acc1');
  });
});

// A5 — robustez con datos vacíos (usuario nuevo abriendo Tendencias sin nada):
// no debe lanzar, ni producir NaN, ni highlights sin guarda.
describe('computeStats — datos vacíos (A5)', () => {
  it('no lanza y devuelve números finitos sin datos', () => {
    expect(() => computeStats([], [])).not.toThrow();
    const s = computeStats([], []);
    expect(Number.isFinite(s.totalIncome)).toBe(true);
    expect(Number.isFinite(s.totalExpenses)).toBe(true);
    expect(Number.isFinite(s.totalNet)).toBe(true);
    expect(Number.isFinite(s.avgSavingsRate)).toBe(true);
  });

  it('los highlights son undefined (no se derefean) sin datos', () => {
    const s = computeStats([], []);
    expect(s.bestIncomeMonth).toBeUndefined();
    expect(s.worstExpenseMonth).toBeUndefined();
    expect(s.topCategory).toBeUndefined();
  });
});
