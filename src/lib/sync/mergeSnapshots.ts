// ─── Motor de fusión LWW — lógica pura ───────────────────────────────────────
//
// ADR: project/development/10_SYNC_ARCHITECTURE.md §5 / §5.1.
//
// Fusiona dos snapshots (local + remoto) en uno, resolviendo conflictos por
// Last-Write-Wins por entidad usando `updatedAt`. Con tombstones INLINE (§5.1) un
// borrado es solo "la última escritura fue una eliminación", así que el merge es
// UN LWW uniforme por `id`: gana la versión con `updatedAt` mayor, sea viva o
// tombstone. Las entidades borradas se conservan en la salida (con `deletedAt`)
// para que el borrado se propague; el FILTRADO para la UI ocurre en la frontera
// del DataContext, NO aquí.
//
// Función PURA: no toca estado, almacenamiento ni red. 100% testeable.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Account,
  Category,
  Projection,
  RealExpense,
  SavingsGoal,
  BankFormat,
  CategoryRule,
} from '../../types';

/** Mínimo que necesita una entidad para fusionarse por LWW. */
type Mergeable = { id: string; updatedAt: number; deletedAt?: number };

/**
 * Snapshot sincronizable: el `data` del backup (las 7 colecciones + ajustes)
 * más un `timestamp` de cuándo se generó, usado para resolver los escalares
 * (que no tienen timestamp por-campo).
 */
export type SyncSnapshot = {
  timestamp: number;
  accounts: Account[];
  categories: Category[];
  projections: Projection[];
  realExpenses: RealExpense[];
  goals: SavingsGoal[];
  bankFormats: BankFormat[];
  categoryRules: CategoryRule[];
  baseCurrency: string;
  displayCurrency: string;
  dark: boolean;
  licenseState: unknown | null;
};

/**
 * ¿La versión `challenger` debe ganar a la `incumbent`?
 * LWW: mayor `updatedAt`. Empate de `updatedAt`: el tombstone gana (un borrado
 * no debe resucitar). Empate total: NO gana (se mantiene la incumbente → en
 * mergeCollection la incumbente es la local, sesgo determinista documentado).
 */
function winsOver(challenger: Mergeable, incumbent: Mergeable): boolean {
  if (challenger.updatedAt !== incumbent.updatedAt) {
    return challenger.updatedAt > incumbent.updatedAt;
  }
  const cDeleted = challenger.deletedAt != null;
  const iDeleted = incumbent.deletedAt != null;
  if (cDeleted !== iDeleted) return cDeleted; // delete-wins en empate
  return false; // empate total → mantener incumbente (local)
}

/**
 * Fusiona dos colecciones de la misma entidad por LWW por `id`.
 * Conserva tombstones. La salida incluye la unión de todos los `id`.
 *
 * Sesgo determinista: en empate total gana `local` (se siembra primero). Dentro
 * de una misma llamada el resultado es independiente del orden de los arrays
 * (los `id` son únicos en cada colección).
 */
export function mergeCollection<T extends Mergeable>(
  local: T[],
  remote: T[]
): T[] {
  const byId = new Map<string, T>();
  for (const item of local) byId.set(item.id, item);
  for (const item of remote) {
    const incumbent = byId.get(item.id);
    if (!incumbent || winsOver(item, incumbent)) {
      byId.set(item.id, item);
    }
  }
  return [...byId.values()];
}

/**
 * Fusiona dos snapshots completos. Las 7 colecciones se resuelven por LWW por
 * entidad; los escalares (divisas, tema, licencia) por snapshot más reciente.
 *
 * `licenseState` NUNCA se degrada a null: si un lado tiene licencia y el otro no,
 * se conserva la licencia (un dispositivo que nunca la tuvo no debe borrarla).
 */
export function mergeSnapshots(
  local: SyncSnapshot,
  remote: SyncSnapshot
): SyncSnapshot {
  const newer = remote.timestamp > local.timestamp ? remote : local;
  return {
    timestamp: Math.max(local.timestamp, remote.timestamp),
    accounts: mergeCollection(local.accounts, remote.accounts),
    categories: mergeCollection(local.categories, remote.categories),
    projections: mergeCollection(local.projections, remote.projections),
    realExpenses: mergeCollection(local.realExpenses, remote.realExpenses),
    goals: mergeCollection(local.goals, remote.goals),
    bankFormats: mergeCollection(local.bankFormats, remote.bankFormats),
    categoryRules: mergeCollection(local.categoryRules, remote.categoryRules),
    baseCurrency: newer.baseCurrency,
    displayCurrency: newer.displayCurrency,
    dark: newer.dark,
    licenseState: newer.licenseState ?? local.licenseState ?? remote.licenseState,
  };
}
