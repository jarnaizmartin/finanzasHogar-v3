import { useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { useCoachMark, CoachMark } from '../components/CoachMark';
import { StickyCompactBar } from '../components/StickyCompactBar';
import { useApp } from '../AppContext';
import { fmt, FREQUENCIES, convertAmount, monthKey } from '../utils';
import { Card, PrintButton, PrintHeader, PrintFooter, WarnBanner } from '../components/UI';
import { SetupProgress } from '../components/SetupProgress';
import { InstitutionLogo } from '../components/InstitutionLogo';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ProjectedVsReal } from './ProjectedVsReal';

export function Dashboard() {
  const { t, i18n } = useTranslation();
  const {
    T,
    displayCurrency,
    baseCurrency,
    rates,
    fmtAccount,
    accounts,
    projections,
    realExpenses,
    accountWarnings,
    realBalanceMap,
    stats,
    openPaymentModal,
  } = useApp();

  const { totalRealBalance, warnAccounts } = stats;

  // ── Bloque 1 — Mes en curso: proyección vs real ───────────────────────────
  const monthTotals = useMemo(() => {
    const d = new Date();
    const mKey = monthKey(d);
    const localeMap: Record<string, string> = { es: 'es-ES', en: 'en-US', 'pt-BR': 'pt-BR', fr: 'fr-FR' };
    const locale = localeMap[i18n.language] ?? i18n.language;
    const monthName = d.toLocaleString(locale, { month: 'long', year: 'numeric' });
    const dayOfMonth = d.getDate();
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

    const activeProj = projections.filter(p => {
      if (p.type === 'transfer') return false;
      const start = new Date(p.startDate);
      const end = p.endDate ? new Date(p.endDate) : null;
      const freq = FREQUENCIES.find(f => f.value === p.frequency);
      if (!freq) return false;
      const diff = (d.getFullYear() - start.getFullYear()) * 12 + (d.getMonth() - start.getMonth());
      if (diff < 0 || (end && d > end) || diff % freq.months !== 0) return false;
      return true;
    });

    let projIncome = 0, projExpense = 0, realIncome = 0, realExpense = 0;
    activeProj.forEach(p => {
      const acc = accounts.find(a => a.id === p.accountId);
      const cur = acc?.currency ?? baseCurrency;
      const amount = convertAmount(p.amount, cur, displayCurrency, rates);
      if (p.type === 'income') projIncome += amount;
      else projExpense += amount;
    });
    realExpenses.forEach(e => {
      if (e.entryDate.slice(0, 7) !== mKey) return;
      if (!accounts.find(a => a.id === e.accountId)) return;
      const amount = convertAmount(e.amount, e.currency, displayCurrency, rates);
      if (e.type === 'income') realIncome += amount;
      else realExpense += amount;
    });

    return { projIncome, projExpense, realIncome, realExpense, dayOfMonth, daysInMonth, monthName };
  }, [projections, realExpenses, accounts, baseCurrency, displayCurrency, rates, i18n.language]);

  // ── Bloque 2 — Posición general ──────────────────────────────────────────
  const positionTotals = useMemo(() => {
    let liquid = 0, investments = 0, liquidCount = 0, investCount = 0;
    let creditDebt = 0, loanDebt = 0, creditCount = 0, loanCount = 0;
    accounts.forEach(acc => {
      const realBal = realBalanceMap[acc.id]?.realBalance ?? acc.balance;
      const amount = convertAmount(realBal, acc.currency ?? baseCurrency, displayCurrency, rates);
      if (acc.accountType === 'credit_card') {
        creditDebt += realBalanceMap[acc.id]?.creditDebt ?? 0;
        creditCount++;
      } else if (acc.accountType === 'loan') {
        loanDebt += realBalanceMap[acc.id]?.loanDebt ?? acc.balance;
        loanCount++;
      } else if (acc.accountType === 'investment') {
        investments += amount; investCount++;
      } else {
        liquid += amount; liquidCount++;
      }
    });
    const totalDebt = convertAmount(creditDebt, baseCurrency, displayCurrency, rates)
      + convertAmount(loanDebt, baseCurrency, displayCurrency, rates);
    return { liquid, liquidCount, investments, investCount, totalDebt, creditCount, loanCount };
  }, [accounts, realBalanceMap, baseCurrency, displayCurrency, rates]);

  // ── Bloque 3 — Deuda: tarjetas de crédito ────────────────────────────────
  const creditCardAccounts = accounts.filter(a => a.accountType === 'credit_card');
  const hasCreditCards = creditCardAccounts.length > 0;
  const totalCreditDebt = creditCardAccounts.reduce((s, a) => s + (realBalanceMap[a.id]?.creditDebt ?? 0), 0);
  const totalCreditLimit = creditCardAccounts.reduce((s, a) => s + (a.creditLimit ?? 0), 0);
  const avgCreditUtil = totalCreditLimit > 0 ? (totalCreditDebt / totalCreditLimit) * 100 : 0;
  const creditUtilColor = avgCreditUtil >= 70 ? T.red : avgCreditUtil >= 30 ? T.amber : T.green;
  const creditUtilBg = avgCreditUtil >= 70 ? (T.redBg ?? T.amberBg) : avgCreditUtil >= 30 ? T.amberBg : T.greenBg;
  const creditUtilBorder = avgCreditUtil >= 70 ? (T.redBorder ?? T.amberBorder) : avgCreditUtil >= 30 ? T.amberBorder : T.greenBorder;
  const creditUtilLabel = avgCreditUtil >= 90 ? t('dashboard.credit.critical') : avgCreditUtil >= 70 ? t('dashboard.credit.high') : avgCreditUtil >= 30 ? t('dashboard.credit.moderate') : t('dashboard.credit.excellent');

  // ── Bloque 3 — Deuda: préstamos e hipotecas ───────────────────────────────
  const loanAccounts = accounts.filter(a => a.accountType === 'loan');
  const hasLoans = loanAccounts.length > 0;
  const totalLoanDebt = loanAccounts.reduce((s, a) => s + (realBalanceMap[a.id]?.loanDebt ?? a.balance), 0);
  const totalMonthlyLoanPayment = loanAccounts.reduce((s, a) => s + (a.monthlyPayment ?? 0), 0);
  const totalYearlyLoanInterest = loanAccounts.reduce((s, a) => {
    const debt = realBalanceMap[a.id]?.loanDebt ?? a.balance;
    return s + (a.interestRate ? debt * (a.interestRate / 100) : 0);
  }, 0);

  const hasAnyDebt = hasCreditCards || hasLoans;

  const { seen: coachSeen, markSeen: coachMarkSeen } = useCoachMark('dashboard');
  const coachRef = useRef<HTMLDivElement>(null);
  const stickyBarSentinelRef = useRef<HTMLDivElement>(null);

  // ── Bloque 1: derivados de display ───────────────────────────────────────
  const { projIncome, projExpense, realIncome, realExpense, dayOfMonth, daysInMonth, monthName } = monthTotals;
  const rawPct = projExpense > 0 ? realExpense / projExpense : 0;
  const barPct = Math.round(Math.min(rawPct, 1) * 100);
  const isOver = rawPct > 1;
  const isNear = rawPct >= 0.8;
  const expenseDelta = Math.abs(projExpense - realExpense);
  const realNet = realIncome - realExpense;

  // ── Desplegable "detalle del mes" (proyectado vs real por categoría) ──────
  // Estado recordado entre sesiones. Solo ofrecemos el botón si hay algo que
  // mostrar (proyecciones activas o movimientos reales este mes); de lo
  // contrario ProjectedVsReal renderiza null y el desplegable quedaría vacío.
  const [monthDetailOpen, setMonthDetailOpen] = useLocalStorage<boolean>('fh_dashboard_month_detail', false);
  const hasMonthDetail = projIncome + projExpense + realIncome + realExpense > 0;

  // Paleta suave para cifras financieras — cómoda en sesiones largas
  const SOFT_GREEN = '#a7f3d0';   // emerald-200 — verde suave, sin neón
  const SOFT_RED   = '#fecaca';   // red-200     — rosa muy suave
  const SOFT_AMBER = '#fbbf24';   // amber-400   — más legible que yellow-200
  const barColor = isOver ? SOFT_RED : isNear ? SOFT_AMBER : SOFT_GREEN;

  return (
    <div className="fh-print-section" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── Cabecera documento (solo impresión) ── */}
      <PrintHeader
        title={t('dashboard.title')}
        subtitle={t(accounts.length === 1 ? 'dashboard.printSubtitle1' : 'dashboard.printSubtitleN', {
          n: accounts.length,
          amount: fmt(totalRealBalance, displayCurrency, displayCurrency, rates),
        })}
      />

      {/* ── Cabecera de página ── */}
      <div
        className="fh-no-print"
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}
      >
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', color: T.accent, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            {t('dashboard.overline')}
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: T.title, letterSpacing: '-0.04em', lineHeight: 1.05, margin: 0 }}>
            {t('dashboard.title')}
          </h2>
          <p style={{ fontSize: '0.9rem', color: T.muted, marginTop: '0.375rem', lineHeight: 1.5 }}>
            {t('dashboard.subtitle')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <PrintButton
            T={T}
            documentTitle={t('dashboard.title')}
            sectionTitle={t('dashboard.title')}
            subtitle={t(accounts.length === 1 ? 'dashboard.printSubtitle1' : 'dashboard.printSubtitleN', {
              n: accounts.length,
              amount: fmt(totalRealBalance, displayCurrency, displayCurrency, rates),
            })}
          />
        </div>
      </div>

      <WarnBanner warnAccounts={warnAccounts} T={T} />
      <SetupProgress />

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* BLOQUE 1 — ¿Cómo vas este mes?                                       */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div
        ref={coachRef}
        style={{
          borderRadius: T.radiusLg,
          background: T.heroBg,
          padding: '2rem 2.5rem',
          border: `1.5px solid ${T.accent}44`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 12px 48px rgba(0,0,0,0.4), 0 0 100px ${T.accent}30`,
        }}
      >
        {/* Fila superior: overline + contador de día */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: T.accent, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              {t('dashboard.monthProgress.overline')} · {monthName}
            </div>
            <div style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.625rem)', fontWeight: 900, color: T.heroText, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {t('dashboard.monthProgress.title')}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '1rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: T.heroMuted, letterSpacing: '-0.01em' }}>
              {t('dashboard.monthProgress.day', { day: dayOfMonth, total: daysInMonth })}
            </div>
            <div style={{ fontSize: '0.6rem', color: T.heroMuted, opacity: 0.65, marginTop: '0.15rem' }}>
              {Math.round((dayOfMonth / daysInMonth) * 100)}% {t('dashboard.monthProgress.elapsed')}
            </div>
          </div>
        </div>

        {/* Barra de progreso + importe */}
        {projExpense > 0 ? (
          <div style={{ marginBottom: '1.75rem' }}>
            {/* Real / Proyectado — formato slash, ambos legibles */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '1.125rem' }}>
              <span style={{ fontSize: 'clamp(1.75rem, 6vw, 3.5rem)', fontWeight: 900, color: T.heroText, letterSpacing: '-0.05em', lineHeight: 1 }}>
                {fmt(realExpense, displayCurrency, displayCurrency, rates)}
              </span>
              <span style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1.5rem)', color: T.heroMuted, fontWeight: 600, letterSpacing: '-0.02em', alignSelf: 'flex-end', paddingBottom: '0.4rem' }}>
                / {fmt(projExpense, displayCurrency, displayCurrency, rates)}
              </span>
            </div>

            {/* Barra de progreso con glow semántico */}
            <div style={{ height: '0.5rem', borderRadius: T.radiusPill, background: 'rgba(255,255,255,0.08)', overflow: 'visible', marginBottom: '1rem', position: 'relative' }}>
              <div style={{ height: '100%', borderRadius: T.radiusPill, background: barColor, width: `${barPct}%`, transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)', boxShadow: `0 0 16px ${barColor}99`, position: 'absolute', inset: 0 }} />
            </div>

            {/* Delta — badge pill con fondo semántico */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 1rem', borderRadius: T.radiusPill, background: `${barColor}18`, border: `1px solid ${barColor}44` }}>
              <span style={{ fontSize: '0.925rem', fontWeight: 800, color: barColor, letterSpacing: '-0.01em' }}>
                {isOver
                  ? `▲ ${fmt(expenseDelta, displayCurrency, displayCurrency, rates)} ${t('dashboard.monthProgress.overBudget')}`
                  : `▼ ${fmt(expenseDelta, displayCurrency, displayCurrency, rates)} ${t('dashboard.monthProgress.underBudget')}`
                }
              </span>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: '1.75rem', fontSize: '0.8rem', color: T.heroMuted, opacity: 0.7, fontStyle: 'italic' }}>
            {t('dashboard.monthProgress.noProjections')}
          </div>
        )}

        {/* KPIs: real acumulado del mes (ingresos / gastos / neto) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem' }}>
          {[
            { label: t('dashboard.kpi.incomeMonth'), value: realIncome, color: SOFT_GREEN, prefix: '+' },
            { label: t('dashboard.kpi.expenseMonth'), value: realExpense, color: SOFT_RED, prefix: '' },
            { label: t('dashboard.kpi.netMonth'), value: realNet, color: realNet >= 0 ? SOFT_GREEN : SOFT_RED, prefix: realNet >= 0 ? '+' : '' },
          ].map((item, i) => (
            <div key={item.label} style={{ textAlign: 'center', padding: '0 clamp(0.25rem, 1.5vw, 0.75rem)', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none', minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontSize: 'clamp(0.45rem, 1.4vw, 0.55rem)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.heroMuted, marginBottom: '0.375rem' }}>
                {item.label}
              </div>
              <div style={{ fontSize: 'clamp(0.8rem, 3.5vw, 1.375rem)', fontWeight: 800, color: item.color, letterSpacing: '-0.02em', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.prefix}{fmt(item.value, displayCurrency, displayCurrency, rates)}
              </div>
            </div>
          ))}
        </div>

        {/* ── Botón "Ver detalle del mes" — despliega proyectado vs real ── */}
        {hasMonthDetail && (
          <div className="fh-no-print" style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => setMonthDetailOpen(o => !o)}
              aria-expanded={monthDetailOpen}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                borderRadius: T.radiusPill,
                border: `1px solid ${T.heroMuted}33`,
                background: 'rgba(255,255,255,0.04)',
                color: T.heroText,
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {monthDetailOpen
                ? t('dashboard.monthProgress.detailHide')
                : t('dashboard.monthProgress.detailShow')}
              <ChevronDown
                size={16}
                style={{ transition: 'transform 0.2s', transform: monthDetailOpen ? 'rotate(180deg)' : 'none' }}
              />
            </button>

            {monthDetailOpen && (
              <div style={{ marginTop: '1.25rem', animation: 'fadeSlideIn 0.2s ease both' }}>
                <ProjectedVsReal />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sentinel sticky bar */}
      <div ref={stickyBarSentinelRef} style={{ height: 1 }} />

      <StickyCompactBar
        title={t('dashboard.stickyTitle')}
        sentinelRef={stickyBarSentinelRef}
        spread
        kpis={[
          { label: t('dashboard.kpi.wealth'), icon: '💼', value: fmt(totalRealBalance, displayCurrency, displayCurrency, rates), color: T.accent },
          { label: t('dashboard.kpi.incomeMonth'), icon: '↑', value: fmt(realIncome, displayCurrency, displayCurrency, rates), color: T.green },
          { label: t('dashboard.kpi.expenseMonth'), icon: '↓', value: fmt(realExpense, displayCurrency, displayCurrency, rates), color: T.red },
          { label: t('dashboard.kpi.netMonth'), icon: '=', value: `${realNet >= 0 ? '+' : ''}${fmt(realNet, displayCurrency, displayCurrency, rates)}`, color: realNet >= 0 ? T.green : T.red },
        ]}
      />

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* BLOQUE 2 — Posición general (4 columnas)                             */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Card
        T={T}
        style={{ border: `1.5px solid ${T.accent}44`, boxShadow: `${T.cardShadow}, 0 0 90px ${T.accent}28` }}
      >
        <div style={{ padding: '1.75rem 2rem' }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', color: T.accent, textTransform: 'uppercase', marginBottom: '1.75rem' }}>
            {t('dashboard.position.overline')}
          </div>
          <div className="fh-position-grid">
            {[
              {
                label: t('dashboard.position.liquid'),
                value: positionTotals.liquid,
                sub: positionTotals.liquidCount > 0
                  ? t('dashboard.position.nAccounts', { n: positionTotals.liquidCount })
                  : t('dashboard.position.noAccounts'),
                color: T.title,
                isNetWorth: false,
              },
              {
                label: t('dashboard.position.investments'),
                value: positionTotals.investments,
                sub: positionTotals.investCount > 0
                  ? t('dashboard.position.nAccounts', { n: positionTotals.investCount })
                  : t('dashboard.position.noAccounts'),
                color: T.title,
                isNetWorth: false,
              },
              {
                label: t('dashboard.position.debt'),
                value: positionTotals.totalDebt,
                sub: [
                  positionTotals.creditCount > 0 ? t('dashboard.position.nAccounts', { n: positionTotals.creditCount }) : '',
                  positionTotals.loanCount > 0 ? t('dashboard.position.nAccounts', { n: positionTotals.loanCount }) : '',
                ].filter(Boolean).join(' · ') || t('dashboard.position.noAccounts'),
                color: positionTotals.totalDebt > 0 ? SOFT_RED : SOFT_GREEN,
                isNetWorth: false,
              },
              {
                label: t('dashboard.position.netWorth'),
                value: totalRealBalance,
                sub: `${realNet >= 0 ? '+' : ''}${fmt(realNet, displayCurrency, displayCurrency, rates)} ${t('dashboard.position.thisMonth')}`,
                color: totalRealBalance >= 0 ? T.title : SOFT_RED,
                isNetWorth: true,
              },
            ].map((col, i) => (
              <div
                key={col.label}
                style={{
                  padding: '0 1.5rem',
                  borderLeft: i === 3
                    ? `2px solid ${T.accent}55`
                    : i > 0 ? `1px solid ${T.cardBorder}` : 'none',
                  textAlign: 'center',
                }}
              >
                {/* Línea de acento sobre el Patrimonio — el clímax de la lectura */}
                {col.isNetWorth && (
                  <div style={{ width: '2.5rem', height: '2px', background: `linear-gradient(90deg, transparent, ${T.accent}, transparent)`, margin: '0 auto 1rem auto', borderRadius: T.radiusPill }} />
                )}
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                  {col.label}
                </div>
                <div style={{
                  fontSize: col.isNetWorth ? 'clamp(1.25rem, 4vw, 2.5rem)' : 'clamp(0.875rem, 3vw, 1.5rem)',
                  fontWeight: 900,
                  color: col.color,
                  letterSpacing: col.isNetWorth ? '-0.04em' : '-0.03em',
                  lineHeight: 1,
                  marginBottom: '0.625rem',
                }}>
                  {col.label === t('dashboard.position.debt') && positionTotals.totalDebt > 0 ? '−' : ''}
                  {fmt(Math.abs(col.value), displayCurrency, displayCurrency, rates)}
                </div>
                <div style={{ fontSize: '0.62rem', color: col.isNetWorth ? T.accent : T.muted, lineHeight: 1.4, opacity: col.isNetWorth ? 0.9 : 1 }}>
                  {col.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* BLOQUE 3 — Deuda (tarjetas + préstamos fusionados)                   */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {hasAnyDebt && (
        <Card T={T} style={{ boxShadow: `${T.cardShadow}, 0 0 90px rgba(254,202,202,0.18)` }}>
          <div style={{ padding: '1.75rem 2rem' }}>
            <div style={{ fontSize: '1.125rem', fontWeight: 900, color: T.title, letterSpacing: '-0.03em', marginBottom: '1.75rem' }}>
              {t('dashboard.debtSection')}
            </div>

              {/* Resumen agregado (deuda total + cuota + interés) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.75rem', textAlign: 'center' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                    {t('dashboard.totalDebt')}
                  </div>
                  <div style={{ fontSize: 'clamp(0.95rem, 3vw, 1.625rem)', fontWeight: 800, color: positionTotals.totalDebt > 0 ? SOFT_RED : SOFT_GREEN, letterSpacing: '-0.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {fmt(positionTotals.totalDebt, displayCurrency, displayCurrency, rates)}
                  </div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                    {t('dashboard.monthlyPaymentTotal')}
                  </div>
                  <div style={{ fontSize: 'clamp(0.95rem, 3vw, 1.625rem)', fontWeight: 800, color: T.title, letterSpacing: '-0.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {fmt(totalMonthlyLoanPayment, displayCurrency, displayCurrency, rates)}
                  </div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                    {t('dashboard.yearlyInterest')}
                  </div>
                  <div style={{ fontSize: 'clamp(0.95rem, 3vw, 1.625rem)', fontWeight: 800, color: totalYearlyLoanInterest > 0 ? SOFT_AMBER : T.muted, letterSpacing: '-0.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {fmt(totalYearlyLoanInterest, displayCurrency, displayCurrency, rates)}
                  </div>
                </div>
              </div>

              {/* ── Subsección: Tarjetas de crédito ── */}
              {hasCreditCards && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem', paddingTop: hasLoans ? '1.5rem' : '0', borderTop: hasLoans ? `1px solid ${T.cardBorder}` : 'none' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.06em', color: T.body, textTransform: 'uppercase' }}>
                      {t('dashboard.creditSection')}
                    </span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: T.radiusPill, background: T.cardBorder, color: T.muted }}>
                      {creditCardAccounts.length}
                    </span>
                  </div>

                  {/* Resumen utilización media */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: T.radiusMd, background: creditUtilBg, border: `1px solid ${creditUtilBorder}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: '0.375rem', borderRadius: T.radiusPill, background: T.cardBorder, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: T.radiusPill, background: creditUtilColor, width: `${Math.min(100, avgCreditUtil)}%`, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: creditUtilColor }}>{Math.round(avgCreditUtil)}%</span>
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '0.1rem 0.5rem', borderRadius: T.radiusPill, background: '#ffffff22', color: creditUtilColor, border: `1px solid ${creditUtilBorder}` }}>
                        {creditUtilLabel}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: creditUtilColor, fontWeight: 700 }}>
                        {fmt(totalCreditDebt, displayCurrency, displayCurrency, rates)}
                        {totalCreditLimit > 0 && (
                          <span style={{ fontWeight: 500, opacity: 0.75 }}> / {fmt(totalCreditLimit, displayCurrency, displayCurrency, rates)}</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Lista de tarjetas */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: hasCreditCards && hasLoans ? '1.5rem' : '0' }}>
                    {creditCardAccounts.map(acc => {
                      const info = realBalanceMap[acc.id];
                      const debt = info?.creditDebt ?? 0;
                      const util = info?.utilizationPct ?? 0;
                      const uc = util >= 70 ? T.red : util >= 30 ? T.amber : T.green;
                      return (
                        <div key={acc.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem 1rem', borderRadius: T.radiusMd, background: T.pageBg, border: `1px solid ${T.cardBorder}` }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.825rem', fontWeight: 700, color: T.title, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                              {acc.institution && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: T.accent }}>
                                  <InstitutionLogo name={acc.institution} size={14} />
                                  {acc.institution}
                                </span>
                              )}
                              {acc.institution && <span style={{ color: T.muted, fontWeight: 400 }}>—</span>}
                              <span>{acc.name}</span>
                            </div>
                            <div style={{ height: '0.25rem', borderRadius: T.radiusPill, background: T.cardBorder, overflow: 'hidden' }}>
                              <div style={{ height: '100%', borderRadius: T.radiusPill, background: uc, width: `${Math.min(100, util)}%`, transition: 'width 0.5s ease' }} />
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: debt > 0 ? SOFT_RED : SOFT_GREEN }}>{fmtAccount(debt, acc.currency ?? baseCurrency)}</div>
                            <div style={{ fontSize: '0.65rem', color: uc, fontWeight: 600 }}>{Math.round(util)}%</div>
                          </div>
                          {debt > 0 && (
                            <button
                              onClick={() => openPaymentModal(acc.id)}
                              title={t('dashboard.registerPayment')}
                              style={{ padding: '0.45rem 0.75rem', borderRadius: T.radiusBtn, border: 'none', background: T.green, color: '#fff', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
                            >
                              {t('dashboard.payBtn')}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* ── Subsección: Préstamos e hipotecas ── */}
              {hasLoans && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem', paddingTop: hasCreditCards ? '1.5rem' : '0', borderTop: hasCreditCards ? `1px solid ${T.cardBorder}` : 'none' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.06em', color: T.body, textTransform: 'uppercase' }}>
                      {t('dashboard.loansSection')}
                    </span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: T.radiusPill, background: T.cardBorder, color: T.muted }}>
                      {loanAccounts.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {loanAccounts.map(acc => {
                      const info = realBalanceMap[acc.id];
                      const debt = info?.loanDebt ?? acc.balance;
                      const appliedCount = info?.appliedCount ?? 0;
                      const totalEstimated = appliedCount + (acc.paymentsRemaining ?? 0);
                      const paidPct = totalEstimated > 0 ? (appliedCount / totalEstimated) * 100 : 0;
                      const isPaidOff = debt <= 0;
                      const icon = acc.loanType === 'personal' ? '💰' : '🏠';
                      return (
                        <div key={acc.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem 1rem', borderRadius: T.radiusMd, background: T.pageBg, border: `1px solid ${T.cardBorder}` }}>
                          <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>{icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.825rem', fontWeight: 700, color: T.title, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                              {acc.institution && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: T.accent }}>
                                  <InstitutionLogo name={acc.institution} size={14} />
                                  {acc.institution}
                                </span>
                              )}
                              {acc.institution && <span style={{ color: T.muted, fontWeight: 400 }}>—</span>}
                              <span>{acc.name}</span>
                            </div>
                            {acc.paymentsRemaining != null && acc.paymentsRemaining > 0 && (
                              <div style={{ height: '0.25rem', borderRadius: T.radiusPill, background: T.cardBorder, overflow: 'hidden' }}>
                                <div style={{ height: '100%', borderRadius: T.radiusPill, background: isPaidOff ? T.green : T.accent, width: `${Math.min(100, paidPct)}%`, transition: 'width 0.5s ease' }} />
                              </div>
                            )}
                            <div style={{ fontSize: '0.65rem', color: T.muted, marginTop: '0.25rem' }}>
                              {acc.monthlyPayment != null && acc.monthlyPayment > 0 && (
                                <>{fmtAccount(acc.monthlyPayment, acc.currency ?? baseCurrency)}{t('dashboard.perMonth')}</>
                              )}
                              {acc.paymentsRemaining != null && acc.paymentsRemaining > 0 && (
                                <> · {t(acc.paymentsRemaining === 1 ? 'dashboard.paymentsLeft1' : 'dashboard.paymentsLeftN', { n: acc.paymentsRemaining })}</>
                              )}
                              {acc.interestRate != null && acc.interestRate > 0 && (
                                <> · {acc.interestRate}% {acc.interestType === 'variable' ? t('dashboard.rateVariable') : t('dashboard.rateFixed')}</>
                              )}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: isPaidOff ? SOFT_GREEN : SOFT_RED }}>
                              {fmtAccount(debt, acc.currency ?? baseCurrency)}
                            </div>
                            {isPaidOff && (
                              <div style={{ fontSize: '0.65rem', color: SOFT_GREEN, fontWeight: 700 }}>
                                {t('dashboard.paidOff')}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

          </div>
        </Card>
      )}

      {/* ── Coach Mark ── */}
      {!coachSeen && (
        <CoachMark
          targetRef={coachRef}
          title={t('dashboard.coach.title')}
          description={t('dashboard.coach.description')}
          onDismiss={coachMarkSeen}
          accentColor="#3b82f6"
        />
      )}

      {/* ── Footer documento (solo impresión) ── */}
      <PrintFooter section={t('dashboard.title')} />

    </div>
  );
}
