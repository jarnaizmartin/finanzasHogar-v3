import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  return (
    <>
      <div ref={sentinelRef} style={{ height: 1 }} />
      <StickyCompactBar
        title={t('trends.stickyTitle')}
        sentinelRef={sentinelRef}
        kpis={[
          {
            label: t('trends.stickyIncome'),
            icon: '↑',
            value: fmt(stats.totalIncome, baseCurrency, baseCurrency, rates),
            color: T.green,
          },
          {
            label: t('trends.stickyExpenses'),
            icon: '↓',
            value: fmt(stats.totalExpenses, baseCurrency, baseCurrency, rates),
            color: T.red,
          },
          {
            label: t('trends.stickyNet'),
            icon: '=',
            value: `${stats.totalNet >= 0 ? '+' : ''}${fmt(stats.totalNet, baseCurrency, baseCurrency, rates)}`,
            color: stats.totalNet >= 0 ? T.green : T.red,
          },
          {
            label: t('trends.stickySavings'),
            icon: '🏦',
            value: `${stats.avgSavingsRate.toFixed(1)}%`,
            color: stats.avgSavingsRate >= 20 ? T.green : stats.avgSavingsRate >= 10 ? T.amber : T.red,
          },
          {
            label: t('trends.stickyTrend'),
            icon: stats.trend === 'up' ? '🚀' : stats.trend === 'down' ? '📉' : '➡️',
            value: stats.trend === 'up' ? t('trends.trendUpShort') : stats.trend === 'down' ? t('trends.trendDownShort') : t('trends.trendStable'),
            color: stats.trend === 'up' ? T.green : stats.trend === 'down' ? T.red : T.amber,
          },
        ]}
        rightSlot={
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: T.muted, whiteSpace: 'nowrap' }}>
            {rangeMonths === 'all' ? t('trends.stickyHistoric') : `${rangeMonths}m`} · {stats.monthCount}{' '}
            {t('trends.months', { count: stats.monthCount })}
          </span>
        }
      />
    </>
  );
}
