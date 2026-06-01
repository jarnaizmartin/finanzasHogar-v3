// src/components/CreditCardAccountCard.tsx
//
// Card de cuenta tipo "tarjeta de crédito" en la vista Cuentas.
// Diseño "tarjeta física" con header oscuro, barra de utilización con
// semáforo, días hasta corte/pago, info financiera y acciones.
//
// Extraído de src/views/Accounts.tsx el 24/05/2026 (refactor/accounts, commit 4).
//
// Patrón: el componente consume useApp directamente (igual que AccountsSummary
// y CreditCardsComparison). Recibe callbacks para acciones que dependen del
// estado del padre (selección de detalle, edición, borrado).

import { forwardRef } from 'react';
import { Pencil, Trash2, CreditCard, Eye, Receipt } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../AppContext';
import {
  daysUntilBilling,
  daysUntilPayment,
  getCreditHealthScore,
  getCreditHealthColors,
  calcMinPayment,
  calcYearlyInterestCost,
} from '../lib/creditCardUtils';
import { Card } from './UI';
import { InstitutionLogo } from './InstitutionLogo';
import type { Account } from '../types';

interface CreditCardAccountCardProps {
  account: Account;
  /** Si true, dibuja borde + box-shadow de resaltado. */
  isHighlighted: boolean;
  /** Abrir vista detalle (drill-down). */
  onSelectDetail: (id: string) => void;
  /** Abrir modal de edición. */
  onEdit: (account: Account) => void;
  /** Pedir confirmación de borrado. */
  onDelete: (id: string) => void;
  /** Navegar a la lista de movimientos filtrada por esta cuenta. */
  onViewMovements: (id: string) => void;
}

export const CreditCardAccountCard = forwardRef<HTMLDivElement, CreditCardAccountCardProps>(
  function CreditCardAccountCard(
    { account: acc, isHighlighted, onSelectDetail, onEdit, onDelete, onViewMovements },
    ref
  ) {
    const { t } = useTranslation();
    const { T, baseCurrency, fmtAccount, realBalanceMap, openPaymentModal } = useApp();

    const ccInfo = realBalanceMap[acc.id];
    // Salvavidas: si por algún motivo no hay info, no renderizamos nada.
    // (En la práctica el padre ya filtra, pero así el componente es robusto.)
    if (!ccInfo) return null;

    const { creditDebt, creditAvailable, utilizationPct } = ccInfo;

    // Health score (verde/ámbar/rojo/crítico)
    const health = getCreditHealthScore(utilizationPct);
    const { color: utilColor, bg: utilBg, border: utilBorder, bar: utilBar } =
      getCreditHealthColors(health.intent, T);
    const utilLabel = health.label;

    // Días hasta corte y pago
    const dBilling = daysUntilBilling(acc);
    const dPayment = daysUntilPayment(acc);

    const showDays = dBilling !== null || dPayment !== null;
    const showInterest = !!(acc.interestRate || acc.minPaymentPct);
    const showSimulator = !!(creditDebt > 0 && acc.minPaymentPct);

    const borderColor = isHighlighted
      ? T.accent
      : utilizationPct >= 70
      ? (T.redBorder ?? T.amberBorder)
      : T.cardBorder;

    return (
      <Card
        T={T}
        ref={ref}
        style={{
          border: `2px solid ${borderColor}`,
          overflow: 'hidden',
          boxShadow: isHighlighted ? `0 0 0 4px ${T.accent}33, 0 12px 32px ${T.accent}22` : undefined,
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        {/* Header tipo tarjeta física */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 60%, #1e293b 100%)', padding: '1.25rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-1.5rem', right: '-1.5rem', width: '6rem', height: '6rem', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-0.75rem', right: '3rem', width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CreditCard size={20} color="#94a3b8" />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {acc.institution && (
                    <>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#93c5fd' }}>
                        <InstitutionLogo name={acc.institution} size={14} color="93c5fd" />
                        {acc.institution}
                      </span>
                      <span style={{ color: '#64748b', fontWeight: 400 }}>—</span>
                    </>
                  )}
                  <span>{acc.name}</span>
                </div>
                <div style={{ fontSize: '0.6rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.2rem' }}>
                  {t('accounts.creditCard.type')} · {acc.currency ?? baseCurrency}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
              {/* Mini-badge Health Score (clickable → entra al detalle) */}
              <button
                onClick={() => onSelectDetail(acc.id)}
                title={t('accounts.creditCard.healthTitle', { score: health.score, label: health.label })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.25rem 0.6rem 0.25rem 0.45rem',
                  borderRadius: '9999px',
                  border: `1px solid ${utilBorder}`,
                  background: 'rgba(255,255,255,0.06)',
                  color: '#f1f5f9',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  marginRight: '0.25rem',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '0.5rem',
                    height: '0.5rem',
                    borderRadius: '50%',
                    background: utilBar,
                  }}
                />
                {health.score}
              </button>
              <button onClick={() => onSelectDetail(acc.id)} title={t('accounts.creditCard.viewAnalysis')} style={{ padding: '0.35rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Eye size={13} /></button>
              <button onClick={() => onEdit(acc)} title={t('accounts.card.edit')} style={{ padding: '0.35rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Pencil size={13} /></button>
              <button onClick={() => onDelete(acc.id)} title={t('accounts.card.delete')} style={{ padding: '0.35rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={13} /></button>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>{t('accounts.creditCard.currentDebt')}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: creditDebt > 0 ? '#f87171' : '#4ade80', lineHeight: 1, whiteSpace: 'nowrap' }}>
              {fmtAccount(creditDebt, acc.currency ?? baseCurrency)}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem 1.5rem' }}>
          {/* Barra de utilización con semáforo */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('accounts.creditCard.limitUsage')}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.1rem 0.5rem', borderRadius: '9999px', background: utilBg, color: utilColor, border: `1px solid ${utilBorder}` }}>
                {Math.round(utilizationPct)}% · {utilLabel}
              </span>
            </div>
            <div style={{ height: '0.5rem', borderRadius: '9999px', background: T.pageBg, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '9999px', width: `${Math.min(100, utilizationPct)}%`, transition: 'width 0.6s ease', background: utilBar }} />
            </div>
          </div>

          {/* Disponible / Límite */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: T.pageBg, border: `1px solid ${T.cardBorder}` }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{t('accounts.creditCard.available')}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: T.green }}>{fmtAccount(creditAvailable, acc.currency ?? baseCurrency)}</div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: T.pageBg, border: `1px solid ${T.cardBorder}` }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{t('accounts.creditCard.totalLimit')}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: T.title }}>{fmtAccount(acc.creditLimit ?? 0, acc.currency ?? baseCurrency)}</div>
            </div>
          </div>

          {/* Días hasta corte y pago */}
          {showDays && (
            <div style={{ display: 'grid', gridTemplateColumns: dBilling !== null && dPayment !== null ? '1fr 1fr' : '1fr', gap: '0.5rem', marginBottom: '1rem' }}>
              {dBilling !== null && (
                <div style={{ padding: '0.5rem 0.75rem', borderRadius: '0.625rem', background: T.accentLight, border: `1px solid ${T.accent}33`, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.55rem', fontWeight: 700, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('accounts.creditCard.billingBadge')}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: T.accent }}>{dBilling === 0 ? t('accounts.creditCard.today') : `${dBilling}d`}</div>
                </div>
              )}
              {dPayment !== null && (
                <div style={{ padding: '0.5rem 0.75rem', borderRadius: '0.625rem', background: dPayment <= 3 ? (T.redBg ?? T.amberBg) : T.pageBg, border: `1px solid ${dPayment <= 3 ? (T.redBorder ?? T.amberBorder) : T.cardBorder}`, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.55rem', fontWeight: 700, color: dPayment <= 3 ? T.red : T.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('accounts.creditCard.paymentBadge')}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: dPayment <= 3 ? T.red : T.title }}>{dPayment === 0 ? t('accounts.creditCard.todayUrgent') : `${dPayment}d`}</div>
                </div>
              )}
            </div>
          )}

          {/* TAE e info financiera */}
          {showInterest && (
            <div style={{ padding: '0.625rem 0.875rem', borderRadius: '0.75rem', background: T.pageBg, border: `1px solid ${T.cardBorder}`, marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              {acc.interestRate ? <span style={{ fontSize: '0.72rem', color: T.muted }}>{t('accounts.creditCard.rateLabel')} <strong style={{ color: T.title }}>{acc.interestRate}%</strong></span> : null}
              {acc.minPaymentPct ? <span style={{ fontSize: '0.72rem', color: T.muted }}>{t('accounts.creditCard.minPaymentLabel')} <strong style={{ color: T.title }}>{acc.minPaymentPct}%</strong></span> : null}
              {acc.interestRate && creditDebt > 0 ? <span style={{ fontSize: '0.72rem', color: T.amber }}>≈{fmtAccount(calcYearlyInterestCost(creditDebt, acc.interestRate), acc.currency ?? baseCurrency)}{t('accounts.creditCard.perYear')}</span> : null}
            </div>
          )}

          {/* Resumen rápido pago mínimo */}
          {showSimulator && (
            <div style={{ padding: '0.625rem 0.875rem', borderRadius: '0.75rem', background: T.amberBg, border: `1px solid ${T.amberBorder}`, marginBottom: '0.75rem', fontSize: '0.72rem', color: T.amber, lineHeight: 1.5 }}>
              {t('accounts.creditCard.minPaymentInfo', {
                min: fmtAccount(calcMinPayment(creditDebt, acc.minPaymentPct ?? 5), acc.currency ?? baseCurrency),
                total: fmtAccount(creditDebt, acc.currency ?? baseCurrency),
              })}
            </div>
          )}

          {/* Acciones */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {creditDebt > 0 && (
              <button
                onClick={() => openPaymentModal(acc.id)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.65rem 0.875rem', borderRadius: '0.75rem', border: 'none', background: T.green, color: '#fff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', flex: 1, justifyContent: 'center' }}
              >
                {t('accounts.creditCard.registerPayment')}
              </button>
            )}
            <button
              onClick={() => onViewMovements(acc.id)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.65rem 0.875rem', borderRadius: '0.75rem', border: `1.5px solid ${T.cardBorder}`, background: T.btnSecBg, color: T.btnSecText, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', flex: 1, justifyContent: 'center' }}
            >
              <Receipt size={14} /> {t('accounts.card.movements')}
            </button>
          </div>
        </div>
      </Card>
    );
  }
);
