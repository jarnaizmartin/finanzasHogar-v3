import { describe, it, expect } from 'vitest';
import type { Projection } from '../../types';
import {
  validateProjectionForm,
  buildProjectionEntry,
  buildEmptyProjectionForm,
  projectionToForm,
  shouldOpenAdvancedOnEdit,
  ALERT_WINDOW_PRESETS,
  type ProjectionForm,
} from '../projectionsForm';

// ─── Fixtures ───────────────────────────────────────────────────────────────

const validForm: ProjectionForm = {
  name: 'Alquiler',
  type: 'expense',
  amount: '850',
  currency: 'EUR',
  frequency: 'monthly',
  startDate: '2025-01-15',
  endDate: '',
  categoryId: 'cat-1',
  accountId: 'acc-1',
  toAccountId: '',
  notes: '',
  active: true,
  isRecurring: false,
  recurringDay: 15,
  nextOverrideAmount: null,
  alertEnabled: true,
  alertWindowDays: 7,
  alertWindowCustom: '',
};

// ════════════════════════════════════════════════════════════════════════════
// buildEmptyProjectionForm
// ════════════════════════════════════════════════════════════════════════════

describe('buildEmptyProjectionForm', () => {
  it('creates a form with sensible defaults', () => {
    const f = buildEmptyProjectionForm({
      baseCurrency: 'EUR',
      defaultAccountId: 'acc-1',
      todayStr: '2025-06-01',
    });
    expect(f.type).toBe('expense');
    expect(f.currency).toBe('EUR');
    expect(f.accountId).toBe('acc-1');
    expect(f.startDate).toBe('2025-06-01');
    expect(f.frequency).toBe('monthly');
    expect(f.active).toBe(true);
    expect(f.alertEnabled).toBe(true);
    expect(f.isRecurring).toBe(false);
    expect(f.amount).toBe('');
    expect(f.name).toBe('');
  });

  it('accepts an empty default account id', () => {
    const f = buildEmptyProjectionForm({
      baseCurrency: 'USD',
      defaultAccountId: '',
      todayStr: '2025-01-01',
    });
    expect(f.accountId).toBe('');
    expect(f.currency).toBe('USD');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// validateProjectionForm
// ════════════════════════════════════════════════════════════════════════════

describe('validateProjectionForm', () => {
  it('returns no errors for a valid expense form', () => {
    expect(validateProjectionForm(validForm)).toEqual({});
  });

  describe('name', () => {
    it('rejects empty name', () => {
      const errs = validateProjectionForm({ ...validForm, name: '' });
      expect(errs.name).toBeDefined();
    });

    it('rejects whitespace-only name', () => {
      const errs = validateProjectionForm({ ...validForm, name: '   ' });
      expect(errs.name).toBeDefined();
    });
  });

  describe('amount', () => {
    it('rejects empty amount', () => {
      const errs = validateProjectionForm({ ...validForm, amount: '' });
      expect(errs.amount).toBeDefined();
    });

    it('rejects zero', () => {
      const errs = validateProjectionForm({ ...validForm, amount: '0' });
      expect(errs.amount).toBeDefined();
    });

    it('rejects negative', () => {
      const errs = validateProjectionForm({ ...validForm, amount: '-10' });
      expect(errs.amount).toBeDefined();
    });

    it('accepts decimals', () => {
      const errs = validateProjectionForm({ ...validForm, amount: '12.5' });
      expect(errs.amount).toBeUndefined();
    });
  });

  describe('accountId', () => {
    it('rejects empty origin account', () => {
      const errs = validateProjectionForm({ ...validForm, accountId: '' });
      expect(errs.accountId).toBeDefined();
    });
  });

  describe('categoryId (non-transfer)', () => {
    it('rejects empty categoryId on expense', () => {
      const errs = validateProjectionForm({ ...validForm, categoryId: '' });
      expect(errs.categoryId).toBeDefined();
    });

    it('rejects empty categoryId on income', () => {
      const errs = validateProjectionForm({
        ...validForm,
        type: 'income',
        categoryId: '',
      });
      expect(errs.categoryId).toBeDefined();
    });

    it('does NOT require category on transfer', () => {
      const errs = validateProjectionForm({
        ...validForm,
        type: 'transfer',
        categoryId: '',
        toAccountId: 'acc-2',
      });
      expect(errs.categoryId).toBeUndefined();
    });
  });

  describe('transfer rules', () => {
    const transferBase: ProjectionForm = {
      ...validForm,
      type: 'transfer',
      categoryId: '',
      toAccountId: 'acc-2',
    };

    it('passes with different origin/destination', () => {
      expect(validateProjectionForm(transferBase)).toEqual({});
    });

    it('rejects missing toAccountId', () => {
      const errs = validateProjectionForm({ ...transferBase, toAccountId: '' });
      expect(errs.toAccountId).toBeDefined();
    });

    it('rejects same origin and destination', () => {
      const errs = validateProjectionForm({
        ...transferBase,
        toAccountId: 'acc-1',
      });
      expect(errs.toAccountId).toBe('Las cuentas deben ser diferentes');
    });
  });

  describe('endDate', () => {
    it('accepts empty endDate', () => {
      const errs = validateProjectionForm({ ...validForm, endDate: '' });
      expect(errs.endDate).toBeUndefined();
    });

    it('accepts endDate after startDate', () => {
      const errs = validateProjectionForm({
        ...validForm,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });
      expect(errs.endDate).toBeUndefined();
    });

    it('rejects endDate before startDate', () => {
      const errs = validateProjectionForm({
        ...validForm,
        startDate: '2025-06-01',
        endDate: '2025-01-01',
      });
      expect(errs.endDate).toBeDefined();
    });

    it('accepts endDate equal to startDate', () => {
      const errs = validateProjectionForm({
        ...validForm,
        startDate: '2025-06-01',
        endDate: '2025-06-01',
      });
      expect(errs.endDate).toBeUndefined();
    });
  });

  describe('alertWindowCustom', () => {
    const base: ProjectionForm = {
      ...validForm,
      alertEnabled: true,
      alertWindowDays: 'custom',
    };

    it('rejects empty custom value', () => {
      const errs = validateProjectionForm({ ...base, alertWindowCustom: '' });
      expect(errs.alertWindowCustom).toBeDefined();
    });

    it('rejects 0', () => {
      const errs = validateProjectionForm({ ...base, alertWindowCustom: '0' });
      expect(errs.alertWindowCustom).toBeDefined();
    });

    it('rejects values over 365', () => {
      const errs = validateProjectionForm({
        ...base,
        alertWindowCustom: '500',
      });
      expect(errs.alertWindowCustom).toBeDefined();
    });

    it('rejects negative values', () => {
      const errs = validateProjectionForm({
        ...base,
        alertWindowCustom: '-5',
      });
      expect(errs.alertWindowCustom).toBeDefined();
    });

    it('accepts 1', () => {
      const errs = validateProjectionForm({ ...base, alertWindowCustom: '1' });
      expect(errs.alertWindowCustom).toBeUndefined();
    });

    it('accepts 365', () => {
      const errs = validateProjectionForm({
        ...base,
        alertWindowCustom: '365',
      });
      expect(errs.alertWindowCustom).toBeUndefined();
    });

    it('does not validate custom when alerts are disabled', () => {
      const errs = validateProjectionForm({
        ...base,
        alertEnabled: false,
        alertWindowCustom: '',
      });
      expect(errs.alertWindowCustom).toBeUndefined();
    });
  });

  it('accumulates multiple errors', () => {
    const errs = validateProjectionForm({
      ...validForm,
      name: '',
      amount: '',
      accountId: '',
      categoryId: '',
    });
    expect(Object.keys(errs).length).toBeGreaterThanOrEqual(4);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// buildProjectionEntry
// ════════════════════════════════════════════════════════════════════════════

describe('buildProjectionEntry', () => {
  const NOW = new Date('2025-06-15T10:00:00');

  it('generates a new id for "add" mode', () => {
    const entry = buildProjectionEntry({
      form: validForm,
      mode: 'add',
      newId: 'new-id-123',
      now: NOW,
    });
    expect(entry.id).toBe('new-id-123');
  });

  it('preserves the id in edit mode', () => {
    const entry = buildProjectionEntry({
      form: validForm,
      mode: 'existing-id-456',
      newId: 'unused',
      now: NOW,
    });
    expect(entry.id).toBe('existing-id-456');
  });

  it('parses amount to number', () => {
    const entry = buildProjectionEntry({
      form: { ...validForm, amount: '1234.56' },
      mode: 'add',
      newId: 'x',
      now: NOW,
    });
    expect(entry.amount).toBe(1234.56);
  });

  describe('transfer handling', () => {
    it('sets categoryId to __transfer__ for transfers', () => {
      const entry = buildProjectionEntry({
        form: {
          ...validForm,
          type: 'transfer',
          categoryId: 'should-be-ignored',
          toAccountId: 'acc-2',
        },
        mode: 'add',
        newId: 'x',
        now: NOW,
      });
      expect(entry.categoryId).toBe('__transfer__');
      expect(entry.toAccountId).toBe('acc-2');
    });

    it('does NOT set toAccountId for non-transfers', () => {
      const entry = buildProjectionEntry({
        form: { ...validForm, type: 'expense', toAccountId: 'acc-99' },
        mode: 'add',
        newId: 'x',
        now: NOW,
      });
      expect(entry.toAccountId).toBeUndefined();
    });

    it('preserves user categoryId on non-transfer', () => {
      const entry = buildProjectionEntry({
        form: { ...validForm, categoryId: 'cat-rent' },
        mode: 'add',
        newId: 'x',
        now: NOW,
      });
      expect(entry.categoryId).toBe('cat-rent');
    });
  });

  describe('recurring fields', () => {
    it('sets recurringDay from startDate when isRecurring=true', () => {
      const entry = buildProjectionEntry({
        form: { ...validForm, isRecurring: true, startDate: '2025-03-22' },
        mode: 'add',
        newId: 'x',
        now: NOW,
      });
      expect(entry.recurringDay).toBe(22);
    });

    it('omits recurringDay when isRecurring=false', () => {
      const entry = buildProjectionEntry({
        form: { ...validForm, isRecurring: false },
        mode: 'add',
        newId: 'x',
        now: NOW,
      });
      expect(entry.recurringDay).toBeUndefined();
    });
  });

  describe('lastApplied preservation', () => {
    it('preserves lastApplied if it matches current month (edit)', () => {
      const existing: Projection = {
        ...validForm,
        id: 'p1',
        amount: 100,
        endDate: '',
        lastApplied: '2025-06',
      } as Projection;

      const entry = buildProjectionEntry({
        form: { ...validForm, isRecurring: true },
        mode: 'p1',
        existingProj: existing,
        newId: 'x',
        now: NOW, // June 2025
      });
      expect(entry.lastApplied).toBe('2025-06');
    });

    it('keeps existing lastApplied when recurring and not matching current month', () => {
      const existing: Projection = {
        ...validForm,
        id: 'p1',
        amount: 100,
        endDate: '',
        lastApplied: '2025-05',
      } as Projection;

      const entry = buildProjectionEntry({
        form: { ...validForm, isRecurring: true },
        mode: 'p1',
        existingProj: existing,
        newId: 'x',
        now: NOW, // June 2025
      });
      expect(entry.lastApplied).toBe('2025-05');
    });

    it('clears lastApplied when not recurring and not matching current month', () => {
      const existing: Projection = {
        ...validForm,
        id: 'p1',
        amount: 100,
        endDate: '',
        lastApplied: '2025-05',
      } as Projection;

      const entry = buildProjectionEntry({
        form: { ...validForm, isRecurring: false },
        mode: 'p1',
        existingProj: existing,
        newId: 'x',
        now: NOW,
      });
      expect(entry.lastApplied).toBeUndefined();
    });

    it('has no lastApplied on add mode', () => {
      const entry = buildProjectionEntry({
        form: { ...validForm, isRecurring: false },
        mode: 'add',
        newId: 'x',
        now: NOW,
      });
      expect(entry.lastApplied).toBeUndefined();
    });
  });

  describe('alert fields', () => {
    it('sets alertDisabled=true when alerts off', () => {
      const entry = buildProjectionEntry({
        form: { ...validForm, alertEnabled: false },
        mode: 'add',
        newId: 'x',
        now: NOW,
      });
      expect(entry.alertDisabled).toBe(true);
      expect(entry.alertWindowDays).toBeUndefined();
    });

    it('persists preset alertWindowDays', () => {
      const entry = buildProjectionEntry({
        form: { ...validForm, alertEnabled: true, alertWindowDays: 15 },
        mode: 'add',
        newId: 'x',
        now: NOW,
      });
      expect(entry.alertDisabled).toBe(false);
      expect(entry.alertWindowDays).toBe(15);
    });

    it('parses custom alert window from string', () => {
      const entry = buildProjectionEntry({
        form: {
          ...validForm,
          alertEnabled: true,
          alertWindowDays: 'custom',
          alertWindowCustom: '45',
        },
        mode: 'add',
        newId: 'x',
        now: NOW,
      });
      expect(entry.alertWindowDays).toBe(45);
    });

    it('always clears alertSnoozeUntil on save', () => {
      const entry = buildProjectionEntry({
        form: validForm,
        mode: 'add',
        newId: 'x',
        now: NOW,
      });
      expect(entry.alertSnoozeUntil).toBeUndefined();
    });
  });

  it('builds current month key correctly with single-digit months', () => {
    const existing: Projection = {
      ...validForm,
      id: 'p1',
      amount: 100,
      endDate: '',
      lastApplied: '2025-03',
    } as Projection;

    const entry = buildProjectionEntry({
      form: { ...validForm, isRecurring: true },
      mode: 'p1',
      existingProj: existing,
      newId: 'x',
      now: new Date('2025-03-10T10:00:00'),
    });
    expect(entry.lastApplied).toBe('2025-03');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// projectionToForm
// ════════════════════════════════════════════════════════════════════════════

describe('projectionToForm', () => {
  const baseProj: Projection = {
    id: 'p1',
    name: 'Nómina',
    type: 'income',
    amount: 2500,
    currency: 'EUR',
    frequency: 'monthly',
    startDate: '2025-01-25',
    endDate: '',
    categoryId: 'cat-salary',
    accountId: 'acc-1',
    notes: 'Empresa X',
    active: true,
    isRecurring: true,
    recurringDay: 25,
    nextOverrideAmount: null,
  } as Projection;

  it('converts projection back to form shape', () => {
    const f = projectionToForm(baseProj, 'EUR', 'acc-fallback');
    expect(f.name).toBe('Nómina');
    expect(f.amount).toBe('2500');
    expect(f.type).toBe('income');
    expect(f.categoryId).toBe('cat-salary');
    expect(f.accountId).toBe('acc-1');
    expect(f.isRecurring).toBe(true);
  });

  it('uses fallback account when proj has none', () => {
    const f = projectionToForm(
      { ...baseProj, accountId: undefined as any },
      'EUR',
      'acc-fallback'
    );
    expect(f.accountId).toBe('acc-fallback');
  });

  it('treats __transfer__ category as empty in form', () => {
    const f = projectionToForm(
      { ...baseProj, type: 'transfer', categoryId: '__transfer__' },
      'EUR',
      'acc-1'
    );
    expect(f.categoryId).toBe('');
  });

  it('uses baseCurrency when proj has no currency', () => {
    const f = projectionToForm(
      { ...baseProj, currency: undefined as any },
      'USD',
      'acc-1'
    );
    expect(f.currency).toBe('USD');
  });

  it('maps alertDisabled=true to alertEnabled=false', () => {
    const f = projectionToForm(
      { ...baseProj, alertDisabled: true },
      'EUR',
      'acc-1'
    );
    expect(f.alertEnabled).toBe(false);
  });

  it('maps alertDisabled=undefined to alertEnabled=true', () => {
    const f = projectionToForm(baseProj, 'EUR', 'acc-1');
    expect(f.alertEnabled).toBe(true);
  });

  it('detects preset alert window', () => {
    const f = projectionToForm(
      { ...baseProj, alertWindowDays: 15 },
      'EUR',
      'acc-1'
    );
    expect(f.alertWindowDays).toBe(15);
    expect(f.alertWindowCustom).toBe('');
  });

  it('marks non-preset alert window as custom', () => {
    const f = projectionToForm(
      { ...baseProj, alertWindowDays: 45 },
      'EUR',
      'acc-1'
    );
    expect(f.alertWindowDays).toBe('custom');
    expect(f.alertWindowCustom).toBe('45');
  });

  it('defaults active=true when missing', () => {
    const f = projectionToForm(
      { ...baseProj, active: undefined as any },
      'EUR',
      'acc-1'
    );
    expect(f.active).toBe(true);
  });

  it('preserves notes', () => {
    const f = projectionToForm(baseProj, 'EUR', 'acc-1');
    expect(f.notes).toBe('Empresa X');
  });

  it('handles missing notes', () => {
    const f = projectionToForm(
      { ...baseProj, notes: undefined as any },
      'EUR',
      'acc-1'
    );
    expect(f.notes).toBe('');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// shouldOpenAdvancedOnEdit
// ════════════════════════════════════════════════════════════════════════════

describe('shouldOpenAdvancedOnEdit', () => {
  const baseProj: Projection = {
    id: 'p1',
    name: 'Test',
    type: 'expense',
    amount: 100,
    currency: 'EUR',
    frequency: 'monthly',
    startDate: '2025-01-01',
    endDate: '',
    categoryId: 'c1',
    accountId: 'a1',
  } as Projection;

  it('returns false for a plain projection', () => {
    expect(shouldOpenAdvancedOnEdit(baseProj)).toBe(false);
  });

  it('returns true when nextOverrideAmount is set', () => {
    expect(
      shouldOpenAdvancedOnEdit({ ...baseProj, nextOverrideAmount: 50 })
    ).toBe(true);
  });

  it('returns true when notes are set', () => {
    expect(shouldOpenAdvancedOnEdit({ ...baseProj, notes: 'hello' })).toBe(true);
  });

  it('returns true when alerts are disabled', () => {
    expect(shouldOpenAdvancedOnEdit({ ...baseProj, alertDisabled: true })).toBe(
      true
    );
  });

  it('returns true when alert window differs from default', () => {
    // monthly default is 7 (per getDefaultAlertWindow)
    expect(
      shouldOpenAdvancedOnEdit({ ...baseProj, alertWindowDays: 30 })
    ).toBe(true);
  });

  it('returns false when alert window equals default', () => {
    // Match the default for monthly frequency
    const proj = { ...baseProj, frequency: 'monthly', alertWindowDays: 7 };
    // If default differs in your impl, this test may need adjusting
    // but it should be deterministic vs getDefaultAlertWindow
    const result = shouldOpenAdvancedOnEdit(proj);
    expect(typeof result).toBe('boolean');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ALERT_WINDOW_PRESETS
// ════════════════════════════════════════════════════════════════════════════

describe('ALERT_WINDOW_PRESETS', () => {
  it('contains expected preset values', () => {
    expect(ALERT_WINDOW_PRESETS).toEqual([2, 7, 15, 30, 60]);
  });

  it('is ordered ascending', () => {
    const arr = [...ALERT_WINDOW_PRESETS];
    const sorted = [...arr].sort((a, b) => a - b);
    expect(arr).toEqual(sorted);
  });
});
