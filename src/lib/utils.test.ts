import { fmtMoney } from '../utils';

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
