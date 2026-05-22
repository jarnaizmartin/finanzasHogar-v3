import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type React from 'react';
import { AppContext } from './AppContext';
import type { AppContextType } from './AppContext';
import { useSecurityContext } from './SecurityContext';
import { useLocalStorageSync } from './hooks/useLocalStorageSync';
import { useLocalStorage } from './hooks/useLocalStorage';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { DataProvider, useData } from './contexts/DataContext';
import { UIProvider, useUI } from './contexts/UIContext';
import { calcRealBalance } from './lib/balanceCalc';
import { calcForecast } from './lib/forecastEngine';
import { calcCreditCardDebt, daysUntilPayment } from './lib/creditCardUtils';
import { calcLoanDebt } from './lib/loanUtils';
import { applyRecurringProjections } from './lib/recurringMotor';
import { shouldAlertProjection, dateKey } from './lib/projectionAlerts'; // ✨ F2.10
import { encryptBackupPayload } from './lib/backupCrypto';
import { getEncryptedItem, setEncryptedItem } from './lib/encryptedStorage';
import {
  convertAmount,
  fmt,
  monthKey,
  monthLabel,
  addMonths,
  FREQUENCIES,
  fmtDateShort,
} from './utils';
import type {
  BackupEntry,
  AppAlert,
  ForecastMonth,
  Projection,
  RealExpense,
  Account,
} from './types';

// ─── Re-exportaciones para backward compat ───────────────────────────────────
export { LIGHT, DARK } from './theme';
export { calcForecast } from './lib/forecastEngine';

// ─── Helper ───────────────────────────────────────────────────────────────────
const uid = () => crypto.randomUUID();

// ─── AppCoreProvider ──────────────────────────────────────────────────────────
// Componente interno: tiene acceso a SettingsContext, DataContext y UIContext.
// Gestiona el ciclo de vida de la app (onboarded, backup, alertas calculadas).
function AppCoreProvider({ children }: { children: React.ReactNode }) {
  const { clearSecurity } = useSecurityContext();

  // ✅ FIX 15 — sync entre pestañas (aquí, una sola vez)
  useLocalStorageSync();

  // ── Sub-contextos ──────────────────────────────────────────────────────────
  const settings = useSettings();
  const data     = useData();
  const ui       = useUI();

  const { rates, baseCurrency, displayCurrency, dateFormat, setDark, setBaseCurrency, setDisplayCurrency } = settings;
  const {
    accounts, setAccounts,
    categories, setCategories,
    projections, setProjections,
    realExpenses, setRealExpenses,
    goals, setGoals,
    bankFormats, setBankFormats,
    categoryRules, setCategoryRules,
    ignoredAlerts,
  } = data;
  const { setRecurringDuplicateWarnings, setShowRecurringWarnings } = ui;

  // ── Estado de ciclo de vida (persistido) ───────────────────────────────────
  const [onboarded, setOnboarded]             = useLocalStorage<boolean>('fh_onboarded', false);
  const [tourCompleted, setTourCompleted]     = useLocalStorage<boolean>('fh_tour_completed', false);
  const [tourIsFirstTime, setTourIsFirstTime] = useLocalStorage<boolean>('fh_tour_first_time', true);
  const [backupHistory, setBackupHistory]     = useLocalStorage<BackupEntry[]>('fh_backup_history', []);
  const [backupReminderDays, setBackupReminderDays]             = useLocalStorage<number>('fh_backup_reminder_days', 7);
  const [backupReminderDismissed, setBackupReminderDismissed]   = useLocalStorage<number>('fh_backup_reminder_dismissed', 0);
  const [autoBackupDone, setAutoBackupDone]                     = useLocalStorage<boolean>('fh_auto_backup_done', false);
  const [firstSessionDone, setFirstSessionDone]                 = useLocalStorage<boolean>('fh_first_session_done', false);
  const [lastAutoBackupSession, setLastAutoBackupSession]       = useLocalStorage<number>('fh_last_auto_backup_session', 0);
  const [onboardedAt, setOnboardedAt] = useLocalStorage<number>('fh_onboarded_at', 0);
  
  // ── Derivados: forecast ────────────────────────────────────────────────────
  const forecastAll = useMemo(
    () => calcForecast(projections, accounts, 'all', rates, baseCurrency, realExpenses),
    [projections, accounts, rates, baseCurrency, realExpenses]
  );

  const forecastByAccount = useMemo((): Record<string, ForecastMonth[]> => {
    const map: Record<string, ForecastMonth[]> = {};
    accounts.forEach((acc) => {
      map[acc.id] = calcForecast(projections, accounts, acc.id, rates, baseCurrency, realExpenses);
    });
    return map;
  }, [projections, accounts, rates, baseCurrency, realExpenses]);

  // ── Derivados: alertas ─────────────────────────────────────────────────────
  const computedAlerts = useMemo((): AppAlert[] => {
    const alerts: AppAlert[] = [];
    const now = new Date();
    const currentMonthKey = monthKey(now);

    accounts.forEach((acc) => {
      if (!acc.minBalance || acc.minBalance <= 0) return;
      const { realBalance } = calcRealBalance(acc, realExpenses, rates, baseCurrency);
      if (realBalance < acc.minBalance) {
        alerts.push({
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

    accounts.forEach((acc) => {
      if (!acc.minBalance || acc.minBalance <= 0) return;
      const { realBalance } = calcRealBalance(acc, realExpenses, rates, baseCurrency);
      if (realBalance < acc.minBalance) return;
      const fc = forecastByAccount[acc.id] || [];
      const riskMonth = fc.slice(0, 3).find((m) => m.runningBalance < acc.minBalance);
      if (riskMonth) {
        alerts.push({
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
        alerts.push({
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

    projections.forEach((p) => {
      if (!p.hasDuplicateWarning) return;
      if (p.duplicateWarningMonth !== currentMonthKey) return;
      const cat = categories.find((c) => c.id === p.categoryId);
      const acc = accounts.find((a) => a.id === p.accountId);
      const currency = acc?.currency ?? baseCurrency;
      alerts.push({
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

    const forecastThisMonth = forecastAll[0];
    if (forecastThisMonth && forecastThisMonth.net < 0) {
      alerts.push({
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
        alerts.push({
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
          alerts.push({
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
          const threeMonthsAgo = new Date();
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
            alerts.push({
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
          alerts.push({
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

    // ── Alertas de tarjetas de crédito ────────────────────────────────────────
    // Estrategia de acciones (UX):
    //  • Pago vencido      → 'open_payment_modal' (acción directa, máxima urgencia)
    //  • Utilización alta  → 'open_simulator'    (educa: "esto te costará X")
    //  • Coste intereses   → 'open_simulator'    (motiva a amortizar más rápido)
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
          alerts.push({
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
            alerts.push({
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
            alerts.push({
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

    // ── ✨ F2.10 — Alertas de vencimiento próximo de proyecciones ──────────
    // Genera 1 alerta por cada proyección cuyo próximo vencimiento entra en
    // su ventana de aviso. Respeta `alertDisabled` y `alertSnoozeUntil` (la
    // lógica vive en shouldAlertProjection).
    //
    // Acción: abre el modal de "Nuevo movimiento real" pre-rellenado con los
    // datos de la proyección (importe, cuenta, categoría, fecha hoy).
    projections.forEach((p) => {
      // Las proyecciones vinculadas a préstamos se gestionan desde el
      // detalle del préstamo; no avisamos aquí para no duplicar señales.
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

      alerts.push({
        // ID idempotente: misma proyección + misma fecha = misma alerta
        // (clave para que ignoredAlerts/dismissed funcione correctamente).
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

    return alerts.filter((a) => !ignoredAlerts.includes(a.id));
  }, [
    accounts, projections, categories, realExpenses, goals,
    rates, baseCurrency, ignoredAlerts,
    forecastAll, forecastByAccount, dateFormat,
  ]);

  // ── Derivados: cuentas ─────────────────────────────────────────────────────
  const accountWarnings = useMemo(() => {
    const w: Record<string, boolean> = {};
    accounts.forEach((acc) => {
      if (!acc.minBalance || acc.minBalance <= 0) { w[acc.id] = false; return; }
      const fc = forecastByAccount[acc.id] || [];
      w[acc.id] = acc.balance < acc.minBalance || fc.some((m) => m.runningBalance < acc.minBalance);
    });
    return w;
  }, [accounts, forecastByAccount]);

  const totalBalance = useMemo(
    () => accounts.reduce((sum, acc) =>
      sum + convertAmount(acc.balance, acc.currency ?? baseCurrency, displayCurrency, rates), 0),
    [accounts, displayCurrency, baseCurrency, rates]
  );

  const realBalanceMap = useMemo(() => {
    const map: Record<string, any> = {};
    accounts.forEach((acc) => {
      if (acc.accountType === 'credit_card') {
        const { debt, available, utilizationPct, appliedCount, ignoredCount } =
          calcCreditCardDebt(acc, realExpenses, rates, baseCurrency);
        map[acc.id] = {
          realBalance: -debt,        // Negativo → resta al patrimonio
          creditDebt: debt,          // Deuda actual (positivo, legible)
          creditAvailable: available,// Disponible = límite - deuda
          utilizationPct,            // % de utilización del límite
          appliedCount,
          ignoredCount,
        };
      } else if (acc.accountType === 'loan') {
        // Préstamos/hipotecas: la deuda resta del patrimonio igual que las tarjetas
        const { debt, initialDebt, appliedCount, ignoredCount } =
          calcLoanDebt(acc, realExpenses, rates, baseCurrency);
        map[acc.id] = {
          realBalance: -debt,        // Negativo → resta al patrimonio neto
          loanDebt: debt,            // Capital pendiente HOY (positivo, legible)
          loanInitialDebt: initialDebt, // Capital pendiente al dar de alta el préstamo
          appliedCount,              // Pagos/cuotas aplicados
          ignoredCount,              // Movimientos anteriores al saldo base
        };
      } else {
        map[acc.id] = calcRealBalance(acc, realExpenses, rates, baseCurrency);
      }
    });
    return map;
  }, [accounts, realExpenses, rates, baseCurrency]);

  const totalRealBalance = useMemo(
    () => accounts.reduce((sum, acc) => {
      const { realBalance } = realBalanceMap[acc.id] ?? { realBalance: acc.balance };
      return sum + convertAmount(realBalance, acc.currency ?? baseCurrency, displayCurrency, rates);
    }, 0),
    [accounts, realBalanceMap, displayCurrency, baseCurrency, rates]
  );

  const stats = useMemo(() => ({
    totalBalance,
    totalRealBalance,
    thisMonth: forecastAll[0] || { income: 0, expense: 0, net: 0 },
    warnAccounts: accounts.filter((a) => accountWarnings[a.id]),
  }), [totalBalance, totalRealBalance, forecastAll, accountWarnings, accounts]);

  // ── resetApp ───────────────────────────────────────────────────────────────
  const resetApp = useCallback(() => {
    // ⚠️ Orden correcto: PRIMERO purgar localStorage (incluidos los datos
    // cifrados), DESPUÉS destruir la VMK. Si haces lo contrario, los datos
    // cifrados quedan zombies (sin clave para descifrarlos jamás).
    //
    // No usamos setAccounts([]) etc. porque dispararían escrituras al cache
    // cifrado que quedarían huérfanas tras destroyVault.
    try {
      // Snapshot de claves de la app (todo lo que empieza por fh_)
      const keysToWipe: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('fh_')) keysToWipe.push(k);
      }
      keysToWipe.forEach((k) => localStorage.removeItem(k));
    } catch (err) {
      console.error('[resetApp] Error purgando localStorage:', err);
    }
    // Destruye VMK + envolturas + estado de seguridad en memoria
    clearSecurity();
    // Recargar para garantizar estado limpio en TODOS los providers
    setTimeout(() => window.location.reload(), 50);
  }, [clearSecurity]);

  // ── Refs para backup (evitan stale closures sin deps en useCallback) ───────
  const accountsRef        = useRef(accounts);
  const categoriesRef      = useRef(categories);
  const projectionsRef     = useRef(projections);
  const realExpensesRef    = useRef(realExpenses);
  const goalsRef           = useRef(goals);
  const bankFormatsRef     = useRef(bankFormats);
  const categoryRulesRef   = useRef(categoryRules);
  const baseCurrencyRef    = useRef(baseCurrency);
  const displayCurrencyRef = useRef(displayCurrency);
  const darkRef            = useRef(settings.dark);

  accountsRef.current        = accounts;
  categoriesRef.current      = categories;
  projectionsRef.current     = projections;
  realExpensesRef.current    = realExpenses;
  goalsRef.current           = goals;
  bankFormatsRef.current     = bankFormats;
  categoryRulesRef.current   = categoryRules;
  baseCurrencyRef.current    = baseCurrency;
  displayCurrencyRef.current = displayCurrency;
  darkRef.current            = settings.dark;

  // ── Funciones de backup ───────────────────────────────────────────────────
  // ⚠️ S.0 — El historial guarda SOLO metadata (sin `data`).
  // Esto evita inflar localStorage hasta el límite de 5-10 MB.
  // El snapshot completo se materializa al descargar (con datos del momento).
  const createBackup = useCallback((label = 'Copia manual') => {
    const entry: BackupEntry = {
      id:                uid(),
      timestamp:         Date.now(),
      label,
      accountsCount:     accountsRef.current.length,
      categoriesCount:   categoriesRef.current.length,
      projectionsCount:  projectionsRef.current.length,
      realExpensesCount: realExpensesRef.current.length,
      goalsCount:        goalsRef.current.length,
      // ❌ Ya NO guardamos `data` aquí — solo metadata.
    };
    setBackupHistory((prev) => [entry, ...prev].slice(0, 50));
    return entry;
  }, []);

  // ── Helper interno: arma el snapshot completo desde los refs ──────────────
  const buildFullSnapshot = useCallback((label: string, timestamp: number) => {
    // ⚠️ FASE 3 — fh_license_state está en la whitelist cifrada de
    // encryptedStorage. Hay que leerla a través del helper, NUNCA con
    // localStorage.getItem directo (devolvería "enc:v1:..." y JSON.parse
    // fallaría → el backup se guardaría con licenseState: null y el
    // usuario perdería su licencia al restaurar).
    let licenseState = null;
    try {
      licenseState = getEncryptedItem<any>('fh_license_state', null);
    } catch {
      licenseState = null;
    }
    return {
      id:                uid(),
      timestamp,
      label,
      accountsCount:     accountsRef.current.length,
      categoriesCount:   categoriesRef.current.length,
      projectionsCount:  projectionsRef.current.length,
      realExpensesCount: realExpensesRef.current.length,
      goalsCount:        goalsRef.current.length,
      data: {
        accounts:        accountsRef.current,
        categories:      categoriesRef.current,
        projections:     projectionsRef.current,
        realExpenses:    realExpensesRef.current,
        goals:           goalsRef.current ?? [],
        bankFormats:     bankFormatsRef.current,
        categoryRules:   categoryRulesRef.current,
        baseCurrency:    baseCurrencyRef.current,
        displayCurrency: displayCurrencyRef.current,
        dark:            darkRef.current,
        licenseState,
      },
    };
  }, []);

  // ⚠️ S.1 — downloadBackup ahora es async y EXIGE contraseña.
  // El backup .json se cifra siempre con AES-GCM antes de descargar.
  // Como las entradas del historial NO guardan `data` (S.0), siempre
  // construimos un snapshot fresco con los datos actuales del momento
  // de la descarga. La metadata del entry (label, timestamp) se respeta
  // si se pasa, para mantener trazabilidad de "estoy descargando aquella copia".
  const downloadBackup = useCallback(
    async (entry: BackupEntry | undefined, password: string): Promise<void> => {
      if (!password || password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres.');
      }

      // Snapshot fresco con datos del momento. Si nos pasaron una entry,
      // respetamos su label/timestamp para que el fichero descargado
      // refleje "esta es la copia del día X".
      const label     = entry?.label     ?? 'Descarga manual';
      const timestamp = entry?.timestamp ?? Date.now();
      const snapshot  = buildFullSnapshot(label, timestamp);

      // Cifrar el `data` completo
      const { encryption, ciphertext } = await encryptBackupPayload(
        snapshot.data,
        password
      );

      // Estructura del fichero v2.0 (cifrado)
      const fileObj = {
        app: 'FinanzasHogar' as const,
        version: '2.0' as const,
        format: 'encrypted-aes-gcm' as const,
        // Metadata pública (no cifrada) — para preview en import
        id:                snapshot.id,
        timestamp:         snapshot.timestamp,
        label:             snapshot.label,
        accountsCount:     snapshot.accountsCount,
        categoriesCount:   snapshot.categoriesCount,
        projectionsCount:  snapshot.projectionsCount,
        realExpensesCount: snapshot.realExpensesCount,
        goalsCount:        snapshot.goalsCount,
        encryption,
        ciphertext,
      };

      const json    = JSON.stringify(fileObj, null, 2);
      const blob    = new Blob([json], { type: 'application/json' });
      const url     = URL.createObjectURL(blob);
      const a       = document.createElement('a');
      const date    = new Date(snapshot.timestamp);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      a.href        = url;
      a.download    = `FinanzasHogar_backup_${dateStr}.enc.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [buildFullSnapshot]
  );

  const restoreBackup = useCallback((entry: BackupEntry) => {
    const { data: d } = entry;
    setAccounts(d.accounts ?? []);
    setCategories(d.categories ?? []);
    setProjections(d.projections ?? []);
    setRealExpenses(d.realExpenses ?? []);
    setGoals(d.goals ?? []);
    setBankFormats(d.bankFormats ?? []);
    setCategoryRules(d.categoryRules ?? []);
    setBaseCurrency(d.baseCurrency ?? 'EUR');
    setDisplayCurrency(d.displayCurrency ?? 'EUR');
    setDark(d.dark ?? false);
    // ⚠️ FASE 3 — fh_license_state está cifrada. Si escribimos directamente
    // con localStorage.setItem rompemos la integridad del cifrado para esa
    // clave (la próxima lectura devolvería texto plano sin marcador "enc:v1:").
    if (d.licenseState) setEncryptedItem('fh_license_state', d.licenseState);
    if ((d.accounts ?? []).length > 0) setOnboarded(true);
  }, []);

  const deleteBackup = useCallback((id: string) => {
    setBackupHistory((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // ── Registrar fecha de primer onboarding ──────────────────────────────────
useEffect(() => {
  if (onboarded && onboardedAt === 0) {
    setOnboardedAt(Date.now());
  }
}, [onboarded]);

// ── Motor de recurrentes al arrancar ──────────────────────────────────────
  const recurringMotorRan = useRef(false);

  useEffect(() => {
    if (!onboarded) return;
    if (accounts.length === 0) return;
    if (recurringMotorRan.current) return;
    recurringMotorRan.current = true;

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    setProjections((prev) =>
      prev.map((p) => {
        if (p.hasDuplicateWarning && p.duplicateWarningMonth !== currentMonthKey) {
          const { hasDuplicateWarning, duplicateWarningMonth, ...rest } = p;
          return rest;
        }
        return p;
      })
    );

    setProjections((prev) =>
      prev.map((p) => {
        if (!p.nextOverrideAmount) return p;
        if (p.lastApplied && p.lastApplied <= currentMonthKey) {
          const { nextOverrideAmount, ...rest } = p;
          return rest;
        }
        return p;
      })
    );

    const result = applyRecurringProjections(
      projections, realExpenses, setRealExpenses, setProjections, accounts, baseCurrency
    );
    if (result.applied > 0)
      console.info(`[Recurrentes] ${result.applied} cargo(s) aplicado(s) automáticamente`);
    if (result.duplicates > 0 && result.duplicateDetails) {
      setRecurringDuplicateWarnings(result.duplicateDetails);
      setShowRecurringWarnings(true);
    }
  }, [onboarded]);

// ── Backup automático al arrancar ─────────────────────────────────────────
useEffect(() => {
  if (!onboarded) return;
  if (accounts.length === 0) return;

  // ✅ Solo si hay datos reales más allá de la cuenta
  const hasRealData =
    realExpenses.length > 0 ||
    projections.length > 0 ||
    goals.length > 0 ||
    categoryRules.length > 0;

  if (!hasRealData) return;

  if (!firstSessionDone) {
    setFirstSessionDone(true);
    setAutoBackupDone(false);
    return;
  }

  const lastBackup             = backupHistory[0]?.timestamp ?? 0;
  const daysSinceBackup        = lastBackup > 0
    ? Math.floor((Date.now() - lastBackup) / (1000 * 60 * 60 * 24))
    : null;
  const neverBackedUp          = lastBackup === 0;
  const backupIsOld            = daysSinceBackup !== null && daysSinceBackup >= backupReminderDays;
  const alreadyDoneThisSession = Date.now() - lastAutoBackupSession < 1000 * 60 * 60;

  // ✅ Primera vez: espera 3 días desde el onboarding
  const daysSinceOnboarding = onboardedAt > 0
    ? Math.floor((Date.now() - onboardedAt) / (1000 * 60 * 60 * 24))
    : 999;

  const shouldBackupFirstTime = neverBackedUp && daysSinceOnboarding >= 3;
  const shouldBackupRecurring = !neverBackedUp && backupIsOld;

  if ((shouldBackupFirstTime || shouldBackupRecurring) && !alreadyDoneThisSession) {
    const timer = setTimeout(() => {
      createBackup('Automática al arrancar');
      setLastAutoBackupSession(Date.now());
      setAutoBackupDone(true);
    }, 1500);
    return () => clearTimeout(timer);
  } else {
    setAutoBackupDone(false);
  }
}, [
  onboarded, accounts.length, firstSessionDone, onboardedAt,
  realExpenses.length, projections.length, goals.length, categoryRules.length,
]);

  // ── Valor combinado para AppContext (backward compat con useApp()) ─────────
  const coreValue = useMemo(() => ({
    onboarded, setOnboarded,
    resetApp,
    firstSessionDone, setFirstSessionDone,
    tourCompleted, setTourCompleted,
    tourIsFirstTime, setTourIsFirstTime,
    backupHistory, setBackupHistory,
    createBackup, restoreBackup, deleteBackup, downloadBackup,
    backupReminderDays, setBackupReminderDays,
    backupReminderDismissed, setBackupReminderDismissed,
    autoBackupDone, setAutoBackupDone,
    computedAlerts,
    forecastAll, forecastByAccount,
    accountWarnings, realBalanceMap, stats,
  }), [
    onboarded, firstSessionDone, tourCompleted, tourIsFirstTime,
    backupHistory, backupReminderDays, backupReminderDismissed, autoBackupDone,
    computedAlerts, forecastAll, forecastByAccount,
    accountWarnings, realBalanceMap, stats,
    resetApp, createBackup, downloadBackup, restoreBackup, deleteBackup,
  ]);

  // Combina los 4 sub-contextos en el AppContext unificado (backward compat)
  const combinedValue = useMemo((): AppContextType => ({
    ...settings,
    ...data,
    ...ui,
    ...coreValue,
  }), [settings, data, ui, coreValue]);

  return <AppContext.Provider value={combinedValue}>{children}</AppContext.Provider>;
}

// ─── AppProvider ──────────────────────────────────────────────────────────────
// Wrapper público — compone los 4 sub-providers en el orden correcto.
// App.tsx no necesita cambios: sigue usando <AppProvider>.
export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <DataProvider>
        <UIProvider>
          <AppCoreProvider>
            {children}
          </AppCoreProvider>
        </UIProvider>
      </DataProvider>
    </SettingsProvider>
  );
}
