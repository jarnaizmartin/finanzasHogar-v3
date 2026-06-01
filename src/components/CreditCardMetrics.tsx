// ─────────────────────────────────────────────────────────────────────────────
// CreditCardMetrics.tsx
// Métricas históricas acumuladas de una tarjeta de crédito.
// Filosofía: TRANSPARENCIA. Cada métrica explica qué mide y cómo se calcula.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../AppContext';
import {
  calcDebtHistory,
  calcHistoricalMetrics,
} from '../lib/creditCardUtils';
import type { Account } from '../types';
// 🧹 Quick-win 2.2b: fmtMoney centralizado en utils.ts
import { fmtMoney } from '../utils';

type Props = { account: Account };

// ─── Helper de formato monetario ─────────────────────────────────────────────

export function CreditCardMetrics({ account }: Props) {
  const { t } = useTranslation();
  const { T, realExpenses, rates, baseCurrency } = useApp();
  const currency = account.currency ?? baseCurrency;

  // Usamos 12 meses para tener una visión amplia
  const history = useMemo(
    () => calcDebtHistory(account, realExpenses, rates, baseCurrency, 12),
    [account, realExpenses, rates, baseCurrency]
  );

  const metrics = useMemo(
    () =>
      calcHistoricalMetrics(
        history,
        account.interestRate,
        account.minPaymentPct
      ),
    [history, account.interestRate, account.minPaymentPct]
  );

  // ── Estado vacío ──────────────────────────────────────────────────────────
  if (!metrics.hasEnoughData) {
    return (
      <div
        style={{
          padding: '1.5rem 1.25rem',
          background: T.pageBg,
          borderTop: `1px solid ${T.cardBorder}`,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>
          📊
        </div>
        <div
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: T.title,
            marginBottom: '0.35rem',
          }}
        >
          {t('creditCards.metrics.emptyTitle')}
        </div>
        <div
          style={{
            fontSize: '0.78rem',
            color: T.muted,
            lineHeight: 1.5,
            maxWidth: '24rem',
            margin: '0 auto',
          }}
        >
          {t('creditCards.metrics.emptyBody')}
        </div>
      </div>
    );
  }

  // ── Card individual ───────────────────────────────────────────────────────
  const metricCard = (
    icon: string,
    label: string,
    value: string,
    detail: string,
    color: string,
    bg: string,
    border: string
  ) => (
    <div
      style={{
        padding: '0.875rem 1rem',
        borderRadius: '0.875rem',
        background: bg,
        border: `1px solid ${border}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginBottom: '0.35rem',
        }}
      >
        <span style={{ fontSize: '0.95rem' }}>{icon}</span>
        <span
          style={{
            fontSize: '0.6rem',
            fontWeight: 700,
            color,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: '1.1rem',
          fontWeight: 800,
          color,
          letterSpacing: '-0.01em',
          marginBottom: '0.2rem',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: '0.68rem',
          color: T.muted,
          lineHeight: 1.4,
        }}
      >
        {detail}
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        padding: '1.25rem',
        background: T.pageBg,
        borderTop: `1px solid ${T.cardBorder}`,
      }}
    >
      {/* Cabecera */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.5rem',
        }}
      >
        <span style={{ fontSize: '1rem' }}>📊</span>
        <h4
          style={{
            fontSize: '0.95rem',
            fontWeight: 800,
            color: T.title,
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          {t('creditCards.metrics.title')}
        </h4>
      </div>

      <p
        style={{
          fontSize: '0.75rem',
          color: T.muted,
          margin: '0 0 1rem',
          lineHeight: 1.5,
        }}
      >
        {t('creditCards.metrics.subtitle', { n: metrics.monthsTracked })}
      </p>

      {/* Grid de métricas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))',
          gap: '0.75rem',
          marginBottom: '0.75rem',
        }}
      >
        {metricCard('💰', t('creditCards.metrics.kpiTotalPaid'), fmtMoney(metrics.totalPaid, currency), t('creditCards.metrics.kpiTotalPaidDetail'), T.green, T.greenBg, T.greenBorder)}
        {metricCard('🛒', t('creditCards.metrics.kpiTotalSpent'), fmtMoney(metrics.totalSpent, currency), t('creditCards.metrics.kpiTotalSpentDetail'), T.title, T.cardBg, T.cardBorder)}
        {account.interestRate
          ? metricCard('💸', t('creditCards.metrics.kpiInterest'), fmtMoney(metrics.estimatedInterestPaid, currency), t('creditCards.metrics.kpiInterestDetail', { rate: account.interestRate }), T.red, T.redBg ?? T.amberBg, T.redBorder ?? T.amberBorder)
          : metricCard('💸', t('creditCards.metrics.kpiInterest'), '—', t('creditCards.metrics.kpiInterestNoRate'), T.muted, T.pageBg, T.cardBorder)}
        {account.interestRate && account.minPaymentPct && metrics.savedVsMinimum > 0
          ? metricCard('🎯', t('creditCards.metrics.kpiSavings'), fmtMoney(metrics.savedVsMinimum, currency), t('creditCards.metrics.kpiSavingsDetail'), T.accent, T.accentLight, `${T.accent}33`)
          : metricCard('🎯', t('creditCards.metrics.kpiSavings'), fmtMoney(0, currency), account.interestRate && account.minPaymentPct ? t('creditCards.metrics.kpiSavingsZero') : t('creditCards.metrics.kpiSavingsNoConfig'), T.muted, T.pageBg, T.cardBorder)}
      </div>

      {/* Pico de gasto destacado */}
      {metrics.peakMonth && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            background: T.amberBg,
            border: `1px solid ${T.amberBorder}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>📅</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                color: T.amber,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.15rem',
              }}
            >
              {t('creditCards.metrics.peakMonthLabel')}
            </div>
            <div
              style={{
                fontSize: '0.82rem',
                color: T.body,
                lineHeight: 1.4,
              }}
            >
              <strong style={{ color: T.amber, textTransform: 'capitalize' }}>
                {metrics.peakMonth.label}
              </strong>{' '}
              {t('creditCards.metrics.peakMonthText', { amount: fmtMoney(metrics.peakMonth.amount, currency) })}
            </div>
          </div>
        </div>
      )}

      {/* Nota educativa sobre la estimación */}
      {account.interestRate && metrics.estimatedInterestPaid > 0 && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.625rem 0.875rem',
            borderRadius: '0.625rem',
            background: T.cardBg,
            border: `1px dashed ${T.cardBorder}`,
            fontSize: '0.68rem',
            color: T.muted,
            lineHeight: 1.5,
            fontStyle: 'italic',
          }}
        >
          {t('creditCards.metrics.estimationNote')}
        </div>
      )}
    </div>
  );
}
