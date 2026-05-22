import { describe, it, expect } from 'vitest';
import {
  PREDEFINED_BANK_FORMATS,
  BANK_COLUMN_OPTIONS,
  BANK_FRIENDLY_NOTES,
  DEFAULT_CATEGORY_RULES_KEYWORDS,
} from '../bankFormats';

describe('bankFormats — constantes', () => {
  describe('PREDEFINED_BANK_FORMATS', () => {
    it('incluye los 7 bancos esperados', () => {
      const ids = PREDEFINED_BANK_FORMATS.map((f) => f.id);
      expect(ids).toEqual([
        'santander',
        'bbva',
        'ing',
        'caixabank',
        'revolut',
        'bankinter',
        'bankinter_card',
      ]);
    });

    it('todos los formatos predefinidos tienen isCustom=false', () => {
      PREDEFINED_BANK_FORMATS.forEach((f) => {
        expect(f.isCustom).toBe(false);
      });
    });

    it('todos los ids son únicos', () => {
      const ids = PREDEFINED_BANK_FORMATS.map((f) => f.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('todos los formatos tienen al menos una columna useful (no todo "ignore")', () => {
      PREDEFINED_BANK_FORMATS.forEach((f) => {
        const hasContent = f.columns.some(
          (c) => c === 'date' || c === 'amount' || c === 'description'
        );
        expect(hasContent).toBe(true);
      });
    });

    it('todos los formatos tienen skipRows >= 0', () => {
      PREDEFINED_BANK_FORMATS.forEach((f) => {
        expect(f.skipRows).toBeGreaterThanOrEqual(0);
      });
    });

    it('Revolut usa separador coma y formato ISO', () => {
      const revolut = PREDEFINED_BANK_FORMATS.find((f) => f.id === 'revolut')!;
      expect(revolut.separator).toBe(',');
      expect(revolut.dateFormat).toBe('yyyy-mm-dd');
      expect(revolut.encoding).toBe('utf-8');
    });

    it('los bancos españoles usan separador ; y decimal ,', () => {
      ['santander', 'bbva', 'ing', 'caixabank', 'bankinter'].forEach((id) => {
        const f = PREDEFINED_BANK_FORMATS.find((x) => x.id === id)!;
        expect(f.separator).toBe(';');
        expect(f.decimal).toBe(',');
      });
    });
  });

  describe('BANK_COLUMN_OPTIONS', () => {
    it('incluye todas las claves necesarias para parsear', () => {
      const keys = BANK_COLUMN_OPTIONS.map((o) => o.key);
      expect(keys).toContain('date');
      expect(keys).toContain('valueDate');
      expect(keys).toContain('description');
      expect(keys).toContain('amount');
      expect(keys).toContain('amountIn');
      expect(keys).toContain('amountOut');
      expect(keys).toContain('currency');
      expect(keys).toContain('ignore');
    });

    it('todas las opciones tienen label no vacío', () => {
      BANK_COLUMN_OPTIONS.forEach((o) => {
        expect(o.label.length).toBeGreaterThan(0);
      });
    });
  });

  describe('BANK_FRIENDLY_NOTES', () => {
    it('tiene nota para cada formato predefinido', () => {
      PREDEFINED_BANK_FORMATS.forEach((f) => {
        expect(BANK_FRIENDLY_NOTES[f.id]).toBeDefined();
        expect(BANK_FRIENDLY_NOTES[f.id].length).toBeGreaterThan(10);
      });
    });
  });

  describe('DEFAULT_CATEGORY_RULES_KEYWORDS', () => {
    it('incluye categorías clave', () => {
      expect(DEFAULT_CATEGORY_RULES_KEYWORDS['Alimentación']).toBeDefined();
      expect(DEFAULT_CATEGORY_RULES_KEYWORDS['Transporte']).toBeDefined();
      expect(DEFAULT_CATEGORY_RULES_KEYWORDS['Salario']).toBeDefined();
    });

    it('todas las categorías tienen al menos 1 keyword', () => {
      Object.entries(DEFAULT_CATEGORY_RULES_KEYWORDS).forEach(([_, kws]) => {
        expect(kws.length).toBeGreaterThan(0);
      });
    });

    it('Alimentación incluye supermercados típicos', () => {
      const kws = DEFAULT_CATEGORY_RULES_KEYWORDS['Alimentación'];
      expect(kws).toContain('mercadona');
      expect(kws).toContain('lidl');
      expect(kws).toContain('carrefour');
    });

    it('todas las keywords están en minúsculas', () => {
      Object.values(DEFAULT_CATEGORY_RULES_KEYWORDS).forEach((kws) => {
        kws.forEach((kw) => {
          expect(kw).toBe(kw.toLowerCase());
        });
      });
    });
  });
});
