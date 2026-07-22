// src/components/bank-import/Step3Preview.tsx
//
// Paso 3 del wizard de importación bancaria.
// KPI de resumen, banner de reglas y lista interactiva de movimientos.
//
// Extraído de BankImportModal.tsx (refactor Fase 1 — commit 6/8).
// Estado controlado por el padre: facilita la migración a useBankImport (commit 8).

import type { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

import type { ImportRow, Category, RealExpense } from '../../types';
import { fmtDateDMY } from '../../utils';
import { fmtAmount } from '../../lib/i18nFormats';
import type { Theme } from '../../theme';

// Theme tokens consumidos — subset de T.
type Props = {
  T: Theme;
  importRows: ImportRow[];
  setImportRows: Dispatch<SetStateAction<ImportRow[]>>;
  setManuallyCategorized: Dispatch<SetStateAction<Set<string>>>;
  realExpenses: RealExpense[];
  categories: Category[];
  dateFormat: string;
  newCount: number;
  dupCount: number;
  discardedCount: number;
  setShowRulesEditor: Dispatch<SetStateAction<boolean>>;
};

export function Step3Preview({
  T,
  importRows,
  setImportRows,
  setManuallyCategorized,
  realExpenses,
  categories,
  dateFormat,
  newCount,
  dupCount,
  discardedCount,
  setShowRulesEditor,
}: Props) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
        }}
      >
        {[
          {
            label: t('bankImport.preview.kpiNew'),
            value: newCount,
            color: T.green,
            bg: T.greenBg,
            border: T.greenBorder,
          },
          {
            label: t('bankImport.preview.kpiDuplicate'),
            value: dupCount,
            color: T.amber,
            bg: T.amberBg,
            border: T.amberBorder,
          },
          {
            label: t('bankImport.preview.kpiDiscarded'),
            value: discardedCount,
            color: T.muted,
            bg: T.pageBg,
            border: T.cardBorder,
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              padding: '0.5rem 0.625rem',
              borderRadius: '0.75rem',
              background: item.bg,
              border: `1px solid ${item.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <div
              style={{
                fontSize: '1.125rem',
                fontWeight: 800,
                color: item.color,
                lineHeight: 1,
              }}
            >
              {item.value}
            </div>
            <div
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: item.color,
                textTransform: 'uppercase' as const,
                lineHeight: 1.2,
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Banner de reglas automáticas — siempre visible en paso 3 */}
      <div
        style={{
          padding: '0.875rem 1rem',
          borderRadius: '0.875rem',
          background: T.pageBg,
          border: `1px solid ${T.cardBorder}`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            fontSize: '0.775rem',
            color: T.muted,
            lineHeight: 1.5,
            flex: 1,
            minWidth: 0,
          }}
        >
          <span style={{ fontWeight: 700, color: T.body }}>
            {t('bankImport.preview.rulesTitle')}
          </span>
          <br />
          {importRows.filter(
            (r) => r.status === 'new' && !r.categoryId
          ).length > 0 ? (
            <span style={{ color: T.amber }}>
              {t('bankImport.preview.uncategorizedWarning', {
                count: importRows.filter((r) => r.status === 'new' && !r.categoryId).length,
              })}
            </span>
          ) : (
            <span>{t('bankImport.preview.allCategorized')}</span>
          )}
        </div>
        <button
          onClick={() => setShowRulesEditor(true)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.75rem',
            border: `1.5px solid ${T.accent}44`,
            background: T.accentLight,
            color: T.accent,
            fontSize: '0.775rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {t('bankImport.preview.manageRules')}
        </button>
      </div>

      {/* B2 — Lista sin maxHeight fijo: el body del modal ya hace
         scroll (height:90vh + flex column). Si forzamos un
         maxHeight aquí, queda hueco entre la última fila y el
         footer cuando hay pocos movimientos visibles. */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.375rem',
        }}
      >
        {importRows.map((row) => {
          const dupRow = row.duplicateOf
            ? realExpenses.find((e) => e.id === row.duplicateOf)
            : null;
          const statusColors = {
            new: {
              bg: T.greenBg,
              border: T.greenBorder,
              color: T.green,
            },
            duplicate: {
              bg: T.amberBg,
              border: T.amberBorder,
              color: T.amber,
            },
            discarded: {
              bg: T.pageBg,
              border: T.cardBorder,
              color: T.muted,
            },
          };
          const sc = statusColors[row.status];
          return (
            <div
              key={row.id}
              style={{
                padding: '0.75rem 0.875rem',
                borderRadius: '0.75rem',
                background: sc.bg,
                border: `1.5px solid ${sc.border}`,
                opacity: row.status === 'discarded' ? 0.5 : 1,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                  {row.type === 'income' ? '📈' : '📉'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      color: T.title,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {row.description}
                  </div>
                  <div
                    style={{ fontSize: '0.68rem', color: T.muted }}
                  >
                    {fmtDateDMY(row.valueDate, dateFormat)}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    color: row.type === 'income' ? T.green : T.red,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {row.type === 'income' ? '+' : '-'}
                  {fmtAmount(row.amount)}{' '}
                  {row.currency}
                </div>
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '9999px',
                    background: sc.color,
                    color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  {row.status === 'new'
                    ? t('bankImport.preview.statusNew')
                    : row.status === 'duplicate'
                    ? t('bankImport.preview.statusDuplicate')
                    : t('bankImport.preview.statusDiscarded')}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '0.375rem',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: T.muted,
                    flexShrink: 0,
                  }}
                >
                  {t('bankImport.preview.categoryLabel')}
                </span>
                <select
                  value={row.categoryId}
                  onChange={(e) => {
                    setManuallyCategorized(
                      (prev) => new Set([...prev, row.id])
                    );
                    setImportRows((prev) =>
                      prev.map((r) =>
                        r.id === row.id
                          ? { ...r, categoryId: e.target.value }
                          : r
                      )
                    );
                  }}
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${T.cardBorder}`,
                    background: T.inputBg,
                    color: T.inputText,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="">{t('bankImport.preview.noCategory')}</option>
                  {categories
                    .filter((c) => c.type === row.type)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
                {row.status !== 'discarded' && (
                  <button
                    onClick={() =>
                      setImportRows((prev) =>
                        prev.map((r) =>
                          r.id === row.id
                            ? { ...r, status: 'discarded' }
                            : r
                        )
                      )
                    }
                    style={{
                      fontSize: '0.68rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${T.cardBorder}`,
                      background: T.btnSecBg,
                      color: T.muted,
                      cursor: 'pointer',
                    }}
                  >
                    {t('bankImport.preview.discardBtn')}
                  </button>
                )}
                {row.status === 'discarded' && (
                  <button
                    onClick={() =>
                      setImportRows((prev) =>
                        prev.map((r) =>
                          r.id === row.id
                            ? {
                                ...r,
                                status: row.duplicateOf
                                  ? 'duplicate'
                                  : 'new',
                              }
                            : r
                        )
                      )
                    }
                    style={{
                      fontSize: '0.68rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${T.greenBorder}`,
                      background: T.greenBg,
                      color: T.green,
                      cursor: 'pointer',
                    }}
                  >
                    {t('bankImport.preview.restoreBtn')}
                  </button>
                )}
                {row.status === 'duplicate' && (
                  <button
                    onClick={() =>
                      setImportRows((prev) =>
                        prev.map((r) =>
                          r.id === row.id
                            ? { ...r, status: 'new' }
                            : r
                        )
                      )
                    }
                    style={{
                      fontSize: '0.68rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${T.accent}44`,
                      background: T.accentLight,
                      color: T.accent,
                      cursor: 'pointer',
                    }}
                  >
                    {t('bankImport.preview.importAnywayBtn')}
                  </button>
                )}
              </div>
              {row.status === 'duplicate' && dupRow && (
                <div
                  style={{
                    marginTop: '0.375rem',
                    padding: '0.375rem 0.625rem',
                    borderRadius: '0.5rem',
                    background: T.amberBg,
                    border: `1px solid ${T.amberBorder}`,
                    fontSize: '0.68rem',
                    color: T.amber,
                  }}
                >
                  {t('bankImport.preview.possibleDuplicate', {
                    desc: dupRow.description,
                    date: fmtDateDMY(dupRow.valueDate, dateFormat),
                    amount: fmtAmount(dupRow.amount),
                    currency: dupRow.currency,
                  })}
                </div>
              )}
            </div>
          );
        })}
        {importRows.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              color: T.muted,
              fontSize: '0.875rem',
            }}
          >
            {t('bankImport.preview.noMovements')}
          </div>
        )}
      </div>
    </div>
  );
}
