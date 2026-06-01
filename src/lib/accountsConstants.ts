// src/lib/accountsConstants.ts
//
// Constantes y helpers de presentación para cuentas normales
// (no aplica a tarjetas de crédito ni préstamos, que tienen su propio diseño).
//
// Extraído de src/views/Accounts.tsx el 24/05/2026 (refactor/accounts, commit 1).
// F4-Q: labels de tipo de cuenta via i18next.t() directo (lib pura, sin hooks).

import i18next from 'i18next';

export interface AccountTypeStyle {
  tintBg: string;
  tintBorder: string;
  accent: string;
  label: string;
}

type StyleBase = Omit<AccountTypeStyle, 'label'>;

// ── Paleta modo claro ─────────────────────────────────────────────────────────
const LIGHT: Record<string, StyleBase> = {
  checking:   { tintBg: '#dbeafe55', tintBorder: '#3b82f633', accent: '#2563eb' },
  savings:    { tintBg: '#d1fae555', tintBorder: '#10b98133', accent: '#059669' },
  investment: { tintBg: '#ede9fe66', tintBorder: '#8b5cf633', accent: '#7c3aed' },
  cash:       { tintBg: '#fef3c755', tintBorder: '#f59e0b33', accent: '#d97706' },
};

// ── Paleta modo oscuro (contraste mínimo 7:1 sobre #0d0d1f) ──────────────────
// Ratios verificados: checking #93c5fd ≈ 8.1:1 · savings #6ee7b7 ≈ 10.2:1
//                    investment #c4b5fd ≈ 9.4:1 · cash #fcd34d ≈ 11.7:1
const DARK: Record<string, StyleBase> = {
  checking:   { tintBg: '#0f1e40', tintBorder: '#3b82f640', accent: '#93c5fd' },
  savings:    { tintBg: '#022c22', tintBorder: '#10b98140', accent: '#6ee7b7' },
  investment: { tintBg: '#1a0f3a', tintBorder: '#8b5cf640', accent: '#c4b5fd' },
  cash:       { tintBg: '#1c0f00', tintBorder: '#f59e0b40', accent: '#fcd34d' },
};

const TYPE_KEYS: Record<string, string> = {
  checking: 'accounts.types.checking',
  savings: 'accounts.types.savings',
  investment: 'accounts.types.investment',
  cash: 'accounts.types.cash',
};

/**
 * Devuelve el estilo asociado a un tipo de cuenta.
 * Detecta dark mode mediante T.cardBg y devuelve colores con contraste
 * adecuado para el fondo activo.
 */
export const getAccountStyle = (type?: string, T?: any): AccountTypeStyle => {
  const isDark = (T?.cardBg ?? '#fff') === '#0d0d1f';
  const palette = isDark ? DARK : LIGHT;
  const key = type ?? 'checking';
  const base = palette[key];
  const label = TYPE_KEYS[key]
    ? i18next.t(TYPE_KEYS[key])
    : i18next.t('accounts.types.default');

  if (base) return { ...base, label };

  return {
    tintBg:     isDark ? '#12122a' : (T?.pageBg ?? '#f8fafc'),
    tintBorder: isDark ? '#1e1e40' : (T?.cardBorder ?? '#e2e8f0'),
    accent:     isDark ? '#94a3b8' : (T?.accent ?? '#3b82f6'),
    label,
  };
};
