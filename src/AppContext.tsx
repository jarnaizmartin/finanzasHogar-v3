import { createContext, useContext } from 'react';
import type React from 'react';
import type { SettingsContextType } from './contexts/SettingsContext';
import type { DataContextType } from './contexts/DataContext';
import type { UIContextType } from './contexts/UIContext';
import type { BackupEntry, AppAlert, ForecastMonth, Account } from './types';
import type { SyncController } from './hooks/useSync';

// ─── Re-exportaciones de hooks específicos (migración gradual) ────────────────
// Los componentes pueden migrar de useApp() a estos hooks más específicos
// para evitar re-renders innecesarios.
export { useSettings } from './contexts/SettingsContext';
export { useData }     from './contexts/DataContext';
export { useUI }       from './contexts/UIContext';

// ─── Entrada del mapa de saldos reales por cuenta ────────────────────────────
// Tres formas según el tipo de cuenta (tarjeta / préstamo / normal), unificadas.
// `realBalance` siempre está; los campos de rama son opcionales (una cuenta
// normal no tiene `creditDebt`, un préstamo no tiene `utilizationPct`, etc.).
// Antes esto era `{ realBalance: number; [key: string]: unknown }`, y ese
// `unknown` provocaba decenas de errores de tipo aguas abajo (s.72).
export interface RealBalanceEntry {
  realBalance: number;
  appliedCount?: number;
  ignoredCount?: number;
  // Solo tarjetas de crédito:
  creditDebt?: number;
  creditAvailable?: number;
  utilizationPct?: number;
  // Solo préstamos / hipotecas:
  loanDebt?: number;
  loanInitialDebt?: number;
}

// ─── Tipo del AppCore (lo que añade AppCoreProvider) ─────────────────────────
type AppCoreContextType = {
  onboarded: boolean;
  setOnboarded: React.Dispatch<React.SetStateAction<boolean>>;
  resetApp: () => void;
  firstSessionDone: boolean;
  setFirstSessionDone: React.Dispatch<React.SetStateAction<boolean>>;
  tourCompleted: boolean;
  setTourCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  tourIsFirstTime: boolean;
  setTourIsFirstTime: React.Dispatch<React.SetStateAction<boolean>>;
  backupHistory: BackupEntry[];
  setBackupHistory: React.Dispatch<React.SetStateAction<BackupEntry[]>>;
  createBackup: (label?: string) => BackupEntry;
  restoreBackup: (entry: BackupEntry) => void;
  deleteBackup: (id: string) => void;
  // ⚠️ S.1 — downloadBackup ahora es async y exige password (cifrado AES-GCM obligatorio)
  downloadBackup: (entry: BackupEntry | undefined, password: string) => Promise<void>;
  backupReminderDays: number;
  setBackupReminderDays: React.Dispatch<React.SetStateAction<number>>;
  backupReminderDismissed: number;
  setBackupReminderDismissed: React.Dispatch<React.SetStateAction<number>>;
  autoBackupDone: boolean;
  setAutoBackupDone: React.Dispatch<React.SetStateAction<boolean>>;
  /** Timestamp del fin del onboarding (0 si no fijado). Para la gracia de avisos. */
  onboardedAt: number;
  computedAlerts: AppAlert[];
  forecastAll: ForecastMonth[];
  forecastByAccount: Record<string, ForecastMonth[]>;
  accountWarnings: Record<string, boolean>;
  realBalanceMap: Record<string, RealBalanceEntry>;
  stats: {
    totalBalance: number;
    totalRealBalance: number;
    thisMonth: { income: number; expense: number; net: number };
    warnAccounts: Account[];
  };
  // 🔄 Controlador del sync multi-dispositivo (C2). Inerte si el opt-in está off.
  sync: SyncController;
};

// ─── Tipo combinado (backward compat) ────────────────────────────────────────
// Intersección de los 4 sub-contextos.
export type AppContextType =
  SettingsContextType &
  DataContextType &
  UIContextType &
  AppCoreContextType;

// ─── Contexto ─────────────────────────────────────────────────────────────────
export const AppContext = createContext<AppContextType | null>(null);

// ─── useApp() — backward compat, sigue funcionando en todos los componentes ──
export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}
