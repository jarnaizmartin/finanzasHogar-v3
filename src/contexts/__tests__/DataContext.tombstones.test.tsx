import { describe, it, expect, beforeEach } from 'vitest';
import { useEffect } from 'react';
import { act, render } from '@testing-library/react';
import { useData } from '../DataContext';
import { DataProvider } from '../DataProvider';
import type { DataContextType } from '../DataContext';
import type {
  Account,
  Category,
  Projection,
  RealExpense,
  SavingsGoal,
  CategoryRule,
  BankFormat,
} from '../../types';
import {
  mkAccount,
  mkCategory,
  mkProjection,
  mkRealExpense,
  mkGoal,
  mkCategoryRule,
  mkBankFormat,
} from '../../test-fixtures';

// Captura el valor del contexto para poder ejercitar la API de borrado y
// leer las listas filtradas (UI) y la lista completa (raw, para sync).
let api: DataContextType;
function Probe() {
  const value = useData();
  // La captura va en un efecto, no en el render: escribir en una variable de
  // módulo mientras se renderiza es justo lo que prohíbe react-hooks/globals
  // (un render debe poder repetirse sin efectos colaterales).
  useEffect(() => {
    api = value;
  });
  return null;
}

function mountProvider() {
  render(
    <DataProvider>
      <Probe />
    </DataProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('DataContext — frontera de tombstones', () => {
  it('deleteCategory: marca deletedAt, la UI no lo ve, raw sí lo conserva', () => {
    mountProvider();
    act(() => {
      api.setCategories([
        mkCategory({ id: 'c1', name: 'Comida' }),
        mkCategory({ id: 'c2', name: 'Ocio' }),
      ]);
    });
    expect(api.categories.map((c) => c.id)).toEqual(['c1', 'c2']);

    act(() => api.deleteCategory('c1'));

    // UI: solo vivos
    expect(api.categories.map((c) => c.id)).toEqual(['c2']);
    // raw: conserva el tombstone con deletedAt
    expect(api.raw.categories).toHaveLength(2);
    const c1 = api.raw.categories.find((c) => c.id === 'c1')!;
    expect(c1.deletedAt).toBeTypeOf('number');
  });

  it('borrar es idempotente (segundo borrado no cambia el deletedAt)', () => {
    mountProvider();
    act(() => api.setGoals([mkGoal({ id: 'g1', name: 'Meta' })]));
    act(() => api.deleteGoal('g1'));
    const first = api.raw.goals.find((g) => g.id === 'g1')!.deletedAt;
    act(() => api.deleteGoal('g1'));
    const second = api.raw.goals.find((g) => g.id === 'g1')!.deletedAt;
    expect(second).toBe(first);
  });

  it('deleteTransfer tombstonea el par de movimientos del traspaso', () => {
    mountProvider();
    act(() => {
      api.setRealExpenses([
        mkRealExpense({ id: 'm1', transferId: 't1' }),
        mkRealExpense({ id: 'm2', transferId: 't1' }),
        mkRealExpense({ id: 'm3' }),
      ]);
    });
    act(() => api.deleteTransfer('t1'));
    expect(api.realExpenses.map((e) => e.id)).toEqual(['m3']);
    expect(api.raw.realExpenses).toHaveLength(3);
    expect(api.raw.realExpenses.filter((e) => e.deletedAt)).toHaveLength(2);
  });

  it('deleteRealExpensesWhere borra por predicado', () => {
    mountProvider();
    act(() => {
      api.setRealExpenses([
        mkRealExpense({ id: 'm1', amount: 100 }),
        mkRealExpense({ id: 'm2', amount: 50 }),
        mkRealExpense({ id: 'm3', amount: 100 }),
      ]);
    });
    act(() => api.deleteRealExpensesWhere((e) => e.amount === 100));
    expect(api.realExpenses.map((e) => e.id)).toEqual(['m2']);
    expect(api.raw.realExpenses).toHaveLength(3);
  });
});

describe('DataContext — applySyncedData (aplicar merge del sync)', () => {
  const emptyData = {
    accounts: [] as Account[],
    categories: [] as Category[],
    projections: [] as Projection[],
    realExpenses: [] as RealExpense[],
    goals: [] as SavingsGoal[],
    bankFormats: [] as BankFormat[],
    categoryRules: [] as CategoryRule[],
  };

  it('reemplaza las colecciones SIN re-sellar updatedAt (preserva el LWW)', () => {
    mountProvider();
    // Sembramos algo distinto para asegurar que es un reemplazo, no un merge local.
    act(() => api.setAccounts([mkAccount({ id: 'viejo', name: 'Viejo' })]));

    const merged = {
      ...emptyData,
      accounts: [
        mkAccount({ id: 'a1', name: 'Remota', createdAt: 100, updatedAt: 12345 }),
        mkAccount({ id: 'a2', name: 'Borrada', createdAt: 100, updatedAt: 200, deletedAt: 200 }),
      ],
    };
    act(() => api.applySyncedData(merged));

    // updatedAt llega VERBATIM (no re-sellado a Date.now())
    expect(api.raw.accounts.find((a) => a.id === 'a1')!.updatedAt).toBe(12345);
    // El tombstone se conserva en raw pero la UI no lo ve
    expect(api.raw.accounts).toHaveLength(2);
    expect(api.accounts.map((a) => a.id)).toEqual(['a1']);
    // El estado anterior fue reemplazado por completo
    expect(api.raw.accounts.find((a) => a.id === 'viejo')).toBeUndefined();
  });

  it('aplica las 7 colecciones', () => {
    mountProvider();
    act(() =>
      api.applySyncedData({
        accounts: [mkAccount({ id: 'a', updatedAt: 1 })],
        categories: [mkCategory({ id: 'c', updatedAt: 1 })],
        projections: [mkProjection({ id: 'p', updatedAt: 1 })],
        realExpenses: [mkRealExpense({ id: 'm', updatedAt: 1 })],
        goals: [mkGoal({ id: 'g', updatedAt: 1 })],
        bankFormats: [mkBankFormat({ id: 'b', updatedAt: 1 })],
        categoryRules: [mkCategoryRule({ id: 'r', updatedAt: 1 })],
      })
    );
    expect(api.raw.accounts).toHaveLength(1);
    expect(api.raw.categories).toHaveLength(1);
    expect(api.raw.projections).toHaveLength(1);
    expect(api.raw.realExpenses).toHaveLength(1);
    expect(api.raw.goals).toHaveLength(1);
    expect(api.raw.bankFormats).toHaveLength(1);
    expect(api.raw.categoryRules).toHaveLength(1);
  });
});

describe('DataContext — cascada de borrado de cuenta', () => {
  it('deleteAccount tombstonea la cuenta y sus hijos (movimientos, proyecciones y objetivos auto)', () => {
    mountProvider();
    act(() => {
      api.setAccounts([
        mkAccount({ id: 'loan1', accountType: 'loan', linkedProjectionId: 'pLinked' }),
        mkAccount({ id: 'acc2', accountType: 'checking' }),
      ]);
      api.setRealExpenses([
        mkRealExpense({ id: 'm1', accountId: 'loan1' }),
        mkRealExpense({ id: 'm2', accountId: 'acc2' }),
      ]);
      api.setProjections([
        mkProjection({ id: 'pOrigin', accountId: 'loan1', type: 'expense' }),       // origen = cuenta borrada
        mkProjection({ id: 'pLinked', accountId: 'acc2', type: 'expense' }),        // proyección vinculada del préstamo
        mkProjection({ id: 'pToLoan', accountId: 'acc2', type: 'transfer', toAccountId: 'loan1' }), // traspaso con destino el préstamo
        mkProjection({ id: 'pOther', accountId: 'acc2', type: 'expense' }),         // ajena → sobrevive
      ]);
      api.setGoals([
        mkGoal({ id: 'gAuto', mode: 'auto', accountId: 'loan1' }),            // objetivo auto ligado → se borra
        mkGoal({ id: 'gManual', mode: 'manual', accountId: 'loan1' }),        // manual → sobrevive
      ]);
    });

    act(() => api.deleteAccount('loan1'));

    // Cuenta borrada; la otra sobrevive
    expect(api.accounts.map((a) => a.id)).toEqual(['acc2']);
    // Movimientos: solo el de la cuenta borrada desaparece de la UI
    expect(api.realExpenses.map((e) => e.id)).toEqual(['m2']);
    // Proyecciones: las 3 ligadas a la cuenta caen; la ajena sobrevive
    expect(api.projections.map((p) => p.id)).toEqual(['pOther']);
    // Objetivos: el auto cae; el manual sobrevive
    expect(api.goals.map((g) => g.id)).toEqual(['gManual']);

    // raw conserva TODO con tombstones (para que el sync propague los borrados)
    expect(api.raw.accounts).toHaveLength(2);
    expect(api.raw.projections).toHaveLength(4);
    expect(api.raw.realExpenses.find((e) => e.id === 'm1')!.deletedAt).toBeTypeOf('number');
    expect(api.raw.goals.find((g) => g.id === 'gAuto')!.deletedAt).toBeTypeOf('number');
  });
});
