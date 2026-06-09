// ─── Tombstones INLINE (ADR §5.1) ────────────────────────────────────────────
// Primitivos PUROS para el borrado lógico (soft delete) de entidades
// sincronizables. El borrado NO elimina del array: marca `deletedAt` en el
// propio registro para que el motor de fusión del sync pueda propagarlo (un
// hard delete reaparecería desde el otro dispositivo).
//
// 📐 Filosofía: funciones puras, no mutan la entrada, devuelven listas nuevas.

import { stampDelete } from './timestamps';

/** Devuelve solo las entidades vivas (sin tombstone). Para la UI/derivados. */
export const live = <T extends { deletedAt?: number }>(list: T[]): T[] =>
  list.filter((e) => !e.deletedAt);

/** Cuenta entidades vivas (ignora tombstones). Para metadata de backup. */
export const countLive = <T extends { deletedAt?: number }>(list: T[]): number =>
  list.reduce((n, e) => (e.deletedAt ? n : n + 1), 0);

/**
 * Marca como tombstone (`deletedAt`) las entidades VIVAS que cumplan `match`.
 * - Idempotente: no re-sella una entidad que ya es tombstone (no re-bumpea
 *   `updatedAt`), así borrar dos veces es inocuo.
 * - Puro: devuelve una lista nueva; las entidades no afectadas conservan su
 *   referencia (mínimo trabajo para React).
 */
export function tombstone<T extends { deletedAt?: number }>(
  list: T[],
  match: (item: T) => boolean
): T[] {
  return list.map((item) =>
    match(item) && !item.deletedAt ? (stampDelete(item) as T) : item
  );
}
