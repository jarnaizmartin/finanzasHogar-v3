import { describe, it, expect, vi } from 'vitest';
import { syncOnce, snapshotsEquivalent, type VaultCodec } from '../syncEngine';
import type { SyncTransport } from '../syncEngine';
import type { SyncSnapshot } from '../mergeSnapshots';
import { SyncError, type VaultBlob } from '../types';
import type { Account } from '../../../types';
import { mkAccount } from '../../../test-fixtures';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const snap = (over: Partial<SyncSnapshot> = {}): SyncSnapshot => ({
  timestamp: 1000,
  accounts: [],
  categories: [],
  projections: [],
  realExpenses: [],
  goals: [],
  bankFormats: [],
  categoryRules: [],
  baseCurrency: 'EUR',
  displayCurrency: 'EUR',
  dark: false,
  licenseState: null,
  ...over,
});

// Entidad mínima mergeable, ubicada en `accounts` por simplicidad.
const acc = (id: string, updatedAt: number, deletedAt?: number): Account =>
  mkAccount({ id, updatedAt, ...(deletedAt ? { deletedAt } : {}) });

// Codec JSON (identidad): el motor no distingue, solo necesita round-trip.
const jsonCodec: VaultCodec = {
  encode: async (s) => JSON.stringify(s),
  decode: async (c) => JSON.parse(c) as SyncSnapshot,
};

/** Proveedor falso en memoria con concurrencia optimista por revisión. */
class FakeDrive implements SyncTransport {
  blob: VaultBlob | null;
  reads = 0;
  writes = 0;
  /** Se ejecuta una vez antes del siguiente write (simula otro dispositivo). */
  beforeWrite?: () => void;

  constructor(initial: VaultBlob | null = null) {
    this.blob = initial;
  }
  async readVault(): Promise<VaultBlob | null> {
    this.reads++;
    return this.blob ? { ...this.blob } : null;
  }
  async writeVault(content: string, expectedRevision: string | null): Promise<VaultBlob> {
    this.writes++;
    if (this.beforeWrite) {
      const fn = this.beforeWrite;
      this.beforeWrite = undefined;
      fn();
    }
    const currentRev = this.blob?.revision ?? null;
    if (expectedRevision !== currentRev) throw new SyncError('CONFLICT');
    const nextRev = String((Number(currentRev) || 0) + 1);
    this.blob = { content, revision: nextRev };
    return { ...this.blob };
  }
}

const blobOf = (s: SyncSnapshot, revision = '1'): VaultBlob => ({
  content: JSON.stringify(s),
  revision,
});

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('snapshotsEquivalent', () => {
  it('ignora el timestamp', () => {
    expect(snapshotsEquivalent(snap({ timestamp: 1 }), snap({ timestamp: 999 }))).toBe(true);
  });
  it('detecta diferencias de versión por entidad', () => {
    const a = snap({ accounts: [acc('a', 5)] });
    const b = snap({ accounts: [acc('a', 6)] });
    expect(snapshotsEquivalent(a, b)).toBe(false);
  });
  it('distingue tombstone de vivo con el mismo updatedAt', () => {
    const a = snap({ accounts: [acc('a', 5)] });
    const b = snap({ accounts: [acc('a', 5, 5)] });
    expect(snapshotsEquivalent(a, b)).toBe(false);
  });
  it('detecta diferencias de escalares', () => {
    expect(snapshotsEquivalent(snap({ dark: true }), snap({ dark: false }))).toBe(false);
  });
});

describe('syncOnce', () => {
  it('si no hay remoto, crea el vault con el snapshot local', async () => {
    const drive = new FakeDrive(null);
    const local = snap({ accounts: [acc('a', 5)] });
    const res = await syncOnce(drive, jsonCodec, local);
    expect(res.status).toBe('created');
    expect(res.remoteChanged).toBe(false);
    expect(res.snapshot).toEqual(local);
    expect(drive.writes).toBe(1);
    expect(drive.blob).not.toBeNull();
  });

  it('funde lo remoto con lo local y sube el merge', async () => {
    const local = snap({ accounts: [acc('a', 5)] });
    const remote = snap({ accounts: [acc('b', 7)] });
    const drive = new FakeDrive(blobOf(remote));
    const res = await syncOnce(drive, jsonCodec, local);
    expect(res.status).toBe('updated');
    expect(res.remoteChanged).toBe(true);
    expect(res.snapshot.accounts.map((a) => a.id).sort()).toEqual(['a', 'b']);
    expect(drive.writes).toBe(1);
  });

  it('si el remoto ya tiene todo lo local, no sube nada', async () => {
    const local = snap({ accounts: [acc('a', 5)] });
    const remote = snap({ accounts: [acc('a', 5)] });
    const drive = new FakeDrive(blobOf(remote));
    const res = await syncOnce(drive, jsonCodec, local);
    expect(res.status).toBe('up-to-date');
    expect(res.remoteChanged).toBe(false);
    expect(drive.writes).toBe(0);
  });

  it('si el remoto trae cambios y lo local no aporta nada, aplica sin subir', async () => {
    const local = snap({ accounts: [acc('a', 5)] });
    const remote = snap({ accounts: [acc('a', 5), acc('b', 7)] });
    const drive = new FakeDrive(blobOf(remote));
    const res = await syncOnce(drive, jsonCodec, local);
    expect(res.status).toBe('up-to-date');
    expect(res.remoteChanged).toBe(true);
    expect(res.snapshot.accounts.map((a) => a.id).sort()).toEqual(['a', 'b']);
    expect(drive.writes).toBe(0);
  });

  it('una edición local más reciente gana y se sube', async () => {
    const local = snap({ accounts: [acc('a', 9)] });
    const remote = snap({ accounts: [acc('a', 3)] });
    const drive = new FakeDrive(blobOf(remote));
    const res = await syncOnce(drive, jsonCodec, local);
    expect(res.status).toBe('updated');
    expect(res.snapshot.accounts[0].updatedAt).toBe(9);
    expect(drive.writes).toBe(1);
  });

  it('un tombstone local propaga el borrado al remoto', async () => {
    const local = snap({ accounts: [acc('a', 10, 10)] }); // borrado en local
    const remote = snap({ accounts: [acc('a', 3)] });       // vivo en remoto
    const drive = new FakeDrive(blobOf(remote));
    const res = await syncOnce(drive, jsonCodec, local);
    expect(res.status).toBe('updated');
    expect(res.snapshot.accounts[0].deletedAt).toBe(10);
  });

  it('ante CONFLICT re-hace pull-merge-push y termina (§8.1)', async () => {
    const local = snap({ accounts: [acc('a', 5)] });
    const remoteV1 = snap({ accounts: [acc('b', 7)] });
    const drive = new FakeDrive(blobOf(remoteV1, '1'));
    // Justo antes del primer write, otro dispositivo escribe la rev '2'.
    drive.beforeWrite = () => {
      drive.blob = blobOf(snap({ accounts: [acc('c', 8)] }), '2');
    };
    const res = await syncOnce(drive, jsonCodec, local);
    expect(res.status).toBe('updated');
    // El merge final incluye a (local) + c (remoto v2). 'b' (remoto v1) ya no está
    // porque el segundo dispositivo lo sustituyó; el motor re-mergeó contra v2.
    expect(res.snapshot.accounts.map((a) => a.id).sort()).toEqual(['a', 'c']);
    expect(drive.writes).toBe(2); // primer intento (conflict) + reintento OK
  });

  it('si el CONFLICT persiste, agota reintentos y lanza CONFLICT', async () => {
    const local = snap({ accounts: [acc('a', 5)] });
    const drive = new FakeDrive(blobOf(snap({ accounts: [acc('b', 7)] }), '1'));
    let rev = 1;
    // Cada write encuentra una revisión nueva → conflicto perpetuo.
    const bumpForever = () => {
      rev += 1;
      drive.blob = blobOf(snap({ accounts: [acc('b', 7)] }), String(rev));
      drive.beforeWrite = bumpForever;
    };
    drive.beforeWrite = bumpForever;
    await expect(syncOnce(drive, jsonCodec, local, { maxRetries: 2 })).rejects.toMatchObject({
      code: 'CONFLICT',
    });
  });

  it('carrera de creación: el remoto aparece tras decidir crear → re-merge', async () => {
    const local = snap({ accounts: [acc('a', 5)] });
    const drive = new FakeDrive(null); // de inicio no hay remoto
    // Entre el read (null) y el write, otro dispositivo crea el vault.
    drive.beforeWrite = () => {
      drive.blob = blobOf(snap({ accounts: [acc('b', 7)] }), '1');
    };
    const res = await syncOnce(drive, jsonCodec, local);
    expect(res.status).toBe('updated');
    expect(res.snapshot.accounts.map((a) => a.id).sort()).toEqual(['a', 'b']);
  });

  it('propaga errores del codec (p. ej. WRONG_PASSWORD) sin tragarlos', async () => {
    const drive = new FakeDrive(blobOf(snap()));
    const badCodec: VaultCodec = {
      encode: jsonCodec.encode,
      decode: vi.fn(async () => {
        throw new SyncError('WRONG_PASSWORD');
      }),
    };
    await expect(syncOnce(drive, badCodec, snap())).rejects.toMatchObject({
      code: 'WRONG_PASSWORD',
    });
  });
});
