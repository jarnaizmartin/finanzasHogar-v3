// src/lib/helpCenterData.ts
//
// Tipos y datos del Centro de Ayuda.
// Extraído de HelpCenter.tsx (refactor/help-center, commit 1/6).
// F4-O: contenido externalizado a namespace `help` vía i18next.t() directo.
//
// Patrón: lib pura sin React → import i18next, helper local t().

import i18next from 'i18next';
import {
  Wallet,
  Receipt,
  BarChart2,
  Target,
  TrendingUp,
  Shield,
  Archive,
  ArrowLeftRight,
} from 'lucide-react';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type HelpSection = 'home' | 'manual' | 'faq' | 'shortcuts' | 'getting-started';

export interface ManualSection {
  id: string;
  icon: any;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  content: {
    heading: string;
    text: string;
    tip?: string;
  }[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  tags: string[];
}

export interface FAQCategory {
  id: string;
  emoji: string;
  label: string;
  color: string;
  items: FAQItem[];
}

export interface Shortcut {
  keys: string[];
  description: string;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

const t = (key: string) => i18next.t(key);
const tags = (key: string) =>
  t(key)
    .split(',')
    .map((s) => s.trim());

// ─── Manual ──────────────────────────────────────────────────────────────────

export function getManualSections(): ManualSection[] {
  return [
    {
      id: 'accounts',
      icon: Wallet,
      emoji: '🏦',
      color: '#2563eb',
      title: t('help.manual.accounts.title'),
      subtitle: t('help.manual.accounts.subtitle'),
      content: [
        { heading: t('help.manual.accounts.whatIsAccount.heading'), text: t('help.manual.accounts.whatIsAccount.text') },
        { heading: t('help.manual.accounts.baseVsReal.heading'), text: t('help.manual.accounts.baseVsReal.text'), tip: t('help.manual.accounts.baseVsReal.tip') },
        { heading: t('help.manual.accounts.minAlert.heading'), text: t('help.manual.accounts.minAlert.text') },
        { heading: t('help.manual.accounts.currencyPerAccount.heading'), text: t('help.manual.accounts.currencyPerAccount.text') },
        { heading: t('help.manual.accounts.updateBalance.heading'), text: t('help.manual.accounts.updateBalance.text'), tip: t('help.manual.accounts.updateBalance.tip') },
      ],
    },
    {
      id: 'real',
      icon: Receipt,
      emoji: '🧾',
      color: '#dc2626',
      title: t('help.manual.real.title'),
      subtitle: t('help.manual.real.subtitle'),
      content: [
        { heading: t('help.manual.real.whatAreReal.heading'), text: t('help.manual.real.whatAreReal.text') },
        { heading: t('help.manual.real.dateTypes.heading'), text: t('help.manual.real.dateTypes.text') },
        { heading: t('help.manual.real.importCsv.heading'), text: t('help.manual.real.importCsv.text'), tip: t('help.manual.real.importCsv.tip') },
        { heading: t('help.manual.real.advancedFilters.heading'), text: t('help.manual.real.advancedFilters.text') },
        { heading: t('help.manual.real.recurrentAuto.heading'), text: t('help.manual.real.recurrentAuto.text'), tip: t('help.manual.real.recurrentAuto.tip') },
      ],
    },
    {
      id: 'projections',
      icon: BarChart2,
      emoji: '📈',
      color: '#7c3aed',
      title: t('help.manual.projections.title'),
      subtitle: t('help.manual.projections.subtitle'),
      content: [
        { heading: t('help.manual.projections.whatIsProjection.heading'), text: t('help.manual.projections.whatIsProjection.text') },
        { heading: t('help.manual.projections.frequencies.heading'), text: t('help.manual.projections.frequencies.text') },
        { heading: t('help.manual.projections.monthlyAdjust.heading'), text: t('help.manual.projections.monthlyAdjust.text'), tip: t('help.manual.projections.monthlyAdjust.tip') },
        { heading: t('help.manual.projections.confirmedFixed.heading'), text: t('help.manual.projections.confirmedFixed.text') },
        { heading: t('help.manual.projections.effectOnBalance.heading'), text: t('help.manual.projections.effectOnBalance.text') },
      ],
    },
    {
      id: 'forecast',
      icon: TrendingUp,
      emoji: '🔮',
      color: '#0891b2',
      title: t('help.manual.forecast.title'),
      subtitle: t('help.manual.forecast.subtitle'),
      content: [
        { heading: t('help.manual.forecast.howItWorks.heading'), text: t('help.manual.forecast.howItWorks.text') },
        { heading: t('help.manual.forecast.chartInterpretation.heading'), text: t('help.manual.forecast.chartInterpretation.text') },
        { heading: t('help.manual.forecast.limitations.heading'), text: t('help.manual.forecast.limitations.text'), tip: t('help.manual.forecast.limitations.tip') },
      ],
    },
    {
      id: 'goals',
      icon: Target,
      emoji: '🎯',
      color: '#16a34a',
      title: t('help.manual.goals.title'),
      subtitle: t('help.manual.goals.subtitle'),
      content: [
        { heading: t('help.manual.goals.goalTypes.heading'), text: t('help.manual.goals.goalTypes.text') },
        { heading: t('help.manual.goals.autoMode.heading'), text: t('help.manual.goals.autoMode.text'), tip: t('help.manual.goals.autoMode.tip') },
        { heading: t('help.manual.goals.trackingMetrics.heading'), text: t('help.manual.goals.trackingMetrics.text') },
        { heading: t('help.manual.goals.goalAlerts.heading'), text: t('help.manual.goals.goalAlerts.text') },
      ],
    },
    {
      id: 'security',
      icon: Shield,
      emoji: '🔐',
      color: '#f59e0b',
      title: t('help.manual.security.title'),
      subtitle: t('help.manual.security.subtitle'),
      content: [
        { heading: t('help.manual.security.authMethods.heading'), text: t('help.manual.security.authMethods.text') },
        { heading: t('help.manual.security.recoveryPhrase.heading'), text: t('help.manual.security.recoveryPhrase.text'), tip: t('help.manual.security.recoveryPhrase.tip') },
        { heading: t('help.manual.security.recoveryFile.heading'), text: t('help.manual.security.recoveryFile.text') },
        { heading: t('help.manual.security.totpGrace.heading'), text: t('help.manual.security.totpGrace.text') },
        { heading: t('help.manual.security.inactivityLock.heading'), text: t('help.manual.security.inactivityLock.text') },
      ],
    },
    {
      id: 'backup',
      icon: Archive,
      emoji: '💾',
      color: '#8b5cf6',
      title: t('help.manual.backup.title'),
      subtitle: t('help.manual.backup.subtitle'),
      content: [
        { heading: t('help.manual.backup.internalVsFile.heading'), text: t('help.manual.backup.internalVsFile.text'), tip: t('help.manual.backup.internalVsFile.tip') },
        { heading: t('help.manual.backup.autoBackup.heading'), text: t('help.manual.backup.autoBackup.text') },
        { heading: t('help.manual.backup.restore.heading'), text: t('help.manual.backup.restore.text') },
        { heading: t('help.manual.backup.preDeletion.heading'), text: t('help.manual.backup.preDeletion.text'), tip: t('help.manual.backup.preDeletion.tip') },
      ],
    },
    {
      id: 'currencies',
      icon: ArrowLeftRight,
      emoji: '💱',
      color: '#0d9488',
      title: t('help.manual.currencies.title'),
      subtitle: t('help.manual.currencies.subtitle'),
      content: [
        { heading: t('help.manual.currencies.baseVsDisplay.heading'), text: t('help.manual.currencies.baseVsDisplay.text') },
        { heading: t('help.manual.currencies.currencyPerAccount.heading'), text: t('help.manual.currencies.currencyPerAccount.text') },
        { heading: t('help.manual.currencies.exchangeRates.heading'), text: t('help.manual.currencies.exchangeRates.text'), tip: t('help.manual.currencies.exchangeRates.tip') },
      ],
    },
  ];
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

export function getFaqCategories(): FAQCategory[] {
  return [
    {
      id: 'general',
      emoji: '⚙️',
      color: '#2563eb',
      label: t('help.faq.general.label'),
      items: [
        { id: 'g1', question: t('help.faq.general.g1.question'), answer: t('help.faq.general.g1.answer'), tags: tags('help.faq.general.g1.tags') },
        { id: 'g2', question: t('help.faq.general.g2.question'), answer: t('help.faq.general.g2.answer'), tags: tags('help.faq.general.g2.tags') },
        { id: 'g3', question: t('help.faq.general.g3.question'), answer: t('help.faq.general.g3.answer'), tags: tags('help.faq.general.g3.tags') },
        { id: 'g4', question: t('help.faq.general.g4.question'), answer: t('help.faq.general.g4.answer'), tags: tags('help.faq.general.g4.tags') },
        { id: 'g5', question: t('help.faq.general.g5.question'), answer: t('help.faq.general.g5.answer'), tags: tags('help.faq.general.g5.tags') },
        { id: 'g6', question: t('help.faq.general.g6.question'), answer: t('help.faq.general.g6.answer'), tags: tags('help.faq.general.g6.tags') },
        { id: 'g7', question: t('help.faq.general.g7.question'), answer: t('help.faq.general.g7.answer'), tags: tags('help.faq.general.g7.tags') },
        { id: 'g8', question: t('help.faq.general.g8.question'), answer: t('help.faq.general.g8.answer'), tags: tags('help.faq.general.g8.tags') },
      ],
    },
    {
      id: 'accounts',
      emoji: '🏦',
      color: '#2563eb',
      label: t('help.faq.accounts.label'),
      items: [
        { id: 'a1', question: t('help.faq.accounts.a1.question'), answer: t('help.faq.accounts.a1.answer'), tags: tags('help.faq.accounts.a1.tags') },
        { id: 'a2', question: t('help.faq.accounts.a2.question'), answer: t('help.faq.accounts.a2.answer'), tags: tags('help.faq.accounts.a2.tags') },
        { id: 'a3', question: t('help.faq.accounts.a3.question'), answer: t('help.faq.accounts.a3.answer'), tags: tags('help.faq.accounts.a3.tags') },
        { id: 'a4', question: t('help.faq.accounts.a4.question'), answer: t('help.faq.accounts.a4.answer'), tags: tags('help.faq.accounts.a4.tags') },
        { id: 'a5', question: t('help.faq.accounts.a5.question'), answer: t('help.faq.accounts.a5.answer'), tags: tags('help.faq.accounts.a5.tags') },
      ],
    },
    {
      id: 'expenses',
      emoji: '🧾',
      color: '#dc2626',
      label: t('help.faq.expenses.label'),
      items: [
        { id: 'e1', question: t('help.faq.expenses.e1.question'), answer: t('help.faq.expenses.e1.answer'), tags: tags('help.faq.expenses.e1.tags') },
        { id: 'e2', question: t('help.faq.expenses.e2.question'), answer: t('help.faq.expenses.e2.answer'), tags: tags('help.faq.expenses.e2.tags') },
        { id: 'e3', question: t('help.faq.expenses.e3.question'), answer: t('help.faq.expenses.e3.answer'), tags: tags('help.faq.expenses.e3.tags') },
        { id: 'e4', question: t('help.faq.expenses.e4.question'), answer: t('help.faq.expenses.e4.answer'), tags: tags('help.faq.expenses.e4.tags') },
        { id: 'e5', question: t('help.faq.expenses.e5.question'), answer: t('help.faq.expenses.e5.answer'), tags: tags('help.faq.expenses.e5.tags') },
        { id: 'e6', question: t('help.faq.expenses.e6.question'), answer: t('help.faq.expenses.e6.answer'), tags: tags('help.faq.expenses.e6.tags') },
      ],
    },
    {
      id: 'projections',
      emoji: '📈',
      color: '#7c3aed',
      label: t('help.faq.projections.label'),
      items: [
        { id: 'p1', question: t('help.faq.projections.p1.question'), answer: t('help.faq.projections.p1.answer'), tags: tags('help.faq.projections.p1.tags') },
        { id: 'p2', question: t('help.faq.projections.p2.question'), answer: t('help.faq.projections.p2.answer'), tags: tags('help.faq.projections.p2.tags') },
        { id: 'p3', question: t('help.faq.projections.p3.question'), answer: t('help.faq.projections.p3.answer'), tags: tags('help.faq.projections.p3.tags') },
        { id: 'p4', question: t('help.faq.projections.p4.question'), answer: t('help.faq.projections.p4.answer'), tags: tags('help.faq.projections.p4.tags') },
        { id: 'p5', question: t('help.faq.projections.p5.question'), answer: t('help.faq.projections.p5.answer'), tags: tags('help.faq.projections.p5.tags') },
      ],
    },
    {
      id: 'goals',
      emoji: '🎯',
      color: '#16a34a',
      label: t('help.faq.goals.label'),
      items: [
        { id: 'ob1', question: t('help.faq.goals.ob1.question'), answer: t('help.faq.goals.ob1.answer'), tags: tags('help.faq.goals.ob1.tags') },
        { id: 'ob2', question: t('help.faq.goals.ob2.question'), answer: t('help.faq.goals.ob2.answer'), tags: tags('help.faq.goals.ob2.tags') },
        { id: 'ob3', question: t('help.faq.goals.ob3.question'), answer: t('help.faq.goals.ob3.answer'), tags: tags('help.faq.goals.ob3.tags') },
        { id: 'ob4', question: t('help.faq.goals.ob4.question'), answer: t('help.faq.goals.ob4.answer'), tags: tags('help.faq.goals.ob4.tags') },
      ],
    },
    {
      id: 'alerts',
      emoji: '🔔',
      color: '#d97706',
      label: t('help.faq.alerts.label'),
      items: [
        { id: 'al1', question: t('help.faq.alerts.al1.question'), answer: t('help.faq.alerts.al1.answer'), tags: tags('help.faq.alerts.al1.tags') },
        { id: 'al2', question: t('help.faq.alerts.al2.question'), answer: t('help.faq.alerts.al2.answer'), tags: tags('help.faq.alerts.al2.tags') },
        { id: 'al3', question: t('help.faq.alerts.al3.question'), answer: t('help.faq.alerts.al3.answer'), tags: tags('help.faq.alerts.al3.tags') },
      ],
    },
    {
      id: 'security',
      emoji: '🔐',
      color: '#f59e0b',
      label: t('help.faq.security.label'),
      items: [
        { id: 's1', question: t('help.faq.security.s1.question'), answer: t('help.faq.security.s1.answer'), tags: tags('help.faq.security.s1.tags') },
        { id: 's2', question: t('help.faq.security.s2.question'), answer: t('help.faq.security.s2.answer'), tags: tags('help.faq.security.s2.tags') },
        { id: 's3', question: t('help.faq.security.s3.question'), answer: t('help.faq.security.s3.answer'), tags: tags('help.faq.security.s3.tags') },
        { id: 's4', question: t('help.faq.security.s4.question'), answer: t('help.faq.security.s4.answer'), tags: tags('help.faq.security.s4.tags') },
        { id: 's5', question: t('help.faq.security.s5.question'), answer: t('help.faq.security.s5.answer'), tags: tags('help.faq.security.s5.tags') },
        { id: 's6', question: t('help.faq.security.s6.question'), answer: t('help.faq.security.s6.answer'), tags: tags('help.faq.security.s6.tags') },
      ],
    },
    {
      id: 'backup',
      emoji: '💾',
      color: '#8b5cf6',
      label: t('help.faq.backup.label'),
      items: [
        { id: 'b1', question: t('help.faq.backup.b1.question'), answer: t('help.faq.backup.b1.answer'), tags: tags('help.faq.backup.b1.tags') },
        { id: 'b2', question: t('help.faq.backup.b2.question'), answer: t('help.faq.backup.b2.answer'), tags: tags('help.faq.backup.b2.tags') },
        { id: 'b3', question: t('help.faq.backup.b3.question'), answer: t('help.faq.backup.b3.answer'), tags: tags('help.faq.backup.b3.tags') },
        { id: 'b4', question: t('help.faq.backup.b4.question'), answer: t('help.faq.backup.b4.answer'), tags: tags('help.faq.backup.b4.tags') },
        { id: 'b5', question: t('help.faq.backup.b5.question'), answer: t('help.faq.backup.b5.answer'), tags: tags('help.faq.backup.b5.tags') },
      ],
    },
    {
      id: 'import',
      emoji: '🏦',
      color: '#0891b2',
      label: t('help.faq.import.label'),
      items: [
        { id: 'i1', question: t('help.faq.import.i1.question'), answer: t('help.faq.import.i1.answer'), tags: tags('help.faq.import.i1.tags') },
        { id: 'i2', question: t('help.faq.import.i2.question'), answer: t('help.faq.import.i2.answer'), tags: tags('help.faq.import.i2.tags') },
        { id: 'i3', question: t('help.faq.import.i3.question'), answer: t('help.faq.import.i3.answer'), tags: tags('help.faq.import.i3.tags') },
        { id: 'i4', question: t('help.faq.import.i4.question'), answer: t('help.faq.import.i4.answer'), tags: tags('help.faq.import.i4.tags') },
      ],
    },
  ];
}

// ─── Atajos de teclado ────────────────────────────────────────────────────────

export function getShortcuts(): { category: string; items: Shortcut[] }[] {
  return [
    {
      category: t('help.shortcuts.generalCat'),
      items: [
        { keys: ['Esc'], description: t('help.shortcuts.closeModal') },
        { keys: ['Enter'], description: t('help.shortcuts.confirmAction') },
      ],
    },
    {
      category: t('help.shortcuts.securityCat'),
      items: [
        { keys: ['Enter'], description: t('help.shortcuts.unlockScreen') },
      ],
    },
    {
      category: t('help.shortcuts.printCat'),
      items: [
        { keys: ['Ctrl', 'P'], description: t('help.shortcuts.printPdf') },
      ],
    },
    {
      category: t('help.shortcuts.navCat'),
      items: [
        { keys: ['Tab'], description: t('help.shortcuts.tabForward') },
        { keys: ['Shift', 'Tab'], description: t('help.shortcuts.tabBack') },
      ],
    },
  ];
}
