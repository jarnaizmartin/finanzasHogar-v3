import { useMemo, useState } from 'react';
import type React from 'react';
import { UIContext, type RecurringWarning, type UIContextType } from './UIContext';

// ─── Provider ─────────────────────────────────────────────────────────────────
// En su propio fichero (no junto al contexto/hook de UIContext.tsx) para que Fast
// Refresh funcione: un fichero no debe exportar componentes Y no-componentes.
export function UIProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState(() => localStorage.getItem('fh_start_tab') ?? 'dashboard');
  const [showCurrency, setShowCurrency] = useState(false);
  const [realAccountFilter, setRealAccountFilter] = useState('all');
  // Origen de navegación a la pestaña Movimientos. Cuando se setea, RealExpenses
  // muestra un botón "← Volver a {label}" que devuelve al usuario a su origen.
  // null = se accedió directamente desde el menú principal.
  const [realReturnTo, setRealReturnTo] = useState<{
    label: string; tab: string; loanId?: string; creditCardId?: string;
  } | null>(null);
  const [realFilterType, setRealFilterType] = useState('all');
  const [realFilterAccount, setRealFilterAccount] = useState('all');
  const [realFilterCategory, setRealFilterCategory] = useState('all');
  const [realFilterDateMode, setRealFilterDateMode] = useState<
    'preset' | 'range'
  >('preset');
  const [realFilterPreset, setRealFilterPreset] = useState('all');
  const [realFilterDateFrom, setRealFilterDateFrom] = useState('');
  const [realFilterDateTo, setRealFilterDateTo] = useState('');
  const [projFilterType, setProjFilterType] = useState<
    'all' | 'income' | 'expense'
  >('all');
  const [projFilterAccount, setProjFilterAccount] = useState('all');
  const [projSortBy, setProjSortBy] = useState<'date' | 'amount' | 'name'>(
    'date'
  );
  const [recurringDuplicateWarnings, setRecurringDuplicateWarnings] = useState<
    RecurringWarning[]
  >([]);
  const [showRecurringWarnings, setShowRecurringWarnings] = useState(false);

  // Estado global del modal de pago (un único modal en toda la app)
  const [paymentModalAccountId, setPaymentModalAccountId] = useState<string | null>(null);
  const openPaymentModal = (accountId: string) => setPaymentModalAccountId(accountId);
  const closePaymentModal = () => setPaymentModalAccountId(null);

  // Petición one-shot para que Accounts.tsx abra el simulador y haga scroll
  const [simulatorRequestAccountId, setSimulatorRequestAccountId] = useState<string | null>(null);
  const requestOpenSimulator = (accountId: string) => {
    // Cambiamos a la pestaña Accounts de inmediato y dejamos la petición pendiente
    setTab('accounts');
    setSimulatorRequestAccountId(accountId);
  };
  const consumeSimulatorRequest = () => setSimulatorRequestAccountId(null);

  // ✨ F2.10 — Petición one-shot para abrir modal de movimiento real prerellenado
  const [realExpensePrefill, setRealExpensePrefill] = useState<UIContextType['realExpensePrefill']>(null);
  const requestOpenRealExpenseModal = (
    prefill: NonNullable<UIContextType['realExpensePrefill']>
  ) => {
    // Saltamos a la pestaña Movimientos; allí RealExpenses lo detecta y abre el modal
    setTab('real');
    setRealExpensePrefill(prefill);
  };
  const consumeRealExpensePrefill = () => setRealExpensePrefill(null);

  const value = useMemo(
    () => ({
      tab,
      setTab,
      showCurrency,
      setShowCurrency,
      realAccountFilter,
      setRealAccountFilter,
      realReturnTo,
      setRealReturnTo,
      realFilterType,
      setRealFilterType,
      realFilterAccount,
      setRealFilterAccount,
      realFilterCategory,
      setRealFilterCategory,
      realFilterDateMode,
      setRealFilterDateMode,
      realFilterPreset,
      setRealFilterPreset,
      realFilterDateFrom,
      setRealFilterDateFrom,
      realFilterDateTo,
      setRealFilterDateTo,
      projFilterType,
      setProjFilterType,
      projFilterAccount,
      setProjFilterAccount,
      projSortBy,
      setProjSortBy,
      recurringDuplicateWarnings,
      setRecurringDuplicateWarnings,
      showRecurringWarnings,
      setShowRecurringWarnings,
      paymentModalAccountId,
      openPaymentModal,
      closePaymentModal,
      simulatorRequestAccountId,
      requestOpenSimulator,
      consumeSimulatorRequest,
      realExpensePrefill,                // ✨ F2.10
      requestOpenRealExpenseModal,       // ✨ F2.10
      consumeRealExpensePrefill,         // ✨ F2.10
    }),
    [
      tab,
      showCurrency,
      realAccountFilter,
      realReturnTo,
      realFilterType,
      realFilterAccount,
      realFilterCategory,
      realFilterDateMode,
      realFilterPreset,
      realFilterDateFrom,
      realFilterDateTo,
      projFilterType,
      projFilterAccount,
      projSortBy,
      recurringDuplicateWarnings,
      showRecurringWarnings,
      paymentModalAccountId,
      simulatorRequestAccountId,
      realExpensePrefill, // ✨ F2.10
    ]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
