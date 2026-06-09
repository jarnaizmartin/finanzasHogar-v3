import { describe, it, expect, beforeEach } from 'vitest';
import { act, render } from '@testing-library/react';
import { DataProvider, useData } from '../DataContext';
import type { DataContextType } from '../DataContext';

// Captura el valor del contexto para poder ejercitar la API de borrado y
// leer las listas filtradas (UI) y la lista completa (raw, para sync).
let api: DataContextType;
function Probe() {
  api = useData();
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
        { id: 'c1', name: 'Comida' } as any,
        { id: 'c2', name: 'Ocio' } as any,
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
    act(() => api.setGoals([{ id: 'g1', name: 'Meta' } as any]));
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
        { id: 'm1', transferId: 't1' } as any,
        { id: 'm2', transferId: 't1' } as any,
        { id: 'm3' } as any,
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
        { id: 'm1', amount: 100 } as any,
        { id: 'm2', amount: 50 } as any,
        { id: 'm3', amount: 100 } as any,
      ]);
    });
    act(() => api.deleteRealExpensesWhere((e) => e.amount === 100));
    expect(api.realExpenses.map((e) => e.id)).toEqual(['m2']);
    expect(api.raw.realExpenses).toHaveLength(3);
  });
});

describe('DataContext — cascada de borrado de cuenta', () => {
  it('deleteAccount tombstonea la cuenta y sus hijos (movimientos, proyecciones y objetivos auto)', () => {
    mountProvider();
    act(() => {
      api.setAccounts([
        { id: 'loan1', accountType: 'loan', linkedProjectionId: 'pLinked' } as any,
        { id: 'acc2', accountType: 'checking' } as any,
      ]);
      api.setRealExpenses([
        { id: 'm1', accountId: 'loan1' } as any,
        { id: 'm2', accountId: 'acc2' } as any,
      ]);
      api.setProjections([
        { id: 'pOrigin', accountId: 'loan1', type: 'expense' } as any,       // origen = cuenta borrada
        { id: 'pLinked', accountId: 'acc2', type: 'expense' } as any,        // proyección vinculada del préstamo
        { id: 'pToLoan', accountId: 'acc2', type: 'transfer', toAccountId: 'loan1' } as any, // traspaso con destino el préstamo
        { id: 'pOther', accountId: 'acc2', type: 'expense' } as any,         // ajena → sobrevive
      ]);
      api.setGoals([
        { id: 'gAuto', mode: 'auto', accountId: 'loan1' } as any,            // objetivo auto ligado → se borra
        { id: 'gManual', mode: 'manual', accountId: 'loan1' } as any,        // manual → sobrevive
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
