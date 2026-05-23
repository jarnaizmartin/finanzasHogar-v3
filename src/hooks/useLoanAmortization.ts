// src/hooks/useLoanAmortization.ts
//
// Hook que encapsula toda la lógica de amortización parcial de préstamos
// (Fase 2.1 + 2.1.4): aplicar amortización y deshacer la última.
//
// Responsabilidades:
//   - Gestionar el estado UI: qué préstamo se está amortizando y qué
//     amortización está pendiente de confirmar deshacer.
//   - handleAmortization: crea movimientos (transfer + comisión), actualiza
//     préstamo (cuota/plazo/histórico) y sincroniza la proyección vinculada.
//   - handleUndoAmortization: revierte TODOS los efectos de una amortización.
//
// Extraído de src/views/Accounts.tsx el 24/05/2026 (refactor/accounts, commit 7).
//
// La función pura `recalcLoanAfterAmortization` y `estimateInterestSaved`
// siguen viviendo en src/lib/accountsCalc.ts (matemática) — este hook se
// encarga solo de la orquestación con estado y side-effects.

import { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { useToast } from '../contexts/ToastContext';
import {
  recalcLoanAfterAmortization,
  estimateInterestSaved,
} from '../lib/accountsCalc';
import type { AmortizationMode } from '../lib/loanUtils';
import type { Account } from '../types';

const uid = () => crypto.randomUUID();

export interface AmortizationFormData {
  amount: number;
  fee: number;
  mode: AmortizationMode;
  fromAccountId: string;
}

export interface UndoAmortizationRequest {
  loanId: string;
  amortizationId: string;
}

export function useLoanAmortization() {
  const {
    accounts,
    setAccounts,
    setRealExpenses,
    setProjections,
    realBalanceMap,
    baseCurrency,
    fmtAccount,
  } = useApp();
  const toast = useToast();

  // ── Estado UI ────────────────────────────────────────────────────────────
  const [amortizingLoanId, setAmortizingLoanId] = useState<string | null>(null);
  const [undoAmortization, setUndoAmortization] =
    useState<UndoAmortizationRequest | null>(null);

  // Préstamo actualmente seleccionado para amortizar (derivado)
  const amortizingLoan = useMemo(
    () =>
      amortizingLoanId
        ? accounts.find(
            (a) => a.id === amortizingLoanId && a.accountType === 'loan'
          ) ?? null
        : null,
    [amortizingLoanId, accounts]
  );

  // ── Aplicar amortización parcial ─────────────────────────────────────────
  // 1. Crea un movimiento real (income) en el préstamo → reduce la deuda
  // 2. Crea un movimiento real (expense) en la cuenta origen → registra el gasto
  // 3. Si hay comisión, crea un segundo expense en la cuenta origen
  // 4. Actualiza el préstamo: cuota o cuotas restantes según modo
  // 5. Añade entrada al histórico amortizations[]
  // 6. Sincroniza la proyección vinculada si cambia la cuota
  const handleAmortization = (loan: Account, data: AmortizationFormData) => {
    const today = new Date().toISOString().slice(0, 10);
    const transferId = uid();
    const currency = loan.currency ?? baseCurrency;
    const currentDebt = realBalanceMap[loan.id]?.loanDebt ?? loan.balance;
    const currentPayment = loan.monthlyPayment ?? 0;
    const currentTerm = loan.paymentsRemaining ?? 0;
    const annualRate = loan.interestRate ?? 0;

    // Simulación final (snapshot del histórico) — lógica pura
    const { newPrincipal, newPayment, newTerm, isFullPayoff } =
      recalcLoanAfterAmortization({
        currentDebt,
        amount: data.amount,
        mode: data.mode,
        annualRate,
        currentPayment,
        currentTerm,
      });

    const interestSavedEstimate = estimateInterestSaved({
      prevPayment: currentPayment,
      prevTerm: currentTerm,
      currentDebt,
      newPayment,
      newTerm,
      newPrincipal,
      fee: data.fee,
    });

    // ── 1+2. Movimientos transfer ──
    const incomeId = uid();
    const expenseId = uid();
    const newMovements = [
      {
        id: incomeId,
        entryDate: today,
        valueDate: today,
        description: `Amortización parcial${
          data.mode === 'reduce_term' ? ' (reduce plazo)' : ' (reduce cuota)'
        }`,
        categoryId: '__transfer__',
        amount: data.amount,
        currency,
        type: 'income' as const,
        accountId: loan.id,
        isTransfer: true,
        transferId,
      },
      {
        id: expenseId,
        entryDate: today,
        valueDate: today,
        description: `Amortización: ${loan.name}`,
        categoryId: '__transfer__',
        amount: data.amount,
        currency,
        type: 'expense' as const,
        accountId: data.fromAccountId,
        isTransfer: true,
        transferId,
      },
    ];

    // ── 3. Comisión (si aplica) ──
    if (data.fee > 0) {
      newMovements.push({
        id: uid(),
        entryDate: today,
        valueDate: today,
        description: `Comisión amortización: ${loan.name}`,
        categoryId: '__transfer__',
        amount: data.fee,
        currency,
        type: 'expense' as const,
        accountId: data.fromAccountId,
      } as (typeof newMovements)[number]);
    }

    setRealExpenses((prev) => [...prev, ...newMovements]);

    // ── 4. Actualizar préstamo (cuota / plazo / histórico) ──
    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id !== loan.id) return a;
        const newAmortization = {
          id: uid(),
          date: today,
          amount: data.amount,
          fee: data.fee,
          mode: data.mode,
          fromAccountId: data.fromAccountId,
          prevMonthlyPayment: currentPayment,
          newMonthlyPayment: newPayment,
          prevPaymentsRemaining: currentTerm,
          newPaymentsRemaining: newTerm,
          interestSavedEstimate,
        };
        return {
          ...a,
          monthlyPayment: newPayment,
          paymentsRemaining: newTerm,
          amortizations: [...(a.amortizations ?? []), newAmortization],
        };
      })
    );

    // ── 5. Sincronizar proyección vinculada si cambia la cuota ──
    if (loan.linkedProjectionId && newPayment !== currentPayment) {
      setProjections((prev) =>
        prev.map((p) =>
          p.id === loan.linkedProjectionId ? { ...p, amount: newPayment } : p
        )
      );
    }

    // ── 6. Si quedó liquidado, eliminar la proyección vinculada ──
    if (isFullPayoff && loan.linkedProjectionId) {
      setProjections((prev) =>
        prev.filter((p) => p.id !== loan.linkedProjectionId)
      );
    }

    // ── 7. Toast resumen ──
    if (isFullPayoff) {
      toast(
        `🎉 ¡Préstamo liquidado! Has ahorrado ~${fmtAccount(
          interestSavedEstimate,
          currency
        )} en intereses.`,
        'success'
      );
    } else if (data.mode === 'reduce_term') {
      const monthsSaved = currentTerm - newTerm;
      toast(
        `💸 Amortización aplicada. Terminarás ${monthsSaved} ${
          monthsSaved === 1 ? 'mes' : 'meses'
        } antes y ahorrarás ~${fmtAccount(
          interestSavedEstimate,
          currency
        )} en intereses.`,
        'success'
      );
    } else {
      const reduction = currentPayment - newPayment;
      toast(
        `💸 Amortización aplicada. Tu nueva cuota es ${fmtAccount(
          newPayment,
          currency
        )} (−${fmtAccount(reduction, currency)}/mes).`,
        'success'
      );
    }

    setAmortizingLoanId(null);
  };

  // ── Deshacer última amortización ─────────────────────────────────────────
  // Revierte TODOS los efectos:
  //   1. Elimina los movimientos asociados (income + expense + comisión)
  //   2. Restaura monthlyPayment y paymentsRemaining anteriores
  //   3. Resincroniza la proyección vinculada con la cuota anterior
  //   4. Quita la entrada del array amortizations[]
  //
  // ⚠️ Solo debe usarse con la ÚLTIMA amortización (la UI ya lo restringe).
  const handleUndoAmortization = (loanId: string, amortizationId: string) => {
    const loan = accounts.find((a) => a.id === loanId);
    if (!loan || !loan.amortizations) return;
    const amort = loan.amortizations.find((a) => a.id === amortizationId);
    if (!amort) return;

    // 1. Borrar movimientos asociados
    setRealExpenses((prev) =>
      prev.filter((e) => {
        if (
          e.accountId === loanId &&
          e.valueDate === amort.date &&
          e.amount === amort.amount &&
          e.type === 'income' &&
          e.isTransfer &&
          e.description.startsWith('Amortización')
        ) {
          return false;
        }
        if (
          e.accountId === amort.fromAccountId &&
          e.valueDate === amort.date &&
          e.amount === amort.amount &&
          e.type === 'expense' &&
          e.isTransfer &&
          e.description.startsWith('Amortización:')
        ) {
          return false;
        }
        if (
          amort.fee > 0 &&
          e.accountId === amort.fromAccountId &&
          e.valueDate === amort.date &&
          e.amount === amort.fee &&
          e.type === 'expense' &&
          e.description.startsWith('Comisión amortización:')
        ) {
          return false;
        }
        return true;
      })
    );

    // 2. Restaurar préstamo
    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id !== loanId) return a;
        return {
          ...a,
          monthlyPayment: amort.prevMonthlyPayment ?? a.monthlyPayment,
          paymentsRemaining:
            amort.prevPaymentsRemaining ?? a.paymentsRemaining,
          amortizations: (a.amortizations ?? []).filter(
            (x) => x.id !== amortizationId
          ),
        };
      })
    );

    // 3. Resincronizar proyección vinculada
    if (
      loan.linkedProjectionId &&
      amort.prevMonthlyPayment != null &&
      amort.prevMonthlyPayment !== amort.newMonthlyPayment
    ) {
      setProjections((prev) =>
        prev.map((p) =>
          p.id === loan.linkedProjectionId
            ? { ...p, amount: amort.prevMonthlyPayment! }
            : p
        )
      );
    }

    toast(
      `✅ Amortización deshecha. Se han revertido los movimientos y restaurado la cuota anterior.`,
      'success'
    );
    setUndoAmortization(null);
  };

  return {
    // estado
    amortizingLoanId,
    setAmortizingLoanId,
    amortizingLoan,
    undoAmortization,
    setUndoAmortization,
    // acciones
    handleAmortization,
    handleUndoAmortization,
  };
}
