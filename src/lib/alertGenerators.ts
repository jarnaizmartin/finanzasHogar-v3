// src/lib/alertGenerators.ts
//
// Generadores puros de alertas para el panel principal.
// Extraído de AppProvider.computedAlerts en la fase 1.3.B.
//
// Diseño:
//  • Cada generador recibe un AlertContext único (uniformidad + testabilidad).
//  • Ninguno toca React, localStorage ni hace I/O.
//  • `now` se inyecta como parámetro → tests deterministas sin fake timers.
//  • El filtrado por `ignoredAlerts` se hace fuera (en AppProvider).

import i18next from 'i18next';
import { calcRealBalance } from './balanceCalc';
import { calcCreditCardDebt, daysUntilPayment } from './creditCardUtils';
import { shouldAlertProjection, dateKey } from './projectionAlerts';
import {
  convertAmount,
  fmt,
  monthKey,
  FREQUENCIES,
  fmtDateShort,
} from '../utils';
import type {
  Account,
  Projection,
  Category,
  RealExpense,
  SavingsGoal,
  AppAlert,
  ForecastMonth,
} from '../types';

// ─── Helper i18n para lib pura (sin React hook) ──────────────────────────────
const at = (key: string, params?: Record<string, unknown>): string =>
  i18next.t(key, params) as string;

// ─── Contexto compartido para todos los generadores ──────────────────────────
export type AlertContext = {
  accounts: Account[];
  projections: Projection[];
  categories: Category[];
  realExpenses: RealExpense[];
  goals: SavingsGoal[];
  rates: Record<string, number>;
  baseCurrency: string;
  dateFormat: string;
  now: Date;
  forecastAll: ForecastMonth[];
  forecastByAccount: Record<string, ForecastMonth[]>;
};

// ═════════════════════════════════════════════════════════════════════════════
// 1. Saldo bajo el mínimo HOY
// ═════════════════════════════════════════════════════════════════════════════
export function generateBalanceCriticalAlerts(ctx: AlertContext): AppAlert[] {
  const { accounts, realExpenses, rates, baseCurrency } = ctx;
  const out: AppAlert[] = [];

  accounts.forEach((acc) => {
    if (!acc.minBalance || acc.minBalance <= 0) return;
    const { realBalance } = calcRealBalance(acc, realExpenses, rates, baseCurrency);
    if (realBalance < acc.minBalance) {
      out.push({
        id: `balance_critical_${acc.id}`,
        type: 'balance_critical',
        severity: 'critical',
        title: at('alerts.content.balanceCriticalTitle', { name: acc.name }),
        message: at('alerts.content.balanceCriticalMsg', {
          real: fmt(realBalance, acc.currency ?? baseCurrency, acc.currency ?? baseCurrency, rates),
          min: fmt(acc.minBalance, acc.currency ?? baseCurrency, acc.currency ?? baseCurrency, rates),
        }),
        actionLabel: at('alerts.content.viewAccount'),
        actionTab: 'accounts',
        data: { accountId: acc.id },
        generatedAt: Date.now(),
      });
    }
  });

  return out;
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. Saldo caerá bajo el mínimo en los próximos 3 meses
// ═════════════════════════════════════════════════════════════════════════════
export function generateBalanceRiskAlerts(ctx: AlertContext): AppAlert[] {
  const { accounts, realExpenses, rates, baseCurrency, forecastByAccount } = ctx;
  const out: AppAlert[] = [];

  accounts.forEach((acc) => {
    if (!acc.minBalance || acc.minBalance <= 0) return;
    const { realBalance } = calcRealBalance(acc, realExpenses, rates, baseCurrency);
    if (realBalance < acc.minBalance) return; // ya cubierto por critical
    const fc = forecastByAccount[acc.id] || [];
    const riskMonth = fc.slice(0, 3).find((m) => m.runningBalance < acc.minBalance!);
    if (riskMonth) {
      out.push({
        id: `balance_risk_${acc.id}`,
        type: 'balance_risk',
        severity: 'warning',
        title: at('alerts.content.balanceRiskTitle', { name: acc.name }),
        message: at('alerts.content.balanceRiskMsg', {
          month: riskMonth.label,
          projected: fmt(riskMonth.runningBalance, acc.currency ?? baseCurrency, acc.currency ?? baseCurrency, rates),
          min: fmt(acc.minBalance, acc.currency ?? baseCurrency, acc.currency ?? baseCurrency, rates),
        }),
        actionLabel: at('alerts.content.viewForecast'),
        actionTab: 'forecast',
        data: { accountId: acc.id },
        generatedAt: Date.now(),
      });
    }
  });

  return out;
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. Presupuesto excedido por categoría (este mes)
// ═════════════════════════════════════════════════════════════════════════════
export function generateBudgetExceededAlerts(ctx: AlertContext): AppAlert[] {
  const { accounts, projections, categories, realExpenses, rates, baseCurrency, now } = ctx;
  const out: AppAlert[] = [];
  const currentMonthKey = monthKey(now);

  const activeProjectionsThisMonth = projections.filter((p) => {
    const start = new Date(p.startDate);
    const end = p.endDate ? new Date(p.endDate) : null;
    const freq = FREQUENCIES.find((f) => f.value === p.frequency);
    if (!freq) return false;
    const diff =
      (now.getFullYear() - start.getFullYear()) * 12 +
      (now.getMonth() - start.getMonth());
    if (diff < 0 || (end && now > end) || diff % freq.months !== 0) return false;
    return p.type === 'expense';
  });

  const realByCat: Record<string, number> = {};
  realExpenses.forEach((e) => {
    if (e.valueDate.slice(0, 7) !== currentMonthKey) return;
    if (e.type !== 'expense') return;
    const acc = accounts.find((a) => a.id === e.accountId);
    if (!acc || e.valueDate <= acc.date) return;
    realByCat[e.categoryId] =
      (realByCat[e.categoryId] ?? 0) +
      convertAmount(e.amount, e.currency, baseCurrency, rates);
  });

  const projByCat: Record<string, number> = {};
  activeProjectionsThisMonth.forEach((p) => {
    const acc = accounts.find((a) => a.id === p.accountId);
    const accCurrency = acc?.currency ?? baseCurrency;
    projByCat[p.categoryId] =
      (projByCat[p.categoryId] ?? 0) +
      convertAmount(p.amount, accCurrency, baseCurrency, rates);
  });

  Object.entries(realByCat).forEach(([catId, realAmt]) => {
    const projAmt = projByCat[catId];
    if (!projAmt || projAmt <= 0) return;
    if (realAmt > projAmt) {
      const cat = categories.find((c) => c.id === catId);
      const overPct = Math.round(((realAmt - projAmt) / projAmt) * 100);
      out.push({
        id: `budget_exceeded_${catId}`,
        type: 'budget_exceeded',
        severity: 'warning',
        title: at('alerts.content.budgetExceededTitle', { category: cat?.name ?? at('alerts.content.categoryFallback') }),
        message: at('alerts.content.budgetExceededMsg', {
          real: fmt(realAmt, baseCurrency, baseCurrency, rates),
          projected: fmt(projAmt, baseCurrency, baseCurrency, rates),
          pct: overPct,
        }),
        actionLabel: at('alerts.content.viewRealExpenses'),
        actionTab: 'real',
        data: { categoryId: catId },
        generatedAt: Date.now(),
      });
    }
  });

  return out;
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. Posibles duplicados de proyecciones recurrentes
// ═════════════════════════════════════════════════════════════════════════════
export function generateDuplicateProjectionAlerts(ctx: AlertContext): AppAlert[] {
  const { accounts, projections, categories, rates, baseCurrency, now } = ctx;
  const out: AppAlert[] = [];
  const currentMonthKey = monthKey(now);

  projections.forEach((p) => {
    if (!p.hasDuplicateWarning) return;
    if (p.duplicateWarningMonth !== currentMonthKey) return;
    const cat = categories.find((c) => c.id === p.categoryId);
    const acc = accounts.find((a) => a.id === p.accountId);
    const currency = acc?.currency ?? baseCurrency;
    out.push({
      id: `duplicate_projection_${p.id}_${p.duplicateWarningMonth}`,
      type: 'duplicate_projection',
      severity: 'warning',
      title: at('alerts.content.duplicateTitle', { name: p.name }),
      message: at('alerts.content.duplicateMsg', {
        name: p.name,
        category: cat?.name ?? at('alerts.content.noCategory'),
        amount: fmt(p.amount, currency, currency, rates),
        month: p.duplicateWarningMonth,
      }),
      actionLabel: at('alerts.content.goToProjections'),
      actionTab: 'projections',
      data: { projectionId: p.id },
      generatedAt: Date.now(),
    });
  });

  return out;
}

// ═════════════════════════════════════════════════════════════════════════════
// 5. Balance mensual negativo (este mes)
// ═════════════════════════════════════════════════════════════════════════════
export function generateMonthNegativeAlert(ctx: AlertContext): AppAlert[] {
  const { rates, baseCurrency, forecastAll, now } = ctx;
  const out: AppAlert[] = [];
  const currentMonthKey = monthKey(now);

  const forecastThisMonth = forecastAll[0];
  if (forecastThisMonth && forecastThisMonth.net < 0) {
    out.push({
      id: `month_negative_${currentMonthKey}`,
      type: 'month_negative',
      severity: 'warning',
      title: at('alerts.content.monthNegativeTitle'),
      message: at('alerts.content.monthNegativeMsg', { amount: fmt(Math.abs(forecastThisMonth.net), baseCurrency, baseCurrency, rates) }),
      actionLabel: at('alerts.content.viewProjections'),
      actionTab: 'projections',
      generatedAt: Date.now(),
    });
  }

  return out;
}

// ═════════════════════════════════════════════════════════════════════════════
// 6. Objetivos de ahorro: completados, vencidos y en peligro
// ═════════════════════════════════════════════════════════════════════════════
export function generateGoalAlerts(ctx: AlertContext): AppAlert[] {
  const { accounts, realExpenses, goals, rates, dateFormat, now } = ctx;
  const out: AppAlert[] = [];

  goals.forEach((goal) => {
    let saved = 0;
    if (goal.mode === 'manual') {
      saved = goal.currentAmount;
    } else {
      saved = realExpenses.reduce((sum, e) => {
        if (e.categoryId !== goal.categoryId) return sum;
        if (e.type !== goal.autoType) return sum;
        if (e.valueDate < goal.autoStartDate) return sum;
        if (goal.accountId !== 'all' && e.accountId !== goal.accountId) return sum;
        const acc = accounts.find((a) => a.id === e.accountId);
        if (!acc || e.valueDate <= acc.date) return sum;
        return sum + convertAmount(e.amount, e.currency, goal.currency, rates);
      }, 0);
    }

    const pct       = goal.targetAmount > 0 ? (saved / goal.targetAmount) * 100 : 0;
    const remaining = Math.max(0, goal.targetAmount - saved);
    const completed = saved >= goal.targetAmount;

    if (completed) {
      out.push({
        id: `goal_completed_${goal.id}`,
        type: 'goal_completed',
        severity: 'positive',
        title: at('alerts.content.goalCompletedTitle', { emoji: goal.emoji, name: goal.name }),
        message: at('alerts.content.goalCompletedMsg', { amount: fmt(goal.targetAmount, goal.currency, goal.currency, rates) }),
        actionLabel: at('alerts.content.viewGoals'),
        actionTab: 'goals',
        data: { goalId: goal.id },
        generatedAt: Date.now(),
      });
      return;
    }

    if (goal.deadline) {
      const deadlineDate = new Date(goal.deadline);
      if (deadlineDate < now) {
        out.push({
          id: `goal_overdue_${goal.id}`,
          type: 'goal_overdue',
          severity: 'critical',
          title: at('alerts.content.goalOverdueTitle', { emoji: goal.emoji, name: goal.name }),
          message: at('alerts.content.goalOverdueMsg', { date: fmtDateShort(goal.deadline, dateFormat), pct: Math.round(pct) }),
          actionLabel: at('alerts.content.viewGoal'),
          actionTab: 'goals',
          data: { goalId: goal.id },
          generatedAt: Date.now(),
        });
        return;
      }

      const deadlineMs = deadlineDate.getTime() - now.getTime();
      const monthsLeft = Math.max(0, Math.ceil(deadlineMs / (1000 * 60 * 60 * 24 * 30.44)));

      if (monthsLeft > 0 && goal.mode === 'auto') {
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const recentTotal = realExpenses.reduce((sum, e) => {
          if (e.categoryId !== goal.categoryId) return sum;
          if (e.type !== goal.autoType) return sum;
          if (new Date(e.valueDate) < threeMonthsAgo) return sum;
          if (goal.accountId !== 'all' && e.accountId !== goal.accountId) return sum;
          const acc = accounts.find((a) => a.id === e.accountId);
          if (!acc || e.valueDate <= acc.date) return sum;
          return sum + convertAmount(e.amount, e.currency, goal.currency, rates);
        }, 0);
        const monthlyRate   = recentTotal / 3;
        const monthlyNeeded = remaining / monthsLeft;
        if (monthlyRate < monthlyNeeded * 0.8) {
          out.push({
            id: `goal_at_risk_${goal.id}`,
            type: 'goal_at_risk',
            severity: 'warning',
            title: at('alerts.content.goalAtRiskAutoTitle', { emoji: goal.emoji, name: goal.name }),
            message: at(monthsLeft === 1 ? 'alerts.content.goalAtRiskAutoMsg1' : 'alerts.content.goalAtRiskAutoMsgN', {
              rate: fmt(monthlyRate, goal.currency, goal.currency, rates),
              needed: fmt(monthlyNeeded, goal.currency, goal.currency, rates),
              n: monthsLeft,
            }),
            actionLabel: at('alerts.content.viewGoal'),
            actionTab: 'goals',
            data: { goalId: goal.id },
            generatedAt: Date.now(),
          });
        }
      }

      if (monthsLeft <= 2 && goal.mode === 'manual' && pct < 80) {
        out.push({
          id: `goal_at_risk_${goal.id}`,
          type: 'goal_at_risk',
          severity: 'warning',
          title: at('alerts.content.goalAtRiskManualTitle', { emoji: goal.emoji, name: goal.name }),
          message: at(monthsLeft === 1 ? 'alerts.content.goalAtRiskManualMsg1' : 'alerts.content.goalAtRiskManualMsgN', {
            n: monthsLeft,
            pct: Math.round(pct),
          }),
          actionLabel: at('alerts.content.updateProgress'),
          actionTab: 'goals',
          data: { goalId: goal.id },
          generatedAt: Date.now(),
        });
      }
    }
  });

  return out;
}

// ═════════════════════════════════════════════════════════════════════════════
// 7. Tarjetas de crédito: utilización, vencimiento, coste de intereses
// ═════════════════════════════════════════════════════════════════════════════
export function generateCreditCardAlerts(ctx: AlertContext): AppAlert[] {
  const { accounts, realExpenses, rates, baseCurrency } = ctx;
  const out: AppAlert[] = [];

  accounts
    .filter((acc) => acc.accountType === 'credit_card')
    .forEach((acc) => {
      const { debt: creditDebt, utilizationPct } = calcCreditCardDebt(
        acc,
        realExpenses,
        rates,
        baseCurrency
      );
      const currency = acc.currency ?? baseCurrency;
      const creditLimit = acc.creditLimit ?? 0;

      // ── 1. Alta utilización (>= 70%) ─────────────────────────────────────
      if (creditLimit > 0 && utilizationPct >= 70) {
        const isCritical = utilizationPct >= 90;
        out.push({
          id: `credit_utilization_${acc.id}`,
          type: 'credit_utilization_high',
          severity: isCritical ? 'critical' : 'warning',
          title: at(isCritical ? 'alerts.content.creditUtilCritTitle' : 'alerts.content.creditUtilHighTitle', { name: acc.name }),
          message: at('alerts.content.creditUtilMsg', {
            pct: Math.round(utilizationPct),
            debt: fmt(creditDebt, currency, currency, rates),
            limit: fmt(creditLimit, currency, currency, rates),
          }),
          actionLabel: at('alerts.content.simulateAmort'),
          actionType: 'open_simulator',
          data: { accountId: acc.id },
          generatedAt: Date.now(),
        });
      }

      // ── 2. Vencimiento de pago próximo (<= 7 días) ───────────────────────
      if (acc.paymentDueDay && creditDebt > 0) {
        const daysUntil = daysUntilPayment(acc) ?? 999;
        if (daysUntil <= 7) {
          const isCritical = daysUntil <= 2;
          const minPaymentTxt = acc.minPaymentPct
            ? at('alerts.content.minPaymentEst', { amount: fmt(creditDebt * (acc.minPaymentPct / 100), currency, currency, rates) })
            : '';
          const payDueTitle = daysUntil === 0
            ? at('alerts.content.creditPayTodayTitle', { name: acc.name })
            : daysUntil === 1
            ? at('alerts.content.creditPay1Title', { name: acc.name, n: daysUntil })
            : at('alerts.content.creditPayNTitle', { name: acc.name, n: daysUntil });
          out.push({
            id: `credit_payment_due_${acc.id}`,
            type: 'credit_payment_due',
            severity: isCritical ? 'critical' : 'warning',
            title: payDueTitle,
            message: at('alerts.content.creditPayMsg', { debt: fmt(creditDebt, currency, currency, rates) }) + minPaymentTxt,
            actionLabel: at('alerts.content.payNow'),
            actionType: 'open_payment_modal',
            data: { accountId: acc.id },
            generatedAt: Date.now(),
          });
        }
      }

      // ── 3. Coste en intereses (TAE definida y deuda significativa) ───────
      if (acc.interestRate && acc.interestRate > 0 && creditDebt > 0) {
        const yearlyInterest = creditDebt * (acc.interestRate / 100);
        if (yearlyInterest >= 50) {
          out.push({
            id: `credit_interest_${acc.id}`,
            type: 'credit_interest_warning',
            severity: 'warning',
            title: at('alerts.content.creditInterestTitle', { name: acc.name }),
            message: at('alerts.content.creditInterestMsg', {
              amount: fmt(yearlyInterest, currency, currency, rates),
              rate: acc.interestRate,
            }),
            actionLabel: at('alerts.content.viewSimulator'),
            actionType: 'open_simulator',
            data: { accountId: acc.id },
            generatedAt: Date.now(),
          });
        }
      }
    });

  return out;
}

// ═════════════════════════════════════════════════════════════════════════════
// 8. Vencimiento próximo de proyecciones (F2.10)
// ═════════════════════════════════════════════════════════════════════════════
export function generateProjectionDueAlerts(ctx: AlertContext): AppAlert[] {
  const { accounts, projections, rates, baseCurrency, dateFormat, now } = ctx;
  const out: AppAlert[] = [];

  projections.forEach((p) => {
    // Las proyecciones vinculadas a préstamos se gestionan desde el detalle
    // del préstamo; no avisamos aquí para no duplicar señales.
    if (p.linkedLoanId) return;

    const info = shouldAlertProjection(p, now);
    if (!info.shouldAlert || !info.nextDueDate) return;

    const acc = accounts.find((a) => a.id === p.accountId);
    const currency = acc?.currency ?? baseCurrency;
    const amount = p.nextOverrideAmount ?? p.amount;
    const dueKey = dateKey(info.nextDueDate);

    const typeIcon =
      p.type === 'income' ? '📈' :
      p.type === 'transfer' ? '↔' : '📉';

    const daysTxt =
      info.daysUntil === 0 ? at('alerts.content.today') :
      info.daysUntil === 1 ? at('alerts.content.tomorrow') :
      at('alerts.content.inDaysN', { n: info.daysUntil });

    const fechaLegible = fmtDateShort(dueKey, dateFormat);
    const msgParts = [`${fechaLegible} · ${fmt(amount, currency, currency, rates)}`];
    if (acc) msgParts.push(acc.name);
    if (p.nextOverrideAmount) msgParts.push(at('alerts.content.withAdjustment'));

    out.push({
      // ID idempotente: misma proyección + misma fecha = misma alerta.
      id: `projection_due_soon_${p.id}_${dueKey}`,
      type: 'projection_due_soon',
      severity: info.severity,
      title: at('alerts.content.projDueTitle', { icon: typeIcon, name: p.name, when: daysTxt }),
      message: msgParts.join(' · '),
      actionLabel: p.type === 'income' ? at('alerts.content.registerIncome') : at('alerts.content.registerMovement'),
      actionType: 'open_real_expense_modal',
      data: {
        projectionId: p.id,
        accountId: p.accountId,
        categoryId: p.categoryId,
        amount,
        type: p.type,
        dueDate: dueKey,
      },
      generatedAt: Date.now(),
    });
  });

  return out;
}

// ═════════════════════════════════════════════════════════════════════════════
// Orquestador: ejecuta todos los generadores y devuelve el array combinado.
// El filtrado por `ignoredAlerts` se hace fuera (en AppProvider).
// ═════════════════════════════════════════════════════════════════════════════
export function generateAllAlerts(ctx: AlertContext): AppAlert[] {
  return [
    ...generateBalanceCriticalAlerts(ctx),
    ...generateBalanceRiskAlerts(ctx),
    ...generateBudgetExceededAlerts(ctx),
    ...generateDuplicateProjectionAlerts(ctx),
    ...generateMonthNegativeAlert(ctx),
    ...generateGoalAlerts(ctx),
    ...generateCreditCardAlerts(ctx),
    ...generateProjectionDueAlerts(ctx),
  ];
}
