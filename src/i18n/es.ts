// ─── Diccionario ES (español) ────────────────────────────────────────────────
//
// Strings de usuario centralizados para i18n.
// Fase 0.5 B4: preparar terreno — solo strings estáticos de lib/.
// Fase 3: conectar i18next y ampliar a componentes.
//
// Convención de namespaces:
//   loans           → lib/loanUtils.ts
//   creditCards     → lib/creditCardUtils.ts
//   (futuros)       → lib/projectionAlerts, componentes, etc.
// ─────────────────────────────────────────────────────────────────────────────

export const es = {
  loans: {
    types: {
      mortgage: 'Hipoteca',
      personal: 'Préstamo personal',
      default: 'Préstamo',
    },
    errors: {
      amountPositive: 'El importe debe ser mayor que 0',
      insufficientPayment:
        'Con esta amortización la cuota actual no cubre los intereses del capital restante. ' +
        'Prueba a amortizar más o cambia al modo "Reducir cuota".',
    },
  },

  creditCards: {
    healthScore: {
      levels: {
        critical: 'Crítico',
        high: 'Alto riesgo',
        moderate: 'Moderado',
        excellent: 'Excelente',
      },
      overall: {
        excellent: {
          label: 'Excelente',
          summary: '¡Lo estás haciendo genial! Mantén estos hábitos financieros.',
        },
        good: {
          label: 'Bueno',
          summary: 'Vas por buen camino. Pequeños ajustes te llevarán a la excelencia.',
        },
        fair: {
          label: 'Mejorable',
          summary: 'Hay margen de mejora. Revisa los factores en rojo para subir tu score.',
        },
        poor: {
          label: 'Crítico',
          summary:
            'Tu salud financiera está en riesgo. Es momento de actuar para evitar problemas mayores.',
        },
      },
      factors: {
        utilization: { label: 'Utilización del crédito' },
        trend: {
          label: 'Tendencia reciente',
          noData: 'Aún no hay datos suficientes para evaluar tendencia',
          noDebt: '¡Sin deuda! Estás en la mejor situación posible',
        },
        paymentMargin: {
          label: 'Margen al próximo pago',
          noDebt: 'Sin deuda pendiente',
          notConfigured: 'Día de pago no configurado',
        },
        interestCost: {
          label: 'Coste en intereses',
          noDebt: 'Sin deuda, sin intereses',
          notConfigured: 'TAE no configurada',
        },
        consistency: {
          label: 'Consistencia de pagos',
          neverHadDebt: 'Nunca has tenido deuda · Perfecto',
          noHistory: 'Sin historial todavía',
        },
      },
    },
  },
  goals: {
    header: {
      section: 'Ahorro',
      emptySubtitle: 'Crea tu primer objetivo de ahorro',
      newGoal: 'Nuevo objetivo',
      new: 'Nuevo',
      stickyTitle: '🎯 Objetivos — Progreso',
    },
    stats: {
      total: 'Total objetivos',
      completed: 'Completados',
      totalSaved: 'Total ahorrado',
    },
    empty: {
      title: 'Sin objetivos todavía',
      body: 'Crea tu primer objetivo para empezar a ahorrar con propósito.',
      createBtn: 'Crear objetivo',
    },
    coach: {
      title: '¡Empieza a ahorrar!',
      description:
        'Pulsa aquí para crear tu primer objetivo. La app calculará automáticamente cuánto necesitas ahorrar cada mes para llegar a tiempo.',
    },
    modal: {
      newTitle: '🎯 Nuevo objetivo',
      editTitle: '✏️ Editar objetivo',
    },
    card: {
      remaining: 'Falta',
      monthsLeft: 'Meses restantes',
      noLimit: 'Sin límite',
      monthlyNeeded: 'Necesitas/mes',
    },
    errors: {
      nameRequired: 'El nombre es obligatorio',
      amountRequired: 'Introduce un importe válido',
      categoryRequired: 'Selecciona una categoría',
      accountRequired: 'Selecciona una cuenta',
    },
    print: {
      title: 'Objetivos de ahorro',
    },
  },

  dashboard: {
    print: { title: 'Resumen' },
    stickyTitle: '🏠 Resumen — Situación financiera',
    kpi: {
      wealth: 'Patrimonio',
      incomeMonth: 'Ingresos (mes)',
      expenseMonth: 'Gastos (mes)',
      netMonth: 'Neto (mes)',
      incomeShort: 'ING./MES',
      expenseShort: 'GAS./MES',
      netShort: 'NETO/MES',
    },
    credit: {
      critical: 'Crítico',
      high: 'Alto',
      moderate: 'Moderado',
      excellent: 'Excelente',
    },
    coach: {
      title: 'Aquí está tu dinero real',
      description:
        'Este número se actualiza automáticamente cada vez que registras un movimiento. Nunca tendrás que calcular nada.',
    },
  },

  accounts: {
    print: { title: 'Mis Cuentas', filename: 'Mis_Cuentas' },
    newAccount: 'Nueva cuenta',
    tab: 'Cuentas',
    coach: {
      title: 'Empieza por aquí',
      description:
        'Añade tu primera cuenta con el saldo que tienes hoy. La app hará el seguimiento desde ese momento en adelante.',
    },
    toast: {
      loanCreated:
        'Préstamo creado. Se ha generado automáticamente una proyección mensual para la cuota.',
      accountCreated: 'Cuenta creada correctamente',
      accountUpdated:
        'Cuenta actualizada. Los movimientos anteriores al nuevo saldo base han sido reconocidos automáticamente.',
    },
  },

  projections: {
    print: { title: 'Proyecciones' },
    stats: {
      total: 'Total proyecciones',
      incomePerMonth: 'Ingresos/mes',
      expensePerMonth: 'Gastos/mes',
      netPerMonth: 'Neto/mes',
    },
    empty: {
      noProjections: 'Todavía no tienes proyecciones',
      noResults: 'No hay proyecciones con estos filtros',
      bodyDefault: 'Añade ingresos y gastos recurrentes para ver la proyección de tus finanzas.',
      bodyFiltered: 'Prueba a cambiar los filtros.',
    },
    coach: {
      title: 'Tu previsión financiera',
      description: 'Define aquí tu nómina y tus gastos fijos. La app calculará si llegas a fin de mes antes de que ocurra.',
    },
  },

  realExpenses: {
    print: { title: 'Movimientos Reales', filename: 'Movimientos_Reales' },
    stats: {
      totalIncome: 'Total ingresos',
      totalExpense: 'Total gastos',
      realBalance: 'Balance real',
      income: 'Ingresos',
      expense: 'Gastos',
      balance: 'Balance',
    },
    periods: {
      thisMonth: 'Este mes',
      lastMonth: 'Mes anterior',
      last3: 'Últimos 3 meses',
      last6: 'Últimos 6 meses',
      thisYear: 'Este año',
    },
    filters: {
      typeIncome: 'Tipo: Ingresos',
      typeExpense: 'Tipo: Gastos',
    },
    notes: { fromAlert: 'Generado desde alerta de vencimiento' },
    coach: {
      title: 'Registra tus movimientos',
      description: "Añádelos uno a uno con '+ Nuevo movimiento', o importa todos de golpe desde el CSV de tu banco (Santander, BBVA, CaixaBank, ING, Revolut...).",
    },
  },

  transfers: {
    print: { title: 'Traspasos entre cuentas' },
    newTransfer: 'Nuevo traspaso',
    defaultDescription: 'Traspaso entre cuentas',
    subtitle: 'Mueve dinero entre tus cuentas sin afectar al patrimonio',
    stats: {
      total: 'Total traspasos',
      volume: 'Volumen total movido',
      volumeShort: 'Volumen movido',
      effect: 'Efecto en patrimonio',
      neutral: 'Neutro',
    },
    errors: {
      fromAccount: 'Selecciona la cuenta origen',
      toAccount: 'Selecciona la cuenta destino',
      sameAccount: 'Las cuentas deben ser diferentes',
      amount: 'Introduce un importe válido',
      description: 'La descripción es obligatoria',
    },
    form: {
      fromAccount: 'Cuenta origen *',
      toAccount: 'Cuenta destino *',
      amount: 'Importe *',
      currency: 'Divisa',
      date: 'Fecha de transferencia',
      description: 'Descripción *',
      notes: 'Notas (opcional)',
    },
  },

  categories: {
    empty: 'Usa el botón "Nueva categoría" para añadir una.',
    tabs: { income: 'Ingresos', expense: 'Gastos' },
    noCategory: 'Sin categoría',
    typeIncome: 'Ingreso',
    typeExpense: 'Gasto',
    form: {
      category: 'Categoría',
      keywords: 'Palabras clave (separadas por comas)',
      newTitle: 'Nueva categoría',
      editTitle: 'Editar categoría',
      name: 'Nombre',
      type: 'Tipo',
      color: 'Color identificativo',
      newCategoryTooltip: 'Crear nueva categoría',
    },
  },

  common: {
    save: 'Guardar',
    saveChanges: 'Guardar cambios',
    saveExpense: 'Guardar movimiento',
    createAccount: 'Crear cuenta',
    createProjection: 'Crear proyección',
    viewList: 'Lista',
    viewAnalysis: 'Análisis',
    all: 'Todos',
    new: 'Nuevo',
    saveGoal: 'Guardar objetivo',
    saveFormat: 'Guardar formato',
    saveNewPassword: 'Guardar nueva contraseña',
    registerPayment: 'Registrar pago',
    saveRule: 'Guardar regla',
    updateRule: 'Actualizar regla',
    cancel: 'Cancelar',
    irreversible: 'Esta acción no se puede deshacer.',
    delete: 'Eliminar',
    close: 'Cerrar',
  },
} as const;

export type Es = typeof es;

// Extracts all valid dot-notation key paths from a nested object type.
// Example: DotPaths<{ a: { b: 'x' } }> → 'a.b'
type DotPaths<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? P extends '' ? K : `${P}.${K}`
    : P extends ''
      ? DotPaths<T[K], K>
      : DotPaths<T[K], `${P}.${K}`>;
}[keyof T & string];

export type TranslationKey = DotPaths<Es>;
