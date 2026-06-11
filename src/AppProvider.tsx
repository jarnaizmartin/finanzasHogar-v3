import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type React from 'react';
import { AppContext } from './AppContext';
import type { AppContextType } from './AppContext';
import { useSecurityContext } from './SecurityContext';
import { useLocalStorageSync } from './hooks/useLocalStorageSync';
import { useLocalStorage } from './hooks/useLocalStorage';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { DataProvider, useData } from './contexts/DataContext';
import { UIProvider, useUI } from './contexts/UIContext';
import { useSync } from './hooks/useSync';
import i18next from 'i18next';
import { calcRealBalance } from './lib/balanceCalc';
import { calcForecast } from './lib/forecastEngine';
import { calcCreditCardDebt } from './lib/creditCardUtils';
import { calcLoanDebt } from './lib/loanUtils';
import { applyRecurringProjections } from './lib/recurringMotor';
import { generateAllAlerts } from './lib/alertGenerators';
import { encryptBackupPayload } from './lib/backupCrypto';
import { countLive } from './lib/tombstones';
import { getEncryptedItem, setEncryptedItem } from './lib/encryptedStorage';
import {
  convertAmount,
  fmt,
  monthKey,
  monthLabel,
  addMonths,
} from './utils';
import type {
  BackupEntry,
  AppAlert,
  ForecastMonth,
  Projection,
  RealExpense,
  Account,
} from './types';

// ─── Re-exportaciones para backward compat ───────────────────────────────────
export { LIGHT, DARK } from './theme';
export { calcForecast } from './lib/forecastEngine';

// ─── Helper ───────────────────────────────────────────────────────────────────
const uid = () => crypto.randomUUID();

// ─── AppCoreProvider ──────────────────────────────────────────────────────────
// Componente interno: tiene acceso a SettingsContext, DataContext y UIContext.
// Gestiona el ciclo de vida de la app (onboarded, backup, alertas calculadas).
function AppCoreProvider({ children }: { children: React.ReactNode }) {
  const { clearSecurity } = useSecurityContext();

  // ✅ FIX 15 — sync entre pestañas (aquí, una sola vez)
  useLocalStorageSync();

  // ── Sub-contextos ──────────────────────────────────────────────────────────
  const settings = useSettings();
  const data     = useData();
  const ui       = useUI();

  const { rates, baseCurrency, displayCurrency, dateFormat, setDark, setBaseCurrency, setDisplayCurrency } = settings;
  const {
    accounts, setAccounts,
    categories, setCategories,
    projections, setProjections,
    realExpenses, setRealExpenses,
    goals, setGoals,
    bankFormats, setBankFormats,
    categoryRules, setCategoryRules,
    ignoredAlerts,
    raw,
  } = data;
  const { setRecurringDuplicateWarnings, setShowRecurringWarnings } = ui;

  // ── 🔄 Controlador del sync (C2). Inerte mientras el opt-in esté desactivado. ─
  const sync = useSync();

  // ── Estado de ciclo de vida (persistido) ───────────────────────────────────
  const [onboarded, setOnboarded]             = useLocalStorage<boolean>('fh_onboarded', false);
  const [tourCompleted, setTourCompleted]     = useLocalStorage<boolean>('fh_tour_completed', false);
  const [tourIsFirstTime, setTourIsFirstTime] = useLocalStorage<boolean>('fh_tour_first_time', true);
  const [backupHistory, setBackupHistory]     = useLocalStorage<BackupEntry[]>('fh_backup_history', []);
  const [backupReminderDays, setBackupReminderDays]             = useLocalStorage<number>('fh_backup_reminder_days', 7);
  const [backupReminderDismissed, setBackupReminderDismissed]   = useLocalStorage<number>('fh_backup_reminder_dismissed', 0);
  const [autoBackupDone, setAutoBackupDone]                     = useLocalStorage<boolean>('fh_auto_backup_done', false);
  const [firstSessionDone, setFirstSessionDone]                 = useLocalStorage<boolean>('fh_first_session_done', false);
  const [lastAutoBackupSession, setLastAutoBackupSession]       = useLocalStorage<number>('fh_last_auto_backup_session', 0);
  const [onboardedAt, setOnboardedAt] = useLocalStorage<number>('fh_onboarded_at', 0);
  
  // ── Derivados: forecast ────────────────────────────────────────────────────
  const forecastAll = useMemo(
    () => calcForecast(projections, accounts, 'all', rates, baseCurrency, realExpenses),
    // i18next.language forces recompute on language change so month labels update
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projections, accounts, rates, baseCurrency, realExpenses, i18next.language]
  );

  const forecastByAccount = useMemo((): Record<string, ForecastMonth[]> => {
    const map: Record<string, ForecastMonth[]> = {};
    accounts.forEach((acc) => {
      map[acc.id] = calcForecast(projections, accounts, acc.id, rates, baseCurrency, realExpenses);
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projections, accounts, rates, baseCurrency, realExpenses, i18next.language]);

  // ── Derivados: alertas ─────────────────────────────────────────────────────
  // La lógica vive en src/lib/alertGenerators.ts (8 generadores puros).
  // Aquí solo construimos el contexto, ejecutamos el orquestador y filtramos
  // las alertas que el usuario ya descartó.
  const computedAlerts = useMemo((): AppAlert[] => {
    const allAlerts = generateAllAlerts({
      accounts,
      projections,
      categories,
      realExpenses,
      goals,
      rates,
      baseCurrency,
      dateFormat,
      now: new Date(),
      forecastAll,
      forecastByAccount,
    });
    return allAlerts.filter((a) => !ignoredAlerts.includes(a.id));
  }, [
    accounts, projections, categories, realExpenses, goals,
    rates, baseCurrency, ignoredAlerts,
    forecastAll, forecastByAccount, dateFormat,
  ]);

  // ── Derivados: cuentas ─────────────────────────────────────────────────────
  const accountWarnings = useMemo(() => {
    const w: Record<string, boolean> = {};
    accounts.forEach((acc) => {
      if (!acc.minBalance || acc.minBalance <= 0) { w[acc.id] = false; return; }
      const fc = forecastByAccount[acc.id] || [];
      w[acc.id] = acc.balance < acc.minBalance || fc.some((m) => m.runningBalance < acc.minBalance);
    });
    return w;
  }, [accounts, forecastByAccount]);

  const totalBalance = useMemo(
    () => accounts.reduce((sum, acc) =>
      sum + convertAmount(acc.balance, acc.currency ?? baseCurrency, displayCurrency, rates), 0),
    [accounts, displayCurrency, baseCurrency, rates]
  );

  const realBalanceMap = useMemo(() => {
    const map: Record<string, any> = {};
    accounts.forEach((acc) => {
      if (acc.accountType === 'credit_card') {
        const { debt, available, utilizationPct, appliedCount, ignoredCount } =
          calcCreditCardDebt(acc, realExpenses, rates, baseCurrency);
        map[acc.id] = {
          realBalance: -debt,        // Negativo → resta al patrimonio
          creditDebt: debt,          // Deuda actual (positivo, legible)
          creditAvailable: available,// Disponible = límite - deuda
          utilizationPct,            // % de utilización del límite
          appliedCount,
          ignoredCount,
        };
      } else if (acc.accountType === 'loan') {
        // Préstamos/hipotecas: la deuda resta del patrimonio igual que las tarjetas
        const { debt, initialDebt, appliedCount, ignoredCount } =
          calcLoanDebt(acc, realExpenses, rates, baseCurrency);
        map[acc.id] = {
          realBalance: -debt,        // Negativo → resta al patrimonio neto
          loanDebt: debt,            // Capital pendiente HOY (positivo, legible)
          loanInitialDebt: initialDebt, // Capital pendiente al dar de alta el préstamo
          appliedCount,              // Pagos/cuotas aplicados
          ignoredCount,              // Movimientos anteriores al saldo base
        };
      } else {
        map[acc.id] = calcRealBalance(acc, realExpenses, rates, baseCurrency);
      }
    });
    return map;
  }, [accounts, realExpenses, rates, baseCurrency]);

  const totalRealBalance = useMemo(
    () => accounts.reduce((sum, acc) => {
      const { realBalance } = realBalanceMap[acc.id] ?? { realBalance: acc.balance };
      return sum + convertAmount(realBalance, acc.currency ?? baseCurrency, displayCurrency, rates);
    }, 0),
    [accounts, realBalanceMap, displayCurrency, baseCurrency, rates]
  );

  const stats = useMemo(() => ({
    totalBalance,
    totalRealBalance,
    thisMonth: forecastAll[0] || { income: 0, expense: 0, net: 0 },
    warnAccounts: accounts.filter((a) => accountWarnings[a.id]),
  }), [totalBalance, totalRealBalance, forecastAll, accountWarnings, accounts]);

  // ── resetApp ───────────────────────────────────────────────────────────────
  const resetApp = useCallback(() => {
    // ⚠️ Orden correcto: PRIMERO purgar localStorage (incluidos los datos
    // cifrados), DESPUÉS destruir la VMK. Si haces lo contrario, los datos
    // cifrados quedan zombies (sin clave para descifrarlos jamás).
    //
    // No usamos setAccounts([]) etc. porque dispararían escrituras al cache
    // cifrado que quedarían huérfanas tras destroyVault.
    try {
      // Snapshot de claves de la app (todo lo que empieza por fh_)
      const keysToWipe: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('fh_')) keysToWipe.push(k);
      }
      keysToWipe.forEach((k) => localStorage.removeItem(k));
    } catch (err) {
      console.error('[resetApp] Error purgando localStorage:', err);
    }
    // Destruye VMK + envolturas + estado de seguridad en memoria
    clearSecurity();
    // Recargar para garantizar estado limpio en TODOS los providers
    setTimeout(() => window.location.reload(), 50);
  }, [clearSecurity]);

  // ── Refs para backup (evitan stale closures sin deps en useCallback) ───────
  const accountsRef        = useRef(accounts);
  const categoriesRef      = useRef(categories);
  const projectionsRef     = useRef(projections);
  const realExpensesRef    = useRef(realExpenses);
  const goalsRef           = useRef(goals);
  const bankFormatsRef     = useRef(bankFormats);
  const categoryRulesRef   = useRef(categoryRules);
  const baseCurrencyRef    = useRef(baseCurrency);
  const displayCurrencyRef = useRef(displayCurrency);
  const darkRef            = useRef(settings.dark);

  // Sincronización de refs durante render — deliberado.
  // Estos refs alimentan los useCallback de backup (createBackup,
  // buildFullSnapshot) con deps [] para que SIEMPRE vean los últimos
  // datos sin recrear las funciones. Mover esto a useEffect introduciría
  // un gap de 1 render donde un backup leería datos del render anterior.
  // Validado empíricamente: el flujo de backup es sólido.
  // Si en el futuro activamos React.StrictMode + concurrent features,
  // reevaluar este patrón.
  // 🪦 Tombstones (ADR §5.1): el snapshot de backup/sync usa la lista COMPLETA
  // (`raw.*`, con tombstones), NO la filtrada — si no, el sync no propagaría
  // los borrados. Los contadores de metadata sí cuentan solo entidades vivas.
  /* eslint-disable react-hooks/refs */
  accountsRef.current        = raw.accounts;
  categoriesRef.current      = raw.categories;
  projectionsRef.current     = raw.projections;
  realExpensesRef.current    = raw.realExpenses;
  goalsRef.current           = raw.goals;
  bankFormatsRef.current     = raw.bankFormats;
  categoryRulesRef.current   = raw.categoryRules;
  baseCurrencyRef.current    = baseCurrency;
  displayCurrencyRef.current = displayCurrency;
  darkRef.current            = settings.dark;
  /* eslint-enable react-hooks/refs */

  // ── Funciones de backup ───────────────────────────────────────────────────
  // ⚠️ S.0 — El historial guarda SOLO metadata (sin `data`).
  // Esto evita inflar localStorage hasta el límite de 5-10 MB.
  // El snapshot completo se materializa al descargar (con datos del momento).
  const createBackup = useCallback((label = 'Copia manual') => {
    const entry: BackupEntry = {
      id:                uid(),
      timestamp:         Date.now(),
      label,
      accountsCount:     countLive(accountsRef.current),
      categoriesCount:   countLive(categoriesRef.current),
      projectionsCount:  countLive(projectionsRef.current),
      realExpensesCount: countLive(realExpensesRef.current),
      goalsCount:        countLive(goalsRef.current),
      // ❌ Ya NO guardamos `data` aquí — solo metadata.
    };
    setBackupHistory((prev) => [entry, ...prev].slice(0, 50));
    return entry;
  }, []);

  // ── Helper interno: arma el snapshot completo desde los refs ──────────────
  const buildFullSnapshot = useCallback((label: string, timestamp: number) => {
    // ⚠️ FASE 3 — fh_license_state está en la whitelist cifrada de
    // encryptedStorage. Hay que leerla a través del helper, NUNCA con
    // localStorage.getItem directo (devolvería "enc:v1:..." y JSON.parse
    // fallaría → el backup se guardaría con licenseState: null y el
    // usuario perdería su licencia al restaurar).
    let licenseState = null;
    try {
      licenseState = getEncryptedItem<any>('fh_license_state', null);
    } catch {
      licenseState = null;
    }
    return {
      id:                uid(),
      timestamp,
      label,
      accountsCount:     countLive(accountsRef.current),
      categoriesCount:   countLive(categoriesRef.current),
      projectionsCount:  countLive(projectionsRef.current),
      realExpensesCount: countLive(realExpensesRef.current),
      goalsCount:        countLive(goalsRef.current),
      data: {
        accounts:        accountsRef.current,
        categories:      categoriesRef.current,
        projections:     projectionsRef.current,
        realExpenses:    realExpensesRef.current,
        goals:           goalsRef.current ?? [],
        bankFormats:     bankFormatsRef.current,
        categoryRules:   categoryRulesRef.current,
        baseCurrency:    baseCurrencyRef.current,
        displayCurrency: displayCurrencyRef.current,
        dark:            darkRef.current,
        licenseState,
      },
    };
  }, []);

  // ⚠️ S.1 — downloadBackup ahora es async y EXIGE contraseña.
  // El backup .json se cifra siempre con AES-GCM antes de descargar.
  // Como las entradas del historial NO guardan `data` (S.0), siempre
  // construimos un snapshot fresco con los datos actuales del momento
  // de la descarga. La metadata del entry (label, timestamp) se respeta
  // si se pasa, para mantener trazabilidad de "estoy descargando aquella copia".
  const downloadBackup = useCallback(
    async (entry: BackupEntry | undefined, password: string): Promise<void> => {
      if (!password || password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres.');
      }

      // Snapshot fresco con datos del momento. Si nos pasaron una entry,
      // respetamos su label/timestamp para que el fichero descargado
      // refleje "esta es la copia del día X".
      const label     = entry?.label     ?? 'Descarga manual';
      const timestamp = entry?.timestamp ?? Date.now();
      const snapshot  = buildFullSnapshot(label, timestamp);

      // Cifrar el `data` completo
      const { encryption, ciphertext } = await encryptBackupPayload(
        snapshot.data,
        password
      );

      // Estructura del fichero v2.0 (cifrado)
      const fileObj = {
        app: 'FinanzasHogar' as const,
        version: '2.0' as const,
        format: 'encrypted-aes-gcm' as const,
        // Metadata pública (no cifrada) — para preview en import
        id:                snapshot.id,
        timestamp:         snapshot.timestamp,
        label:             snapshot.label,
        accountsCount:     snapshot.accountsCount,
        categoriesCount:   snapshot.categoriesCount,
        projectionsCount:  snapshot.projectionsCount,
        realExpensesCount: snapshot.realExpensesCount,
        goalsCount:        snapshot.goalsCount,
        encryption,
        ciphertext,
      };

      const json    = JSON.stringify(fileObj, null, 2);
      const blob    = new Blob([json], { type: 'application/json' });
      const url     = URL.createObjectURL(blob);
      const a       = document.createElement('a');
      const date    = new Date(snapshot.timestamp);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      a.href        = url;
      a.download    = `FinanzasHogar_backup_${dateStr}.enc.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [buildFullSnapshot]
  );

  const restoreBackup = useCallback((entry: BackupEntry) => {
    const { data: d } = entry;
    setAccounts(d.accounts ?? []);
    setCategories(d.categories ?? []);
    setProjections(d.projections ?? []);
    setRealExpenses(d.realExpenses ?? []);
    setGoals(d.goals ?? []);
    setBankFormats(d.bankFormats ?? []);
    setCategoryRules(d.categoryRules ?? []);
    setBaseCurrency(d.baseCurrency ?? 'EUR');
    setDisplayCurrency(d.displayCurrency ?? 'EUR');
    setDark(d.dark ?? false);
    // ⚠️ FASE 3 — fh_license_state está cifrada. Si escribimos directamente
    // con localStorage.setItem rompemos la integridad del cifrado para esa
    // clave (la próxima lectura devolvería texto plano sin marcador "enc:v1:").
    if (d.licenseState) setEncryptedItem('fh_license_state', d.licenseState);
    if ((d.accounts ?? []).length > 0) setOnboarded(true);
  }, []);

  const deleteBackup = useCallback((id: string) => {
    setBackupHistory((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // ── Registrar fecha de primer onboarding ──────────────────────────────────
useEffect(() => {
  if (onboarded && onboardedAt === 0) {
    setOnboardedAt(Date.now());
  }
}, [onboarded]);

// ── Motor de recurrentes al arrancar ──────────────────────────────────────
  const recurringMotorRan = useRef(false);

  useEffect(() => {
    if (!onboarded) return;
    if (accounts.length === 0) return;
    if (recurringMotorRan.current) return;
    recurringMotorRan.current = true;

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    setProjections((prev) =>
      prev.map((p) => {
        if (p.hasDuplicateWarning && p.duplicateWarningMonth !== currentMonthKey) {
          const { hasDuplicateWarning, duplicateWarningMonth, ...rest } = p;
          return rest;
        }
        return p;
      })
    );

    setProjections((prev) =>
      prev.map((p) => {
        if (!p.nextOverrideAmount) return p;
        if (p.lastApplied && p.lastApplied <= currentMonthKey) {
          const { nextOverrideAmount, ...rest } = p;
          return rest;
        }
        return p;
      })
    );

    // 🪦 Pasamos la lista COMPLETA de proyecciones (raw): el motor hace un
    // reemplazo total de la colección, así que necesita conservar los
    // tombstones. realExpenses va filtrada (la detección de duplicados solo
    // debe mirar movimientos vivos) y el alta de movimientos es funcional.
    const result = applyRecurringProjections(
      raw.projections, realExpenses, setRealExpenses, setProjections, accounts, baseCurrency
    );
    if (result.applied > 0)
      console.info(`[Recurrentes] ${result.applied} cargo(s) aplicado(s) automáticamente`);
    if (result.duplicates > 0 && result.duplicateDetails) {
      setRecurringDuplicateWarnings(result.duplicateDetails);
      setShowRecurringWarnings(true);
    }
  }, [onboarded]);

// ── Backup automático al arrancar ─────────────────────────────────────────
useEffect(() => {
  if (!onboarded) return;
  if (accounts.length === 0) return;

  // ✅ Solo si hay datos reales más allá de la cuenta
  const hasRealData =
    realExpenses.length > 0 ||
    projections.length > 0 ||
    goals.length > 0 ||
    categoryRules.length > 0;

  if (!hasRealData) return;

  if (!firstSessionDone) {
    setFirstSessionDone(true);
    setAutoBackupDone(false);
    return;
  }

  const lastBackup             = backupHistory[0]?.timestamp ?? 0;
  const daysSinceBackup        = lastBackup > 0
    ? Math.floor((Date.now() - lastBackup) / (1000 * 60 * 60 * 24))
    : null;
  const neverBackedUp          = lastBackup === 0;
  const backupIsOld            = daysSinceBackup !== null && daysSinceBackup >= backupReminderDays;
  const alreadyDoneThisSession = Date.now() - lastAutoBackupSession < 1000 * 60 * 60;

  // ✅ Primera vez: espera 3 días desde el onboarding
  const daysSinceOnboarding = onboardedAt > 0
    ? Math.floor((Date.now() - onboardedAt) / (1000 * 60 * 60 * 24))
    : 999;

  const shouldBackupFirstTime = neverBackedUp && daysSinceOnboarding >= 3;
  const shouldBackupRecurring = !neverBackedUp && backupIsOld;

  if ((shouldBackupFirstTime || shouldBackupRecurring) && !alreadyDoneThisSession) {
    const timer = setTimeout(() => {
      createBackup('Automática al arrancar');
      setLastAutoBackupSession(Date.now());
      setAutoBackupDone(true);
    }, 1500);
    return () => clearTimeout(timer);
  } else {
    setAutoBackupDone(false);
  }
}, [
  onboarded, accounts.length, firstSessionDone, onboardedAt,
  realExpenses.length, projections.length, goals.length, categoryRules.length,
]);

  // ── Valor combinado para AppContext (backward compat con useApp()) ─────────
  const coreValue = useMemo(() => ({
    onboarded, setOnboarded,
    resetApp,
    firstSessionDone, setFirstSessionDone,
    tourCompleted, setTourCompleted,
    tourIsFirstTime, setTourIsFirstTime,
    backupHistory, setBackupHistory,
    createBackup, restoreBackup, deleteBackup, downloadBackup,
    backupReminderDays, setBackupReminderDays,
    backupReminderDismissed, setBackupReminderDismissed,
    autoBackupDone, setAutoBackupDone,
    onboardedAt,
    computedAlerts,
    forecastAll, forecastByAccount,
    accountWarnings, realBalanceMap, stats,
    sync,
  }), [
    onboarded, firstSessionDone, tourCompleted, tourIsFirstTime,
    backupHistory, backupReminderDays, backupReminderDismissed, autoBackupDone,
    onboardedAt,
    computedAlerts, forecastAll, forecastByAccount,
    accountWarnings, realBalanceMap, stats,
    resetApp, createBackup, downloadBackup, restoreBackup, deleteBackup,
    sync,
  ]);

  // Combina los 4 sub-contextos en el AppContext unificado (backward compat)
  const combinedValue = useMemo((): AppContextType => ({
    ...settings,
    ...data,
    ...ui,
    ...coreValue,
  }), [settings, data, ui, coreValue]);

  return <AppContext.Provider value={combinedValue}>{children}</AppContext.Provider>;
}

// ─── AppProvider ──────────────────────────────────────────────────────────────
// Wrapper público — compone los 4 sub-providers en el orden correcto.
// App.tsx no necesita cambios: sigue usando <AppProvider>.
export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <DataProvider>
        <UIProvider>
          <AppCoreProvider>
            {children}
          </AppCoreProvider>
        </UIProvider>
      </DataProvider>
    </SettingsProvider>
  );
}
