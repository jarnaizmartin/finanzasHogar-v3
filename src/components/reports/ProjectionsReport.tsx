// ─── Vista "Proyecciones" del módulo Reports ─────────────────────────────────
// Extraída de Reports.tsx (Fase 2.4).

import { useTranslation } from 'react-i18next';
import { useApp } from '../../AppContext';
import { fmt, fmtDateDMY, FREQUENCIES } from '../../utils';
import { ReportKpiGrid } from './ReportKpiGrid';
import { ReportBadge } from './ReportBadge';
import { ReportSection } from './ReportSection';

export function ProjectionsReport() {
  const { t } = useTranslation();
  const {
    T,
    projections,
    categories,
    accounts,
    baseCurrency,
    rates,
    dateFormat,
  } = useApp();

  return (
    <>
      <ReportKpiGrid
        items={[
          {
            label: t('reports.kpiTotalProjections'),
            value: `${projections.length}`,
            color: T.accent, bg: T.accentLight, border: `${T.accent}33`, icon: '📋',
          },
          {
            label: t('reports.kpiMonthlyIncome'),
            value: fmt(
              projections
                .filter((p) => p.type === 'income')
                .reduce((s, p) => {
                  const f = FREQUENCIES.find((f) => f.value === p.frequency);
                  return s + (f ? p.amount / f.months : 0);
                }, 0),
              baseCurrency, baseCurrency, rates
            ),
            color: T.green, bg: T.greenBg, border: T.greenBorder, icon: '📈',
          },
          {
            label: t('reports.kpiMonthlyExpenses'),
            value: fmt(
              projections
                .filter((p) => p.type === 'expense')
                .reduce((s, p) => {
                  const f = FREQUENCIES.find((f) => f.value === p.frequency);
                  return s + (f ? p.amount / f.months : 0);
                }, 0),
              baseCurrency, baseCurrency, rates
            ),
            color: T.red, bg: T.redBg, border: T.redBorder, icon: '📉',
          },
        ]}
      />
      <ReportSection T={T} title={t('reports.sectionProjectionsList')} scrollX>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.85rem',
          }}
        >
          <thead>
            <tr style={{ background: T.tableHead, borderBottom: `2px solid ${T.tableBorder}` }}>
              {[
                t('reports.colConcept'), t('reports.colType'), t('reports.colCategory'), t('reports.colAccount'), t('reports.colAmount'),
                t('reports.colFrequency'), t('reports.colEquivMonth'), t('reports.colStart'), t('reports.colEnd'),
              ].map((h, i) => (
                <th
                  key={h}
                  style={{
                    padding: '0.75rem 1rem',
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
              ))}
            </tr>
          </thead>
          <tbody>
            {projections.map((p, i) => {
              const cat = categories.find((c) => c.id === p.categoryId);
              const acc = accounts.find((a) => a.id === p.accountId);
              const freq = FREQUENCIES.find((f) => f.value === p.frequency);
              const monthly = freq ? p.amount / freq.months : p.amount;
              return (
                <tr
                  key={p.id}
                  style={{
                    background: i % 2 === 0 ? T.tableRow : T.tableRowAlt,
                    borderBottom: `1px solid ${T.tableBorder}`,
                  }}
                >
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: T.title }}>
                    {p.name}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <ReportBadge T={T} variant={p.type === 'expense' ? 'danger' : 'success'}>
                      {p.type === 'income' ? t('reports.typeIncome') : t('reports.typeExpense')}
                    </ReportBadge>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: T.body }}>
                    {cat?.name ?? '—'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: T.body }}>
                    {acc?.name ?? '—'}
                  </td>
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'right',
                      fontWeight: 700,
                      color: p.type === 'income' ? T.green : T.red,
                    }}
                  >
                    {fmt(p.amount, acc?.currency ?? baseCurrency, acc?.currency ?? baseCurrency, rates)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: T.muted }}>
                    {freq?.label ?? '—'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: T.muted }}>
                    {fmt(monthly, acc?.currency ?? baseCurrency, acc?.currency ?? baseCurrency, rates)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: T.muted, whiteSpace: 'nowrap' as const }}>
                    {fmtDateDMY(p.startDate, dateFormat)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: T.muted, whiteSpace: 'nowrap' as const }}>
                    {p.endDate ? fmtDateDMY(p.endDate, dateFormat) : t('reports.noEndDate')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ReportSection>
    </>
  );
}
