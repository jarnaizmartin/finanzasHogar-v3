import { describe, it, expect } from 'vitest';
import { autoCategorizeRow, findDuplicate } from '../bankImportRules';
import type { Category, CategoryRule, RealExpense } from '../../types';

const cat = (id: string, name: string): Category => ({
  id,
  name,
  createdAt: 0,
  updatedAt: 0,
});

const rule = (id: string, categoryId: string, keywords: string[]): CategoryRule => ({
  id,
  categoryId,
  keywords,
  createdAt: 0,
  updatedAt: 0,
});

describe('bankImportRules', () => {
  describe('autoCategorizeRow', () => {
    const categories: Category[] = [
      cat('c-food', 'Alimentación'),
      cat('c-trans', 'Transporte'),
      cat('c-salary', 'Salario'),
      cat('c-custom', 'Mi categoría custom'),
    ];

    it('aplica regla custom del usuario antes que defaults', () => {
      const rules = [rule('r1', 'c-custom', ['mercadona'])];
      const result = autoCategorizeRow('Compra Mercadona 123', 'expense', categories, rules);
      expect(result).toBe('c-custom');
    });

    it('aplica regla default si no hay match en custom', () => {
      const result = autoCategorizeRow('Compra en LIDL', 'expense', categories, []);
      expect(result).toBe('c-food');
    });

    it('match case-insensitive', () => {
      expect(autoCategorizeRow('MERCADONA', 'expense', categories, [])).toBe('c-food');
      expect(autoCategorizeRow('mercadona', 'expense', categories, [])).toBe('c-food');
      expect(autoCategorizeRow('Mercadona', 'expense', categories, [])).toBe('c-food');
    });

    it('devuelve "" si no hay match', () => {
      const result = autoCategorizeRow('Cosa muy rara xyz', 'expense', categories, []);
      expect(result).toBe('');
    });

    it('reglas default por nombre — Transporte detecta Renfe', () => {
      const result = autoCategorizeRow('Renfe AVE Madrid-Barcelona', 'expense', categories, []);
      expect(result).toBe('c-trans');
    });

    it('reglas default — Salario detecta nómina', () => {
      const result = autoCategorizeRow('NOMINA EMPRESA SA', 'income', categories, []);
      expect(result).toBe('c-salary');
    });

    it('si la categoría del default no existe en categories, no asigna', () => {
      const cats: Category[] = [cat('c-trans', 'Transporte')];
      const result = autoCategorizeRow('Mercadona', 'expense', cats, []);
      expect(result).toBe(''); // Alimentación no existe en cats
    });

    it('regla custom con categoryId inexistente se ignora', () => {
      const rules = [rule('r1', 'no-existe', ['mercadona'])];
      const result = autoCategorizeRow('Mercadona', 'expense', categories, rules);
      // Cae a defaults
      expect(result).toBe('c-food');
    });

    it('descripción vacía devuelve ""', () => {
      const result = autoCategorizeRow('', 'expense', categories, []);
      expect(result).toBe('');
    });

    it('primera regla custom que matchea gana', () => {
      const rules = [
        rule('r1', 'c-food', ['mercadona']),
        rule('r2', 'c-custom', ['mercadona']),
      ];
      const result = autoCategorizeRow('Mercadona', 'expense', categories, rules);
      expect(result).toBe('c-food');
    });
  });

  describe('findDuplicate', () => {
    const exp = (
      id: string,
      amount: number,
      valueDate: string,
      type: 'income' | 'expense' = 'expense'
    ): RealExpense => ({
      id,
      entryDate: valueDate,
      valueDate,
      description: 'X',
      categoryId: 'c1',
      amount,
      currency: 'EUR',
      type,
      accountId: 'a1',
      createdAt: 0,
      updatedAt: 0,
    });

    it('detecta duplicado exacto', () => {
      const existing = [exp('e1', 100, '2024-03-15')];
      const row = { amount: 100, valueDate: '2024-03-15', type: 'expense' as const };
      expect(findDuplicate(row, existing)).toBe('e1');
    });

    it('detecta duplicado con 1 día de diferencia', () => {
      const existing = [exp('e1', 100, '2024-03-15')];
      const row = { amount: 100, valueDate: '2024-03-16', type: 'expense' as const };
      expect(findDuplicate(row, existing)).toBe('e1');
    });

    it('detecta duplicado con 2 días de diferencia (límite)', () => {
      const existing = [exp('e1', 100, '2024-03-15')];
      const row = { amount: 100, valueDate: '2024-03-17', type: 'expense' as const };
      expect(findDuplicate(row, existing)).toBe('e1');
    });

    it('NO detecta duplicado con 3 días de diferencia', () => {
      const existing = [exp('e1', 100, '2024-03-15')];
      const row = { amount: 100, valueDate: '2024-03-18', type: 'expense' as const };
      expect(findDuplicate(row, existing)).toBeUndefined();
    });

    it('NO detecta duplicado si el tipo es distinto', () => {
      const existing = [exp('e1', 100, '2024-03-15', 'expense')];
      const row = { amount: 100, valueDate: '2024-03-15', type: 'income' as const };
      expect(findDuplicate(row, existing)).toBeUndefined();
    });

    it('NO detecta duplicado si el importe difiere más de 0,01', () => {
      const existing = [exp('e1', 100, '2024-03-15')];
      const row = { amount: 100.02, valueDate: '2024-03-15', type: 'expense' as const };
      expect(findDuplicate(row, existing)).toBeUndefined();
    });

    it('SÍ detecta duplicado con diferencia de céntimo (≤ 0,01)', () => {
      const existing = [exp('e1', 100, '2024-03-15')];
      const row = { amount: 100.005, valueDate: '2024-03-15', type: 'expense' as const };
      expect(findDuplicate(row, existing)).toBe('e1');
    });

    it('devuelve undefined con lista vacía', () => {
      const row = { amount: 100, valueDate: '2024-03-15', type: 'expense' as const };
      expect(findDuplicate(row, [])).toBeUndefined();
    });

    it('devuelve el PRIMER match si hay varios candidatos', () => {
      const existing = [
        exp('e1', 100, '2024-03-15'),
        exp('e2', 100, '2024-03-15'),
      ];
      const row = { amount: 100, valueDate: '2024-03-15', type: 'expense' as const };
      expect(findDuplicate(row, existing)).toBe('e1');
    });

    it('ignora gastos con fecha muy alejada (1 mes)', () => {
      const existing = [exp('e1', 100, '2024-02-15')];
      const row = { amount: 100, valueDate: '2024-03-15', type: 'expense' as const };
      expect(findDuplicate(row, existing)).toBeUndefined();
    });

    it('funciona con importes income', () => {
      const existing = [exp('e1', 2000, '2024-03-15', 'income')];
      const row = { amount: 2000, valueDate: '2024-03-15', type: 'income' as const };
      expect(findDuplicate(row, existing)).toBe('e1');
    });
  });
});
