import { useState, useMemo } from 'react';
import { fmtMonth, fmtDate } from './lib/i18nFormats';
import { useTranslation } from 'react-i18next';
import { useApp } from './AppContext';
import { useToast } from './contexts/ToastContext';
import {
  PrintButton,
  PrintHeader,
  PrintFooter,
} from './components/UI';
// 🧹 Quick-win 2.1: helpers centralizados en utils.ts (eliminadas duplicaciones locales)
import { convertAmount, fmt, fmtDateDMY, FREQUENCIES } from './utils';
import {
  computePeriodKeys,
  computePeriodLabel,
  filterPeriodReals,
  computePeriodProjections,
  computeTotals,
  computeCatRows,
  computeGoalSaved,
  computeGoalsStats,
  computeTrendsStats,
} from './lib/reportsCalc';
import {
  buildProjectionsCsv,
  buildMovementsCsv,
  downloadCsv,
} from './lib/reportsCsv';
import { ReportKpiGrid } from './components/reports/ReportKpiGrid';
import { ReportBadge } from './components/reports/ReportBadge';
import { ReportSection } from './components/reports/ReportSection';
import { AccountsReport } from './components/reports/AccountsReport';
import { GoalsReport } from './components/reports/GoalsReport';
import { TrendsReport } from './components/reports/TrendsReport';
import { ProjectionsReport } from './components/reports/ProjectionsReport';
import { MovementsReport } from './components/reports/MovementsReport';

export function Reports() {
  const { t } = useTranslation();
  const {
    T,
    accounts,
    categories,
    projections,
    realExpenses,
    goals,
    baseCurrency,
    displayCurrency,
    rates,
    realBalanceMap,
    dateFormat,
  } = useApp();

  const now = new Date();

  const [reportType, setReportType] = useState<
    'movements' | 'accounts' | 'projections' | 'goals' | 'trends'
  >('movements');
  const [mode, setMode] = useState<'month' | 'range'>('month');
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [rangeFrom, setRangeFrom] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  );
  const [rangeTo, setRangeTo] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  );

  const periodKeys = useMemo(
    () => computePeriodKeys(mode, selectedYear, selectedMonth, rangeFrom, rangeTo),
    [mode, selectedYear, selectedMonth, rangeFrom, rangeTo]
  );

  const periodLabel = useMemo(
    () => computePeriodLabel(mode, selectedYear, selectedMonth, rangeFrom, rangeTo),
    [mode, selectedYear, selectedMonth, rangeFrom, rangeTo]
  );

  const periodReals = useMemo(
    () => filterPeriodReals(realExpenses, periodKeys),
    [realExpenses, periodKeys]
  );

  const periodProjections = useMemo(
    () => computePeriodProjections(projections, periodKeys),
    [projections, periodKeys]
  );

  const totals = useMemo(
    () =>
      computeTotals(
        periodReals,
        periodProjections,
        accounts,
        baseCurrency,
        displayCurrency,
        rates
      ),
    [
      periodReals,
      periodProjections,
      accounts,
      baseCurrency,
      displayCurrency,
      rates,
    ]
  );

  const catRows = useMemo(
    () =>
      computeCatRows(
        periodProjections,
        periodReals,
        accounts,
        baseCurrency,
        displayCurrency,
        rates
      ),
    [
      periodProjections,
      periodReals,
      accounts,
      baseCurrency,
      displayCurrency,
      rates,
    ]
  );

  const exportCSV = () => {
    if (reportType === 'projections') {
      const csv = buildProjectionsCsv(projections, categories, accounts, baseCurrency);
      downloadCsv(csv, 'FinanzasHogar_proyecciones.csv');
      return;
    }
    const csv = buildMovementsCsv(periodReals, categories, accounts);
    downloadCsv(
      csv,
      `FinanzasHogar_informe_${periodLabel.replace(/\s/g, '_')}.csv`
    );
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: '0.68rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: T.muted,
    textTransform: 'uppercase',
    marginBottom: '0.75rem',
  };

    // ── Títulos dinámicos para impresión ──────────────────────────────────────
    const printMeta = useMemo(() => {
      const map = {
        movements: {
          doc:     'Informe_Movimientos',
          section: t('reports.printMovements'),
          sub:     periodLabel,
        },
        accounts: {
          doc:     'Informe_Cuentas',
          section: t('reports.printAccounts'),
          sub:     `${accounts.length} cuenta${accounts.length !== 1 ? 's' : ''}`,
        },
        projections: {
          doc:     'Informe_Proyecciones',
          section: t('reports.printProjections'),
          sub:     `${projections.length} proyección${projections.length !== 1 ? 'es' : ''}`,
        },
        goals: {
          doc:     'Informe_Objetivos',
          section: t('reports.printGoals'),
          sub:     `${goals.length} objetivo${goals.length !== 1 ? 's' : ''}`,
        },
        trends: {
          doc:     'Informe_Tendencias',
          section: t('reports.printTrends'),
          sub:     t('reports.printTrendsSub', { n: realExpenses.length }),
        },
      };
      return map[reportType];
    }, [reportType, periodLabel, accounts.length, projections.length, goals.length, realExpenses.length]);
  
    return (
      <div
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      className="fh-print-section"
    >
      {/* ── Cabecera documento (solo impresión) ── */}
      <PrintHeader
        title={printMeta.section}
        subtitle={printMeta.sub}
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
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: T.accent,
              textTransform: 'uppercase',
              marginBottom: '0.4rem',
            }}
          >
            {t('reports.overline')}
          </div>
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: T.title,
              letterSpacing: '-0.04em',
              margin: 0,
            }}
          >
            {t('reports.title')}
          </h2>
          <p
            style={{ fontSize: '0.9rem', color: T.muted, marginTop: '0.4rem' }}
          >
            {t('reports.subtitle')}
          </p>
        </div>
        <div
          className="fh-no-print"
          style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
        >
          {(reportType === 'movements' || reportType === 'projections') && (
            <button
              onClick={exportCSV}
              disabled={reportType === 'movements' && periodReals.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                borderRadius: '0.75rem',
                border: `1.5px solid ${T.greenBorder}`,
                background: T.greenBg,
                color: T.green,
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor:
                  reportType === 'movements' && periodReals.length === 0
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  reportType === 'movements' && periodReals.length === 0
                    ? 0.5
                    : 1,
              }}
            >
              {t('reports.exportCsv')}
            </button>
          )}
          <PrintButton
            T={T}
            documentTitle={printMeta.doc}
            sectionTitle={printMeta.section}
            subtitle={printMeta.sub}
          />
        </div>
      </div>

      {/* ── Selector tipo informe ── */}
      <div
        className="fh-no-print"
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '0.25rem',
        }}
      >
        {(
          [
            ['movements', t('reports.tabMovements')],
            ['accounts', t('reports.tabAccounts')],
            ['projections', t('reports.tabProjections')],
            ['goals', t('reports.tabGoals')],
            ['trends', t('reports.tabTrends')],
          ] as ['movements' | 'accounts' | 'projections' | 'goals' | 'trends', string][]
        ).map(([v, l]) => (
          <button
            key={v}
            onClick={() => setReportType(v)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: reportType === v ? 'none' : `1px solid ${T.cardBorder}`,
              background: reportType === v ? T.accent : T.cardBg,
              color: reportType === v ? '#fff' : T.muted,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ── Selector período ── */}
      <div
        className="fh-no-print"
        style={{
          padding: '1.25rem',
          borderRadius: '1rem',
          background: T.cardBg,
          border: `1px solid ${T.cardBorder}`,
        }}
      >
        <div style={sectionTitle}>{t('reports.periodTitle')}</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {(
            [
              ['month', t('reports.modeMonth')],
              ['range', t('reports.modeRange')],
            ] as ['month' | 'range', string][]
          ).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setMode(v)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.625rem',
                border: mode === v ? 'none' : `1px solid ${T.cardBorder}`,
                background: mode === v ? T.accent : T.pageBg,
                color: mode === v ? '#fff' : T.muted,
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {l}
            </button>
          ))}
        </div>
        {mode === 'month' ? (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
              }}
            >
              <label
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: T.muted,
                  textTransform: 'uppercase',
                }}
              >
                {t('reports.labelYear')}
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.625rem',
                  border: `1.5px solid ${T.inputBorder}`,
                  background: T.inputBg,
                  color: T.inputText,
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              >
                {Array.from(
                  { length: 5 },
                  (_, i) => now.getFullYear() - 2 + i
                ).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
              }}
            >
              <label
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: T.muted,
                  textTransform: 'uppercase',
                }}
              >
                {t('reports.labelMonth')}
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.625rem',
                  border: `1.5px solid ${T.inputBorder}`,
                  background: T.inputBg,
                  color: T.inputText,
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              >
                {Array.from({ length: 12 }, (_, i) => ({
                  value: i,
                  label: fmtMonth(new Date(2024, i, 1)),
                })).map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
              }}
            >
              <label
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: T.muted,
                  textTransform: 'uppercase',
                }}
              >
                {t('reports.labelFrom')}
              </label>
              <input
                type="month"
                value={rangeFrom}
                max={rangeTo}
                onChange={(e) => setRangeFrom(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.625rem',
                  border: `1.5px solid ${T.inputBorder}`,
                  background: T.inputBg,
                  color: T.inputText,
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>
            <span
              style={{
                color: T.muted,
                fontWeight: 700,
                paddingBottom: '0.5rem',
              }}
            >
              →
            </span>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
              }}
            >
              <label
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: T.muted,
                  textTransform: 'uppercase',
                }}
              >
                {t('reports.labelTo')}
              </label>
              <input
                type="month"
                value={rangeTo}
                min={rangeFrom}
                onChange={(e) => setRangeTo(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.625rem',
                  border: `1.5px solid ${T.inputBorder}`,
                  background: T.inputBg,
                  color: T.inputText,
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        )}
      </div>

{/* ── Título período ── */}
<div className="fh-no-print" style={{ textAlign: 'center', padding: '0.5rem 0' }}>
        <div
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: T.title,
            textTransform: 'capitalize' as const,
          }}
        >
          {reportType === 'movements' && t('reports.movementsTitle', { period: periodLabel })}
          {reportType === 'accounts' && t('reports.accountsTitle')}
          {reportType === 'projections' && t('reports.projectionsTitle')}
          {reportType === 'goals' && t('reports.goalsTitle')}
          {reportType === 'trends' && t('reports.trendsTitle')}
        </div>
        <div
          style={{ fontSize: '0.8rem', color: T.muted, marginTop: '0.25rem' }}
        >
          {t('reports.generatedOn', {
            date: fmtDate(new Date(), { day: 'numeric', month: 'long', year: 'numeric' }),
          })}
        </div>
      </div>

      {/* ── INFORME: Movimientos ── */}
      {reportType === 'movements' && (
        <MovementsReport
          totals={totals}
          catRows={catRows}
          periodReals={periodReals}
        />
      )}

      {/* ── INFORME: Cuentas ── */}

      {/* ── INFORME: Cuentas ── */}
      {reportType === 'accounts' && <AccountsReport />}

      {/* ── INFORME: Proyecciones ── */}
      {reportType === 'projections' && <ProjectionsReport />}

      {/* ── INFORME: Objetivos ── */}
      {reportType === 'goals' && <GoalsReport />}

      {/* ── INFORME: Tendencias ── */}
      {reportType === 'trends' && <TrendsReport periodKeys={periodKeys} />}

      {/* ── Footer documento (solo impresión) ── */}
      <PrintFooter section={printMeta.section} />

    </div>
  );
}
