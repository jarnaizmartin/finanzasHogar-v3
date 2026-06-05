// src/components/AccountsSummary.tsx
//
// Cabecera de resumen de la vista Cuentas:
//   - Grid de KPIs (saldo inicial, saldo real, deuda tarjetas/préstamos, nº cuentas)
//   - Sticky via StickyCompactBar con title + spread

import { useRef } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../AppContext';
import { StickyCompactBar } from './StickyCompactBar';

interface AccountsSummaryProps {
  onAdd: () => void;
  isMobile?: boolean;
}

export function AccountsSummary({ onAdd, isMobile = false }: AccountsSummaryProps) {
  const { t } = useTranslation();
  const { T, baseCurrency, fmtAccount, accounts, realBalanceMap } = useApp();

  const sentinelRef = useRef<HTMLDivElement>(null);

  // ── Totales ──
  const creditCardAccounts = accounts.filter((a) => a.accountType === 'credit_card');
  const loanAccounts = accounts.filter((a) => a.accountType === 'loan');
  const totalBase = accounts
    .filter((a) => a.accountType !== 'credit_card' && a.accountType !== 'loan')
    .reduce((s, a) => s + a.balance, 0);
  const totalReal = accounts.reduce(
    (s, a) => s + (realBalanceMap[a.id]?.realBalance ?? a.balance),
    0
  );
  const totalCreditDebt = creditCardAccounts.reduce(
    (s, a) => s + (realBalanceMap[a.id]?.creditDebt ?? 0),
    0
  );
  const totalLoanDebt = loanAccounts.reduce(
    (s, a) => s + (realBalanceMap[a.id]?.loanDebt ?? a.balance),
    0
  );

  const hasCards = creditCardAccounts.length > 0;
  const hasLoans = loanAccounts.length > 0;

  // Items del resumen (pre-computados)
  const summaryItems = [
    {
      label: t('accounts.summary.saldoInicial'),
      value: fmtAccount(totalBase, baseCurrency),
      color: T.accent,
      bg: T.accentLight,
      border: `${T.accent}33`,
    },
    {
      label: t('accounts.summary.saldoReal'),
      value: fmtAccount(totalReal, baseCurrency),
      color: totalReal >= 0 ? T.green : T.red,
      bg: totalReal >= 0 ? T.greenBg : (T.redBg ?? T.amberBg),
      border: totalReal >= 0 ? T.greenBorder : (T.redBorder ?? T.amberBorder),
    },
    ...(creditCardAccounts.length > 0
      ? [{
          label: t('accounts.summary.deudaTarjetas'),
          value: fmtAccount(totalCreditDebt, baseCurrency),
          color: totalCreditDebt > 0 ? T.red : T.green,
          bg: totalCreditDebt > 0 ? (T.redBg ?? T.amberBg) : T.greenBg,
          border: totalCreditDebt > 0 ? (T.redBorder ?? T.amberBorder) : T.greenBorder,
        }]
      : []),
    ...(loanAccounts.length > 0
      ? [{
          label: t('accounts.summary.deudaPrestamos'),
          value: fmtAccount(totalLoanDebt, baseCurrency),
          color: totalLoanDebt > 0 ? T.red : T.green,
          bg: totalLoanDebt > 0 ? (T.redBg ?? T.amberBg) : T.greenBg,
          border: totalLoanDebt > 0 ? (T.redBorder ?? T.amberBorder) : T.greenBorder,
        }]
      : []),
    {
      label: t('accounts.summary.cuentasActivas'),
      value: `${accounts.length} cuenta${accounts.length !== 1 ? 's' : ''}`,
      color: T.muted,
      bg: T.pageBg,
      border: T.cardBorder,
    },
  ];

  return (
    <>
      {/* ── Resumen de patrimonio ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${summaryItems.length}, 1fr)`,
          gap: isMobile ? '0.625rem' : '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {summaryItems.map((item) => (
          <div
            key={item.label}
            style={{
              padding: isMobile ? '0.75rem' : '1rem 1.25rem',
              borderRadius: '1rem',
              background: item.bg,
              border: `1px solid ${item.border}`,
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: isMobile ? '0.58rem' : '0.68rem',
                fontWeight: 700,
                color: item.color,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.25rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: isMobile ? '0.95rem' : '1.25rem',
                fontWeight: 800,
                color: item.color,
                letterSpacing: '-0.02em',
                textAlign: 'right',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* 🎯 Sentinel + Sticky */}
      <div ref={sentinelRef} style={{ height: 1 }} />
      <StickyCompactBar
        title={t('accounts.summary.stickyTitle')}
        sentinelRef={sentinelRef}
        spread
        kpis={[
          { label: 'INICIAL', value: fmtAccount(totalBase, baseCurrency), color: T.accent },
          { label: 'REAL', value: fmtAccount(totalReal, baseCurrency), color: totalReal >= 0 ? T.green : T.red },
          ...(hasCards ? [{ label: 'TARJETAS', value: fmtAccount(totalCreditDebt, baseCurrency), color: totalCreditDebt > 0 ? T.red : T.green }] : []),
          ...(hasLoans ? [{ label: 'PRÉSTAMOS', value: fmtAccount(totalLoanDebt, baseCurrency), color: totalLoanDebt > 0 ? T.red : T.green }] : []),
          { label: 'CTAS.', value: `${accounts.length}`, color: T.muted },
        ]}
        rightSlot={
          <button
            onClick={onAdd}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.3rem 0.6rem', borderRadius: '0.5rem', border: 'none',
              background: T.accent, color: '#fff', fontSize: '0.72rem',
              fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            <Plus size={11} /> {t('accounts.summary.newShort')}
          </button>
        }
      />
    </>
  );
}
