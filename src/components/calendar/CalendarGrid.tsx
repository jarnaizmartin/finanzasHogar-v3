import { useTranslation } from 'react-i18next';
import { Card } from '../UI';
import { convertAmount, fmt } from '../../utils';
import { getProjectionsForDay, getRealsForDay } from '../../lib/calendarCalc';
import { useIsMobile } from '../../hooks/useIsMobile';
import type { Theme } from '../../theme';
import type { Projection, RealExpense, Account } from '../../types';

interface Props {
  T: Theme;
  year: number;
  month: number;
  adjustedFirstDay: number;
  daysInMonth: number;
  selectedDay: number | null;
  projections: Projection[];
  realExpenses: RealExpense[];
  accounts: Account[];
  displayCurrency: string;
  baseCurrency: string;
  rates: Record<string, number>;
  coachRef: React.RefObject<HTMLElement>;
  onSelectDay: (day: number | null) => void;
}

export function CalendarGrid({
  T,
  year,
  month,
  adjustedFirstDay,
  daysInMonth,
  selectedDay,
  projections,
  realExpenses,
  accounts,
  displayCurrency,
  baseCurrency,
  rates,
  coachRef,
  onSelectDay,
}: Props) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const DAYS = [
    t('calendar.gridMon'), t('calendar.gridTue'), t('calendar.gridWed'),
    t('calendar.gridThu'), t('calendar.gridFri'), t('calendar.gridSat'), t('calendar.gridSun'),
  ];
  const todayDate = new Date();
  const isToday = (day: number) =>
    day === todayDate.getDate() && month === todayDate.getMonth() && year === todayDate.getFullYear();

  return (
    <Card T={T} ref={coachRef}>
      <div style={{ padding: '1.25rem' }}>
        {/* Días de la semana */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.5rem' }}>
          {DAYS.map((d) => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.25rem' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Celdas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
          {Array.from({ length: adjustedFirstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dayProjs = getProjectionsForDay(projections, year, month, day);
            const dayReals = getRealsForDay(realExpenses, accounts, year, month, day);
            const hasIncomeProj = dayProjs.some((p) => p.type === 'income');
            const hasExpenseProj = dayProjs.some((p) => p.type === 'expense');
            const hasIncomeReal = dayReals.some((e) => e.type === 'income');
            const hasExpenseReal = dayReals.some((e) => e.type === 'expense');
            const isSelected = selectedDay === day;
            const isTodayDay = isToday(day);
            const hasAnything = dayProjs.length > 0 || dayReals.length > 0;

            const incomeRealAmt = dayReals.filter((e) => e.type === 'income').reduce((s, e) => s + convertAmount(e.amount, e.currency, displayCurrency, rates), 0);
            const expenseRealAmt = dayReals.filter((e) => e.type === 'expense').reduce((s, e) => s + convertAmount(e.amount, e.currency, displayCurrency, rates), 0);
            const incomeProjAmt = dayProjs.filter((p) => p.type === 'income').reduce((s, p) => s + p.amount, 0);
            const expenseProjAmt = dayProjs.filter((p) => p.type === 'expense').reduce((s, p) => s + p.amount, 0);

            return (
              <div
                key={day}
                onClick={() => hasAnything && onSelectDay(isSelected ? null : day)}
                style={{
                  borderRadius: '0.625rem',
                  padding: isMobile ? '0.3rem 0.15rem' : '0.4rem 0.25rem',
                  minHeight: isMobile ? '2.75rem' : '4rem',
                  cursor: hasAnything ? 'pointer' : 'default',
                  background: isSelected || isTodayDay ? T.accentLight : T.pageBg,
                  border: isSelected ? `2px solid ${T.accent}` : isTodayDay ? `2px solid ${T.accent}44` : `1px solid ${T.cardBorder}`,
                  transition: 'all 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem',
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: isTodayDay ? 800 : 600, color: isSelected || isTodayDay ? T.accent : T.title }}>
                  {day}
                </span>

                {hasAnything && (
                  <div style={{ display: 'flex', gap: '0.15rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {hasIncomeReal && <span style={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', background: T.green, display: 'inline-block', flexShrink: 0 }} title={t('calendar.dotIncomeReal')} />}
                    {hasExpenseReal && <span style={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', background: T.red, display: 'inline-block', flexShrink: 0 }} title={t('calendar.dotExpenseReal')} />}
                    {hasIncomeProj && <span style={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', background: 'transparent', border: `1.5px solid ${T.green}`, display: 'inline-block', flexShrink: 0 }} title={t('calendar.dotIncomeProj')} />}
                    {hasExpenseProj && <span style={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', background: 'transparent', border: `1.5px solid ${T.red}`, display: 'inline-block', flexShrink: 0 }} title={t('calendar.dotExpenseProj')} />}
                  </div>
                )}

                {hasAnything && !isMobile && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', width: '100%' }}>
                    {hasIncomeReal && (
                      <div style={{ fontSize: '0.5rem', fontWeight: 700, color: T.green, textAlign: 'center', background: T.greenBg, borderRadius: '0.2rem', padding: '0.1rem' }}>
                        +{fmt(incomeRealAmt, displayCurrency, displayCurrency, rates)}
                      </div>
                    )}
                    {hasExpenseReal && (
                      <div style={{ fontSize: '0.5rem', fontWeight: 700, color: T.red, textAlign: 'center', background: T.redBg, borderRadius: '0.2rem', padding: '0.1rem' }}>
                        -{fmt(expenseRealAmt, displayCurrency, displayCurrency, rates)}
                      </div>
                    )}
                    {hasIncomeProj && !hasIncomeReal && (
                      <div style={{ fontSize: '0.5rem', fontWeight: 600, color: T.green, textAlign: 'center', background: T.greenBg, borderRadius: '0.2rem', padding: '0.1rem', opacity: 0.6 }}>
                        +{fmt(incomeProjAmt, displayCurrency, baseCurrency, rates)}
                      </div>
                    )}
                    {hasExpenseProj && !hasExpenseReal && (
                      <div style={{ fontSize: '0.5rem', fontWeight: 600, color: T.red, textAlign: 'center', background: T.redBg, borderRadius: '0.2rem', padding: '0.1rem', opacity: 0.6 }}>
                        -{fmt(expenseProjAmt, displayCurrency, baseCurrency, rates)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Leyenda */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: `1px solid ${T.cardBorder}`, fontSize: '0.72rem', color: T.muted, flexWrap: 'wrap' }}>
          {[
            { bg: T.green, border: undefined, label: t('calendar.dotIncomeReal') },
            { bg: T.red, border: undefined, label: t('calendar.dotExpenseReal') },
            { bg: 'transparent', border: `1.5px solid ${T.green}`, label: t('calendar.dotIncomeProj') },
            { bg: 'transparent', border: `1.5px solid ${T.red}`, label: t('calendar.dotExpenseProj') },
          ].map((item) => (
            <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: item.bg, border: item.border, display: 'inline-block' }} />
              {item.label}
            </span>
          ))}
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: '0.75rem', height: '0.75rem', borderRadius: '0.2rem', background: T.accentLight, border: `1px solid ${T.accent}`, display: 'inline-block' }} />
            {t('calendar.legendTodaySelected')}
          </span>
        </div>
      </div>
    </Card>
  );
}
