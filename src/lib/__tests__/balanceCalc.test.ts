import { describe, it, expect } from 'vitest';
import { calcRealBalance } from '../balanceCalc';
import type { RealExpense } from '../../types';

// Helper builder para RealExpense (reduce ruido en los tests)
const mkExpense = (overrides: Partial<RealExpense> = {}): RealExpense =>
  ({
    id: 'e1',
    accountId: 'acc-1',
    categoryId: 'cat-1',
    type: 'expense',
    amount: 100,
    currency: 'EUR',
    valueDate: '2024-06-15',
    ...overrides,
  } as RealExpense);

const baseAccount = {
  id: 'acc-1',
  balance: 1000,
  date: '2024-01-01',
  currency: 'EUR',
  acknowledgedExpenseIds: [] as string[],
};

const rates = { USD: 1.1 };

describe('calcRealBalance', () => {
  it('returns initial balance when there are no movements', () => {
    const r = calcRealBalance(baseAccount, [], rates, 'EUR');
    expect(r.realBalance).toBe(1000);
    expect(r.appliedCount).toBe(0);
    expect(r.ignoredCount).toBe(0);
  });

  it('adds income movements after account date', () => {
    const expenses = [
      mkExpense({ id: 'e1', type: 'income', amount: 200 }),
    ];
    const r = calcRealBalance(baseAccount, expenses, rates, 'EUR');
    expect(r.realBalance).toBe(1200);
    expect(r.appliedCount).toBe(1);
    expect(r.ignoredCount).toBe(0);
  });

  it('subtracts expense movements after account date', () => {
    const expenses = [
      mkExpense({ id: 'e1', type: 'expense', amount: 150 }),
    ];
    const r = calcRealBalance(baseAccount, expenses, rates, 'EUR');
    expect(r.realBalance).toBe(850);
    expect(r.appliedCount).toBe(1);
    expect(r.ignoredCount).toBe(0);
  });

  it('ignores movements on the exact account date (uses strict >)', () => {
    const expenses = [
      mkExpense({ id: 'e1', valueDate: '2024-01-01', amount: 500 }),
    ];
    const r = calcRealBalance(baseAccount, expenses, rates, 'EUR');
    expect(r.realBalance).toBe(1000); // sin cambios
    expect(r.appliedCount).toBe(0);
    expect(r.ignoredCount).toBe(1);
  });

  it('ignores movements before the account date', () => {
    const expenses = [
      mkExpense({ id: 'e1', valueDate: '2023-12-15', amount: 500 }),
    ];
    const r = calcRealBalance(baseAccount, expenses, rates, 'EUR');
    expect(r.realBalance).toBe(1000);
    expect(r.appliedCount).toBe(0);
    expect(r.ignoredCount).toBe(1);
  });

  it('skips acknowledged movements (not applied, not ignored)', () => {
    const account = {
      ...baseAccount,
      acknowledgedExpenseIds: ['e1'],
    };
    const expenses = [
      mkExpense({ id: 'e1', amount: 300 }),
    ];
    const r = calcRealBalance(account, expenses, rates, 'EUR');
    expect(r.realBalance).toBe(1000);
    expect(r.appliedCount).toBe(0);
    expect(r.ignoredCount).toBe(0); // acknowledged ≠ ignored
  });

  it('handles missing acknowledgedExpenseIds (undefined) as empty set', () => {
    const account = { ...baseAccount };
    delete (account as Partial<typeof baseAccount>).acknowledgedExpenseIds;
    const expenses = [mkExpense({ id: 'e1', amount: 100 })];
    const r = calcRealBalance(account, expenses, rates, 'EUR');
    expect(r.appliedCount).toBe(1);
    expect(r.realBalance).toBe(900);
  });

  it('excludes movements from other accounts', () => {
    const expenses = [
      mkExpense({ id: 'e1', accountId: 'acc-OTHER', amount: 500 }),
      mkExpense({ id: 'e2', accountId: 'acc-1', amount: 100 }),
    ];
    const r = calcRealBalance(baseAccount, expenses, rates, 'EUR');
    expect(r.realBalance).toBe(900); // solo la de acc-1
    expect(r.appliedCount).toBe(1);
    expect(r.ignoredCount).toBe(0);
  });

  it('converts currency to account currency', () => {
    // 110 USD → 100 EUR (rate USD=1.1)
    const expenses = [
      mkExpense({ id: 'e1', amount: 110, currency: 'USD' }),
    ];
    const r = calcRealBalance(baseAccount, expenses, rates, 'EUR');
    expect(r.realBalance).toBeCloseTo(900, 5);
    expect(r.appliedCount).toBe(1);
  });

  it('falls back to baseCurrency when account.currency is missing', () => {
    const account = { ...baseAccount, currency: undefined as unknown as string };
    const expenses = [
      mkExpense({ id: 'e1', amount: 110, currency: 'USD' }),
    ];
    // baseCurrency='EUR' → 110 USD → 100 EUR
    const r = calcRealBalance(account, expenses, rates, 'EUR');
    expect(r.realBalance).toBeCloseTo(900, 5);
  });

  it('correctly counts and sums a realistic mixed scenario', () => {
    const account = {
      ...baseAccount,
      balance: 2000,
      acknowledgedExpenseIds: ['ack-1'],
    };
    const expenses = [
      mkExpense({ id: 'ack-1', amount: 999 }), // acknowledged → ni cuenta
      mkExpense({ id: 'old-1', valueDate: '2023-01-01', amount: 500 }), // antiguo → ignored
      mkExpense({ id: 'inc-1', type: 'income', amount: 800 }),  // +800
      mkExpense({ id: 'exp-1', type: 'expense', amount: 200 }), // -200
      mkExpense({ id: 'exp-2', type: 'expense', amount: 150 }), // -150
      mkExpense({ id: 'other', accountId: 'acc-X', amount: 9999 }), // otra cuenta
    ];
    const r = calcRealBalance(account, expenses, rates, 'EUR');
    expect(r.realBalance).toBe(2000 + 800 - 200 - 150); // 2450
    expect(r.appliedCount).toBe(3);
    expect(r.ignoredCount).toBe(1); // solo old-1
  });
});
