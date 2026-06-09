// ─── Ensamblado del snapshot de sync + detección de duplicados del primer merge ─
//
// ADR: project/development/10_SYNC_ARCHITECTURE.md §5 (forma del snapshot) y §8.3
// (primer merge con datos preexistentes → marcar movimientos sospechosos).
//
// Funciones PURAS: no tocan React ni almacenamiento. El controlador del sync (C2)
// las usa para construir lo que se cifra en el vault y para avisar de posibles
// duplicados tras una fusión.
// ─────────────────────────────────────────────────────────────────────────────

import type { SyncSnapshot } from './mergeSnapshots';
import { findDuplicate } from '../bankImportRules';
import type {
  Account,
  Category,
  Projection,
  RealExpense,
  SavingsGoal,
  BankFormat,
  CategoryRule,
} from '../../types';

/**
 * Piezas para armar el snapshot. Las 7 colecciones deben venir COMPLETAS (con
 * tombstones, de `DataContext.raw`): el vault debe propagar también los borrados.
 */
export type SnapshotParts = {
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
  timestamp: number;
};

/** Ensambla un SyncSnapshot a partir del estado completo + ajustes + licencia. */
export function buildSyncSnapshot(parts: SnapshotParts): SyncSnapshot {
  return {
    timestamp: parts.timestamp,
    accounts: parts.accounts,
    categories: parts.categories,
    projections: parts.projections,
    realExpenses: parts.realExpenses,
    goals: parts.goals,
    bankFormats: parts.bankFormats,
    categoryRules: parts.categoryRules,
    baseCurrency: parts.baseCurrency,
    displayCurrency: parts.displayCurrency,
    dark: parts.dark,
    licenseState: parts.licenseState,
  };
}

/** Un movimiento que el merge trajo y que parece duplicar uno preexistente. */
export type MergeDuplicate = {
  /** id del movimiento nuevo (venido del otro dispositivo). */
  id: string;
  /** id del movimiento local preexistente con el que coincide. */
  duplicateOf: string;
};

/**
 * Detecta movimientos sospechosos de duplicado tras una fusión (ADR §8.3).
 *
 * Solo mira los movimientos que el merge AÑADIÓ (presentes en `after` y no en
 * `before`) y vivos, y comprueba si coinciden —por la heurística de importación
 * (`findDuplicate`: mismo tipo + importe ±0,01 + fecha ±2 días)— con algún
 * movimiento local PREEXISTENTE vivo. Cero heurística nueva.
 *
 * Idempotente entre pasadas: un movimiento ya integrado deja de ser "nuevo", así
 * que no se vuelve a marcar en sincronizaciones posteriores.
 */
export function findMergeDuplicates(
  before: RealExpense[],
  after: RealExpense[]
): MergeDuplicate[] {
  const beforeIds = new Set(before.map((e) => e.id));
  const liveBefore = before.filter((e) => !e.deletedAt);
  const dups: MergeDuplicate[] = [];
  for (const mov of after) {
    if (mov.deletedAt) continue; // un tombstone no es un duplicado
    if (beforeIds.has(mov.id)) continue; // no es nuevo del merge
    const duplicateOf = findDuplicate(
      { amount: mov.amount, valueDate: mov.valueDate, type: mov.type },
      liveBefore
    );
    if (duplicateOf) dups.push({ id: mov.id, duplicateOf });
  }
  return dups;
}
