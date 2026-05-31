// ─── Dictionary FR (French) ───────────────────────────────────────────────────
//
// Must mirror the structure of es.ts exactly.
// Fase 3: covers lib/ strings only. Component strings added incrementally.
// ─────────────────────────────────────────────────────────────────────────────

export const fr = {
  loans: {
    types: {
      mortgage: 'Hypothèque',
      personal: 'Prêt personnel',
      default: 'Prêt',
    },
    errors: {
      amountPositive: 'Le montant doit être supérieur à 0',
      insufficientPayment:
        "Avec cet amortissement, la mensualité actuelle ne couvre pas les intérêts du capital restant. " +
        'Essayez d\'amortir davantage ou passez au mode "Réduire la mensualité".',
    },
  },

  creditCards: {
    healthScore: {
      levels: {
        critical: 'Critique',
        high: 'Risque élevé',
        moderate: 'Modéré',
        excellent: 'Excellent',
      },
      overall: {
        excellent: {
          label: 'Excellent',
          summary: 'Vous vous en sortez très bien ! Maintenez ces habitudes financières.',
        },
        good: {
          label: 'Bon',
          summary:
            "Vous êtes sur la bonne voie. De petits ajustements vous mèneront à l'excellence.",
        },
        fair: {
          label: 'Améliorable',
          summary:
            "Il y a une marge d'amélioration. Vérifiez les facteurs en rouge pour améliorer votre score.",
        },
        poor: {
          label: 'Critique',
          summary:
            "Votre santé financière est en danger. Il est temps d'agir pour éviter de plus grands problèmes.",
        },
      },
      factors: {
        utilization: { label: 'Utilisation du crédit' },
        trend: {
          label: 'Tendance récente',
          noData: "Pas encore assez de données pour évaluer la tendance",
          noDebt: 'Aucune dette ! Vous êtes dans la meilleure situation possible',
        },
        paymentMargin: {
          label: "Marge jusqu'au prochain paiement",
          noDebt: 'Aucune dette en cours',
          notConfigured: 'Jour de paiement non configuré',
        },
        interestCost: {
          label: 'Coût en intérêts',
          noDebt: 'Aucune dette, aucun intérêt',
          notConfigured: 'Taux annuel non configuré',
        },
        consistency: {
          label: 'Régularité des paiements',
          neverHadDebt: 'Jamais eu de dettes · Parfait',
          noHistory: "Pas encore d'historique",
        },
      },
    },
  },
  goals: {
    header: {
      section: 'Épargne',
      emptySubtitle: "Créez votre premier objectif d'épargne",
      newGoal: 'Nouvel objectif',
      new: 'Nouveau',
      stickyTitle: '🎯 Objectifs — Progression',
    },
    stats: {
      total: 'Total objectifs',
      completed: 'Complétés',
      totalSaved: 'Total épargné',
    },
    empty: {
      title: "Pas encore d'objectifs",
      body: "Créez votre premier objectif pour commencer à épargner avec intention.",
      createBtn: 'Créer un objectif',
    },
    coach: {
      title: 'Commencez à épargner !',
      description:
        "Appuyez ici pour créer votre premier objectif. L'app calculera automatiquement combien vous devez épargner chaque mois pour l'atteindre à temps.",
    },
    modal: {
      newTitle: '🎯 Nouvel objectif',
      editTitle: "✏️ Modifier l'objectif",
    },
    card: {
      remaining: 'Reste',
      monthsLeft: 'Mois restants',
      noLimit: 'Sans limite',
      monthlyNeeded: 'Nécessaire/mois',
    },
    errors: {
      nameRequired: 'Le nom est obligatoire',
      amountRequired: 'Saisissez un montant valide',
      categoryRequired: 'Sélectionnez une catégorie',
      accountRequired: 'Sélectionnez un compte',
    },
    print: {
      title: "Objectifs d'épargne",
    },
  },

  dashboard: {
    print: { title: 'Résumé' },
    stickyTitle: '🏠 Résumé — Situation financière',
    kpi: {
      wealth: 'Patrimoine',
      incomeMonth: 'Revenus (mois)',
      expenseMonth: 'Dépenses (mois)',
      netMonth: 'Net (mois)',
      incomeShort: 'REV./MOIS',
      expenseShort: 'DÉP./MOIS',
      netShort: 'NET/MOIS',
    },
    credit: {
      critical: 'Critique',
      high: 'Élevé',
      moderate: 'Modéré',
      excellent: 'Excellent',
    },
    coach: {
      title: 'Voici votre argent réel',
      description:
        "Ce nombre se met à jour automatiquement chaque fois que vous enregistrez une transaction. Vous n'aurez jamais à calculer quoi que ce soit.",
    },
  },

  accounts: {
    print: { title: 'Mes Comptes', filename: 'Mes_Comptes' },
    newAccount: 'Nouveau compte',
    tab: 'Comptes',
    coach: {
      title: 'Commencez ici',
      description:
        "Ajoutez votre premier compte avec le solde que vous avez aujourd'hui. L'app fera le suivi à partir de ce moment.",
    },
    toast: {
      loanCreated:
        'Prêt créé. Une projection mensuelle pour la mensualité a été générée automatiquement.',
      accountCreated: 'Compte créé avec succès',
      accountUpdated:
        'Compte mis à jour. Les transactions antérieures au nouveau solde de base ont été reconnues automatiquement.',
    },
  },

  projections: {
    print: { title: 'Projections' },
    stats: {
      total: 'Total projections',
      incomePerMonth: 'Revenus/mois',
      expensePerMonth: 'Dépenses/mois',
      netPerMonth: 'Net/mois',
    },
    empty: {
      noProjections: "Vous n'avez pas encore de projections",
      noResults: 'Aucune projection ne correspond aux filtres',
      bodyDefault: 'Ajoutez des revenus et dépenses récurrents pour voir la projection de vos finances.',
      bodyFiltered: 'Essayez de modifier les filtres.',
    },
    coach: {
      title: 'Votre prévision financière',
      description: "Définissez ici votre salaire et vos charges fixes. L'app calculera si vous arriverez à la fin du mois avant que cela ne se produise.",
    },
  },

  realExpenses: {
    print: { title: 'Transactions Réelles', filename: 'Transactions_Reelles' },
    stats: {
      totalIncome: 'Total revenus',
      totalExpense: 'Total dépenses',
      realBalance: 'Solde réel',
      income: 'Revenus',
      expense: 'Dépenses',
      balance: 'Solde',
    },
    periods: {
      thisMonth: 'Ce mois-ci',
      lastMonth: 'Mois précédent',
      last3: '3 derniers mois',
      last6: '6 derniers mois',
      thisYear: 'Cette année',
    },
    filters: {
      typeIncome: 'Type : Revenus',
      typeExpense: 'Type : Dépenses',
    },
    notes: { fromAlert: "Généré depuis une alerte d'échéance" },
    coach: {
      title: 'Enregistrez vos transactions',
      description: "Ajoutez-les une par une avec '+ Nouvelle transaction', ou importez-les toutes depuis le CSV de votre banque (Santander, BBVA, CaixaBank, ING, Revolut...).",
    },
  },

  transfers: {
    print: { title: 'Virements entre comptes' },
    newTransfer: 'Nouveau virement',
    defaultDescription: 'Virement entre comptes',
    subtitle: "Déplacez de l'argent entre vos comptes sans affecter le patrimoine",
    stats: {
      total: 'Total virements',
      volume: 'Volume total déplacé',
      volumeShort: 'Volume déplacé',
      effect: 'Effet sur le patrimoine',
      neutral: 'Neutre',
    },
    errors: {
      fromAccount: 'Sélectionnez le compte source',
      toAccount: 'Sélectionnez le compte de destination',
      sameAccount: 'Les comptes doivent être différents',
      amount: 'Saisissez un montant valide',
      description: 'La description est obligatoire',
    },
    form: {
      fromAccount: 'Compte source *',
      toAccount: 'Compte de destination *',
      amount: 'Montant *',
      currency: 'Devise',
      date: 'Date du virement',
      description: 'Description *',
      notes: 'Notes (facultatif)',
    },
  },

  categories: {
    empty: 'Utilisez le bouton "Nouvelle catégorie" pour en ajouter une.',
    tabs: { income: 'Revenus', expense: 'Dépenses' },
    noCategory: 'Sans catégorie',
    typeIncome: 'Revenu',
    typeExpense: 'Dépense',
    form: {
      category: 'Catégorie',
      keywords: 'Mots-clés (séparés par des virgules)',
      newTitle: 'Nouvelle catégorie',
      editTitle: 'Modifier la catégorie',
      name: 'Nom',
      type: 'Type',
      color: 'Couleur',
      newCategoryTooltip: 'Créer une nouvelle catégorie',
    },
  },

  common: {
    save: 'Enregistrer',
    saveChanges: 'Enregistrer les modifications',
    saveExpense: 'Enregistrer la transaction',
    createAccount: 'Créer un compte',
    createProjection: 'Créer une projection',
    viewList: 'Liste',
    viewAnalysis: 'Analyse',
    all: 'Tous',
    new: 'Nouveau',
    saveGoal: "Enregistrer l'objectif",
    saveFormat: 'Enregistrer le format',
    saveNewPassword: 'Enregistrer le nouveau mot de passe',
    registerPayment: 'Enregistrer le paiement',
    saveRule: 'Enregistrer la règle',
    updateRule: 'Mettre à jour la règle',
    cancel: 'Annuler',
    irreversible: 'Cette action est irréversible.',
    delete: 'Supprimer',
    close: 'Fermer',
  },
} as const;

export type Fr = typeof fr;
