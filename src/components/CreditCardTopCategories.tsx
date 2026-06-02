// ─────────────────────────────────────────────────────────────────────────────
// CreditCardTopCategories.tsx
// Top categorías de gasto de una tarjeta de crédito.
// Visualización con barras proporcionales e iconos de categoría.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../AppContext';
import { calcTopCategoriesForCard } from '../lib/creditCardUtils';
import type { Account } from '../types';
// 🧹 Quick-win 2.2b: fmtMoney centralizado en utils.ts
import { fmtMoney } from '../utils';

type Props = { account: Account };

export function CreditCardTopCategories({ account }: Props) {
  const { T, realExpenses, categories, rates, baseCurrency } = useApp();
  const { t } = useTranslation();
  const currency = account.currency ?? baseCurrency;

  const result = useMemo(
    () =>
      calcTopCategoriesForCard(
        account,
        realExpenses,
        categories,
        rates,
        baseCurrency,
        5
      ),
    [account, realExpenses, categories, rates, baseCurrency]
  );

  // ── Estado vacío ──────────────────────────────────────────────────────────
  if (!result.hasData) {
    return (
      <div
        style={{
          padding: '1.5rem 1.25rem',
          background: T.pageBg,
          borderTop: `1px solid ${T.cardBorder}`,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>
          🏷️
        </div>
        <div
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: T.title,
            marginBottom: '0.35rem',
          }}
        >
          {t('creditCards.topCategories.emptyTitle')}
        </div>
        <div
          style={{
            fontSize: '0.78rem',
            color: T.muted,
            lineHeight: 1.5,
            maxWidth: '24rem',
            margin: '0 auto',
          }}
        >
          {t('creditCards.topCategories.emptyBody')}
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        padding: '1.25rem',
        background: T.pageBg,
        borderTop: `1px solid ${T.cardBorder}`,
      }}
    >
      {/* Cabecera */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.5rem',
        }}
      >
        <span style={{ fontSize: '1rem' }}>🏷️</span>
        <h4
          style={{
            fontSize: '0.95rem',
            fontWeight: 800,
            color: T.title,
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          {t('creditCards.topCategories.title')}
        </h4>
      </div>

      <p
        style={{
          fontSize: '0.75rem',
          color: T.muted,
          margin: '0 0 1rem',
          lineHeight: 1.5,
        }}
      >
        {t('creditCards.topCategories.subtitle', {
          n: result.topCategories.length,
          amount: fmtMoney(result.totalSpent, currency),
        })}
      </p>

      {/* Lista de categorías con barras */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
          marginBottom: result.uncategorizedAmount > 0 ? '0.875rem' : 0,
        }}
      >
        {result.topCategories.map((cat, idx) => {
          const isUncat = cat.categoryId === '__uncategorized__';
          const color = isUncat ? T.muted : cat.categoryColor ?? T.accent;

          return (
            <div
              key={cat.categoryId}
              style={{
                padding: '0.75rem 0.875rem',
                borderRadius: '0.75rem',
                background: T.cardBg,
                border: `1px solid ${T.cardBorder}`,
              }}
            >
              {/* Cabecera fila */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  marginBottom: '0.4rem',
                }}
              >
                {/* Ranking + icono */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: T.muted,
                      width: '1rem',
                      textAlign: 'center',
                    }}
                  >
                    #{idx + 1}
                  </span>
                  <div
                    style={{
                      width: '1.75rem',
                      height: '1.75rem',
                      borderRadius: '0.5rem',
                      background: `${color}1a`,
                      border: `1px solid ${color}55`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.95rem',
                      flexShrink: 0,
                    }}
                  >
                    {cat.categoryIcon ?? (isUncat ? '❓' : '🏷️')}
                  </div>
                </div>

                {/* Nombre */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: T.title,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {cat.categoryName}
                  </div>
                  <div
                    style={{
                      fontSize: '0.65rem',
                      color: T.muted,
                      marginTop: '0.1rem',
                    }}
                  >
                    {t('creditCards.topCategories.movementCount', { count: cat.movementCount })}
                  </div>
                </div>

                {/* Importe + % */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {fmtMoney(cat.amount, currency)}
                  </div>
                  <div
                    style={{
                      fontSize: '0.65rem',
                      color: T.muted,
                      fontWeight: 700,
                    }}
                  >
                    {cat.pct.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Barra de proporción */}
              <div
                style={{
                  height: '0.35rem',
                  background: T.pageBg,
                  borderRadius: '9999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${cat.pct}%`,
                    background: color,
                    borderRadius: '9999px',
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Aviso de movimientos sin categorizar */}
      {result.uncategorizedAmount > 0 && (
        <div
          style={{
            padding: '0.625rem 0.875rem',
            borderRadius: '0.625rem',
            background: T.amberBg,
            border: `1px solid ${T.amberBorder}`,
            fontSize: '0.72rem',
            color: T.amber,
            lineHeight: 1.5,
          }}
        >
          {t('creditCards.topCategories.uncategorizedWarning', {
            amount: fmtMoney(result.uncategorizedAmount, currency),
          })}
        </div>
      )}
    </div>
  );
}
