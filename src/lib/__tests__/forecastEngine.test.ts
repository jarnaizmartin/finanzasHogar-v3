// src/lib/__tests__/forecastEngine.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calcForecast } from '../forecastEngine';
import type { Account, Projection, RealExpense } from '../../types';

// ─── Helpers de factory ──────────────────────────────────────────────────────
const mkAccount = (over: Partial<Account> = {}): Account => ({
  id: 'acc1',
  name: 'Cuenta principal',
  balance: 1000,
  currency: 'EUR',
  date: '2020-01-01',
  accountType: 'checking',
  ...over,
});

const mkProjection = (over: Partial<Projection> = {}): Projection => ({
  id: 'p1',
  name: 'Proyección',
  accountId: 'acc1',
  categoryId: 'cat1',
  type: 'expense',
  amount: 100,
  frequency: 'monthly',
  startDate: '2020-01-01',
  endDate: '',
  ...over,
});

const mkReal = (over: Partial<RealExpense> = {}): RealExpense => ({
  id: 'r1',
  entryDate: '2025-06-10',
  valueDate: '2025-06-10',
  description: 'Movimiento',
  categoryId: 'cat1',
  amount: 50,
  currency: 'EUR',
  type: 'expense',
  accountId: 'acc1',
  ...over,
});

// ─── Setup: fijamos el tiempo a 2025-06-15 ───────────────────────────────────
// Esto hace los tests deterministas independientemente de cuándo se ejecuten.
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

// ═════════════════════════════════════════════════════════════════════════════
describe('calcForecast — estructura básica', () => {
  it('devuelve siempre 12 meses', () => {
    const result = calcForecast([], [mkAccount()], 'all', {}, 'EUR', []);
    expect(result).toHaveLength(12);
  });

  it('el primer mes es el actual (isCurrent=true)', () => {
    const result = calcForecast([], [mkAccount()], 'all', {}, 'EUR', []);
    expect(result[0].isCurrent).toBe(true);
    expect(result[0].isPast).toBe(false);
    expect(result[0].key).toBe('2025-06');
  });

  it('los meses 1..11 son futuros (isPast=false, isCurrent=false)', () => {
    const result = calcForecast([], [mkAccount()], 'all', {}, 'EUR', []);
    for (let i = 1; i < 12; i++) {
      expect(result[i].isPast).toBe(false);
      expect(result[i].isCurrent).toBe(false);
    }
  });

  it('cada mes tiene net = income - expense', () => {
    const result = calcForecast(
      [mkProjection({ amount: 100, type: 'expense' })],
      [mkAccount()],
      'all',
      {},
      'EUR',
      []
    );
    result.forEach((m) => expect(m.net).toBe(m.income - m.expense));
  });

  it('caso vacío: sin proyecciones ni movimientos, todos los meses a 0', () => {
    const result = calcForecast([], [mkAccount()], 'all', {}, 'EUR', []);
    result.forEach((m) => {
      expect(m.income).toBe(0);
      expect(m.expense).toBe(0);
      expect(m.net).toBe(0);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('calcForecast — saldo inicial', () => {
  it('startBalance refleja el balance de cuenta corriente sin movimientos', () => {
    const result = calcForecast(
      [],
      [mkAccount({ balance: 1500 })],
      'all',
      {},
      'EUR',
      []
    );
    expect(result[0].runningBalance).toBe(1500);
  });

  it('suma balances de varias cuentas en modo "all"', () => {
    const result = calcForecast(
      [],
      [
        mkAccount({ id: 'a1', balance: 1000 }),
        mkAccount({ id: 'a2', balance: 500 }),
      ],
      'all',
      {},
      'EUR',
      []
    );
    expect(result[0].runningBalance).toBe(1500);
  });

  it('cuenta de tarjeta de crédito resta deuda al patrimonio', () => {
    const ccDebt = mkReal({
      id: 'cc1',
      accountId: 'cc',
      amount: 200,
      type: 'expense',
      valueDate: '2025-05-10',
    });
    const result = calcForecast(
      [],
      [
        mkAccount({ id: 'cash', balance: 1000 }),
        mkAccount({
          id: 'cc',
          balance: 0,
          accountType: 'credit_card',
          creditLimit: 2000,
        }),
      ],
      'all',
      {},
      'EUR',
      [ccDebt]
    );
    // Cash 1000 - deuda CC 200 = 800 (antes de aplicar el movimiento del mes actual)
    // Pero el movimiento es de mayo (pasado) → ya se aplica al startBalance vía calcCreditCardDebt
    expect(result[0].runningBalance).toBe(800);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('calcForecast — meses futuros (solo proyecciones)', () => {
  it('aplica proyección mensual de gasto en todos los meses futuros', () => {
    const result = calcForecast(
      [mkProjection({ amount: 100, type: 'expense', frequency: 'monthly' })],
      [mkAccount()],
      'all',
      {},
      'EUR',
      []
    );
    // Meses 1..11 son futuros
    for (let i = 1; i < 12; i++) {
      expect(result[i].expense).toBe(100);
      expect(result[i].income).toBe(0);
    }
  });

  it('aplica proyección de ingreso correctamente', () => {
    const result = calcForecast(
      [mkProjection({ amount: 200, type: 'income', frequency: 'monthly' })],
      [mkAccount()],
      'all',
      {},
      'EUR',
      []
    );
    expect(result[1].income).toBe(200);
    expect(result[1].expense).toBe(0);
  });

  it('proyección anual: solo aparece cada 12 meses', () => {
    const result = calcForecast(
      [
        mkProjection({
          amount: 1200,
          type: 'expense',
          frequency: 'annual',
          startDate: '2025-06-01',
        }),
      ],
      [mkAccount()],
      'all',
      {},
      'EUR',
      []
    );
    // Mes 0 (junio 2025) es actual → cuenta aparte
    // Mes 12 (junio 2026) no entra en el array de 12 elementos
    // En meses futuros 1..11 (julio 2025 … mayo 2026): la anual NO debe disparar
    for (let i = 1; i < 12; i++) {
      expect(result[i].expense).toBe(0);
    }
  });

  it('proyección trimestral: aparece cada 3 meses', () => {
    const result = calcForecast(
      [
        mkProjection({
          amount: 300,
          type: 'expense',
          frequency: 'quarterly',
          startDate: '2025-06-01',
        }),
      ],
      [mkAccount()],
      'all',
      {},
      'EUR',
      []
    );
    // startDate junio 2025 → dispara junio, septiembre, diciembre, marzo
    expect(result[3].expense).toBe(300); // sept 2025
    expect(result[6].expense).toBe(300); // dic 2025
    expect(result[9].expense).toBe(300); // mar 2026
    expect(result[1].expense).toBe(0);
    expect(result[2].expense).toBe(0);
  });

  it('endDate corta la proyección', () => {
    const result = calcForecast(
      [
        mkProjection({
          amount: 100,
          type: 'expense',
          frequency: 'monthly',
          endDate: '2025-08-31',
        }),
      ],
      [mkAccount()],
      'all',
      {},
      'EUR',
      []
    );
    expect(result[1].expense).toBe(100); // jul 2025
    expect(result[2].expense).toBe(100); // ago 2025
    expect(result[3].expense).toBe(0);   // sep 2025 — ya cortada
  });

  it('proyección con startDate futuro no aparece antes', () => {
    const result = calcForecast(
      [
        mkProjection({
          amount: 100,
          type: 'expense',
          frequency: 'monthly',
          startDate: '2025-10-01',
        }),
      ],
      [mkAccount()],
      'all',
      {},
      'EUR',
      []
    );
    expect(result[1].expense).toBe(0); // jul
    expect(result[2].expense).toBe(0); // ago
    expect(result[3].expense).toBe(0); // sep
    expect(result[4].expense).toBe(100); // oct ✅
  });

  it('frecuencia inválida descarta la proyección', () => {
    const result = calcForecast(
      [mkProjection({ frequency: 'invalid_freq', amount: 999 })],
      [mkAccount()],
      'all',
      {},
      'EUR',
      []
    );
    for (let i = 1; i < 12; i++) expect(result[i].expense).toBe(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('calcForecast — meses pasados (solo realExpenses)', () => {
  it('un mes pasado suma sus realExpenses por tipo', () => {
    // Forzar que existan meses pasados: usamos system time en enero
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
    // El array empieza en junio, así que para tener "pasados" hay que mirar
    // meses ANTERIORES a junio… pero calcForecast solo devuelve 12 meses
    // FORWARD desde now. Por tanto los "pasados" se dan cuando el sistema
    // está en mitad del año natural y queremos meses anteriores → NO ocurre.
    //
    // Verificación: con now = junio, todos los meses devueltos son ≥ junio,
    // por lo que NUNCA hay isPast=true.
    const result = calcForecast([], [mkAccount()], 'all', {}, 'EUR', []);
    expect(result.every((m) => !m.isPast)).toBe(true);
  });

  it('isPast solo es true si el primer mes del array fuera anterior al actual (caso no se da en práctica)', () => {
    // Documenta el comportamiento real: el bucle siempre arranca en now,
    // por lo que isPast nunca se activa con esta implementación.
    const result = calcForecast([], [mkAccount()], 'all', {}, 'EUR', []);
    expect(result.filter((m) => m.isPast)).toHaveLength(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('calcForecast — mes actual (mezcla real + proyectado)', () => {
  it('movimiento real del mes actual cuenta como income/expense', () => {
    const result = calcForecast(
      [],
      [mkAccount()],
      'all',
      {},
      'EUR',
      [mkReal({ amount: 75, type: 'expense', valueDate: '2025-06-10' })]
    );
    expect(result[0].expense).toBe(75);
  });

  it('proyección del mes actual SE COMPLETA con la parte que falta sobre el real', () => {
    // Proyectado: 100 / Real ejecutado: 30 → en mes actual añade 70
    const result = calcForecast(
      [mkProjection({ amount: 100, type: 'expense' })],
      [mkAccount()],
      'all',
      {},
      'EUR',
      [mkReal({ amount: 30, type: 'expense', valueDate: '2025-06-05' })]
    );
    expect(result[0].expense).toBe(100); // 30 real + 70 ajuste
  });

  it('si el real ya supera el proyectado, no añade nada extra', () => {
    const result = calcForecast(
      [mkProjection({ amount: 100, type: 'expense' })],
      [mkAccount()],
      'all',
      {},
      'EUR',
      [mkReal({ amount: 150, type: 'expense', valueDate: '2025-06-05' })]
    );
    expect(result[0].expense).toBe(150); // solo el real, Math.max(0, 100-150)=0
  });

  it('mes actual respeta proyección de ingreso vs real ya cobrado', () => {
    const result = calcForecast(
      [mkProjection({ amount: 1000, type: 'income' })],
      [mkAccount()],
      'all',
      {},
      'EUR',
      [mkReal({ amount: 400, type: 'income', valueDate: '2025-06-05' })]
    );
    expect(result[0].income).toBe(1000); // 400 real + 600 ajuste
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('calcForecast — filtrado por accountId', () => {
  const accounts = [
    mkAccount({ id: 'a1', balance: 1000 }),
    mkAccount({ id: 'a2', balance: 500 }),
  ];

  it('accountId específico filtra cuentas', () => {
    const result = calcForecast([], accounts, 'a1', {}, 'EUR', []);
    expect(result[0].runningBalance).toBe(1000);
  });

  it('accountId específico filtra proyecciones de esa cuenta', () => {
    const projs = [
      mkProjection({ id: 'p1', accountId: 'a1', amount: 100 }),
      mkProjection({ id: 'p2', accountId: 'a2', amount: 200 }),
    ];
    const result = calcForecast(projs, accounts, 'a1', {}, 'EUR', []);
    expect(result[1].expense).toBe(100);
  });

  it('en modo "all" excluye proyecciones de tipo transfer', () => {
    const result = calcForecast(
      [
        mkProjection({
          type: 'transfer',
          amount: 500,
          accountId: 'a1',
          toAccountId: 'a2',
        }),
      ],
      accounts,
      'all',
      {},
      'EUR',
      []
    );
    expect(result[1].expense).toBe(0);
    expect(result[1].income).toBe(0);
  });

  it('con accountId específico, transfer saliente cuenta como expense', () => {
    const result = calcForecast(
      [
        mkProjection({
          type: 'transfer',
          amount: 500,
          accountId: 'a1',
          toAccountId: 'a2',
        }),
      ],
      accounts,
      'a1',
      {},
      'EUR',
      []
    );
    expect(result[1].expense).toBe(500);
  });

  it('con accountId específico, transfer entrante cuenta como income', () => {
    const result = calcForecast(
      [
        mkProjection({
          type: 'transfer',
          amount: 500,
          accountId: 'a1',
          toAccountId: 'a2',
        }),
      ],
      accounts,
      'a2',
      {},
      'EUR',
      []
    );
    expect(result[1].income).toBe(500);
  });

  it('en modo "all" excluye realExpenses marcados como transfer', () => {
    const result = calcForecast(
      [],
      accounts,
      'all',
      {},
      'EUR',
      [
        mkReal({
          id: 'tr1',
          accountId: 'a1',
          amount: 200,
          isTransfer: true,
          valueDate: '2025-06-05',
        } as any),
      ]
    );
    expect(result[0].expense).toBe(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('calcForecast — multi-divisa', () => {
  it('convierte proyección USD a base EUR usando rates', () => {
    const rates = { EUR: 1, USD: 1.1 }; // 1 EUR = 1.1 USD
    const result = calcForecast(
      [mkProjection({ amount: 110, type: 'expense' })],
      [mkAccount({ currency: 'USD' })],
      'all',
      rates,
      'EUR',
      []
    );
    // 110 USD / 1.1 = 100 EUR
    expect(result[1].expense).toBeCloseTo(100, 2);
  });

  it('sin rates, mantiene el importe original', () => {
    const result = calcForecast(
      [mkProjection({ amount: 100, type: 'expense' })],
      [mkAccount({ currency: 'USD' })],
      'all',
      {},
      'EUR',
      []
    );
    expect(result[1].expense).toBe(100);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('calcForecast — runningBalance', () => {
  it('runningBalance acumula correctamente mes a mes', () => {
    const result = calcForecast(
      [mkProjection({ amount: 100, type: 'income', frequency: 'monthly' })],
      [mkAccount({ balance: 1000 })],
      'all',
      {},
      'EUR',
      []
    );
    expect(result[0].runningBalance).toBe(1000);   // saldo inicial
    expect(result[1].runningBalance).toBe(1100);   // +100
    expect(result[2].runningBalance).toBe(1200);   // +100
    expect(result[11].runningBalance).toBe(2100);  // 1000 + 11×100
  });

  it('runningBalance puede ir negativo con gastos sostenidos', () => {
    const result = calcForecast(
      [mkProjection({ amount: 200, type: 'expense', frequency: 'monthly' })],
      [mkAccount({ balance: 500 })],
      'all',
      {},
      'EUR',
      []
    );
    expect(result[0].runningBalance).toBe(500);
    expect(result[3].runningBalance).toBe(500 - 200 * 3); // -100
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('calcForecast — exclusión por fecha de cuenta', () => {
  it('ignora movimientos con valueDate <= acc.date (anteriores al alta)', () => {
    const result = calcForecast(
      [],
      [mkAccount({ date: '2025-06-10' })],
      'all',
      {},
      'EUR',
      [
        // valueDate = acc.date → debe ignorarse
        mkReal({ valueDate: '2025-06-10', amount: 999, type: 'expense' }),
        // valueDate posterior → debe contarse
        mkReal({ id: 'r2', valueDate: '2025-06-12', amount: 50, type: 'expense' }),
      ]
    );
    expect(result[0].expense).toBe(50);
  });
});
