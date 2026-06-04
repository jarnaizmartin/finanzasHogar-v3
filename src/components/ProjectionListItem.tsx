// ════════════════════════════════════════════════════════════════════════════
// ProjectionListItem.tsx
//
// Tarjeta de una proyección en la lista de Proyecciones.
// Extraído de src/views/Projections.tsx (Bloque 1.1.3 del refactor Fase 1.1).
//
// Componente "presentacional": recibe todo por props, no accede al contexto.
// ════════════════════════════════════════════════════════════════════════════

import {
  Pencil,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  BellOff,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Projection, Account, Category } from '../types';
import { CURRENCIES, FREQUENCIES, fmt, fmtDateShort, fmtDateDMY } from '../utils';
import { fmtAmount } from '../lib/i18nFormats';
import { Card, GhostBtn } from './UI';

export type ProjectionListItemProps = {
  proj: Projection;
  T: any; // tema (mismo shape que se pasa en toda la app)
  cat?: Category;
  acc?: Account;
  toAcc?: Account | null;
  monthlyAmt: number;
  isExpanded: boolean;
  isMobile?: boolean;
  baseCurrency: string;
  displayCurrency: string;
  rates: Record<string, number>;
  dateFormat: string;
  onToggleExpand: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
};

export function ProjectionListItem({
  proj,
  T,
  cat,
  acc,
  toAcc,
  monthlyAmt,
  isExpanded,
  isMobile = false,
  baseCurrency,
  displayCurrency,
  rates,
  dateFormat,
  onToggleExpand,
  onDuplicate,
  onEdit,
  onDelete,
  onToggleActive,
}: ProjectionListItemProps) {
  const { t } = useTranslation();
  const isActive = proj.active !== false;
  const isTransferNonLoan = proj.type === 'transfer' && !proj.linkedLoanId;

  return (
    <Card
      T={T}
      style={{
        opacity: isActive ? 1 : 0.55,
        border: `1px solid ${
          proj.type === 'income' ? T.greenBorder : T.cardBorder
        }`,
      }}
    >
      <div style={{ padding: isMobile ? '0.75rem 0.875rem' : '1.125rem 1.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: isMobile ? '0.5rem' : '1rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: '0.375rem',
                height: '2.75rem',
                borderRadius: '9999px',
                background:
                  proj.type === 'income'
                    ? T.green
                    : isTransferNonLoan
                    ? T.accent
                    : T.red,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.2rem',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: '0.925rem',
                    fontWeight: 800,
                    color: isActive ? T.title : T.muted,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '16rem',
                  }}
                >
                  {proj.name}
                </span>
                <span
                  style={{
                    padding: '0.1rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    background:
                      proj.type === 'income'
                        ? T.greenBg
                        : isTransferNonLoan
                        ? T.accentLight
                        : T.redBg ?? T.amberBg,
                    color:
                      proj.type === 'income'
                        ? T.green
                        : isTransferNonLoan
                        ? T.accent
                        : T.red,
                    border: `1px solid ${
                      proj.type === 'income'
                        ? T.greenBorder
                        : isTransferNonLoan
                        ? T.accent + '33'
                        : T.redBorder ?? T.amberBorder
                    }`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {proj.type === 'income'
                    ? t('projections.list.typeIncome')
                    : proj.linkedLoanId
                    ? t('projections.list.typeLoan')
                    : proj.type === 'transfer'
                    ? t('projections.list.typeTransfer')
                    : t('projections.list.typeExpense')}
                </span>
                {!isActive && (
                  <span
                    style={{
                      padding: '0.1rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      background: T.pageBg,
                      color: T.muted,
                      border: `1px solid ${T.cardBorder}`,
                    }}
                  >
                    {t('projections.list.paused')}
                  </span>
                )}
                {proj.alertDisabled && (
                  <span
                    title={t('projections.list.alertsDisabledTitle')}
                    style={{
                      padding: '0.1rem 0.4rem',
                      borderRadius: '9999px',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      background: T.pageBg,
                      color: T.muted,
                      border: `1px solid ${T.cardBorder}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                    }}
                  >
                    <BellOff size={9} /> {t('projections.list.alertsDisabledBadge')}
                  </span>
                )}
              </div>

              <div
                style={{
                  fontSize: '0.72rem',
                  color: T.muted,
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                {proj.type === 'transfer' ? (
                  <>
                    <span>{acc?.name ?? '—'}</span>
                    <span>→</span>
                    <span>{toAcc?.name ?? '—'}</span>
                  </>
                ) : (
                  <>
                    {cat && <span>{cat.name}</span>}
                    {acc && <span>· {acc.name}</span>}
                  </>
                )}
                <span>· {t(`projections.frequencies.${proj.frequency}` as any, { defaultValue: proj.frequency })}</span>
                {proj.endDate && (
                  <span>· {t('projections.list.until')} {fmtDateShort(proj.endDate, dateFormat)}</span>
                )}
              </div>

              {proj.isRecurring && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    marginTop: '0.3rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      background: T.accentLight,
                      color: T.accent,
                      border: `1px solid ${T.accent}33`,
                    }}
                  >
                    {t('projections.list.recurringBadge', { day: new Date(proj.startDate + 'T00:00:00').getDate() })}
                  </span>
                  {proj.lastApplied && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        background: T.greenBg,
                        color: T.green,
                        border: `1px solid ${T.greenBorder}`,
                      }}
                    >
                      {t('projections.list.lastApplied', { date: proj.lastApplied })}
                    </span>
                  )}
                </div>
              )}

              {proj.nextOverrideAmount && (
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    background: T.amberBg,
                    color: T.amber,
                    border: `1px solid ${T.amberBorder}`,
                    marginTop: '0.3rem',
                    display: 'inline-block',
                  }}
                >
                  {(() => {
                    const currency = acc?.currency ?? baseCurrency;
                    const symbol =
                      CURRENCIES.find((c) => c.code === currency)?.symbol ?? '';
                    const amount = fmtAmount(Number(proj.nextOverrideAmount));
                    return t('projections.list.nextCharge', { amount: `${symbol}${amount} ${currency}` });
                  })()}
                </span>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div
              style={{
                fontSize: isMobile ? '0.875rem' : '1.125rem',
                fontWeight: 800,
                color:
                  proj.type === 'income'
                    ? T.green
                    : isTransferNonLoan
                    ? T.accent
                    : T.red,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              {proj.type === 'income'
                ? '+'
                : isTransferNonLoan
                ? '↔'
                : '-'}
              {fmt(
                proj.amount,
                proj.currency ?? baseCurrency,
                proj.currency ?? baseCurrency,
                rates
              )}
            </div>
            {!isMobile && (
              <div style={{ fontSize: '0.7rem', color: T.muted }}>
                {t('projections.list.perMonthApprox', { amount: fmt(monthlyAmt, displayCurrency, displayCurrency, rates) })}
              </div>
            )}
          </div>

          <div
            className="fh-no-print"
            style={{
              display: 'flex',
              gap: '0.25rem',
              flexShrink: 0,
            }}
          >
            <GhostBtn onClick={onToggleExpand} T={T} title={t('projections.list.viewDetails')}>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </GhostBtn>
            {!isMobile && (
              <GhostBtn onClick={onDuplicate} T={T} title={t('projections.list.duplicate')}>
                <Copy size={14} />
              </GhostBtn>
            )}
            <GhostBtn onClick={onEdit} T={T} title={t('projections.list.edit')}>
              <Pencil size={14} />
            </GhostBtn>
            <GhostBtn onClick={onDelete} T={T} color={T.red} title={t('projections.list.delete')}>
              <Trash2 size={14} />
            </GhostBtn>
          </div>
        </div>

        {isExpanded && (
          <div
            style={{
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: `1px solid ${T.cardBorder}`,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))',
              gap: '0.75rem',
            }}
          >
            {[
              {
                label: t('projections.list.startDate'),
                value: fmtDateDMY(proj.startDate, dateFormat),
              },
              {
                label: t('projections.list.endDate'),
                value: proj.endDate
                  ? fmtDateDMY(proj.endDate, dateFormat)
                  : t('projections.list.noEndDate'),
              },
              {
                label: t('projections.list.frequency'),
                value: t(`projections.frequencies.${proj.frequency}` as any, { defaultValue: proj.frequency }),
              },
              {
                label: t('projections.list.currency'),
                value: proj.currency ?? baseCurrency,
              },
              ...(proj.type === 'transfer'
                ? [
                    { label: t('projections.list.from'), value: acc?.name ?? '—' },
                    {
                      label: proj.linkedLoanId ? t('projections.list.loanDest') : t('projections.list.to'),
                      value: proj.linkedLoanId
                        ? `🏠 ${toAcc?.name ?? '—'}`
                        : toAcc?.name ?? '—',
                    },
                  ]
                : [
                    { label: t('projections.list.account'), value: acc?.name ?? '—' },
                    { label: t('projections.list.category'), value: cat?.name ?? '—' },
                  ]),
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: '0.625rem 0.875rem',
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
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    color: T.title,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}

            {proj.notes && (
              <div
                style={{
                  gridColumn: '1/-1',
                  padding: '0.625rem 0.875rem',
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
                  {t('projections.list.notes')}
                </div>
                <div style={{ fontSize: '0.825rem', color: T.body }}>
                  {proj.notes}
                </div>
              </div>
            )}

            <div
              style={{
                gridColumn: '1/-1',
                display: 'flex',
                gap: '0.5rem',
              }}
            >
              <button
                onClick={onToggleActive}
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: '0.75rem',
                  border: `1.5px solid ${
                    isActive ? T.amberBorder : T.greenBorder
                  }`,
                  background: isActive ? T.amberBg : T.greenBg,
                  color: isActive ? T.amber : T.green,
                  fontSize: '0.775rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {isActive
                  ? t('projections.list.pauseAction')
                  : t('projections.list.reactivateAction')}
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
