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
  common: {
    save: 'Guardar',
    saveChanges: 'Guardar cambios',
    saveExpense: 'Guardar movimiento',
    createAccount: 'Crear cuenta',
    createProjection: 'Crear proyección',
    cancel: 'Cancelar',
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
