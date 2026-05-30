import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { Card } from '../UI';
import { TrendsTooltip } from './TrendsTooltip';
import type { MonthlyDataPoint } from '../../lib/trendsCalc';

interface Props {
  T: any;
  monthlyData: MonthlyDataPoint[];
  containerRef: React.RefObject<HTMLDivElement>;
  width: number;
}

export function TrendsChartSavingsRate({ T, monthlyData, containerRef, width }: Props) {
  return (
    <Card T={T}>
      <div style={{ padding: '1.25rem 1.5rem 0.75rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: T.muted, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          Evolución del ahorro
        </div>
        <div style={{ fontSize: '1.125rem', fontWeight: 800, color: T.title }}>
          Tasa de ahorro mensual
        </div>
        <div style={{ fontSize: '0.775rem', color: T.muted, marginTop: '0.2rem' }}>
          La línea de referencia en el 20% marca el objetivo de ahorro saludable
        </div>
      </div>
      <div ref={containerRef} style={{ padding: '0 1.5rem 1.5rem' }}>
        <ResponsiveContainer width={width} height={220}>
          <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={T.accent} stopOpacity={0.3} />
                <stop offset="95%" stopColor={T.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={T.cardBorder} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: T.muted }} />
            <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: T.muted }} />
            <Tooltip content={<TrendsTooltip />} />
            <ReferenceLine y={20} stroke={T.green} strokeDasharray="6 3" strokeWidth={1.5} label={{ value: '20% objetivo', fill: T.green, fontSize: 11 }} />
            <ReferenceLine y={0} stroke={T.red} strokeDasharray="3 3" strokeWidth={1} />
            <Area type="monotone" dataKey="savingsRate" name="Tasa de ahorro (%)" stroke={T.accent} strokeWidth={2.5} fill="url(#savingsGradient)" dot={{ fill: T.accent, r: 4 }} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
