import { describe, it, expect, vi } from 'vitest';
import { buildDemoData } from '../demoData';
import { applyRecurringProjections } from '../recurringMotor';

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

  // 🔴 Regresión (s.71): al entrar en Modo Prueba saltaba el modal "posible
  // duplicado" (hipoteca) y el motor inyectaba movimientos automáticos en el
  // dataset curado. El motor lee `new Date()` internamente → sembramos con el
  // ahora real, que es justo el escenario del bug.
  it('recién sembrado, el motor de recurrentes no lo toca (ni duplicados ni altas)', () => {
    const d = buildDemoData({ currency: 'EUR', t, now: new Date() });
    const setRealExpenses = vi.fn();
    const setProjections = vi.fn();

    const result = applyRecurringProjections(
      d.projections, d.realExpenses, setRealExpenses, setProjections,
      d.accounts, 'EUR'
    );

    expect(result.duplicates).toBe(0);
    expect(result.applied).toBe(0);
    expect(setRealExpenses).not.toHaveBeenCalled();
    expect(setProjections).not.toHaveBeenCalled();
  });

  // El Modo Prueba es un escaparate: se entra cualquier día del mes y el mes en
  // curso debe leerse completo (con nómina) y en positivo, no "Ingresos +0".
  it('el mes en curso enseña ingresos y neto positivo, se entre el día que se entre', () => {
    for (const day of [1, 5, 16, 28]) {
      const now = new Date(2026, 6, day);
      const d = buildDemoData({ currency: 'EUR', t, now });
      const key = '2026-07';
      const mes = d.realExpenses.filter(
        (m) => m.valueDate.slice(0, 7) === key && !m.isTransfer
      );
      const ingresos = mes.filter((m) => m.type === 'income').reduce((s, m) => s + m.amount, 0);
      const gastos = mes.filter((m) => m.type === 'expense').reduce((s, m) => s + m.amount, 0);
      expect(ingresos, `día ${day}: sin ingresos en el mes`).toBeGreaterThan(0);
      expect(ingresos - gastos, `día ${day}: neto del mes negativo`).toBeGreaterThan(0);
    }
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
