// src/lib/bankImportOrchestrator.test.ts
//
// Tests de la lógica pura de orquestación de importación bancaria.
// Cubren los 3 puntos críticos:
//  - construcción de ImportRow[] (auto-categoría, duplicados, divisa)
//  - re-aplicación de reglas respetando overrides manuales
//  - conversión a RealExpense[] filtrando descartados/duplicados

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildImportRows,
  reApplyRules,
  importRowsToRealExpenses,
  type ParsedBankRow,
} from './bankImportOrchestrator';
import type {
  Category,
  CategoryRule,
  ImportRow,
  RealExpense,
} from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const stamp = { createdAt: 1, updatedAt: 1 };

const cat = (id: string, name: string, type: 'income' | 'expense'): Category =>
  ({ id, name, color: '#000', icon: '💰', ...stamp } as Category & { type: typeof type });

const rule = (id: string, categoryId: string, keywords: string[]): CategoryRule => ({
  id,
  categoryId,
  keywords,
  ...stamp,
});

const parsedRow = (overrides: Partial<ParsedBankRow> = {}): ParsedBankRow => ({
  entryDate: '2026-01-15',
  valueDate: '2026-01-15',
  description: 'Compra genérica',
  amount: 25,
  type: 'expense',
  ...overrides,
});

// Mock de UUID determinista
let uuidCounter = 0;
const fakeIdGen = () => `id-${++uuidCounter}`;

beforeEach(() => {
  uuidCounter = 0;
});

// ─── buildImportRows ──────────────────────────────────────────────────────────

describe('buildImportRows', () => {
  const baseParams = {
    accountId: 'acc-1',
    accountCurrency: 'EUR',
    categories: [] as Category[],
    categoryRules: [] as CategoryRule[],
    realExpenses: [] as RealExpense[],
    idGen: fakeIdGen,
  };

  it('devuelve [] cuando no hay filas parseadas', () => {
    const result = buildImportRows({ ...baseParams, parsedRows: [] });
    expect(result).toEqual([]);
  });

  it('asigna id, accountId y currency de la cuenta cuando no hay divisa detectada', () => {
    const result = buildImportRows({
      ...baseParams,
      parsedRows: [parsedRow()],
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('id-1');
    expect(result[0].accountId).toBe('acc-1');
    expect(result[0].currency).toBe('EUR');
  });

  it('usa la divisa detectada del CSV si es válida (existe en CURRENCIES)', () => {
    const result = buildImportRows({
      ...baseParams,
      parsedRows: [parsedRow({ detectedCurrency: 'usd' })],
    });
    expect(result[0].currency).toBe('USD'); // normalizada a mayúsculas
  });

  it('cae a la divisa de la cuenta si la divisa detectada NO existe en CURRENCIES', () => {
    const result = buildImportRows({
      ...baseParams,
      accountCurrency: 'EUR',
      parsedRows: [parsedRow({ detectedCurrency: 'XYZ' })],
    });
    expect(result[0].currency).toBe('EUR');
  });

  it('marca status="new" cuando no hay duplicado', () => {
    const result = buildImportRows({
      ...baseParams,
      parsedRows: [parsedRow()],
    });
    expect(result[0].status).toBe('new');
    expect(result[0].duplicateOf).toBeUndefined();
  });

  it('marca status="duplicate" y duplicateOf cuando hay coincidencia en realExpenses', () => {
    const existing: RealExpense = {
      id: 'exp-existing',
      entryDate: '2026-01-15',
      valueDate: '2026-01-15',
      description: 'Compra genérica',
      categoryId: '',
      amount: 25,
      currency: 'EUR',
      type: 'expense',
      accountId: 'acc-1',
      notes: '',
      ...stamp,
    };
    const result = buildImportRows({
      ...baseParams,
      realExpenses: [existing],
      parsedRows: [parsedRow()],
    });
    expect(result[0].status).toBe('duplicate');
    expect(result[0].duplicateOf).toBe('exp-existing');
  });

  it('NO marca duplicado si la coincidencia está en OTRA cuenta (dedup por cuenta)', () => {
    const otherAccountExpense: RealExpense = {
      id: 'exp-other',
      entryDate: '2026-01-15',
      valueDate: '2026-01-15',
      description: 'Compra genérica',
      categoryId: '',
      amount: 25,
      currency: 'EUR',
      type: 'expense',
      accountId: 'acc-2', // ← otra cuenta distinta a la del extracto (acc-1)
      notes: '',
      ...stamp,
    };
    const result = buildImportRows({
      ...baseParams, // accountId: 'acc-1'
      realExpenses: [otherAccountExpense],
      parsedRows: [parsedRow()],
    });
    expect(result[0].status).toBe('new');
    expect(result[0].duplicateOf).toBeUndefined();
  });

  it('auto-categoriza usando reglas (keyword match)', () => {
    const catSuper = cat('cat-super', 'Supermercado', 'expense');
    const result = buildImportRows({
      ...baseParams,
      categories: [catSuper],
      categoryRules: [rule('r1', 'cat-super', ['mercadona'])],
      parsedRows: [parsedRow({ description: 'Compra en MERCADONA centro' })],
    });
    expect(result[0].categoryId).toBe('cat-super');
  });

  it('deja categoryId vacío cuando ninguna regla coincide', () => {
    const result = buildImportRows({
      ...baseParams,
      categories: [cat('cat-x', 'Otros', 'expense')],
      categoryRules: [rule('r1', 'cat-x', ['amazon'])],
      parsedRows: [parsedRow({ description: 'Pago desconocido' })],
    });
    expect(result[0].categoryId).toBe('');
  });

  it('inicializa notes a "" y preserva entryDate/valueDate/amount/type', () => {
    const result = buildImportRows({
      ...baseParams,
      parsedRows: [
        parsedRow({
          entryDate: '2026-02-01',
          valueDate: '2026-02-02',
          amount: 99.5,
          type: 'income',
        }),
      ],
    });
    expect(result[0].notes).toBe('');
    expect(result[0].entryDate).toBe('2026-02-01');
    expect(result[0].valueDate).toBe('2026-02-02');
    expect(result[0].amount).toBe(99.5);
    expect(result[0].type).toBe('income');
  });

  it('genera IDs únicos para cada fila', () => {
    const result = buildImportRows({
      ...baseParams,
      parsedRows: [parsedRow(), parsedRow(), parsedRow()],
    });
    expect(result.map((r) => r.id)).toEqual(['id-1', 'id-2', 'id-3']);
  });
});

// ─── reApplyRules ─────────────────────────────────────────────────────────────

describe('reApplyRules', () => {
  const baseRow = (overrides: Partial<ImportRow> = {}): ImportRow => ({
    id: 'r-1',
    entryDate: '2026-01-15',
    valueDate: '2026-01-15',
    description: 'Compra Mercadona',
    amount: 25,
    type: 'expense',
    categoryId: '',
    accountId: 'acc-1',
    currency: 'EUR',
    status: 'new',
    notes: '',
    ...overrides,
  });

  it('re-aplica reglas y actualiza categoryId', () => {
    const result = reApplyRules({
      rows: [baseRow({ categoryId: '' })],
      categories: [cat('cat-super', 'Super', 'expense')],
      categoryRules: [rule('r1', 'cat-super', ['mercadona'])],
      manuallyCategorized: new Set(),
    });
    expect(result[0].categoryId).toBe('cat-super');
  });

  it('NO toca filas que están en manuallyCategorized', () => {
    const row = baseRow({ id: 'manual-1', categoryId: 'cat-manual' });
    const result = reApplyRules({
      rows: [row],
      categories: [cat('cat-super', 'Super', 'expense')],
      categoryRules: [rule('r1', 'cat-super', ['mercadona'])],
      manuallyCategorized: new Set(['manual-1']),
    });
    expect(result[0].categoryId).toBe('cat-manual');
  });

  it('mezcla: respeta manuales y re-aplica al resto', () => {
    const rows = [
      baseRow({ id: 'auto-1', categoryId: '' }),
      baseRow({ id: 'manual-1', categoryId: 'cat-manual' }),
    ];
    const result = reApplyRules({
      rows,
      categories: [cat('cat-super', 'Super', 'expense')],
      categoryRules: [rule('r1', 'cat-super', ['mercadona'])],
      manuallyCategorized: new Set(['manual-1']),
    });
    expect(result[0].categoryId).toBe('cat-super');
    expect(result[1].categoryId).toBe('cat-manual');
  });

  it('preserva el resto de campos de cada fila intactos', () => {
    const row = baseRow({ amount: 123.45, description: 'X', status: 'duplicate' });
    const result = reApplyRules({
      rows: [row],
      categories: [],
      categoryRules: [],
      manuallyCategorized: new Set(),
    });
    expect(result[0].amount).toBe(123.45);
    expect(result[0].description).toBe('X');
    expect(result[0].status).toBe('duplicate');
  });

  it('devuelve nueva referencia (inmutabilidad)', () => {
    const rows = [baseRow()];
    const result = reApplyRules({
      rows,
      categories: [],
      categoryRules: [],
      manuallyCategorized: new Set(),
    });
    expect(result).not.toBe(rows);
    expect(result[0]).not.toBe(rows[0]);
  });
});

// ─── importRowsToRealExpenses ─────────────────────────────────────────────────

describe('importRowsToRealExpenses', () => {
  const row = (overrides: Partial<ImportRow> = {}): ImportRow => ({
    id: 'r-1',
    entryDate: '2026-01-15',
    valueDate: '2026-01-15',
    description: 'Compra',
    amount: 25,
    type: 'expense',
    categoryId: 'cat-1',
    accountId: 'acc-1',
    currency: 'EUR',
    status: 'new',
    notes: '',
    ...overrides,
  });

  it('devuelve [] cuando no hay filas', () => {
    expect(importRowsToRealExpenses([], fakeIdGen)).toEqual([]);
  });

  it('solo convierte filas con status="new"', () => {
    const rows = [
      row({ id: 'a', status: 'new' }),
      row({ id: 'b', status: 'duplicate' }),
      row({ id: 'c', status: 'discarded' }),
      row({ id: 'd', status: 'new' }),
    ];
    const result = importRowsToRealExpenses(rows, fakeIdGen);
    expect(result).toHaveLength(2);
  });

  it('genera nuevos IDs (no reutiliza el de ImportRow)', () => {
    const rows = [row({ id: 'original-1' })];
    const result = importRowsToRealExpenses(rows, fakeIdGen);
    expect(result[0].id).toBe('id-1');
    expect(result[0].id).not.toBe('original-1');
  });

  it('mapea todos los campos relevantes a RealExpense', () => {
    const rows = [
      row({
        entryDate: '2026-02-01',
        valueDate: '2026-02-02',
        description: 'Test',
        categoryId: 'cat-x',
        amount: 50,
        currency: 'USD',
        type: 'income',
        accountId: 'acc-x',
        notes: 'una nota',
      }),
    ];
    const result = importRowsToRealExpenses(rows, fakeIdGen);
    expect(result[0]).toMatchObject({
      entryDate: '2026-02-01',
      valueDate: '2026-02-02',
      description: 'Test',
      categoryId: 'cat-x',
      amount: 50,
      currency: 'USD',
      type: 'income',
      accountId: 'acc-x',
      notes: 'una nota',
    });
  });

  it('NO incluye timestamps (los selladores se aplican en el setter)', () => {
    const result = importRowsToRealExpenses([row()], fakeIdGen);
    // Comportamiento idéntico al código original: setter sella timestamps
    expect(result[0]).not.toHaveProperty('createdAt');
    expect(result[0]).not.toHaveProperty('updatedAt');
  });
});
