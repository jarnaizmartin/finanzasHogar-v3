import {
  ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { Card } from '../UI';
import { TrendsTooltip } from './TrendsTooltip';
import type { MonthlyDataPoint } from '../../lib/trendsCalc';
import type { Theme } from '../../theme';
import { fmtCompact } from '../../lib/i18nFormats';

const fmtAxis = fmtCompact;

interface Props {
  T: Theme;
  monthlyData: MonthlyDataPoint[];
  containerRef: React.RefObject<HTMLDivElement>;
  width: number;
}

export function TrendsChartIncomeExpenses({ T, monthlyData, containerRef, width }: Props) {
  const { t } = useTranslation();
  return (
    <Card T={T}>
      <div style={{ padding: '1.25rem 1.5rem 0.75rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: T.muted, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          {t('trends.chartIEOverline')}
        </div>
        <div style={{ fontSize: '1.125rem', fontWeight: 800, color: T.title }}>
          {t('trends.chartIETitle')}
        </div>
      </div>
      <div ref={containerRef} style={{ padding: '0 1.5rem 1.5rem' }}>
        <ResponsiveContainer width={width} height={280}>
          <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.cardBorder} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: T.muted }} />
            <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 11, fill: T.muted }} />
            <Tooltip content={<TrendsTooltip />} />
            <Legend wrapperStyle={{ fontSize: '0.8rem', color: T.muted }} />
            <Bar dataKey="income" name={t('trends.chartIEIncome')} fill={T.green} opacity={0.85} radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name={t('trends.chartIEExpenses')} fill={T.red} opacity={0.85} radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="net" name={t('trends.chartIENet')} stroke={T.accent} strokeWidth={2.5} dot={{ fill: T.accent, r: 4 }} activeDot={{ r: 6 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
