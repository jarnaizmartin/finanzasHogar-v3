import { describe, it, expect } from 'vitest';
import {
  calcLoanDebt,
  estimateLoanInterest,
  calcLoanProgress,
  getLoanTypeLabel,
  getLoanTypeIcon,
  calcLoanPayment,
  calcLoanTerm,
  calcRemainingInterest,
  generateAmortizationSchedule,
  downsampleSchedule,
  simulateAmortization,
  MAX_LOAN_MONTHS,
} from '../loanUtils';
import type { Account, RealExpense } from '../../types';

// ─── Builders ────────────────────────────────────────────────────────────────
const mkLoan = (overrides: Partial<Account> = {}): Account =>
  ({
    id: 'loan-1',
    name: 'Hipoteca',
    type: 'loan',
    balance: 100_000,
    currency: 'EUR',
    date: '2024-01-01',
    loanType: 'mortgage',
    interestRate: 3,
    monthlyPayment: 500,
    paymentsRemaining: 240,
    ...overrides,
  } as unknown as Account);

const mkExpense = (overrides: Partial<RealExpense> = {}): RealExpense =>
  ({
    id: 'e1',
    accountId: 'loan-1',
    categoryId: 'cat-1',
    type: 'income',
    amount: 500,
    currency: 'EUR',
    valueDate: '2024-02-15',
    ...overrides,
  } as RealExpense);

const rates = { USD: 1.1 };

// ════════════════════════════════════════════════════════════════════════════
//  calcLoanDebt
// ════════════════════════════════════════════════════════════════════════════
describe('calcLoanDebt', () => {
  it('returns initial debt with no movements', () => {
    const r = calcLoanDebt(mkLoan(), [], rates, 'EUR');
    expect(r.debt).toBe(100_000);
    expect(r.initialDebt).toBe(100_000);
    expect(r.appliedCount).toBe(0);
    expect(r.ignoredCount).toBe(0);
  });

  it('reduces debt by capital-only portion when rate > 0', () => {
    // interestRate: 3, debt: 100_000 → monthly interest = 100_000 * 3/100/12 = 250
    // capital = 500 - 250 = 250 → new debt = 99_750
    const r = calcLoanDebt(
      mkLoan(),
      [mkExpense({ type: 'income', amount: 500 })],
      rates,
      'EUR'
    );
    expect(r.debt).toBeCloseTo(99_750, 5);
    expect(r.appliedCount).toBe(1);
  });

  it('reduces debt by full amount when rate is 0', () => {
    const r = calcLoanDebt(
      mkLoan({ interestRate: 0 }),
      [mkExpense({ type: 'income', amount: 500 })],
      rates,
      'EUR'
    );
    expect(r.debt).toBe(99_500);
    expect(r.appliedCount).toBe(1);
  });

  it('payment below monthly interest does not reduce principal', () => {
    // interestRate: 3, debt: 100_000 → interest = 250; payment 100 < 250 → capital = 0
    const r = calcLoanDebt(
      mkLoan(),
      [mkExpense({ type: 'income', amount: 100 })],
      rates,
      'EUR'
    );
    expect(r.debt).toBe(100_000);
  });

  it('increases debt with expense movements', () => {
    const r = calcLoanDebt(
      mkLoan(),
      [mkExpense({ type: 'expense', amount: 200 })],
      rates,
      'EUR'
    );
    expect(r.debt).toBe(100_200);
  });

  it('ignores movements on or before account date', () => {
    const r = calcLoanDebt(
      mkLoan({ date: '2024-02-15' }),
      [
        mkExpense({ valueDate: '2024-02-15' }), // ==
        mkExpense({ valueDate: '2024-01-01' }), // <
      ],
      rates,
      'EUR'
    );
    expect(r.debt).toBe(100_000);
    expect(r.ignoredCount).toBe(2);
    expect(r.appliedCount).toBe(0);
  });

  it('excludes movements from other accounts', () => {
    const r = calcLoanDebt(
      mkLoan(),
      [mkExpense({ accountId: 'other', amount: 9999 })],
      rates,
      'EUR'
    );
    expect(r.debt).toBe(100_000);
    expect(r.appliedCount).toBe(0);
    expect(r.ignoredCount).toBe(0);
  });

  it('converts currency before splitting capital/interest', () => {
    // 550 USD / 1.1 = 500 EUR; interest = 250; capital = 250 → debt = 99_750
    const r = calcLoanDebt(
      mkLoan(),
      [mkExpense({ amount: 550, currency: 'USD' })],
      rates,
      'EUR'
    );
    expect(r.debt).toBeCloseTo(99_750, 5);
  });

  it('clamps debt at 0 (no negative debt)', () => {
    const r = calcLoanDebt(
      mkLoan({ balance: 100 }),
      [mkExpense({ amount: 500 })],
      rates,
      'EUR'
    );
    expect(r.debt).toBe(0);
  });

  it('falls back to baseCurrency when account.currency missing', () => {
    // Use interestRate 0 to isolate the currency-fallback behavior
    const acc = mkLoan({ currency: undefined as unknown as string, interestRate: 0 });
    const r = calcLoanDebt(
      acc,
      [mkExpense({ amount: 100 })],
      rates,
      'EUR'
    );
    expect(r.debt).toBe(99_900);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  estimateLoanInterest
// ════════════════════════════════════════════════════════════════════════════
describe('estimateLoanInterest', () => {
  it('computes yearly and monthly interest with valid inputs', () => {
    const r = estimateLoanInterest(mkLoan({ interestRate: 3, monthlyPayment: 500 }), 100_000);
    expect(r.yearlyInterest).toBeCloseTo(3000, 5);
    expect(r.monthlyInterest).toBeCloseTo(250, 5);
    expect(r.monthlyPrincipal).toBeCloseTo(250, 5);
    expect(r.hasEnoughData).toBe(true);
  });

  it('returns hasEnoughData=false when interest rate is 0', () => {
    const r = estimateLoanInterest(mkLoan({ interestRate: 0 }), 100_000);
    expect(r.hasEnoughData).toBe(false);
    expect(r.monthlyPrincipal).toBe(500); // = cuota
  });

  it('returns hasEnoughData=false when monthlyPayment is 0', () => {
    const r = estimateLoanInterest(mkLoan({ monthlyPayment: 0 }), 100_000);
    expect(r.hasEnoughData).toBe(false);
  });

  it('returns hasEnoughData=false when debt is 0', () => {
    const r = estimateLoanInterest(mkLoan(), 0);
    expect(r.hasEnoughData).toBe(false);
  });

  it('clamps monthlyPrincipal to 0 if interest exceeds payment', () => {
    // 100k @ 30% → mensual = 2500. Cuota 500 → principal=0
    const r = estimateLoanInterest(
      mkLoan({ interestRate: 30, monthlyPayment: 500 }),
      100_000
    );
    expect(r.monthlyPrincipal).toBe(0);
  });

  it('treats missing interestRate as 0 (no data)', () => {
    const acc = mkLoan({ interestRate: undefined as unknown as number });
    const r = estimateLoanInterest(acc, 100_000);
    expect(r.hasEnoughData).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  calcLoanProgress
// ════════════════════════════════════════════════════════════════════════════
describe('calcLoanProgress', () => {
  it('returns 0% and nulls when paymentsRemaining is missing or 0 and no debt data', () => {
    expect(calcLoanProgress(mkLoan({ paymentsRemaining: undefined }), 5)).toEqual({
      paidPct: 0,
      monthsToFinish: null,
      estimatedEndDate: null,
    });
    expect(calcLoanProgress(mkLoan({ paymentsRemaining: 0 }), 5)).toEqual({
      paidPct: 0,
      monthsToFinish: null,
      estimatedEndDate: null,
    });
  });

  it('computes paidPct based on capital paid (initialDebt - currentDebt) / initialDebt', () => {
    // initial=100k, current=25k → 75% pagado, independientemente de cuotas aplicadas
    const r = calcLoanProgress(mkLoan({ paymentsRemaining: 180 }), 60, 100_000, 25_000);
    expect(r.paidPct).toBeCloseTo(75, 5);
    expect(r.monthsToFinish).toBe(180);
    expect(r.estimatedEndDate).toMatch(/^\d{4}-\d{2}$/);
  });

  it('reflects real % even after a single massive amortization (regression test)', () => {
    // Caso real del bug: 1 sola amortización masiva → 64% pagado, no 10%
    const r = calcLoanProgress(mkLoan({ paymentsRemaining: 81 }), 9, 245_665.54, 87_265.54);
    expect(r.paidPct).toBeCloseTo(64.48, 1);
  });

  it('returns 0% when no capital data is provided', () => {
    const r = calcLoanProgress(mkLoan({ paymentsRemaining: 180 }), 60);
    expect(r.paidPct).toBe(0);
    expect(r.monthsToFinish).toBe(180);
  });

  it('returns 100% when currentDebt is 0', () => {
    const r = calcLoanProgress(mkLoan({ paymentsRemaining: 180 }), 60, 100_000, 0);
    expect(r.paidPct).toBe(100);
  });

  it('clamps paidPct to [0, 100]', () => {
    // currentDebt > initialDebt (caso patológico) → no debe pasar de 0
    const r = calcLoanProgress(mkLoan({ paymentsRemaining: 1 }), 0, 100_000, 120_000);
    expect(r.paidPct).toBeGreaterThanOrEqual(0);
    expect(r.paidPct).toBeLessThanOrEqual(100);
  });

  it('returns endDate in YYYY-MM format', () => {
    const r = calcLoanProgress(mkLoan({ paymentsRemaining: 12 }), 0, 100_000, 50_000);
    expect(r.estimatedEndDate).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  getLoanTypeLabel / getLoanTypeIcon
// ════════════════════════════════════════════════════════════════════════════
describe('getLoanTypeLabel', () => {
  it('returns Hipoteca for mortgage', () => {
    expect(getLoanTypeLabel('mortgage')).toBe('Hipoteca');
  });
  it('returns Préstamo personal for personal', () => {
    expect(getLoanTypeLabel('personal')).toBe('Préstamo personal');
  });
  it('returns generic Préstamo for unknown/undefined', () => {
    expect(getLoanTypeLabel(undefined as unknown as Account['loanType'])).toBe('Préstamo');
    expect(getLoanTypeLabel('other' as Account['loanType'])).toBe('Préstamo');
  });
});

describe('getLoanTypeIcon', () => {
  it('returns expected icons', () => {
    expect(getLoanTypeIcon('mortgage')).toBe('🏠');
    expect(getLoanTypeIcon('personal')).toBe('💰');
    expect(getLoanTypeIcon(undefined as unknown as Account['loanType'])).toBe('💸');
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  calcLoanPayment
// ════════════════════════════════════════════════════════════════════════════
describe('calcLoanPayment', () => {
  it('returns 0 for non-positive n', () => {
    expect(calcLoanPayment(100_000, 3, 0)).toBe(0);
    expect(calcLoanPayment(100_000, 3, -5)).toBe(0);
  });

  it('returns 0 for non-finite n', () => {
    expect(calcLoanPayment(100_000, 3, Infinity)).toBe(0);
  });

  it('returns 0 for non-positive principal', () => {
    expect(calcLoanPayment(0, 3, 240)).toBe(0);
  });

  it('splits principal evenly when rate is 0', () => {
    expect(calcLoanPayment(12_000, 0, 12)).toBe(1000);
  });

  it('computes french-method payment for known case', () => {
    // 100k @ 3% / 240 cuotas → ~554.60
    const r = calcLoanPayment(100_000, 3, 240);
    expect(r).toBeGreaterThan(554);
    expect(r).toBeLessThan(556);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  calcLoanTerm
// ════════════════════════════════════════════════════════════════════════════
describe('calcLoanTerm', () => {
  it('returns 0 for non-positive payment or principal', () => {
    expect(calcLoanTerm(100_000, 3, 0)).toBe(0);
    expect(calcLoanTerm(0, 3, 500)).toBe(0);
  });

  it('returns Infinity when payment <= interest accrual', () => {
    // 100k @ 12% mensual = 1000. Cuota 100 → imposible
    expect(calcLoanTerm(100_000, 12, 100)).toBe(Infinity);
  });

  it('handles 0% rate as ceil(principal / payment)', () => {
    expect(calcLoanTerm(10_000, 0, 1000)).toBe(10);
    expect(calcLoanTerm(10_500, 0, 1000)).toBe(11);
  });

  it('computes term for realistic case', () => {
    // 100k @ 3%, cuota 554.60 → ~240 meses
    const r = calcLoanTerm(100_000, 3, 554.6);
    expect(r).toBeGreaterThan(238);
    expect(r).toBeLessThan(242);
  });

  it('caps at MAX_LOAN_MONTHS', () => {
    // Capital enorme con cuota apenas superior a intereses → caps
    const r = calcLoanTerm(1_000_000, 1, 1000);
    expect(r).toBeLessThanOrEqual(MAX_LOAN_MONTHS);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  calcRemainingInterest
// ════════════════════════════════════════════════════════════════════════════
describe('calcRemainingInterest', () => {
  it('returns 0 for non-positive n or principal', () => {
    expect(calcRemainingInterest(100_000, 3, 0)).toBe(0);
    expect(calcRemainingInterest(0, 3, 240)).toBe(0);
  });

  it('returns Infinity when n is Infinity', () => {
    expect(calcRemainingInterest(100_000, 3, Infinity)).toBe(Infinity);
  });

  it('computes positive interest for normal case', () => {
    // 100k @ 3% / 240 → cuota ~554.60, total pagado ~133k → intereses ~33k
    const r = calcRemainingInterest(100_000, 3, 240);
    expect(r).toBeGreaterThan(30_000);
    expect(r).toBeLessThan(40_000);
  });

  it('returns 0 for 0% rate', () => {
    const r = calcRemainingInterest(12_000, 0, 12);
    expect(r).toBeCloseTo(0, 5);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  generateAmortizationSchedule
// ════════════════════════════════════════════════════════════════════════════
describe('generateAmortizationSchedule', () => {
  it('returns empty for non-positive n or principal', () => {
    expect(generateAmortizationSchedule(100_000, 3, 0)).toEqual([]);
    expect(generateAmortizationSchedule(0, 3, 240)).toEqual([]);
  });

  it('returns empty for n = Infinity', () => {
    expect(generateAmortizationSchedule(100_000, 3, Infinity)).toEqual([]);
  });

  it('generates a schedule of expected length', () => {
    const s = generateAmortizationSchedule(100_000, 3, 240);
    expect(s.length).toBeGreaterThan(230);
    expect(s.length).toBeLessThanOrEqual(240);
  });

  it('first month: balance reduces, interest > 0', () => {
    const s = generateAmortizationSchedule(100_000, 3, 240);
    expect(s[0].month).toBe(1);
    expect(s[0].interest).toBeGreaterThan(0);
    expect(s[0].principal).toBeGreaterThan(0);
    expect(s[0].balance).toBeLessThan(100_000);
  });

  it('last month: balance is ~0', () => {
    const s = generateAmortizationSchedule(100_000, 3, 240);
    expect(s[s.length - 1].balance).toBeLessThanOrEqual(0.02);
  });

  it('payment ≈ principal + interest each month', () => {
    const s = generateAmortizationSchedule(100_000, 3, 240);
    s.forEach((row) => {
      expect(row.payment).toBeCloseTo(row.principal + row.interest, 5);
    });
  });

  it('respects MAX_LOAN_MONTHS cap', () => {
    const s = generateAmortizationSchedule(1_000_000, 0.01, 5000);
    expect(s.length).toBeLessThanOrEqual(MAX_LOAN_MONTHS);
  });

  it('handles 0% rate with even principal split', () => {
    const s = generateAmortizationSchedule(12_000, 0, 12);
    expect(s).toHaveLength(12);
    s.forEach((row) => {
      expect(row.interest).toBe(0);
      expect(row.principal).toBeCloseTo(1000, 5);
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  downsampleSchedule
// ════════════════════════════════════════════════════════════════════════════
describe('downsampleSchedule', () => {
  it('returns input unchanged when length <= maxPoints', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(downsampleSchedule(arr, 10)).toEqual(arr);
    expect(downsampleSchedule(arr, 5)).toEqual(arr);
  });

  it('reduces a large array to ~maxPoints', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    const out = downsampleSchedule(arr, 100);
    expect(out.length).toBeGreaterThanOrEqual(100);
    expect(out.length).toBeLessThanOrEqual(101); // +1 por el último forzado
  });

  it('always includes first and last elements', () => {
    const arr = Array.from({ length: 500 }, (_, i) => i);
    const out = downsampleSchedule(arr, 50);
    expect(out[0]).toBe(0);
    expect(out[out.length - 1]).toBe(499);
  });

  it('uses default maxPoints=120 when not provided', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    const out = downsampleSchedule(arr);
    expect(out.length).toBeLessThanOrEqual(121);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  simulateAmortization
// ════════════════════════════════════════════════════════════════════════════
describe('simulateAmortization', () => {
  const baseOpts = {
    currentPrincipal: 100_000,
    annualRatePct: 3,
    currentPayment: 554.6,
    currentTerm: 240,
    feePct: 0,
  };

  it('rejects amortizationAmount <= 0', () => {
    const r = simulateAmortization({
      ...baseOpts,
      amortizationAmount: 0,
      mode: 'reduce_payment',
    });
    expect(r.isValid).toBe(false);
    expect(r.errorMsg).toContain('mayor que 0');
  });

  it('treats amount >= principal as full liquidation', () => {
    const r = simulateAmortization({
      ...baseOpts,
      amortizationAmount: 100_000,
      mode: 'reduce_payment',
    });
    expect(r.isValid).toBe(true);
    expect(r.newPrincipal).toBe(0);
    expect(r.newPayment).toBe(0);
    expect(r.newTerm).toBe(0);
    expect(r.monthsSaved).toBe(240);
  });

  it('treats amount > principal as full liquidation', () => {
    const r = simulateAmortization({
      ...baseOpts,
      amortizationAmount: 150_000,
      mode: 'reduce_payment',
    });
    expect(r.isValid).toBe(true);
    expect(r.newPrincipal).toBe(0);
  });

  it('reduce_payment mode: same term, lower payment', () => {
    const r = simulateAmortization({
      ...baseOpts,
      amortizationAmount: 20_000,
      mode: 'reduce_payment',
    });
    expect(r.isValid).toBe(true);
    expect(r.newTerm).toBe(240);
    expect(r.newPayment).toBeLessThan(baseOpts.currentPayment);
    expect(r.paymentReduction).toBeGreaterThan(0);
    expect(r.monthsSaved).toBe(0);
  });

  it('reduce_term mode: same payment, shorter term', () => {
    const r = simulateAmortization({
      ...baseOpts,
      amortizationAmount: 20_000,
      mode: 'reduce_term',
    });
    expect(r.isValid).toBe(true);
    expect(r.newPayment).toBe(baseOpts.currentPayment);
    expect(r.newTerm).toBeLessThan(240);
    expect(r.monthsSaved).toBeGreaterThan(0);
    expect(r.paymentReduction).toBe(0);
  });

  it('applies feePct correctly', () => {
    const r = simulateAmortization({
      ...baseOpts,
      amortizationAmount: 10_000,
      mode: 'reduce_payment',
      feePct: 0.5,
    });
    expect(r.feeAmount).toBe(50);
    expect(r.totalCashOut).toBe(10_050);
  });

  it('saves interest in reduce_payment mode', () => {
    const r = simulateAmortization({
      ...baseOpts,
      amortizationAmount: 20_000,
      mode: 'reduce_payment',
    });
    expect(r.interestSaved).toBeGreaterThan(0);
  });

  it('saves more interest in reduce_term than reduce_payment (same amount)', () => {
    const a = simulateAmortization({
      ...baseOpts,
      amortizationAmount: 20_000,
      mode: 'reduce_payment',
    });
    const b = simulateAmortization({
      ...baseOpts,
      amortizationAmount: 20_000,
      mode: 'reduce_term',
    });
    expect(b.interestSaved).toBeGreaterThan(a.interestSaved);
  });

  it('returns isValid=false when reduce_term yields impossible loan', () => {
    // Tras amortizar poco, la cuota actual sigue sin cubrir intereses
    const r = simulateAmortization({
      currentPrincipal: 100_000,
      annualRatePct: 12,
      currentPayment: 500, // 100k @ 1%/mes = 1000 intereses → imposible
      currentTerm: 240,
      amortizationAmount: 10,
      mode: 'reduce_term',
      feePct: 0,
    });
    expect(r.isValid).toBe(false);
    expect(r.errorMsg).toContain('cubre los intereses');
  });

    it('returns isValid=false when reduce_term yields impossible loan', () => {
    // Tras amortizar poco, la cuota actual sigue sin cubrir intereses
    const r = simulateAmortization({
      currentPrincipal: 100_000,
      annualRatePct: 12,
      currentPayment: 500, // 100k @ 1%/mes = 1000 intereses → imposible
      currentTerm: 240,
      amortizationAmount: 10,
      mode: 'reduce_term',
      feePct: 0,
    });
    expect(r.isValid).toBe(false);
    expect(r.errorMsg).toContain('cubre los intereses');
  });

  it('handles prev loan being already impossible (prevTotalInterest = Infinity)', () => {
    // Test del path donde prevTotalInterest es Infinity: no debe romper cálculos
    const r = simulateAmortization({
      currentPrincipal: 100_000,
      annualRatePct: 12,
      currentPayment: 500,
      currentTerm: Infinity,
      amortizationAmount: 50_000,
      mode: 'reduce_payment',
      feePct: 0,
    });
    // No debe lanzar; debe devolver algo coherente (válido o no)
    expect(typeof r.isValid).toBe('boolean');
    expect(Number.isFinite(r.newTotalCost)).toBe(true);
  });

  it('clamps interestSaved to 0 when fee exceeds savings', () => {
    // Comisión brutal que se come el ahorro
    const r = simulateAmortization({
      ...baseOpts,
      amortizationAmount: 1000,
      mode: 'reduce_payment',
      feePct: 50, // 500€ de comisión por amortizar 1000€
    });
    expect(r.interestSaved).toBeGreaterThanOrEqual(0);
  });

  it('uses feePct=0 by default when omitted', () => {
    const r = simulateAmortization({
      currentPrincipal: 100_000,
      annualRatePct: 3,
      currentPayment: 554.6,
      currentTerm: 240,
      amortizationAmount: 10_000,
      mode: 'reduce_payment',
    });
    expect(r.feeAmount).toBe(0);
    expect(r.totalCashOut).toBe(10_000);
  });
});


      