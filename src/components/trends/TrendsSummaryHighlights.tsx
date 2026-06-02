import { useTranslation } from 'react-i18next';
import { fmt } from '../../utils';
import { PrintFooter } from '../UI';
import type { TrendsStats } from '../../lib/trendsCalc';
import type { Theme } from '../../theme';

interface Props {
  T: Theme;
  stats: TrendsStats;
  baseCurrency: string;
  rates: Record<string, number>;
  rangeMonths: number | 'all';
}

export function TrendsSummaryHighlights({ T, stats, baseCurrency, rates, rangeMonths }: Props) {
  const { t } = useTranslation();
  const items = [
    {
      label: t('trends.highlightBestIncome'),
      value: stats.bestIncomeMonth?.label ?? '—',
      sub: stats.bestIncomeMonth ? fmt(stats.bestIncomeMonth.income, baseCurrency, baseCurrency, rates) : '—',
      subColor: T.green,
    },
    {
      label: t('trends.highlightWorstExpense'),
      value: stats.worstExpenseMonth?.label ?? '—',
      sub: stats.worstExpenseMonth ? fmt(stats.worstExpenseMonth.expenses, baseCurrency, baseCurrency, rates) : '—',
      subColor: T.red,
    },
    {
      label: t('trends.highlightTopCategory'),
      value: stats.topCategory?.name ?? '—',
      sub: stats.topCategory ? fmt(stats.topCategory.total, baseCurrency, baseCurrency, rates) : '—',
      subColor: T.red,
    },
    {
      label: t('trends.highlightMonthsAnalyzed'),
      value: t('trends.monthsCount', { count: stats.monthCount }),
      sub: rangeMonths === 'all' ? t('trends.allHistory') : t('trends.lastNMonths', { n: rangeMonths }),
      subColor: T.muted,
    },
  ];

  return (
    <>
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '1rem',
          background: T.accentLight,
          border: `1px solid ${T.accent}33`,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        {items.map((item) => (
          <div key={item.label} style={{ flex: 1, minWidth: '12rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
              {item.label}
            </div>
            <div style={{ fontSize: '0.925rem', fontWeight: 800, color: T.title }}>{item.value}</div>
            <div style={{ fontSize: '0.775rem', color: item.subColor, fontWeight: 600 }}>{item.sub}</div>
          </div>
        ))}
      </div>
      <PrintFooter section={t('trends.title')} />
    </>
  );
}
