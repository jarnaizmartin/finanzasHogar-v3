// ─── Vista "Movimientos" del módulo Reports ──────────────────────────────────
// Extraída de Reports.tsx (Fase 2.4).

import type { RealExpense } from '../../types';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../AppContext';
import { fmt, fmtDateDMY } from '../../utils';
import { fmtAmount } from '../../lib/i18nFormats';
import { ReportKpiGrid } from './ReportKpiGrid';
import { ReportBadge } from './ReportBadge';
import { ReportSection } from './ReportSection';

type Totals = {
  realIncome: number;
  realExpense: number;
  realNet: number;
  savingsRate: number;
  pIncome: number;
  pExpense: number;
};

type CatRow = {
  catId: string;
  type: 'income' | 'expense';
  projected: number;
  real: number;
};

type Props = {
  totals: Totals;
  catRows: CatRow[];
  periodReals: RealExpense[];
};

export function MovementsReport({ totals, catRows, periodReals }: Props) {
  const { t } = useTranslation();
  const { T, categories, accounts, displayCurrency, rates, dateFormat } = useApp();

  return (
    <>
      <ReportKpiGrid
        items={[
          {
            label: t('reports.kpiRealIncome'),
            value: fmt(totals.realIncome, displayCurrency, displayCurrency, rates),
            color: T.green, bg: T.greenBg, border: T.greenBorder, icon: '📈',
          },
          {
            label: t('reports.kpiRealExpenses'),
            value: fmt(totals.realExpense, displayCurrency, displayCurrency, rates),
            color: T.red, bg: T.redBg, border: T.redBorder, icon: '📉',
          },
          {
            label: t('reports.kpiNetBalance'),
            value:
              (totals.realNet >= 0 ? '+' : '') +
              fmt(totals.realNet, displayCurrency, displayCurrency, rates),
            color: totals.realNet >= 0 ? T.green : T.red,
            bg: totals.realNet >= 0 ? T.greenBg : T.redBg,
            border: totals.realNet >= 0 ? T.greenBorder : T.redBorder,
            icon: totals.realNet >= 0 ? '✅' : '⚠️',
          },
          {
            label: t('reports.kpiSavingsRate'),
            value: totals.savingsRate.toFixed(1) + '%',
            color:
              totals.savingsRate >= 20 ? T.green
              : totals.savingsRate >= 0 ? T.amber : T.red,
            bg:
              totals.savingsRate >= 20 ? T.greenBg
              : totals.savingsRate >= 0 ? T.amberBg : T.redBg,
            border:
              totals.savingsRate >= 20 ? T.greenBorder
              : totals.savingsRate >= 0 ? T.amberBorder : T.redBorder,
            icon: '🏦',
          },
          {
            label: t('reports.kpiProjIncome'),
            value: fmt(totals.pIncome, displayCurrency, displayCurrency, rates),
            color: T.muted, bg: T.pageBg, border: T.cardBorder, icon: '📋',
          },
          {
            label: t('reports.kpiProjExpenses'),
            value: fmt(totals.pExpense, displayCurrency, displayCurrency, rates),
            color: T.muted, bg: T.pageBg, border: T.cardBorder, icon: '📋',
          },
        ]}
      />

      {/* Tabla por categoría */}
      <ReportSection
        T={T}
        title={t('reports.sectionByCategory')}
        subtitle={t('reports.sectionByCategorySub')}
      >
        {catRows.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: T.muted }}>
            {t('reports.noDataPeriod')}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.85rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: T.tableHead,
                    borderBottom: `2px solid ${T.tableBorder}`,
                  }}
                >
                  {[t('reports.colCategory'), t('reports.colType'), t('reports.colProjected'), t('reports.colReal'), t('reports.colDiff'), t('reports.colExecPct')].map(
                    (h, i) => (
                      <th
                        key={h}
                        style={{
                          padding: '0.75rem 1.25rem',
                          textAlign: i === 0 ? 'left' : 'right',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          letterSpacing: '0.07em',
                          textTransform: 'uppercase' as const,
                          color: T.muted,
                          whiteSpace: 'nowrap' as const,
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {catRows.map((row, i) => {
                  const cat = categories.find((c) => c.id === row.catId);
                  const diff = row.real - row.projected;
                  const pct = row.projected > 0 ? (row.real / row.projected) * 100 : null;
                  const isExpense = row.type === 'expense';
                  const overBudget = isExpense && diff > 0 && row.projected > 0;
                  const diffColor = isExpense
                    ? diff > 0 ? T.red : diff < 0 ? T.green : T.muted
                    : diff > 0 ? T.green : diff < 0 ? T.amber : T.muted;
                  return (
                    <tr
                      key={row.catId}
                      style={{
                        background: i % 2 === 0 ? T.tableRow : T.tableRowAlt,
                        borderBottom: `1px solid ${T.tableBorder}`,
                      }}
                    >
                      <td style={{ padding: '0.75rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <span
                            style={{
                              width: '0.625rem',
                              height: '0.625rem',
                              borderRadius: '50%',
                              background: cat?.color ?? T.muted,
                              display: 'inline-block',
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontWeight: 600, color: T.title }}>
                            {cat?.name ?? t('reports.noCategory')}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>
                        <ReportBadge T={T} variant={isExpense ? 'danger' : 'success'}>
                          {isExpense ? t('reports.typeExpense') : t('reports.typeIncome')}
                        </ReportBadge>
                      </td>
                      <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right', color: T.muted }}>
                        {row.projected > 0
                          ? fmt(row.projected, displayCurrency, displayCurrency, rates)
                          : '—'}
                      </td>
                      <td
                        style={{
                          padding: '0.75rem 1.25rem',
                          textAlign: 'right',
                          fontWeight: 700,
                          color: isExpense ? T.red : T.green,
                        }}
                      >
                        {fmt(row.real, displayCurrency, displayCurrency, rates)}
                      </td>
                      <td
                        style={{
                          padding: '0.75rem 1.25rem',
                          textAlign: 'right',
                          fontWeight: 700,
                          color: diffColor,
                        }}
                      >
                        {diff !== 0
                          ? (diff > 0 ? '+' : '') +
                            fmt(diff, displayCurrency, displayCurrency, rates)
                          : '—'}
                      </td>
                      <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>
                        {pct !== null ? (
                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              color: overBudget ? T.red : pct >= 90 ? T.green : T.amber,
                            }}
                          >
                            {pct.toFixed(0)}%{overBudget && ' ⚠️'}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr
                  style={{
                    background: T.tableHead,
                    borderTop: `2px solid ${T.tableBorder}`,
                  }}
                >
                  <td
                    colSpan={2}
                    style={{
                      padding: '0.875rem 1.25rem',
                      fontWeight: 800,
                      color: T.title,
                      fontSize: '0.8rem',
                    }}
                  >
                    {t('reports.footerTotal')}
                  </td>
                  <td
                    style={{
                      padding: '0.875rem 1.25rem',
                      textAlign: 'right',
                      fontWeight: 800,
                      color: T.muted,
                    }}
                  >
                    {/* Neto proyectado = ingresos − gastos (no la suma aritmética). */}
                    {(() => {
                      const projNet = totals.pIncome - totals.pExpense;
                      return (projNet >= 0 ? '+' : '') + fmt(projNet, displayCurrency, displayCurrency, rates);
                    })()}
                  </td>
                  <td
                    style={{
                      padding: '0.875rem 1.25rem',
                      textAlign: 'right',
                      fontWeight: 800,
                      color: totals.realNet >= 0 ? T.green : T.red,
                    }}
                  >
                    {/* Neto real = ingresos − gastos (bug B10: antes sumaba ambos). */}
                    {(totals.realNet >= 0 ? '+' : '') +
                      fmt(totals.realNet, displayCurrency, displayCurrency, rates)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </ReportSection>

      {/* Lista de movimientos */}
      {periodReals.length > 0 && (
        <ReportSection
          T={T}
          title={t('reports.sectionMovements')}
          subtitle={t('reports.sectionMovementsSub', { count: periodReals.length })}
          scrollX
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.825rem',
            }}
          >
            <thead>
              <tr
                style={{
                  background: T.tableHead,
                  borderBottom: `1px solid ${T.tableBorder}`,
                }}
              >
                {[t('reports.colValueDate'), t('reports.colDescription'), t('reports.colCategory'), t('reports.colAccount'), t('reports.colAmount')].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: '0.65rem 1rem',
                      textAlign: i < 4 ? 'left' : 'right',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase' as const,
                      color: T.muted,
                      whiteSpace: 'nowrap' as const,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...periodReals]
                .sort((a, b) => b.valueDate.localeCompare(a.valueDate))
                .map((e, i) => {
                  const cat = categories.find((c) => c.id === e.categoryId);
                  const acc = accounts.find((a) => a.id === e.accountId);
                  return (
                    <tr
                      key={e.id}
                      style={{
                        background: i % 2 === 0 ? T.tableRow : T.tableRowAlt,
                        borderBottom: `1px solid ${T.tableBorder}`,
                      }}
                    >
                      <td
                        style={{
                          padding: '0.625rem 1rem',
                          color: T.muted,
                          whiteSpace: 'nowrap' as const,
                        }}
                      >
                        {fmtDateDMY(e.valueDate, dateFormat)}
                      </td>
                      <td
                        style={{
                          padding: '0.625rem 1rem',
                          fontWeight: 600,
                          color: T.title,
                          maxWidth: '16rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap' as const,
                        }}
                      >
                        {e.description}
                      </td>
                      <td style={{ padding: '0.625rem 1rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <span
                            style={{
                              width: '0.5rem',
                              height: '0.5rem',
                              borderRadius: '50%',
                              background: cat?.color ?? T.muted,
                              display: 'inline-block',
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ color: T.body }}>{cat?.name ?? '—'}</span>
                        </span>
                      </td>
                      <td style={{ padding: '0.625rem 1rem', color: T.muted }}>
                        {acc?.name ?? '—'}
                      </td>
                      <td
                        style={{
                          padding: '0.625rem 1rem',
                          textAlign: 'right',
                          fontWeight: 700,
                          color: e.type === 'income' ? T.green : T.red,
                          whiteSpace: 'nowrap' as const,
                        }}
                      >
                        {e.type === 'income' ? '+' : '-'}
                        {fmtAmount(e.amount)}{' '}
                        {e.currency}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </ReportSection>
      )}
    </>
  );
}
