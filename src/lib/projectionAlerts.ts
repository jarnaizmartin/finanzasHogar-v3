// ─── projectionAlerts.ts ──────────────────────────────────────────────────────
// ✨ F2.10 — Lógica pura para alertas de vencimiento de proyecciones.
//
// Funciones:
//   • getDefaultAlertWindow(frequency) → días default según la frecuencia.
//   • calcNextDueDate(projection, fromDate) → próxima fecha de vencimiento.
//   • daysBetween(a, b) → días enteros entre dos fechas (b - a).
//   • shouldAlertProjection(projection, now) → decide si toca avisar y
//     devuelve la metadata necesaria para construir la alerta.
//
// Sin dependencias de React. Todo determinístico.
// ─────────────────────────────────────────────────────────────────────────────

import type { Projection } from '../types';

// ─── Ventanas de aviso por frecuencia (en días) ──────────────────────────────
// Si una proyección no tiene `alertWindowDays` propio, se usa este default.
const DEFAULT_ALERT_WINDOW_DAYS: Record<string, number> = {
  annual: 30,
  biannual: 30, // semestral
  quarterly: 15,
  bimonthly: 15,
  monthly: 7,
  // Reservados para frecuencias que el form aún no expone pero el tipo permite:
  semiannual: 30, // alias defensivo
  weekly: 2,
  biweekly: 7,
  once: 15,
};

const FALLBACK_WINDOW_DAYS = 7;

export function getDefaultAlertWindow(frequency: string): number {
  return DEFAULT_ALERT_WINDOW_DAYS[frequency] ?? FALLBACK_WINDOW_DAYS;
}

// ─── Helpers de fechas (sin libs externas) ───────────────────────────────────

/** Devuelve una nueva fecha a las 00:00:00 (medianoche local). */
function atMidnight(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

/** Días enteros entre `a` y `b` (b - a). Positivo si b es posterior. */
export function daysBetween(a: Date, b: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const am = atMidnight(a).getTime();
  const bm = atMidnight(b).getTime();
  return Math.round((bm - am) / MS_PER_DAY);
}

/** Construye una fecha YYYY-MM-DD a partir de año, mes (0-11) y día,
 *  saturando el día al último del mes si excede (ej.: 31 en febrero → 28/29). */
function dateOnDay(year: number, month: number, day: number): Date {
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const safeDay = Math.min(day, lastDayOfMonth);
  return new Date(year, month, safeDay);
}

// ─── Cálculo de próximo vencimiento ──────────────────────────────────────────
// Estrategia:
//  1. Tomamos `startDate` y vamos sumando `freq.months` hasta encontrar la
//     primera fecha ≥ now (o = now si toca hoy).
//  2. Si la proyección tiene `endDate` y la siguiente fecha la supera → null.
//  3. Para frecuencias semanales (no usadas hoy en el form pero soportadas),
//     sumamos 7 o 14 días.
//
// Devuelve null si:
//   - La proyección está pausada (active === false).
//   - La proyección ya terminó (now > endDate).
//   - Es de tipo 'once' y ya pasó la fecha.
//   - No reconocemos la frecuencia.

const MONTHS_BY_FREQ: Record<string, number> = {
  monthly: 1,
  bimonthly: 2,
  quarterly: 3,
  biannual: 6,
  semiannual: 6,
  annual: 12,
};

export function calcNextDueDate(
  projection: Projection,
  fromDate: Date = new Date()
): Date | null {
  // Pausada
  if ((projection as any).active === false) return null;

  const now = atMidnight(fromDate);

  const start = new Date(projection.startDate + 'T00:00:00');
  if (Number.isNaN(start.getTime())) return null;

  const end = projection.endDate
    ? new Date(projection.endDate + 'T00:00:00')
    : null;
  if (end && now > end) return null;

  // ── Caso 'once' (una vez): el vencimiento es startDate, sin repetición ──
  if (projection.frequency === 'once') {
    return start >= now ? start : null;
  }

  // ── Caso 'weekly' / 'biweekly' (no expuestos en el form, pero soportados) ──
  if (
    projection.frequency === 'weekly' ||
    projection.frequency === 'biweekly'
  ) {
    const stepDays = projection.frequency === 'weekly' ? 7 : 14;
    const next = new Date(start);
    while (next < now) {
      next.setDate(next.getDate() + stepDays);
    }
    if (end && next > end) return null;
    return next;
  }

  // ── Caso mensual y múltiplos ──
  const stepMonths = MONTHS_BY_FREQ[projection.frequency];
  if (!stepMonths) return null;

  const dayOfMonth = projection.recurringDay ?? start.getDate();

  // Empezamos por el mes/año de start y avanzamos en saltos de stepMonths
  // hasta que dateOnDay() sea >= hoy.
  let y = start.getFullYear();
  let m = start.getMonth();
  let candidate = dateOnDay(y, m, dayOfMonth);

  // Si el primer candidato ya es >= hoy, ese es el próximo vencimiento
  // (incluye el caso "hoy mismo" si chargeDay === today).
  while (candidate < now) {
    m += stepMonths;
    while (m > 11) {
      m -= 12;
      y += 1;
    }
    candidate = dateOnDay(y, m, dayOfMonth);
    // Salida de seguridad: si por cualquier motivo nos pasamos del end, fuera
    if (end && candidate > end) return null;
  }

  if (end && candidate > end) return null;
  return candidate;
}

// ─── Decisión final: ¿toca avisar? ───────────────────────────────────────────

export type ProjectionAlertInfo = {
  shouldAlert: boolean;
  /** Próxima fecha de vencimiento (null si no aplica). */
  nextDueDate: Date | null;
  /** Días desde hoy hasta el vencimiento (negativo si ya pasó). */
  daysUntil: number | null;
  /** Ventana efectiva usada (custom de la proyección o default). */
  windowDays: number;
  /** Severidad recomendada para la alerta resultante. */
  severity: 'warning' | 'info';
};

/**
 * Decide si una proyección debe generar alerta de vencimiento próximo.
 *
 * Reglas:
 *   - Si la proyección tiene `alertDisabled` → nunca avisa.
 *   - Si está dentro del periodo `alertSnoozeUntil` → no avisa (snooze).
 *   - Si no hay próxima fecha de vencimiento → no avisa.
 *   - Si daysUntil < 0 (ya venció) → no avisa.
 *   - Si daysUntil > windowDays → no avisa todavía.
 *   - Severidad:
 *       · 'warning' si daysUntil ≤ 7 Y la proyección es 'expense' o 'transfer'
 *       · 'info' en el resto (incluye ingresos siempre, gastos lejanos)
 */
export function shouldAlertProjection(
  projection: Projection,
  now: Date = new Date()
): ProjectionAlertInfo {
  const empty: ProjectionAlertInfo = {
    shouldAlert: false,
    nextDueDate: null,
    daysUntil: null,
    windowDays: getDefaultAlertWindow(projection.frequency),
    severity: 'info',
  };

  if (projection.alertDisabled) return empty;
  if (
    projection.alertSnoozeUntil &&
    now.getTime() < projection.alertSnoozeUntil
  ) {
    return empty;
  }

  const nextDueDate = calcNextDueDate(projection, now);
  if (!nextDueDate) return empty;

  const daysUntil = daysBetween(now, nextDueDate);
  if (daysUntil < 0) return empty;

  const windowDays =
    projection.alertWindowDays ?? getDefaultAlertWindow(projection.frequency);

  if (daysUntil > windowDays) {
    return { ...empty, nextDueDate, daysUntil, windowDays };
  }

  // Severidad: warning solo si es gasto/transfer Y vence pronto (≤7 días).
  const isOutflow =
    projection.type === 'expense' || projection.type === 'transfer';
  const severity: 'warning' | 'info' =
    isOutflow && daysUntil <= 7 ? 'warning' : 'info';

  return {
    shouldAlert: true,
    nextDueDate,
    daysUntil,
    windowDays,
    severity,
  };
}

// ─── Utilidad: clave YYYY-MM-DD para IDs de alerta ───────────────────────────

/** Devuelve YYYY-MM-DD (zona horaria local) para usar en IDs idempotentes. */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
