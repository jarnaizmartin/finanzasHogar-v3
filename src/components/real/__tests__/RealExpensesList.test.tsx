import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RealExpensesList } from '../RealExpensesList';
import type { RealExpense } from '../../../types';

// ── Mocks ────────────────────────────────────────────────────────────────
const T = {
  cardBg: '#fff', cardBorder: '#e5e7eb', title: '#111', body: '#333', muted: '#666',
  green: '#16a34a', red: '#dc2626',
  accent: '#3b82f6', accentLight: '#dbeafe',
};

vi.mock('../../../AppContext', () => ({
  useApp: () => ({
    T,
    accounts: [
      { id: 'acc1', name: 'Cuenta Principal', currency: 'EUR' },
      { id: 'acc2', name: 'Cuenta Ahorros', currency: 'EUR' },
    ],
    categories: [
      { id: 'cat1', name: 'Alimentación', color: '#ff0000', type: 'expense' },
      { id: 'cat2', name: 'Salario', color: '#00ff00', type: 'income' },
    ],
    displayCurrency: 'EUR',
    rates: { EUR: 1, USD: 1.1 },
    dateFormat: 'dmy',
  }),
}));

// Mocks ligeros de UI para no arrastrar dependencias
vi.mock('../../UI', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  GhostBtn: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  Badge: ({ type }: any) => <span data-testid="badge">{type}</span>,
  PrimaryBtn: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

// ── Helpers ──────────────────────────────────────────────────────────────
const makeExpense = (overrides: Partial<RealExpense> = {}): RealExpense => ({
  id: 'e1',
  entryDate: '2025-01-15',
  valueDate: '2025-01-15',
  description: 'Compra super',
  categoryId: 'cat1',
  amount: 42.5,
  currency: 'EUR',
  type: 'expense',
  accountId: 'acc1',
  notes: '',
  ...overrides,
});

const defaultProps = {
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onDismissDuplicate: vi.fn(),
  onAddFirst: vi.fn(),
};

// ── Tests ────────────────────────────────────────────────────────────────
describe('RealExpensesList', () => {
  describe('Empty states', () => {
    it('muestra empty state inicial cuando no hay movimientos en total', () => {
      render(
        <RealExpensesList
          {...defaultProps}
          filtered={[]}
          totalCount={0}
        />
      );
      expect(
        screen.getByText(/Todavía no tienes movimientos registrados/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Registrar primer movimiento/i })
      ).toBeInTheDocument();
    });

    it('muestra empty state de filtros cuando hay movimientos pero filtrados vacíos', () => {
      render(
        <RealExpensesList
          {...defaultProps}
          filtered={[]}
          totalCount={5}
        />
      );
      expect(
        screen.getByText(/No hay movimientos con estos filtros/i)
      ).toBeInTheDocument();
      // No debe mostrar el botón de añadir primero
      expect(
        screen.queryByRole('button', { name: /Registrar primer movimiento/i })
      ).not.toBeInTheDocument();
    });

    it('llama a onAddFirst al pulsar el botón de empty state', () => {
      const onAddFirst = vi.fn();
      render(
        <RealExpensesList
          {...defaultProps}
          onAddFirst={onAddFirst}
          filtered={[]}
          totalCount={0}
        />
      );
      fireEvent.click(
        screen.getByRole('button', { name: /Registrar primer movimiento/i })
      );
      expect(onAddFirst).toHaveBeenCalledTimes(1);
    });
  });

  describe('Render de movimientos', () => {
    it('renderiza la descripción, categoría y cuenta de cada movimiento', () => {
      render(
        <RealExpensesList
          {...defaultProps}
          filtered={[makeExpense()]}
          totalCount={1}
        />
      );
      expect(screen.getByText('Compra super')).toBeInTheDocument();
      expect(screen.getByText(/Alimentación/)).toBeInTheDocument();
      expect(screen.getByText(/Cuenta Principal/)).toBeInTheDocument();
    });

    it('renderiza varios movimientos', () => {
      const expenses = [
        makeExpense({ id: 'e1', description: 'Gasto 1' }),
        makeExpense({ id: 'e2', description: 'Gasto 2' }),
        makeExpense({ id: 'e3', description: 'Gasto 3' }),
      ];
      render(
        <RealExpensesList
          {...defaultProps}
          filtered={expenses}
          totalCount={3}
        />
      );
      expect(screen.getAllByTestId('card')).toHaveLength(3);
    });

    it('formatea ingresos con signo +', () => {
      render(
        <RealExpensesList
          {...defaultProps}
          filtered={[makeExpense({ type: 'income', categoryId: 'cat2', amount: 1500 })]}
          totalCount={1}
        />
      );
      expect(screen.getByText(/\+/)).toBeInTheDocument();
      expect(screen.getByText(/1500,00/)).toBeInTheDocument();
    });

    it('formatea gastos con signo -', () => {
      render(
        <RealExpensesList
          {...defaultProps}
          filtered={[makeExpense({ amount: 42.5 })]}
          totalCount={1}
        />
      );
      expect(screen.getByText(/-/)).toBeInTheDocument();
      expect(screen.getByText(/42,50/)).toBeInTheDocument();
    });

    it('muestra el badge "Transferencia" si isTransfer=true', () => {
      render(
        <RealExpensesList
          {...defaultProps}
          filtered={[makeExpense({ isTransfer: true })]}
          totalCount={1}
        />
      );
      expect(screen.getAllByText(/Transferencia/).length).toBeGreaterThan(0);
      expect(screen.getByText(/Gestionar en Transferencias/)).toBeInTheDocument();
    });

    it('muestra chip "Recurrente" si las notas lo indican', () => {
      render(
        <RealExpensesList
          {...defaultProps}
          filtered={[makeExpense({ notes: 'Generado recurrente mensual' })]}
          totalCount={1}
        />
      );
      expect(screen.getByText(/Recurrente/)).toBeInTheDocument();
    });

    it('muestra chip "Posible duplicado" cuando isDuplicateWarning y no revisado', () => {
      render(
        <RealExpensesList
          {...defaultProps}
          filtered={[makeExpense({ isDuplicateWarning: true, duplicateReviewed: false })]}
          totalCount={1}
        />
      );
      expect(screen.getByText(/Posible duplicado/)).toBeInTheDocument();
    });

    it('NO muestra chip duplicado si ya está revisado', () => {
      render(
        <RealExpensesList
          {...defaultProps}
          filtered={[makeExpense({ isDuplicateWarning: true, duplicateReviewed: true })]}
          totalCount={1}
        />
      );
      expect(screen.queryByText(/Posible duplicado/)).not.toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('llama a onEdit con el movimiento al pulsar editar', () => {
      const onEdit = vi.fn();
      const exp = makeExpense();
      render(
        <RealExpensesList
          {...defaultProps}
          onEdit={onEdit}
          filtered={[exp]}
          totalCount={1}
        />
      );
      // 2 botones: editar y borrar (en ese orden)
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);
      expect(onEdit).toHaveBeenCalledWith(exp);
    });

    it('llama a onDelete con el id al pulsar borrar', () => {
      const onDelete = vi.fn();
      const exp = makeExpense({ id: 'abc' });
      render(
        <RealExpensesList
          {...defaultProps}
          onDelete={onDelete}
          filtered={[exp]}
          totalCount={1}
        />
      );
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[1]);
      expect(onDelete).toHaveBeenCalledWith('abc');
    });

    it('llama a onDismissDuplicate al hacer clic en el chip de duplicado', () => {
      const onDismissDuplicate = vi.fn();
      render(
        <RealExpensesList
          {...defaultProps}
          onDismissDuplicate={onDismissDuplicate}
          filtered={[makeExpense({ id: 'dup1', isDuplicateWarning: true })]}
          totalCount={1}
        />
      );
      fireEvent.click(screen.getByText(/Posible duplicado/));
      expect(onDismissDuplicate).toHaveBeenCalledWith('dup1');
    });

    it('NO muestra botones de editar/borrar en transferencias', () => {
      render(
        <RealExpensesList
          {...defaultProps}
          filtered={[makeExpense({ isTransfer: true })]}
          totalCount={1}
        />
      );
      // Solo debería existir el texto, no botones de acción
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });
  });

  describe('forwardRef', () => {
    it('pasa el ref al contenedor raíz', () => {
      const ref = { current: null as HTMLDivElement | null };
      render(
        <RealExpensesList
          {...defaultProps}
          ref={ref}
          filtered={[makeExpense()]}
          totalCount={1}
        />
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});
