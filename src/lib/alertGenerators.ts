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
        title: `${acc.name} por debajo del mínimo`,
        message: `Saldo real: ${fmt(realBalance, acc.currency ?? baseCurrency, acc.currency ?? baseCurrency, rates)} · Mínimo configurado: ${fmt(acc.minBalance, acc.currency ?? baseCurrency, acc.currency ?? baseCurrency, rates)}`,
        actionLabel: 'Ver cuenta',
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
        title: `${acc.name} caerá bajo el mínimo`,
        message: `En ${riskMonth.label} el saldo proyectado (${fmt(riskMonth.runningBalance, acc.currency ?? baseCurrency, acc.currency ?? baseCurrency, rates)}) caerá por debajo del mínimo (${fmt(acc.minBalance, acc.currency ?? baseCurrency, acc.currency ?? baseCurrency, rates)})`,
        actionLabel: 'Ver previsión',
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
        title: `${cat?.name ?? 'Categoría'} supera el presupuesto`,
        message: `Gasto real: ${fmt(realAmt, baseCurrency, baseCurrency, rates)} · Proyectado: ${fmt(projAmt, baseCurrency, baseCurrency, rates)} · Exceso: +${overPct}%`,
        actionLabel: 'Ver gastos reales',
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
      title: `Posible duplicado en "${p.name}"`,
      message: `La proyección "${p.name}" (${cat?.name ?? 'Sin categoría'} · ${fmt(p.amount, currency, currency, rates)}) intentó generar un gasto en ${p.duplicateWarningMonth} pero ya existe un movimiento similar. Por favor revisa las proyecciones y los gastos reales para confirmar.`,
      actionLabel: 'Ir a proyecciones',
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
      title: 'Balance mensual negativo',
      message: `Este mes los gastos superan a los ingresos en ${fmt(Math.abs(forecastThisMonth.net), baseCurrency, baseCurrency, rates)}. Revisa tus proyecciones.`,
      actionLabel: 'Ver proyecciones',
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
        title: `${goal.emoji} ¡Objetivo "${goal.name}" completado!`,
        message: `Has alcanzado tu meta de ${fmt(goal.targetAmount, goal.currency, goal.currency, rates)}. ¡Enhorabuena!`,
        actionLabel: 'Ver objetivos',
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
          title: `${goal.emoji} "${goal.name}" ha vencido`,
          message: `El plazo terminó el ${fmtDateShort(goal.deadline, dateFormat)} con un ${Math.round(pct)}% completado. Considera actualizar la fecha o el importe objetivo.`,
          actionLabel: 'Ver objetivo',
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
            title: `${goal.emoji} "${goal.name}" en peligro`,
            message: `Ritmo actual: ${fmt(monthlyRate, goal.currency, goal.currency, rates)}/mes · Necesitas: ${fmt(monthlyNeeded, goal.currency, goal.currency, rates)}/mes para llegar a tiempo en ${monthsLeft} mes${monthsLeft !== 1 ? 'es' : ''}.`,
            actionLabel: 'Ver objetivo',
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
          title: `${goal.emoji} "${goal.name}" — poco tiempo`,
          message: `Quedan ${monthsLeft} mes${monthsLeft !== 1 ? 'es' : ''} y llevas un ${Math.round(pct)}% completado. Actualiza el importe ahorrado si has avanzado.`,
          actionLabel: 'Actualizar progreso',
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
          title: `💳 ${acc.name} — utilización ${isCritical ? 'crítica' : 'alta'}`,
          message: `Usas el ${Math.round(utilizationPct)}% de tu límite. Deuda actual: ${fmt(creditDebt, currency, currency, rates)} de ${fmt(creditLimit, currency, currency, rates)} de límite total.`,
          actionLabel: '📊 Simular amortización',
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
            ? ` Pago mínimo estimado: ${fmt(creditDebt * (acc.minPaymentPct / 100), currency, currency, rates)}.`
            : '';
          out.push({
            id: `credit_payment_due_${acc.id}`,
            type: 'credit_payment_due',
            severity: isCritical ? 'critical' : 'warning',
            title: `💳 ${acc.name} — pago vence ${daysUntil === 0 ? 'HOY' : `en ${daysUntil} día${daysUntil !== 1 ? 's' : ''}`}`,
            message: `Deuda pendiente: ${fmt(creditDebt, currency, currency, rates)}.${minPaymentTxt}`,
            actionLabel: '💸 Pagar ahora',
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
            title: `💳 ${acc.name} — coste en intereses`,
            message: `Si no pagas el saldo completo, pagarás aprox. ${fmt(yearlyInterest, currency, currency, rates)}/año en intereses (${acc.interestRate}% TAE). Pagar el total cada mes evita este coste.`,
            actionLabel: '📊 Ver simulador',
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
      info.daysUntil === 0 ? 'HOY' :
      info.daysUntil === 1 ? 'mañana' :
      `en ${info.daysUntil} días`;

    const fechaLegible = fmtDateShort(dueKey, dateFormat);

    out.push({
      // ID idempotente: misma proyección + misma fecha = misma alerta.
      id: `projection_due_soon_${p.id}_${dueKey}`,
      type: 'projection_due_soon',
      severity: info.severity,
      title: `${typeIcon} ${p.name} vence ${daysTxt}`,
      message: `${fechaLegible} · ${fmt(amount, currency, currency, rates)}${
        acc ? ` · ${acc.name}` : ''
      }${p.nextOverrideAmount ? ' · ⚠️ con ajuste puntual' : ''}`,
      actionLabel: p.type === 'income' ? '✓ Registrar ingreso' : '✓ Registrar movimiento',
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
