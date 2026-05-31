import { describe, it, expect } from 'vitest';
import {
  getProjectionsForDay,
  getRealsForDay,
  getRealsForMonth,
  buildAnnualMonthStats,
} from '../calendarCalc';
import type { Projection, RealExpense, Account, SavingsGoal } from '../../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const stamp = { createdAt: 0, updatedAt: 0 };

function makeProj(overrides: Partial<Projection> = {}): Projection {
  return {
    ...stamp,
    id: 'p1',
    name: 'Test',
    amount: 100,
    type: 'expense',
    frequency: 'monthly',
    startDate: '2025-01-15',
    endDate: null,
    accountId: 'acc1',
    categoryId: 'cat1',
    currency: 'EUR',
    ...overrides,
  };
}

function makeReal(overrides: Partial<RealExpense> = {}): RealExpense {
  return {
    ...stamp,
    id: 'r1',
    description: 'Test',
    amount: 50,
    type: 'expense',
    currency: 'EUR',
    entryDate: '2025-05-10',
    valueDate: '2025-05-10',
    accountId: 'acc1',
    categoryId: 'cat1',
    ...overrides,
  };
}

function makeAccount(id = 'acc1'): Account {
  return {
    ...stamp,
    id,
    name: 'Cuenta test',
    balance: 1000,
    currency: 'EUR',
    date: '2025-01-01',
  };
}

function makeGoal(overrides: Partial<SavingsGoal> = {}): SavingsGoal {
  return {
    ...stamp,
    id: 'g1',
    name: 'Goal test',
    targetAmount: 5000,
    currentAmount: 0,
    deadline: '2025-06-30',
    ...overrides,
  };
}

const EUR_RATES = { EUR: 1 };

// ─── getProjectionsForDay ─────────────────────────────────────────────────────

describe('getProjectionsForDay', () => {
  it('returns monthly projection on its pay day', () => {
    const p = makeProj({ startDate: '2025-01-15', frequency: 'monthly' });
    const result = getProjectionsForDay([p], 2025, 4, 15); // May 2025
    expect(result).toHaveLength(1);
  });

  it('excludes projection on a different day', () => {
    const p = makeProj({ startDate: '2025-01-15', frequency: 'monthly' });
    expect(getProjectionsForDay([p], 2025, 4, 10)).toHaveLength(0);
  });

  it('excludes projection before its start month', () => {
    const p = makeProj({ startDate: '2025-06-15', frequency: 'monthly' });
    expect(getProjectionsForDay([p], 2025, 4, 15)).toHaveLength(0); // May is before June start
  });

  it('excludes projection after its end date', () => {
    const p = makeProj({ startDate: '2025-01-15', endDate: '2025-03-31', frequency: 'monthly' });
    expect(getProjectionsForDay([p], 2025, 4, 15)).toHaveLength(0); // May is after March end
  });

  it('includes projection on the month of its end date', () => {
    const p = makeProj({ startDate: '2025-01-15', endDate: '2025-05-31', frequency: 'monthly' });
    expect(getProjectionsForDay([p], 2025, 4, 15)).toHaveLength(1);
  });

  it('respects quarterly frequency — shows on correct quarter', () => {
    const p = makeProj({ startDate: '2025-01-10', frequency: 'quarterly' });
    expect(getProjectionsForDay([p], 2025, 3, 10)).toHaveLength(1); // April = month 3 offset from Jan = 3 months
    expect(getProjectionsForDay([p], 2025, 1, 10)).toHaveLength(0); // Feb = 1 month — not a quarter
  });

  it('respects annual frequency — only fires on same month as start', () => {
    const p = makeProj({ startDate: '2025-03-20', frequency: 'annual' });
    expect(getProjectionsForDay([p], 2026, 2, 20)).toHaveLength(1); // March 2026 = 12 months later
    expect(getProjectionsForDay([p], 2026, 1, 20)).toHaveLength(0); // Feb 2026 = 11 months
  });

  it('returns empty for unknown frequency', () => {
    const p = makeProj({ frequency: 'weekly' as never });
    expect(getProjectionsForDay([p], 2025, 4, 15)).toHaveLength(0);
  });
});

// ─── getRealsForDay ───────────────────────────────────────────────────────────

describe('getRealsForDay', () => {
  const accounts = [makeAccount('acc1')];

  it('returns real expense on matching day', () => {
    const r = makeReal({ valueDate: '2025-05-10', accountId: 'acc1' });
    expect(getRealsForDay([r], accounts, 2025, 4, 10)).toHaveLength(1);
  });

  it('excludes real on a different day', () => {
    const r = makeReal({ valueDate: '2025-05-11', accountId: 'acc1' });
    expect(getRealsForDay([r], accounts, 2025, 4, 10)).toHaveLength(0);
  });

  it('excludes real from unknown account', () => {
    const r = makeReal({ valueDate: '2025-05-10', accountId: 'acc_unknown' });
    expect(getRealsForDay([r], accounts, 2025, 4, 10)).toHaveLength(0);
  });

  it('pads day and month correctly', () => {
    const r = makeReal({ valueDate: '2025-01-05', accountId: 'acc1' });
    expect(getRealsForDay([r], accounts, 2025, 0, 5)).toHaveLength(1); // Jan = month 0
  });
});

// ─── getRealsForMonth ─────────────────────────────────────────────────────────

describe('getRealsForMonth', () => {
  const accounts = [makeAccount('acc1')];

  it('returns all reals in the given month', () => {
    const r1 = makeReal({ id: 'r1', valueDate: '2025-05-01' });
    const r2 = makeReal({ id: 'r2', valueDate: '2025-05-31' });
    const r3 = makeReal({ id: 'r3', valueDate: '2025-06-01' });
    expect(getRealsForMonth([r1, r2, r3], accounts, 2025, 4)).toHaveLength(2);
  });

  it('returns empty when no reals in month', () => {
    const r = makeReal({ valueDate: '2025-04-10' });
    expect(getRealsForMonth([r], accounts, 2025, 4)).toHaveLength(0);
  });

  it('excludes reals from unknown accounts', () => {
    const r = makeReal({ valueDate: '2025-05-10', accountId: 'unknown' });
    expect(getRealsForMonth([r], accounts, 2025, 4)).toHaveLength(0);
  });
});

// ─── buildAnnualMonthStats ────────────────────────────────────────────────────

describe('buildAnnualMonthStats', () => {
  const accounts = [makeAccount('acc1')];

  it('computes realIncome and realExpense correctly', () => {
    const reals = [
      makeReal({ id: 'r1', type: 'income', amount: 2000, valueDate: '2025-06-10' }),
      makeReal({ id: 'r2', type: 'expense', amount: 800, valueDate: '2025-06-20' }),
    ];
    const stats = buildAnnualMonthStats(5, 2025, reals, accounts, [], 0, 'EUR', EUR_RATES, '2025-05');
    expect(stats.realIncome).toBeCloseTo(2000);
    expect(stats.realExpense).toBeCloseTo(800);
    expect(stats.realNet).toBeCloseTo(1200);
    expect(stats.hasRealMovements).toBe(true);
  });

  it('hasRealMovements is false when no reals', () => {
    const stats = buildAnnualMonthStats(5, 2025, [], accounts, [], 500, 'EUR', EUR_RATES, '2025-05');
    expect(stats.hasRealMovements).toBe(false);
  });

  it('hasAlert is true when netBalance is negative', () => {
    const stats = buildAnnualMonthStats(5, 2025, [], accounts, [], -100, 'EUR', EUR_RATES, '2025-03');
    expect(stats.hasAlert).toBe(true);
  });

  it('hasAlert is false when netBalance is non-negative', () => {
    const stats = buildAnnualMonthStats(5, 2025, [], accounts, [], 0, 'EUR', EUR_RATES, '2025-03');
    expect(stats.hasAlert).toBe(false);
  });

  it('isPast when month key is before todayMk', () => {
    const stats = buildAnnualMonthStats(3, 2025, [], accounts, [], 0, 'EUR', EUR_RATES, '2025-05');
    expect(stats.isPast).toBe(true);
    expect(stats.isCurrent).toBe(false);
  });

  it('isCurrent when mk equals todayMk', () => {
    const stats = buildAnnualMonthStats(4, 2025, [], accounts, [], 0, 'EUR', EUR_RATES, '2025-05');
    expect(stats.isCurrent).toBe(true);
    expect(stats.isPast).toBe(false);
  });

  it('neither isPast nor isCurrent for future month', () => {
    const stats = buildAnnualMonthStats(7, 2025, [], accounts, [], 0, 'EUR', EUR_RATES, '2025-05');
    expect(stats.isPast).toBe(false);
    expect(stats.isCurrent).toBe(false);
  });

  it('collects expiringGoals matching the month', () => {
    const goals = [
      makeGoal({ id: 'g1', deadline: '2025-06-15' }),
      makeGoal({ id: 'g2', deadline: '2025-07-01' }),
    ];
    const stats = buildAnnualMonthStats(5, 2025, [], accounts, goals, 0, 'EUR', EUR_RATES, '2025-05');
    expect(stats.expiringGoals).toHaveLength(1);
    expect(stats.expiringGoals[0].id).toBe('g1');
  });

  it('mk and label are set correctly for month 0 (January)', () => {
    const stats = buildAnnualMonthStats(0, 2025, [], accounts, [], 0, 'EUR', EUR_RATES, '2025-05');
    expect(stats.mk).toBe('2025-01');
    expect(stats.label).toBeTruthy();
  });
});
