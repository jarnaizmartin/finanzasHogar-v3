import { createContext, useContext } from 'react';
import type React from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type RecurringWarning = {
  projectionName: string;
  amount: number;
  currency: string;
  monthKey: string;
};

export type UIContextType = {
  tab: string;
  setTab: React.Dispatch<React.SetStateAction<string>>;
  showCurrency: boolean;
  setShowCurrency: React.Dispatch<React.SetStateAction<boolean>>;
  realAccountFilter: string;
  setRealAccountFilter: React.Dispatch<React.SetStateAction<string>>;
  realReturnTo: { label: string; tab: string; loanId?: string; creditCardId?: string } | null;
  setRealReturnTo: React.Dispatch<React.SetStateAction<{ label: string; tab: string; loanId?: string; creditCardId?: string } | null>>;
  realFilterType: string;
  setRealFilterType: React.Dispatch<React.SetStateAction<string>>;
  realFilterAccount: string;
  setRealFilterAccount: React.Dispatch<React.SetStateAction<string>>;
  realFilterCategory: string;
  setRealFilterCategory: React.Dispatch<React.SetStateAction<string>>;
  realFilterDateMode: 'preset' | 'range';
  setRealFilterDateMode: React.Dispatch<
    React.SetStateAction<'preset' | 'range'>
  >;
  realFilterPreset: string;
  setRealFilterPreset: React.Dispatch<React.SetStateAction<string>>;
  realFilterDateFrom: string;
  setRealFilterDateFrom: React.Dispatch<React.SetStateAction<string>>;
  realFilterDateTo: string;
  setRealFilterDateTo: React.Dispatch<React.SetStateAction<string>>;
  projFilterType: 'all' | 'income' | 'expense';
  setProjFilterType: React.Dispatch<
    React.SetStateAction<'all' | 'income' | 'expense'>
  >;
  projFilterAccount: string;
  setProjFilterAccount: React.Dispatch<React.SetStateAction<string>>;
  projSortBy: 'date' | 'amount' | 'name';
  setProjSortBy: React.Dispatch<
    React.SetStateAction<'date' | 'amount' | 'name'>
  >;
  recurringDuplicateWarnings: RecurringWarning[];
  setRecurringDuplicateWarnings: React.Dispatch<
    React.SetStateAction<RecurringWarning[]>
  >;
  showRecurringWarnings: boolean;
  setShowRecurringWarnings: React.Dispatch<React.SetStateAction<boolean>>;

  // ── Modal global de pago de tarjeta de crédito ──────────────────────────
  // Cualquier componente puede solicitar abrirlo con openPaymentModal(accountId).
  // Se renderiza una única vez en <App /> vía <GlobalModals />.
  paymentModalAccountId: string | null;
  openPaymentModal: (accountId: string) => void;
  closePaymentModal: () => void;

  // ── Petición global de apertura del simulador de amortización ───────────
  // Se "consume" cuando Accounts.tsx la procesa (one-shot, evita bucles).
  simulatorRequestAccountId: string | null;
  requestOpenSimulator: (accountId: string) => void;
  consumeSimulatorRequest: () => void;

  // ── ✨ F2.10 — Modal pre-rellenado de "Nuevo movimiento real" ───────────
  // Lo dispara una alerta de vencimiento de proyección. RealExpenses.tsx
  // detecta el prefill y abre su modal con los datos ya cargados.
  // Se "consume" tras procesarlo (one-shot, igual que el simulador).
  realExpensePrefill: {
    projectionId: string;
    accountId: string;
    categoryId: string;
    amount: number;
    // Solo income/expense: el modal de movimientos reales no admite 'transfer'
    // (los dos emisores ya degradan la proyección de traspaso a 'expense').
    type: 'income' | 'expense';
    description: string;
    valueDate: string; // YYYY-MM-DD (fecha del vencimiento)
  } | null;
  requestOpenRealExpenseModal: (prefill: NonNullable<UIContextType['realExpensePrefill']>) => void;
  consumeRealExpensePrefill: () => void;
};

// ─── Contexto ─────────────────────────────────────────────────────────────────
export const UIContext = createContext<UIContextType | null>(null);

// ─── Hook específico (performance: solo re-renderiza cuando cambia UI) ────────
export function useUI(): UIContextType {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI debe usarse dentro de <UIProvider>');
  return ctx;
}

// El componente UIProvider vive en ./UIProvider (Fast Refresh).
