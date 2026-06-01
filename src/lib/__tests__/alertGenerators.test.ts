// src/lib/__tests__/alertGenerators.test.ts
import { describe, it, expect, vi } from 'vitest';
import { es } from '../../i18n/es';

// Mock i18next for this lib test — resolves keys against the ES dictionary
vi.mock('i18next', () => {
  const resolveKey = (key: string, options?: Record<string, unknown>): string => {
    const raw = key
      .split('.')
      .reduce((obj: unknown, k) => (obj as Record<string, unknown>)?.[k], es as unknown) as string ?? key;
    if (!options) return raw;
    return raw.replace(/\{\{(\w+)\}\}/g, (_, k) => String(options[k] ?? `{{${k}}}`));
  };
  const inst = {
    t: resolveKey,
    language: 'es',
    changeLanguage: vi.fn(),
    init: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    off: vi.fn(),
  } as Record<string, unknown>;
  inst.use = vi.fn().mockReturnValue(inst);
  return { default: inst };
});
import {
  generateBalanceCriticalAlerts,
  generateBalanceRiskAlerts,
  generateBudgetExceededAlerts,
  generateDuplicateProjectionAlerts,
  generateMonthNegativeAlert,
  generateGoalAlerts,
  generateCreditCardAlerts,
  generateProjectionDueAlerts,
  generateAllAlerts,
  type AlertContext,
} from '../alertGenerators';
import type {
  Account,
  Projection,
  Category,
  RealExpense,
  SavingsGoal,
  ForecastMonth,
} from '../../types';

// ─── Factories ───────────────────────────────────────────────────────────────
const mkAccount = (over: Partial<Account> = {}): Account => ({
  id: 'acc1',
  name: 'Cuenta principal',
  balance: 1000,
  currency: 'EUR',
  date: '2020-01-01',
  accountType: 'checking',
  ...over,
});

const mkProjection = (over: Partial<Projection> = {}): Projection => ({
  id: 'p1',
  name: 'Proyección',
  accountId: 'acc1',
  categoryId: 'cat1',
  type: 'expense',
  amount: 100,
  frequency: 'monthly',
  startDate: '2025-01-01',
  endDate: '',
  ...over,
});

const mkCategory = (over: Partial<Category> = {}): Category => ({
  id: 'cat1',
  name: 'Comida',
  ...over,
});

const mkReal = (over: Partial<RealExpense> = {}): RealExpense => ({
  id: 'r1',
  entryDate: '2025-06-10',
  valueDate: '2025-06-10',
  description: 'Movimiento',
  categoryId: 'cat1',
  amount: 50,
  currency: 'EUR',
  type: 'expense',
  accountId: 'acc1',
  ...over,
});

const mkGoal = (over: Partial<SavingsGoal> = {}): SavingsGoal => ({
  id: 'g1',
  name: 'Vacaciones',
  emoji: '🏖️',
  color: '#06b6d4',
  targetAmount: 1000,
  currency: 'EUR',
  deadline: '',
  mode: 'manual',
  currentAmount: 0,
  categoryId: 'cat1',
  accountId: 'all',
  autoType: 'income',
  autoStartDate: '2025-01-01',
  ...over,
});

const mkForecastMonth = (over: Partial<ForecastMonth> = {}): ForecastMonth => ({
  key: '2025-06',
  label: 'junio de 2025',
  income: 0,
  expense: 0,
  net: 0,
  isPast: false,
  isCurrent: true,
  runningBalance: 1000,
  ...over,
});

const mkCtx = (over: Partial<AlertContext> = {}): AlertContext => ({
  accounts: [],
  projections: [],
  categories: [],
  realExpenses: [],
  goals: [],
  rates: {},
  baseCurrency: 'EUR',
  dateFormat: 'dd/mm/yyyy',
  now: new Date('2025-06-15T12:00:00Z'),
  forecastAll: [mkForecastMonth()],
  forecastByAccount: {},
  ...over,
});

// ═════════════════════════════════════════════════════════════════════════════
describe('generateBalanceCriticalAlerts', () => {
  it('no genera alerta si la cuenta no tiene minBalance', () => {
    const ctx = mkCtx({ accounts: [mkAccount({ minBalance: 0 })] });
    expect(generateBalanceCriticalAlerts(ctx)).toEqual([]);
  });

  it('no genera alerta si el saldo está por encima del mínimo', () => {
    const ctx = mkCtx({ accounts: [mkAccount({ balance: 1000, minBalance: 500 })] });
    expect(generateBalanceCriticalAlerts(ctx)).toEqual([]);
  });

  it('genera alerta critical si saldo < minBalance', () => {
    const ctx = mkCtx({
      accounts: [mkAccount({ id: 'a1', balance: 100, minBalance: 500 })],
    });
    const out = generateBalanceCriticalAlerts(ctx);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe('balance_critical_a1');
    expect(out[0].severity).toBe('critical');
    expect(out[0].type).toBe('balance_critical');
    expect(out[0].data?.accountId).toBe('a1');
  });

  it('genera una alerta por cada cuenta afectada', () => {
    const ctx = mkCtx({
      accounts: [
        mkAccount({ id: 'a1', balance: 100, minBalance: 500 }),
        mkAccount({ id: 'a2', balance: 50, minBalance: 200 }),
      ],
    });
    expect(generateBalanceCriticalAlerts(ctx)).toHaveLength(2);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('generateBalanceRiskAlerts', () => {
  it('no genera alerta si la cuenta no tiene minBalance', () => {
    const ctx = mkCtx({
      accounts: [mkAccount({ id: 'a1' })],
      forecastByAccount: { a1: [mkForecastMonth({ runningBalance: -100 })] },
    });
    expect(generateBalanceRiskAlerts(ctx)).toEqual([]);
  });

  it('NO genera risk si ya está por debajo (lo cubre critical)', () => {
    const ctx = mkCtx({
      accounts: [mkAccount({ id: 'a1', balance: 100, minBalance: 500 })],
      forecastByAccount: { a1: [mkForecastMonth({ runningBalance: 50 })] },
    });
    expect(generateBalanceRiskAlerts(ctx)).toEqual([]);
  });

  it('genera warning si el forecast caerá bajo el mínimo en próximos 3 meses', () => {
    const ctx = mkCtx({
      accounts: [mkAccount({ id: 'a1', balance: 1000, minBalance: 500 })],
      forecastByAccount: {
        a1: [
          mkForecastMonth({ runningBalance: 800 }),
          mkForecastMonth({ runningBalance: 600 }),
          mkForecastMonth({ runningBalance: 300 }), // ⚠️
        ],
      },
    });
    const out = generateBalanceRiskAlerts(ctx);
    expect(out).toHaveLength(1);
    expect(out[0].severity).toBe('warning');
    expect(out[0].type).toBe('balance_risk');
  });

  it('ignora meses 4..12 (solo mira los 3 primeros)', () => {
    const ctx = mkCtx({
      accounts: [mkAccount({ id: 'a1', balance: 1000, minBalance: 500 })],
      forecastByAccount: {
        a1: [
          mkForecastMonth({ runningBalance: 800 }),
          mkForecastMonth({ runningBalance: 700 }),
          mkForecastMonth({ runningBalance: 600 }),
          mkForecastMonth({ runningBalance: 100 }), // fuera de ventana
        ],
      },
    });
    expect(generateBalanceRiskAlerts(ctx)).toEqual([]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('generateBudgetExceededAlerts', () => {
  it('no genera alerta sin proyecciones', () => {
    const ctx = mkCtx({
      accounts: [mkAccount()],
      realExpenses: [mkReal({ amount: 200, valueDate: '2025-06-05' })],
    });
    expect(generateBudgetExceededAlerts(ctx)).toEqual([]);
  });

  it('no genera alerta si el gasto real está bajo el presupuesto', () => {
    const ctx = mkCtx({
      accounts: [mkAccount()],
      categories: [mkCategory()],
      projections: [mkProjection({ amount: 200 })],
      realExpenses: [mkReal({ amount: 50, valueDate: '2025-06-05' })],
    });
    expect(generateBudgetExceededAlerts(ctx)).toEqual([]);
  });

  it('genera alerta si el real supera el proyectado', () => {
    const ctx = mkCtx({
      accounts: [mkAccount()],
      categories: [mkCategory({ id: 'cat1', name: 'Comida' })],
      projections: [mkProjection({ categoryId: 'cat1', amount: 100 })],
      realExpenses: [mkReal({ categoryId: 'cat1', amount: 150, valueDate: '2025-06-05' })],
    });
    const out = generateBudgetExceededAlerts(ctx);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe('budget_exceeded_cat1');
    expect(out[0].type).toBe('budget_exceeded');
    expect(out[0].title).toContain('Comida');
    expect(out[0].message).toContain('+50%'); // exceso
  });

  it('ignora movimientos de meses pasados', () => {
    const ctx = mkCtx({
      accounts: [mkAccount()],
      categories: [mkCategory()],
      projections: [mkProjection({ amount: 100 })],
      realExpenses: [mkReal({ amount: 999, valueDate: '2025-05-05' })], // mayo
    });
    expect(generateBudgetExceededAlerts(ctx)).toEqual([]);
  });

  it('ignora movimientos anteriores al alta de la cuenta', () => {
    const ctx = mkCtx({
      accounts: [mkAccount({ date: '2025-06-10' })],
      categories: [mkCategory()],
      projections: [mkProjection({ amount: 100 })],
      realExpenses: [mkReal({ amount: 999, valueDate: '2025-06-05' })], // antes del alta
    });
    expect(generateBudgetExceededAlerts(ctx)).toEqual([]);
  });

  it('ignora ingresos (solo gastos)', () => {
    const ctx = mkCtx({
      accounts: [mkAccount()],
      categories: [mkCategory()],
      projections: [mkProjection({ amount: 100 })],
      realExpenses: [mkReal({ amount: 999, type: 'income', valueDate: '2025-06-05' })],
    });
    expect(generateBudgetExceededAlerts(ctx)).toEqual([]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('generateDuplicateProjectionAlerts', () => {
  it('no genera alerta sin warnings activos', () => {
    const ctx = mkCtx({ projections: [mkProjection()] });
    expect(generateDuplicateProjectionAlerts(ctx)).toEqual([]);
  });

  it('genera alerta si hasDuplicateWarning y mes coincide con el actual', () => {
    const ctx = mkCtx({
      accounts: [mkAccount()],
      categories: [mkCategory()],
      projections: [
        mkProjection({
          id: 'p1',
          hasDuplicateWarning: true,
          duplicateWarningMonth: '2025-06',
        }),
      ],
    });
    const out = generateDuplicateProjectionAlerts(ctx);
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe('duplicate_projection');
    expect(out[0].id).toBe('duplicate_projection_p1_2025-06');
  });

  it('NO genera alerta si el warning es de otro mes', () => {
    const ctx = mkCtx({
      projections: [
        mkProjection({
          hasDuplicateWarning: true,
          duplicateWarningMonth: '2025-05',
        }),
      ],
    });
    expect(generateDuplicateProjectionAlerts(ctx)).toEqual([]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('generateMonthNegativeAlert', () => {
  it('no genera alerta si el balance del mes es positivo', () => {
    const ctx = mkCtx({ forecastAll: [mkForecastMonth({ net: 500 })] });
    expect(generateMonthNegativeAlert(ctx)).toEqual([]);
  });

  it('no genera alerta si el balance del mes es exactamente 0', () => {
    const ctx = mkCtx({ forecastAll: [mkForecastMonth({ net: 0 })] });
    expect(generateMonthNegativeAlert(ctx)).toEqual([]);
  });

  it('genera warning si el net es negativo', () => {
    const ctx = mkCtx({ forecastAll: [mkForecastMonth({ net: -300 })] });
    const out = generateMonthNegativeAlert(ctx);
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe('month_negative');
    expect(out[0].severity).toBe('warning');
    expect(out[0].message).toContain('300');
  });

  it('no genera alerta si forecastAll está vacío', () => {
    const ctx = mkCtx({ forecastAll: [] });
    expect(generateMonthNegativeAlert(ctx)).toEqual([]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('generateGoalAlerts', () => {
  it('genera goal_completed cuando saved >= target (modo manual)', () => {
    const ctx = mkCtx({
      goals: [mkGoal({ id: 'g1', targetAmount: 1000, currentAmount: 1000 })],
    });
    const out = generateGoalAlerts(ctx);
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe('goal_completed');
    expect(out[0].severity).toBe('positive');
    expect(out[0].id).toBe('goal_completed_g1');
  });

  it('no genera ninguna alerta para objetivo en progreso sin deadline', () => {
    const ctx = mkCtx({
      goals: [mkGoal({ targetAmount: 1000, currentAmount: 500, deadline: '' })],
    });
    expect(generateGoalAlerts(ctx)).toEqual([]);
  });

  it('genera goal_overdue si el deadline pasó y no está completo', () => {
    const ctx = mkCtx({
      goals: [
        mkGoal({
          id: 'g1',
          targetAmount: 1000,
          currentAmount: 400,
          deadline: '2025-05-01', // antes de now (2025-06-15)
        }),
      ],
    });
    const out = generateGoalAlerts(ctx);
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe('goal_overdue');
    expect(out[0].severity).toBe('critical');
  });

  it('goal_overdue tiene prioridad: si está vencido NO mira al ritmo', () => {
    const ctx = mkCtx({
      goals: [
        mkGoal({
          targetAmount: 1000,
          currentAmount: 400,
          deadline: '2025-05-01',
          mode: 'manual',
        }),
      ],
    });
    const out = generateGoalAlerts(ctx);
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe('goal_overdue');
  });

  it('genera goal_at_risk en modo manual con <= 2 meses y pct < 80', () => {
    const ctx = mkCtx({
      goals: [
        mkGoal({
          targetAmount: 1000,
          currentAmount: 500, // 50%
          deadline: '2025-07-20', // ~1 mes desde now
          mode: 'manual',
        }),
      ],
    });
    const out = generateGoalAlerts(ctx);
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe('goal_at_risk');
    expect(out[0].severity).toBe('warning');
  });

  it('NO genera at_risk si pct >= 80 (modo manual)', () => {
    const ctx = mkCtx({
      goals: [
        mkGoal({
          targetAmount: 1000,
          currentAmount: 850,
          deadline: '2025-07-20',
          mode: 'manual',
        }),
      ],
    });
    expect(generateGoalAlerts(ctx)).toEqual([]);
  });

  it('genera goal_at_risk en modo auto si el ritmo < 80% del necesario', () => {
    // Necesita 1000 EUR. Lleva 0. Deadline en ~5 meses → necesita 200/mes.
    // Solo ha ahorrado 100 en los últimos 3 meses → ritmo = 33.3/mes < 160 (80%).
    const ctx = mkCtx({
      accounts: [mkAccount({ id: 'acc1', date: '2024-01-01' })],
      goals: [
        mkGoal({
          targetAmount: 1000,
          currentAmount: 0,
          deadline: '2025-11-15',
          mode: 'auto',
          autoType: 'income',
          autoStartDate: '2025-01-01',
          accountId: 'all',
        }),
      ],
      realExpenses: [
        mkReal({ type: 'income', amount: 100, valueDate: '2025-05-10' }),
      ],
    });
    const out = generateGoalAlerts(ctx);
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe('goal_at_risk');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('generateCreditCardAlerts', () => {
  it('ignora cuentas que NO son credit_card', () => {
    const ctx = mkCtx({ accounts: [mkAccount({ accountType: 'checking' })] });
    expect(generateCreditCardAlerts(ctx)).toEqual([]);
  });

  it('no genera utilization si está por debajo del 70%', () => {
    const ctx = mkCtx({
      accounts: [
        mkAccount({
          id: 'cc',
          accountType: 'credit_card',
          creditLimit: 1000,
          balance: 0,
          date: '2025-01-01',
        }),
      ],
      realExpenses: [mkReal({ accountId: 'cc', amount: 500, valueDate: '2025-06-01' })],
    });
    const out = generateCreditCardAlerts(ctx).filter(
      (a) => a.type === 'credit_utilization_high'
    );
    expect(out).toEqual([]);
  });

  it('genera utilization warning si entre 70% y 89%', () => {
    const ctx = mkCtx({
      accounts: [
        mkAccount({
          id: 'cc',
          accountType: 'credit_card',
          creditLimit: 1000,
          balance: 0,
          date: '2025-01-01',
        }),
      ],
      realExpenses: [mkReal({ accountId: 'cc', amount: 800, valueDate: '2025-06-01' })],
    });
    const out = generateCreditCardAlerts(ctx).filter(
      (a) => a.type === 'credit_utilization_high'
    );
    expect(out).toHaveLength(1);
    expect(out[0].severity).toBe('warning');
    expect(out[0].actionType).toBe('open_simulator');
  });

  it('genera utilization critical si >= 90%', () => {
    const ctx = mkCtx({
      accounts: [
        mkAccount({
          id: 'cc',
          accountType: 'credit_card',
          creditLimit: 1000,
          balance: 0,
          date: '2025-01-01',
        }),
      ],
      realExpenses: [mkReal({ accountId: 'cc', amount: 950, valueDate: '2025-06-01' })],
    });
    const out = generateCreditCardAlerts(ctx).filter(
      (a) => a.type === 'credit_utilization_high'
    );
    expect(out).toHaveLength(1);
    expect(out[0].severity).toBe('critical');
  });

  it('genera interest_warning si TAE definida y intereses anuales >= 50', () => {
    // 1000 deuda × 24.9% = 249/año → > 50 ✅
    const ctx = mkCtx({
      accounts: [
        mkAccount({
          id: 'cc',
          accountType: 'credit_card',
          creditLimit: 5000,
          balance: 0,
          date: '2025-01-01',
          interestRate: 24.9,
        }),
      ],
      realExpenses: [mkReal({ accountId: 'cc', amount: 1000, valueDate: '2025-06-01' })],
    });
    const out = generateCreditCardAlerts(ctx).filter(
      (a) => a.type === 'credit_interest_warning'
    );
    expect(out).toHaveLength(1);
    expect(out[0].actionType).toBe('open_simulator');
  });

  it('NO genera interest_warning si los intereses anuales < 50', () => {
    // 100 deuda × 24.9% = 24.9/año → < 50
    const ctx = mkCtx({
      accounts: [
        mkAccount({
          id: 'cc',
          accountType: 'credit_card',
          creditLimit: 5000,
          balance: 0,
          date: '2025-01-01',
          interestRate: 24.9,
        }),
      ],
      realExpenses: [mkReal({ accountId: 'cc', amount: 100, valueDate: '2025-06-01' })],
    });
    const out = generateCreditCardAlerts(ctx).filter(
      (a) => a.type === 'credit_interest_warning'
    );
    expect(out).toEqual([]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('generateProjectionDueAlerts', () => {
  it('ignora proyecciones vinculadas a préstamos', () => {
    const ctx = mkCtx({
      accounts: [mkAccount()],
      projections: [
        mkProjection({
          linkedLoanId: 'loan1',
          frequency: 'monthly',
          startDate: '2025-06-18', // muy próxima
          isRecurring: true,
          recurringDay: 18,
        }),
      ],
    });
    expect(generateProjectionDueAlerts(ctx)).toEqual([]);
  });

  it('ignora proyecciones con alertDisabled', () => {
    const ctx = mkCtx({
      accounts: [mkAccount()],
      projections: [
        mkProjection({
          alertDisabled: true,
          frequency: 'monthly',
          isRecurring: true,
          recurringDay: 18,
          startDate: '2025-06-01',
        }),
      ],
    });
    expect(generateProjectionDueAlerts(ctx)).toEqual([]);
  });

  it('genera alerta cuando la proyección vence en ventana de aviso', () => {
    // now = 2025-06-15, día recurrente = 18 → dentro de la ventana
    const ctx = mkCtx({
      accounts: [mkAccount({ id: 'acc1' })],
      projections: [
        mkProjection({
          id: 'p1',
          name: 'Alquiler',
          type: 'expense',
          frequency: 'monthly',
          isRecurring: true,
          recurringDay: 18,
          startDate: '2025-01-01',
        }),
      ],
    });
    const out = generateProjectionDueAlerts(ctx);
    expect(out.length).toBeGreaterThanOrEqual(1);
    expect(out[0].type).toBe('projection_due_soon');
    expect(out[0].actionType).toBe('open_real_expense_modal');
    expect(out[0].id).toMatch(/^projection_due_soon_p1_/);
  });

  it('icono y label cambian según el tipo (income vs expense)', () => {
    const ctx = mkCtx({
      accounts: [mkAccount()],
      projections: [
        mkProjection({
          id: 'pi',
          type: 'income',
          frequency: 'monthly',
          isRecurring: true,
          recurringDay: 18,
          startDate: '2025-01-01',
        }),
      ],
    });
    const out = generateProjectionDueAlerts(ctx);
    if (out.length > 0) {
      expect(out[0].title).toContain('📈');
      expect(out[0].actionLabel).toContain('ingreso');
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('generateAllAlerts (orquestador)', () => {
  it('devuelve array vacío con contexto vacío', () => {
    expect(generateAllAlerts(mkCtx())).toEqual([]);
  });

  it('combina alertas de varios generadores en un solo array', () => {
    const ctx = mkCtx({
      accounts: [mkAccount({ id: 'a1', balance: 100, minBalance: 500 })],
      forecastAll: [mkForecastMonth({ net: -200 })],
    });
    const out = generateAllAlerts(ctx);
    // Esperamos: 1 balance_critical + 1 month_negative
    expect(out.length).toBeGreaterThanOrEqual(2);
    const types = out.map((a) => a.type);
    expect(types).toContain('balance_critical');
    expect(types).toContain('month_negative');
  });

  it('todas las alertas generadas tienen los campos obligatorios', () => {
    const ctx = mkCtx({
      accounts: [mkAccount({ id: 'a1', balance: 100, minBalance: 500 })],
      forecastAll: [mkForecastMonth({ net: -200 })],
    });
    const out = generateAllAlerts(ctx);
    out.forEach((a) => {
      expect(a.id).toBeTruthy();
      expect(a.type).toBeTruthy();
      expect(a.severity).toBeTruthy();
      expect(a.title).toBeTruthy();
      expect(a.message).toBeTruthy();
      expect(typeof a.generatedAt).toBe('number');
    });
  });

  it('los IDs son únicos dentro del array generado', () => {
    const ctx = mkCtx({
      accounts: [
        mkAccount({ id: 'a1', balance: 100, minBalance: 500 }),
        mkAccount({ id: 'a2', balance: 50, minBalance: 300 }),
      ],
      forecastAll: [mkForecastMonth({ net: -200 })],
    });
    const out = generateAllAlerts(ctx);
    const ids = out.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
