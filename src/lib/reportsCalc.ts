// ─── Lógica pura de Reports.tsx ───────────────────────────────────────────────
// Extraído en Fase 2.1. Sin React, sin hooks, sin efectos. Todo testeable.
//
// Las funciones reciben los datos ya filtrados/normalizados y devuelven
// agregados. El componente Reports.tsx se limita a invocar y renderizar.

import { convertAmount, FREQUENCIES } from '../utils';
import { fmtMonthYear } from './i18nFormats';
import type {
  Account,
  Projection,
  RealExpense,
  SavingsGoal,
} from '../types';

// ─── Tipos públicos ──────────────────────────────────────────────────────────
export type ReportMode = 'month' | 'range';

export type PeriodProjection = {
  proj: Projection;
  mk: string; // monthKey YYYY-MM
};

export type ReportTotals = {
  realIncome: number;
  realExpense: number;
  realNet: number;
  savingsRate: number;
  pIncome: number;
  pExpense: number;
};

export type CatRow = {
  catId: string;
  type: 'income' | 'expense';
  projected: number;
  real: number;
};

export type GoalsStats = {
  total: number;
  completed: number;
  totalTarget: number;
};

export type TrendsStats = {
  validExp: RealExpense[];
  totalInc: number;
  totalExp: number;
  net: number;
  savRate: number;
  months: string[]; // ordenados ASC
};

// ─── 1. Período: claves de mes ───────────────────────────────────────────────
export function computePeriodKeys(
  mode: ReportMode,
  selectedYear: number,
  selectedMonth: number,
  rangeFrom: string,
  rangeTo: string
): string[] {
  if (mode === 'month') {
    return [`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`];
  }
  const keys: string[] = [];
  const [fy, fm] = rangeFrom.split('-').map(Number);
  const [ty, tm] = rangeTo.split('-').map(Number);
  if (!fy || !fm || !ty || !tm) return keys;
  let y = fy, m = fm;
  while (y < ty || (y === ty && m <= tm)) {
    keys.push(`${y}-${String(m).padStart(2, '0')}`);
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return keys;
}

// ─── 2. Etiqueta legible del período ─────────────────────────────────────────
export function computePeriodLabel(
  mode: ReportMode,
  selectedYear: number,
  selectedMonth: number,
  rangeFrom: string,
  rangeTo: string
): string {
  if (mode === 'month') {
    return fmtMonthYear(new Date(selectedYear, selectedMonth, 1));
  }
  if (rangeFrom === rangeTo) return rangeFrom;
  return `${rangeFrom} → ${rangeTo}`;
}

// ─── 3. Filtrar movimientos reales del período ───────────────────────────────
export function filterPeriodReals(
  realExpenses: RealExpense[],
  periodKeys: string[]
): RealExpense[] {
  const set = new Set(periodKeys);
  return realExpenses.filter((e) => set.has(e.valueDate.slice(0, 7)));
}

// ─── 4. Proyecciones que aplican en cada mes del período ─────────────────────
export function computePeriodProjections(
  projections: Projection[],
  periodKeys: string[]
): PeriodProjection[] {
  const result: PeriodProjection[] = [];
  periodKeys.forEach((mk) => {
    const [y, m] = mk.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    projections.forEach((p) => {
      const start = new Date(p.startDate);
      const end = p.endDate ? new Date(p.endDate) : null;
      const freq = FREQUENCIES.find((f) => f.value === p.frequency);
      if (!freq) return;
      const diff =
        (d.getFullYear() - start.getFullYear()) * 12 +
        (d.getMonth() - start.getMonth());
      if (diff < 0 || (end && d > end) || diff % freq.months !== 0) return;
      result.push({ proj: p, mk });
    });
  });
  return result;
}

// ─── 5. Totales agregados (reales + proyectados) ─────────────────────────────
export function computeTotals(
  periodReals: RealExpense[],
  periodProjections: PeriodProjection[],
  accounts: Account[],
  baseCurrency: string,
  displayCurrency: string,
  rates: Record<string, number>
): ReportTotals {
  const realIncome = periodReals
    .filter((e) => e.type === 'income')
    .reduce(
      (s, e) => s + convertAmount(e.amount, e.currency, displayCurrency, rates),
      0
    );
  const realExpense = periodReals
    .filter((e) => e.type === 'expense')
    .reduce(
      (s, e) => s + convertAmount(e.amount, e.currency, displayCurrency, rates),
      0
    );
  let pIncome = 0;
  let pExpense = 0;
  periodProjections.forEach(({ proj }) => {
    const acc = accounts.find((a) => a.id === proj.accountId);
    const amt = convertAmount(
      proj.amount,
      acc?.currency ?? baseCurrency,
      displayCurrency,
      rates
    );
    if (proj.type === 'income') pIncome += amt;
    else if (proj.type === 'expense') pExpense += amt;
    // 'transfer' se ignora intencionadamente (no es income ni expense).
  });
  const realNet = realIncome - realExpense;
  const savingsRate = realIncome > 0 ? (realNet / realIncome) * 100 : 0;
  return { realIncome, realExpense, realNet, savingsRate, pIncome, pExpense };
}

// ─── 6. Filas por categoría (proyectado vs real) ─────────────────────────────
export function computeCatRows(
  periodProjections: PeriodProjection[],
  periodReals: RealExpense[],
  accounts: Account[],
  baseCurrency: string,
  displayCurrency: string,
  rates: Record<string, number>
): CatRow[] {
  const map: Record<string, CatRow> = {};
  periodProjections.forEach(({ proj }) => {
    const acc = accounts.find((a) => a.id === proj.accountId);
    const amt = convertAmount(
      proj.amount,
      acc?.currency ?? baseCurrency,
      displayCurrency,
      rates
    );
    if (!map[proj.categoryId]) {
      map[proj.categoryId] = {
        catId: proj.categoryId,
        type: proj.type === 'income' ? 'income' : 'expense',
        projected: 0,
        real: 0,
      };
    }
    map[proj.categoryId].projected += amt;
  });
  periodReals.forEach((e) => {
    const amt = convertAmount(e.amount, e.currency, displayCurrency, rates);
    if (!map[e.categoryId]) {
      map[e.categoryId] = {
        catId: e.categoryId,
        type: e.type,
        projected: 0,
        real: 0,
      };
    }
    map[e.categoryId].real += amt;
  });
  return Object.values(map).sort((a, b) => {
    if (a.type !== b.type) return a.type === 'expense' ? -1 : 1;
    return b.real - a.real;
  });
}

// ─── 7. Estadísticas de objetivos ────────────────────────────────────────────
// Replica EXACTA del cálculo inline del informe de Goals (sin tocar
// calcGoalProgress que tiene reglas adicionales para la vista de Goals).
export function computeGoalSaved(
  goal: SavingsGoal,
  realExpenses: RealExpense[],
  rates: Record<string, number>
): number {
  if (goal.mode === 'manual') return goal.currentAmount;
  return realExpenses
    .filter(
      (e) =>
        e.categoryId === goal.categoryId &&
        e.type === goal.autoType &&
        e.valueDate >= goal.autoStartDate
    )
    .reduce(
      (s, e) => s + convertAmount(e.amount, e.currency, goal.currency, rates),
      0
    );
}

export function computeGoalsStats(
  goals: SavingsGoal[],
  realExpenses: RealExpense[],
  displayCurrency: string,
  rates: Record<string, number>
): GoalsStats {
  const total = goals.length;
  const completed = goals.filter(
    (g) => computeGoalSaved(g, realExpenses, rates) >= g.targetAmount
  ).length;
  const totalTarget = goals.reduce(
    (s, g) =>
      s + convertAmount(g.targetAmount, g.currency, displayCurrency, rates),
    0
  );
  return { total, completed, totalTarget };
}

// ─── 8. Estadísticas de tendencias ───────────────────────────────────────────
export function computeTrendsStats(
  realExpenses: RealExpense[],
  accounts: Account[],
  periodKeys: string[],
  displayCurrency: string,
  rates: Record<string, number>
): TrendsStats {
  const accountIds = new Set(accounts.map((a) => a.id));
  const keySet = new Set(periodKeys);
  const validExp = realExpenses.filter(
    (e) => accountIds.has(e.accountId) && keySet.has(e.valueDate.slice(0, 7))
  );
  const totalInc = validExp
    .filter((e) => e.type === 'income')
    .reduce(
      (s, e) => s + convertAmount(e.amount, e.currency, displayCurrency, rates),
      0
    );
  const totalExp = validExp
    .filter((e) => e.type === 'expense')
    .reduce(
      (s, e) => s + convertAmount(e.amount, e.currency, displayCurrency, rates),
      0
    );
  const net = totalInc - totalExp;
  const savRate = totalInc > 0 ? (net / totalInc) * 100 : 0;
  const months = Array.from(
    new Set(validExp.map((e) => e.valueDate.slice(0, 7)))
  ).sort();
  return { validExp, totalInc, totalExp, net, savRate, months };
}
