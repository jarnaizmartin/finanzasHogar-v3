import { describe, it, expect } from 'vitest';
import { buildProjectionsCsv, buildMovementsCsv } from '../reportsCsv';
import type {
  Account,
  Category,
  Projection,
  RealExpense,
} from '../../types';

const TS = { createdAt: 0, updatedAt: 0 };
const acc = (over: Partial<Account> = {}): Account => ({
  ...TS, id: 'a1', name: 'Cuenta', balance: 0, currency: 'EUR',
  date: '2024-01-01', ...over,
});
const cat = (over: Partial<Category> = {}): Category => ({
  ...TS, id: 'c1', name: 'Comida', ...over,
});
const proj = (over: Partial<Projection> = {}): Projection => ({
  ...TS, id: 'p1', name: 'Alquiler', accountId: 'a1', categoryId: 'c1',
  type: 'expense', amount: 900, frequency: 'monthly',
  startDate: '2024-01-01', endDate: '', ...over,
});
const re = (over: Partial<RealExpense> = {}): RealExpense => ({
  ...TS, id: 'r1', entryDate: '2024-06-15', valueDate: '2024-06-15',
  description: 'Compra', categoryId: 'c1', amount: 50, currency: 'EUR',
  type: 'expense', accountId: 'a1', ...over,
});

// ─── Projections CSV ─────────────────────────────────────────────────────────
describe('buildProjectionsCsv', () => {
  it('genera cabecera correcta', () => {
    const csv = buildProjectionsCsv([], [], [], 'EUR');
    const header = csv.split('\n')[0];
    expect(header).toContain('"Concepto"');
    expect(header).toContain('"Tipo"');
    expect(header).toContain('"Equiv./mes"');
    expect(header).toContain('"Fecha fin"');
  });

  it('una proyección mensual → equiv./mes = importe', () => {
    const csv = buildProjectionsCsv([proj()], [cat()], [acc()], 'EUR');
    const lines = csv.split('\n');
    expect(lines.length).toBe(2);
    expect(lines[1]).toContain('"Alquiler"');
    expect(lines[1]).toContain('"Gasto"');
    expect(lines[1]).toContain('"Comida"');
    expect(lines[1]).toContain('"900.00"');
    expect(lines[1]).toContain('"EUR"');
  });

  it('frecuencia anual → equiv./mes divide entre 12', () => {
    const p = proj({ amount: 1200, frequency: 'annual' });
    const csv = buildProjectionsCsv([p], [cat()], [acc()], 'EUR');
    expect(csv).toContain('"100.00"');
  });

  it('ingreso → "Ingreso"', () => {
    const csv = buildProjectionsCsv([proj({ type: 'income' })], [cat()], [acc()], 'EUR');
    expect(csv).toContain('"Ingreso"');
  });

  it('endDate vacío → "Sin fin"', () => {
    const csv = buildProjectionsCsv([proj({ endDate: '' })], [cat()], [acc()], 'EUR');
    expect(csv).toContain('"Sin fin"');
  });

  it('categoría/cuenta inexistentes → "—"', () => {
    const csv = buildProjectionsCsv([proj()], [], [], 'EUR');
    expect(csv).toContain('"—"');
  });

  it('cuenta sin currency → baseCurrency', () => {
    const csv = buildProjectionsCsv(
      [proj()],
      [cat()],
      [acc({ currency: undefined })],
      'USD'
    );
    expect(csv).toContain('"USD"');
  });

  it('escapa comillas dobles duplicándolas', () => {
    const p = proj({ name: 'Pago "especial"' });
    const csv = buildProjectionsCsv([p], [cat()], [acc()], 'EUR');
    expect(csv).toContain('"Pago ""especial"""');
  });
});

// ─── Movements CSV ───────────────────────────────────────────────────────────
describe('buildMovementsCsv', () => {
  it('genera cabecera correcta', () => {
    const csv = buildMovementsCsv([], [], []);
    const header = csv.split('\n')[0];
    expect(header).toContain('"Fecha apunte"');
    expect(header).toContain('"Fecha valor"');
    expect(header).toContain('"Notas"');
  });

  it('gasto → importe negativo', () => {
    const csv = buildMovementsCsv(
      [re({ type: 'expense', amount: 50 })],
      [cat()],
      [acc()]
    );
    expect(csv).toContain('"-50"');
    expect(csv).toContain('"Gasto"');
  });

  it('ingreso → importe positivo', () => {
    const csv = buildMovementsCsv(
      [re({ type: 'income', amount: 100 })],
      [cat()],
      [acc()]
    );
    expect(csv).toContain('"100"');
    expect(csv).toContain('"Ingreso"');
  });

  it('notas vacías → string vacío', () => {
    const csv = buildMovementsCsv([re()], [cat()], [acc()]);
    const lines = csv.split('\n');
    expect(lines[1].endsWith('""')).toBe(true);
  });

  it('notas con valor se incluyen', () => {
    const csv = buildMovementsCsv(
      [re({ notes: 'mi nota' })],
      [cat()],
      [acc()]
    );
    expect(csv).toContain('"mi nota"');
  });

  it('categoría/cuenta inexistentes → "—"', () => {
    const csv = buildMovementsCsv([re()], [], []);
    expect(csv).toContain('"—"');
  });

  it('escapa comillas dobles', () => {
    const csv = buildMovementsCsv(
      [re({ description: 'Compra "test"' })],
      [cat()],
      [acc()]
    );
    expect(csv).toContain('"Compra ""test"""');
  });

  it('múltiples movimientos → múltiples líneas', () => {
    const csv = buildMovementsCsv(
      [re({ id: '1' }), re({ id: '2' }), re({ id: '3' })],
      [cat()],
      [acc()]
    );
    expect(csv.split('\n').length).toBe(4); // header + 3
  });
});
