// ─── demoData — dataset semilla del Modo Prueba (spec 12 §5.H) ───────────────
//
// Función PURA: dado la divisa del usuario y un traductor de nombres de
// categoría, devuelve un conjunto realista y curado de datos de ejemplo con el
// que la app luce completa desde el minuto uno (Resumen, Planificación,
// Previsión, Tendencias, Informes) SIN tocar nada del usuario.
//
// ⚠️ Aislamiento: estos datos se persisten bajo el prefijo `fh_demo_*`
// (ver src/lib/appMode.ts). Nunca se mezclan con los reales.
//
// Todas las entidades llevan createdAt/updatedAt porque se escriben en
// almacenamiento DIRECTAMENTE (sin pasar por los setters sellados de
// DataContext).
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Account, Category, Projection, RealExpense,
  SavingsGoal, BankFormat, CategoryRule,
} from '../types';

export interface DemoDataset {
  accounts: Account[];
  categories: Category[];
  projections: Projection[];
  realExpenses: RealExpense[];
  goals: SavingsGoal[];
  bankFormats: BankFormat[];
  categoryRules: CategoryRule[];
}

// Claves de categoría (réplica del set de onboarding) + su tipo/color, para que
// el traductor `t` devuelva el mismo nombre que ve un usuario real.
const CAT_DEFS = [
  { key: 'salary',        type: 'income',  color: '#16a34a' },
  { key: 'freelance',     type: 'income',  color: '#0891b2' },
  { key: 'rentReceived',  type: 'income',  color: '#0d9488' },
  { key: 'investments',   type: 'income',  color: '#4f46e5' },
  { key: 'pension',       type: 'income',  color: '#7c3aed' },
  { key: 'otherIncome',   type: 'income',  color: '#ca8a04' },
  { key: 'housing',       type: 'expense', color: '#dc2626' },
  { key: 'mortgage',      type: 'expense', color: '#b91c1c' },
  { key: 'food',          type: 'expense', color: '#ea580c' },
  { key: 'transport',     type: 'expense', color: '#ca8a04' },
  { key: 'health',        type: 'expense', color: '#0891b2' },
  { key: 'education',     type: 'expense', color: '#4f46e5' },
  { key: 'leisure',       type: 'expense', color: '#7c3aed' },
  { key: 'subscriptions', type: 'expense', color: '#db2777' },
  { key: 'clothing',      type: 'expense', color: '#ec4899' },
  { key: 'restaurants',   type: 'expense', color: '#f97316' },
  { key: 'travel',        type: 'expense', color: '#06b6d4' },
  { key: 'insurance',     type: 'expense', color: '#64748b' },
  { key: 'pets',          type: 'expense', color: '#84cc16' },
  { key: 'savings',       type: 'expense', color: '#1d4ed8' },
  { key: 'otherExpenses', type: 'expense', color: '#94a3b8' },
] as const;

// IDs deterministas → reseed idempotente y referencias estables.
const catId = (key: string) => `demo-cat-${key}`;
const ACC = {
  checking:   'demo-acc-checking',
  savings:    'demo-acc-savings',
  card:       'demo-acc-card',
  investment: 'demo-acc-investment',
  mortgage:   'demo-acc-mortgage',
};

// ── Helpers de fecha ─────────────────────────────────────────────────────────
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;

/** Fecha a `day` del mes con offset de meses respecto a `base`. */
function dayOfMonth(base: Date, monthOffset: number, day: number): Date {
  const d = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return d;
}

/**
 * Construye el dataset del Modo Prueba.
 *
 * @param currency  Divisa del usuario (ISO, p. ej. 'EUR'). Se aplica a cuentas y
 *                  movimientos para que los importes se lean en su moneda.
 * @param t         Traductor de nombres de categoría (`onboarding.defaultCategories.*`).
 * @param now       Momento de referencia (default: ahora). Inyectable para tests.
 */
export function buildDemoData(opts: {
  currency: string;
  t: (key: string) => string;
  now?: Date;
}): DemoDataset {
  const { currency, t } = opts;
  const now = opts.now ?? new Date();
  const ts = now.getTime();
  const stamp = { createdAt: ts, updatedAt: ts };
  const today = iso(now);

  // ── Categorías ─────────────────────────────────────────────────────────────
  const categories: Category[] = CAT_DEFS.map((c) => ({
    id: catId(c.key),
    name: t(`onboarding.defaultCategories.${c.key}`),
    type: c.type,
    color: c.color,
    ...stamp,
  }));

  // ── Cuentas ────────────────────────────────────────────────────────────────
  const accounts: Account[] = [
    {
      id: ACC.checking, name: t('demo.accounts.checking'), balance: 4200,
      currency, date: today, accountType: 'checking', minBalance: 500,
      institution: 'BBVA', ...stamp,
    },
    {
      id: ACC.savings, name: t('demo.accounts.savings'), balance: 28000,
      currency, date: today, accountType: 'savings', institution: 'ING', ...stamp,
    },
    {
      id: ACC.card, name: t('demo.accounts.card'), balance: 0, currency,
      date: today, accountType: 'credit_card', institution: 'American Express',
      creditLimit: 3000, billingDay: 25, paymentDueDay: 5, interestRate: 22.9,
      minPaymentPct: 5, ...stamp,
    },
    {
      id: ACC.investment, name: t('demo.accounts.investment'), balance: 96000,
      currency, date: today, accountType: 'investment',
      institution: 'MyInvestor', ...stamp,
    },
    {
      id: ACC.mortgage, name: t('demo.accounts.mortgage'), balance: 92000,
      currency, date: today, accountType: 'loan', loanType: 'mortgage',
      monthlyPayment: 780, paymentsRemaining: 132, interestRate: 2.9,
      interestType: 'fixed', paymentDay: 1, paymentAccountId: ACC.checking,
      institution: 'CaixaBank', ...stamp,
    },
  ];

  // ── Planificación (proyecciones de fijos) ───────────────────────────────────
  // `lastApplied` = mes en curso: el dataset es una FOTO curada de un mes ya
  // vivido — los movimientos de este mes ya están escritos abajo a mano. Sin
  // esta marca, el motor de recurrentes (AppProvider) se dispara al arrancar en
  // demo y (a) avisa de "posible duplicado" con la hipoteca —mensaje absurdo
  // para quien acaba de entrar a mirar— y (b) inyecta movimientos
  // "🔄 generado automáticamente" que ensucian el ejemplo curado.
  // A partir del mes siguiente el motor materializa el plan con normalidad,
  // igual que en la app real.
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const proj = (
    p: Omit<Projection, 'createdAt' | 'updatedAt' | 'endDate' | 'isRecurring'>
  ): Projection => ({
    endDate: '',
    isRecurring: true,
    // Solo las que ya han arrancado: una anual que empieza el mes que viene no
    // "se ha aplicado" nunca (el motor tampoco la tocaría).
    ...(new Date(p.startDate) <= now ? { lastApplied: monthKey } : {}),
    ...p,
    ...stamp,
  });

  const planStart = iso(dayOfMonth(now, -2, 1));
  const projections: Projection[] = [
    proj({
      // Día 1 a propósito: el Modo Prueba es un escaparate y se entra cualquier
      // día del mes. Con la nómina a final de mes, quien entra antes del cobro
      // ve "Ingresos +0 / Neto negativo" — realista pero pésima primera foto.
      id: 'demo-proj-salary', name: t('demo.plan.salary'), accountId: ACC.checking,
      categoryId: catId('salary'), type: 'income', amount: 3200,
      frequency: 'monthly', startDate: planStart, recurringDay: 1,
    }),
    proj({
      id: 'demo-proj-mortgage', name: t('demo.plan.mortgage'), accountId: ACC.checking,
      categoryId: catId('mortgage'), type: 'expense', amount: 780,
      frequency: 'monthly', startDate: planStart, recurringDay: 1,
    }),
    proj({
      id: 'demo-proj-food', name: t('demo.plan.food'), accountId: ACC.checking,
      categoryId: catId('food'), type: 'expense', amount: 520,
      frequency: 'monthly', startDate: planStart, recurringDay: 5,
    }),
    proj({
      id: 'demo-proj-utilities', name: t('demo.plan.utilities'), accountId: ACC.checking,
      categoryId: catId('housing'), type: 'expense', amount: 135,
      frequency: 'monthly', startDate: planStart, recurringDay: 8,
    }),
    proj({
      id: 'demo-proj-subs', name: t('demo.plan.subscriptions'), accountId: ACC.card,
      categoryId: catId('subscriptions'), type: 'expense', amount: 44,
      frequency: 'monthly', startDate: planStart, recurringDay: 15,
    }),
    proj({
      id: 'demo-proj-transport', name: t('demo.plan.transport'), accountId: ACC.checking,
      categoryId: catId('transport'), type: 'expense', amount: 90,
      frequency: 'monthly', startDate: planStart, recurringDay: 3,
    }),
    proj({
      id: 'demo-proj-insurance', name: t('demo.plan.insurance'), accountId: ACC.checking,
      categoryId: catId('insurance'), type: 'expense', amount: 540,
      frequency: 'annual', startDate: iso(dayOfMonth(now, 1, 10)), recurringDay: 10,
    }),
    proj({
      id: 'demo-proj-savings', name: t('demo.plan.savingsTransfer'), accountId: ACC.checking,
      toAccountId: ACC.savings, categoryId: catId('savings'), type: 'transfer',
      amount: 500, frequency: 'monthly', startDate: planStart, recurringDay: 28,
    }),
  ];

  // ── Movimientos importados (últimos ~2 meses) ───────────────────────────────
  let seq = 0;
  const mov = (
    date: Date,
    description: string,
    categoryKey: string,
    amount: number,
    type: 'income' | 'expense',
    accountId: string,
    extra: Partial<RealExpense> = {}
  ): RealExpense => {
    const d = iso(date);
    return {
      id: `demo-mov-${seq++}`,
      entryDate: d, valueDate: d, description,
      categoryId: catId(categoryKey), amount, currency, type, accountId,
      ...extra, ...stamp,
    };
  };

  const realExpenses: RealExpense[] = [
    // Mes actual
    mov(dayOfMonth(now, 0, 1), t('demo.mov.salary'), 'salary', 3200, 'income', ACC.checking),
    mov(dayOfMonth(now, 0, 1), t('demo.mov.mortgage'), 'mortgage', 780, 'expense', ACC.checking),
    mov(dayOfMonth(now, 0, 3), t('demo.mov.fuel'), 'transport', 62, 'expense', ACC.checking),
    mov(dayOfMonth(now, 0, 4), t('demo.mov.supermarket'), 'food', 118, 'expense', ACC.card),
    mov(dayOfMonth(now, 0, 6), t('demo.mov.electricity'), 'housing', 74, 'expense', ACC.checking),
    mov(dayOfMonth(now, 0, 9), t('demo.mov.restaurant'), 'restaurants', 46, 'expense', ACC.card),
    mov(dayOfMonth(now, 0, 12), t('demo.mov.supermarket'), 'food', 96, 'expense', ACC.card),
    // Mes anterior
    mov(dayOfMonth(now, -1, 1), t('demo.mov.salary'), 'salary', 3200, 'income', ACC.checking),
    mov(dayOfMonth(now, -1, 1), t('demo.mov.mortgage'), 'mortgage', 780, 'expense', ACC.checking),
    mov(dayOfMonth(now, -1, 5), t('demo.mov.supermarket'), 'food', 132, 'expense', ACC.card),
    mov(dayOfMonth(now, -1, 8), t('demo.mov.internet'), 'housing', 60, 'expense', ACC.checking),
    mov(dayOfMonth(now, -1, 14), t('demo.mov.subscriptions'), 'subscriptions', 44, 'expense', ACC.card),
    mov(dayOfMonth(now, -1, 16), t('demo.mov.pharmacy'), 'health', 23, 'expense', ACC.checking),
    mov(dayOfMonth(now, -1, 20), t('demo.mov.clothing'), 'clothing', 89, 'expense', ACC.card),
    mov(dayOfMonth(now, -1, 22), t('demo.mov.fuel'), 'transport', 58, 'expense', ACC.checking),
    // Traspaso a ahorro (par vinculado)
    mov(dayOfMonth(now, -1, 28), t('demo.mov.savingsTransfer'), 'savings', 500, 'expense',
      ACC.checking, { isTransfer: true, transferId: 'demo-transfer-1' }),
    mov(dayOfMonth(now, -1, 28), t('demo.mov.savingsTransfer'), 'savings', 500, 'income',
      ACC.savings, { isTransfer: true, transferId: 'demo-transfer-1' }),
  ];

  // ── Objetivos ────────────────────────────────────────────────────────────────
  const goal = (
    g: Omit<SavingsGoal, 'createdAt' | 'updatedAt'>
  ): SavingsGoal => ({ ...g, ...stamp });

  const goals: SavingsGoal[] = [
    goal({
      id: 'demo-goal-vacation', name: t('demo.goals.vacation'), emoji: '🏖️',
      color: '#06b6d4', targetAmount: 4000, currency, mode: 'manual',
      currentAmount: 1500, categoryId: catId('travel'), accountId: ACC.savings,
      autoType: 'expense', autoStartDate: today,
      deadline: iso(dayOfMonth(now, 8, 1)),
    }),
    goal({
      id: 'demo-goal-emergency', name: t('demo.goals.emergency'), emoji: '🛡️',
      color: '#16a34a', targetAmount: 12000, currency, mode: 'manual',
      currentAmount: 9000, categoryId: catId('savings'), accountId: ACC.savings,
      autoType: 'expense', autoStartDate: today,
      deadline: iso(dayOfMonth(now, 14, 1)),
    }),
  ];

  return {
    accounts,
    categories,
    projections,
    realExpenses,
    goals,
    bankFormats: [] as BankFormat[],
    categoryRules: [] as CategoryRule[],
  };
}
