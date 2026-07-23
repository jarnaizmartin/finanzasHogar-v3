import { useState, useMemo, useRef } from 'react';
import { useIsMobile } from './hooks/useIsMobile';
import { fmtMonthYear, fmtMonth } from './lib/i18nFormats';
import { useTranslation } from 'react-i18next';
import { useCoachMark, CoachMark } from './components/CoachMark';
import { useApp } from './AppContext';
import { PrintFooter } from './components/UI';
import { calcForecast } from './AppProvider';
import { convertAmount, monthKey } from './utils';
import { CalendarAnnualView } from './components/calendar/CalendarAnnualView';
import { CalendarHeader } from './components/calendar/CalendarHeader';
import { CalendarMonthlySummary } from './components/calendar/CalendarMonthlySummary';
import { CalendarGrid } from './components/calendar/CalendarGrid';
import { CalendarDayPanel } from './components/calendar/CalendarDayPanel';
import {
  getProjectionsForDay,
  getRealsForDay,
  getRealsForMonth,
  buildAnnualMonthStats,
} from './lib/calendarCalc';

export function CalendarView() {
  const { t } = useTranslation();
  const {
    T,
    displayCurrency,
    baseCurrency,
    rates,
    accounts,
    categories,
    projections,
    realExpenses,
    goals,
  } = useApp();

  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [calendarView, setCalendarView] = useState<'monthly' | 'annual'>('monthly');

  const coachRef = useRef<HTMLDivElement>(null);
  const { seen: coachSeen, markSeen: coachMarkSeen } = useCoachMark('calendar');
  const annualCoachRef = useRef<HTMLDivElement>(null);
  const { seen: annualCoachSeen, markSeen: annualCoachMarkSeen } = useCoachMark('calendar_annual');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const annualYear = year;

  const monthName = fmtMonthYear(new Date(year, month));
  const selectedMonthName = fmtMonth(new Date(year, month));
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDay(null); };
  const nextMonth = () => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDay(null); };

  const selectedProjections = selectedDay !== null ? getProjectionsForDay(projections, year, month, selectedDay) : [];
  const selectedReals = selectedDay !== null ? getRealsForDay(realExpenses, accounts, year, month, selectedDay) : [];

  const totalIncomeProj = selectedProjections.filter((p) => p.type === 'income').reduce((s, p) => s + p.amount, 0);
  const totalExpenseProj = selectedProjections.filter((p) => p.type === 'expense').reduce((s, p) => s + p.amount, 0);
  const totalIncomeReal = selectedReals.filter((e) => e.type === 'income').reduce((s, e) => s + convertAmount(e.amount, e.currency, displayCurrency, rates), 0);
  const totalExpenseReal = selectedReals.filter((e) => e.type === 'expense').reduce((s, e) => s + convertAmount(e.amount, e.currency, displayCurrency, rates), 0);

  const allDayProjections = Array.from({ length: daysInMonth }, (_, i) => getProjectionsForDay(projections, year, month, i + 1)).flat();
  const monthIncomeProj = allDayProjections.filter((p) => p.type === 'income').reduce((s, p) => s + p.amount, 0);
  const monthExpenseProj = allDayProjections.filter((p) => p.type === 'expense').reduce((s, p) => s + p.amount, 0);

  const monthReals = getRealsForMonth(realExpenses, accounts, year, month);
  const monthIncomeReal = monthReals.filter((e) => e.type === 'income').reduce((s, e) => s + convertAmount(e.amount, e.currency, displayCurrency, rates), 0);
  const monthExpenseReal = monthReals.filter((e) => e.type === 'expense').reduce((s, e) => s + convertAmount(e.amount, e.currency, displayCurrency, rates), 0);

  // memo correcto; el análisis del React Compiler (NO activado en este build) no
  // lo preserva porque annualYear deriva de currentDate (un Date de estado, que
  // trata como mutable). Sin impacto en runtime.
  /* eslint-disable react-hooks/preserve-manual-memoization */
  const annualData = useMemo(() => {
    const todayMk = monthKey(new Date());
    const forecast = calcForecast(projections, accounts, 'all', rates, baseCurrency, realExpenses);
    return Array.from({ length: 12 }, (_, monthIdx) => {
      const mk = monthKey(new Date(annualYear, monthIdx, 1));
      const fm = forecast.find((m) => m.key === mk);
      const netBalance = fm?.net ?? 0;
      return buildAnnualMonthStats(monthIdx, annualYear, realExpenses, accounts, goals, netBalance, baseCurrency, rates, todayMk, fm?.income ?? 0, fm?.expense ?? 0);
    });
  }, [annualYear, accounts, projections, realExpenses, goals, rates, baseCurrency]);
  /* eslint-enable react-hooks/preserve-manual-memoization */

  const printSubtitle =
    calendarView === 'monthly'
      ? t('calendar.printMonthly', { month: monthName.charAt(0).toUpperCase() + monthName.slice(1) })
      : t('calendar.printAnnual', { year: annualYear });

  return (
    <div className="fh-print-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <CalendarHeader
        T={T}
        calendarView={calendarView}
        monthName={monthName}
        printSubtitle={printSubtitle}
        onViewChange={setCalendarView}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
      />

      {calendarView === 'annual' && (
        <>
          <CalendarAnnualView
            annualData={annualData}
            annualYear={annualYear}
            T={T}
            onSelectMonth={(monthIdx) => {
              setCurrentDate(new Date(annualYear, monthIdx, 1));
              setCalendarView('monthly');
              setSelectedDay(null);
            }}
            onChangeYear={(delta) => setCurrentDate(new Date(annualYear + delta, 0, 1))}
            coachRef={annualCoachRef}
          />
          {!annualCoachSeen && (
            <CoachMark
              targetRef={annualCoachRef}
              title={t('calendar.coachAnnualTitle')}
              description={t('calendar.coachAnnualDesc')}
              ctaLabel={t('common.coachCta')}
              onDismiss={annualCoachMarkSeen}
              accentColor="#0891b2"
            />
          )}
        </>
      )}

      {calendarView === 'monthly' && (
        <>
          <CalendarMonthlySummary
            T={T}
            monthIncomeProj={monthIncomeProj}
            monthExpenseProj={monthExpenseProj}
            monthIncomeReal={monthIncomeReal}
            monthExpenseReal={monthExpenseReal}
            displayCurrency={displayCurrency}
            baseCurrency={baseCurrency}
            rates={rates}
          />
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 22rem', gap: '1.5rem', alignItems: 'start' }}>
            <CalendarGrid
              T={T}
              year={year}
              month={month}
              adjustedFirstDay={adjustedFirstDay}
              daysInMonth={daysInMonth}
              selectedDay={selectedDay}
              projections={projections}
              realExpenses={realExpenses}
              accounts={accounts}
              displayCurrency={displayCurrency}
              baseCurrency={baseCurrency}
              rates={rates}
              coachRef={coachRef}
              onSelectDay={setSelectedDay}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <CalendarDayPanel
                T={T}
                selectedDay={selectedDay}
                selectedMonthName={selectedMonthName}
                selectedReals={selectedReals}
                selectedProjections={selectedProjections}
                totalIncomeReal={totalIncomeReal}
                totalExpenseReal={totalExpenseReal}
                totalIncomeProj={totalIncomeProj}
                totalExpenseProj={totalExpenseProj}
                categories={categories}
                accounts={accounts}
                displayCurrency={displayCurrency}
                baseCurrency={baseCurrency}
                rates={rates}
              />
            </div>
          </div>
        </>
      )}

      {!coachSeen && (
        <CoachMark
          targetRef={coachRef}
          title={t('calendar.coachMonthlyTitle')}
          description={t('calendar.coachMonthlyDesc')}
          ctaLabel={t('common.coachCta')}
          onDismiss={coachMarkSeen}
          accentColor="#0891b2"
        />
      )}

      <PrintFooter section={t('calendar.footerSection')} />
    </div>
  );
}
