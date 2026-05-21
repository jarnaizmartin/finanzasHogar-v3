import {
  fmtMoney,
  convertAmount,
  monthKey,
  addMonths,
  fmtDateShort,
  fmtDateDMY,
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
