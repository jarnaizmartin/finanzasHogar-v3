import { describe, it, expect } from 'vitest';
import { live, countLive, tombstone } from '../tombstones';

type Ent = { id: string; deletedAt?: number; updatedAt?: number; createdAt?: number };

const mk = (id: string, extra: Partial<Ent> = {}): Ent => ({
  id,
  createdAt: 1000,
  updatedAt: 1000,
  ...extra,
});

describe('lib/tombstones', () => {
  describe('live', () => {
    it('devuelve solo entidades sin deletedAt', () => {
      const list = [mk('a'), mk('b', { deletedAt: 5 }), mk('c')];
      expect(live(list).map((e) => e.id)).toEqual(['a', 'c']);
    });

    it('con lista vacía devuelve vacío', () => {
      expect(live([])).toEqual([]);
    });

    it('no muta la lista original', () => {
      const list = [mk('a'), mk('b', { deletedAt: 5 })];
      live(list);
      expect(list).toHaveLength(2);
    });
  });

  describe('countLive', () => {
    it('cuenta solo los vivos', () => {
      const list = [mk('a'), mk('b', { deletedAt: 5 }), mk('c'), mk('d', { deletedAt: 9 })];
      expect(countLive(list)).toBe(2);
    });

    it('lista vacía → 0', () => {
      expect(countLive([])).toBe(0);
    });
  });

  describe('tombstone', () => {
    it('marca deletedAt en los que cumplen el match', () => {
      const list = [mk('a'), mk('b'), mk('c')];
      const out = tombstone(list, (e) => e.id === 'b');
      const b = out.find((e) => e.id === 'b')!;
      expect(b.deletedAt).toBeTypeOf('number');
      expect(out.find((e) => e.id === 'a')!.deletedAt).toBeUndefined();
      expect(out.find((e) => e.id === 'c')!.deletedAt).toBeUndefined();
    });

    it('también bumpea updatedAt del borrado', () => {
      const list = [mk('a', { updatedAt: 1000 })];
      const out = tombstone(list, () => true);
      expect(out[0].updatedAt).toBeGreaterThanOrEqual(1000);
      expect(out[0].deletedAt).toBe(out[0].updatedAt);
    });

    it('es idempotente: no re-sella un tombstone existente (conserva su referencia)', () => {
      const already = mk('a', { deletedAt: 42, updatedAt: 42 });
      const list = [already, mk('b')];
      const out = tombstone(list, () => true);
      // El ya borrado mantiene su deletedAt original y su misma referencia
      const a = out.find((e) => e.id === 'a')!;
      expect(a).toBe(already);
      expect(a.deletedAt).toBe(42);
    });

    it('es puro: no muta la lista ni los items de entrada', () => {
      const a = mk('a');
      const list = [a];
      const out = tombstone(list, () => true);
      expect(a.deletedAt).toBeUndefined(); // el item original intacto
      expect(out[0]).not.toBe(a);          // el borrado es un objeto nuevo
    });

    it('conserva la referencia de los items NO afectados', () => {
      const a = mk('a');
      const b = mk('b');
      const out = tombstone([a, b], (e) => e.id === 'b');
      expect(out.find((e) => e.id === 'a')).toBe(a);
    });

    it('sin coincidencias devuelve una lista equivalente', () => {
      const list = [mk('a'), mk('b')];
      const out = tombstone(list, () => false);
      expect(out.map((e) => e.id)).toEqual(['a', 'b']);
      expect(out.every((e) => e.deletedAt === undefined)).toBe(true);
    });
  });

  describe('integración live + tombstone (frontera del DataContext)', () => {
    it('tras tombstonear, live deja de verlo pero la lista completa lo conserva', () => {
      const full = [mk('a'), mk('b'), mk('c')];
      const afterDelete = tombstone(full, (e) => e.id === 'b');
      // La UI (live) ya no lo ve
      expect(live(afterDelete).map((e) => e.id)).toEqual(['a', 'c']);
      // La lista completa (sync) sí lo conserva como tombstone
      expect(afterDelete).toHaveLength(3);
      expect(afterDelete.find((e) => e.id === 'b')!.deletedAt).toBeTypeOf('number');
    });
  });
});
