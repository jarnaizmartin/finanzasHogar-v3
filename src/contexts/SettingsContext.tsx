import { createContext, useContext, useCallback, useMemo } from 'react';
import type React from 'react';
import type { Theme } from '../theme';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { fmt } from '../utils';
import { LIGHT, DARK } from '../theme';
import type { RatesStatus } from '../types';

// ─── Tipo ─────────────────────────────────────────────────────────────────────
export type SettingsContextType = {
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
  baseCurrency: string;
  setBaseCurrency: React.Dispatch<React.SetStateAction<string>>;
  displayCurrency: string;
  setDisplayCurrency: React.Dispatch<React.SetStateAction<string>>;
  dateFormat: string;
  setDateFormat: React.Dispatch<React.SetStateAction<string>>;
  T: Theme;
  rates: Record<string, number>;
  ratesStatus: RatesStatus;
  ratesAgeText: string;
  ratesOutdated: boolean;
  refreshRates: () => void;
  fmtAccount: (amount: number, accountCurrency: string) => string;
};

// ─── Contexto ─────────────────────────────────────────────────────────────────
export const SettingsContext = createContext<SettingsContextType | null>(null);

// ─── Hook específico (performance: solo re-renderiza cuando cambia configuración) ──
export function useSettings(): SettingsContextType {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings debe usarse dentro de <SettingsProvider>');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark]                       = useLocalStorage<boolean>('fh_dark', true);
  const [baseCurrency, setBaseCurrency]       = useLocalStorage<string>('fh_base_currency', 'EUR');
  const [displayCurrency, setDisplayCurrency] = useLocalStorage<string>('fh_currency', 'EUR');
  const [dateFormat, setDateFormat]           = useLocalStorage<string>('fh_date_format', 'dd/mm/yyyy');

  const {
    rates,
    status: ratesStatus,
    ageText: ratesAgeText,
    isOutdated: ratesOutdated,
    refresh: refreshRates,
  } = useExchangeRates();

  // Sin `as Record<string, string>`: ese cast borraba el tipo del theme para
  // TODA la app (T viaja por el contexto a cada componente) y era la razon de
  // que media UI tuviera que redeclarar su propio `type Theme` a mano.
  const T: Theme = useMemo(() => (dark ? DARK : LIGHT), [dark]);

  const fmtAccount = useCallback(
    (amount: number, accountCurrency: string) =>
      fmt(amount, displayCurrency, accountCurrency, rates),
    [displayCurrency, rates]
  );

  const value = useMemo(
    () => ({
      dark, setDark,
      baseCurrency, setBaseCurrency,
      displayCurrency, setDisplayCurrency,
      dateFormat, setDateFormat,
      T,
      rates, ratesStatus, ratesAgeText, ratesOutdated, refreshRates,
      fmtAccount,
    }),
    [
      dark, baseCurrency, displayCurrency, dateFormat, T,
      rates, ratesStatus, ratesAgeText, ratesOutdated, refreshRates,
      fmtAccount,
    ]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
