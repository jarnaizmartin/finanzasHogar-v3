// src/lib/bankImportOrchestrator.ts
//
// Orquestación pura del flujo de importación bancaria:
//  - construir ImportRow[] a partir del CSV parseado
//  - re-aplicar reglas de categorización respetando overrides manuales
//  - convertir ImportRow[] a RealExpense[] para persistencia
//
// Extraído de BankImportModal.tsx (refactor Fase 1 — commit 2/8).
// Lógica pura, sin React. Testeada en bankImportOrchestrator.test.ts.

import type {
  Category,
  CategoryRule,
  ImportRow,
  RealExpense,
} from '../types';
import { CURRENCIES } from '../utils';
import { autoCategorizeRow, findDuplicate } from './bankImportRules';

// Tipo de fila parseada que llega desde parseBankCSV (subset relevante).
export type ParsedBankRow = {
  entryDate: string;
  valueDate: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  detectedCurrency?: string;
};

// Generador de IDs inyectable (para tests deterministas).
export type IdGenerator = () => string;
const defaultIdGen: IdGenerator = () => crypto.randomUUID();

/**
 * Construye las ImportRow[] iniciales a partir del CSV parseado.
 * - Auto-categoriza cada fila según reglas
 * - Detecta duplicados contra realExpenses existentes
 * - Resuelve la divisa: la detectada en el CSV (si es válida) o la de la cuenta
 */
export function buildImportRows(params: {
  parsedRows: ParsedBankRow[];
  accountId: string;
  accountCurrency: string;
  categories: Category[];
  categoryRules: CategoryRule[];
  realExpenses: RealExpense[];
  idGen?: IdGenerator;
}): ImportRow[] {
  const {
    parsedRows,
    accountId,
    accountCurrency,
    categories,
    categoryRules,
    realExpenses,
    idGen = defaultIdGen,
  } = params;

  return parsedRows.map((r) => {
    const categoryId = autoCategorizeRow(
      r.description,
      r.type,
      categories,
      categoryRules
    );
    const dupId = findDuplicate(r, realExpenses);

    const detected = r.detectedCurrency?.toUpperCase();
    const rowCurrency =
      detected && CURRENCIES.find((c) => c.code === detected)
        ? detected
        : accountCurrency;

    return {
      id: idGen(),
      entryDate: r.entryDate,
      valueDate: r.valueDate,
      description: r.description,
      amount: r.amount,
      type: r.type,
      categoryId,
      accountId,
      currency: rowCurrency,
      status: dupId ? 'duplicate' : 'new',
      duplicateOf: dupId,
      notes: '',
    };
  });
}

/**
 * Re-aplica reglas de categorización a las filas existentes.
 * Respeta cambios manuales: las filas en `manuallyCategorized` no se tocan.
 */
export function reApplyRules(params: {
  rows: ImportRow[];
  categories: Category[];
  categoryRules: CategoryRule[];
  manuallyCategorized: Set<string>;
}): ImportRow[] {
  const { rows, categories, categoryRules, manuallyCategorized } = params;

  return rows.map((row) => {
    if (manuallyCategorized.has(row.id)) return row;
    const categoryId = autoCategorizeRow(
      row.description,
      row.type,
      categories,
      categoryRules
    );
    return { ...row, categoryId };
  });
}

/**
 * Convierte las filas marcadas como 'new' en RealExpense[] listos para persistir.
 * Las filas duplicadas o descartadas se omiten.
 */
export function importRowsToRealExpenses(
  rows: ImportRow[],
  idGen: IdGenerator = defaultIdGen
): RealExpense[] {
  return rows
    .filter((r) => r.status === 'new')
    .map((r) => ({
      id: idGen(),
      entryDate: r.entryDate,
      valueDate: r.valueDate,
      description: r.description,
      categoryId: r.categoryId,
      amount: r.amount,
      currency: r.currency,
      type: r.type,
      accountId: r.accountId,
      notes: r.notes,
    }));
}
