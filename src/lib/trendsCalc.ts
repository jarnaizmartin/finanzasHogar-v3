import { monthKey, convertAmount } from '../utils';
import { fmtDate } from './i18nFormats';
import type { Account, RealExpense, Category } from '../types';

export interface MonthlyDataPoint {
  monthKey: string;
  label: string;
  income: number;
  expenses: number;
  net: number;
  savingsRate: number;
}

export interface BalanceDataPoint {
  monthKey: string;
  label: string;
  total: number;
  [key: string]: string | number;
}

export interface CategoryDataPoint {
  categoryId: string;
  name: string;
  color: string;
  total: number;
}

export interface TrendsStats {
  totalIncome: number;
  totalExpenses: number;
  totalNet: number;
  avgSavingsRate: number;
  bestIncomeMonth: MonthlyDataPoint | undefined;
  worstExpenseMonth: MonthlyDataPoint | undefined;
  topCategory: CategoryDataPoint | undefined;
  trend: 'up' | 'down' | 'stable';
  monthCount: number;
}

export interface TrendsData {
  monthlyData: MonthlyDataPoint[];
  balanceData: BalanceDataPoint[];
  categoryData: CategoryDataPoint[];
  filteredAccounts: Account[];
  stats: TrendsStats;
}

export function buildMonthKeys(
  rangeMonths: number | 'all',
  allMonthKeys: string[]
): string[] {
  if (rangeMonths === 'all') return allMonthKeys;
  const now = new Date();
  const keys: string[] = [];
  for (let i = rangeMonths - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}

function monthLabel(mk: string): string {
  const [y, m] = mk.split('-').map(Number);
  return fmtDate(new Date(y, m - 1, 1), { month: 'short', year: '2-digit' });
}

export function computeMonthlyData(
  monthKeys: string[],
  validExpenses: RealExpense[],
  baseCurrency: string,
  rates: Record<string, number>
): MonthlyDataPoint[] {
  return monthKeys.map((mk) => {
    const monthExpenses = validExpenses.filter(
      (e) => e.entryDate.slice(0, 7) === mk
    );
    const income = monthExpenses
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => sum + convertAmount(e.amount, e.currency, baseCurrency, rates), 0);
    const expenses = monthExpenses
      .filter((e) => e.type === 'expense')
      .reduce((sum, e) => sum + convertAmount(e.amount, e.currency, baseCurrency, rates), 0);
    const net = income - expenses;
    const savingsRate = income > 0 ? (net / income) * 100 : 0;
    return {
      monthKey: mk,
      label: monthLabel(mk),
      income: parseFloat(income.toFixed(2)),
      expenses: parseFloat(expenses.toFixed(2)),
      net: parseFloat(net.toFixed(2)),
      savingsRate: parseFloat(savingsRate.toFixed(1)),
    };
  });
}

export function computeBalanceData(
  monthKeys: string[],
  filteredAccounts: Account[],
  realExpenses: RealExpense[],
  baseCurrency: string,
  rates: Record<string, number>
): BalanceDataPoint[] {
  return monthKeys.map((mk) => {
    const point: Record<string, string | number> = { monthKey: mk, label: monthLabel(mk) };
    let total = 0;
    filteredAccounts.forEach((acc) => {
      let balance = convertAmount(acc.balance, acc.currency ?? baseCurrency, baseCurrency, rates);
      realExpenses.forEach((e) => {
        if (e.accountId !== acc.id) return;
        if (e.entryDate.slice(0, 7) > mk) return;
        const amt = convertAmount(e.amount, e.currency, baseCurrency, rates);
        balance += e.type === 'income' ? amt : -amt;
      });
      const rounded = parseFloat(balance.toFixed(2));
      point[acc.id] = rounded;
      point[`${acc.id}_name`] = acc.name;
      total += rounded;
    });
    point['total'] = parseFloat(total.toFixed(2));
    return point as BalanceDataPoint;
  });
}

export function computeCategoryData(
  validExpenses: RealExpense[],
  categories: Category[],
  baseCurrency: string,
  rates: Record<string, number>
): CategoryDataPoint[] {
  const catTotals: Record<string, number> = {};
  validExpenses
    .filter((e) => e.type === 'expense')
    .forEach((e) => {
      const amt = convertAmount(e.amount, e.currency, baseCurrency, rates);
      catTotals[e.categoryId] = (catTotals[e.categoryId] ?? 0) + amt;
    });
  return Object.entries(catTotals)
    .map(([catId, total]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        categoryId: catId,
        name: cat?.name ?? 'Sin categoría',
        color: cat?.color ?? '#94a3b8',
        total: parseFloat(total.toFixed(2)),
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function computeStats(
  monthlyData: MonthlyDataPoint[],
  categoryData: CategoryDataPoint[]
): TrendsStats {
  const totalIncome = monthlyData.reduce((s, m) => s + m.income, 0);
  const totalExpenses = monthlyData.reduce((s, m) => s + m.expenses, 0);
  const totalNet = totalIncome - totalExpenses;
  const avgSavingsRate =
    monthlyData.length > 0
      ? monthlyData.reduce((s, m) => s + m.savingsRate, 0) / monthlyData.length
      : 0;

  const bestIncomeMonth = [...monthlyData].sort((a, b) => b.income - a.income)[0];
  const worstExpenseMonth = [...monthlyData].sort((a, b) => b.expenses - a.expenses)[0];
  const topCategory = categoryData[0];

  const half = Math.floor(monthlyData.length / 2);
  const firstHalfSavings =
    monthlyData.slice(0, half).reduce((s, m) => s + m.savingsRate, 0) / (half || 1);
  const secondHalfSavings =
    monthlyData.slice(half).reduce((s, m) => s + m.savingsRate, 0) /
    (monthlyData.length - half || 1);
  const trend: 'up' | 'down' | 'stable' =
    secondHalfSavings > firstHalfSavings + 2
      ? 'up'
      : secondHalfSavings < firstHalfSavings - 2
      ? 'down'
      : 'stable';

  return {
    totalIncome,
    totalExpenses,
    totalNet,
    avgSavingsRate,
    bestIncomeMonth,
    worstExpenseMonth,
    topCategory,
    trend,
    monthCount: monthlyData.length,
  };
}

export function computeTrendsData(
  rangeMonths: number | 'all',
  accountFilter: string,
  accounts: Account[],
  realExpenses: RealExpense[],
  categories: Category[],
  rates: Record<string, number>,
  baseCurrency: string
): TrendsData | null {
  const allMonthKeys = Array.from(
    new Set(realExpenses.map((e) => e.entryDate.slice(0, 7)))
  ).sort();

  const monthKeys = buildMonthKeys(rangeMonths, allMonthKeys);
  if (monthKeys.length === 0) return null;

  const filteredAccounts =
    accountFilter === 'all'
      ? accounts
      : accounts.filter((a) => a.id === accountFilter);

  const validExpenses = realExpenses.filter((e) => {
    const acc = accounts.find((a) => a.id === e.accountId);
    if (!acc) return false;
    if (accountFilter !== 'all' && e.accountId !== accountFilter) return false;
    if (!monthKeys.includes(e.entryDate.slice(0, 7))) return false;
    return true;
  });

  const monthlyData = computeMonthlyData(monthKeys, validExpenses, baseCurrency, rates);
  const balanceData = computeBalanceData(monthKeys, filteredAccounts, realExpenses, baseCurrency, rates);
  const categoryData = computeCategoryData(validExpenses, categories, baseCurrency, rates);
  const stats = computeStats(monthlyData, categoryData);

  return { monthlyData, balanceData, categoryData, filteredAccounts, stats };
}
