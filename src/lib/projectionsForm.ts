/**
 * Pure form logic for Projections view.
 *
 * Extracted from src/views/Projections.tsx during Fase 1.1 refactor.
 * No React, no state, no DOM — only data in / data out, fully testable.
 */

import type { Projection } from '../types';
import { getDefaultAlertWindow } from './projectionAlerts';

// ─── Public types ───────────────────────────────────────────────────────────

export type ProjectionForm = {
  name: string;
  type: 'income' | 'expense' | 'transfer';
  amount: string;
  currency: string;
  frequency: string;
  startDate: string;
  endDate: string;
  categoryId: string;
  accountId: string;
  toAccountId: string;
  notes: string;
  active: boolean;
  isRecurring: boolean;
  recurringDay: number;
  nextOverrideAmount: number | null;
  alertEnabled: boolean;
  alertWindowDays: number | 'custom';
  alertWindowCustom: string;
};

export type ProjectionFormErrors = Partial<Record<keyof ProjectionForm, string>>;

export const ALERT_WINDOW_PRESETS = [2, 7, 15, 30, 60] as const;

// ─── Default form factory ───────────────────────────────────────────────────

export function buildEmptyProjectionForm(args: {
  baseCurrency: string;
  defaultAccountId: string;
  todayStr: string;
}): ProjectionForm {
  const now = new Date();
  return {
    name: '',
    type: 'expense',
    amount: '',
    currency: args.baseCurrency,
    frequency: 'monthly',
    startDate: args.todayStr,
    endDate: '',
    categoryId: '',
    accountId: args.defaultAccountId,
    toAccountId: '',
    notes: '',
    active: true,
    isRecurring: false,
    recurringDay: now.getDate(),
    nextOverrideAmount: null,
    alertEnabled: true,
    alertWindowDays: getDefaultAlertWindow('monthly'),
    alertWindowCustom: '',
  };
}

// ─── Validation ─────────────────────────────────────────────────────────────

export function validateProjectionForm(form: ProjectionForm): ProjectionFormErrors {
  const e: ProjectionFormErrors = {};

  if (!form.name.trim()) {
    e.name = 'El nombre es obligatorio';
  }

  if (!form.amount || Number(form.amount) <= 0) {
    e.amount = 'Introduce un importe válido';
  }

  if (!form.accountId) {
    e.accountId = 'Selecciona una cuenta origen';
  }

  if (form.type === 'transfer') {
    if (!form.toAccountId) {
      e.toAccountId = 'Selecciona una cuenta destino';
    } else if (form.toAccountId === form.accountId) {
      e.toAccountId = 'Las cuentas deben ser diferentes';
    }
  } else {
    if (!form.categoryId) {
      e.categoryId = 'Selecciona una categoría';
    }
  }

  if (form.endDate && form.endDate < form.startDate) {
    e.endDate = 'La fecha fin debe ser posterior al inicio';
  }

  if (form.alertEnabled && form.alertWindowDays === 'custom') {
    const n = parseInt(form.alertWindowCustom, 10);
    if (!n || n < 1 || n > 365) {
      e.alertWindowCustom = 'Introduce un número entre 1 y 365';
    }
  }

  return e;
}

// ─── Entry builder ──────────────────────────────────────────────────────────

export type BuildEntryArgs = {
  form: ProjectionForm;
  /** 'add' to create a new one, or the id of the projection being edited. */
  mode: 'add' | string;
  /** When editing, the existing projection (needed to preserve lastApplied). */
  existingProj?: Projection;
  /** Pre-generated id for new projections (kept as param for purity/testability). */
  newId: string;
  /** Current date — injected so tests are deterministic. */
  now: Date;
};

export function buildProjectionEntry(args: BuildEntryArgs): Projection {
  const { form, mode, existingProj, newId, now } = args;

  const currentMonthKey = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}`;

  const preserveLastApplied = existingProj?.lastApplied === currentMonthKey;

  const alertWindowFinal =
    form.alertWindowDays === 'custom'
      ? parseInt(form.alertWindowCustom, 10)
      : (form.alertWindowDays as number);

  const entry: Projection = {
    id: mode === 'add' ? newId : mode,
    name: form.name,
    type: form.type,
    amount: Number(form.amount),
    currency: form.currency,
    frequency: form.frequency,
    startDate: form.startDate,
    endDate: form.endDate,
    categoryId: form.type === 'transfer' ? '__transfer__' : form.categoryId,
    accountId: form.accountId,
    toAccountId: form.type === 'transfer' ? form.toAccountId : undefined,
    notes: form.notes,
    active: form.active,
    isRecurring: form.isRecurring ?? false,
    recurringDay: form.isRecurring
      ? new Date(form.startDate + 'T00:00:00').getDate()
      : undefined,
    nextOverrideAmount: form.nextOverrideAmount ?? null,
    lastApplied: preserveLastApplied
      ? currentMonthKey
      : form.isRecurring
      ? existingProj?.lastApplied ?? undefined
      : undefined,
    alertDisabled: !form.alertEnabled,
    alertWindowDays: form.alertEnabled ? alertWindowFinal : undefined,
    alertSnoozeUntil: undefined,
  } as Projection;

  return entry;
}

// ─── Helpers for opening edit form ──────────────────────────────────────────

/**
 * Builds a ProjectionForm from an existing Projection (for "Edit" mode).
 */
export function projectionToForm(
  proj: Projection,
  baseCurrency: string,
  fallbackAccountId: string
): ProjectionForm {
  const projWindow =
    proj.alertWindowDays ?? getDefaultAlertWindow(proj.frequency);
  const isPreset = (ALERT_WINDOW_PRESETS as readonly number[]).includes(
    projWindow
  );

  return {
    name: proj.name,
    type: proj.type,
    amount: proj.amount.toString(),
    currency: proj.currency ?? baseCurrency,
    frequency: proj.frequency,
    startDate: proj.startDate,
    endDate: proj.endDate ?? '',
    categoryId:
      proj.categoryId === '__transfer__' ? '' : proj.categoryId ?? '',
    accountId: proj.accountId ?? fallbackAccountId,
    toAccountId: proj.toAccountId ?? '',
    notes: proj.notes ?? '',
    active: proj.active ?? true,
    isRecurring: proj.isRecurring ?? false,
    recurringDay:
      proj.recurringDay ?? new Date(proj.startDate + 'T00:00:00').getDate(),
    nextOverrideAmount: proj.nextOverrideAmount ?? null,
    alertEnabled: !proj.alertDisabled,
    alertWindowDays: isPreset ? projWindow : 'custom',
    alertWindowCustom: isPreset ? '' : String(projWindow),
  };
}

/**
 * Decides whether the "Advanced options" section should auto-open when editing.
 */
export function shouldOpenAdvancedOnEdit(proj: Projection): boolean {
  const defaultWindow = getDefaultAlertWindow(proj.frequency);
  return !!(
    proj.nextOverrideAmount ||
    proj.notes ||
    proj.alertDisabled ||
    (proj.alertWindowDays && proj.alertWindowDays !== defaultWindow)
  );
}
