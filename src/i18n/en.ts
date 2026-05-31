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
  goals: {
    header: {
      section: 'Savings',
      emptySubtitle: 'Create your first savings goal',
      newGoal: 'New goal',
      new: 'New',
      stickyTitle: '🎯 Goals — Progress',
    },
    stats: {
      total: 'Total goals',
      completed: 'Completed',
      totalSaved: 'Total saved',
    },
    empty: {
      title: 'No goals yet',
      body: 'Create your first goal to start saving with purpose.',
      createBtn: 'Create goal',
    },
    coach: {
      title: 'Start saving!',
      description:
        'Tap here to create your first goal. The app will automatically calculate how much you need to save each month to reach it on time.',
    },
    modal: {
      newTitle: '🎯 New goal',
      editTitle: '✏️ Edit goal',
    },
    card: {
      remaining: 'Remaining',
      monthsLeft: 'Months left',
      noLimit: 'No limit',
      monthlyNeeded: 'Needed/month',
    },
    errors: {
      nameRequired: 'Name is required',
      amountRequired: 'Enter a valid amount',
      categoryRequired: 'Select a category',
      accountRequired: 'Select an account',
    },
    print: {
      title: 'Savings goals',
    },
  },

  dashboard: {
    print: { title: 'Overview' },
    stickyTitle: '🏠 Overview — Financial Status',
    kpi: {
      wealth: 'Net worth',
      incomeMonth: 'Income (month)',
      expenseMonth: 'Expenses (month)',
      netMonth: 'Net (month)',
      incomeShort: 'INC./MO',
      expenseShort: 'EXP./MO',
      netShort: 'NET/MO',
    },
    credit: {
      critical: 'Critical',
      high: 'High',
      moderate: 'Moderate',
      excellent: 'Excellent',
    },
    coach: {
      title: 'Here is your real money',
      description:
        'This number updates automatically every time you record a transaction. You will never have to calculate anything.',
    },
  },

  accounts: {
    print: { title: 'My Accounts', filename: 'My_Accounts' },
    newAccount: 'New account',
    tab: 'Accounts',
    coach: {
      title: 'Start here',
      description:
        "Add your first account with today's balance. The app will track it from that moment on.",
    },
    toast: {
      loanCreated:
        'Loan created. A monthly projection for the payment has been automatically generated.',
      accountCreated: 'Account created successfully',
      accountUpdated:
        'Account updated. Transactions before the new base balance have been automatically recognized.',
    },
  },

  projections: {
    print: { title: 'Projections' },
    stats: {
      total: 'Total projections',
      incomePerMonth: 'Income/month',
      expensePerMonth: 'Expenses/month',
      netPerMonth: 'Net/month',
    },
    empty: {
      noProjections: 'You have no projections yet',
      noResults: 'No projections match these filters',
      bodyDefault: 'Add recurring income and expenses to see your financial projection.',
      bodyFiltered: 'Try changing the filters.',
    },
    coach: {
      title: 'Your financial forecast',
      description: 'Define your salary and fixed expenses here. The app will calculate whether you can make it to the end of the month before it happens.',
    },
  },

  realExpenses: {
    print: { title: 'Real Transactions', filename: 'Real_Transactions' },
    stats: {
      totalIncome: 'Total income',
      totalExpense: 'Total expenses',
      realBalance: 'Real balance',
      income: 'Income',
      expense: 'Expenses',
      balance: 'Balance',
    },
    periods: {
      thisMonth: 'This month',
      lastMonth: 'Last month',
      last3: 'Last 3 months',
      last6: 'Last 6 months',
      thisYear: 'This year',
    },
    filters: {
      typeIncome: 'Type: Income',
      typeExpense: 'Type: Expenses',
    },
    notes: { fromAlert: 'Generated from due alert' },
    coach: {
      title: 'Record your transactions',
      description: "Add them one by one with '+ New transaction', or import all at once from your bank's CSV (Santander, BBVA, CaixaBank, ING, Revolut...).",
    },
  },

  transfers: {
    print: { title: 'Transfers between accounts' },
    newTransfer: 'New transfer',
    defaultDescription: 'Transfer between accounts',
    subtitle: 'Move money between your accounts without affecting net worth',
    stats: {
      total: 'Total transfers',
      volume: 'Total volume moved',
      volumeShort: 'Volume moved',
      effect: 'Effect on net worth',
      neutral: 'Neutral',
    },
    errors: {
      fromAccount: 'Select source account',
      toAccount: 'Select destination account',
      sameAccount: 'Accounts must be different',
      amount: 'Enter a valid amount',
      description: 'Description is required',
    },
    form: {
      fromAccount: 'Source account *',
      toAccount: 'Destination account *',
      amount: 'Amount *',
      currency: 'Currency',
      date: 'Transfer date',
      description: 'Description *',
      notes: 'Notes (optional)',
    },
  },

  categories: {
    empty: 'Use the "New category" button to add one.',
    tabs: { income: 'Income', expense: 'Expenses' },
    noCategory: 'No category',
    typeIncome: 'Income',
    typeExpense: 'Expense',
    form: {
      category: 'Category',
      keywords: 'Keywords (comma-separated)',
      newTitle: 'New category',
      editTitle: 'Edit category',
      name: 'Name',
      type: 'Type',
      color: 'Color',
      newCategoryTooltip: 'Create new category',
    },
  },

  common: {
    save: 'Save',
    saveChanges: 'Save changes',
    saveExpense: 'Save transaction',
    createAccount: 'Create account',
    createProjection: 'Create projection',
    viewList: 'List',
    viewAnalysis: 'Analysis',
    all: 'All',
    new: 'New',
    saveGoal: 'Save goal',
    saveFormat: 'Save format',
    saveNewPassword: 'Save new password',
    registerPayment: 'Register payment',
    saveRule: 'Save rule',
    updateRule: 'Update rule',
    cancel: 'Cancel',
    irreversible: 'This action cannot be undone.',
    delete: 'Delete',
    close: 'Close',
  },
} as const;

export type En = typeof en;
