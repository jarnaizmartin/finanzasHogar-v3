import { useState, useRef } from 'react';
import { useApp } from '../AppContext';
import { computeTrendsData } from '../lib/trendsCalc';
import { useContainerWidth } from '../hooks/useContainerWidth';
import { TrendsEmptyState } from '../components/trends/TrendsEmptyState';
import { TrendsHeader } from '../components/trends/TrendsHeader';
import { TrendsStatsGrid } from '../components/trends/TrendsStatsGrid';
import { TrendsStickyBar } from '../components/trends/TrendsStickyBar';
import { TrendsChartIncomeExpenses } from '../components/trends/TrendsChartIncomeExpenses';
import { TrendsChartSavingsRate } from '../components/trends/TrendsChartSavingsRate';
import { TrendsChartBalance } from '../components/trends/TrendsChartBalance';
import { TrendsCategoryCharts } from '../components/trends/TrendsCategoryCharts';
import { TrendsSummaryHighlights } from '../components/trends/TrendsSummaryHighlights';

export function TrendsView() {
  const { T, accounts, categories, realExpenses, rates, baseCurrency } = useApp();
  const [rangeMonths, setRangeMonths] = useState<number | 'all'>(6);
  const [accountFilter, setAccountFilter] = useState('all');

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [refG1, widthG1] = useContainerWidth();
  const [refG2, widthG2] = useContainerWidth();
  const [refG3, widthG3] = useContainerWidth();
  const [refG4, widthG4] = useContainerWidth();

  const data = computeTrendsData(rangeMonths, accountFilter, accounts, realExpenses, categories, rates, baseCurrency);

  if (!data) return <TrendsEmptyState T={T} />;

  const { monthlyData, balanceData, categoryData, filteredAccounts, stats } = data;

  const printSubtitle = [
    rangeMonths === 'all' ? 'Todo el histórico' : `Últimos ${rangeMonths} meses`,
    accountFilter !== 'all' ? `Cuenta: ${accounts.find((a) => a.id === accountFilter)?.name ?? ''}` : null,
    data.stats.monthCount != null ? `${data.stats.monthCount} mes${data.stats.monthCount !== 1 ? 'es' : ''} analizados` : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="fh-print-section" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <TrendsHeader
        T={T}
        rangeMonths={rangeMonths}
        onRangeChange={setRangeMonths}
        accountFilter={accountFilter}
        onAccountFilterChange={setAccountFilter}
        accounts={accounts}
        printSubtitle={printSubtitle}
      />
      <TrendsStatsGrid T={T} stats={stats} baseCurrency={baseCurrency} rates={rates} />
      <TrendsStickyBar T={T} stats={stats} baseCurrency={baseCurrency} rates={rates} rangeMonths={rangeMonths} sentinelRef={sentinelRef} />
      <TrendsChartIncomeExpenses T={T} monthlyData={monthlyData} containerRef={refG1} width={widthG1} />
      <TrendsChartSavingsRate T={T} monthlyData={monthlyData} containerRef={refG2} width={widthG2} />
      <TrendsChartBalance T={T} balanceData={balanceData} filteredAccounts={filteredAccounts} containerRef={refG3} width={widthG3} />
      <TrendsCategoryCharts T={T} categoryData={categoryData} containerRef={refG4} width={widthG4} baseCurrency={baseCurrency} />
      <TrendsSummaryHighlights T={T} stats={stats} baseCurrency={baseCurrency} rates={rates} rangeMonths={rangeMonths} />
    </div>
  );
}
