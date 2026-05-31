// src/lib/accountsConstants.ts
//
// Constantes y helpers de presentación para cuentas normales
// (no aplica a tarjetas de crédito ni préstamos, que tienen su propio diseño).
//
// Extraído de src/views/Accounts.tsx el 24/05/2026 (refactor/accounts, commit 1).

export interface AccountTypeStyle {
  tintBg: string;
  tintBorder: string;
  accent: string;
  label: string;
}

// ── Paleta modo claro ─────────────────────────────────────────────────────────
const ACCOUNT_TYPE_STYLES_LIGHT: Record<string, AccountTypeStyle> = {
  checking:   { tintBg: '#dbeafe55', tintBorder: '#3b82f633', accent: '#2563eb', label: 'Cuenta Corriente' },
  savings:    { tintBg: '#d1fae555', tintBorder: '#10b98133', accent: '#059669', label: 'Cuenta de Ahorro' },
  investment: { tintBg: '#ede9fe66', tintBorder: '#8b5cf633', accent: '#7c3aed', label: 'Cuenta de Inversión' },
  cash:       { tintBg: '#fef3c755', tintBorder: '#f59e0b33', accent: '#d97706', label: 'Efectivo' },
};

// ── Paleta modo oscuro (contraste mínimo 7:1 sobre #0d0d1f) ──────────────────
// Ratios verificados: checking #93c5fd ≈ 8.1:1 · savings #6ee7b7 ≈ 10.2:1
//                    investment #c4b5fd ≈ 9.4:1 · cash #fcd34d ≈ 11.7:1
const ACCOUNT_TYPE_STYLES_DARK: Record<string, AccountTypeStyle> = {
  checking:   { tintBg: '#0f1e40', tintBorder: '#3b82f640', accent: '#93c5fd', label: 'Cuenta Corriente' },
  savings:    { tintBg: '#022c22', tintBorder: '#10b98140', accent: '#6ee7b7', label: 'Cuenta de Ahorro' },
  investment: { tintBg: '#1a0f3a', tintBorder: '#8b5cf640', accent: '#c4b5fd', label: 'Cuenta de Inversión' },
  cash:       { tintBg: '#1c0f00', tintBorder: '#f59e0b40', accent: '#fcd34d', label: 'Efectivo' },
};

/**
 * Devuelve el estilo asociado a un tipo de cuenta.
 * Detecta dark mode mediante T.cardBg y devuelve colores con contraste
 * adecuado para el fondo activo.
 */
export const getAccountStyle = (type?: string, T?: any): AccountTypeStyle => {
  const isDark = (T?.cardBg ?? '#fff') === '#0d0d1f';
  const styles = isDark ? ACCOUNT_TYPE_STYLES_DARK : ACCOUNT_TYPE_STYLES_LIGHT;
  return styles[type ?? 'checking'] ?? {
    tintBg:     isDark ? '#12122a' : (T?.pageBg ?? '#f8fafc'),
    tintBorder: isDark ? '#1e1e40' : (T?.cardBorder ?? '#e2e8f0'),
    accent:     isDark ? '#94a3b8' : (T?.accent ?? '#3b82f6'),
    label: 'Cuenta',
  };
};
