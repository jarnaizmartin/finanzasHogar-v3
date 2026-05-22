// ─── Vista "Objetivos" del módulo Reports ────────────────────────────────────
// Extraída de Reports.tsx (Fase 2.4).

import { useApp } from '../../AppContext';
import { fmt, fmtDateDMY } from '../../utils';
import { computeGoalSaved, computeGoalsStats } from '../../lib/reportsCalc';
import { ReportKpiGrid } from './ReportKpiGrid';
import { ReportBadge } from './ReportBadge';
import { ReportSection } from './ReportSection';

export function GoalsReport() {
  const { T, goals, realExpenses, displayCurrency, rates, dateFormat } = useApp();

  const { total, completed, totalTarget } = computeGoalsStats(
    goals,
    realExpenses,
    displayCurrency,
    rates
  );

  return (
    <>
      <ReportKpiGrid
        items={[
          {
            label: 'Total objetivos',
            value: `${total}`,
            color: T.accent, bg: T.accentLight, border: `${T.accent}33`, icon: '🎯',
          },
          {
            label: 'Completados',
            value: `${completed} / ${total}`,
            color: T.green, bg: T.greenBg, border: T.greenBorder, icon: '✅',
          },
          {
            label: 'Total objetivo',
            value: fmt(totalTarget, displayCurrency, displayCurrency, rates),
            color: T.muted, bg: T.pageBg, border: T.cardBorder, icon: '💰',
          },
        ]}
      />
      <ReportSection T={T} title="Estado de cada objetivo" scrollX>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.85rem',
          }}
        >
          <thead>
            <tr style={{ background: T.tableHead, borderBottom: `2px solid ${T.tableBorder}` }}>
              {['Objetivo', 'Modo', 'Ahorrado', 'Meta', '% Progreso', 'Fecha límite', 'Estado'].map((h, i) => (
                <th
                  key={h}
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: i === 0 ? 'left' : 'right',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase' as const,
                    color: T.muted,
                    whiteSpace: 'nowrap' as const,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {goals.map((g, i) => {
              const saved = computeGoalSaved(g, realExpenses, rates);
              const pct = g.targetAmount > 0
                ? Math.min((saved / g.targetAmount) * 100, 100)
                : 0;
              const isCompleted = saved >= g.targetAmount;
              const overdue = g.deadline && new Date(g.deadline) < new Date() && !isCompleted;
              return (
                <tr
                  key={g.id}
                  style={{
                    background: i % 2 === 0 ? T.tableRow : T.tableRowAlt,
                    borderBottom: `1px solid ${T.tableBorder}`,
                  }}
                >
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontWeight: 700, color: T.title }}>
                      {g.emoji} {g.name}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: T.muted }}>
                    {g.mode === 'manual' ? '✍️ Manual' : '⚡ Auto'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: T.green }}>
                    {fmt(saved, g.currency, g.currency, rates)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: T.muted }}>
                    {fmt(g.targetAmount, g.currency, g.currency, rates)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <div
                        style={{
                          width: '4rem',
                          height: '0.375rem',
                          borderRadius: '9999px',
                          background: T.pageBg,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            borderRadius: '9999px',
                            background: isCompleted ? T.green : g.color,
                            width: `${pct}%`,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontWeight: 800,
                          color: isCompleted ? T.green : T.title,
                          fontSize: '0.8rem',
                        }}
                      >
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: T.muted, whiteSpace: 'nowrap' as const }}>
                    {g.deadline ? fmtDateDMY(g.deadline, dateFormat) : '—'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <ReportBadge
                      T={T}
                      variant={isCompleted ? 'success' : overdue ? 'danger' : 'warning'}
                    >
                      {isCompleted ? '✅ Completado' : overdue ? '⏰ Vencido' : '🔄 En progreso'}
                    </ReportBadge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ReportSection>
    </>
  );
}
