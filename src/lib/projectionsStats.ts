// ════════════════════════════════════════════════════════════════════════════
// projectionsStats.ts
//
// Lógica pura de cálculo, filtrado y formateo para la vista Proyecciones.
// Extraído de src/views/Projections.tsx (Bloque 1.1.2 del refactor Fase 1.1).
//
// Funciones puras (sin React, sin estado). 100% testeable.
// ════════════════════════════════════════════════════════════════════════════

import type { Projection, Account, Category } from '../types';
import { FREQUENCIES, convertAmount } from '../utils';

// ─── Tipos auxiliares ────────────────────────────────────────────────────────

export type ProjectionFilterType = 'all' | 'income' | 'expense';
export type ProjectionSortBy = 'date' | 'amount' | 'name';

export type ProjectionGlobalStats = {
  total: number;
  active: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNet: number;
};

export type TopProjectedExpense = {
  cat: Category;
  val: number;
};

// ════════════════════════════════════════════════════════════════════════════
// filterAndSortProjections
// ════════════════════════════════════════════════════════════════════════════
//
// Aplica filtros (tipo + cuenta) y ordenación a la lista de proyecciones.
// No muta el array original.
// ────────────────────────────────────────────────────────────────────────────

export function filterAndSortProjections(
  projections: Projection[],
  filterType: ProjectionFilterType | string,
  filterAccount: string,
  sortBy: ProjectionSortBy | string
): Projection[] {
  let list = [...projections];

  if (filterType !== 'all') {
    list = list.filter((p) => p.type === filterType);
  }

  if (filterAccount !== 'all') {
    list = list.filter((p) => p.accountId === filterAccount);
  }

  list.sort((a, b) => {
    if (sortBy === 'date') return a.startDate.localeCompare(b.startDate);
    if (sortBy === 'amount') return b.amount - a.amount;
    return a.name.localeCompare(b.name);
  });

  return list;
}

// ════════════════════════════════════════════════════════════════════════════
// calcProjectionGlobalStats
// ════════════════════════════════════════════════════════════════════════════
//
// Calcula totales globales (totales + activas + ingresos/gastos/neto mensual).
//
// 💰 IMPORTANTE: monthlyExpense incluye:
//    • Gastos directos (type === 'expense')
//    • Cuotas de préstamo (transfers con linkedLoanId) — son dinero que sale
//      del patrimonio para reducir deuda. Para el usuario es un gasto real.
//    • Las transfers normales entre cuentas propias NO cuentan: el dinero
//      sigue siendo del usuario, solo cambia de bolsillo.
// ────────────────────────────────────────────────────────────────────────────

export function calcProjectionGlobalStats(
  projections: Projection[],
  displayCurrency: string,
  rates: Record<string, number>,
  baseCurrency: string
): ProjectionGlobalStats {
  const active = projections.filter((p) => p.active !== false);

  const monthlyIncome = active
    .filter((p) => p.type === 'income')
    .reduce((s, p) => {
      const base = convertAmount(
        p.amount,
        p.currency ?? baseCurrency,
        displayCurrency,
        rates
      );
      const freq = FREQUENCIES.find((f) => f.value === p.frequency);
      return s + base * (freq?.factor ?? 1);
    }, 0);

  const monthlyExpense = active
    .filter((p) => p.type === 'expense' || !!p.linkedLoanId)
    .reduce((s, p) => {
      const base = convertAmount(
        p.amount,
        p.currency ?? baseCurrency,
        displayCurrency,
        rates
      );
      const freq = FREQUENCIES.find((f) => f.value === p.frequency);
      return s + base * (freq?.factor ?? 1);
    }, 0);

  return {
    total: projections.length,
    active: active.length,
    monthlyIncome,
    monthlyExpense,
    monthlyNet: monthlyIncome - monthlyExpense,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// buildPrintSubtitle
// ════════════════════════════════════════════════════════════════════════════
//
// Construye el subtítulo para impresión: filtros aplicados + contador.
// ────────────────────────────────────────────────────────────────────────────

export function buildPrintSubtitle(
  filterType: ProjectionFilterType | string,
  filterAccount: string,
  accounts: Account[],
  stats: Pick<ProjectionGlobalStats, 'active' | 'total'>
): string {
  const parts: string[] = [];

  if (filterType !== 'all') {
    parts.push(filterType === 'income' ? 'Tipo: Ingresos' : 'Tipo: Gastos');
  }

  if (filterAccount !== 'all') {
    const acc = accounts.find((a) => a.id === filterAccount);
    if (acc) parts.push(`Cuenta: ${acc.name}`);
  }

  parts.push(
    `${stats.active} activa${stats.active !== 1 ? 's' : ''} de ${
      stats.total
    } proyección${stats.total !== 1 ? 'es' : ''}`
  );

  return parts.join(' · ');
}

// ════════════════════════════════════════════════════════════════════════════
// calcTopProjectedExpenses
// ════════════════════════════════════════════════════════════════════════════
//
// Top N categorías con más gasto proyectado mensual.
// Solo considera proyecciones activas de tipo 'expense'.
// Ignora categorías que ya no existen.
// ────────────────────────────────────────────────────────────────────────────

export function calcTopProjectedExpenses(
  projections: Projection[],
  categories: Category[],
  topN: number = 5
): TopProjectedExpense[] {
  const map: Record<string, number> = {};

  projections
    .filter((p) => p.type === 'expense' && p.active !== false)
    .forEach((p) => {
      const freq = FREQUENCIES.find((f) => f.value === p.frequency);
      map[p.categoryId] =
        (map[p.categoryId] || 0) + (freq ? p.amount / freq.months : 0);
    });

  return Object.entries(map)
    .map(([id, val]) => ({
      cat: categories.find((c) => c.id === id),
      val,
    }))
    .filter((x): x is TopProjectedExpense => !!x.cat)
    .sort((a, b) => b.val - a.val)
    .slice(0, topN);
}
