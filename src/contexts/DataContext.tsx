import { createContext, useContext } from 'react';
import type React from 'react';
import type {
  Account, Category, Projection, RealExpense,
  SavingsGoal, BankFormat, CategoryRule, StampingSetter,
} from '../types';

// ─── Tipo ─────────────────────────────────────────────────────────────────────
// 🪦 TOMBSTONES INLINE (ADR §5.1): los borrados son `deletedAt` en el propio
// registro, no se eliminan del array. La frontera del contexto expone a la UI
// las listas YA FILTRADAS (solo entidades vivas); la lista COMPLETA (con
// tombstones) vive en `raw` y es la única que debe usar la persistencia/sync.
export type DataContextType = {
  // Listas VIVAS (sin tombstones) — lo que consume toda la UI y los derivados.
  // ⚠️ Los setters de entidades SELLAN timestamps (ver `wrapSetter`): por eso
  // son `StampingSetter` y no `Dispatch<SetStateAction<…>>` — aceptan entidades
  // recién creadas SIN createdAt/updatedAt y las devuelven ya selladas.
  accounts: Account[];
  setAccounts: StampingSetter<Account>;
  categories: Category[];
  setCategories: StampingSetter<Category>;
  projections: Projection[];
  setProjections: StampingSetter<Projection>;
  realExpenses: RealExpense[];
  setRealExpenses: StampingSetter<RealExpense>;
  goals: SavingsGoal[];
  setGoals: StampingSetter<SavingsGoal>;
  bankFormats: BankFormat[];
  setBankFormats: StampingSetter<BankFormat>;
  categoryRules: CategoryRule[];
  setCategoryRules: StampingSetter<CategoryRule>;
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
  // 🔄 Aplica las 7 colecciones de un snapshot fusionado del sync REEMPLAZÁNDOLAS
  // verbatim (con sus tombstones), SIN re-sellar timestamps. Usa los setters
  // crudos: re-sellar `updatedAt` corrompería el LWW en la siguiente fusión.
  applySyncedData: (data: {
    accounts: Account[];
    categories: Category[];
    projections: Projection[];
    realExpenses: RealExpense[];
    goals: SavingsGoal[];
    bankFormats: BankFormat[];
    categoryRules: CategoryRule[];
  }) => void;
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

