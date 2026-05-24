// src/lib/bankImportStyles.ts
//
// Estilos compartidos del flujo de importación bancaria.
// Reciben el theme `T` y devuelven CSSProperties listos para aplicar.
//
// Extraído de BankImportModal.tsx (refactor Fase 1 — commit 1/8).

import type { CSSProperties } from 'react';

// Theme parcial — solo los tokens que usan estos estilos.
// Se tipa como Record<string, string> para no acoplar a la forma exacta de T.
type ThemeTokens = {
  inputBorder: string;
  inputBg: string;
  inputText: string;
  accent: string;
  cardBorder: string;
  btnSecBg: string;
  btnSecText: string;
};

export const bankInputStyle = (T: ThemeTokens): CSSProperties => ({
  width: '100%',
  padding: '0.65rem 0.875rem',
  borderRadius: '0.75rem',
  border: `1.5px solid ${T.inputBorder}`,
  background: T.inputBg,
  color: T.inputText,
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
  marginBottom: '0.75rem',
});

export const bankSelectStyle = (T: ThemeTokens): CSSProperties => ({
  ...bankInputStyle(T),
  cursor: 'pointer',
});

export const bankBtnPrimary = (T: ThemeTokens): CSSProperties => ({
  padding: '0.65rem 1.25rem',
  borderRadius: '0.75rem',
  border: 'none',
  background: T.accent,
  color: '#fff',
  fontSize: '0.875rem',
  fontWeight: 700,
  cursor: 'pointer',
});

export const bankBtnSecondary = (T: ThemeTokens): CSSProperties => ({
  padding: '0.65rem 1.25rem',
  borderRadius: '0.75rem',
  border: `1.5px solid ${T.cardBorder}`,
  background: T.btnSecBg,
  color: T.btnSecText,
  fontSize: '0.875rem',
  fontWeight: 700,
  cursor: 'pointer',
});
