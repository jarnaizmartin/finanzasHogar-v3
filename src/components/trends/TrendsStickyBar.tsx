import { StickyCompactBar } from '../StickyCompactBar';
import { fmt } from '../../utils';
import type { TrendsStats } from '../../lib/trendsCalc';
import type { Theme } from '../../theme';

interface Props {
  T: Theme;
  stats: TrendsStats;
  baseCurrency: string;
  rates: Record<string, number>;
  rangeMonths: number | 'all';
  sentinelRef: React.RefObject<HTMLDivElement>;
}

export function TrendsStickyBar({ T, stats, baseCurrency, rates, rangeMonths, sentinelRef }: Props) {
  return (
    <>
      <div ref={sentinelRef} style={{ height: 1 }} />
      <StickyCompactBar
        title="📈 Tendencias — Resumen"
        sentinelRef={sentinelRef}
        kpis={[
          {
            label: 'Ingresos',
            icon: '↑',
            value: fmt(stats.totalIncome, baseCurrency, baseCurrency, rates),
            color: T.green,
          },
          {
            label: 'Gastos',
            icon: '↓',
            value: fmt(stats.totalExpenses, baseCurrency, baseCurrency, rates),
            color: T.red,
          },
          {
            label: 'Neto',
            icon: '=',
            value: `${stats.totalNet >= 0 ? '+' : ''}${fmt(stats.totalNet, baseCurrency, baseCurrency, rates)}`,
            color: stats.totalNet >= 0 ? T.green : T.red,
          },
          {
            label: 'Ahorro medio',
            icon: '🏦',
            value: `${stats.avgSavingsRate.toFixed(1)}%`,
            color: stats.avgSavingsRate >= 20 ? T.green : stats.avgSavingsRate >= 10 ? T.amber : T.red,
          },
          {
            label: 'Tendencia',
            icon: stats.trend === 'up' ? '🚀' : stats.trend === 'down' ? '📉' : '➡️',
            value: stats.trend === 'up' ? 'Mejora' : stats.trend === 'down' ? 'Empeora' : 'Estable',
            color: stats.trend === 'up' ? T.green : stats.trend === 'down' ? T.red : T.amber,
          },
        ]}
        rightSlot={
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: T.muted, whiteSpace: 'nowrap' }}>
            {rangeMonths === 'all' ? 'Histórico' : `${rangeMonths}m`} · {stats.monthCount}{' '}
            {stats.monthCount !== 1 ? 'meses' : 'mes'}
          </span>
        }
      />
    </>
  );
}
