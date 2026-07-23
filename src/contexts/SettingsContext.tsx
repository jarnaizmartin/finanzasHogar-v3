import { createContext, useContext } from 'react';
import type React from 'react';
import type { Theme } from '../theme';
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

// El componente SettingsProvider vive en ./SettingsProvider (Fast Refresh).
