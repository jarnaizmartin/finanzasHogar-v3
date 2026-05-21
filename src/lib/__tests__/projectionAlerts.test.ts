import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getDefaultAlertWindow,
  daysBetween,
  calcNextDueDate,
  shouldAlertProjection,
  dateKey,
} from '../projectionAlerts';
import type { Projection } from '../../types';

const mkProj = (overrides: Partial<Projection> = {}): Projection =>
  ({
    id: 'p1',
    name: 'Test',
    type: 'expense',
    amount: 100,
    categoryId: 'cat-1',
    accountId: 'acc-1',
    frequency: 'monthly',
    startDate: '2024-01-10',
    endDate: null,
    recurringDay: 10,
    isRecurring: true,
    ...overrides,
  } as unknown as Projection);

// ─── getDefaultAlertWindow ───────────────────────────────────────────────────
describe('getDefaultAlertWindow', () => {
  it('returns expected windows per frequency', () => {
    expect(getDefaultAlertWindow('annual')).toBe(30);
    expect(getDefaultAlertWindow('biannual')).toBe(30);
    expect(getDefaultAlertWindow('quarterly')).toBe(15);
    expect(getDefaultAlertWindow('bimonthly')).toBe(15);
    expect(getDefaultAlertWindow('monthly')).toBe(7);
    expect(getDefaultAlertWindow('weekly')).toBe(2);
    expect(getDefaultAlertWindow('biweekly')).toBe(7);
    expect(getDefaultAlertWindow('once')).toBe(15);
  });

  it('falls back to 7 for unknown frequency', () => {
    expect(getDefaultAlertWindow('mystery')).toBe(7);
    expect(getDefaultAlertWindow('')).toBe(7);
  });
});

// ─── daysBetween ─────────────────────────────────────────────────────────────
describe('daysBetween', () => {
  it('returns positive when b is after a', () => {
    expect(daysBetween(new Date('2024-06-10'), new Date('2024-06-15'))).toBe(5);
  });

  it('returns negative when b is before a', () => {
    expect(daysBetween(new Date('2024-06-15'), new Date('2024-06-10'))).toBe(-5);
  });

  it('returns 0 for same day at midnight', () => {
    expect(
      daysBetween(new Date('2024-06-10'), new Date('2024-06-10'))
    ).toBe(0);
  });

  it('returns 0 for same calendar day at different hours', () => {
    expect(
      daysBetween(
        new Date('2024-06-10T08:00:00'),
        new Date('2024-06-10T23:30:00')
      )
    ).toBe(0);
  });

  it('crosses month boundaries correctly', () => {
    expect(
      daysBetween(new Date('2024-06-28'), new Date('2024-07-03'))
    ).toBe(5);
  });
});

// ─── dateKey ─────────────────────────────────────────────────────────────────
describe('dateKey', () => {
  it('formats with zero-padded month and day', () => {
    expect(dateKey(new Date(2024, 0, 5))).toBe('2024-01-05');
  });

  it('handles December and day 31', () => {
    expect(dateKey(new Date(2024, 11, 31))).toBe('2024-12-31');
  });
});

// ─── calcNextDueDate ─────────────────────────────────────────────────────────
describe('calcNextDueDate', () => {
  const NOW = new Date('2024-06-15T12:00:00');

  it('returns null when projection is paused (active=false)', () => {
    const proj = mkProj({ active: false } as Partial<Projection>);
    expect(calcNextDueDate(proj, NOW)).toBeNull();
  });

  it('returns null when startDate is invalid', () => {
    const proj = mkProj({ startDate: 'not-a-date' });
    expect(calcNextDueDate(proj, NOW)).toBeNull();
  });

  it('returns null when endDate has passed', () => {
    const proj = mkProj({ endDate: '2024-05-01' });
    expect(calcNextDueDate(proj, NOW)).toBeNull();
  });

  it('returns null for unknown frequency', () => {
    const proj = mkProj({ frequency: 'mystery' as Projection['frequency'] });
    expect(calcNextDueDate(proj, NOW)).toBeNull();
  });

  // ── once ──
  it("returns startDate for 'once' when still in the future", () => {
    const proj = mkProj({
      frequency: 'once',
      startDate: '2024-08-10',
    });
    const r = calcNextDueDate(proj, NOW);
    expect(r).not.toBeNull();
    expect(dateKey(r!)).toBe('2024-08-10');
  });

  it("returns null for 'once' already in the past", () => {
    const proj = mkProj({
      frequency: 'once',
      startDate: '2024-01-10',
    });
    expect(calcNextDueDate(proj, NOW)).toBeNull();
  });

  // ── weekly / biweekly ──
  it('advances weekly until reaching today or future', () => {
    const proj = mkProj({
      frequency: 'weekly' as Projection['frequency'],
      startDate: '2024-06-01',
    });
    const r = calcNextDueDate(proj, NOW);
    expect(r).not.toBeNull();
    // 2024-06-01 + 7d = 06-08, +7 = 06-15 (== now). 06-15 no es < now → para.
    expect(dateKey(r!)).toBe('2024-06-15');
  });

  it('advances biweekly correctly', () => {
    const proj = mkProj({
      frequency: 'biweekly' as Projection['frequency'],
      startDate: '2024-06-01',
    });
    const r = calcNextDueDate(proj, NOW);
    // 06-01 + 14d = 06-15
    expect(dateKey(r!)).toBe('2024-06-15');
  });

  it('returns null if weekly next exceeds endDate', () => {
    const proj = mkProj({
      frequency: 'weekly' as Projection['frequency'],
      startDate: '2024-06-01',
      endDate: '2024-06-10', // antes del próximo ciclo válido
    });
    expect(calcNextDueDate(proj, NOW)).toBeNull();
  });

  // ── monthly y múltiplos ──
  it('returns this month for monthly when chargeDay is still ahead', () => {
    // hoy=15, day=20 → próximo = 2024-06-20
    const proj = mkProj({ recurringDay: 20 });
    const r = calcNextDueDate(proj, NOW);
    expect(dateKey(r!)).toBe('2024-06-20');
  });

  it('returns next month for monthly when chargeDay already passed', () => {
    // hoy=15, day=5 → próximo = 2024-07-05
    const proj = mkProj({ recurringDay: 5 });
    const r = calcNextDueDate(proj, NOW);
    expect(dateKey(r!)).toBe('2024-07-05');
  });

  it('returns today when chargeDay equals today', () => {
    const proj = mkProj({ recurringDay: 15 });
    const r = calcNextDueDate(proj, NOW);
    expect(dateKey(r!)).toBe('2024-06-15');
  });

  it('falls back to startDate day when recurringDay is missing', () => {
    const proj = mkProj({
      recurringDay: undefined,
      startDate: '2024-01-22',
    });
    const r = calcNextDueDate(proj, NOW);
    expect(dateKey(r!)).toBe('2024-06-22');
  });

  it('handles quarterly correctly', () => {
    // start=2024-01-10, step=3 → ene, abr, jul. hoy=15-jun → próximo=jul-10
    const proj = mkProj({
      frequency: 'quarterly',
      startDate: '2024-01-10',
      recurringDay: 10,
    });
    const r = calcNextDueDate(proj, NOW);
    expect(dateKey(r!)).toBe('2024-07-10');
  });

  it('handles annual correctly', () => {
    const proj = mkProj({
      frequency: 'annual',
      startDate: '2024-03-10',
      recurringDay: 10,
    });
    const r = calcNextDueDate(proj, NOW);
    expect(dateKey(r!)).toBe('2025-03-10');
  });

  it('saturates day 31 to last day of February', () => {
    // start=2024-01-31, monthly, hoy=15-jun → próximo=30-jun (no existe 31)
    const proj = mkProj({
      frequency: 'monthly',
      startDate: '2024-01-31',
      recurringDay: 31,
    });
    const r = calcNextDueDate(proj, NOW);
    expect(dateKey(r!)).toBe('2024-06-30');
  });

  it('returns null when monthly candidate exceeds endDate', () => {
    const proj = mkProj({
      frequency: 'monthly',
      startDate: '2024-01-10',
      recurringDay: 10,
      endDate: '2024-05-15',
    });
    expect(calcNextDueDate(proj, NOW)).toBeNull();
  });

  it('rolls month over year boundary', () => {
    // annual desde 2023-12-10 → próximo 2024-12-10
    const proj = mkProj({
      frequency: 'annual',
      startDate: '2023-12-10',
      recurringDay: 10,
    });
    const r = calcNextDueDate(proj, NOW);
    expect(dateKey(r!)).toBe('2024-12-10');
  });
});

// ─── shouldAlertProjection ──────────────────────────────────────────────────
describe('shouldAlertProjection', () => {
  const NOW = new Date('2024-06-15T12:00:00');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty when alertDisabled is true', () => {
    const proj = mkProj({ alertDisabled: true } as Partial<Projection>);
    const r = shouldAlertProjection(proj, NOW);
    expect(r.shouldAlert).toBe(false);
    expect(r.nextDueDate).toBeNull();
  });

  it('returns empty when alertSnoozeUntil is in the future', () => {
    const proj = mkProj({
      alertSnoozeUntil: NOW.getTime() + 1_000_000,
    } as Partial<Projection>);
    const r = shouldAlertProjection(proj, NOW);
    expect(r.shouldAlert).toBe(false);
  });

  it('proceeds when alertSnoozeUntil is in the past', () => {
    const proj = mkProj({
      recurringDay: 20,
      alertSnoozeUntil: NOW.getTime() - 1_000_000,
    } as Partial<Projection>);
    const r = shouldAlertProjection(proj, NOW);
    expect(r.shouldAlert).toBe(true);
  });

  it('returns empty when there is no next due date (paused)', () => {
    const proj = mkProj({ active: false } as Partial<Projection>);
    const r = shouldAlertProjection(proj, NOW);
    expect(r.shouldAlert).toBe(false);
    expect(r.nextDueDate).toBeNull();
  });

  it('does not alert when due date is beyond windowDays', () => {
    // monthly, window=7, próximo=06-30 (15 días) → no alerta
    const proj = mkProj({ recurringDay: 30 });
    const r = shouldAlertProjection(proj, NOW);
    expect(r.shouldAlert).toBe(false);
    expect(r.daysUntil).toBe(15);
    expect(r.nextDueDate).not.toBeNull();
  });

  it('alerts with warning when expense is due within 7 days', () => {
    // próximo = 06-20 → 5 días, expense, ≤7 → warning
    const proj = mkProj({ type: 'expense', recurringDay: 20 });
    const r = shouldAlertProjection(proj, NOW);
    expect(r.shouldAlert).toBe(true);
    expect(r.daysUntil).toBe(5);
    expect(r.severity).toBe('warning');
  });

  it('alerts with warning when transfer is due within 7 days', () => {
    const proj = mkProj({
      type: 'transfer' as Projection['type'],
      recurringDay: 20,
    });
    const r = shouldAlertProjection(proj, NOW);
    expect(r.severity).toBe('warning');
  });

  it('alerts with info when income is due within 7 days', () => {
    const proj = mkProj({ type: 'income', recurringDay: 20 });
    const r = shouldAlertProjection(proj, NOW);
    expect(r.shouldAlert).toBe(true);
    expect(r.severity).toBe('info');
  });

  it('alerts with info when expense is due beyond 7 days but within window', () => {
    // quarterly window=15, próximo=07-10 → 25 días → fuera de ventana
    // Mejor: usar bimonthly window=15 con due a 10 días → info
    const proj = mkProj({
      frequency: 'bimonthly',
      startDate: '2024-04-25', // bimonthly: abr, jun → 06-25
      recurringDay: 25,
      type: 'expense',
    });
    const r = shouldAlertProjection(proj, NOW);
    expect(r.shouldAlert).toBe(true);
    expect(r.daysUntil).toBe(10);
    expect(r.severity).toBe('info'); // >7
  });

  it('respects custom alertWindowDays from projection', () => {
    // monthly default=7, próximo=06-25 (10 días) → con custom=15 sí alerta
    const proj = mkProj({
      recurringDay: 25,
      alertWindowDays: 15,
    } as Partial<Projection>);
    const r = shouldAlertProjection(proj, NOW);
    expect(r.shouldAlert).toBe(true);
    expect(r.windowDays).toBe(15);
  });

  it('does not alert when due date is today + 0 days (alerts) but daysUntil < 0 means past', () => {
    // Sanity: due hoy mismo → daysUntil=0 → alerta warning si expense
    const proj = mkProj({ recurringDay: 15, type: 'expense' });
    const r = shouldAlertProjection(proj, NOW);
    expect(r.shouldAlert).toBe(true);
    expect(r.daysUntil).toBe(0);
    expect(r.severity).toBe('warning');
  });
});
