// src/components/AccountsSummary.tsx
//
// Cabecera de resumen de la vista Cuentas:
//   - Grid de KPIs (saldo inicial, saldo real, deuda tarjetas/préstamos, nº cuentas)
//   - Sentinel + StickyCompactBar con los mismos datos
//
// Extraído de src/views/Accounts.tsx el 24/05/2026 (refactor/accounts, commit 3).
//
// Se consume el contexto directamente (mismo patrón que CreditCardsComparison)
// para mantener la API del componente minimal: solo necesita el callback de
// "nueva cuenta" para el botón del sticky bar.

import { useRef } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../AppContext';
import { StickyCompactBar, type CompactKPI } from './StickyCompactBar';

interface AccountsSummaryProps {
  /** Handler del botón "Nueva" en el sticky bar (abre el modal de creación). */
  onAdd: () => void;
}

export function AccountsSummary({ onAdd }: AccountsSummaryProps) {
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

  // Items del resumen (pre-computados, OXC-safe)
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
          gridTemplateColumns: `repeat(${summaryItems.length}, 1fr)`,
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        {summaryItems.map((item) => (
          <div
            key={item.label}
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '1rem',
              background: item.bg,
              border: `1px solid ${item.border}`,
            }}
          >
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: item.color,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.35rem',
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: item.color,
                letterSpacing: '-0.02em',
                textAlign: 'right',
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* 🎯 Sentinel — dispara la barra compacta sticky al hacer scroll */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {/* ── Barra compacta sticky ── */}
      <StickyCompactBar
        title={t('accounts.summary.stickyTitle')}
        sentinelRef={sentinelRef}
        kpis={summaryItems.map<CompactKPI>((item) => ({
          label: item.label,
          value: item.value,
          color: item.color,
        }))}
        rightSlot={
          <button
            onClick={onAdd}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: T.accent,
              color: '#fff',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Plus size={13} /> {t('accounts.summary.newShort')}
          </button>
        }
      />
    </>
  );
}
