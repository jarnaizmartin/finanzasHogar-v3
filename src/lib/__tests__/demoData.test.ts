import { describe, it, expect } from 'vitest';
import { buildDemoData } from '../demoData';

const t = (k: string) => k; // stub: devuelve la clave
const build = (now = new Date('2026-06-15T10:00:00Z')) =>
  buildDemoData({ currency: 'EUR', t, now });

describe('buildDemoData', () => {
  it('genera las 7 colecciones con contenido curado', () => {
    const d = build();
    expect(d.accounts.length).toBeGreaterThanOrEqual(4);
    expect(d.categories.length).toBe(21);
    expect(d.projections.length).toBeGreaterThanOrEqual(6);
    expect(d.realExpenses.length).toBeGreaterThanOrEqual(10);
    expect(d.goals.length).toBe(2);
    // Luce la profundidad: hay tarjeta y préstamo
    expect(d.accounts.some((a) => a.accountType === 'credit_card')).toBe(true);
    expect(d.accounts.some((a) => a.accountType === 'loan')).toBe(true);
  });

  it('mantiene integridad referencial (cuenta y categoría existen)', () => {
    const d = build();
    const accIds = new Set(d.accounts.map((a) => a.id));
    const catIds = new Set(d.categories.map((c) => c.id));
    for (const p of d.projections) {
      expect(accIds.has(p.accountId)).toBe(true);
      expect(catIds.has(p.categoryId)).toBe(true);
      if (p.type === 'transfer') expect(accIds.has(p.toAccountId!)).toBe(true);
    }
    for (const m of d.realExpenses) {
      expect(accIds.has(m.accountId)).toBe(true);
      expect(catIds.has(m.categoryId)).toBe(true);
    }
    for (const g of d.goals) {
      expect(accIds.has(g.accountId)).toBe(true);
    }
  });

  it('el traspaso de ejemplo forma un par vinculado (ingreso + gasto)', () => {
    const d = build();
    const pair = d.realExpenses.filter((m) => m.transferId === 'demo-transfer-1');
    expect(pair.length).toBe(2);
    expect(pair.filter((m) => m.type === 'income').length).toBe(1);
    expect(pair.filter((m) => m.type === 'expense').length).toBe(1);
    expect(pair.every((m) => m.isTransfer)).toBe(true);
  });

  it('propaga la divisa del usuario a cuentas y movimientos', () => {
    const d = buildDemoData({ currency: 'USD', t, now: new Date() });
    expect(d.accounts.every((a) => a.currency === 'USD')).toBe(true);
    expect(d.realExpenses.every((m) => m.currency === 'USD')).toBe(true);
    expect(d.goals.every((g) => g.currency === 'USD')).toBe(true);
  });

  it('es determinista: mismos IDs entre reseeds (idempotente)', () => {
    const a = build();
    const b = build();
    expect(a.accounts.map((x) => x.id)).toEqual(b.accounts.map((x) => x.id));
    expect(a.projections.map((x) => x.id)).toEqual(b.projections.map((x) => x.id));
  });

  it('todas las entidades llevan timestamps (se escriben directas a storage)', () => {
    const d = build();
    const all = [
      ...d.accounts, ...d.categories, ...d.projections,
      ...d.realExpenses, ...d.goals,
    ];
    for (const e of all) {
      expect(typeof e.createdAt).toBe('number');
      expect(typeof e.updatedAt).toBe('number');
    }
  });
});
