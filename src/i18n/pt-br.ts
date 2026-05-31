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
  goals: {
    header: {
      section: 'Poupança',
      emptySubtitle: 'Crie seu primeiro objetivo de poupança',
      newGoal: 'Novo objetivo',
      new: 'Novo',
      stickyTitle: '🎯 Objetivos — Progresso',
    },
    stats: {
      total: 'Total de objetivos',
      completed: 'Concluídos',
      totalSaved: 'Total poupado',
    },
    empty: {
      title: 'Nenhum objetivo ainda',
      body: 'Crie seu primeiro objetivo para começar a poupar com propósito.',
      createBtn: 'Criar objetivo',
    },
    coach: {
      title: 'Comece a poupar!',
      description:
        'Toque aqui para criar seu primeiro objetivo. O app calculará automaticamente quanto você precisa poupar por mês para chegar lá a tempo.',
    },
    modal: {
      newTitle: '🎯 Novo objetivo',
      editTitle: '✏️ Editar objetivo',
    },
    card: {
      remaining: 'Falta',
      monthsLeft: 'Meses restantes',
      noLimit: 'Sem limite',
      monthlyNeeded: 'Necessário/mês',
    },
    errors: {
      nameRequired: 'O nome é obrigatório',
      amountRequired: 'Insira um valor válido',
      categoryRequired: 'Selecione uma categoria',
      accountRequired: 'Selecione uma conta',
    },
    print: {
      title: 'Objetivos de poupança',
    },
  },

  dashboard: {
    print: { title: 'Resumo' },
    stickyTitle: '🏠 Resumo — Situação financeira',
    kpi: {
      wealth: 'Patrimônio',
      incomeMonth: 'Receitas (mês)',
      expenseMonth: 'Despesas (mês)',
      netMonth: 'Líquido (mês)',
      incomeShort: 'REC./MÊS',
      expenseShort: 'DES./MÊS',
      netShort: 'LÍQ./MÊS',
    },
    credit: {
      critical: 'Crítico',
      high: 'Alto',
      moderate: 'Moderado',
      excellent: 'Excelente',
    },
    coach: {
      title: 'Aqui está seu dinheiro real',
      description:
        'Este número é atualizado automaticamente cada vez que você registra uma transação. Você nunca terá que calcular nada.',
    },
  },

  accounts: {
    print: { title: 'Minhas Contas', filename: 'Minhas_Contas' },
    newAccount: 'Nova conta',
    tab: 'Contas',
    coach: {
      title: 'Comece por aqui',
      description:
        'Adicione sua primeira conta com o saldo que você tem hoje. O app fará o acompanhamento a partir desse momento.',
    },
    toast: {
      loanCreated:
        'Empréstimo criado. Uma projeção mensal para a parcela foi gerada automaticamente.',
      accountCreated: 'Conta criada com sucesso',
      accountUpdated:
        'Conta atualizada. As transações anteriores ao novo saldo base foram reconhecidas automaticamente.',
    },
  },

  projections: {
    print: { title: 'Projeções' },
    stats: {
      total: 'Total de projeções',
      incomePerMonth: 'Receita/mês',
      expensePerMonth: 'Despesas/mês',
      netPerMonth: 'Líquido/mês',
    },
    empty: {
      noProjections: 'Você ainda não tem projeções',
      noResults: 'Nenhuma projeção corresponde aos filtros',
      bodyDefault: 'Adicione receitas e despesas recorrentes para ver a projeção das suas finanças.',
      bodyFiltered: 'Tente mudar os filtros.',
    },
    coach: {
      title: 'Sua previsão financeira',
      description: 'Defina aqui seu salário e despesas fixas. O app calculará se você chegará ao fim do mês antes que isso aconteça.',
    },
  },

  realExpenses: {
    print: { title: 'Transações Reais', filename: 'Transacoes_Reais' },
    stats: {
      totalIncome: 'Total de receitas',
      totalExpense: 'Total de despesas',
      realBalance: 'Saldo real',
      income: 'Receitas',
      expense: 'Despesas',
      balance: 'Saldo',
    },
    periods: {
      thisMonth: 'Este mês',
      lastMonth: 'Mês anterior',
      last3: 'Últimos 3 meses',
      last6: 'Últimos 6 meses',
      thisYear: 'Este ano',
    },
    filters: {
      typeIncome: 'Tipo: Receitas',
      typeExpense: 'Tipo: Despesas',
    },
    notes: { fromAlert: 'Gerado a partir de alerta de vencimento' },
    coach: {
      title: 'Registre suas transações',
      description: "Adicione-as uma a uma com '+ Nova transação', ou importe todas de uma vez pelo CSV do seu banco (Santander, BBVA, CaixaBank, ING, Revolut...).",
    },
  },

  transfers: {
    print: { title: 'Transferências entre contas' },
    newTransfer: 'Nova transferência',
    defaultDescription: 'Transferência entre contas',
    subtitle: 'Mova dinheiro entre suas contas sem afetar o patrimônio',
    stats: {
      total: 'Total de transferências',
      volume: 'Volume total movido',
      volumeShort: 'Volume movido',
      effect: 'Efeito no patrimônio',
      neutral: 'Neutro',
    },
    errors: {
      fromAccount: 'Selecione a conta de origem',
      toAccount: 'Selecione a conta de destino',
      sameAccount: 'As contas devem ser diferentes',
      amount: 'Insira um valor válido',
      description: 'A descrição é obrigatória',
    },
    form: {
      fromAccount: 'Conta de origem *',
      toAccount: 'Conta de destino *',
      amount: 'Valor *',
      currency: 'Moeda',
      date: 'Data da transferência',
      description: 'Descrição *',
      notes: 'Notas (opcional)',
    },
  },

  categories: {
    empty: 'Use o botão "Nova categoria" para adicionar uma.',
    tabs: { income: 'Receitas', expense: 'Despesas' },
    noCategory: 'Sem categoria',
    typeIncome: 'Receita',
    typeExpense: 'Despesa',
    form: {
      category: 'Categoria',
      keywords: 'Palavras-chave (separadas por vírgulas)',
      newTitle: 'Nova categoria',
      editTitle: 'Editar categoria',
      name: 'Nome',
      type: 'Tipo',
      color: 'Cor',
      newCategoryTooltip: 'Criar nova categoria',
    },
  },

  common: {
    save: 'Salvar',
    saveChanges: 'Salvar alterações',
    saveExpense: 'Salvar transação',
    createAccount: 'Criar conta',
    createProjection: 'Criar projeção',
    viewList: 'Lista',
    viewAnalysis: 'Análise',
    all: 'Todos',
    new: 'Novo',
    saveGoal: 'Salvar objetivo',
    saveFormat: 'Salvar formato',
    saveNewPassword: 'Salvar nova senha',
    registerPayment: 'Registrar pagamento',
    saveRule: 'Salvar regra',
    updateRule: 'Atualizar regra',
    cancel: 'Cancelar',
    irreversible: 'Esta ação não pode ser desfeita.',
    delete: 'Excluir',
    close: 'Fechar',
  },
} as const;

export type PtBr = typeof ptBr;
