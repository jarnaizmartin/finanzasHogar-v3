// ─── Lista de movimientos reales ────────────────────────────────────────────
// Extraído de RealExpenses.tsx (Fase 3, paso 3).

import { forwardRef } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { fmtAmount } from '../../lib/i18nFormats';
import { Pencil, Trash2, ArrowUpCircle, ArrowDownCircle, Receipt } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../AppContext';
import type { RealExpense } from '../../types';
import { CURRENCIES, convertAmount, fmt, fmtDateShort } from '../../utils';
import { Card, GhostBtn, Badge, PrimaryBtn } from '../UI';

type Props = {
  filtered: RealExpense[];
  totalCount: number;
  onEdit: (e: RealExpense) => void;
  onDelete: (id: string) => void;
  onDismissDuplicate: (id: string) => void;
  onAddFirst: () => void;
  onImport: () => void;
};

const currencySymbol = (code: string): string =>
  CURRENCIES.find((c) => c.code === code)?.symbol ?? code;

export const RealExpensesList = forwardRef<HTMLDivElement, Props>(function RealExpensesList(
  { filtered, totalCount, onEdit, onDelete, onDismissDuplicate, onAddFirst, onImport },
  ref
) {
  const { t } = useTranslation();
  const { T, accounts, categories, displayCurrency, rates, dateFormat } = useApp();
  const isMobile = useIsMobile();

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {filtered.map((expense) => {
        const cat = categories.find((c) => c.id === expense.categoryId);
        const acc = accounts.find((a) => a.id === expense.accountId);
        const amountInDisplay = convertAmount(expense.amount, expense.currency, displayCurrency, rates);
        return (
          <Card key={expense.id} T={T}>
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: isMobile ? '0.625rem' : '1.25rem',
              padding: isMobile ? '0.75rem 0.875rem' : '1.125rem 1.5rem',
            }}>
              <div
                style={{
                  width: '0.25rem', alignSelf: 'stretch', borderRadius: '9999px',
                  background: cat?.color || T.cardBorder, flexShrink: 0,
                }}
              />
              {!isMobile && (
                <div
                  style={{
                    width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem',
                    background: (cat?.color ?? '#ccc') + '22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  {expense.type === 'income' ? (
                    <ArrowUpCircle size={16} color={cat?.color || T.green} />
                  ) : (
                    <ArrowDownCircle size={16} color={cat?.color || T.red} />
                  )}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: T.title }}>
                    {expense.description}
                  </span>
                  {expense.isTransfer ? (
                    <span style={{
                      padding: '0.1rem 0.5rem', borderRadius: '9999px',
                      fontSize: '0.65rem', fontWeight: 700,
                      background: T.accentLight, color: T.accent,
                      border: `1px solid ${T.accent}33`, whiteSpace: 'nowrap',
                    }}>
                      {t('realExpenses.list.badgeTransfer')}
                    </span>
                  ) : (
                    <Badge type={expense.type} T={T} />
                  )}
                </div>
                <div style={{ fontSize: '0.775rem', color: T.muted }}>
                  {expense.isTransfer
                    ? `${t('realExpenses.list.badgeTransfer')} · ${acc?.name ?? '—'}`
                    : `${cat?.name ?? '—'} · ${acc?.name ?? '—'}`}{' '}
                  · {fmtDateShort(expense.entryDate, dateFormat)}
                  {expense.notes?.includes('recurrente') && (
                    <span style={{
                      marginLeft: '0.5rem', fontSize: '0.62rem', fontWeight: 700,
                      padding: '0.1rem 0.4rem', borderRadius: '9999px',
                      background: T.accentLight, color: T.accent,
                      border: `1px solid ${T.accent}33`, verticalAlign: 'middle',
                    }}>
                      {t('realExpenses.list.badgeRecurrent')}
                    </span>
                  )}
                  {expense.isDuplicateWarning && !expense.duplicateReviewed && (
                    <span
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        marginLeft: '0.5rem', fontSize: '0.62rem', fontWeight: 700,
                        padding: '0.1rem 0.5rem', borderRadius: '9999px',
                        background: '#fff1f1', color: '#e53e3e',
                        border: '1px solid #fed7d7', verticalAlign: 'middle', cursor: 'pointer',
                      }}
                      title={t('realExpenses.list.duplicateDismissTitle')}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onDismissDuplicate(expense.id);
                      }}
                    >
                      {t('realExpenses.list.badgeDuplicate')}
                      <span style={{ fontSize: '0.7rem', fontWeight: 900, lineHeight: 1, opacity: 0.7, marginLeft: '0.1rem' }}>
                        ✕
                      </span>
                    </span>
                  )}
                  {expense.notes && !expense.notes.includes('recurrente') && (
                    <span style={{ marginLeft: '0.5rem', fontStyle: 'italic' }}>
                      · {expense.notes}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontSize: isMobile ? '0.925rem' : '1.125rem', fontWeight: 800,
                  color: expense.type === 'income' ? T.green : T.red, whiteSpace: 'nowrap',
                }}>
                  {expense.type === 'income' ? '+' : '-'}
                  {currencySymbol(expense.currency)}
                  {fmtAmount(expense.amount)}
                  {!isMobile && <>{' '}{expense.currency}</>}
                </div>
                {!isMobile && expense.currency !== displayCurrency && (
                  <div style={{ fontSize: '0.75rem', color: T.muted }}>
                    ≈ {fmt(amountInDisplay, displayCurrency, displayCurrency, rates)}
                  </div>
                )}
              </div>
              <div className="fh-no-print" style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                {!expense.isTransfer && (
                  <>
                    <GhostBtn onClick={() => onEdit(expense)} T={T}>
                      <Pencil size={15} />
                    </GhostBtn>
                    <GhostBtn onClick={() => onDelete(expense.id)} T={T} color={T.red}>
                      <Trash2 size={15} />
                    </GhostBtn>
                  </>
                )}
                {expense.isTransfer && (
                  <span style={{
                    fontSize: '0.65rem', color: T.muted, fontStyle: 'italic',
                    padding: '0.4rem 0.5rem', alignSelf: 'center',
                  }}>
                    {t('realExpenses.list.manageInTransfers')}
                  </span>
                )}
              </div>
            </div>
          </Card>
        );
      })}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: T.muted }}>
          <Receipt size={48} color={T.muted} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
          <p style={{ fontSize: '1.125rem', fontWeight: 800, color: T.title, marginBottom: '0.5rem' }}>
            {totalCount === 0
              ? t('realExpenses.list.emptyNoData')
              : t('realExpenses.list.emptyFiltered')}
          </p>
          <p style={{ fontSize: '0.875rem', color: T.muted, marginBottom: '1.5rem' }}>
            {totalCount === 0
              ? t('realExpenses.list.emptyNoDataBody')
              : t('realExpenses.list.emptyFilteredBody')}
          </p>
          {totalCount === 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <PrimaryBtn onClick={onImport}>
                {t('realExpenses.importBtn')}
              </PrimaryBtn>
              <button
                onClick={onAddFirst}
                style={{
                  background: 'none',
                  border: 'none',
                  color: T.muted,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                {t('realExpenses.list.addFirstBtn')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
