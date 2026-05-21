import {
  fmtMoney,
  convertAmount,
  monthKey,
  addMonths,
  fmtDateShort,
  fmtDateDMY,
  calcGoalProgress,
} from '../../utils';

describe('fmtMoney', () => {
  describe('default behavior (minDecimals = 0)', () => {
    it('formats round amounts without decimals', () => {
      // Nota: es-ES no aplica separador de miles a números < 10.000 (regla RAE/ICU)
      expect(fmtMoney(1000, 'EUR')).toBe('1000 EUR');
      expect(fmtMoney(10000, 'EUR')).toBe('10.000 EUR');
    });

    it('formats amounts with decimals when present', () => {
      // < 10.000 → sin separador de miles en es-ES
      expect(fmtMoney(1234.56, 'EUR')).toBe('1234,56 EUR');
      // >= 10.000 → con separador de miles
      expect(fmtMoney(12345.67, 'EUR')).toBe('12.345,67 EUR');
    });

    it('handles zero', () => {
      expect(fmtMoney(0, 'USD')).toBe('0 USD');
    });

    it('handles negative amounts', () => {
      expect(fmtMoney(-50.5, 'EUR')).toBe('-50,5 EUR');
    });

    it('handles large numbers with multiple thousand separators', () => {
      expect(fmtMoney(1234567.89, 'USD')).toBe('1.234.567,89 USD');
    });
  });

  describe('with minDecimals = 2 (financial precision)', () => {
    it('forces two decimals on round amounts', () => {
      // < 10.000 → sin separador de miles, pero con 2 decimales forzados
      expect(fmtMoney(1000, 'EUR', 2)).toBe('1000,00 EUR');
      expect(fmtMoney(10000, 'EUR', 2)).toBe('10.000,00 EUR');
    });

    it('rounds to 2 decimals when more are provided', () => {
      expect(fmtMoney(1.999, 'EUR', 2)).toBe('2,00 EUR');
    });

    it('pads single-decimal values to two decimals', () => {
      expect(fmtMoney(50.5, 'EUR', 2)).toBe('50,50 EUR');
    });
  });

  describe('currency code handling', () => {
    it('appends any currency code as-is', () => {
      expect(fmtMoney(500, 'JPY')).toBe('500 JPY');
    });

    it('works with non-standard codes too', () => {
      expect(fmtMoney(100, 'XYZ')).toBe('100 XYZ');
    });
  });

  describe('edge cases', () => {
    it('caps decimals at 2 even without minDecimals', () => {
      expect(fmtMoney(1.12345, 'EUR')).toBe('1,12 EUR');
    });

    it('handles very small decimals', () => {
      expect(fmtMoney(0.01, 'EUR', 2)).toBe('0,01 EUR');
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// convertAmount — Currency conversion using EUR as pivot
// ────────────────────────────────────────────────────────────────────────────
describe('convertAmount', () => {
  const rates = { USD: 1.1, GBP: 0.85, JPY: 160 };

  it('returns the same amount when currencies match', () => {
    expect(convertAmount(100, 'EUR', 'EUR', rates)).toBe(100);
    expect(convertAmount(50, 'USD', 'USD', rates)).toBe(50);
  });

  it('returns the same amount when rates object is empty', () => {
    expect(convertAmount(100, 'USD', 'EUR', {})).toBe(100);
  });

  it('returns the same amount when rates is null/undefined', () => {
    // @ts-expect-error — testing runtime guard
    expect(convertAmount(100, 'USD', 'EUR', null)).toBe(100);
  });

  it('converts from a non-EUR currency to EUR (pivot)', () => {
    // 110 USD / 1.1 = 100 EUR
    expect(convertAmount(110, 'USD', 'EUR', rates)).toBeCloseTo(100, 5);
  });

  it('converts from EUR to a non-EUR currency', () => {
    // EUR not in rates → rateFrom = 1 → 100 EUR * 1.1 = 110 USD
    expect(convertAmount(100, 'EUR', 'USD', rates)).toBeCloseTo(110, 5);
  });

  it('converts between two non-EUR currencies via EUR pivot', () => {
    // 110 USD → 100 EUR → 100 * 0.85 = 85 GBP
    expect(convertAmount(110, 'USD', 'GBP', rates)).toBeCloseTo(85, 5);
  });

  it('falls back to rate=1 when source currency is missing in rates', () => {
    // XYZ not in rates → rateFrom = 1 → 100 / 1 = 100 EUR → * 1.1 = 110 USD
    expect(convertAmount(100, 'XYZ', 'USD', rates)).toBeCloseTo(110, 5);
  });

  it('falls back to rate=1 when target currency is missing in rates', () => {
    // 110 USD → 100 EUR → XYZ rate=1 → 100
    expect(convertAmount(110, 'USD', 'XYZ', rates)).toBeCloseTo(100, 5);
  });

  it('handles zero amount', () => {
    expect(convertAmount(0, 'USD', 'GBP', rates)).toBe(0);
  });

  it('handles negative amounts (refunds)', () => {
    expect(convertAmount(-110, 'USD', 'EUR', rates)).toBeCloseTo(-100, 5);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// monthKey — Year-month grouping key (YYYY-MM)
// ────────────────────────────────────────────────────────────────────────────
describe('monthKey', () => {
  it('builds key from a Date object', () => {
    expect(monthKey(new Date(2024, 2, 15))).toBe('2024-03'); // March
  });

  it('pads single-digit months with leading zero', () => {
    expect(monthKey(new Date(2024, 0, 1))).toBe('2024-01'); // January
    expect(monthKey(new Date(2024, 8, 10))).toBe('2024-09'); // September
  });

  it('handles December correctly', () => {
    expect(monthKey(new Date(2024, 11, 31))).toBe('2024-12');
  });

  it('accepts ISO date strings', () => {
    expect(monthKey('2024-03-15')).toBe('2024-03');
  });

  it('handles year boundaries', () => {
    expect(monthKey(new Date(2023, 11, 31))).toBe('2023-12');
    expect(monthKey(new Date(2024, 0, 1))).toBe('2024-01');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// addMonths — Date arithmetic (mutates and returns)
// ────────────────────────────────────────────────────────────────────────────
describe('addMonths', () => {
  it('adds positive months', () => {
    const result = addMonths(new Date(2024, 0, 15), 3); // Jan 15 → Apr 15
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(3); // April
    expect(result.getDate()).toBe(15);
  });

  it('subtracts when n is negative', () => {
    const result = addMonths(new Date(2024, 5, 10), -2); // Jun 10 → Apr 10
    expect(result.getMonth()).toBe(3); // April
  });

  it('rolls over to next year', () => {
    const result = addMonths(new Date(2024, 10, 1), 3); // Nov → Feb next year
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(1); // February
  });

  it('rolls back to previous year with negative n', () => {
    const result = addMonths(new Date(2024, 1, 1), -3); // Feb → Nov prev year
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth()).toBe(10); // November
  });

  it('accepts ISO string input', () => {
    const result = addMonths('2024-06-15', 1);
    expect(result.getMonth()).toBe(6); // July
  });

  it('handles n=0 (no change)', () => {
    const result = addMonths(new Date(2024, 5, 15), 0);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(15);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// fmtDateShort — Short date for cards/lists
// ────────────────────────────────────────────────────────────────────────────
describe('fmtDateShort', () => {
  it('returns "—" for empty input', () => {
    expect(fmtDateShort('', 'dd/mm/yyyy')).toBe('—');
  });

  it('returns "—" when date parts are missing', () => {
    // El guard actual solo detecta partes faltantes (no validez)
    expect(fmtDateShort('2024', 'dd/mm/yyyy')).toBe('—');
    expect(fmtDateShort('2024-03', 'dd/mm/yyyy')).toBe('—');
    // TODO(fase futura): endurecer guard para detectar partes no numéricas
    // Actualmente fmtDateShort('not-a-date') devuelve "NaN a not" en lugar de "—"
  });

  it('formats in default mode (es-ES short month)', () => {
    expect(fmtDateShort('2024-03-15', 'unknown-format')).toBe('15 mar 2024');
  });

  it('strips leading zero from day in default mode', () => {
    expect(fmtDateShort('2024-03-05', 'unknown-format')).toBe('5 mar 2024');
  });

  it('formats as mm/dd/yyyy', () => {
    expect(fmtDateShort('2024-03-15', 'mm/dd/yyyy')).toBe('03/15/2024');
  });

  it('formats as yyyy-mm-dd', () => {
    expect(fmtDateShort('2024-03-15', 'yyyy-mm-dd')).toBe('2024-03-15');
  });

  it('formats as dd-mm-yyyy', () => {
    expect(fmtDateShort('2024-03-15', 'dd-mm-yyyy')).toBe('15-03-2024');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// fmtDateDMY — Full numeric date
// ────────────────────────────────────────────────────────────────────────────
describe('fmtDateDMY', () => {
  it('returns "—" for empty input', () => {
    expect(fmtDateDMY('', 'dd/mm/yyyy')).toBe('—');
  });

  it('returns "—" when date parts are missing', () => {
    expect(fmtDateDMY('2024', 'dd/mm/yyyy')).toBe('—');
    expect(fmtDateDMY('2024-03', 'dd/mm/yyyy')).toBe('—');
    // TODO(fase futura): endurecer guard (ver fmtDateShort)
  });

  it('formats in default mode (dd/mm/yyyy)', () => {
    expect(fmtDateDMY('2024-03-15', 'unknown-format')).toBe('15/03/2024');
  });

  it('formats as mm/dd/yyyy', () => {
    expect(fmtDateDMY('2024-03-15', 'mm/dd/yyyy')).toBe('03/15/2024');
  });

  it('formats as yyyy-mm-dd', () => {
    expect(fmtDateDMY('2024-03-15', 'yyyy-mm-dd')).toBe('2024-03-15');
  });

  it('formats as dd-mm-yyyy', () => {
    expect(fmtDateDMY('2024-03-15', 'dd-mm-yyyy')).toBe('15-03-2024');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// calcGoalProgress — Savings goal tracking with manual/auto modes
// ────────────────────────────────────────────────────────────────────────────
describe('calcGoalProgress', () => {
  // Helpers para fechas relativas a "hoy" (los tests deben ser deterministas
  // respecto a la fecha de ejecución → usamos fechas pasadas concretas)
  const isoDaysAgo = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  const baseAccount = {
    id: 'acc-1',
    name: 'Cuenta corriente',
    date: '2020-01-01', // fecha de saldo inicial muy antigua
  };

  const accounts = [baseAccount];
  const rates = { USD: 1.1 };

  // ──────────────────────────────────────────────────────────────────────────
  // MODO MANUAL
  // ──────────────────────────────────────────────────────────────────────────
  describe('manual mode', () => {
    const baseGoal = {
      mode: 'manual',
      currentAmount: 500,
      targetAmount: 1000,
      currency: 'EUR',
      categoryId: 'cat-1',
      accountId: 'all',
      deadline: null,
    };

    it('uses currentAmount as saved', () => {
      const r = calcGoalProgress(baseGoal, [], accounts, rates);
      expect(r.saved).toBe(500);
    });

    it('calculates pct correctly', () => {
      const r = calcGoalProgress(baseGoal, [], accounts, rates);
      expect(r.pct).toBe(50);
    });

    it('caps pct at 100 when overshooting', () => {
      const goal = { ...baseGoal, currentAmount: 1500 };
      const r = calcGoalProgress(goal, [], accounts, rates);
      expect(r.pct).toBe(100);
    });

    it('marks completed when saved >= target', () => {
      const goal = { ...baseGoal, currentAmount: 1000 };
      const r = calcGoalProgress(goal, [], accounts, rates);
      expect(r.completed).toBe(true);
      expect(r.remaining).toBe(0);
    });

    it('calculates remaining when below target', () => {
      const r = calcGoalProgress(baseGoal, [], accounts, rates);
      expect(r.remaining).toBe(500);
    });

    it('returns 0% when targetAmount is 0 (no division by zero)', () => {
      const goal = { ...baseGoal, targetAmount: 0 };
      const r = calcGoalProgress(goal, [], accounts, rates);
      expect(r.pct).toBe(0);
    });

    it('ignores realExpenses in manual mode', () => {
      const expenses = [
        {
          id: 'e1',
          categoryId: 'cat-1',
          type: 'expense',
          amount: 9999,
          currency: 'EUR',
          accountId: 'acc-1',
          valueDate: isoDaysAgo(10),
        },
      ];
      const r = calcGoalProgress(baseGoal, expenses, accounts, rates);
      expect(r.saved).toBe(500); // sigue siendo currentAmount
    });

    it('returns null monthsLeft/monthlyNeeded without deadline', () => {
      const r = calcGoalProgress(baseGoal, [], accounts, rates);
      expect(r.monthsLeft).toBeNull();
      expect(r.monthlyNeeded).toBeNull();
    });

    it('calculates monthsLeft and monthlyNeeded with deadline', () => {
      // deadline a ~6 meses vista
      const future = new Date();
      future.setMonth(future.getMonth() + 6);
      const goal = {
        ...baseGoal,
        deadline: future.toISOString().split('T')[0],
      };
      const r = calcGoalProgress(goal, [], accounts, rates);
      expect(r.monthsLeft).toBeGreaterThanOrEqual(5);
      expect(r.monthsLeft).toBeLessThanOrEqual(7);
      expect(r.monthlyNeeded).toBeGreaterThan(0);
    });

    it('monthlyRate is 0 in manual mode', () => {
      const r = calcGoalProgress(baseGoal, [], accounts, rates);
      expect(r.monthlyRate).toBe(0);
    });

    it('sets estimatedDate to "Objetivo alcanzado" when completed', () => {
      const goal = { ...baseGoal, currentAmount: 1200 };
      const r = calcGoalProgress(goal, [], accounts, rates);
      expect(r.estimatedDate).toBe('Objetivo alcanzado');
    });

    it('returns null estimatedDate when monthlyRate=0 and not completed', () => {
      const r = calcGoalProgress(baseGoal, [], accounts, rates);
      expect(r.estimatedDate).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // MODO AUTO — filtros
  // ──────────────────────────────────────────────────────────────────────────
  describe('auto mode — filters', () => {
    const baseGoal = {
      mode: 'auto',
      currentAmount: 0,
      targetAmount: 1000,
      currency: 'EUR',
      categoryId: 'cat-1',
      autoType: 'expense',
      autoStartDate: isoDaysAgo(90),
      accountId: 'all',
      deadline: null,
    };

    it('sums matching expenses', () => {
      const expenses = [
        {
          id: 'e1',
          categoryId: 'cat-1',
          type: 'expense',
          amount: 200,
          currency: 'EUR',
          accountId: 'acc-1',
          valueDate: isoDaysAgo(30),
        },
        {
          id: 'e2',
          categoryId: 'cat-1',
          type: 'expense',
          amount: 100,
          currency: 'EUR',
          accountId: 'acc-1',
          valueDate: isoDaysAgo(20),
        },
      ];
      const r = calcGoalProgress(baseGoal, expenses, accounts, rates);
      expect(r.saved).toBe(300);
    });

    it('filters out expenses from other categories', () => {
      const expenses = [
        {
          id: 'e1',
          categoryId: 'cat-OTHER',
          type: 'expense',
          amount: 500,
          currency: 'EUR',
          accountId: 'acc-1',
          valueDate: isoDaysAgo(30),
        },
      ];
      const r = calcGoalProgress(baseGoal, expenses, accounts, rates);
      expect(r.saved).toBe(0);
    });

    it('filters out expenses of wrong type (income vs expense)', () => {
      const expenses = [
        {
          id: 'e1',
          categoryId: 'cat-1',
          type: 'income', // goal espera 'expense'
          amount: 500,
          currency: 'EUR',
          accountId: 'acc-1',
          valueDate: isoDaysAgo(30),
        },
      ];
      const r = calcGoalProgress(baseGoal, expenses, accounts, rates);
      expect(r.saved).toBe(0);
    });

    it('filters out expenses before autoStartDate', () => {
      const expenses = [
        {
          id: 'e1',
          categoryId: 'cat-1',
          type: 'expense',
          amount: 500,
          currency: 'EUR',
          accountId: 'acc-1',
          valueDate: isoDaysAgo(200), // antes del autoStartDate (90 días)
        },
      ];
      const r = calcGoalProgress(baseGoal, expenses, accounts, rates);
      expect(r.saved).toBe(0);
    });

    it('filters by specific accountId when not "all"', () => {
      const goal = { ...baseGoal, accountId: 'acc-1' };
      const expenses = [
        {
          id: 'e1',
          categoryId: 'cat-1',
          type: 'expense',
          amount: 200,
          currency: 'EUR',
          accountId: 'acc-1',
          valueDate: isoDaysAgo(30),
        },
        {
          id: 'e2',
          categoryId: 'cat-1',
          type: 'expense',
          amount: 300,
          currency: 'EUR',
          accountId: 'acc-OTHER',
          valueDate: isoDaysAgo(30),
        },
      ];
      const r = calcGoalProgress(goal, expenses, accounts, rates);
      expect(r.saved).toBe(200);
    });

    it('ignores expenses whose account does not exist', () => {
      const expenses = [
        {
          id: 'e1',
          categoryId: 'cat-1',
          type: 'expense',
          amount: 500,
          currency: 'EUR',
          accountId: 'acc-GHOST',
          valueDate: isoDaysAgo(30),
        },
      ];
      const r = calcGoalProgress(baseGoal, expenses, accounts, rates);
      expect(r.saved).toBe(0);
    });

    it('ignores expenses on/before the account opening date (initial balance)', () => {
      const acc = { id: 'acc-2', name: 'Nueva', date: isoDaysAgo(10) };
      const expenses = [
        {
          id: 'e1',
          categoryId: 'cat-1',
          type: 'expense',
          amount: 500,
          currency: 'EUR',
          accountId: 'acc-2',
          valueDate: isoDaysAgo(10), // = fecha cuenta → excluido (no es estrictamente >)
        },
        {
          id: 'e2',
          categoryId: 'cat-1',
          type: 'expense',
          amount: 200,
          currency: 'EUR',
          accountId: 'acc-2',
          valueDate: isoDaysAgo(5), // posterior → incluido
        },
      ];
      const r = calcGoalProgress(baseGoal, expenses, [acc], rates);
      expect(r.saved).toBe(200);
    });

    it('converts currencies when goal currency differs', () => {
      const expenses = [
        {
          id: 'e1',
          categoryId: 'cat-1',
          type: 'expense',
          amount: 110, // 110 USD → 100 EUR
          currency: 'USD',
          accountId: 'acc-1',
          valueDate: isoDaysAgo(30),
        },
      ];
      const r = calcGoalProgress(baseGoal, expenses, accounts, rates);
      expect(r.saved).toBeCloseTo(100, 5);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // MODO AUTO — proyecciones (monthlyRate, estimatedDate, onTrack)
  // ──────────────────────────────────────────────────────────────────────────
  describe('auto mode — projections', () => {
    const baseGoal = {
      mode: 'auto',
      currentAmount: 0,
      targetAmount: 1000,
      currency: 'EUR',
      categoryId: 'cat-1',
      autoType: 'expense',
      autoStartDate: isoDaysAgo(180),
      accountId: 'all',
      deadline: null,
    };

    it('calculates monthlyRate as average of last 3 months', () => {
      // 3 movimientos de 100€ en los últimos 90 días → media = 100€/mes
      const expenses = [
        {
          id: 'e1',
          categoryId: 'cat-1',
          type: 'expense',
          amount: 100,
          currency: 'EUR',
          accountId: 'acc-1',
          valueDate: isoDaysAgo(10),
        },
        {
          id: 'e2',
          categoryId: 'cat-1',
          type: 'expense',
          amount: 100,
          currency: 'EUR',
          accountId: 'acc-1',
          valueDate: isoDaysAgo(40),
        },
        {
          id: 'e3',
          categoryId: 'cat-1',
          type: 'expense',
          amount: 100,
          currency: 'EUR',
          accountId: 'acc-1',
          valueDate: isoDaysAgo(70),
        },
      ];
      const r = calcGoalProgress(baseGoal, expenses, accounts, rates);
      expect(r.monthlyRate).toBeCloseTo(100, 5);
    });

    it('ignores expenses older than 3 months in monthlyRate', () => {
      const expenses = [
        {
          id: 'old',
          categoryId: 'cat-1',
          type: 'expense',
          amount: 9999,
          currency: 'EUR',
          accountId: 'acc-1',
          valueDate: isoDaysAgo(150), // fuera de la ventana de 3 meses
        },
      ];
      const r = calcGoalProgress(baseGoal, expenses, accounts, rates);
      expect(r.monthlyRate).toBe(0);
      // pero sí cuenta en saved (autoStartDate=180)
      expect(r.saved).toBe(9999);
    });

    it('provides estimatedDate as Spanish "mes año" string when on rate', () => {
      const expenses = [
        {
          id: 'e1',
          categoryId: 'cat-1',
          type: 'expense',
          amount: 300,
          currency: 'EUR',
          accountId: 'acc-1',
          valueDate: isoDaysAgo(30),
        },
      ];
      const r = calcGoalProgress(baseGoal, expenses, accounts, rates);
      expect(r.estimatedDate).toMatch(/\d{4}/); // contiene un año
      expect(typeof r.estimatedDate).toBe('string');
    });

    it('onTrack is true when monthlyRate >= monthlyNeeded', () => {
      // deadline 12 meses → needed = 1000/12 ≈ 83€/mes
      // rate = 300/3 = 100€/mes → on track
      const future = new Date();
      future.setMonth(future.getMonth() + 12);
      const goal = {
        ...baseGoal,
        deadline: future.toISOString().split('T')[0],
      };
      const expenses = [
        {
          id: 'e1',
          categoryId: 'cat-1',
          type: 'expense',
          amount: 100,
          currency: 'EUR',
          accountId: 'acc-1',
          valueDate: isoDaysAgo(10),
        },
        {
          id: 'e2',
          categoryId: 'cat-1',
          type: 'expense',
          amount: 100,
          currency: 'EUR',
          accountId: 'acc-1',
          valueDate: isoDaysAgo(40),
        },
        {
          id: 'e3',
          categoryId: 'cat-1',
          type: 'expense',
          amount: 100,
          currency: 'EUR',
          accountId: 'acc-1',
          valueDate: isoDaysAgo(70),
        },
      ];
      const r = calcGoalProgress(goal, expenses, accounts, rates);
      expect(r.onTrack).toBe(true);
    });

    it('onTrack is false when monthlyRate < monthlyNeeded', () => {
      // deadline 2 meses → needed = 500€/mes; rate ~33€/mes → off track
      const future = new Date();
      future.setMonth(future.getMonth() + 2);
      const goal = {
        ...baseGoal,
        deadline: future.toISOString().split('T')[0],
      };
      const expenses = [
        {
          id: 'e1',
          categoryId: 'cat-1',
          type: 'expense',
          amount: 100,
          currency: 'EUR',
          accountId: 'acc-1',
          valueDate: isoDaysAgo(30),
        },
      ];
      const r = calcGoalProgress(goal, expenses, accounts, rates);
      expect(r.onTrack).toBe(false);
    });

    it('onTrack is false without deadline (monthlyNeeded is null)', () => {
      const expenses = [
        {
          id: 'e1',
          categoryId: 'cat-1',
          type: 'expense',
          amount: 100,
          currency: 'EUR',
          accountId: 'acc-1',
          valueDate: isoDaysAgo(30),
        },
      ];
      const r = calcGoalProgress(baseGoal, expenses, accounts, rates);
      expect(r.onTrack).toBe(false);
    });
  });
});
