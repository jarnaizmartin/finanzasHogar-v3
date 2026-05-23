import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Polyfill IntersectionObserver (no existe en JSDOM)
class IOStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
(globalThis as any).IntersectionObserver = IOStub;

import { RealExpenses } from '../RealExpenses';

// ── Mocks de subcomponentes ──────────────────────────────────────────────
vi.mock('../../components/real/RealExpenseFiltersBar', () => ({
  RealExpenseFiltersBar: ({ filteredCount }: any) => (
    <div data-testid="filters-bar">FiltersBar count={filteredCount}</div>
  ),
}));

vi.mock('../../components/real/RealExpensesList', () => ({
  RealExpensesList: Object.assign(
    ({ filtered, totalCount, onEdit, onDelete, onAddFirst, onDismissDuplicate }: any) => (
      <div data-testid="expenses-list">
        <span>filtered={filtered.length}</span>
        <span>total={totalCount}</span>
        <button onClick={() => onEdit(filtered[0])}>edit-first</button>
        <button onClick={() => onDelete('e1')}>delete</button>
        <button onClick={onAddFirst}>add-first</button>
        <button onClick={() => onDismissDuplicate('e1')}>dismiss-dup</button>
      </div>
    ),
    { displayName: 'RealExpensesList' }
  ),
}));

vi.mock('../../components/UI', async (orig) => {
  const actual = await (orig as any)();
  return {
    ...actual,
    ConfirmModal: ({ onConfirm, onCancel }: any) => (
      <div data-testid="confirm-modal">
        <button onClick={onConfirm}>confirm-yes</button>
        <button onClick={onCancel}>confirm-no</button>
      </div>
    ),
  };
});

vi.mock('../../components/real/RealExpenseFormModal', () => ({
  RealExpenseFormModal: ({ mode, onSave, onClose }: any) => (
    <div data-testid="form-modal">
      <span>mode={mode}</span>
      <button
        onClick={() =>
          onSave({
            entryDate: '2025-01-15',
            valueDate: '2025-01-15',
            description: 'Nuevo',
            categoryId: 'cat1',
            amount: '10',
            currency: 'EUR',
            type: 'expense',
            accountId: 'acc1',
            notes: '',
          })
        }
      >
        save-modal
      </button>
      <button onClick={onClose}>close-modal</button>
    </div>
  ),
}));

// ── Mock contexto ────────────────────────────────────────────────────────
const T = {
  cardBg: '#fff', cardBorder: '#e5e7eb', title: '#111', body: '#333',
  muted: '#666', accent: '#3b82f6', accentLight: '#dbeafe',
  green: '#16a34a', red: '#dc2626',
};

const ctx: any = {
  T,
  accounts: [{ id: 'acc1', name: 'Cuenta Principal', currency: 'EUR' }],
  categories: [
    { id: 'cat1', name: 'Alimentación', type: 'expense' },
    { id: 'cat2', name: 'Salario', type: 'income' },
  ],
  realExpenses: [
    {
      id: 'e1', entryDate: '2025-01-15', valueDate: '2025-01-15',
      description: 'Gasto 1', categoryId: 'cat1', amount: 20,
      currency: 'EUR', type: 'expense', accountId: 'acc1', notes: '',
    },
    {
      id: 'e2', entryDate: '2025-01-20', valueDate: '2025-01-20',
      description: 'Ingreso 1', categoryId: 'cat2', amount: 1000,
      currency: 'EUR', type: 'income', accountId: 'acc1', notes: '',
    },
  ],
  setRealExpenses: vi.fn(),
  setAccounts: vi.fn(),
  // Filtros
  realFilterType: 'all',
  realFilterAccount: 'all',
  realFilterCategory: 'all',
  realFilterDateMode: 'preset',
  realFilterPreset: 'all',
  realFilterDateFrom: '',
  realFilterDateTo: '',
  baseCurrency: 'EUR',
  displayCurrency: 'EUR',
  rates: {},
  dateFormat: 'DMY',
};

vi.mock('../../AppContext', () => ({
  useApp: () => ctx,
}));

vi.mock('../../contexts/ToastContext', () => ({
  useToast: () => vi.fn(),
}));

// confirm para borrar
beforeEach(() => {
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  ctx.setRealExpenses.mockClear();
  ctx.realFilterType = 'all';
});

// ── Tests ────────────────────────────────────────────────────────────────
describe('RealExpenses', () => {
  describe('Render inicial', () => {
    it('renderiza el header con título', () => {
      render(<RealExpenses />);
      expect(screen.getAllByText(/Movimientos Reales/i).length).toBeGreaterThan(0);
    });

    it('renderiza la barra de filtros con el conteo filtrado', () => {
      render(<RealExpenses />);
      const bar = screen.getByTestId('filters-bar');
      expect(bar).toHaveTextContent('count=2');
    });

    it('renderiza la lista con filtered y totalCount', () => {
      render(<RealExpenses />);
      const list = screen.getByTestId('expenses-list');
      expect(list).toHaveTextContent('filtered=2');
      expect(list).toHaveTextContent('total=2');
    });

    it('NO muestra el modal al iniciar', () => {
      render(<RealExpenses />);
      expect(screen.queryByTestId('form-modal')).not.toBeInTheDocument();
    });
  });

  describe('Filtrado', () => {
    it('filtra por tipo "income"', () => {
      ctx.realFilterType = 'income';
      render(<RealExpenses />);
      expect(screen.getByTestId('expenses-list')).toHaveTextContent('filtered=1');
    });

    it('filtra por tipo "expense"', () => {
      ctx.realFilterType = 'expense';
      render(<RealExpenses />);
      expect(screen.getByTestId('expenses-list')).toHaveTextContent('filtered=1');
    });

    it('totalCount siempre refleja todos los movimientos', () => {
      ctx.realFilterType = 'income';
      render(<RealExpenses />);
      expect(screen.getByTestId('expenses-list')).toHaveTextContent('total=2');
    });
  });

  describe('Apertura del modal', () => {
    it('al pulsar "Nuevo movimiento" se abre el modal en modo add', () => {
      render(<RealExpenses />);
      fireEvent.click(screen.getByRole('button', { name: /Nuevo movimiento/i }));
      const modal = screen.getByTestId('form-modal');
      expect(modal).toHaveTextContent('mode=add');
    });

    it('al pulsar "add-first" desde la lista abre el modal en modo add', () => {
      render(<RealExpenses />);
      fireEvent.click(screen.getByText('add-first'));
      expect(screen.getByTestId('form-modal')).toHaveTextContent('mode=add');
    });

    it('al pulsar editar desde la lista abre el modal en modo edit', () => {
      render(<RealExpenses />);
      fireEvent.click(screen.getByText('edit-first'));
      expect(screen.getByTestId('form-modal')).toHaveTextContent('mode=edit');
    });
  });

  describe('Acciones del modal', () => {
    it('al guardar en modo add, llama a setRealExpenses', () => {
      render(<RealExpenses />);
      fireEvent.click(screen.getByRole('button', { name: /Nuevo movimiento/i }));
      fireEvent.click(screen.getByText('save-modal'));
      expect(ctx.setRealExpenses).toHaveBeenCalled();
    });

    it('al guardar en modo edit, llama a setRealExpenses', () => {
      render(<RealExpenses />);
      fireEvent.click(screen.getByText('edit-first'));
      fireEvent.click(screen.getByText('save-modal'));
      expect(ctx.setRealExpenses).toHaveBeenCalled();
    });

    it('tras guardar, el modal se cierra', () => {
      render(<RealExpenses />);
      fireEvent.click(screen.getByRole('button', { name: /Nuevo movimiento/i }));
      fireEvent.click(screen.getByText('save-modal'));
      expect(screen.queryByTestId('form-modal')).not.toBeInTheDocument();
    });

    it('al pulsar close en el modal, se cierra sin guardar', () => {
      render(<RealExpenses />);
      fireEvent.click(screen.getByRole('button', { name: /Nuevo movimiento/i }));
      fireEvent.click(screen.getByText('close-modal'));
      expect(screen.queryByTestId('form-modal')).not.toBeInTheDocument();
      expect(ctx.setRealExpenses).not.toHaveBeenCalled();
    });
  });

  describe('Borrado', () => {
    it('al pulsar borrar abre el modal de confirmación (sin tocar estado)', () => {
      render(<RealExpenses />);
      fireEvent.click(screen.getByText('delete'));
      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
      expect(ctx.setRealExpenses).not.toHaveBeenCalled();
    });

    it('al confirmar, llama a setRealExpenses y setAccounts y cierra el modal', () => {
      render(<RealExpenses />);
      fireEvent.click(screen.getByText('delete'));
      fireEvent.click(screen.getByText('confirm-yes'));
      expect(ctx.setRealExpenses).toHaveBeenCalled();
      expect(ctx.setAccounts).toHaveBeenCalled();
      expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
    });

    it('al cancelar, NO toca estado y cierra el modal', () => {
      render(<RealExpenses />);
      fireEvent.click(screen.getByText('delete'));
      fireEvent.click(screen.getByText('confirm-no'));
      expect(ctx.setRealExpenses).not.toHaveBeenCalled();
      expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
    });
  });

  describe('Dismiss duplicado', () => {
    it('llama a setRealExpenses al descartar', () => {
      render(<RealExpenses />);
      fireEvent.click(screen.getByText('dismiss-dup'));
      expect(ctx.setRealExpenses).toHaveBeenCalled();
    });
  });
});
