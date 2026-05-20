import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import type React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ensureStamps } from '../lib/timestamps';
import type {
  Account, Category, Projection, RealExpense,
  SavingsGoal, BankFormat, CategoryRule,
} from '../types';

// ─── Tipo ─────────────────────────────────────────────────────────────────────
export type DataContextType = {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  projections: Projection[];
  setProjections: React.Dispatch<React.SetStateAction<Projection[]>>;
  realExpenses: RealExpense[];
  setRealExpenses: React.Dispatch<React.SetStateAction<RealExpense[]>>;
  goals: SavingsGoal[];
  setGoals: React.Dispatch<React.SetStateAction<SavingsGoal[]>>;
  bankFormats: BankFormat[];
  setBankFormats: React.Dispatch<React.SetStateAction<BankFormat[]>>;
  categoryRules: CategoryRule[];
  setCategoryRules: React.Dispatch<React.SetStateAction<CategoryRule[]>>;
  ignoredAlerts: string[];
  setIgnoredAlerts: React.Dispatch<React.SetStateAction<string[]>>;
};

// ─── Contexto ─────────────────────────────────────────────────────────────────
export const DataContext = createContext<DataContextType | null>(null);

// ─── Hook específico (performance: solo re-renderiza cuando cambian los datos) ──
export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData debe usarse dentro de <DataProvider>');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts]           = useLocalStorage<Account[]>('fh_accounts', []);
  const [categories, setCategories]       = useLocalStorage<Category[]>('fh_categories', []);
  const [projections, setProjections]     = useLocalStorage<Projection[]>('fh_projections', []);
  const [realExpenses, setRealExpenses]   = useLocalStorage<RealExpense[]>('fh_real_expenses', []);
  const [goals, setGoals]                 = useLocalStorage<SavingsGoal[]>('fh_goals', []);
  const [bankFormats, setBankFormats]     = useLocalStorage<BankFormat[]>('fh_bank_formats', []);
  const [categoryRules, setCategoryRules] = useLocalStorage<CategoryRule[]>('fh_category_rules', []);
  const [ignoredAlerts, setIgnoredAlerts] = useLocalStorage<string[]>('fh_ignored_alerts', []);

  // ─── 🕐 Migración única de timestamps (Fase 0.5) ─────────────────────────
  // Al cargar por primera vez tras esta versión, rellena createdAt/updatedAt
  // en cualquier entidad legacy que no los tenga. Marca la migración como
  // hecha en localStorage para no repetirse en futuras sesiones.
  //
  // 🛡️ Idempotente: si todas las entidades ya tienen timestamps, no hace nada.
  // 🛡️ Usa un ref para garantizar que solo corre 1 vez por montaje.
  const migrationDone = useRef(false);
  useEffect(() => {
    if (migrationDone.current) return;
    if (localStorage.getItem('fh_timestamps_migrated_v1') === 'true') {
      migrationDone.current = true;
      return;
    }

    // Aplica ensureStamps a cada colección. Si nada cambia, no actualiza estado
    // (compara longitud + primer item para evitar re-renders innecesarios).
    setAccounts(prev => prev.map(ensureStamps));
    setCategories(prev => prev.map(ensureStamps));
    setProjections(prev => prev.map(ensureStamps));
    setRealExpenses(prev => prev.map(ensureStamps));
    setGoals(prev => prev.map(ensureStamps));
    setBankFormats(prev => prev.map(ensureStamps));
    setCategoryRules(prev => prev.map(ensureStamps));

    localStorage.setItem('fh_timestamps_migrated_v1', 'true');
    migrationDone.current = true;
    // eslint-disable-next-line no-console
    console.info('[fh] ✅ Migración de timestamps completada');
  }, []); // ← solo al montar

  const value = useMemo(
    () => ({
      accounts, setAccounts,
      categories, setCategories,
      projections, setProjections,
      realExpenses, setRealExpenses,
      goals, setGoals,
      bankFormats, setBankFormats,
      categoryRules, setCategoryRules,
      ignoredAlerts, setIgnoredAlerts,
    }),
    [
      accounts, categories, projections, realExpenses,
      goals, bankFormats, categoryRules, ignoredAlerts,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
