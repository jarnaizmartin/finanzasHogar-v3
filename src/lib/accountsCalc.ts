// src/lib/accountsCalc.ts
//
// Matemática pura de operaciones sobre préstamos.
// Extraído de src/views/Accounts.tsx el 24/05/2026 (refactor/accounts, commit 2).
//
// Reglas:
//  - Funciones puras (sin side effects, sin acceso a contexto).
//  - Sin formateo (devolvemos numbers crudos).
//  - El consumidor decide si redondear / formatear.

import type { AmortizationMode } from './loanUtils';

export interface RecalcLoanInput {
  /** Capital pendiente ANTES de aplicar la amortización. */
  currentDebt: number;
  /** Importe de la amortización parcial. */
  amount: number;
  /** Modo de amortización: reducir cuota o reducir plazo. */
  mode: AmortizationMode;
  /** Tipo de interés anual (%). 0 si no aplica. */
  annualRate: number;
  /** Cuota mensual actual. */
  currentPayment: number;
  /** Cuotas restantes ANTES de la amortización. */
  currentTerm: number;
}

export interface RecalcLoanResult {
  /** Capital pendiente DESPUÉS de aplicar la amortización. */
  newPrincipal: number;
  /** Nueva cuota mensual. */
  newPayment: number;
  /** Nuevas cuotas restantes. */
  newTerm: number;
  /** True si la amortización liquida totalmente el préstamo. */
  isFullPayoff: boolean;
}

/**
 * Recalcula cuota y plazo de un préstamo tras una amortización parcial.
 *
 * Comportamiento:
 *  - Si `amount >= currentDebt` → liquidación total (newPayment=0, newTerm=0).
 *  - Modo `reduce_payment`: mantiene el plazo, recalcula la cuota con la
 *    fórmula del préstamo francés. Si no hay tipo de interés, divide
 *    proporcionalmente. Si no hay plazo, mantiene la cuota original.
 *  - Modo `reduce_term`: mantiene la cuota, recalcula el plazo. Si la cuota
 *    no cubre los intereses, mantiene el plazo original. Si no hay interés,
 *    divide proporcionalmente.
 */
export function recalcLoanAfterAmortization(input: RecalcLoanInput): RecalcLoanResult {
  const { currentDebt, amount, mode, annualRate, currentPayment, currentTerm } = input;

  const isFullPayoff = amount >= currentDebt;
  const newPrincipal = Math.max(0, currentDebt - amount);

  if (isFullPayoff) {
    return { newPrincipal: 0, newPayment: 0, newTerm: 0, isFullPayoff: true };
  }

  let newPayment = currentPayment;
  let newTerm = currentTerm;

  if (mode === 'reduce_payment') {
    if (annualRate > 0 && currentTerm > 0) {
      const i = annualRate / 100 / 12;
      newPayment = (newPrincipal * i) / (1 - Math.pow(1 + i, -currentTerm));
    } else if (currentTerm > 0) {
      newPayment = newPrincipal / currentTerm;
    }
  } else {
    // reduce_term
    if (annualRate > 0 && currentPayment > 0) {
      const i = annualRate / 100 / 12;
      if (currentPayment > newPrincipal * i) {
        newTerm = Math.ceil(
          -Math.log(1 - (newPrincipal * i) / currentPayment) / Math.log(1 + i)
        );
      }
    } else if (currentPayment > 0) {
      newTerm = Math.ceil(newPrincipal / currentPayment);
    }
  }

  return { newPrincipal, newPayment, newTerm, isFullPayoff: false };
}

export interface InterestSavedInput {
  prevPayment: number;
  prevTerm: number;
  currentDebt: number;
  newPayment: number;
  newTerm: number;
  newPrincipal: number;
  /** Comisión cobrada por la amortización (resta al ahorro). */
  fee: number;
}

/**
 * Estima los intereses ahorrados al amortizar.
 *
 * Cálculo:
 *  - Intereses previstos ANTES = (prevPayment * prevTerm) - currentDebt
 *  - Intereses previstos DESPUÉS = (newPayment * newTerm) - newPrincipal
 *  - Ahorro = max(0, antes - después - fee)
 *
 * Es una estimación: asume que la cuota se mantiene constante hasta el final,
 * sin cambios futuros de tipo (en variables) ni nuevas amortizaciones.
 */
export function estimateInterestSaved(input: InterestSavedInput): number {
  const { prevPayment, prevTerm, currentDebt, newPayment, newTerm, newPrincipal, fee } = input;
  const prevInterest = prevPayment * prevTerm - currentDebt;
  const newInterest = newPayment * newTerm - newPrincipal;
  return Math.max(0, prevInterest - newInterest - fee);
}
