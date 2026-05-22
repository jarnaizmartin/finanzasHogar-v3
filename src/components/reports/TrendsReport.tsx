// ─── Vista "Tendencias" del módulo Reports ───────────────────────────────────
// Extraída de Reports.tsx (Fase 2.4).

import { useApp } from '../../AppContext';
import { convertAmount, fmt } from '../../utils';
import { computeTrendsStats } from '../../lib/reportsCalc';
import { ReportKpiGrid } from './ReportKpiGrid';
import { ReportSection } from './ReportSection';

type Props = {
  periodKeys: string[];
};

export function TrendsReport({ periodKeys }: Props) {
  const { T, realExpenses, accounts, displayCurrency, rates } = useApp();

  const { validExp, totalInc, totalExp, net, savRate, months } =
    computeTrendsStats(realExpenses, accounts, periodKeys, displayCurrency, rates);

  return (
    <>
      <ReportKpiGrid
        items={[
          {
            label: 'Ingresos totales',
            value: fmt(totalInc, displayCurrency, displayCurrency, rates),
            color: T.green, bg: T.greenBg, border: T.greenBorder, icon: '📈',
          },
          {
            label: 'Gastos totales',
            value: fmt(totalExp, displayCurrency, displayCurrency, rates),
            color: T.red, bg: T.redBg, border: T.redBorder, icon: '📉',
          },
          {
            label: 'Balance neto',
            value: (net >= 0 ? '+' : '') + fmt(net, displayCurrency, displayCurrency, rates),
            color: net >= 0 ? T.green : T.red,
            bg: net >= 0 ? T.greenBg : T.redBg,
            border: net >= 0 ? T.greenBorder : T.redBorder,
            icon: net >= 0 ? '✅' : '⚠️',
          },
          {
            label: 'Tasa ahorro media',
            value: savRate.toFixed(1) + '%',
            color: savRate >= 20 ? T.green : savRate >= 0 ? T.amber : T.red,
            bg: savRate >= 20 ? T.greenBg : savRate >= 0 ? T.amberBg : T.redBg,
            border: savRate >= 20 ? T.greenBorder : savRate >= 0 ? T.amberBorder : T.redBorder,
            icon: '🏦',
          },
          {
            label: 'Meses con datos',
            value: `${months.length}`,
            color: T.accent, bg: T.accentLight, border: `${T.accent}33`, icon: '📅',
          },
          {
            label: 'Movimientos',
            value: `${validExp.length}`,
            color: T.muted, bg: T.pageBg, border: T.cardBorder, icon: '🧾',
          },
        ]}
      />
      <ReportSection T={T} title="Resumen mensual histórico" scrollX>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.85rem',
          }}
        >
          <thead>
            <tr style={{ background: T.tableHead, borderBottom: `2px solid ${T.tableBorder}` }}>
              {['Mes', 'Ingresos', 'Gastos', 'Balance', 'Tasa ahorro'].map((h, i) => (
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
            {months.map((mk, i) => {
              const mExp = validExp.filter((e) => e.valueDate.slice(0, 7) === mk);
              const mInc = mExp
                .filter((e) => e.type === 'income')
                .reduce((s, e) => s + convertAmount(e.amount, e.currency, displayCurrency, rates), 0);
              const mGas = mExp
                .filter((e) => e.type === 'expense')
                .reduce((s, e) => s + convertAmount(e.amount, e.currency, displayCurrency, rates), 0);
              const mNet = mInc - mGas;
              const mRate = mInc > 0 ? (mNet / mInc) * 100 : 0;
              const [y, m] = mk.split('-').map(Number);
              const label = new Date(y, m - 1, 1).toLocaleString('es-ES', {
                month: 'long',
                year: 'numeric',
              });
              return (
                <tr
                  key={mk}
                  style={{
                    background: i % 2 === 0 ? T.tableRow : T.tableRowAlt,
                    borderBottom: `1px solid ${T.tableBorder}`,
                  }}
                >
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      fontWeight: 700,
                      color: T.title,
                      textTransform: 'capitalize' as const,
                    }}
                  >
                    {label}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: T.green }}>
                    {fmt(mInc, displayCurrency, displayCurrency, rates)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: T.red }}>
                    {fmt(mGas, displayCurrency, displayCurrency, rates)}
                  </td>
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'right',
                      fontWeight: 800,
                      color: mNet >= 0 ? T.green : T.red,
                    }}
                  >
                    {mNet >= 0 ? '+' : ''}
                    {fmt(mNet, displayCurrency, displayCurrency, rates)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <span
                      style={{
                        fontWeight: 800,
                        color: mRate >= 20 ? T.green : mRate >= 0 ? T.amber : T.red,
                      }}
                    >
                      {mRate.toFixed(1)}%
                    </span>
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
