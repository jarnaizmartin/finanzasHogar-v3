import { useState } from 'react';
import { Card } from './UI';
import { fmt } from '../utils';
import type { Category } from '../types';

type Theme = Record<string, string>;

type ForecastMonth = {
  key: string;
  label: string;
  income: number;
  expense: number;
  net: number;
  runningBalance: number;
};

type TopExpense = {
  cat: Category;
  val: number;
};

interface Props {
  T: Theme;
  hasProjections: boolean;
  forecastAll: ForecastMonth[];
  topProjectedExpenses: TopExpense[];
  displayCurrency: string;
  baseCurrency: string;
  rates: Record<string, number>;
  onGoToList: () => void;
}

export function ProjectionAnalysisView({
  T,
  hasProjections,
  forecastAll,
  topProjectedExpenses,
  displayCurrency,
  baseCurrency,
  rates,
  onGoToList,
}: Props) {
  const [forecastMonthOffset, setForecastMonthOffset] = useState(0);

  if (!hasProjections) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div
          style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            color: T.muted,
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>
            📊
          </div>
          <p
            style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              color: T.title,
              marginBottom: '0.5rem',
            }}
          >
            Aún no hay proyecciones para analizar
          </p>
          <p
            style={{
              fontSize: '0.875rem',
              color: T.muted,
              marginBottom: '1.5rem',
            }}
          >
            Crea algunas proyecciones primero y aquí verás el análisis completo.
          </p>
          <button
            onClick={onGoToList}
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '0.875rem',
              border: 'none',
              background: T.accent,
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
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
  d.setMonth(d.getMonth() + forecastMonthOffset);
  const raw = d.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });
  const label = raw.charAt(0).toUpperCase() + raw.slice(1);
  const maxOffset = Math.max(0, forecastAll.length - 6);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Selector de mes */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '0.625rem 1rem',
          borderRadius: '0.875rem',
          background: T.accentLight,
          border: `1px solid ${T.accent}33`,
        }}
      >
        <button
          onClick={() => setForecastMonthOffset((o) => Math.max(0, o - 1))}
          disabled={forecastMonthOffset <= 0}
          style={{
            padding: '0.35rem 0.875rem',
            borderRadius: '0.625rem',
            border: `1px solid ${T.accent}44`,
            background: T.cardBg,
            color: forecastMonthOffset <= 0 ? T.muted : T.accent,
            fontWeight: 800,
            fontSize: '1.1rem',
            cursor: forecastMonthOffset <= 0 ? 'default' : 'pointer',
            opacity: forecastMonthOffset <= 0 ? 0.35 : 1,
          }}
        >
          ←
        </button>
        <span
          style={{
            fontSize: '0.925rem',
            fontWeight: 800,
            color: T.accent,
            textTransform: 'capitalize',
            minWidth: '13rem',
            textAlign: 'center',
          }}
        >
          {label}
        </span>
        <button
          onClick={() =>
            setForecastMonthOffset((o) => Math.min(maxOffset, o + 1))
          }
          disabled={forecastMonthOffset >= maxOffset}
          style={{
            padding: '0.35rem 0.875rem',
            borderRadius: '0.625rem',
            border: `1px solid ${T.accent}44`,
            background: T.cardBg,
            color: forecastMonthOffset >= maxOffset ? T.muted : T.accent,
            fontWeight: 800,
            fontSize: '1.1rem',
            cursor: forecastMonthOffset >= maxOffset ? 'default' : 'pointer',
            opacity: forecastMonthOffset >= maxOffset ? 0.35 : 1,
          }}
        >
          →
        </button>
      </div>

      {/* Tabla previsión 6 meses */}
      <Card T={T} style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 1.75rem 1rem' }}>
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: T.muted,
              textTransform: 'uppercase',
              marginBottom: '0.4rem',
            }}
          >
            Proyección global
          </div>
          <div
            style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              color: T.title,
              letterSpacing: '-0.02em',
            }}
          >
            Previsión a 6 meses — Todas las cuentas
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.85rem',
            }}
          >
            <thead>
              <tr
                style={{
                  background: T.tableHead,
                  borderBottom: `1px solid ${T.tableBorder}`,
                }}
              >
                {['Mes', 'Ingresos', 'Gastos', 'Neto', 'Saldo est.'].map(
                  (h, i) => (
                    <th
                      key={h}
                      style={{
                        padding: '0.75rem 1.25rem',
                        textAlign: i === 0 ? 'left' : 'right',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: T.muted,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {forecastAll
                .slice(forecastMonthOffset, forecastMonthOffset + 6)
                .map((m, i) => (
                  <tr
                    key={m.key}
                    style={{
                      background: i % 2 === 0 ? T.tableRow : T.tableRowAlt,
                      borderBottom: `1px solid ${T.tableBorder}`,
                    }}
                  >
                    <td
                      style={{
                        padding: '0.75rem 1.25rem',
                        fontWeight: 700,
                        color: T.title,
                        textTransform: 'capitalize',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {m.label}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem 1.25rem',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: T.green,
                      }}
                    >
                      {fmt(m.income, displayCurrency, baseCurrency, rates)}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem 1.25rem',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: T.red,
                      }}
                    >
                      {fmt(m.expense, displayCurrency, baseCurrency, rates)}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem 1.25rem',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: m.net >= 0 ? T.green : T.red,
                      }}
                    >
                      {m.net >= 0 ? '+' : ''}
                      {fmt(m.net, displayCurrency, baseCurrency, rates)}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem 1.25rem',
                        textAlign: 'right',
                        fontWeight: 800,
                        color: T.accent,
                      }}
                    >
                      {fmt(
                        m.runningBalance,
                        displayCurrency,
                        baseCurrency,
                        rates
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Top gastos proyectados */}
      {topProjectedExpenses.length > 0 && (
        <Card T={T}>
          <div style={{ padding: '1.5rem 1.75rem 1rem' }}>
            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: T.muted,
                textTransform: 'uppercase',
                marginBottom: '0.4rem',
              }}
            >
              Distribución
            </div>
            <div
              style={{
                fontSize: '1.125rem',
                fontWeight: 800,
                color: T.title,
                letterSpacing: '-0.02em',
              }}
            >
              Gastos proyectados por categoría
            </div>
          </div>
          <div
            style={{
              padding: '0 1.75rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {topProjectedExpenses.map(({ cat, val }) => {
              const maxVal = Math.max(
                ...topProjectedExpenses.map((x) => x.val),
                1
              );
              return (
                <div key={cat.id}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.4rem',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        color: T.body,
                      }}
                    >
                      <span
                        style={{
                          width: '0.625rem',
                          height: '0.625rem',
                          borderRadius: '50%',
                          background: cat.color,
                          display: 'inline-block',
                          flexShrink: 0,
                        }}
                      />
                      {cat.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        color: T.title,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {fmt(val, displayCurrency, baseCurrency, rates)}
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: T.muted,
                          fontWeight: 400,
                        }}
                      >
                        /mes
                      </span>
                    </span>
                  </div>
                  <div
                    style={{
                      height: '0.375rem',
                      borderRadius: '9999px',
                      background: T.pageBg,
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        borderRadius: '9999px',
                        background: cat.color,
                        width: `${(val / maxVal) * 100}%`,
                        transition: 'width 0.5s ease',
                      }}
                    />
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
