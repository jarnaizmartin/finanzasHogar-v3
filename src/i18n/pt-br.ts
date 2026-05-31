// ─── Dictionary PT-BR (Brazilian Portuguese) ─────────────────────────────────
//
// Must mirror the structure of es.ts exactly.
// Fase 3: covers lib/ strings only. Component strings added incrementally.
// ─────────────────────────────────────────────────────────────────────────────

export const ptBr = {
  loans: {
    types: {
      mortgage: 'Hipoteca',
      personal: 'Empréstimo pessoal',
      default: 'Empréstimo',
    },
    errors: {
      amountPositive: 'O valor deve ser maior que 0',
      insufficientPayment:
        'Com esta amortização a prestação atual não cobre os juros do capital restante. ' +
        'Tente amortizar mais ou mude para o modo "Reduzir prestação".',
    },
  },

  creditCards: {
    healthScore: {
      levels: {
        critical: 'Crítico',
        high: 'Alto risco',
        moderate: 'Moderado',
        excellent: 'Excelente',
      },
      overall: {
        excellent: {
          label: 'Excelente',
          summary: 'Você está indo muito bem! Mantenha esses hábitos financeiros.',
        },
        good: {
          label: 'Bom',
          summary: 'Você está no caminho certo. Pequenos ajustes levarão você à excelência.',
        },
        fair: {
          label: 'Melhorável',
          summary:
            'Há margem para melhorar. Revise os fatores em vermelho para aumentar sua pontuação.',
        },
        poor: {
          label: 'Crítico',
          summary:
            'Sua saúde financeira está em risco. É hora de agir para evitar problemas maiores.',
        },
      },
      factors: {
        utilization: { label: 'Utilização do crédito' },
        trend: {
          label: 'Tendência recente',
          noData: 'Ainda não há dados suficientes para avaliar a tendência',
          noDebt: 'Sem dívida! Você está na melhor situação possível',
        },
        paymentMargin: {
          label: 'Margem até o próximo pagamento',
          noDebt: 'Sem dívida pendente',
          notConfigured: 'Dia de pagamento não configurado',
        },
        interestCost: {
          label: 'Custo em juros',
          noDebt: 'Sem dívida, sem juros',
          notConfigured: 'Taxa de juros não configurada',
        },
        consistency: {
          label: 'Consistência de pagamentos',
          neverHadDebt: 'Nunca teve dívida · Perfeito',
          noHistory: 'Sem histórico ainda',
        },
      },
    },
  },
  common: {
    save: 'Salvar',
    saveChanges: 'Salvar alterações',
    saveExpense: 'Salvar transação',
    createAccount: 'Criar conta',
    createProjection: 'Criar projeção',
    saveGoal: 'Salvar objetivo',
    registerPayment: 'Registrar pagamento',
    saveRule: 'Salvar regra',
    updateRule: 'Atualizar regra',
    cancel: 'Cancelar',
    delete: 'Excluir',
    close: 'Fechar',
  },
} as const;

export type PtBr = typeof ptBr;
