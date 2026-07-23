import { useCallback, useEffect, useMemo, useRef } from 'react';
import type React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ensureStamps, stampNew, stampUpdate } from '../lib/timestamps';
import { live, tombstone } from '../lib/tombstones';
import type {
  Account, Category, Projection, RealExpense,
  SavingsGoal, BankFormat, CategoryRule,
  Timestamped, Unstamped, StampingSetter,
} from '../types';
import { DataContext } from './DataContext';

// ─── Provider ─────────────────────────────────────────────────────────────────
// Vive en su propio fichero (no junto al contexto/hook de DataContext.tsx) para
// que Fast Refresh funcione: un fichero no debe exportar componentes Y no-componentes.
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
  function wrapSetter<T extends Timestamped & { id: string }>(
    rawSetter: React.Dispatch<React.SetStateAction<T[]>>
  ): StampingSetter<T> {
    const stampItem = (item: T | Unstamped<T>): T => {
      // Si no tiene createdAt → es nuevo
      if (item.createdAt == null) return stampNew(item) as T;
      // Si tiene createdAt → es una mutación, actualiza updatedAt
      return stampUpdate(item) as T;
    };

    return (value) => {
      if (typeof value === 'function') {
        rawSetter((prev) => {
          const next = value(prev);
          // Solo sellamos los items que cambiaron de referencia respecto a prev
          // (evita sellar TODA la lista cuando solo se añade/edita uno)
          const prevById = new Map(prev.map((x) => [x.id, x]));
          return next.map((item) =>
            // Si la referencia es la misma que había en el estado, ya venía
            // sellada (salió de `prev`): se devuelve tal cual.
            prevById.get(item.id) === item ? (item as T) : stampItem(item)
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
    // Tombstonea (in place vía el setter crudo) los items que cumplan `match`.
    // La lógica de sellado vive en lib/tombstones (pura y testeada).
    function del<T extends { deletedAt?: number }>(
      rawSetter: React.Dispatch<React.SetStateAction<T[]>>,
      match: (item: T) => boolean
    ) {
      rawSetter(prev => tombstone(prev, match));
    }

    return {
      // Cuenta + cascada (réplica fiel del borrado que vivía en Accounts.tsx).
      deleteAccount: (id: string) => {
        const target = accounts.find(a => a.id === id);
        del(setAccounts, a => a.id === id);
        // Movimientos de la cuenta
        del(setRealExpenses, e => e.accountId === id);
        // Proyecciones: origen = cuenta · proyección vinculada del préstamo ·
        // traspasos cuyo destino era la cuenta
        del(setProjections, p =>
          p.accountId === id ||
          (target?.accountType === 'loan' && p.id === target.linkedProjectionId) ||
          (p.type === 'transfer' && p.toAccountId === id)
        );
        // Objetivos automáticos ligados a la cuenta
        del(setGoals, g => g.mode === 'auto' && g.accountId === id);
      },
      deleteCategory:     (id: string) => del(setCategories,    c => c.id === id),
      deleteProjection:   (id: string) => del(setProjections,   p => p.id === id),
      deleteGoal:         (id: string) => del(setGoals,         g => g.id === id),
      deleteRealExpense:  (id: string) => del(setRealExpenses,  e => e.id === id),
      deleteBankFormat:   (id: string) => del(setBankFormats,   f => f.id === id),
      deleteCategoryRule: (id: string) => del(setCategoryRules, r => r.id === id),
      deleteTransfer:     (transferId: string) =>
        del(setRealExpenses, e => e.transferId === transferId),
      deleteRealExpensesWhere: (match: (e: RealExpense) => boolean) =>
        del(setRealExpenses, match),
    };
    // Solo deleteAccount necesita `accounts` (para el tipo de cuenta); los
    // setters crudos son estables. Recrear la API al cambiar accounts no añade
    // churn: `value` ya depende de accounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts]);

  // ─── 🔄 Aplicar un snapshot fusionado del sync ────────────────────────────
  // Reemplaza las 7 colecciones VERBATIM (con sus tombstones) usando los setters
  // CRUDOS — NO los envueltos —, para preservar los `updatedAt` que vienen del
  // merge. Si pasara por wrapSetter, cada entidad se re-sellaría y el LWW de la
  // siguiente fusión quedaría corrupto (todo parecería "recién editado").
  const applySyncedData = useCallback(
    (d: {
      accounts: Account[];
      categories: Category[];
      projections: Projection[];
      realExpenses: RealExpense[];
      goals: SavingsGoal[];
      bankFormats: BankFormat[];
      categoryRules: CategoryRule[];
    }) => {
      setAccounts(d.accounts);
      setCategories(d.categories);
      setProjections(d.projections);
      setRealExpenses(d.realExpenses);
      setGoals(d.goals);
      setBankFormats(d.bankFormats);
      setCategoryRules(d.categoryRules);
    },
    []
  );

  // ─── 🪦 Frontera de tombstones (ADR §5.1) ────────────────────────────────
  // La UI consume SOLO entidades vivas. La lista completa (con tombstones) se
  // conserva en el estado subyacente (y por tanto en localStorage) para que el
  // sync pueda propagar los borrados.
  const liveAccounts      = useMemo(() => live(accounts),      [accounts]);
  const liveCategories    = useMemo(() => live(categories),    [categories]);
  const liveProjections   = useMemo(() => live(projections),   [projections]);
  const liveRealExpenses  = useMemo(() => live(realExpenses),  [realExpenses]);
  const liveGoals         = useMemo(() => live(goals),         [goals]);
  const liveBankFormats   = useMemo(() => live(bankFormats),   [bankFormats]);
  const liveCategoryRules = useMemo(() => live(categoryRules), [categoryRules]);

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
      applySyncedData,
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
      goals, bankFormats, categoryRules, deleteApi, applySyncedData,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
