// ─── Helpers de timestamps ───────────────────────────────────────────────────
// Centralizan la lógica de createdAt / updatedAt / deletedAt para todas las
// entidades sincronizables (Account, Category, Projection, RealExpense...).
//
// 🛡️ Diseño:
//   - now()         → única fuente de verdad para "ahora" (facilita tests)
//   - stampNew(e)   → para entidades recién creadas (set createdAt + updatedAt)
//   - stampUpdate(e)→ para mutaciones (solo updatedAt, preserva createdAt)
//   - stampDelete(e)→ tombstone (set deletedAt + bumpea updatedAt)
//   - ensureStamps(e) → migración: rellena timestamps si faltan (legacy data)
//
// 📐 Filosofía: las funciones son PURAS y devuelven un nuevo objeto.
// No mutan el input. Esto es clave para React (inmutabilidad).

import type { Timestamped } from '../types';

/** Única fuente de verdad para "ahora". Facilita mock en tests. */
export const now = (): number => Date.now();

/**
 * Sella una entidad recién creada con createdAt y updatedAt = ahora.
 * Si la entidad ya trae timestamps (raro pero posible), los respeta.
 */
export function stampNew<T extends Partial<Timestamped>>(
  entity: T
): T & Timestamped {
  const t = now();
  return {
    ...entity,
    createdAt: entity.createdAt ?? t,
    updatedAt: entity.updatedAt ?? t,
  };
}

/**
 * Sella una mutación. Solo actualiza updatedAt; preserva createdAt original.
 * Si la entidad no tenía createdAt (legacy), lo rellena con "ahora" como
 * fallback (no podemos inventar una fecha pasada).
 */
export function stampUpdate<T extends Partial<Timestamped>>(
  entity: T
): T & Timestamped {
  const t = now();
  return {
    ...entity,
    createdAt: entity.createdAt ?? t,
    updatedAt: t,
  };
}

/**
 * Marca una entidad como borrada (tombstone).
 * En v1 NO se usa todavía (seguimos con hard delete).
 * Reservado para sync v2.
 */
export function stampDelete<T extends Partial<Timestamped>>(
  entity: T
): T & Timestamped {
  const t = now();
  return {
    ...entity,
    createdAt: entity.createdAt ?? t,
    updatedAt: t,
    deletedAt: t,
  };
}

/**
 * Rellena timestamps faltantes. Usado en migración al cargar datos
 * legacy desde localStorage (entidades creadas antes de la Fase 0.5).
 * Si ya están presentes, no toca nada.
 */
export function ensureStamps<T extends Partial<Timestamped>>(
  entity: T
): T & Timestamped {
  if (entity.createdAt != null && entity.updatedAt != null) {
    return entity as T & Timestamped;
  }
  return stampNew(entity);
}
