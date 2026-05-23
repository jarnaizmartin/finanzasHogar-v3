// src/components/LoanAccountCard.tsx
//
// Card de cuenta tipo "préstamo / hipoteca" en la vista Cuentas.
// Diseño "tarjeta financiera" con header verde oscuro, barra de progreso
// "% pagado", cuota mensual, cuotas restantes, estimación de intereses,
// cuenta de cargo y acciones (amortizar / historial / movimientos).
//
// Extraído de src/views/Accounts.tsx el 24/05/2026 (refactor/accounts, commit 5).

import { Pencil, Trash2, Receipt } from 'lucide-react';
import { useApp } from '../AppContext';
import {
  estimateLoanInterest,
  calcLoanProgress,
  getLoanTypeLabel,
  getLoanTypeIcon,
} from '../lib/loanUtils';
import { Card } from './UI';
import { InstitutionLogo } from './InstitutionLogo';
import type { Account } from '../types';

interface LoanAccountCardProps {
  account: Account;
  /** Abrir modal de amortización parcial. */
  onAmortize: (id: string) => void;
  /** Abrir vista detalle del préstamo (historial completo). */
  onSelectDetail: (id: string) => void;
  /** Abrir modal de edición. */
  onEdit: (account: Account) => void;
  /** Pedir confirmación de borrado. */
  onDelete: (id: string) => void;
  /** Navegar a la lista de movimientos filtrada por esta cuenta. */
  onViewMovements: (id: string) => void;
}

export function LoanAccountCard({
  account: acc,
  onAmortize,
  onSelectDetail,
  onEdit,
  onDelete,
  onViewMovements,
}: LoanAccountCardProps) {
  const { T, baseCurrency, fmtAccount, accounts, realBalanceMap } = useApp();

  const loanInfo = realBalanceMap[acc.id];
  const currentDebt = loanInfo?.loanDebt ?? acc.balance;
  const initialDebt = loanInfo?.loanInitialDebt ?? acc.balance;
  const appliedCount = loanInfo?.appliedCount ?? 0;
  const interestEstimate = estimateLoanInterest(acc, currentDebt);
  const progress = calcLoanProgress(acc, appliedCount, initialDebt, currentDebt);
  const currency = acc.currency ?? baseCurrency;
  const loanIcon = getLoanTypeIcon(acc.loanType);
  const loanLabel = getLoanTypeLabel(acc.loanType);
  const payerAcc = acc.paymentAccountId
    ? accounts.find((a) => a.id === acc.paymentAccountId)
    : null;
  const isPaidOff = currentDebt <= 0;

  return (
    <Card
      T={T}
      style={{
        border: `2px solid ${isPaidOff ? T.greenBorder : T.cardBorder}`,
        overflow: 'hidden',
      }}
    >
      {/* Header oscuro tipo "carta financiera" */}
      <div
        style={{
          background:
            'linear-gradient(135deg, #14532d 0%, #166534 60%, #14532d 100%)',
          padding: '1.25rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-1.5rem',
            right: '-1.5rem',
            width: '6rem',
            height: '6rem',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{loanIcon}</span>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                {acc.institution && (
                  <>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#86efac' }}>
                      <InstitutionLogo name={acc.institution} size={14} color="86efac" />
                      {acc.institution}
                    </span>
                    <span style={{ color: '#64748b', fontWeight: 400 }}>—</span>
                  </>
                )}
                <span>{acc.name}</span>
              </div>
              <div
                style={{
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  color: '#86efac',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginTop: '0.2rem',
                }}
              >
                {loanLabel} · {currency}
                {acc.interestType && ` · ${acc.interestType === 'fixed' ? 'Tipo fijo' : 'Tipo variable'}`}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
            <button
              onClick={() => onEdit(acc)}
              title="Editar"
              style={{
                padding: '0.35rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'transparent',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onDelete(acc.id)}
              title="Eliminar"
              style={{
                padding: '0.35rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'transparent',
                color: '#f87171',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '0.6rem',
              fontWeight: 700,
              color: '#86efac',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.2rem',
            }}
          >
            Capital pendiente
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: isPaidOff ? '#4ade80' : '#fef3c7',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {fmtAccount(currentDebt, currency)}
          </div>
          {!isPaidOff && initialDebt !== currentDebt && (
            <div style={{ fontSize: '0.65rem', color: '#86efac', marginTop: '0.3rem' }}>
              Inicial: {fmtAccount(initialDebt, currency)}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1.25rem 1.5rem' }}>
        {isPaidOff ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: T.green }}>
              ¡Préstamo liquidado!
            </div>
            <div style={{ fontSize: '0.75rem', color: T.muted, marginTop: '0.3rem' }}>
              Ya no debes nada. Puedes eliminar este préstamo cuando quieras.
            </div>
          </div>
        ) : (
          <>
            {/* Barra de progreso "% pagado" */}
            {progress.monthsToFinish !== null && (
              <div style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.375rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: T.muted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Progreso del préstamo
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: T.green,
                    }}
                  >
                    {Math.round(progress.paidPct)}% pagado
                  </span>
                </div>
                <div
                  style={{
                    height: '0.5rem',
                    borderRadius: '9999px',
                    background: T.pageBg,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      borderRadius: '9999px',
                      width: `${Math.min(100, progress.paidPct)}%`,
                      transition: 'width 0.6s ease',
                      background: T.green,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Cuota mensual + cuotas restantes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              {acc.monthlyPayment != null && (
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    background: T.pageBg,
                    border: `1px solid ${T.cardBorder}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      color: T.muted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      marginBottom: '0.2rem',
                    }}
                  >
                    Cuota mensual
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: T.title }}>
                    {fmtAccount(acc.monthlyPayment, currency)}
                  </div>
                </div>
              )}
              {progress.monthsToFinish !== null && (
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    background: T.pageBg,
                    border: `1px solid ${T.cardBorder}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      color: T.muted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      marginBottom: '0.2rem',
                    }}
                  >
                    Cuotas restantes
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: T.title }}>
                    {progress.monthsToFinish}
                  </div>
                  {progress.estimatedEndDate && (
                    <div style={{ fontSize: '0.65rem', color: T.muted, marginTop: '0.15rem' }}>
                      hasta ~{progress.estimatedEndDate}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Estimación intereses */}
            {interestEstimate.hasEnoughData && (
              <div
                style={{
                  padding: '0.75rem 0.875rem',
                  borderRadius: '0.75rem',
                  background: T.accentLight,
                  border: `1px solid ${T.accent}33`,
                  marginBottom: '1rem',
                  fontSize: '0.75rem',
                  color: T.accent,
                  lineHeight: 1.5,
                }}
              >
                💡 De tu cuota de{' '}
                <strong>{fmtAccount(acc.monthlyPayment ?? 0, currency)}</strong>:
                <div style={{ marginTop: '0.4rem', display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span>↘ Capital: <strong>{fmtAccount(interestEstimate.monthlyPrincipal, currency)}</strong></span>
                  <span>↗ Intereses: <strong>{fmtAccount(interestEstimate.monthlyInterest, currency)}</strong></span>
                </div>
                <div style={{ fontSize: '0.65rem', opacity: 0.75, marginTop: '0.3rem' }}>
                  Estimación basada en tu capital pendiente y tipo {acc.interestRate}%. El banco lo calcula con precisión cada mes.
                </div>
              </div>
            )}

            {/* Cuenta de cargo */}
            {payerAcc && (
              <div
                style={{
                  padding: '0.6rem 0.875rem',
                  borderRadius: '0.75rem',
                  background: T.pageBg,
                  border: `1px solid ${T.cardBorder}`,
                  marginBottom: '1rem',
                  fontSize: '0.72rem',
                  color: T.muted,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <span>
                  🏦 Se paga desde: <strong style={{ color: T.title }}>{payerAcc.name}</strong>
                </span>
                {acc.paymentDay && (
                  <span>
                    📅 Día <strong style={{ color: T.title }}>{acc.paymentDay}</strong> de cada mes
                  </span>
                )}
              </div>
            )}
          </>
        )}

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {!isPaidOff && (
            <button
              onClick={() => onAmortize(acc.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.65rem 0.875rem',
                borderRadius: '0.75rem',
                border: 'none',
                background: T.green,
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                flex: 1,
                justifyContent: 'center',
              }}
            >
              💸 Amortizar
            </button>
          )}
          {(acc.amortizations?.length ?? 0) > 0 && (
            <button
              onClick={() => onSelectDetail(acc.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.65rem 0.875rem',
                borderRadius: '0.75rem',
                border: `1.5px solid ${T.green}55`,
                background: T.greenBg,
                color: T.green,
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                flex: 1,
                justifyContent: 'center',
              }}
            >
              📜 Historial ({acc.amortizations!.length})
            </button>
          )}
          <button
            onClick={() => onViewMovements(acc.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.65rem 0.875rem',
              borderRadius: '0.75rem',
              border: `1.5px solid ${T.cardBorder}`,
              background: T.btnSecBg,
              color: T.btnSecText,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <Receipt size={14} /> Movimientos
          </button>
        </div>
      </div>
    </Card>
  );
}
