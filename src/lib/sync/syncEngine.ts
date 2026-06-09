// ─── Motor del bucle de sync — pull → merge → push (lógica pura) ──────────────
//
// ADR: project/development/10_SYNC_ARCHITECTURE.md §8.1 (ciclo y anti-carrera).
//
// Orquesta UNA pasada de sincronización contra un proveedor de transporte:
//   1. PULL   — lee el blob remoto (si existe).
//   2. MERGE  — funde local + remoto por LWW (mergeSnapshots, tombstones-aware).
//   3. PUSH   — sube el resultado SOLO si aporta algo nuevo al remoto.
//
// Anti-carrera (concurrencia optimista, §8.1): el push lleva la revisión que se
// leyó; si otro dispositivo escribió entre medias, el proveedor lanza CONFLICT y
// aquí se RE-PULL-MERGE-PUSH (acotado por maxRetries). Dos dispositivos nunca se
// pisan a nivel de archivo.
//
// PURO respecto a la app: no toca React, ni almacenamiento, ni la contraseña. El
// proveedor y el codec se INYECTAN — el codec ya lleva la contraseña cerrada en
// su closure, así que el motor jamás la ve. 100% testeable con un proveedor falso.
// ─────────────────────────────────────────────────────────────────────────────

import type { SyncProvider } from './types';
import { SyncError } from './types';
import { mergeSnapshots, type SyncSnapshot } from './mergeSnapshots';

/** Lo mínimo del proveedor que el motor necesita (facilita el mock en tests). */
export type SyncTransport = Pick<SyncProvider, 'readVault' | 'writeVault'>;

/** Codec con la contraseña ya cerrada en el closure (ver vaultCodec). */
export type VaultCodec = {
  encode: (snapshot: SyncSnapshot) => Promise<string>;
  decode: (content: string) => Promise<SyncSnapshot>;
};

export type SyncStatus =
  | 'created' // el remoto no existía → se creó con el snapshot local
  | 'updated' // se subió un merge que aportaba cambios
  | 'up-to-date'; // el remoto ya tenía todo lo local → no se subió nada

export type SyncResult = {
  status: SyncStatus;
  /** Snapshot autoritativo tras la pasada (merge si hubo remoto, o el local). */
  snapshot: SyncSnapshot;
  /** Revisión del proveedor tras la operación (para la siguiente pasada). */
  revision: string | null;
  /** ¿El merge trajo cambios remotos que hay que aplicar al estado local? */
  remoteChanged: boolean;
};

const isConflict = (e: unknown): boolean =>
  e instanceof SyncError && e.code === 'CONFLICT';

/**
 * Compara dos snapshots ignorando su `timestamp` (que casi siempre difiere): dos
 * snapshots son equivalentes si sus 7 colecciones tienen los mismos `id` con el
 * mismo estado de versión (`updatedAt`/`deletedAt`) y los escalares coinciden.
 * Se usa para decidir si un push aporta algo y evitar ping-pong entre dispositivos.
 */
export function snapshotsEquivalent(a: SyncSnapshot, b: SyncSnapshot): boolean {
  const sameCollection = (
    xs: { id: string; updatedAt: number; deletedAt?: number }[],
    ys: { id: string; updatedAt: number; deletedAt?: number }[]
  ): boolean => {
    if (xs.length !== ys.length) return false;
    const map = new Map(ys.map((y) => [y.id, y]));
    for (const x of xs) {
      const y = map.get(x.id);
      if (!y) return false;
      if (x.updatedAt !== y.updatedAt) return false;
      if ((x.deletedAt ?? null) !== (y.deletedAt ?? null)) return false;
    }
    return true;
  };

  return (
    sameCollection(a.accounts, b.accounts) &&
    sameCollection(a.categories, b.categories) &&
    sameCollection(a.projections, b.projections) &&
    sameCollection(a.realExpenses, b.realExpenses) &&
    sameCollection(a.goals, b.goals) &&
    sameCollection(a.bankFormats, b.bankFormats) &&
    sameCollection(a.categoryRules, b.categoryRules) &&
    a.baseCurrency === b.baseCurrency &&
    a.displayCurrency === b.displayCurrency &&
    a.dark === b.dark &&
    JSON.stringify(a.licenseState ?? null) === JSON.stringify(b.licenseState ?? null)
  );
}

/**
 * Ejecuta una pasada completa de sincronización. Devuelve el snapshot resultante
 * (a aplicar al estado local) y la revisión para la próxima pasada.
 *
 * Propaga sin tocar los errores del proveedor/codec (TOKEN_EXPIRED, NETWORK,
 * WRONG_PASSWORD, SCHEMA_TOO_NEW…) salvo CONFLICT, que se reintenta internamente.
 */
export async function syncOnce(
  transport: SyncTransport,
  codec: VaultCodec,
  local: SyncSnapshot,
  opts: { maxRetries?: number } = {}
): Promise<SyncResult> {
  const maxRetries = opts.maxRetries ?? 3;
  let attempt = 0;
  let remote = await transport.readVault();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (!remote) {
      // No hay vault remoto → lo creamos con el snapshot local.
      const content = await codec.encode(local);
      try {
        const written = await transport.writeVault(content, null);
        return {
          status: 'created',
          snapshot: local,
          revision: written.revision,
          remoteChanged: false,
        };
      } catch (e) {
        // Carrera: otro dispositivo lo creó entre el read y el write.
        if (isConflict(e) && attempt++ < maxRetries) {
          remote = await transport.readVault();
          continue;
        }
        throw e;
      }
    }

    const remoteSnapshot = await codec.decode(remote.content);
    const merged = mergeSnapshots(local, remoteSnapshot);
    const remoteChanged = !snapshotsEquivalent(merged, local);

    // Si el remoto ya contiene todo lo local, no hace falta subir nada.
    if (snapshotsEquivalent(merged, remoteSnapshot)) {
      return {
        status: 'up-to-date',
        snapshot: merged,
        revision: remote.revision,
        remoteChanged,
      };
    }

    const content = await codec.encode(merged);
    try {
      const written = await transport.writeVault(content, remote.revision);
      return {
        status: 'updated',
        snapshot: merged,
        revision: written.revision,
        remoteChanged,
      };
    } catch (e) {
      // Otro dispositivo escribió entre medias → re-pull-merge-push (§8.1).
      if (isConflict(e) && attempt++ < maxRetries) {
        remote = await transport.readVault();
        continue;
      }
      throw e;
    }
  }
}
