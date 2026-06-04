import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { fmtAmount } from '../../lib/i18nFormats';
import { Card } from '../UI';
import { useIsMobile } from '../../hooks/useIsMobile';
import type { CategoryDataPoint } from '../../lib/trendsCalc';
import type { Theme } from '../../theme';

interface Props {
  T: Theme;
  categoryData: CategoryDataPoint[];
  containerRef: React.RefObject<HTMLDivElement>;
  width: number;
  baseCurrency: string;
}

export function TrendsCategoryCharts({ T, categoryData, containerRef, width, baseCurrency }: Props) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  if (categoryData.length === 0) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
      <Card T={T}>
        <div style={{ padding: '1.25rem 1.5rem 0.75rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: T.muted, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            {t('trends.chartCatOverline')}
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: T.title }}>
            {t('trends.chartCatTitle')}
          </div>
        </div>
        <div ref={containerRef} style={{ padding: '0 1.5rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
          <ResponsiveContainer width={width} height={240}>
            <PieChart>
              <Pie data={categoryData} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={2}>
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  fmtAmount(value) + ' ' + baseCurrency,
                  t('trends.chartCatTooltip'),
                ]}
                contentStyle={{
                  background: T.cardBg,
                  border: `1px solid ${T.cardBorder}`,
                  borderRadius: '0.75rem',
                  fontSize: '0.8rem',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card T={T}>
        <div style={{ padding: '1.25rem 1.5rem 0.75rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: T.muted, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            {t('trends.chartCatRankOverline')}
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: T.title }}>
            {t('trends.chartCatRankTitle')}
          </div>
        </div>
        <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {categoryData.slice(0, 6).map((cat, i) => {
            const pct = (cat.total / (categoryData[0]?.total ?? 1)) * 100;
            return (
              <div key={cat.categoryId}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: T.muted, minWidth: '1rem' }}>{i + 1}</span>
                    <span style={{ width: '0.625rem', height: '0.625rem', borderRadius: '50%', background: cat.color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.825rem', fontWeight: 600, color: T.body }}>{cat.name}</span>
                  </div>
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, color: T.title }}>
                    {fmtAmount(cat.total)}
                  </span>
                </div>
                <div style={{ height: '0.375rem', borderRadius: '9999px', background: T.pageBg }}>
                  <div style={{ height: '100%', borderRadius: '9999px', background: cat.color, width: `${pct}%`, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
