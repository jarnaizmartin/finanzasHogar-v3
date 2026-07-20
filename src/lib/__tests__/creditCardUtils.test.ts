import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calcCreditCardDebt,
  daysUntilDayOfMonth,
  daysUntilBilling,
  daysUntilPayment,
  getCreditHealthScore,
  getCreditHealthColors,
  calcMinPayment,
  calcYearlyInterestCost,
  simulateAmortization,
  compareAmortizations,
  calcDebtHistory,
  calcHealthScore,
  calcHistoricalMetrics,
  calcTopCategoriesForCard,
} from '../creditCardUtils';
import type { Account, RealExpense } from '../../types';

// ─── Builders ────────────────────────────────────────────────────────────────
const mkCard = (overrides: Partial<Account> = {}): Account =>
  ({
    id: 'card-1',
    name: 'Visa',
    type: 'credit_card',
    accountType: 'credit_card',
    balance: 1000,
    currency: 'EUR',
    date: '2024-01-01',
    creditLimit: 5000,
    interestRate: 20,
    minPaymentPct: 5,
    billingDay: 25,
    paymentDueDay: 10,
    ...overrides,
  } as unknown as Account);

const mkExpense = (overrides: Partial<RealExpense> = {}): RealExpense =>
  ({
    id: 'e1',
    accountId: 'card-1',
    categoryId: 'cat-1',
    type: 'expense',
    amount: 100,
    currency: 'EUR',
    valueDate: '2024-02-15',
    ...overrides,
  } as RealExpense);

const rates = { USD: 1.1 };
const T = {
  red: '#red',
  redBg: '#redBg',
  redBorder: '#redBorder',
  amber: '#amber',
  amberBg: '#amberBg',
  amberBorder: '#amberBorder',
  green: '#green',
  greenBg: '#greenBg',
  greenBorder: '#greenBorder',
};

// ════════════════════════════════════════════════════════════════════════════
//  calcCreditCardDebt
// ════════════════════════════════════════════════════════════════════════════
describe('calcCreditCardDebt', () => {
  it('returns initial debt with no movements', () => {
    const r = calcCreditCardDebt(mkCard(), [], rates, 'EUR');
    expect(r.debt).toBe(1000);
    expect(r.available).toBe(4000);
    expect(r.utilizationPct).toBe(20);
    expect(r.appliedCount).toBe(0);
  });

  it('expense increases debt, income reduces it', () => {
    const r = calcCreditCardDebt(
      mkCard(),
      [
        mkExpense({ type: 'expense', amount: 200 }),
        mkExpense({ type: 'income', amount: 500 }),
      ],
      rates,
      'EUR'
    );
    expect(r.debt).toBe(700);
    expect(r.appliedCount).toBe(2);
  });

  it('ignores movements ≤ acc.date', () => {
    const r = calcCreditCardDebt(
      mkCard({ date: '2024-02-15' }),
      [mkExpense({ valueDate: '2024-02-15' })],
      rates,
      'EUR'
    );
    expect(r.ignoredCount).toBe(1);
    expect(r.debt).toBe(1000);
  });

  it('excludes movements from other accounts', () => {
    const r = calcCreditCardDebt(
      mkCard(),
      [mkExpense({ accountId: 'other' })],
      rates,
      'EUR'
    );
    expect(r.appliedCount).toBe(0);
  });

  it('clamps debt at 0', () => {
    const r = calcCreditCardDebt(
      mkCard(),
      [mkExpense({ type: 'income', amount: 9999 })],
      rates,
      'EUR'
    );
    expect(r.debt).toBe(0);
  });

  it('clamps utilizationPct at 100', () => {
    const r = calcCreditCardDebt(
      mkCard({ balance: 99_999 }),
      [],
      rates,
      'EUR'
    );
    expect(r.utilizationPct).toBe(100);
  });

  it('returns 0 available and 0 utilization when no creditLimit', () => {
    const r = calcCreditCardDebt(
      mkCard({ creditLimit: undefined }),
      [],
      rates,
      'EUR'
    );
    expect(r.available).toBe(0);
    expect(r.utilizationPct).toBe(0);
  });

  it('converts currency', () => {
    const r = calcCreditCardDebt(
      mkCard(),
      [mkExpense({ amount: 110, currency: 'USD' })],
      rates,
      'EUR'
    );
    expect(r.debt).toBeCloseTo(1100, 5);
  });

  it('falls back to baseCurrency when account.currency missing', () => {
    const r = calcCreditCardDebt(
      mkCard({ currency: undefined as unknown as string }),
      [],
      rates,
      'EUR'
    );
    expect(r.debt).toBe(1000);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  daysUntilDayOfMonth (+ aliases)
// ════════════════════════════════════════════════════════════════════════════
describe('daysUntilDayOfMonth', () => {
  const NOW = new Date(2024, 5, 15); // 15-jun-2024

  it('returns null for invalid targetDay', () => {
    expect(daysUntilDayOfMonth(null, NOW)).toBeNull();
    expect(daysUntilDayOfMonth(undefined, NOW)).toBeNull();
    expect(daysUntilDayOfMonth(0, NOW)).toBeNull();
    expect(daysUntilDayOfMonth(32, NOW)).toBeNull();
  });

  it('returns 0 when targetDay equals today', () => {
    expect(daysUntilDayOfMonth(15, NOW)).toBe(0);
  });

  it('returns positive diff within current month', () => {
    expect(daysUntilDayOfMonth(20, NOW)).toBe(5);
  });

  it('rolls to next month when day already passed', () => {
    // hoy=15, target=5 → 20 días hasta 5-jul
    expect(daysUntilDayOfMonth(5, NOW)).toBe(20);
  });

  it('saturates day 31 to last day of February', () => {
    const feb15 = new Date(2024, 1, 15); // 15-feb-2024 (leap year, last=29)
    // target=31, currentDay=15 ≤ 31 → effectiveDay = min(31, 29) = 29
    expect(daysUntilDayOfMonth(31, feb15)).toBe(14);
  });

  it('saturates day 31 to last day of next month (April → 30)', () => {
    // 28-mar, target=31 → ya pasó este mes? No, marzo tiene 31. Usemos abril:
    const apr15 = new Date(2024, 3, 15);
    // target=31, currentDay=15 ≤ 31 → effectiveDay=min(31,30)=30 → 15 días
    expect(daysUntilDayOfMonth(31, apr15)).toBe(15);
  });

  it('daysUntilBilling reads acc.billingDay', () => {
    expect(daysUntilBilling(mkCard({ billingDay: 20 }), NOW)).toBe(5);
  });

  it('daysUntilPayment reads acc.paymentDueDay', () => {
    expect(daysUntilPayment(mkCard({ paymentDueDay: 20 }), NOW)).toBe(5);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  getCreditHealthScore
// ════════════════════════════════════════════════════════════════════════════
describe('getCreditHealthScore', () => {
  it('< 30% → excellent', () => {
    expect(getCreditHealthScore(20).level).toBe('excellent');
    expect(getCreditHealthScore(0).intent).toBe('success');
  });
  it('30-69% → moderate', () => {
    expect(getCreditHealthScore(30).level).toBe('moderate');
    expect(getCreditHealthScore(69).level).toBe('moderate');
    expect(getCreditHealthScore(50).intent).toBe('warning');
  });
  it('70-89% → high', () => {
    expect(getCreditHealthScore(70).level).toBe('high');
    expect(getCreditHealthScore(89).intent).toBe('danger');
  });
  it('>= 90% → critical', () => {
    expect(getCreditHealthScore(90).level).toBe('critical');
    expect(getCreditHealthScore(100).intent).toBe('critical');
  });
  it('score = 100 - utilización, clampado 0-100', () => {
    // El badge y el tooltip ("Salud financiera: {{score}}/100") mostraban
    // `undefined` porque el tipo no tenía `score` (bug cazado por el type-check).
    expect(getCreditHealthScore(0).score).toBe(100);   // sin deuda → salud máxima
    expect(getCreditHealthScore(30).score).toBe(70);
    expect(getCreditHealthScore(90).score).toBe(10);
    expect(getCreditHealthScore(120).score).toBe(0);   // sobregiro → clamp a 0
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  getCreditHealthColors
// ════════════════════════════════════════════════════════════════════════════
describe('getCreditHealthColors', () => {
  it('returns colors for each intent', () => {
    expect(getCreditHealthColors('critical', T).bar).toBe('#dc2626');
    expect(getCreditHealthColors('danger', T).bar).toBe('#ef4444');
    expect(getCreditHealthColors('warning', T).bar).toBe('#f59e0b');
    expect(getCreditHealthColors('success', T).bar).toBe('#22c55e');
  });

  it('falls back to amberBg/amberBorder if redBg/redBorder missing', () => {
    const T2 = { ...T, redBg: undefined, redBorder: undefined };
    const r = getCreditHealthColors('critical', T2);
    expect(r.bg).toBe('#amberBg');
    expect(r.border).toBe('#amberBorder');
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  calcMinPayment / calcYearlyInterestCost
// ════════════════════════════════════════════════════════════════════════════
describe('calcMinPayment', () => {
  it('returns 0 for invalid inputs', () => {
    expect(calcMinPayment(0, 5)).toBe(0);
    expect(calcMinPayment(1000, 0)).toBe(0);
    expect(calcMinPayment(1000, null)).toBe(0);
    expect(calcMinPayment(1000, undefined)).toBe(0);
  });

  it('applies percentage when above floor', () => {
    expect(calcMinPayment(1000, 5)).toBe(50);
  });

  it('uses floor when percentage falls below', () => {
    expect(calcMinPayment(100, 5)).toBe(10); // 5% = 5 < 10
  });

  it('respects custom floor', () => {
    expect(calcMinPayment(100, 5, 20)).toBe(20);
  });
});

describe('calcYearlyInterestCost', () => {
  it('returns 0 for invalid inputs', () => {
    expect(calcYearlyInterestCost(0, 20)).toBe(0);
    expect(calcYearlyInterestCost(1000, 0)).toBe(0);
    expect(calcYearlyInterestCost(1000, null)).toBe(0);
  });

  it('computes annual interest linearly', () => {
    expect(calcYearlyInterestCost(1000, 20)).toBe(200);
    expect(calcYearlyInterestCost(2500, 24)).toBe(600);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  simulateAmortization
// ════════════════════════════════════════════════════════════════════════════
describe('simulateAmortization', () => {
  it('returns empty for non-positive inputs', () => {
    expect(simulateAmortization(0, 20, 100).feasible).toBe(false);
    expect(simulateAmortization(1000, 20, 0).feasible).toBe(false);
  });

  it('marks unfeasible when payment ≤ first month interest', () => {
    // 1000 @ 24% → 20€/mes. Pago 15 → unfeasible
    const r = simulateAmortization(1000, 24, 15);
    expect(r.feasible).toBe(false);
    expect(r.monthlyInterestFirstMonth).toBeCloseTo(20, 5);
    expect(r.schedule).toEqual([]);
  });

  it('handles 0% APR (pays off in debt/payment months)', () => {
    const r = simulateAmortization(1000, 0, 100);
    expect(r.feasible).toBe(true);
    expect(r.months).toBe(10);
    expect(r.totalInterest).toBe(0);
    expect(r.totalPaid).toBe(1000);
  });

  it('simulates realistic case with positive interest', () => {
    const r = simulateAmortization(1000, 24, 100);
    expect(r.feasible).toBe(true);
    expect(r.months).toBeGreaterThan(10); // pago paciente
    expect(r.totalInterest).toBeGreaterThan(0);
    expect(r.totalPaid).toBeGreaterThan(1000);
    expect(r.schedule[0].startingDebt).toBe(1000);
    expect(r.schedule[r.schedule.length - 1].endingDebt).toBe(0);
  });

  it('last payment adjusts to not overshoot', () => {
    const r = simulateAmortization(1000, 0, 300);
    expect(r.feasible).toBe(true);
    expect(r.months).toBe(4);
    expect(r.schedule[3].payment).toBe(100); // último mes solo lo justo
  });

  it('respects maxMonths cap', () => {
    // Capital enorme con pago apenas superior a intereses → cae al cap
    const r = simulateAmortization(100_000, 24, 2001, 12);
    expect(r.months).toBeLessThanOrEqual(12);
  });

  it('schedule rows: payment ≈ principal + interest', () => {
    const r = simulateAmortization(1000, 24, 100);
    r.schedule.forEach((row) => {
      expect(row.payment).toBeCloseTo(row.principal + row.interest, 5);
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  compareAmortizations
// ════════════════════════════════════════════════════════════════════════════
describe('compareAmortizations', () => {
  it('returns zeros when either is not feasible', () => {
    const base = simulateAmortization(1000, 24, 100);
    const bad = simulateAmortization(1000, 24, 15);
    expect(compareAmortizations(base, bad)).toEqual({
      interestSaved: 0,
      monthsSaved: 0,
    });
  });

  it('computes savings of better scenario', () => {
    const base = simulateAmortization(1000, 24, 50);
    const better = simulateAmortization(1000, 24, 150);
    const r = compareAmortizations(base, better);
    expect(r.interestSaved).toBeGreaterThan(0);
    expect(r.monthsSaved).toBeGreaterThan(0);
  });

  it('clamps savings to ≥ 0 (better is actually worse)', () => {
    const base = simulateAmortization(1000, 24, 150);
    const worse = simulateAmortization(1000, 24, 100);
    const r = compareAmortizations(base, worse);
    expect(r.interestSaved).toBe(0);
    expect(r.monthsSaved).toBe(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  calcDebtHistory
// ════════════════════════════════════════════════════════════════════════════
describe('calcDebtHistory', () => {
  const NOW = new Date(2024, 5, 15);

  it('returns [] for non-credit_card account', () => {
    const r = calcDebtHistory(
      mkCard({ accountType: 'bank' as Account['accountType'] }),
      [],
      rates,
      'EUR',
      6,
      NOW
    );
    expect(r).toEqual([]);
  });

  it('returns [] for invalid acc.date', () => {
    const r = calcDebtHistory(
      mkCard({ date: 'invalid' }),
      [],
      rates,
      'EUR',
      6,
      NOW
    );
    expect(r).toEqual([]);
  });

  it('generates one point per month from acc.date to current', () => {
    const r = calcDebtHistory(mkCard(), [], rates, 'EUR', 12, NOW);
    // ene→jun = 6 meses
    expect(r).toHaveLength(6);
    expect(r[0].monthKey).toBe('2024-01');
    expect(r[5].monthKey).toBe('2024-06');
  });

  it('trims to last `monthsBack` months', () => {
    const r = calcDebtHistory(mkCard(), [], rates, 'EUR', 3, NOW);
    expect(r).toHaveLength(3);
    expect(r[0].monthKey).toBe('2024-04');
    expect(r[2].monthKey).toBe('2024-06');
  });

  it('aggregates expenses and payments per month', () => {
    const r = calcDebtHistory(
      mkCard(),
      [
        mkExpense({ type: 'expense', amount: 200, valueDate: '2024-02-10' }),
        mkExpense({ type: 'income', amount: 50, valueDate: '2024-02-20' }),
        mkExpense({ type: 'expense', amount: 100, valueDate: '2024-03-05' }),
      ],
      rates,
      'EUR',
      12,
      NOW
    );
    const feb = r.find((p) => p.monthKey === '2024-02')!;
    expect(feb.expenses).toBe(200);
    expect(feb.payments).toBe(50);
    expect(feb.endingDebt).toBe(1000 + 200 - 50); // 1150
    const mar = r.find((p) => p.monthKey === '2024-03')!;
    expect(mar.endingDebt).toBe(1150 + 100); // 1250
  });

  it('clamps endingDebt at 0', () => {
    const r = calcDebtHistory(
      mkCard({ balance: 100 }),
      [mkExpense({ type: 'income', amount: 999, valueDate: '2024-02-15' })],
      rates,
      'EUR',
      12,
      NOW
    );
    const feb = r.find((p) => p.monthKey === '2024-02')!;
    expect(feb.endingDebt).toBe(0);
  });

  it('computes utilizationPct from creditLimit', () => {
    const r = calcDebtHistory(
      mkCard({ balance: 2500 }),
      [],
      rates,
      'EUR',
      12,
      NOW
    );
    expect(r[0].utilizationPct).toBe(50); // 2500 / 5000
  });

  it('returns utilizationPct=0 when no creditLimit', () => {
    const r = calcDebtHistory(
      mkCard({ creditLimit: undefined }),
      [],
      rates,
      'EUR',
      12,
      NOW
    );
    expect(r[0].utilizationPct).toBe(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  calcHealthScore (5 factores, 100 pts)
// ════════════════════════════════════════════════════════════════════════════
describe('calcHealthScore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 5, 1)); // 1-jun, así paymentDueDay=10 → 9 días
  });
  afterEach(() => vi.useRealTimers());

  const mkHistory = (
    debts: number[],
    payments: number[] = []
  ) =>
    debts.map((d, i) => ({
      monthLabel: `m${i}`,
      endingDebt: d,
      expenses: 100,
      payments: payments[i] ?? 100,
    }));

  it('zero debt yields top score', () => {
    const r = calcHealthScore(
      mkCard(),
      mkHistory([0, 0, 0]),
      0,
      0
    );
    expect(r.score).toBeGreaterThanOrEqual(80);
    expect(r.level).toBe('excellent');
  });

  it('utilization factor: < 30% → 35 pts', () => {
    const r = calcHealthScore(mkCard(), [], 20, 500);
    expect(r.factors[0].score).toBe(35);
  });

  it('utilization factor: 30-49% → 25 pts', () => {
    const r = calcHealthScore(mkCard(), [], 40, 500);
    expect(r.factors[0].score).toBe(25);
  });

  it('utilization factor: 50-69% → 15 pts', () => {
    const r = calcHealthScore(mkCard(), [], 60, 500);
    expect(r.factors[0].score).toBe(15);
  });

  it('utilization factor: 70-89% → 5 pts', () => {
    const r = calcHealthScore(mkCard(), [], 80, 500);
    expect(r.factors[0].score).toBe(5);
  });

  it('utilization factor: >= 90% → 0 pts', () => {
    const r = calcHealthScore(mkCard(), [], 95, 500);
    expect(r.factors[0].score).toBe(0);
  });

  it('trend factor: insufficient history → 12 pts (neutral)', () => {
    const r = calcHealthScore(mkCard(), [], 50, 500);
    expect(r.factors[1].score).toBe(12);
  });

  it('trend factor: strong decrease → 25 pts', () => {
    const r = calcHealthScore(
      mkCard(),
      mkHistory([1000, 800, 700]),
      50,
      500
    );
    expect(r.factors[1].score).toBe(25); // -50% > -20%
  });

  it('trend factor: mild decrease → 20 pts', () => {
    const r = calcHealthScore(
      mkCard(),
      mkHistory([1000, 950, 900]),
      50,
      500
    );
    expect(r.factors[1].score).toBe(20); // -10% está entre -20 y -5
  });

  it('trend factor: stable → 12 pts', () => {
    const r = calcHealthScore(
      mkCard(),
      mkHistory([1000, 1010, 1020]),
      50,
      500
    );
    expect(r.factors[1].score).toBe(12); // +2%
  });

  it('trend factor: rising → 6 pts', () => {
    const r = calcHealthScore(
      mkCard(),
      mkHistory([1000, 1050, 1100]),
      50,
      500
    );
    expect(r.factors[1].score).toBe(6); // +10%
  });

  it('trend factor: rising fast → 0 pts', () => {
    const r = calcHealthScore(
      mkCard(),
      mkHistory([1000, 1200, 1400]),
      50,
      500
    );
    expect(r.factors[1].score).toBe(0); // +40%
  });

  it('trend factor: oldest debt 0 → pctChange=0 → stable', () => {
    const r = calcHealthScore(
      mkCard(),
      mkHistory([0, 100, 200]),
      50,
      500
    );
    // delta=200, oldest=0 → pctChange=0 → stable bucket
    expect(r.factors[1].score).toBe(12);
  });

  it('paymentMargin factor: no payment day → 8 pts', () => {
    const r = calcHealthScore(
      mkCard({ paymentDueDay: undefined }),
      [],
      50,
      500
    );
    expect(r.factors[2].score).toBe(8);
  });

  it('paymentMargin factor: ≥14 days → 15 pts', () => {
    // hoy=1-jun, paymentDueDay=20 → 19 días
    const r = calcHealthScore(
      mkCard({ paymentDueDay: 20 }),
      [],
      50,
      500
    );
    expect(r.factors[2].score).toBe(15);
  });

  it('paymentMargin factor: 7-13 days → 12 pts', () => {
    // hoy=1-jun, paymentDueDay=10 → 9 días
    const r = calcHealthScore(
      mkCard({ paymentDueDay: 10 }),
      [],
      50,
      500
    );
    expect(r.factors[2].score).toBe(12);
  });

  it('paymentMargin factor: 3-6 days → 6 pts', () => {
    // hoy=1-jun, paymentDueDay=5 → 4 días
    const r = calcHealthScore(
      mkCard({ paymentDueDay: 5 }),
      [],
      50,
      500
    );
    expect(r.factors[2].score).toBe(6);
  });

  it('paymentMargin factor: < 3 days → 0 pts', () => {
    // hoy=1-jun, paymentDueDay=2 → 1 día
    const r = calcHealthScore(
      mkCard({ paymentDueDay: 2 }),
      [],
      50,
      500
    );
    expect(r.factors[2].score).toBe(0);
  });

  it('interestCost factor: no rate → 8 pts (neutral)', () => {
    const r = calcHealthScore(
      mkCard({ interestRate: undefined }),
      [],
      50,
      500
    );
    expect(r.factors[3].score).toBe(8);
  });

  it('interestCost factor: TAE ≤12 → 15 pts', () => {
    const r = calcHealthScore(
      mkCard({ interestRate: 10 }),
      [],
      50,
      500
    );
    expect(r.factors[3].score).toBe(15);
  });

  it('interestCost factor: TAE ≤20 → 10 pts', () => {
    const r = calcHealthScore(
      mkCard({ interestRate: 18 }),
      [],
      50,
      500
    );
    expect(r.factors[3].score).toBe(10);
  });

  it('interestCost factor: TAE ≤28 → 5 pts', () => {
    const r = calcHealthScore(
      mkCard({ interestRate: 25 }),
      [],
      50,
      500
    );
    expect(r.factors[3].score).toBe(5);
  });

  it('interestCost factor: TAE > 28 → 0 pts', () => {
    const r = calcHealthScore(
      mkCard({ interestRate: 30 }),
      [],
      50,
      500
    );
    expect(r.factors[3].score).toBe(0);
  });

  it('consistency factor: empty history → 5 pts', () => {
    const r = calcHealthScore(mkCard(), [], 50, 500);
    expect(r.factors[4].score).toBe(5);
  });

  it('consistency factor: ≥80% months with payments → 10 pts', () => {
    const r = calcHealthScore(
      mkCard(),
      mkHistory([100, 100, 100, 100, 100], [50, 50, 50, 50, 50]),
      50,
      500
    );
    expect(r.factors[4].score).toBe(10);
  });

  it('consistency factor: ≥50% → 7 pts', () => {
    const r = calcHealthScore(
      mkCard(),
      mkHistory([100, 100, 100, 100], [50, 50, 0, 0]),
      50,
      500
    );
    expect(r.factors[4].score).toBe(7);
  });

  it('consistency factor: ≥25% → 3 pts', () => {
    const r = calcHealthScore(
      mkCard(),
      mkHistory([100, 100, 100, 100], [50, 0, 0, 0]),
      50,
      500
    );
    expect(r.factors[4].score).toBe(3);
  });

  it('consistency factor: 0% → 0 pts', () => {
    const r = calcHealthScore(
      mkCard(),
      mkHistory([100, 100, 100, 100], [0, 0, 0, 0]),
      50,
      500
    );
    expect(r.factors[4].score).toBe(0);
  });

  it('overall level: < 40 → poor/critical', () => {
    const r = calcHealthScore(
      mkCard({ interestRate: 30, paymentDueDay: 2 }),
      mkHistory([1000, 1200, 1400], [0, 0, 0]),
      95,
      500
    );
    expect(r.level).toBe('poor');
    expect(r.intent).toBe('critical');
  });

  it('overall level: 60-79 → good', () => {
    const r = calcHealthScore(
      mkCard({ interestRate: 18, paymentDueDay: 10 }),
      mkHistory([1000, 950, 900], [100, 100, 100]),
      40,
      500
    );
    expect(r.level).toBe('good');
  });

  it('always exposes 5 factors summing to score', () => {
    const r = calcHealthScore(mkCard(), mkHistory([100, 200]), 25, 200);
    expect(r.factors).toHaveLength(5);
    const sum = r.factors.reduce((s, f) => s + f.score, 0);
    expect(sum).toBe(r.score);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  calcHistoricalMetrics
// ════════════════════════════════════════════════════════════════════════════
describe('calcHistoricalMetrics', () => {
  it('returns zeros for empty history', () => {
    const r = calcHistoricalMetrics([], 20, 5);
    expect(r.totalPaid).toBe(0);
    expect(r.hasEnoughData).toBe(false);
    expect(r.peakMonth).toBeNull();
  });

  it('aggregates totalPaid and totalSpent', () => {
    const r = calcHistoricalMetrics(
      [
        { monthLabel: 'ene', endingDebt: 100, expenses: 200, payments: 100 },
        { monthLabel: 'feb', endingDebt: 50, expenses: 50, payments: 100 },
      ],
      20,
      5
    );
    expect(r.totalPaid).toBe(200);
    expect(r.totalSpent).toBe(250);
  });

  it('identifies peak month by expenses', () => {
    const r = calcHistoricalMetrics(
      [
        { monthLabel: 'ene', endingDebt: 100, expenses: 50, payments: 0 },
        { monthLabel: 'feb', endingDebt: 200, expenses: 500, payments: 0 },
        { monthLabel: 'mar', endingDebt: 150, expenses: 100, payments: 50 },
      ],
      20,
      5
    );
    expect(r.peakMonth?.label).toBe('feb');
    expect(r.peakMonth?.amount).toBe(500);
  });

  it('peakMonth is null when no expenses', () => {
    const r = calcHistoricalMetrics(
      [{ monthLabel: 'ene', endingDebt: 0, expenses: 0, payments: 100 }],
      20,
      5
    );
    expect(r.peakMonth).toBeNull();
  });

  it('hasEnoughData=true when ≥2 months with activity', () => {
    const r = calcHistoricalMetrics(
      [
        { monthLabel: 'ene', endingDebt: 100, expenses: 100, payments: 0 },
        { monthLabel: 'feb', endingDebt: 50, expenses: 0, payments: 50 },
      ],
      20,
      5
    );
    expect(r.hasEnoughData).toBe(true);
  });

  it('hasEnoughData=false with only 1 active month', () => {
    const r = calcHistoricalMetrics(
      [
        { monthLabel: 'ene', endingDebt: 100, expenses: 100, payments: 0 },
        { monthLabel: 'feb', endingDebt: 100, expenses: 0, payments: 0 },
      ],
      20,
      5
    );
    expect(r.hasEnoughData).toBe(false);
  });

  it('estimates interest when rate > 0', () => {
    const r = calcHistoricalMetrics(
      [
        { monthLabel: 'ene', endingDebt: 1000, expenses: 0, payments: 0 },
        { monthLabel: 'feb', endingDebt: 1000, expenses: 0, payments: 0 },
      ],
      24,
      5
    );
    expect(r.estimatedInterestPaid).toBeGreaterThan(0);
  });

  it('no interest estimation when rate is 0 or missing', () => {
    const r = calcHistoricalMetrics(
      [
        { monthLabel: 'ene', endingDebt: 1000, expenses: 0, payments: 0 },
        { monthLabel: 'feb', endingDebt: 1000, expenses: 0, payments: 0 },
      ],
      0,
      5
    );
    expect(r.estimatedInterestPaid).toBe(0);
  });

  it('computes savedVsMinimum when paying above minimum', () => {
    const r = calcHistoricalMetrics(
      [
        { monthLabel: 'ene', endingDebt: 800, expenses: 0, payments: 200 },
        { monthLabel: 'feb', endingDebt: 600, expenses: 0, payments: 200 },
      ],
      24,
      5
    );
    expect(r.savedVsMinimum).toBeGreaterThan(0);
  });

  it('savedVsMinimum=0 when minPct not set', () => {
    const r = calcHistoricalMetrics(
      [
        { monthLabel: 'ene', endingDebt: 800, expenses: 0, payments: 200 },
      ],
      24,
      null
    );
    expect(r.savedVsMinimum).toBe(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  calcTopCategoriesForCard
// ════════════════════════════════════════════════════════════════════════════
describe('calcTopCategoriesForCard', () => {
  const categories = [
    { id: 'cat-1', name: 'Comida', color: '#aaa', icon: '🍔' },
    { id: 'cat-2', name: 'Ocio', color: '#bbb', icon: '🎬' },
    { id: 'cat-3', name: 'Transporte', color: '#ccc', icon: '🚗' },
  ] as any[];

  it('returns hasData=false when no expenses', () => {
    const r = calcTopCategoriesForCard(mkCard(), [], categories, rates, 'EUR');
    expect(r.hasData).toBe(false);
    expect(r.topCategories).toEqual([]);
    expect(r.totalSpent).toBe(0);
  });

  it('groups expenses by category and sorts desc', () => {
    const r = calcTopCategoriesForCard(
      mkCard(),
      [
        mkExpense({ categoryId: 'cat-1', amount: 100, valueDate: '2024-02-10' }),
        mkExpense({ categoryId: 'cat-2', amount: 300, valueDate: '2024-02-15' }),
        mkExpense({ categoryId: 'cat-1', amount: 50, valueDate: '2024-03-01' }),
      ],
      categories,
      rates,
      'EUR'
    );
    expect(r.hasData).toBe(true);
    expect(r.totalSpent).toBe(450);
    expect(r.topCategories[0].categoryId).toBe('cat-2'); // 300
    expect(r.topCategories[0].amount).toBe(300);
    expect(r.topCategories[1].categoryId).toBe('cat-1');
    expect(r.topCategories[1].amount).toBe(150);
    expect(r.topCategories[1].movementCount).toBe(2);
  });

  it('computes correct percentages', () => {
    const r = calcTopCategoriesForCard(
      mkCard(),
      [
        mkExpense({ categoryId: 'cat-1', amount: 300, valueDate: '2024-02-10' }),
        mkExpense({ categoryId: 'cat-2', amount: 100, valueDate: '2024-02-15' }),
      ],
      categories,
      rates,
      'EUR'
    );
    expect(r.topCategories[0].pct).toBe(75);
    expect(r.topCategories[1].pct).toBe(25);
  });

  it('excludes income, transfers, other accounts, and pre-base movements', () => {
    const r = calcTopCategoriesForCard(
      mkCard(),
      [
        mkExpense({ type: 'income', amount: 999, valueDate: '2024-02-10' }),
        mkExpense({ isTransfer: true, amount: 999, valueDate: '2024-02-10' } as Partial<RealExpense>),
        mkExpense({ accountId: 'other', amount: 999, valueDate: '2024-02-10' }),
        mkExpense({ valueDate: '2024-01-01' }), // ≤ acc.date
        mkExpense({ categoryId: 'cat-1', amount: 50, valueDate: '2024-02-10' }),
      ],
      categories,
      rates,
      'EUR'
    );
    expect(r.totalSpent).toBe(50);
    expect(r.topCategories).toHaveLength(1);
  });

  it('limits to topN categories', () => {
    const r = calcTopCategoriesForCard(
      mkCard(),
      [
        mkExpense({ id: 'e1', categoryId: 'cat-1', amount: 100, valueDate: '2024-02-10' }),
        mkExpense({ id: 'e2', categoryId: 'cat-2', amount: 200, valueDate: '2024-02-10' }),
        mkExpense({ id: 'e3', categoryId: 'cat-3', amount: 300, valueDate: '2024-02-10' }),
      ],
      categories,
      rates,
      'EUR',
      2
    );
    expect(r.topCategories).toHaveLength(2);
  });

  it('handles uncategorized expenses', () => {
    const r = calcTopCategoriesForCard(
      mkCard(),
      [
        mkExpense({ categoryId: '', amount: 75, valueDate: '2024-02-10' }),
      ],
      categories,
      rates,
      'EUR'
    );
    expect(r.uncategorizedAmount).toBe(75);
    expect(r.topCategories[0].categoryName).toBe('Sin categoría');
  });

  it('uses baseCurrency when account.currency missing', () => {
    const r = calcTopCategoriesForCard(
      mkCard({ currency: undefined as unknown as string }),
      [mkExpense({ categoryId: 'cat-1', amount: 100, valueDate: '2024-02-10' })],
      categories,
      rates,
      'EUR'
    );
    expect(r.totalSpent).toBe(100);
  });
});
