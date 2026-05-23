/**
 * Lógica pura de cálculo para objetivos de ahorro.
 * Extraído de src/views/Goals.tsx el 23/05/2026 (refactor Goals commit 2/5).
 *
 * Estas funciones NO dependen de React ni del contexto de la app.
 * Reciben todo por parámetros para que sean testeables de forma aislada.
 */

import type { SavingsGoal, Account, RealExpense } from '../types';
import { calcGoalProgress, convertAmount } from '../utils';

// ─── Tipos públicos ──────────────────────────────────────────────────────────

export type GoalsGlobalStats = {
  total: number;
  completed: number;
  totalTarget: number;
  totalSaved: number;
};

export type GoalDeadlineProjection = {
  hasProjection: boolean;
  months: number;
  monthly: number;
};

// ─── Funciones puras ─────────────────────────────────────────────────────────

/**
 * Calcula las estadísticas globales agregadas de todos los objetivos.
 * Los importes se convierten a la moneda de visualización.
 */
export function calcGoalsGlobalStats(
  goals: SavingsGoal[],
  realExpenses: RealExpense[],
  accounts: Account[],
  rates: Record<string, number>,
  displayCurrency: string
): GoalsGlobalStats {
  const total = goals.length;
  const completed = goals.filter(
    (g) => calcGoalProgress(g, realExpenses, accounts, rates).completed
  ).length;
  const totalTarget = goals.reduce(
    (s, g) =>
      s + convertAmount(g.targetAmount, g.currency, displayCurrency, rates),
    0
  );
  const totalSaved = goals.reduce(
    (s, g) =>
      s +
      convertAmount(
        calcGoalProgress(g, realExpenses, accounts, rates).saved,
        g.currency,
        displayCurrency,
        rates
      ),
    0
  );
  return { total, completed, totalTarget, totalSaved };
}

/**
 * Calcula la proyección de ahorro mensual necesario para alcanzar
 * el objetivo en la fecha límite.
 *
 * Devuelve hasProjection=false si falta targetAmount o deadline.
 * El cálculo asume meses promedio de 30.44 días.
 * Garantiza un mínimo de 1 mes para evitar divisiones por cero.
 */
export function calcGoalDeadlineProjection(
  targetAmount: number,
  currentAmount: number,
  deadline: string,
  now: Date = new Date()
): GoalDeadlineProjection {
  if (!targetAmount || targetAmount <= 0 || !deadline) {
    return { hasProjection: false, months: 0, monthly: 0 };
  }
  const end = new Date(deadline);
  const months = Math.max(
    1,
    Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
  );
  const remaining = Math.max(0, targetAmount - (currentAmount ?? 0));
  const monthly = remaining / months;
  return { hasProjection: true, months, monthly };
}
