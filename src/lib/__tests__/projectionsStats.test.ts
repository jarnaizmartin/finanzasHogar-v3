// ════════════════════════════════════════════════════════════════════════════
// projectionsStats.test.ts
// Tests del módulo projectionsStats (Bloque 1.1.2)
// ════════════════════════════════════════════════════════════════════════════

import { describe, it, expect } from 'vitest';
import {
  filterAndSortProjections,
  calcProjectionGlobalStats,
  buildPrintSubtitle,
  calcTopProjectedExpenses,
} from '../projectionsStats';
import type { Projection, Account, Category } from '../../types';

// ─── Helpers ────────────────────────────────────────────────────────────────

const makeProj = (overrides: Partial<Projection> = {}): Projection =>
  ({
    id: overrides.id ?? 'p1',
    name: overrides.name ?? 'Test',
    type: overrides.type ?? 'expense',
    amount: overrides.amount ?? 100,
    currency: overrides.currency ?? 'EUR',
    frequency: overrides.frequency ?? 'monthly',
    startDate: overrides.startDate ?? '2025-01-01',
    endDate: overrides.endDate,
    categoryId: overrides.categoryId ?? 'cat1',
    accountId: overrides.accountId ?? 'acc1',
    toAccountId: overrides.toAccountId,
    notes: overrides.notes,
    active: overrides.active,
    isRecurring: overrides.isRecurring,
    linkedLoanId: overrides.linkedLoanId,
    ...overrides,
  } as Projection);

const makeAcc = (id: string, name: string): Account =>
  ({ id, name, currency: 'EUR', type: 'checking', balance: 0 } as Account);

const makeCat = (id: string, name: string, type: 'income' | 'expense' = 'expense'): Category =>
  ({ id, name, type, color: '#000', icon: '💰' } as Category);

const rates = { EUR: 1, USD: 1.1 };

// ════════════════════════════════════════════════════════════════════════════
// filterAndSortProjections
// ════════════════════════════════════════════════════════════════════════════

describe('filterAndSortProjections', () => {
  const projs = [
    makeProj({ id: '1', name: 'Charlie', type: 'expense', amount: 50, startDate: '2025-03-01', accountId: 'acc1' }),
    makeProj({ id: '2', name: 'Alpha',   type: 'income',  amount: 200, startDate: '2025-01-01', accountId: 'acc2' }),
    makeProj({ id: '3', name: 'Bravo',   type: 'expense', amount: 100, startDate: '2025-02-01', accountId: 'acc1' }),
  ];

  it('devuelve todas con filtros "all"', () => {
    const r = filterAndSortProjections(projs, 'all', 'all', 'date');
    expect(r).toHaveLength(3);
  });

  it('filtra por tipo income', () => {
    const r = filterAndSortProjections(projs, 'income', 'all', 'date');
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe('2');
  });

  it('filtra por tipo expense', () => {
    const r = filterAndSortProjections(projs, 'expense', 'all', 'date');
    expect(r).toHaveLength(2);
  });

  it('filtra por cuenta', () => {
    const r = filterAndSortProjections(projs, 'all', 'acc1', 'date');
    expect(r).toHaveLength(2);
    expect(r.every((p) => p.accountId === 'acc1')).toBe(true);
  });

  it('combina filtros tipo + cuenta', () => {
    const r = filterAndSortProjections(projs, 'expense', 'acc1', 'date');
    expect(r).toHaveLength(2);
  });

  it('ordena por fecha ascendente', () => {
    const r = filterAndSortProjections(projs, 'all', 'all', 'date');
    expect(r.map((p) => p.id)).toEqual(['2', '3', '1']);
  });

  it('ordena por importe descendente', () => {
    const r = filterAndSortProjections(projs, 'all', 'all', 'amount');
    expect(r.map((p) => p.id)).toEqual(['2', '3', '1']);
  });

  it('ordena por nombre alfabético', () => {
    const r = filterAndSortProjections(projs, 'all', 'all', 'name');
    expect(r.map((p) => p.name)).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });

  it('no muta el array original', () => {
    const original = [...projs];
    filterAndSortProjections(projs, 'all', 'all', 'amount');
    expect(projs).toEqual(original);
  });

  it('devuelve [] si no hay matches', () => {
    const r = filterAndSortProjections(projs, 'income', 'acc1', 'date');
    expect(r).toEqual([]);
  });

  it('maneja array vacío', () => {
    const r = filterAndSortProjections([], 'all', 'all', 'date');
    expect(r).toEqual([]);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// calcProjectionGlobalStats
// ════════════════════════════════════════════════════════════════════════════

describe('calcProjectionGlobalStats', () => {
  it('cuenta total y activas', () => {
    const projs = [
      makeProj({ id: '1', active: true }),
      makeProj({ id: '2', active: false }),
      makeProj({ id: '3' }), // active undefined → cuenta como activa
    ];
    const s = calcProjectionGlobalStats(projs, 'EUR', rates, 'EUR');
    expect(s.total).toBe(3);
    expect(s.active).toBe(2);
  });

  it('suma ingresos mensuales (monthly)', () => {
    const projs = [
      makeProj({ type: 'income', amount: 1000, frequency: 'monthly' }),
    ];
    const s = calcProjectionGlobalStats(projs, 'EUR', rates, 'EUR');
    expect(s.monthlyIncome).toBe(1000);
  });

  it('frecuencia desconocida usa periodo 1 (fallback)', () => {
    const projs = [
      makeProj({ type: 'income', amount: 500, frequency: 'inexistente' as any }),
    ];
    const s = calcProjectionGlobalStats(projs, 'EUR', rates, 'EUR');
    expect(s.monthlyIncome).toBe(500);
  });

  it('normaliza a mensual dividiendo por el periodo (anual, trimestral, semestral)', () => {
    // Bug s.72: antes se contaba el importe ÍNTEGRO como mensual (el `factor`
    // que debía dividir por la frecuencia no existía → una anual de 1200
    // inflaba a 1200/mes en vez de 100/mes).
    const s = calcProjectionGlobalStats(
      [
        makeProj({ type: 'income', amount: 1200, frequency: 'annual' }),    // 100/mes
        makeProj({ type: 'expense', amount: 300, frequency: 'quarterly' }), // 100/mes
        makeProj({ type: 'expense', amount: 600, frequency: 'biannual' }),  // 100/mes
      ],
      'EUR', rates, 'EUR'
    );
    expect(s.monthlyIncome).toBe(100);
    expect(s.monthlyExpense).toBe(200);
  });

  it('suma gastos directos (type=expense)', () => {
    const projs = [
      makeProj({ type: 'expense', amount: 300, frequency: 'monthly' }),
    ];
    const s = calcProjectionGlobalStats(projs, 'EUR', rates, 'EUR');
    expect(s.monthlyExpense).toBe(300);
  });

  it('cuotas de préstamo (transfer + linkedLoanId) cuentan como gasto', () => {
    const projs = [
      makeProj({
        type: 'transfer',
        amount: 500,
        frequency: 'monthly',
        linkedLoanId: 'loan1',
      }),
    ];
    const s = calcProjectionGlobalStats(projs, 'EUR', rates, 'EUR');
    expect(s.monthlyExpense).toBe(500);
  });

  it('transfers normales NO cuentan como gasto', () => {
    const projs = [
      makeProj({ type: 'transfer', amount: 500, frequency: 'monthly' }),
    ];
    const s = calcProjectionGlobalStats(projs, 'EUR', rates, 'EUR');
    expect(s.monthlyExpense).toBe(0);
  });

  it('ignora proyecciones pausadas', () => {
    const projs = [
      makeProj({ type: 'income', amount: 1000, active: false }),
      makeProj({ type: 'expense', amount: 500, active: false }),
    ];
    const s = calcProjectionGlobalStats(projs, 'EUR', rates, 'EUR');
    expect(s.monthlyIncome).toBe(0);
    expect(s.monthlyExpense).toBe(0);
  });

  it('calcula neto = ingresos - gastos', () => {
    const projs = [
      makeProj({ id: '1', type: 'income', amount: 2000 }),
      makeProj({ id: '2', type: 'expense', amount: 800 }),
    ];
    const s = calcProjectionGlobalStats(projs, 'EUR', rates, 'EUR');
    expect(s.monthlyNet).toBe(1200);
  });

  it('neto puede ser negativo', () => {
    const projs = [
      makeProj({ id: '1', type: 'income', amount: 500 }),
      makeProj({ id: '2', type: 'expense', amount: 800 }),
    ];
    const s = calcProjectionGlobalStats(projs, 'EUR', rates, 'EUR');
    expect(s.monthlyNet).toBe(-300);
  });

  it('maneja lista vacía', () => {
    const s = calcProjectionGlobalStats([], 'EUR', rates, 'EUR');
    expect(s).toEqual({
      total: 0,
      active: 0,
      monthlyIncome: 0,
      monthlyExpense: 0,
      monthlyNet: 0,
    });
  });

  it('usa baseCurrency si la proyección no tiene currency', () => {
    const projs = [
      makeProj({ type: 'income', amount: 100, currency: undefined as any }),
    ];
    const s = calcProjectionGlobalStats(projs, 'EUR', rates, 'EUR');
    expect(s.monthlyIncome).toBe(100);
  });

  it('combina ingresos, gastos directos y cuotas de préstamo', () => {
    const projs = [
      makeProj({ id: '1', type: 'income', amount: 3000 }),
      makeProj({ id: '2', type: 'expense', amount: 1000 }),
      makeProj({ id: '3', type: 'transfer', amount: 600, linkedLoanId: 'L1' }),
      makeProj({ id: '4', type: 'transfer', amount: 200 }), // no cuenta
    ];
    const s = calcProjectionGlobalStats(projs, 'EUR', rates, 'EUR');
    expect(s.monthlyIncome).toBe(3000);
    expect(s.monthlyExpense).toBe(1600);
    expect(s.monthlyNet).toBe(1400);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// buildPrintSubtitle
// ════════════════════════════════════════════════════════════════════════════

describe('buildPrintSubtitle', () => {
  const accs = [makeAcc('acc1', 'Cuenta Principal'), makeAcc('acc2', 'Ahorros')];

  it('sin filtros muestra solo contador', () => {
    const r = buildPrintSubtitle('all', 'all', accs, { active: 5, total: 8 });
    // Nota: "proyecciónes" (con tilde) es el comportamiento original preservado
    expect(r).toBe('5 activas de 8 proyecciónes');
  });

  it('singular cuando active=1', () => {
    const r = buildPrintSubtitle('all', 'all', accs, { active: 1, total: 3 });
    expect(r).toBe('1 activa de 3 proyecciónes');
  });

  it('singular cuando total=1', () => {
    const r = buildPrintSubtitle('all', 'all', accs, { active: 1, total: 1 });
    expect(r).toBe('1 activa de 1 proyección');
  });

  it('incluye filtro de tipo income', () => {
    const r = buildPrintSubtitle('income', 'all', accs, { active: 2, total: 5 });
    expect(r).toContain('Tipo: Ingresos');
    expect(r).toContain('2 activas de 5 proyecciónes');
  });

  it('incluye filtro de tipo expense', () => {
    const r = buildPrintSubtitle('expense', 'all', accs, { active: 3, total: 7 });
    expect(r).toContain('Tipo: Gastos');
  });

  it('incluye filtro de cuenta', () => {
    const r = buildPrintSubtitle('all', 'acc1', accs, { active: 2, total: 4 });
    expect(r).toContain('Cuenta: Cuenta Principal');
  });

  it('combina ambos filtros', () => {
    const r = buildPrintSubtitle('income', 'acc2', accs, { active: 1, total: 6 });
    expect(r).toContain('Tipo: Ingresos');
    expect(r).toContain('Cuenta: Ahorros');
    expect(r.split(' · ')).toHaveLength(3);
  });

  it('ignora cuenta inexistente', () => {
    const r = buildPrintSubtitle('all', 'acc-fantasma', accs, { active: 1, total: 1 });
    expect(r).not.toContain('Cuenta:');
  });

  it('cero proyecciones', () => {
    const r = buildPrintSubtitle('all', 'all', accs, { active: 0, total: 0 });
    expect(r).toBe('0 activas de 0 proyecciónes');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// calcTopProjectedExpenses
// ════════════════════════════════════════════════════════════════════════════

describe('calcTopProjectedExpenses', () => {
  const cats = [
    makeCat('c1', 'Alimentación'),
    makeCat('c2', 'Transporte'),
    makeCat('c3', 'Ocio'),
    makeCat('c4', 'Salud'),
    makeCat('c5', 'Hogar'),
    makeCat('c6', 'Otros'),
  ];

  it('agrupa por categoría y devuelve ordenado desc', () => {
    const projs = [
      makeProj({ id: '1', type: 'expense', amount: 100, categoryId: 'c1', frequency: 'monthly' }),
      makeProj({ id: '2', type: 'expense', amount: 50,  categoryId: 'c2', frequency: 'monthly' }),
      makeProj({ id: '3', type: 'expense', amount: 200, categoryId: 'c3', frequency: 'monthly' }),
    ];
    const r = calcTopProjectedExpenses(projs, cats);
    expect(r.map((x) => x.cat.id)).toEqual(['c3', 'c1', 'c2']);
  });

  it('suma múltiples gastos de la misma categoría', () => {
    const projs = [
      makeProj({ id: '1', type: 'expense', amount: 100, categoryId: 'c1' }),
      makeProj({ id: '2', type: 'expense', amount: 50,  categoryId: 'c1' }),
    ];
    const r = calcTopProjectedExpenses(projs, cats);
    expect(r[0].val).toBe(150);
  });

  it('aplica división por meses según frecuencia (anual)', () => {
    const projs = [
      makeProj({ id: '1', type: 'expense', amount: 1200, categoryId: 'c1', frequency: 'annual' }),
    ];
    const r = calcTopProjectedExpenses(projs, cats);
    expect(r[0].val).toBeCloseTo(100, 2);
  });

  it('ignora ingresos', () => {
    const projs = [
      makeProj({ id: '1', type: 'income',  amount: 1000, categoryId: 'c1' }),
      makeProj({ id: '2', type: 'expense', amount: 100,  categoryId: 'c2' }),
    ];
    const r = calcTopProjectedExpenses(projs, cats);
    expect(r).toHaveLength(1);
    expect(r[0].cat.id).toBe('c2');
  });

  it('ignora transfers (incluso con linkedLoanId)', () => {
    const projs = [
      makeProj({ id: '1', type: 'transfer', amount: 500, categoryId: 'c1', linkedLoanId: 'L1' }),
      makeProj({ id: '2', type: 'expense',  amount: 100, categoryId: 'c2' }),
    ];
    const r = calcTopProjectedExpenses(projs, cats);
    expect(r).toHaveLength(1);
    expect(r[0].cat.id).toBe('c2');
  });

  it('ignora pausadas', () => {
    const projs = [
      makeProj({ id: '1', type: 'expense', amount: 100, categoryId: 'c1', active: false }),
      makeProj({ id: '2', type: 'expense', amount: 50,  categoryId: 'c2' }),
    ];
    const r = calcTopProjectedExpenses(projs, cats);
    expect(r).toHaveLength(1);
    expect(r[0].cat.id).toBe('c2');
  });

  it('ignora categorías inexistentes', () => {
    const projs = [
      makeProj({ id: '1', type: 'expense', amount: 100, categoryId: 'c-fantasma' }),
      makeProj({ id: '2', type: 'expense', amount: 50,  categoryId: 'c1' }),
    ];
    const r = calcTopProjectedExpenses(projs, cats);
    expect(r).toHaveLength(1);
    expect(r[0].cat.id).toBe('c1');
  });

  it('limita a topN=5 por defecto', () => {
    const projs = cats.map((c, i) =>
      makeProj({ id: String(i), type: 'expense', amount: (i + 1) * 100, categoryId: c.id })
    );
    const r = calcTopProjectedExpenses(projs, cats);
    expect(r).toHaveLength(5);
  });

  it('respeta topN custom', () => {
    const projs = cats.map((c, i) =>
      makeProj({ id: String(i), type: 'expense', amount: (i + 1) * 100, categoryId: c.id })
    );
    const r = calcTopProjectedExpenses(projs, cats, 3);
    expect(r).toHaveLength(3);
  });

  it('maneja lista vacía', () => {
    const r = calcTopProjectedExpenses([], cats);
    expect(r).toEqual([]);
  });
});
