// ─── Vista de Análisis de movimientos reales ────────────────────────────────
// Extraído de RealExpenses.tsx (Fase 3, paso 3).

import { useMemo } from 'react';
import { useApp } from '../../AppContext';
import { convertAmount, fmt } from '../../utils';
import { Card } from '../UI';
import { ProjectedVsReal } from '../../views/ProjectedVsReal';

type Props = {
  monthOffset: number;
  setMonthOffset: (updater: (o: number) => number) => void;
  onGoToList: () => void;
};

export function RealExpensesAnalysis({ monthOffset, setMonthOffset, onGoToList }: Props) {
  const { T, realExpenses, categories, displayCurrency, rates } = useApp();

  const topRealCategories = useMemo(() => {
    const now = new Date();
    const mk = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const map: Record<string, number> = {};
    realExpenses
      .filter((e) => e.type === 'expense' && e.entryDate.slice(0, 7) === mk)
      .forEach((e) => {
        map[e.categoryId] =
          (map[e.categoryId] || 0) +
          convertAmount(e.amount, e.currency, displayCurrency, rates);
      });
    return Object.entries(map)
      .map(([id, val]) => ({ cat: categories.find((c) => c.id === id), val }))
      .filter((x) => x.cat)
      .sort((a, b) => b.val - a.val)
      .slice(0, 5);
  }, [realExpenses, categories, displayCurrency, rates]);

  if (realExpenses.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: T.muted }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📊</div>
          <p style={{ fontSize: '1.125rem', fontWeight: 800, color: T.title, marginBottom: '0.5rem' }}>
            Aún no hay datos para analizar
          </p>
          <p style={{ fontSize: '0.875rem', color: T.muted, marginBottom: '1.5rem' }}>
            Registra algunos movimientos primero y aquí verás el análisis completo.
          </p>
          <button
            onClick={onGoToList}
            style={{
              padding: '0.65rem 1.5rem', borderRadius: '0.875rem', border: 'none',
              background: T.accent, color: '#fff', fontWeight: 700,
              fontSize: '0.875rem', cursor: 'pointer',
            }}
          >
            Ir a la lista →
          </button>
        </div>
      </div>
    );
  }

  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + monthOffset);
  const label = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const isCurrentMonth = monthOffset >= 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Navegador de mes */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
        padding: '0.625rem 1rem', borderRadius: '0.875rem',
        background: T.accentLight, border: `1px solid ${T.accent}33`,
      }}>
        <button
          onClick={() => setMonthOffset((o) => o - 1)}
          style={{
            padding: '0.35rem 0.875rem', borderRadius: '0.625rem',
            border: `1px solid ${T.accent}44`, background: T.cardBg,
            color: T.accent, fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer',
          }}
        >
          ←
        </button>
        <span style={{
          fontSize: '0.925rem', fontWeight: 800, color: T.accent,
          textTransform: 'capitalize', minWidth: '13rem', textAlign: 'center',
        }}>
          {label}
        </span>
        <button
          onClick={() => setMonthOffset((o) => Math.min(0, o + 1))}
          disabled={isCurrentMonth}
          style={{
            padding: '0.35rem 0.875rem', borderRadius: '0.625rem',
            border: `1px solid ${T.accent}44`, background: T.cardBg,
            color: isCurrentMonth ? T.muted : T.accent,
            fontWeight: 800, fontSize: '1.1rem',
            cursor: isCurrentMonth ? 'default' : 'pointer',
            opacity: isCurrentMonth ? 0.35 : 1,
          }}
        >
          →
        </button>
      </div>

      <ProjectedVsReal monthOffset={monthOffset} />

      {topRealCategories.length > 0 && (
        <Card T={T}>
          <div style={{ padding: '1.5rem 1.75rem 1rem' }}>
            <div style={{
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em',
              color: T.muted, textTransform: 'uppercase', marginBottom: '0.4rem',
            }}>
              Desglose
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: T.title, letterSpacing: '-0.02em' }}>
              Gastos reales por categoría — Este mes
            </div>
          </div>
          <div style={{
            padding: '0 1.75rem 1.75rem', display: 'flex',
            flexDirection: 'column', gap: '1rem',
          }}>
            {topRealCategories.map(({ cat, val }) => {
              const maxVal = Math.max(...topRealCategories.map((x) => x.val), 1);
              return (
                <div key={cat!.id}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '0.4rem',
                  }}>
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      fontSize: '0.825rem', fontWeight: 600, color: T.body,
                    }}>
                      <span style={{
                        width: '0.625rem', height: '0.625rem', borderRadius: '50%',
                        background: cat!.color, display: 'inline-block', flexShrink: 0,
                      }} />
                      {cat!.name}
                    </span>
                    <span style={{
                      fontSize: '0.825rem', fontWeight: 700, color: T.title, whiteSpace: 'nowrap',
                    }}>
                      {fmt(val, displayCurrency, displayCurrency, rates)}
                    </span>
                  </div>
                  <div style={{ height: '0.375rem', borderRadius: '9999px', background: T.pageBg }}>
                    <div style={{
                      height: '100%', borderRadius: '9999px', background: cat!.color,
                      width: `${(val / maxVal) * 100}%`, transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
