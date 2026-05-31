import { FREQUENCIES, monthKey, convertAmount } from '../utils';
import type { Projection, RealExpense, Account, SavingsGoal } from '../types';

export interface AnnualMonthStats {
  monthIdx: number;
  mk: string;
  label: string;
  netBalance: number;
  realIncome: number;
  realExpense: number;
  realNet: number;
  hasRealMovements: boolean;
  expiringGoals: SavingsGoal[];
  hasAlert: boolean;
  isPast: boolean;
  isCurrent: boolean;
}

export function getProjectionsForDay(
  projections: Projection[],
  year: number,
  month: number,
  day: number
): Projection[] {
  return projections.filter((p) => {
    const start = new Date(p.startDate + 'T00:00:00');
    const end = p.endDate ? new Date(p.endDate + 'T23:59:59') : null;
    if (start.getDate() !== day) return false;
    if (start > new Date(year, month + 1, 0)) return false;
    if (end && end < new Date(year, month, day)) return false;
    const freq = FREQUENCIES.find((f) => f.value === p.frequency);
    if (!freq) return false;
    const diffMonths = (year - start.getFullYear()) * 12 + (month - start.getMonth());
    if (diffMonths < 0) return false;
    if (diffMonths % freq.months !== 0) return false;
    return true;
  });
}

export function getRealsForDay(
  realExpenses: RealExpense[],
  accounts: Account[],
  year: number,
  month: number,
  day: number
): RealExpense[] {
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return realExpenses.filter((e) => {
    if (e.valueDate !== dateStr) return false;
    return accounts.some((a) => a.id === e.accountId);
  });
}

export function getRealsForMonth(
  realExpenses: RealExpense[],
  accounts: Account[],
  year: number,
  month: number
): RealExpense[] {
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  return realExpenses.filter((e) => {
    if (e.valueDate.slice(0, 7) !== monthStr) return false;
    return accounts.some((a) => a.id === e.accountId);
  });
}

export function buildAnnualMonthStats(
  monthIdx: number,
  year: number,
  realExpenses: RealExpense[],
  accounts: Account[],
  goals: SavingsGoal[],
  netBalance: number,
  baseCurrency: string,
  rates: Record<string, number>,
  todayMk: string
): AnnualMonthStats {
  const monthDate = new Date(year, monthIdx, 1);
  const mk = monthKey(monthDate);
  const label = monthDate.toLocaleDateString('es-ES', { month: 'long' });

  const monthReals = getRealsForMonth(realExpenses, accounts, year, monthIdx);
  const realIncome = monthReals
    .filter((e) => e.type === 'income')
    .reduce((s, e) => s + convertAmount(e.amount, e.currency, baseCurrency, rates), 0);
  const realExpense = monthReals
    .filter((e) => e.type === 'expense')
    .reduce((s, e) => s + convertAmount(e.amount, e.currency, baseCurrency, rates), 0);

  const expiringGoals = goals.filter((g) => g.deadline?.slice(0, 7) === mk);

  return {
    monthIdx,
    mk,
    label,
    netBalance,
    realIncome,
    realExpense,
    realNet: realIncome - realExpense,
    hasRealMovements: monthReals.length > 0,
    expiringGoals,
    hasAlert: netBalance < 0,
    isPast: mk < todayMk,
    isCurrent: mk === todayMk,
  };
}
