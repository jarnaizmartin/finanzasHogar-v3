import { fmt } from '../../utils';
import type { TrendsStats } from '../../lib/trendsCalc';
import type { Theme } from '../../theme';

interface Props {
  T: Theme;
  stats: TrendsStats;
  baseCurrency: string;
  rates: Record<string, number>;
}

export function TrendsStatsGrid({ T, stats, baseCurrency, rates }: Props) {
  const items = [
    {
      label: 'Ingresos totales',
      value: fmt(stats.totalIncome, baseCurrency, baseCurrency, rates),
      color: T.green, bg: T.greenBg, border: T.greenBorder, icon: '📈',
    },
    {
      label: 'Gastos totales',
      value: fmt(stats.totalExpenses, baseCurrency, baseCurrency, rates),
      color: T.red, bg: T.redBg, border: T.redBorder, icon: '📉',
    },
    {
      label: 'Balance neto',
      value: (stats.totalNet >= 0 ? '+' : '') + fmt(stats.totalNet, baseCurrency, baseCurrency, rates),
      color: stats.totalNet >= 0 ? T.green : T.red,
      bg: stats.totalNet >= 0 ? T.greenBg : T.redBg,
      border: stats.totalNet >= 0 ? T.greenBorder : T.redBorder,
      icon: stats.totalNet >= 0 ? '✅' : '⚠️',
    },
    {
      label: 'Tasa de ahorro media',
      value: stats.avgSavingsRate.toFixed(1),
      suffix: '%',
      color: stats.avgSavingsRate >= 20 ? T.green : stats.avgSavingsRate >= 10 ? T.amber : T.red,
      bg: stats.avgSavingsRate >= 20 ? T.greenBg : stats.avgSavingsRate >= 10 ? T.amberBg : T.redBg,
      border: stats.avgSavingsRate >= 20 ? T.greenBorder : stats.avgSavingsRate >= 10 ? T.amberBorder : T.redBorder,
      icon: '🏦',
    },
    {
      label: 'Tendencia de ahorro',
      value: stats.trend === 'up' ? 'Mejorando' : stats.trend === 'down' ? 'Empeorando' : 'Estable',
      color: stats.trend === 'up' ? T.green : stats.trend === 'down' ? T.red : T.amber,
      bg: stats.trend === 'up' ? T.greenBg : stats.trend === 'down' ? T.redBg : T.amberBg,
      border: stats.trend === 'up' ? T.greenBorder : stats.trend === 'down' ? T.redBorder : T.amberBorder,
      icon: stats.trend === 'up' ? '🚀' : stats.trend === 'down' ? '📉' : '➡️',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(14rem, 1fr))',
        gap: '1rem',
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '1rem',
            background: item.bg,
            border: `1px solid ${item.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: item.color,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {item.label}
            </div>
          </div>
          <div style={{ fontSize: '1.375rem', fontWeight: 800, color: item.color, letterSpacing: '-0.02em' }}>
            {item.value}
            {item.suffix && (
              <span style={{ fontSize: '0.875rem', fontWeight: 600, marginLeft: '0.25rem' }}>
                {item.suffix}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
