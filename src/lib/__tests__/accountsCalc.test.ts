// src/lib/__tests__/accountsCalc.test.ts
import { describe, it, expect } from 'vitest';
import {
  recalcLoanAfterAmortization,
  estimateInterestSaved,
} from '../accountsCalc';

describe('recalcLoanAfterAmortization', () => {
  describe('liquidación total', () => {
    it('marca isFullPayoff cuando el importe iguala la deuda', () => {
      const r = recalcLoanAfterAmortization({
        currentDebt: 10000,
        amount: 10000,
        mode: 'reduce_payment',
        annualRate: 3,
        currentPayment: 500,
        currentTerm: 24,
      });
      expect(r.isFullPayoff).toBe(true);
      expect(r.newPrincipal).toBe(0);
      expect(r.newPayment).toBe(0);
      expect(r.newTerm).toBe(0);
    });

    it('marca isFullPayoff cuando el importe supera la deuda', () => {
      const r = recalcLoanAfterAmortization({
        currentDebt: 5000,
        amount: 7000,
        mode: 'reduce_term',
        annualRate: 3,
        currentPayment: 200,
        currentTerm: 36,
      });
      expect(r.isFullPayoff).toBe(true);
      expect(r.newPrincipal).toBe(0);
    });
  });

  describe('modo reduce_payment (mismo plazo, baja cuota)', () => {
    it('recalcula la cuota con fórmula francesa cuando hay tipo de interés', () => {
      // Hipoteca 100.000€ a 20 años (240 meses) al 3% TAE
      // Cuota original ≈ 554.60€
      // Amortizamos 20.000 → capital pendiente 80.000
      // Nueva cuota ≈ 443.68€
      const r = recalcLoanAfterAmortization({
        currentDebt: 100000,
        amount: 20000,
        mode: 'reduce_payment',
        annualRate: 3,
        currentPayment: 554.6,
        currentTerm: 240,
      });
      expect(r.newPrincipal).toBe(80000);
      expect(r.newTerm).toBe(240); // plazo intacto
      expect(r.newPayment).toBeCloseTo(443.68, 1);
      expect(r.isFullPayoff).toBe(false);
    });

    it('divide proporcionalmente cuando no hay tipo de interés', () => {
      const r = recalcLoanAfterAmortization({
        currentDebt: 1200,
        amount: 200,
        mode: 'reduce_payment',
        annualRate: 0,
        currentPayment: 100,
        currentTerm: 12,
      });
      expect(r.newPrincipal).toBe(1000);
      expect(r.newTerm).toBe(12);
      expect(r.newPayment).toBeCloseTo(1000 / 12, 5);
    });

    it('mantiene la cuota cuando no hay plazo informado', () => {
      const r = recalcLoanAfterAmortization({
        currentDebt: 5000,
        amount: 1000,
        mode: 'reduce_payment',
        annualRate: 0,
        currentPayment: 250,
        currentTerm: 0,
      });
      expect(r.newPrincipal).toBe(4000);
      expect(r.newPayment).toBe(250);
    });
  });

  describe('modo reduce_term (misma cuota, baja plazo)', () => {
    it('recalcula plazo con fórmula logarítmica cuando hay tipo', () => {
      // Mismo escenario: 100k a 20 años al 3%, cuota 554.60
      // Amortizamos 20k manteniendo cuota → plazo baja a ~166 meses
      const r = recalcLoanAfterAmortization({
        currentDebt: 100000,
        amount: 20000,
        mode: 'reduce_term',
        annualRate: 3,
        currentPayment: 554.6,
        currentTerm: 240,
      });
      expect(r.newPrincipal).toBe(80000);
      expect(r.newPayment).toBe(554.6); // cuota intacta
      expect(r.newTerm).toBeLessThan(240);
      expect(r.newTerm).toBeGreaterThan(160);
      expect(r.newTerm).toBeLessThanOrEqual(180);
    });

    it('divide proporcionalmente cuando no hay tipo de interés', () => {
      const r = recalcLoanAfterAmortization({
        currentDebt: 1200,
        amount: 200,
        mode: 'reduce_term',
        annualRate: 0,
        currentPayment: 100,
        currentTerm: 12,
      });
      expect(r.newPrincipal).toBe(1000);
      expect(r.newPayment).toBe(100);
      expect(r.newTerm).toBe(10); // 1000 / 100
    });

    it('mantiene el plazo si la cuota no cubre los intereses', () => {
      // Cuota muy pequeña que no llega a cubrir los intereses del capital
      const r = recalcLoanAfterAmortization({
        currentDebt: 100000,
        amount: 5000,
        mode: 'reduce_term',
        annualRate: 12, // 1% mensual → interés mensual sobre 95k = 950
        currentPayment: 500, // < 950 → no cubre intereses
        currentTerm: 360,
      });
      expect(r.newPrincipal).toBe(95000);
      expect(r.newTerm).toBe(360); // plazo intacto (caso defensivo)
    });
  });
});

describe('estimateInterestSaved', () => {
  it('calcula ahorro positivo cuando los nuevos intereses son menores', () => {
    // Antes: 500 * 240 - 100000 = 20000 de intereses
    // Después: 400 * 240 - 80000 = 16000 de intereses
    // Ahorro = 20000 - 16000 - 0 = 4000
    const saved = estimateInterestSaved({
      prevPayment: 500,
      prevTerm: 240,
      currentDebt: 100000,
      newPayment: 400,
      newTerm: 240,
      newPrincipal: 80000,
      fee: 0,
    });
    expect(saved).toBe(4000);
  });

  it('descuenta la comisión del ahorro', () => {
    const saved = estimateInterestSaved({
      prevPayment: 500,
      prevTerm: 240,
      currentDebt: 100000,
      newPayment: 400,
      newTerm: 240,
      newPrincipal: 80000,
      fee: 1500,
    });
    expect(saved).toBe(2500); // 4000 - 1500
  });

  it('nunca devuelve negativo (clamp a 0)', () => {
    // Comisión brutal que se come todo el ahorro
    const saved = estimateInterestSaved({
      prevPayment: 500,
      prevTerm: 240,
      currentDebt: 100000,
      newPayment: 400,
      newTerm: 240,
      newPrincipal: 80000,
      fee: 99999,
    });
    expect(saved).toBe(0);
  });

  it('devuelve 0 cuando no hay diferencia de intereses', () => {
    const saved = estimateInterestSaved({
      prevPayment: 500,
      prevTerm: 240,
      currentDebt: 100000,
      newPayment: 500,
      newTerm: 240,
      newPrincipal: 100000,
      fee: 0,
    });
    expect(saved).toBe(0);
  });
});
