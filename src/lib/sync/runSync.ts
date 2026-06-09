// ─── Una pasada de sync a nivel de app (composición pura) ─────────────────────
//
// ADR: project/development/10_SYNC_ARCHITECTURE.md §8.1 / §8.3.
//
// Une las piezas ya probadas en una sola operación que el controlador React (hook)
// invoca: arma el snapshot local, ejecuta el bucle pull→merge→push y, si el merge
// trajo cambios remotos, detecta movimientos sospechosos de duplicado.
//
// PURO: transporte y codec se inyectan (el codec lleva la clave cerrada). No toca
// React ni almacenamiento; el hook se encarga de aplicar el resultado al estado.
// ─────────────────────────────────────────────────────────────────────────────

import { syncOnce, type SyncTransport, type VaultCodec, type SyncResult } from './syncEngine';
import { buildSyncSnapshot, findMergeDuplicates, type SnapshotParts, type MergeDuplicate } from './snapshot';
import type { RealExpense } from '../../types';

export type RunSyncInput = {
  transport: SyncTransport;
  codec: VaultCodec;
  /** Piezas para armar el snapshot local (colecciones COMPLETAS + escalares). */
  localParts: SnapshotParts;
  /** Movimientos locales VIVOS antes de la fusión (para detectar duplicados). */
  beforeLiveRealExpenses: RealExpense[];
  /** Reintentos ante CONFLICT (se delega en syncOnce). */
  maxRetries?: number;
};

export type RunSyncOutput = {
  result: SyncResult;
  /** Movimientos que el merge trajo y parecen duplicar uno local (ADR §8.3). */
  duplicates: MergeDuplicate[];
};

/** Ejecuta una pasada completa de sincronización a nivel de aplicación. */
export async function runSync(input: RunSyncInput): Promise<RunSyncOutput> {
  const local = buildSyncSnapshot(input.localParts);
  const result = await syncOnce(input.transport, input.codec, local, {
    maxRetries: input.maxRetries,
  });
  // Solo tiene sentido buscar duplicados si la fusión incorporó algo remoto.
  const duplicates = result.remoteChanged
    ? findMergeDuplicates(input.beforeLiveRealExpenses, result.snapshot.realExpenses)
    : [];
  return { result, duplicates };
}
