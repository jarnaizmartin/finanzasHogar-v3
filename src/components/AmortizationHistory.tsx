import { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingDown, Clock, Sparkles, Undo2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../AppContext';
import { fmtDateDMY } from '../utils';
import type { Account } from '../types';

interface Props {
  loan: Account;
  /** Si true, omite el toggle y muestra siempre la lista expandida (uso en vista detalle) */
  alwaysExpanded?: boolean;
  /** Callback para deshacer una amortización (solo se muestra el botón en la última) */
  onUndo?: (amortizationId: string) => void;
}

/**
 * Histórico de amortizaciones parciales aplicadas a un préstamo (Fase 2.1.4).
 *
 * - Por defecto: colapsado mostrando resumen ("N amortizaciones · ~X€ ahorrados")
 * - Expandido: lista cronológica inversa con detalle de cada amortización
 * - Solo se renderiza si el préstamo tiene amortizaciones registradas
 */
 export function AmortizationHistory({ loan, alwaysExpanded = false, onUndo }: Props) {
  const { t } = useTranslation();
  const { T, accounts, fmtAccount, baseCurrency, dateFormat } = useApp();
  const [expanded, setExpanded] = useState(alwaysExpanded);
  const showToggle = !alwaysExpanded;

  const amortizations = loan.amortizations ?? [];
  if (amortizations.length === 0) return null;

  const currency = loan.currency ?? baseCurrency;

  // La "última" real = la últimamente insertada en el array (orden cronológico de aplicación,
  // independiente de la fecha valor — necesario para desempatar amortizaciones del mismo día).
  const latestId = amortizations[amortizations.length - 1]?.id;

  // Para el display, ordenamos por fecha desc; en caso de empate, la más reciente
  // (mayor índice en el array original) va primero.
  const indexById = new Map(amortizations.map((a, i) => [a.id, i]));
  const sorted = [...amortizations].sort((a, b) => {
    const dateCmp = b.date.localeCompare(a.date);
    if (dateCmp !== 0) return dateCmp;
    return (indexById.get(b.id) ?? 0) - (indexById.get(a.id) ?? 0);
  });

  // Resumen agregado
  const totalAmortized = sorted.reduce((s, a) => s + a.amount, 0);
  const totalFees = sorted.reduce((s, a) => s + a.fee, 0);
  const totalInterestSaved = sorted.reduce(
    (s, a) => s + (a.interestSavedEstimate ?? 0),
    0
  );

  return (
    <div
      style={{
        marginBottom: '1rem',
        borderRadius: '0.875rem',
        border: `1.5px solid ${T.greenBorder}`,
        background: T.greenBg,
        overflow: 'hidden',
      }}
    >
      {/* ── Cabecera (toggle) ────────────────────────────────────── */}
      {showToggle && (
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.75rem 0.95rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            minWidth: 0,
          }}
        >
          <Sparkles size={15} color={T.green} style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: T.green,
                letterSpacing: '-0.01em',
              }}
            >
              {sorted.length} amortizaci{sorted.length === 1 ? 'ón' : 'ones'}{' '}
              aplicada
              {sorted.length === 1 ? '' : 's'}
            </div>
            <div
              style={{
                fontSize: '0.68rem',
                color: T.green,
                opacity: 0.85,
                marginTop: '0.1rem',
              }}
            >
              {t('accounts.amortization.amortizedAmount', { amount: fmtAccount(totalAmortized, currency) })}
              {totalInterestSaved > 0 &&
                ` · ${t('accounts.amortization.savedAmount', { amount: fmtAccount(totalInterestSaved, currency) })}`}
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            color: T.green,
            flexShrink: 0,
          }}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>
      )}

      {/* ── Lista expandida ──────────────────────────────────────── */}
      {expanded && (
        <div
          style={{
            borderTop: `1px solid ${T.greenBorder}`,
            background: '#ffffffaa',
            padding: '0.6rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.55rem',
          }}
        >
          {sorted.map((a) => {
            const fromAcc = accounts.find((acc) => acc.id === a.fromAccountId);
            const isLatest = a.id === latestId;
            const isReduceTerm = a.mode === 'reduce_term';
            const monthsSaved =
              a.prevPaymentsRemaining != null && a.newPaymentsRemaining != null
                ? a.prevPaymentsRemaining - a.newPaymentsRemaining
                : 0;
            const paymentReduction =
              a.prevMonthlyPayment != null && a.newMonthlyPayment != null
                ? a.prevMonthlyPayment - a.newMonthlyPayment
                : 0;

            return (
              <div
                key={a.id}
                style={{
                  padding: '0.7rem 0.85rem',
                  borderRadius: '0.625rem',
                  background: '#ffffff',
                  border: `1px solid ${isLatest ? T.green : T.cardBorder}`,
                  boxShadow: isLatest ? `0 0 0 2px ${T.green}22` : 'none',
                }}
              >
                {/* Línea 1: fecha + modo + badge "última" */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    marginBottom: '0.4rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: T.title,
                      }}
                    >
                      📅 {fmtDateDMY(a.date, dateFormat)}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.45rem',
                        borderRadius: '9999px',
                        background: isReduceTerm ? T.accentLight : T.amberBg,
                        color: isReduceTerm ? T.accent : T.amber,
                        border: `1px solid ${
                          isReduceTerm ? T.accent + '44' : T.amberBorder
                        }`,
                      }}
                    >
                      {isReduceTerm ? (
                        <Clock size={10} />
                      ) : (
                        <TrendingDown size={10} />
                      )}
                      {isReduceTerm ? t('accounts.amortization.reduceTerm') : t('accounts.amortization.reducePayment')}
                    </span>
                  </div>
                  {isLatest && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span
                        style={{
                          fontSize: '0.55rem',
                          fontWeight: 800,
                          padding: '0.1rem 0.4rem',
                          borderRadius: '9999px',
                          background: T.green,
                          color: '#fff',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {t('accounts.amortization.latestBadge')}
                      </span>
                      {onUndo && (
                        <button
                          onClick={() => onUndo(a.id)}
                          title={t('accounts.amortization.undoTitle')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '0.45rem',
                            border: `1px solid ${T.redBorder ?? T.amberBorder}`,
                            background: T.redBg ?? T.amberBg,
                            color: T.red,
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          <Undo2 size={10} /> {t('accounts.amortization.undoBtn')}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Línea 2: importe destacado */}
                <div
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: T.green,
                    letterSpacing: '-0.02em',
                    marginBottom: '0.35rem',
                  }}
                >
                  {fmtAccount(a.amount, currency)}
                  {a.fee > 0 && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: T.amber,
                        marginLeft: '0.4rem',
                      }}
                    >
                      + {fmtAccount(a.fee, currency)} {t('accounts.amortization.feeSuffix')}
                    </span>
                  )}
                </div>

                {/* Línea 3: impacto antes → después */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.4rem',
                    marginBottom: '0.4rem',
                  }}
                >
                  {/* Cuota */}
                  {a.prevMonthlyPayment != null &&
                    a.newMonthlyPayment != null && (
                      <div
                        style={{
                          padding: '0.4rem 0.55rem',
                          borderRadius: '0.5rem',
                          background: T.pageBg,
                          border: `1px solid ${T.cardBorder}`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.55rem',
                            fontWeight: 700,
                            color: T.muted,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '0.15rem',
                          }}
                        >
                          {t('accounts.amortization.paymentLabel')}
                        </div>
                        <div
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: T.title,
                          }}
                        >
                          {fmtAccount(a.prevMonthlyPayment, currency)}
                          <span style={{ color: T.muted, margin: '0 0.25rem' }}>
                            →
                          </span>
                          <span
                            style={{
                              color: paymentReduction > 0 ? T.green : T.title,
                            }}
                          >
                            {fmtAccount(a.newMonthlyPayment, currency)}
                          </span>
                        </div>
                      </div>
                    )}

                  {/* Plazo */}
                  {a.prevPaymentsRemaining != null &&
                    a.newPaymentsRemaining != null && (
                      <div
                        style={{
                          padding: '0.4rem 0.55rem',
                          borderRadius: '0.5rem',
                          background: T.pageBg,
                          border: `1px solid ${T.cardBorder}`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.55rem',
                            fontWeight: 700,
                            color: T.muted,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '0.15rem',
                          }}
                        >
                          {t('accounts.amortization.paymentsLabel')}
                        </div>
                        <div
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: T.title,
                          }}
                        >
                          {a.prevPaymentsRemaining}
                          <span style={{ color: T.muted, margin: '0 0.25rem' }}>
                            →
                          </span>
                          <span
                            style={{
                              color: monthsSaved > 0 ? T.green : T.title,
                            }}
                          >
                            {a.newPaymentsRemaining}
                          </span>
                        </div>
                      </div>
                    )}
                </div>

                {/* Línea 4: ahorro estimado + cuenta origen */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.4rem',
                    fontSize: '0.65rem',
                    color: T.muted,
                  }}
                >
                  {a.interestSavedEstimate != null &&
                    a.interestSavedEstimate > 0 && (
                      <span>
                        {t('accounts.amortization.interestSaved', { amount: fmtAccount(a.interestSavedEstimate, currency) })}
                      </span>
                    )}
                  {fromAcc && (
                    <span>
                      {t('accounts.amortization.paidFrom', { name: fromAcc.name })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* ── Footer agregado ──────────────────────────────────── */}
          <div
            style={{
              marginTop: '0.3rem',
              padding: '0.5rem 0.7rem',
              borderRadius: '0.5rem',
              background: T.greenBg,
              border: `1px solid ${T.greenBorder}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.4rem',
              fontSize: '0.68rem',
              color: T.green,
              fontWeight: 700,
            }}
          >
            <span>
              {t('accounts.amortization.totalAmortized', { amount: fmtAccount(totalAmortized, currency) })}
              {totalFees > 0 && (
                <>
                  {' · '}
                  {t('accounts.amortization.totalFees', { amount: fmtAccount(totalFees, currency) })}
                </>
              )}
            </span>
            {totalInterestSaved > 0 && (
              <span>
                {t('accounts.amortization.totalSaved', { amount: fmtAccount(totalInterestSaved, currency) })}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
