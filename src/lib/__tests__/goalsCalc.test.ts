/**
 * Tests de lógica pura de objetivos de ahorro.
 * Cubre: calcGoalsGlobalStats, calcGoalDeadlineProjection.
 */

import { describe, it, expect } from 'vitest';
import {
  calcGoalsGlobalStats,
  calcGoalDeadlineProjection,
} from '../goalsCalc';
import type { SavingsGoal } from '../../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const baseGoal = (overrides: Partial<SavingsGoal> = {}): SavingsGoal =>
  ({
    id: 'g1',
    name: 'Test',
    emoji: '🎯',
    color: '#000',
    targetAmount: 1000,
    currency: 'EUR',
    deadline: '',
    mode: 'manual',
    currentAmount: 0,
    categoryId: '',
    accountId: '',
    autoType: 'income',
    autoStartDate: '2025-01-01',
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  } as SavingsGoal);

const rates = { EUR: 1, USD: 1.1 };

// ─── calcGoalsGlobalStats ────────────────────────────────────────────────────

describe('calcGoalsGlobalStats', () => {
  it('devuelve ceros con lista vacía', () => {
    const stats = calcGoalsGlobalStats([], [], [], rates, 'EUR');
    expect(stats).toEqual({
      total: 0,
      completed: 0,
      totalTarget: 0,
      totalSaved: 0,
    });
  });

  it('cuenta total de objetivos correctamente', () => {
    const goals = [baseGoal({ id: 'g1' }), baseGoal({ id: 'g2' })];
    const stats = calcGoalsGlobalStats(goals, [], [], rates, 'EUR');
    expect(stats.total).toBe(2);
  });

  it('marca como completado un goal manual con currentAmount >= targetAmount', () => {
    const goals = [
      baseGoal({ targetAmount: 1000, currentAmount: 1000 }),
      baseGoal({ id: 'g2', targetAmount: 500, currentAmount: 200 }),
    ];
    const stats = calcGoalsGlobalStats(goals, [], [], rates, 'EUR');
    expect(stats.completed).toBe(1);
  });

  it('suma totalTarget en la divisa de visualización', () => {
    const goals = [
      baseGoal({ targetAmount: 1000, currency: 'EUR' }),
      baseGoal({ id: 'g2', targetAmount: 500, currency: 'EUR' }),
    ];
    const stats = calcGoalsGlobalStats(goals, [], [], rates, 'EUR');
    expect(stats.totalTarget).toBe(1500);
  });

  it('suma totalSaved en la divisa de visualización', () => {
    const goals = [
      baseGoal({ targetAmount: 1000, currentAmount: 400, currency: 'EUR' }),
      baseGoal({
        id: 'g2',
        targetAmount: 500,
        currentAmount: 100,
        currency: 'EUR',
      }),
    ];
    const stats = calcGoalsGlobalStats(goals, [], [], rates, 'EUR');
    expect(stats.totalSaved).toBe(500);
  });
});

// ─── calcGoalDeadlineProjection ──────────────────────────────────────────────

describe('calcGoalDeadlineProjection', () => {
  it('devuelve hasProjection=false si targetAmount es 0', () => {
    const proj = calcGoalDeadlineProjection(0, 0, '2026-12-31');
    expect(proj.hasProjection).toBe(false);
    expect(proj.months).toBe(0);
    expect(proj.monthly).toBe(0);
  });

  it('devuelve hasProjection=false si no hay deadline', () => {
    const proj = calcGoalDeadlineProjection(1000, 0, '');
    expect(proj.hasProjection).toBe(false);
  });

  it('devuelve hasProjection=false si targetAmount es negativo', () => {
    const proj = calcGoalDeadlineProjection(-100, 0, '2026-12-31');
    expect(proj.hasProjection).toBe(false);
  });

  it('calcula meses correctamente con deadline a 12 meses', () => {
    const now = new Date('2025-01-01');
    const proj = calcGoalDeadlineProjection(1200, 0, '2026-01-01', now);
    expect(proj.hasProjection).toBe(true);
    expect(proj.months).toBe(12);
    expect(proj.monthly).toBe(100);
  });

  it('descuenta currentAmount del importe restante', () => {
    const now = new Date('2025-01-01');
    const proj = calcGoalDeadlineProjection(1000, 400, '2026-01-01', now);
    expect(proj.months).toBe(12);
    expect(proj.monthly).toBe(50); // (1000 - 400) / 12
  });

  it('garantiza mínimo de 1 mes si deadline es pasada o muy próxima', () => {
    const now = new Date('2025-12-31');
    const proj = calcGoalDeadlineProjection(1000, 0, '2025-12-31', now);
    expect(proj.months).toBe(1);
    expect(proj.monthly).toBe(1000);
  });

  it('trata currentAmount mayor que targetAmount como 0 restante', () => {
    const now = new Date('2025-01-01');
    const proj = calcGoalDeadlineProjection(1000, 1500, '2026-01-01', now);
    expect(proj.monthly).toBe(0);
  });

  it('trata currentAmount undefined/null como 0', () => {
    const now = new Date('2025-01-01');
    const proj = calcGoalDeadlineProjection(
      1200,
      undefined as unknown as number,
      '2026-01-01',
      now
    );
    expect(proj.monthly).toBe(100);
  });
});
