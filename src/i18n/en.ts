// ─── Dictionary EN (English) ─────────────────────────────────────────────────
//
// Must mirror the structure of es.ts exactly.
// Fase 3: covers lib/ strings only. Component strings added incrementally.
// ─────────────────────────────────────────────────────────────────────────────

export const en = {
  loans: {
    types: {
      mortgage: 'Mortgage',
      personal: 'Personal loan',
      default: 'Loan',
    },
    errors: {
      amountPositive: 'Amount must be greater than 0',
      insufficientPayment:
        'With this amortization the current payment does not cover the interest on the remaining balance. ' +
        'Try amortizing more or switch to "Reduce payment" mode.',
    },
  },

  creditCards: {
    healthScore: {
      levels: {
        critical: 'Critical',
        high: 'High risk',
        moderate: 'Moderate',
        excellent: 'Excellent',
      },
      overall: {
        excellent: {
          label: 'Excellent',
          summary: "You're doing great! Keep up these financial habits.",
        },
        good: {
          label: 'Good',
          summary: "You're on the right track. Small adjustments will take you to excellence.",
        },
        fair: {
          label: 'Improvable',
          summary: 'There is room for improvement. Review the red factors to raise your score.',
        },
        poor: {
          label: 'Critical',
          summary:
            'Your financial health is at risk. It is time to act to avoid bigger problems.',
        },
      },
      factors: {
        utilization: { label: 'Credit utilization' },
        trend: {
          label: 'Recent trend',
          noData: 'Not enough data yet to evaluate trend',
          noDebt: 'No debt! You are in the best possible situation',
        },
        paymentMargin: {
          label: 'Margin to next payment',
          noDebt: 'No outstanding debt',
          notConfigured: 'Payment day not configured',
        },
        interestCost: {
          label: 'Interest cost',
          noDebt: 'No debt, no interest',
          notConfigured: 'APR not configured',
        },
        consistency: {
          label: 'Payment consistency',
          neverHadDebt: 'Never had debt · Perfect',
          noHistory: 'No history yet',
        },
      },
    },
  },
} as const;

export type En = typeof en;
