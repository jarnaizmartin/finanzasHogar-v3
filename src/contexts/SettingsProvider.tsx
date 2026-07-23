import { useCallback, useMemo } from 'react';
import type React from 'react';
import type { Theme } from '../theme';
import { LIGHT, DARK } from '../theme';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { fmt } from '../utils';
import { SettingsContext } from './SettingsContext';

// ─── Provider ─────────────────────────────────────────────────────────────────
// En su propio fichero (no junto al contexto/hook de SettingsContext.tsx) para
// que Fast Refresh funcione: un fichero no debe exportar componentes Y no-componentes.
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
