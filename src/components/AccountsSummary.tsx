// src/components/AccountsSummary.tsx
//
// Cabecera de resumen de la vista Cuentas:
//   - Grid de KPIs (saldo inicial, saldo real, deuda tarjetas/préstamos, nº cuentas)
//   - Sticky propio de 2 filas × 3 columnas — más legible que el StickyCompactBar genérico

import { useRef, useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../AppContext';

interface AccountsSummaryProps {
  onAdd: () => void;
  isMobile?: boolean;
}

function findScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node: HTMLElement | null = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    if (
      (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
      node.scrollHeight > node.clientHeight
    ) return node;
    node = node.parentElement;
  }
  return null;
}

export function AccountsSummary({ onAdd, isMobile = false }: AccountsSummaryProps) {
  const { t } = useTranslation();
  const { T, baseCurrency, fmtAccount, accounts, realBalanceMap } = useApp();

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const scrollParent = findScrollParent(el);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { root: scrollParent, threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  // Celda de KPI para el sticky
  const KPICell = ({ label, value, color }: { label: string; value: string; color: string }) => (
    <div style={{ minWidth: 0, overflow: 'hidden' }}>
      <div style={{
        fontSize: '0.5rem',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.07em',
        color: T.muted,
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        lineHeight: 1.2,
        marginBottom: '0.1rem',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: isMobile ? '0.78rem' : '0.88rem',
        fontWeight: 800,
        color,
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        letterSpacing: '-0.01em',
        lineHeight: 1.2,
      }}>
        {value}
      </div>
    </div>
  );

  const hasCards = creditCardAccounts.length > 0;
  const hasLoans = loanAccounts.length > 0;
  const row2Count = (hasCards ? 1 : 0) + (hasLoans ? 1 : 0) + 1; // +1 for button
  // En mobile: 2 filas si hay deuda, 1 fila si no. En desktop: siempre 1 fila.
  const needsRow2 = isMobile && (hasCards || hasLoans);
  const stickyHeight = needsRow2 ? '72px' : (isMobile ? '48px' : '52px');

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

      {/* 🎯 Sentinel */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {/* ── Sticky propio 2 filas × 3 columnas ── */}
      <div
        className="fh-no-print"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          width: isMobile ? 'calc(100% + 2rem)' : 'calc(100% + 4rem)',
          marginLeft: isMobile ? '-1rem' : '-2rem',
          marginBottom: visible ? '1rem' : 0,
          background: T.stickyBg,
          borderBottom: `2px solid ${T.accent}`,
          boxShadow: visible
            ? `0 8px 24px -4px ${T.accent}55, 0 4px 8px rgba(0,0,0,0.08)`
            : 'none',
          maxHeight: visible ? stickyHeight : '0px',
          overflow: 'hidden',
          opacity: visible ? 1 : 0,
          transition: 'max-height 0.25s ease, opacity 0.2s ease, box-shadow 0.2s ease, margin-bottom 0.25s ease',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        <div style={{
          position: 'relative',
          padding: isMobile ? '0.45rem 1rem' : '0.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.3rem',
        }}>
          {/* ── Desktop: fila única con todos los KPIs + botón ── */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                <KPICell label="INICIAL" value={fmtAccount(totalBase, baseCurrency)} color={T.accent} />
                <KPICell label="REAL" value={fmtAccount(totalReal, baseCurrency)} color={totalReal >= 0 ? T.green : T.red} />
                {hasCards && <KPICell label="TARJETAS" value={fmtAccount(totalCreditDebt, baseCurrency)} color={totalCreditDebt > 0 ? T.red : T.green} />}
                {hasLoans && <KPICell label="PRÉSTAMOS" value={fmtAccount(totalLoanDebt, baseCurrency)} color={totalLoanDebt > 0 ? T.red : T.green} />}
                <KPICell label="CTAS." value={`${accounts.length}`} color={T.muted} />
              </div>
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
            </div>
          )}

          {/* ── Mobile fila 1: INICIAL | REAL | CTAS. ── */}
          {isMobile && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <KPICell label="INICIAL" value={fmtAccount(totalBase, baseCurrency)} color={T.accent} />
              <KPICell label="REAL" value={fmtAccount(totalReal, baseCurrency)} color={totalReal >= 0 ? T.green : T.red} />
              <KPICell label="CTAS." value={`${accounts.length}`} color={T.muted} />
            </div>
          )}

          {/* ── Mobile fila 2: TARJETAS | PRÉSTAMOS | [+ Nueva] — solo si hay deuda ── */}
          {needsRow2 && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${row2Count}, 1fr)`, gap: '0.5rem', alignItems: 'center' }}>
              {hasCards && <KPICell label="TARJETAS" value={fmtAccount(totalCreditDebt, baseCurrency)} color={totalCreditDebt > 0 ? T.red : T.green} />}
              {hasLoans && <KPICell label="PRÉSTAMOS" value={fmtAccount(totalLoanDebt, baseCurrency)} color={totalLoanDebt > 0 ? T.red : T.green} />}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={onAdd}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    padding: '0.3rem 0.6rem', borderRadius: '0.5rem', border: 'none',
                    background: T.accent, color: '#fff', fontSize: '0.72rem',
                    fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  <Plus size={11} /> {t('accounts.summary.newShort')}
                </button>
              </div>
            </div>
          )}

          {/* Mobile sin deuda: botón absoluto en fila 1 */}
          {isMobile && !needsRow2 && (
            <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}>
              <button
                onClick={onAdd}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.3rem 0.6rem', borderRadius: '0.5rem', border: 'none',
                  background: T.accent, color: '#fff', fontSize: '0.72rem',
                  fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                <Plus size={11} /> {t('accounts.summary.newShort')}
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  );
}
