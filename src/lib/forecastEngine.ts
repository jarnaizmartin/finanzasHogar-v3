// src/lib/forecastEngine.ts
//
// 🔮 Motor de previsión financiera a 12 meses.
//
// Pure function — sin side effects, sin React, sin localStorage.
// Calcula el balance proyectado mes a mes combinando:
//   - Saldo inicial real de cada cuenta (incluye deuda de tarjetas/préstamos)
//   - Movimientos reales para meses pasados y mes actual
//   - Proyecciones recurrentes activas para meses futuros
//   - Mes actual: mezcla "lo que YA ha pasado" + "lo que falta por venir"
//
// Soporta multi-divisa (convierte todo a baseCurrency) y filtrado por cuenta.

import { calcRealBalance } from './balanceCalc';
import { calcCreditCardDebt } from './creditCardUtils';
import { calcLoanDebt } from './loanUtils';
import {
  convertAmount,
  monthKey,
  monthLabel,
  addMonths,
  FREQUENCIES,
} from '../utils';
import type {
  Account,
  ForecastMonth,
  Projection,
  RealExpense,
} from '../types';

export function calcForecast(
  projections: Projection[],
  accounts: Account[],
  accountId = 'all',
  rates: Record<string, number> = {},
  baseCurrency = 'EUR',
  realExpenses: RealExpense[] = []
): ForecastMonth[] {
  const filteredAccounts =
    accountId === 'all' ? accounts : accounts.filter((a) => a.id === accountId);
  const filteredProjections =
    accountId === 'all'
      ? projections.filter((p) => p.type !== 'transfer')
      : projections.filter(
          (p) =>
            p.accountId === accountId ||
            (p.type === 'transfer' && p.toAccountId === accountId)
        );

  const now = new Date();
  const currentMonthKey = monthKey(now);

  const startBalance = filteredAccounts.reduce((s, a) => {
    let realBalance: number;
    if (a.accountType === 'credit_card') {
      const { debt } = calcCreditCardDebt(a, realExpenses, rates, baseCurrency);
      realBalance = -debt;
    } else if (a.accountType === 'loan') {
      const { debt } = calcLoanDebt(a, realExpenses, rates, baseCurrency);
      realBalance = -debt;
    } else {
      ({ realBalance } = calcRealBalance(a, realExpenses, rates, baseCurrency));
    }
    const accCurrency = a.currency ?? baseCurrency;
    return s + convertAmount(realBalance, accCurrency, baseCurrency, rates);
  }, 0);

  const getActiveProjections = (d: Date) =>
    filteredProjections.filter((p) => {
      const start = new Date(p.startDate);
      const end = p.endDate ? new Date(p.endDate) : null;
      const freq = FREQUENCIES.find((f) => f.value === p.frequency);
      if (!freq) return false;
      const diff =
        (d.getFullYear() - start.getFullYear()) * 12 +
        (d.getMonth() - start.getMonth());
      if (diff < 0 || (end && d > end) || diff % freq.months !== 0) return false;
      return true;
    });

  const projToBase = (p: Projection) => {
    const acc = accounts.find((a) => a.id === p.accountId);
    const accCurrency = acc?.currency ?? baseCurrency;
    return convertAmount(p.amount, accCurrency, baseCurrency, rates);
  };

  const months: Omit<ForecastMonth, 'runningBalance'>[] = [];

  for (let i = 0; i < 12; i++) {
    const d = addMonths(now, i);
    const key = monthKey(d);
    const isPast = key < currentMonthKey;
    const isCurrent = key === currentMonthKey;
    let income = 0;
    let expense = 0;

    if (isPast) {
      realExpenses.forEach((e) => {
        if (e.valueDate.slice(0, 7) !== key) return;
        if (e.isTransfer && accountId === 'all') return;
        const acc = filteredAccounts.find((a) => a.id === e.accountId);
        if (!acc || e.valueDate <= acc.date) return;
        const amount = convertAmount(e.amount, e.currency, baseCurrency, rates);
        if (e.type === 'income') income += amount;
        else expense += amount;
      });
    } else if (isCurrent) {
      const realByCat: Record<string, { income: number; expense: number }> = {};
      realExpenses.forEach((e) => {
        if (e.valueDate.slice(0, 7) !== key) return;
        if (e.isTransfer && accountId === 'all') return;
        const acc = filteredAccounts.find((a) => a.id === e.accountId);
        if (!acc || e.valueDate <= acc.date) return;
        if (!realByCat[e.categoryId]) realByCat[e.categoryId] = { income: 0, expense: 0 };
        const amount = convertAmount(e.amount, e.currency, baseCurrency, rates);
        if (e.type === 'income') { realByCat[e.categoryId].income += amount; income += amount; }
        else { realByCat[e.categoryId].expense += amount; expense += amount; }
      });
      getActiveProjections(d).forEach((p) => {
        const projected = projToBase(p);
        const realForCat = realByCat[p.categoryId];
        if (p.type === 'transfer') {
          if (p.accountId === accountId)
            expense += Math.max(0, projected - (realForCat?.expense ?? 0));
          else if (p.toAccountId === accountId)
            income += Math.max(0, projected - (realForCat?.income ?? 0));
        } else if (p.type === 'income') {
          income += Math.max(0, projected - (realForCat?.income ?? 0));
        } else {
          expense += Math.max(0, projected - (realForCat?.expense ?? 0));
        }
      });
    } else {
      getActiveProjections(d).forEach((p) => {
        const converted = projToBase(p);
        if (p.type === 'transfer') {
          if (p.accountId === accountId) expense += converted;
          else if (p.toAccountId === accountId) income += converted;
        } else if (p.type === 'income') {
          income += converted;
        } else {
          expense += converted;
        }
      });
    }

    months.push({
      key,
      label: monthLabel(key),
      income,
      expense,
      net: income - expense,
      isPast,
      isCurrent,
    });
  }

  let running = startBalance;
  return months.map((m, i) => {
    if (i > 0) running += m.net;
    return { ...m, runningBalance: running };
  });
}
