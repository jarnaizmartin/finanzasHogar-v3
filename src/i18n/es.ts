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
    wizard: {
      fieldIcon: 'Elige un icono',
      fieldColor: 'Color',
      fieldName: 'Nombre del objetivo',
      namePlaceholder: 'Ej: Vacaciones de verano',
      fieldAmount: 'Importe objetivo',
      fieldCurrency: 'Divisa',
      fieldDeadline: 'Fecha límite (opcional)',
      previewMeta: 'Meta:',
      previewLimit: '· Límite:',
      modeManual: 'Manual',
      modeManualDesc: 'Introduces tú el importe ahorrado cuando quieras',
      modeAuto: 'Automático',
      modeAutoDesc: 'Suma automáticamente tus movimientos reales',
      savedSoFar: '¿Cuánto llevas ahorrado hasta ahora?',
      savedHint: 'Puedes actualizarlo en cualquier momento editando el objetivo.',
      movementTypeLabel: 'Tipo de movimiento a sumar',
      typeIncome: 'Ingresos',
      typeExpense: 'Gastos',
      typeIncomeLower: 'ingresos',
      typeExpenseLower: 'gastos',
      typeTransfer: 'Traspaso entre cuentas',
      transferInfo: '↔ Se contabilizarán automáticamente los traspasos que lleguen a la cuenta seleccionada como progreso hacia tu objetivo.',
      noCategoriesWarning: '⚠️ No tienes categorías de {{type}} creadas. Crea una con el botón "+" o usa el modo Manual.',
      fieldCategory: 'Categoría que se sumará',
      categoryPlaceholder: '— Selecciona una categoría —',
      fieldStartDate: 'Contar movimientos desde',
      autoHint: '💡 La app sumará automáticamente todos los movimientos reales que coincidan con estos criterios y actualizará el progreso en tiempo real.',
      fieldFromAccount: 'Cuenta origen (opcional)',
      anyAccountPlaceholder: '— Cualquier cuenta —',
      fromAccountHint: 'Deja en blanco para contar traspasos de cualquier origen.',
      fieldToAccount: 'Cuenta destino (donde llega el ahorro) *',
      toAccountHint: 'El progreso se calcula con los traspasos que lleguen aquí.',
      fieldAccount: 'Cuenta *',
      accountPlaceholder: '— Selecciona una cuenta —',
      projectionTitle: '📊 Proyección:',
      projectionToReach: 'Para alcanzar',
      projectionIn: 'en',
      projectionMonth: 'mes',
      projectionMonths: 'meses',
      projectionNeedSave: ', necesitarás ahorrar',
      projectionPerMonth: '/mes',
      projectionAddDeadline: 'Añade una fecha límite en el paso 1 para ver la proyección.',
      projectionEmpty: '📊 Añade un importe y fecha límite en el paso 1 para ver la proyección mensual.',
      summaryMode: 'Modo',
      summaryCurrency: 'Divisa',
      summaryType: 'Tipo',
      summarySaved: 'Ahorrado',
      summaryAccount: 'Cuenta',
      summaryModeManual: '✍️ Manual',
      summaryModeAuto: '⚡ Automático',
      summaryTransferType: '↔ Traspaso entre cuentas',
      summaryTransferAccount: 'Traspaso entre cuentas',
      summaryReady: '✅ Todo listo. Pulsa Guardar para crear tu objetivo.',
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
    summary: {
      saldoInicial: 'Saldo inicial',
      saldoReal: 'Saldo real actual',
      deudaTarjetas: '💳 Deuda tarjetas',
      deudaPrestamos: '🏠 Deuda préstamos',
      cuentasActivas: 'Cuentas activas',
      stickyTitle: '💼 Mis Cuentas - Patrimonio',
      newShort: 'Nueva',
    },
    card: {
      noInstitution: 'Sin entidad',
      edit: 'Editar',
      delete: 'Eliminar',
      realBalance: 'Saldo real',
      balanceBase: 'Base',
      balanceMin: 'Mínimo:',
      incomePerMonth: 'Ingresos/mes',
      expensePerMonth: 'Gastos/mes',
      projectedBalance: 'Saldo proyectado a 12 meses',
      belowMinWarning: 'El saldo proyectado caerá bajo el mínimo',
      movements: 'Movimientos',
    },
    creditCard: {
      type: 'Tarjeta de crédito',
      healthTitle: 'Salud financiera: {{score}}/100 · {{label}}',
      viewAnalysis: 'Ver análisis completo',
      currentDebt: 'Deuda actual',
      limitUsage: 'Utilización del límite',
      available: 'Disponible',
      totalLimit: 'Límite total',
      billingBadge: '✂️ Corte',
      paymentBadge: '💳 Pago',
      today: 'Hoy',
      todayUrgent: '¡Hoy!',
      rateLabel: 'TAE:',
      minPaymentLabel: 'Pago mín:',
      perYear: '/año',
      minPaymentInfo: '💡 Pago mínimo: {{min}} · Pago total (sin intereses): {{total}}',
      registerPayment: '💸 Registrar pago',
    },
    loan: {
      interestFixed: 'Tipo fijo',
      interestVariable: 'Tipo variable',
      pendingCapital: 'Capital pendiente',
      initialAmount: 'Inicial:',
      paidOff: '¡Préstamo liquidado!',
      paidOffDesc: 'Ya no debes nada. Puedes eliminar este préstamo cuando quieras.',
      progressLabel: 'Progreso del préstamo',
      progressPct: '{{pct}}% pagado',
      monthlyPayment: 'Cuota mensual',
      remainingPayments: 'Cuotas restantes',
      estimatedUntil: 'hasta ~{{date}}',
      interestBreakdown: '💡 De tu cuota de {{amount}}:',
      principalPart: '↘ Capital: {{amount}}',
      interestPart: '↗ Intereses: {{amount}}',
      interestNote: 'Estimación basada en tu capital pendiente y tipo {{rate}}%. El banco lo calcula con precisión cada mes.',
      paidFromNote: '🏦 Se paga desde: {{name}}',
      paymentDayNote: '📅 Día {{day}} de cada mes',
      amortizeBtn: '💸 Amortizar',
      historyBtn: '📜 Historial ({{count}})',
    },
    loanDetail: {
      backBtn: 'Volver a Cuentas',
      breadcrumb: 'Detalle de {{name}}',
      initialSummary: 'Inicial: {{initial}} · Pagado: {{paid}} ({{pct}}%)',
      newAmortizationBtn: '💸 Nueva amortización',
      viewMovementsBtn: 'Ver movimientos',
      totalAmortized: 'Total amortizado',
      interestSaved: 'Ahorro estimado',
      interestSavedSub: 'en intereses',
      feesSub: '(comisiones: {{amount}})',
      paidFromDetail: '🏦 Se cobra desde {{name}}',
      paymentDayDetail: 'el día {{day}} de cada mes',
      evolutionLabel: 'Evolución del capital pendiente',
      evolutionTitle: 'Impacto acumulado de tus amortizaciones',
      chartAmortization: 'Amortización {{date}}: −{{amount}} → {{current}}',
      chartInitial: 'Inicial: {{amount}}',
      chartCurrent: 'Actual: {{amount}}',
      legendInitial: 'Inicial',
      legendAmortization: 'Amortización',
      legendCurrent: 'Actual',
      legendHint: 'Pasa el ratón sobre cada punto para ver el detalle',
      noAmortizationsTitle: 'Sin amortizaciones todavía',
      noAmortizationsBody: 'Cuando apliques una amortización parcial aparecerá aquí su detalle.',
    },
    amortization: {
      reduceTerm: 'Reduce plazo',
      reducePayment: 'Reduce cuota',
      latestBadge: '⭐ Última',
      undoTitle: 'Deshacer esta amortización',
      undoBtn: 'Deshacer',
      feeSuffix: 'comisión',
      paymentLabel: 'Cuota',
      paymentsLabel: 'Cuotas',
      interestSaved: '💡 Ahorrados ~{{amount}} en intereses',
      paidFrom: '🏦 Desde {{name}}',
      totalAmortized: 'Total amortizado: {{amount}}',
      totalFees: 'Comisiones: {{amount}}',
      totalSaved: '💰 Ahorro total estimado: {{amount}}',
      amortizedAmount: '{{amount}} amortizado',
      savedAmount: '~{{amount}} ahorrados',
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
    frequencies: {
      monthly: 'Mensual',
      bimonthly: 'Bimestral',
      quarterly: 'Trimestral',
      semiannual: 'Semestral',
      biannual: 'Semestral',
      annual: 'Anual',
      weekly: 'Semanal',
      biweekly: 'Quincenal',
      once: 'Una vez',
    },
    list: {
      typeIncome: '📈 Ingreso',
      typeLoan: '🏠 Cuota préstamo',
      typeTransfer: '↔ Traspaso',
      typeExpense: '📉 Gasto',
      paused: 'Pausada',
      alertsDisabledTitle: 'Avisos desactivados',
      alertsDisabledBadge: 'Sin avisos',
      until: 'hasta',
      recurringBadge: '🔄 Automático · día {{day}}',
      lastApplied: '✅ Aplicado: {{date}}',
      nextCharge: '⚠️ Próximo cargo: {{amount}}',
      perMonthApprox: '≈ {{amount}}/mes',
      startDate: 'Fecha inicio',
      endDate: 'Fecha fin',
      noEndDate: 'Sin límite',
      frequency: 'Frecuencia',
      currency: 'Divisa',
      from: 'Desde',
      loanDest: 'Préstamo destino',
      to: 'Hasta',
      account: 'Cuenta',
      category: 'Categoría',
      notes: 'Notas',
      pauseAction: '⏸ Pausar proyección',
      reactivateAction: '▶️ Reactivar proyección',
      viewDetails: 'Ver detalles',
      duplicate: 'Duplicar',
      edit: 'Editar',
      delete: 'Eliminar',
    },
    analysis: {
      emptyTitle: 'Aún no hay proyecciones para analizar',
      emptyBody: 'Crea algunas proyecciones primero y aquí verás el análisis completo.',
      goToList: 'Ir a la lista →',
      overviewLabel: 'Proyección global',
      overviewTitle: 'Previsión a 6 meses — Todas las cuentas',
      tableMonth: 'Mes',
      tableIncome: 'Ingresos',
      tableExpense: 'Gastos',
      tableNet: 'Neto',
      tableBalance: 'Saldo est.',
      distributionLabel: 'Distribución',
      distributionTitle: 'Gastos proyectados por categoría',
      perMonth: '/mes',
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
