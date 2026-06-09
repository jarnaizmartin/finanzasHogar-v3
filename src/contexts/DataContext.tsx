import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import type React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ensureStamps, stampNew, stampUpdate, stampDelete } from '../lib/timestamps';
import type {
  Account, Category, Projection, RealExpense,
  SavingsGoal, BankFormat, CategoryRule,
} from '../types';

// ─── Tipo ─────────────────────────────────────────────────────────────────────
// 🪦 TOMBSTONES INLINE (ADR §5.1): los borrados son `deletedAt` en el propio
// registro, no se eliminan del array. La frontera del contexto expone a la UI
// las listas YA FILTRADAS (solo entidades vivas); la lista COMPLETA (con
// tombstones) vive en `raw` y es la única que debe usar la persistencia/sync.
export type DataContextType = {
  // Listas VIVAS (sin tombstones) — lo que consume toda la UI y los derivados.
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
  // 🪦 API de borrado explícita (tombstones, ADR §5.1): marca `deletedAt` en
  // lugar de eliminar, para que el sync propague el borrado. Ningún sitio debe
  // hacer `setX(prev => prev.filter(...))` para borrar entidades.
  deleteAccount: (id: string) => void;       // borra la cuenta + cascada (movimientos, proyecciones, objetivos auto)
  deleteCategory: (id: string) => void;
  deleteProjection: (id: string) => void;
  deleteGoal: (id: string) => void;
  deleteRealExpense: (id: string) => void;
  deleteBankFormat: (id: string) => void;
  deleteCategoryRule: (id: string) => void;
  deleteTransfer: (transferId: string) => void;            // tombstonea el par de movimientos de un traspaso
  deleteRealExpensesWhere: (match: (e: RealExpense) => boolean) => void; // escotilla para borrados por predicado (p. ej. deshacer amortización)
  // 🪦 Listas COMPLETAS con tombstones — SOLO para persistencia/sync/snapshot.
  // ⚠️ NUNCA renderizar estas en la UI (verían entidades borradas).
  raw: {
    accounts: Account[];
    categories: Category[];
    projections: Projection[];
    realExpenses: RealExpense[];
    goals: SavingsGoal[];
    bankFormats: BankFormat[];
    categoryRules: CategoryRule[];
  };
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

  // ─── 🕐 Setters envueltos: auto-sellan timestamps (Fase 0.5) ─────────────
  // Cualquier entidad que pase por estos setters recibe automáticamente
  // createdAt/updatedAt sin que el componente tenga que preocuparse.
  //
  // Reglas:
  //   • Entidad NUEVA (sin createdAt)   → stampNew  (createdAt + updatedAt)
  //   • Entidad EXISTENTE (con createdAt) → stampUpdate (solo updatedAt)
  //
  // 🛡️ Soporta ambas formas de setState: array directo o función updater.
  function wrapSetter<T extends { id: string; createdAt?: number; updatedAt?: number }>(
    rawSetter: React.Dispatch<React.SetStateAction<T[]>>
  ): React.Dispatch<React.SetStateAction<T[]>> {
    const stampItem = (item: T): T => {
      // Si no tiene createdAt → es nuevo
      if (item.createdAt == null) return stampNew(item) as T;
      // Si tiene createdAt → es una mutación, actualiza updatedAt
      return stampUpdate(item) as T;
    };

    return (value) => {
      if (typeof value === 'function') {
        rawSetter((prev) => {
          const next = (value as (p: T[]) => T[])(prev);
          // Solo sellamos los items que cambiaron de referencia respecto a prev
          // (evita sellar TODA la lista cuando solo se añade/edita uno)
          const prevById = new Map(prev.map((x) => [x.id, x]));
          return next.map((item) =>
            prevById.get(item.id) === item ? item : stampItem(item)
          );
        });
      } else {
        rawSetter(value.map(stampItem));
      }
    };
  }

  const setAccountsStamped      = useMemo(() => wrapSetter(setAccounts),      []);
  const setCategoriesStamped    = useMemo(() => wrapSetter(setCategories),    []);
  const setProjectionsStamped   = useMemo(() => wrapSetter(setProjections),   []);
  const setRealExpensesStamped  = useMemo(() => wrapSetter(setRealExpenses),  []);
  const setGoalsStamped         = useMemo(() => wrapSetter(setGoals),         []);
  const setBankFormatsStamped   = useMemo(() => wrapSetter(setBankFormats),   []);
  const setCategoryRulesStamped = useMemo(() => wrapSetter(setCategoryRules), []);

  // ─── 🪦 API de borrado explícita (tombstones, ADR §5.1) ──────────────────
  // Marca `deletedAt` en vez de eliminar. Usa el setter CRUDO (no el envuelto)
  // para sellar el tombstone una sola vez con precisión. El guard `!deletedAt`
  // hace la operación idempotente (no re-bumpea un tombstone existente).
  const deleteApi = useMemo(() => {
    function tombstone<T extends { id: string } & Record<string, any>>(
      rawSetter: React.Dispatch<React.SetStateAction<T[]>>,
      match: (item: T) => boolean
    ) {
      rawSetter(prev =>
        prev.map(item => (match(item) && !item.deletedAt ? (stampDelete(item) as T) : item))
      );
    }

    return {
      // Cuenta + cascada (réplica fiel del borrado que vivía en Accounts.tsx).
      deleteAccount: (id: string) => {
        const target = accounts.find(a => a.id === id);
        tombstone(setAccounts, a => a.id === id);
        // Movimientos de la cuenta
        tombstone(setRealExpenses, e => e.accountId === id);
        // Proyecciones: origen = cuenta · proyección vinculada del préstamo ·
        // traspasos cuyo destino era la cuenta
        tombstone(setProjections, p =>
          p.accountId === id ||
          (target?.accountType === 'loan' && p.id === target.linkedProjectionId) ||
          (p.type === 'transfer' && p.toAccountId === id)
        );
        // Objetivos automáticos ligados a la cuenta
        tombstone(setGoals, g => g.mode === 'auto' && g.accountId === id);
      },
      deleteCategory:     (id: string) => tombstone(setCategories,    c => c.id === id),
      deleteProjection:   (id: string) => tombstone(setProjections,   p => p.id === id),
      deleteGoal:         (id: string) => tombstone(setGoals,         g => g.id === id),
      deleteRealExpense:  (id: string) => tombstone(setRealExpenses,  e => e.id === id),
      deleteBankFormat:   (id: string) => tombstone(setBankFormats,   f => f.id === id),
      deleteCategoryRule: (id: string) => tombstone(setCategoryRules, r => r.id === id),
      deleteTransfer:     (transferId: string) =>
        tombstone(setRealExpenses, e => e.transferId === transferId),
      deleteRealExpensesWhere: (match: (e: RealExpense) => boolean) =>
        tombstone(setRealExpenses, match),
    };
    // Solo deleteAccount necesita `accounts` (para el tipo de cuenta); los
    // setters crudos son estables. Recrear la API al cambiar accounts no añade
    // churn: `value` ya depende de accounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts]);

  // ─── 🪦 Frontera de tombstones (ADR §5.1) ────────────────────────────────
  // La UI consume SOLO entidades vivas. La lista completa (con tombstones) se
  // conserva en el estado subyacente (y por tanto en localStorage) para que el
  // sync pueda propagar los borrados.
  const liveAccounts      = useMemo(() => accounts.filter(a => !a.deletedAt),      [accounts]);
  const liveCategories    = useMemo(() => categories.filter(c => !c.deletedAt),    [categories]);
  const liveProjections   = useMemo(() => projections.filter(p => !p.deletedAt),   [projections]);
  const liveRealExpenses  = useMemo(() => realExpenses.filter(e => !e.deletedAt),  [realExpenses]);
  const liveGoals         = useMemo(() => goals.filter(g => !g.deletedAt),         [goals]);
  const liveBankFormats   = useMemo(() => bankFormats.filter(f => !f.deletedAt),   [bankFormats]);
  const liveCategoryRules = useMemo(() => categoryRules.filter(r => !r.deletedAt), [categoryRules]);

  const value = useMemo(
    () => ({
      accounts:      liveAccounts,      setAccounts:      setAccountsStamped,
      categories:    liveCategories,    setCategories:    setCategoriesStamped,
      projections:   liveProjections,   setProjections:   setProjectionsStamped,
      realExpenses:  liveRealExpenses,  setRealExpenses:  setRealExpensesStamped,
      goals:         liveGoals,         setGoals:         setGoalsStamped,
      bankFormats:   liveBankFormats,   setBankFormats:   setBankFormatsStamped,
      categoryRules: liveCategoryRules, setCategoryRules: setCategoryRulesStamped,
      ignoredAlerts, setIgnoredAlerts,
      ...deleteApi,
      // 🪦 Lista completa con tombstones — solo persistencia/sync.
      raw: {
        accounts, categories, projections, realExpenses,
        goals, bankFormats, categoryRules,
      },
    }),
    [
      liveAccounts, liveCategories, liveProjections, liveRealExpenses,
      liveGoals, liveBankFormats, liveCategoryRules, ignoredAlerts,
      accounts, categories, projections, realExpenses,
      goals, bankFormats, categoryRules, deleteApi,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
