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

/** Paleta por tipo de cuenta. Claves: checking | savings | investment | cash. */
export const ACCOUNT_TYPE_STYLES: Record<string, AccountTypeStyle> = {
  checking:   { tintBg: '#dbeafe55', tintBorder: '#3b82f633', accent: '#2563eb', label: 'Cuenta Corriente' },
  savings:    { tintBg: '#d1fae555', tintBorder: '#10b98133', accent: '#059669', label: 'Cuenta de Ahorro' },
  investment: { tintBg: '#ede9fe66', tintBorder: '#8b5cf633', accent: '#7c3aed', label: 'Cuenta de Inversión' },
  cash:       { tintBg: '#fef3c755', tintBorder: '#f59e0b33', accent: '#d97706', label: 'Efectivo' },
};

/**
 * Devuelve el estilo asociado a un tipo de cuenta. Si el tipo es desconocido
 * o no se proporciona, hace fallback a los tokens del theme `T`.
 */
export const getAccountStyle = (type?: string, T?: any): AccountTypeStyle =>
  ACCOUNT_TYPE_STYLES[type ?? 'checking'] ?? {
    tintBg: T?.pageBg ?? '#f8fafc',
    tintBorder: T?.cardBorder ?? '#e2e8f0',
    accent: T?.accent ?? '#3b82f6',
    label: 'Cuenta',
  };
