// ─── Piezas compartidas por los tests ────────────────────────────────────────
// Solo para tests (no entra en el bundle: nadie de src/ la importa).

import { DARK } from './theme';
import type { Theme } from './theme';
import type {
  Account,
  Category,
  Projection,
  RealExpense,
  SavingsGoal,
  CategoryRule,
  BankFormat,
} from './types';

/**
 * Timestamps de fixture. Las entidades de la app son `Timestamped`: en la vida
 * real las sella `wrapSetter` al escribir, así que un objeto de test que se
 * hace pasar por entidad guardada también los lleva.
 *
 * Valor fijo (2023-11-14) para que los tests sean deterministas. Se sobrescribe
 * poniendo createdAt/updatedAt DESPUÉS del spread cuando un test los necesite.
 */
export const TEST_STAMPS = {
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_000_000,
};

/**
 * Theme real para los tests que montan componentes.
 *
 * Antes cada test escribía a mano un objeto con los 3-9 tokens que usaba el
 * componente. Eso deja de compilar en cuanto el componente pasa su `T` a otro
 * (y además el test no se entera si un token desaparece del theme de verdad).
 */
export const TEST_THEME: Theme = DARK;

// ─── Factorías de entidades ──────────────────────────────────────────────────
//
// Una entidad MÍNIMA PERO VÁLIDA de cada tipo, con todos sus campos
// obligatorios y timestamps. Se sobrescribe lo que el test necesite:
//
//   mkCategory({ id: 'c1', name: 'Comida' })
//
// Antes cada test se inventaba `{ id: 'c1', name: 'Comida' } as any`. El `as
// any` apagaba el compilador justo donde más útil era: si mañana `Category`
// gana un campo obligatorio, el fixture sigue compilando y el test miente
// (así se coló en la s.72 que demoData creara categorías sin `type`).

export const mkAccount = (over: Partial<Account> = {}): Account => ({
  ...TEST_STAMPS,
  id: 'acc-1',
  name: 'Cuenta',
  balance: 1000,
  currency: 'EUR',
  date: '2025-01-01',
  accountType: 'checking',
  ...over,
});

export const mkCategory = (over: Partial<Category> = {}): Category => ({
  ...TEST_STAMPS,
  id: 'cat-1',
  name: 'Categoría',
  type: 'expense',
  color: '#64748b',
  ...over,
});

export const mkProjection = (over: Partial<Projection> = {}): Projection => ({
  ...TEST_STAMPS,
  id: 'proj-1',
  name: 'Proyección',
  accountId: 'acc-1',
  categoryId: 'cat-1',
  type: 'expense',
  amount: 100,
  currency: 'EUR',
  frequency: 'monthly',
  startDate: '2025-01-01',
  endDate: '',
  ...over,
});

export const mkRealExpense = (over: Partial<RealExpense> = {}): RealExpense => ({
  ...TEST_STAMPS,
  id: 'exp-1',
  entryDate: '2025-01-15',
  valueDate: '2025-01-15',
  description: 'Movimiento',
  categoryId: 'cat-1',
  amount: 50,
  currency: 'EUR',
  type: 'expense',
  accountId: 'acc-1',
  notes: '',
  ...over,
});

export const mkGoal = (over: Partial<SavingsGoal> = {}): SavingsGoal => ({
  ...TEST_STAMPS,
  id: 'goal-1',
  name: 'Objetivo',
  emoji: '🎯',
  color: '#2563eb',
  targetAmount: 1000,
  currency: 'EUR',
  deadline: '2025-12-31',
  mode: 'manual',
  currentAmount: 0,
  categoryId: 'cat-1',
  accountId: 'acc-1',
  autoType: 'income',
  autoStartDate: '2025-01-01',
  ...over,
});

export const mkCategoryRule = (over: Partial<CategoryRule> = {}): CategoryRule => ({
  ...TEST_STAMPS,
  id: 'rule-1',
  categoryId: 'cat-1',
  keywords: ['palabra'],
  ...over,
});

export const mkBankFormat = (over: Partial<BankFormat> = {}): BankFormat => ({
  ...TEST_STAMPS,
  id: 'fmt-1',
  name: 'Banco',
  isCustom: false,
  separator: ';',
  decimal: ',',
  encoding: 'utf-8',
  skipRows: 0,
  dateFormat: 'dd/mm/yyyy',
  amountMode: 'single',
  columns: ['date', 'description', 'amount'],
  negativeIsExpense: true,
  ...over,
});
