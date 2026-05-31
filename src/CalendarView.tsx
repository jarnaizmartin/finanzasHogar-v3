import { useState, useMemo, useRef } from 'react';
import { useCoachMark, CoachMark } from './components/CoachMark';
import { CalendarRange } from 'lucide-react';
import { useApp } from './AppContext';
import { Card, PrintFooter } from './components/UI';
import { calcForecast } from './AppProvider';
import { convertAmount, fmt, monthKey, FREQUENCIES } from './utils';
import { CalendarAnnualView } from './components/calendar/CalendarAnnualView';
import { CalendarHeader } from './components/calendar/CalendarHeader';
import { CalendarMonthlySummary } from './components/calendar/CalendarMonthlySummary';
import { CalendarGrid } from './components/calendar/CalendarGrid';
import { CalendarDayPanel } from './components/calendar/CalendarDayPanel';
import { buildAnnualMonthStats } from './lib/calendarCalc';

// ─── CalendarView ─────────────────────────────────────────────────────────────
export function CalendarView() {
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

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [calendarView, setCalendarView] = useState<'monthly' | 'annual'>(
    'monthly'
  );

  // ── Coach mark mensual ─────────────────────────────────────────────────────
  const coachRef = useRef<HTMLElement>(null);
  const { seen: coachSeen, markSeen: coachMarkSeen } = useCoachMark('calendar');

  // ── Coach mark anual ───────────────────────────────────────────────────────
  const annualCoachRef = useRef<HTMLDivElement>(null);
  const { seen: annualCoachSeen, markSeen: annualCoachMarkSeen } = useCoachMark('calendar_annual');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = new Date(year, month).toLocaleString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getProjectionsForDay = (day: number) => {
    return projections.filter((p) => {
      const start = new Date(p.startDate + 'T00:00:00');
      const end = p.endDate ? new Date(p.endDate + 'T23:59:59') : null;
      const payDay = start.getDate();
      if (payDay !== day) return false;
      if (start > new Date(year, month + 1, 0)) return false;
      if (end && end < new Date(year, month, day)) return false;
      const freq = FREQUENCIES.find((f) => f.value === p.frequency);
      if (!freq) return false;
      const diffMonths =
        (year - start.getFullYear()) * 12 + (month - start.getMonth());
      if (diffMonths < 0) return false;
      if (diffMonths % freq.months !== 0) return false;
      return true;
    });
  };

  const getRealsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
      day
    ).padStart(2, '0')}`;
    // 🗓️ El calendario es un diario de gastos: mostramos TODOS los movimientos
    // en su día, independientemente de la fecha de saldo base de la cuenta.
    return realExpenses.filter((e) => {
      if (e.valueDate !== dateStr) return false;
      const acc = accounts.find((a) => a.id === e.accountId);
      if (!acc) return false;
      return true;
    });
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const todayDate = new Date();
  const isToday = (day: number) =>
    day === todayDate.getDate() &&
    month === todayDate.getMonth() &&
    year === todayDate.getFullYear();

  const selectedProjections =
    selectedDay !== null ? getProjectionsForDay(selectedDay) : [];
  const selectedReals = selectedDay !== null ? getRealsForDay(selectedDay) : [];

  const totalIncomeProj = selectedProjections
    .filter((p) => p.type === 'income')
    .reduce((s, p) => s + p.amount, 0);
  const totalExpenseProj = selectedProjections
    .filter((p) => p.type === 'expense')
    .reduce((s, p) => s + p.amount, 0);

  const totalIncomeReal = selectedReals
    .filter((e) => e.type === 'income')
    .reduce(
      (s, e) => s + convertAmount(e.amount, e.currency, displayCurrency, rates),
      0
    );
  const totalExpenseReal = selectedReals
    .filter((e) => e.type === 'expense')
    .reduce(
      (s, e) => s + convertAmount(e.amount, e.currency, displayCurrency, rates),
      0
    );

  const allDayProjections = Array.from({ length: daysInMonth }, (_, i) =>
    getProjectionsForDay(i + 1)
  ).flat();

  const monthIncomeProj = allDayProjections
    .filter((p) => p.type === 'income')
    .reduce((s, p) => s + p.amount, 0);
  const monthExpenseProj = allDayProjections
    .filter((p) => p.type === 'expense')
    .reduce((s, p) => s + p.amount, 0);

    const currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    // 🗓️ Resumen mensual del calendario: agregamos todos los movimientos del mes,
    // sin filtrar por fecha de saldo base (no es un cálculo de saldo, es un diario).
    const monthReals = realExpenses.filter((e) => {
      if (e.valueDate.slice(0, 7) !== currentMonthStr) return false;
      const acc = accounts.find((a) => a.id === e.accountId);
      if (!acc) return false;
      return true;
    });
  
  const monthIncomeReal = monthReals
    .filter((e) => e.type === 'income')
    .reduce(
      (s, e) => s + convertAmount(e.amount, e.currency, displayCurrency, rates),
      0
    );
  const monthExpenseReal = monthReals
    .filter((e) => e.type === 'expense')
    .reduce(
      (s, e) => s + convertAmount(e.amount, e.currency, displayCurrency, rates),
      0
    );

  const annualYear = currentDate.getFullYear();

  const annualData = useMemo(() => {
    const todayMk = monthKey(new Date());
    const forecast = calcForecast(projections, accounts, 'all', rates, baseCurrency, realExpenses);
    return Array.from({ length: 12 }, (_, monthIdx) => {
      const mk = monthKey(new Date(annualYear, monthIdx, 1));
      const netBalance = forecast.find((m) => m.key === mk)?.net ?? 0;
      return buildAnnualMonthStats(monthIdx, annualYear, realExpenses, accounts, goals, netBalance, baseCurrency, rates, todayMk);
    });
  }, [annualYear, accounts, projections, realExpenses, goals, rates, baseCurrency]);

  const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const selectedMonthName = new Date(year, month).toLocaleString('es-ES', {
    month: 'long',
  });

  const printSubtitle =
    calendarView === 'monthly'
      ? `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} · Vista mensual`
      : `Año ${annualYear} · Vista anual`;

  return (
    <div
      className="fh-print-section"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
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
            onChangeYear={(delta) => {
              setCurrentDate(new Date(annualYear + delta, 0, 1));
            }}
            coachRef={annualCoachRef}
          />
          {!annualCoachSeen && (
            <CoachMark
              targetRef={annualCoachRef}
              title="Tu año completo de un vistazo"
              description="Verde = balance positivo · Rojo = balance negativo · Ámbar = ajustado. Haz clic en cualquier mes para ver su detalle. Los meses pasados muestran datos reales, los futuros proyecciones."
              ctaLabel="¡Entendido! →"
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

          {/* ── Calendario + Panel lateral ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 22rem',
              gap: '1.5rem',
              alignItems: 'start',
            }}
          >
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
      {/* ── Coach mark — primera visita ── */}
      {!coachSeen && (
        <CoachMark
          targetRef={coachRef}
          title="Tu mes de un vistazo"
          description="● movimiento real · ○ proyectado. Haz clic en cualquier día para ver el detalle. Cambia a vista anual para ver los 12 meses."
          ctaLabel="¡Entendido! →"
          onDismiss={coachMarkSeen}
          accentColor="#0891b2"
        />
        )}

      {/* ── Footer documento (solo impresión) ── */}
      <PrintFooter section="Calendario Financiero" />
      </div>
      );
    }
    