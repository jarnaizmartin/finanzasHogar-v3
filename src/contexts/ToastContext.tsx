import { useContext, createContext } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export type AddToast = (message: string, type?: ToastType) => void;

// ─── Contexto ─────────────────────────────────────────────────────────────────
// El const se EXPORTA para que ToastProvider (en su propio fichero, por Fast
// Refresh) pueda proveerlo. Los componentes viven en ToastProvider.tsx.
export const ToastContext = createContext<AddToast | null>(null);

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useToast(): AddToast {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}
