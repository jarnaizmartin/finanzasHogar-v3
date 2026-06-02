import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCoachMark, CoachMark } from '../components/CoachMark';
import { StickyCompactBar } from '../components/StickyCompactBar';
import { Wallet, AlertTriangle } from 'lucide-react';
import { useApp } from '../AppContext';
import { fmt, fmtDateDMY } from '../utils';
import { Card, PrintButton, PrintHeader, PrintFooter, WarnBanner } from '../components/UI';
import { AlertsBanner } from './AlertsBanner';
import { SetupProgress } from '../components/SetupProgress';
import { CreditCardsComparison } from '../components/CreditCardsComparison';
import { InstitutionLogo } from '../components/InstitutionLogo';
import { getAccountStyle } from '../lib/accountsConstants';

export function Dashboard() {
  const { t } = useTranslation();
  const {
    T,
    displayCurrency,
    baseCurrency,
    rates,
    fmtAccount,
    accounts,
    forecastByAccount,
    accountWarnings,
    realBalanceMap,
    stats,
    dateFormat,
    openPaymentModal,
  } = useApp();

  const { totalRealBalance, thisMonth, warnAccounts } = stats;

  // Pre-computación datos tarjetas de crédito (OXC-safe: antes del return)
  const creditCardAccounts = accounts.filter(a => a.accountType === 'credit_card');
  const hasCreditCards = creditCardAccounts.length > 0;
  const totalCreditDebt = creditCardAccounts.reduce((s, a) => s + (realBalanceMap[a.id]?.creditDebt ?? 0), 0);
  const totalCreditLimit = creditCardAccounts.reduce((s, a) => s + (a.creditLimit ?? 0), 0);
  const avgCreditUtil = totalCreditLimit > 0 ? (totalCreditDebt / totalCreditLimit) * 100 : 0;
  const creditUtilColor = avgCreditUtil >= 70 ? T.red : avgCreditUtil >= 30 ? T.amber : T.green;
  const creditUtilBg = avgCreditUtil >= 70 ? (T.redBg ?? T.amberBg) : avgCreditUtil >= 30 ? T.amberBg : T.greenBg;
  const creditUtilBorder = avgCreditUtil >= 70 ? (T.redBorder ?? T.amberBorder) : avgCreditUtil >= 30 ? T.amberBorder : T.greenBorder;
  const creditUtilLabel = avgCreditUtil >= 90 ? t('dashboard.credit.critical') : avgCreditUtil >= 70 ? t('dashboard.credit.high') : avgCreditUtil >= 30 ? t('dashboard.credit.moderate') : t('dashboard.credit.excellent');

  // Pre-computación datos préstamos/hipotecas
  const loanAccounts = accounts.filter(a => a.accountType === 'loan');
  const hasLoans = loanAccounts.length > 0;
  const totalLoanDebt = loanAccounts.reduce((s, a) => s + (realBalanceMap[a.id]?.loanDebt ?? a.balance), 0);
  const totalMonthlyLoanPayment = loanAccounts.reduce((s, a) => s + (a.monthlyPayment ?? 0), 0);
  const totalYearlyLoanInterest = loanAccounts.reduce((s, a) => {
    const debt = realBalanceMap[a.id]?.loanDebt ?? a.balance;
    return s + (a.interestRate ? debt * (a.interestRate / 100) : 0);
  }, 0);

  const { seen: coachSeen, markSeen: coachMarkSeen } =
    useCoachMark('dashboard');
  const coachRef = useRef<HTMLDivElement>(null);

  // ── Sticky compact bar ────────────────────────────────────────────────────
  const stickyBarSentinelRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="fh-print-section"
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >

      {/* ── Cabecera documento (solo impresión) ── */}
      <PrintHeader
        title={t('dashboard.title')}
        subtitle={t(accounts.length === 1 ? 'dashboard.printSubtitle1' : 'dashboard.printSubtitleN', { n: accounts.length, amount: fmt(totalRealBalance, displayCurrency, displayCurrency, rates) })}
      />

      {/* ── Cabecera ── */}
      <div
        className="fh-no-print"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: T.accent,
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            {t('dashboard.overline')}
          </div>
          <h2
            style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              color: T.title,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              margin: 0,
            }}
          >
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
            subtitle={t(accounts.length === 1 ? 'dashboard.printSubtitle1' : 'dashboard.printSubtitleN', { n: accounts.length, amount: fmt(totalRealBalance, displayCurrency, displayCurrency, rates) })}
          />
        </div>
      </div>

      <WarnBanner warnAccounts={warnAccounts} T={T} />
      <AlertsBanner />
      <SetupProgress />

      {/* ── Hero ── */}
      <div
        ref={coachRef}
        style={{
          borderRadius: T.radiusLg,
          background: T.heroBg,
          padding: '2rem 2.5rem',
          border: `1.5px solid ${T.accent}44`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 12px 48px rgba(0,0,0,0.4), 0 0 60px ${T.accent}1f`,
        }}
      >
        {/* Patrimonio */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: T.heroMuted,
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            {t('dashboard.kpi.wealth')}
          </div>
          <div
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
              fontWeight: 800,
              color: T.heroText,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
            }}
          >
            {fmt(totalRealBalance, displayCurrency, displayCurrency, rates)}
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              color: T.heroMuted,
              marginTop: '0.375rem',
              opacity: 0.8,
            }}
          >
            {t(accounts.length === 1 ? 'dashboard.wealthSubtitle1' : 'dashboard.wealthSubtitleN', { n: accounts.length })}
          </div>
        </div>

        {/* KPIs en grid de 3 — igual que el mockup de la landing */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '1.25rem',
          }}
        >
          {[
            { label: t('dashboard.kpi.incomeMonth'), value: thisMonth.income, color: '#4ade80', prefix: '+' },
            { label: t('dashboard.kpi.expenseMonth'), value: thisMonth.expense, color: '#f87171', prefix: '' },
            { label: t('dashboard.kpi.netMonth'), value: thisMonth.net, color: thisMonth.net >= 0 ? '#4ade80' : '#f87171', prefix: thisMonth.net >= 0 ? '+' : '' },
          ].map((item, i) => (
            <div
              key={item.label}
              style={{
                textAlign: 'center',
                padding: '0 0.75rem',
                borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}
            >
              <div
                style={{
                  fontSize: '0.55rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: T.heroMuted,
                  marginBottom: '0.375rem',
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: '1.375rem',
                  fontWeight: 800,
                  color: item.color,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {item.prefix}{fmt(item.value, displayCurrency, baseCurrency, rates)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🎯 Sentinel — dispara la barra compacta sticky al hacer scroll */}
      <div ref={stickyBarSentinelRef} style={{ height: 1 }} />

      {/* ── Barra compacta sticky ── */}
      <StickyCompactBar
        title={t('dashboard.stickyTitle')}
        sentinelRef={stickyBarSentinelRef}
        kpis={[
          {
            label: t('dashboard.kpi.wealth'),
            icon: '💼',
            value: fmt(totalRealBalance, displayCurrency, displayCurrency, rates),
            color: T.accent,
          },
          {
            label: t('dashboard.kpi.incomeMonth'),
            icon: '↑',
            value: fmt(thisMonth.income, displayCurrency, baseCurrency, rates),
            color: T.green,
          },
          {
            label: t('dashboard.kpi.expenseMonth'),
            icon: '↓',
            value: fmt(thisMonth.expense, displayCurrency, baseCurrency, rates),
            color: T.red,
          },
          {
            label: t('dashboard.kpi.netMonth'),
            icon: '=',
            value: `${thisMonth.net >= 0 ? '+' : ''}${fmt(thisMonth.net, displayCurrency, baseCurrency, rates)}`,
            color: thisMonth.net >= 0 ? T.green : T.red,
          },
        ]}
      />

      {/* ── Estado por cuenta ── */}
      {accounts.some(a => a.accountType !== 'credit_card' && a.accountType !== 'loan') && (
      <div>
        <div
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: T.muted,
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}
        >
          {t('dashboard.accountsSection')}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(min(100%, 18rem), 1fr))',
            gap: '1rem',
          }}
        >
          {accounts.filter(a => a.accountType !== 'credit_card' && a.accountType !== 'loan').map((acc) => {
            const warn = accountWarnings[acc.id];
            const fc = forecastByAccount[acc.id] || [];
            const next = fc[0];
            const accStyle = getAccountStyle(acc.accountType, T);
            const headerAccent = warn ? T.amber : accStyle.accent;
            const headerBg = warn ? T.amberBg : accStyle.tintBg;
            const headerBorder = warn ? T.amberBorder : accStyle.tintBorder;
            const realBal = realBalanceMap[acc.id]?.realBalance ?? acc.balance;
            const appliedCount = realBalanceMap[acc.id]?.appliedCount ?? 0;
            const ignoredCount = realBalanceMap[acc.id]?.ignoredCount ?? 0;

            return (
              <Card
                key={acc.id}
                T={T}
                style={{
                  border: `2px solid ${warn ? T.amberBorder : T.cardBorder}`,
                  overflow: 'hidden',
                }}
              >
                {/* ───── Banda superior con tinte por tipo (espejo de Accounts) ───── */}
                <div
                  style={{
                    background: headerBg,
                    borderBottom: `1px solid ${headerBorder}`,
                    padding: '0.95rem 1.15rem 0.85rem',
                  }}
                >
                  {/* Fila 1 — Entidad + warning */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      marginBottom: '0.7rem',
                      minHeight: '1.25rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.875rem',
                        fontWeight: 800,
                        color: headerAccent,
                        letterSpacing: '-0.01em',
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {acc.institution ? (
                        <>
                          <InstitutionLogo name={acc.institution} size={14} />
                          {acc.institution}
                        </>
                      ) : (
                        <span style={{ opacity: 0.6, fontWeight: 700 }}>{t('accounts.card.noInstitution')}</span>
                      )}
                    </div>
                    {warn && <AlertTriangle size={14} color={T.amber} />}
                  </div>

                  {/* Fila 2 — Icono + nombre cuenta + tipo */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                    <div
                      style={{
                        width: '1.85rem',
                        height: '1.85rem',
                        borderRadius: '0.6rem',
                        background: '#ffffffcc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${headerBorder}`,
                        flexShrink: 0,
                      }}
                    >
                      <Wallet size={14} color={headerAccent} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: T.title,
                          letterSpacing: '-0.01em',
                          lineHeight: 1.2,
                          wordBreak: 'break-word',
                        }}
                      >
                        {acc.name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.58rem',
                          fontWeight: 700,
                          color: headerAccent,
                          opacity: 0.75,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          marginTop: '0.1rem',
                        }}
                      >
                        {accStyle.label} · {acc.currency ?? baseCurrency}
                      </div>
                    </div>
                  </div>

                  {/* Fila 3 — Saldo real + meta */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      paddingTop: '0.7rem',
                      borderTop: `1px dashed ${headerBorder}`,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.58rem',
                          fontWeight: 700,
                          letterSpacing: '0.07em',
                          color: headerAccent,
                          opacity: 0.85,
                          textTransform: 'uppercase',
                          marginBottom: '0.2rem',
                        }}
                      >
                        {t('dashboard.realBalance')}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: T.muted, lineHeight: 1.35 }}>
                        {t('dashboard.baseBalance', { amount: fmtAccount(acc.balance, acc.currency ?? baseCurrency) })}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: T.muted, lineHeight: 1.35 }}>
                        {t('dashboard.asOf', { date: fmtDateDMY(acc.date, dateFormat) })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: 'clamp(1.25rem, 3.5vw, 1.6rem)',
                          fontWeight: 800,
                          color: warn ? T.amber : headerAccent,
                          letterSpacing: '-0.03em',
                          whiteSpace: 'nowrap',
                          lineHeight: 1,
                        }}
                      >
                        {fmtAccount(realBal, acc.currency ?? baseCurrency)}
                      </div>
                      {(appliedCount > 0 || ignoredCount > 0) && (
                        <div
                          style={{
                            marginTop: '0.35rem',
                            display: 'flex',
                            gap: '0.3rem',
                            justifyContent: 'flex-end',
                            flexWrap: 'wrap',
                          }}
                        >
                          {appliedCount > 0 && (
                            <span
                              title={t(appliedCount === 1 ? 'dashboard.applied1' : 'dashboard.appliedN', { n: appliedCount })}
                              style={{
                                fontSize: '0.55rem',
                                fontWeight: 800,
                                padding: '0.08rem 0.35rem',
                                borderRadius: '9999px',
                                background: '#ffffffcc',
                                color: T.green,
                                border: `1px solid ${T.greenBorder}`,
                              }}
                            >
                              ✓ {appliedCount}
                            </span>
                          )}
                          {ignoredCount > 0 && (
                            <span
                              title={t(ignoredCount === 1 ? 'dashboard.ignored1' : 'dashboard.ignoredN', { n: ignoredCount })}
                              style={{
                                fontSize: '0.55rem',
                                fontWeight: 800,
                                padding: '0.08rem 0.35rem',
                                borderRadius: '9999px',
                                background: '#ffffffcc',
                                color: T.amber,
                                border: `1px solid ${T.amberBorder}`,
                              }}
                            >
                              ⚠ {ignoredCount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ───── Body — Previsión mensual ───── */}
                {next && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      borderTop: `1px solid ${T.cardBorder}`,
                    }}
                  >
                    {[
                      { label: t('dashboard.kpi.incomeShort'), value: next.income, color: T.green },
                      { label: t('dashboard.kpi.expenseShort'), value: next.expense, color: T.red },
                      { label: t('dashboard.kpi.netShort'), value: next.net, color: next.net >= 0 ? T.green : T.red, prefix: next.net >= 0 ? '+' : '' },
                    ].map((item, i) => (
                      <div
                        key={item.label}
                        style={{
                          padding: '0.625rem 0.75rem',
                          borderRight: i < 2 ? `1px solid ${T.cardBorder}` : 'none',
                          textAlign: 'center',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.58rem',
                            color: T.muted,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            marginBottom: '0.2rem',
                          }}
                        >
                          {item.label}
                        </div>
                        <div
                          style={{
                            fontSize: '0.825rem',
                            fontWeight: 800,
                            color: item.color,
                            letterSpacing: '-0.01em',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {(item as any).prefix ?? ''}
                          {fmtAccount(item.value, acc.currency ?? baseCurrency)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
          </div>
        </div>
        )}

      {/* ── Tarjetas de crédito (reubicado en 5.5.0: ahora después de "Estado por cuenta") ── */}
      {hasCreditCards && (
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: T.muted, textTransform: 'uppercase', marginBottom: '1rem' }}>
            {t('dashboard.creditSection')}
          </div>
          <Card T={T}>
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: creditCardAccounts.length > 1 ? '1.25rem' : '0', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{t('dashboard.totalDebt')}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: totalCreditDebt > 0 ? T.red : T.green }}>
                    {fmt(totalCreditDebt, displayCurrency, displayCurrency, rates)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{t('dashboard.available')}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: T.green }}>
                    {fmt(Math.max(0, totalCreditLimit - totalCreditDebt), displayCurrency, displayCurrency, rates)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{t('dashboard.avgUtil')}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: creditUtilColor }}>{Math.round(avgCreditUtil)}%</div>
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '0.1rem 0.45rem', borderRadius: '9999px', background: creditUtilBg, color: creditUtilColor, border: `1px solid ${creditUtilBorder}` }}>{creditUtilLabel}</span>
                  </div>
                </div>
              </div>
              {creditCardAccounts.length > 1 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {creditCardAccounts.map(acc => {
                    const info = realBalanceMap[acc.id];
                    const debt = info?.creditDebt ?? 0;
                    const util = info?.utilizationPct ?? 0;
                    const uc = util >= 70 ? T.red : util >= 30 ? T.amber : T.green;
                    return (
                      <div key={acc.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.625rem 0.875rem', borderRadius: '0.75rem', background: T.pageBg, border: `1px solid ${T.cardBorder}` }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.825rem', fontWeight: 700, color: T.title, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {acc.institution && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: T.accent }}>
                                <InstitutionLogo name={acc.institution} size={14} />
                                {acc.institution}
                              </span>
                            )}
                            {acc.institution && <span style={{ color: T.muted, fontWeight: 400 }}>—</span>}
                            <span>{acc.name}</span>
                          </div>
                          <div style={{ height: '0.25rem', borderRadius: '9999px', background: T.cardBorder, overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: '9999px', background: uc, width: `${Math.min(100, util)}%`, transition: 'width 0.5s ease' }} />
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: debt > 0 ? T.red : T.green }}>{fmtAccount(debt, acc.currency ?? baseCurrency)}</div>
                          <div style={{ fontSize: '0.65rem', color: uc, fontWeight: 600 }}>{Math.round(util)}%</div>
                        </div>
                        {debt > 0 && (
                          <button
                            onClick={() => openPaymentModal(acc.id)}
                            title={t('dashboard.registerPayment')}
                            style={{ padding: '0.45rem 0.7rem', borderRadius: '0.625rem', border: 'none', background: T.green, color: '#fff', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
                          >
                            {t('dashboard.payBtn')}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                creditCardAccounts.length === 1 && (realBalanceMap[creditCardAccounts[0].id]?.creditDebt ?? 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => openPaymentModal(creditCardAccounts[0].id)}
                      style={{ padding: '0.55rem 1rem', borderRadius: '0.75rem', border: 'none', background: T.green, color: '#fff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {t('dashboard.registerPayment')}
                    </button>
                  </div>
                )
              )}
            </div>
          </Card>

          {/* ── Comparativa entre tarjetas (5.5) ── */}
          {/* Se auto-oculta si hay <2 tarjetas o ninguna con deuda */}
          <div style={{ marginTop: '1.5rem' }}>
            <CreditCardsComparison />
          </div>
        </div>
      )}

      {/* ── Préstamos e hipotecas ── */}
      {hasLoans && (
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: T.muted, textTransform: 'uppercase', marginBottom: '1rem' }}>
            {t('dashboard.loansSection')}
          </div>
          <Card T={T}>
            <div style={{ padding: '1.25rem 1.5rem' }}>
              {/* Resumen agregado */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: loanAccounts.length > 0 ? '1.25rem' : '0', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{t('dashboard.totalDebt')}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: totalLoanDebt > 0 ? T.red : T.green }}>
                    {fmt(totalLoanDebt, displayCurrency, displayCurrency, rates)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{t('dashboard.monthlyPaymentTotal')}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: T.title }}>
                    {fmt(totalMonthlyLoanPayment, displayCurrency, displayCurrency, rates)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{t('dashboard.yearlyInterest')}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: totalYearlyLoanInterest > 0 ? T.amber : T.muted }}>
                    {fmt(totalYearlyLoanInterest, displayCurrency, displayCurrency, rates)}
                  </div>
                </div>
              </div>

              {/* Lista de préstamos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {loanAccounts.map(acc => {
                  const info = realBalanceMap[acc.id];
                  const debt = info?.loanDebt ?? acc.balance;
                  const initial = info?.loanInitialDebt ?? acc.balance;
                  const appliedCount = info?.appliedCount ?? 0;
                  const totalEstimated = appliedCount + (acc.paymentsRemaining ?? 0);
                  const paidPct = totalEstimated > 0 ? (appliedCount / totalEstimated) * 100 : 0;
                  const isPaidOff = debt <= 0;
                  const icon = acc.loanType === 'personal' ? '💰' : '🏠';

                  return (
                    <div key={acc.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem 0.875rem', borderRadius: '0.75rem', background: T.pageBg, border: `1px solid ${T.cardBorder}` }}>
                      <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.825rem', fontWeight: 700, color: T.title, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
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
                          <div style={{ height: '0.25rem', borderRadius: '9999px', background: T.cardBorder, overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: '9999px', background: isPaidOff ? T.green : T.accent, width: `${Math.min(100, paidPct)}%`, transition: 'width 0.5s ease' }} />
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
                        <div style={{ fontSize: '0.875rem', fontWeight: 800, color: isPaidOff ? T.green : T.red }}>
                          {fmtAccount(debt, acc.currency ?? baseCurrency)}
                        </div>
                        {!isPaidOff && initial !== debt && (
                          <div style={{ fontSize: '0.65rem', color: T.muted }}>
                            {t('dashboard.loanOrigin', { amount: fmtAccount(initial, acc.currency ?? baseCurrency) })}
                          </div>
                        )}
                        {isPaidOff && (
                          <div style={{ fontSize: '0.65rem', color: T.green, fontWeight: 700 }}>
                            {t('dashboard.paidOff')}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
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
