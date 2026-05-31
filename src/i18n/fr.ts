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

  common: {
    save: 'Enregistrer',
    saveChanges: 'Enregistrer les modifications',
    saveExpense: 'Enregistrer la transaction',
    createAccount: 'Créer un compte',
    createProjection: 'Créer une projection',
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
