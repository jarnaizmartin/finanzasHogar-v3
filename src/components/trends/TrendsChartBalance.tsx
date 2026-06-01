import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { Card } from '../UI';
import { TrendsTooltip } from './TrendsTooltip';
import { ACCOUNT_COLORS } from './constants';
import type { BalanceDataPoint } from '../../lib/trendsCalc';
import type { Theme } from '../../theme';
import type { Account } from '../../types';

const fmtAxis = (val: number) =>
  Math.abs(val) >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0);

interface Props {
  T: Theme;
  balanceData: BalanceDataPoint[];
  filteredAccounts: Account[];
  containerRef: React.RefObject<HTMLDivElement>;
  width: number;
}

export function TrendsChartBalance({ T, balanceData, filteredAccounts, containerRef, width }: Props) {
  const { t } = useTranslation();
  if (balanceData.length === 0) return null;
  return (
    <Card T={T}>
      <div style={{ padding: '1.25rem 1.5rem 0.75rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: T.muted, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          {t('trends.chartBalOverline')}
        </div>
        <div style={{ fontSize: '1.125rem', fontWeight: 800, color: T.title }}>
          {t('trends.chartBalTitle')}
        </div>
      </div>
      <div ref={containerRef} style={{ padding: '0 1.5rem 1.5rem' }}>
        <ResponsiveContainer width={width} height={260}>
          <LineChart data={balanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.cardBorder} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: T.muted }} />
            <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 11, fill: T.muted }} />
            <Tooltip content={<TrendsTooltip />} />
            <Legend wrapperStyle={{ fontSize: '0.8rem', color: T.muted }} />
            {filteredAccounts.map((acc, i) => (
              <Line
                key={acc.id}
                type="monotone"
                dataKey={acc.id}
                name={acc.name}
                stroke={ACCOUNT_COLORS[i % ACCOUNT_COLORS.length]}
                strokeWidth={2}
                dot={{ fill: ACCOUNT_COLORS[i % ACCOUNT_COLORS.length], r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
            {filteredAccounts.length > 1 && (
              <Line type="monotone" dataKey="total" name={t('trends.chartBalTotal')} stroke={T.accent} strokeWidth={3} strokeDasharray="6 3" dot={{ fill: T.accent, r: 4 }} activeDot={{ r: 6 }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
