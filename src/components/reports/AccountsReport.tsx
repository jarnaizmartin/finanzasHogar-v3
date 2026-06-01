// ─── Vista "Cuentas" del módulo Reports ──────────────────────────────────────
// Extraída de Reports.tsx (Fase 2.4).

import { useTranslation } from 'react-i18next';
import { useApp } from '../../AppContext';
import { convertAmount, fmt, fmtDateDMY } from '../../utils';
import { ReportKpiGrid } from './ReportKpiGrid';
import { ReportBadge } from './ReportBadge';
import { ReportSection } from './ReportSection';

export function AccountsReport() {
  const { t } = useTranslation();
  const {
    T,
    accounts,
    baseCurrency,
    displayCurrency,
    rates,
    realBalanceMap,
    dateFormat,
  } = useApp();

  return (
    <>
      <ReportKpiGrid
        items={[
          {
            label: t('reports.kpiTotalAccounts'),
            value: `${accounts.length}`,
            color: T.accent, bg: T.accentLight, border: `${T.accent}33`, icon: '🏦',
          },
          {
            label: t('reports.kpiBaseWealth'),
            value: fmt(
              accounts.reduce(
                (s, a) =>
                  s + convertAmount(a.balance, a.currency ?? baseCurrency, displayCurrency, rates),
                0
              ),
              displayCurrency, displayCurrency, rates
            ),
            color: T.muted, bg: T.pageBg, border: T.cardBorder, icon: '💰',
          },
          {
            label: t('reports.kpiRealWealth'),
            value: fmt(
              accounts.reduce((s, a) => {
                const rb = realBalanceMap[a.id]?.realBalance ?? a.balance;
                return s + convertAmount(rb, a.currency ?? baseCurrency, displayCurrency, rates);
              }, 0),
              displayCurrency, displayCurrency, rates
            ),
            color: T.green, bg: T.greenBg, border: T.greenBorder, icon: '✅',
          },
        ]}
      />
      <ReportSection T={T} title={t('reports.sectionAccountDetail')} scrollX>
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
              {[
                t('reports.colAccount'),
                t('reports.colCurrency'),
                t('reports.colBalanceDate'),
                t('reports.colBaseBalance'),
                t('reports.colRealBalance'),
                t('reports.colMinimum'),
                t('reports.colStatus'),
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
            {accounts.map((acc, i) => {
              const rb = realBalanceMap[acc.id];
              const belowMin =
                acc.minBalance > 0 &&
                (rb?.realBalance ?? acc.balance) < acc.minBalance;
              return (
                <tr
                  key={acc.id}
                  style={{
                    background: i % 2 === 0 ? T.tableRow : T.tableRowAlt,
                    borderBottom: `1px solid ${T.tableBorder}`,
                  }}
                >
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: T.title }}>
                    {acc.name}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: T.muted }}>
                    {acc.currency ?? baseCurrency}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: T.muted, whiteSpace: 'nowrap' as const }}>
                    {fmtDateDMY(acc.date, dateFormat)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: T.muted }}>
                    {fmt(acc.balance, acc.currency ?? baseCurrency, acc.currency ?? baseCurrency, rates)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: belowMin ? T.red : T.green }}>
                    {fmt(rb?.realBalance ?? acc.balance, acc.currency ?? baseCurrency, acc.currency ?? baseCurrency, rates)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: T.muted }}>
                    {acc.minBalance > 0
                      ? fmt(acc.minBalance, acc.currency ?? baseCurrency, acc.currency ?? baseCurrency, rates)
                      : '—'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <ReportBadge T={T} variant={belowMin ? 'danger' : 'success'}>
                      {belowMin ? t('reports.statusBelowMin') : t('reports.statusOk')}
                    </ReportBadge>
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
