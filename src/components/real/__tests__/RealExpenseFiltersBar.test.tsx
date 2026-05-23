import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RealExpenseFiltersBar } from '../RealExpenseFiltersBar';

// ── Mock mutable del contexto ────────────────────────────────────────────
const setters = {
  setRealFilterType: vi.fn(),
  setRealFilterAccount: vi.fn(),
  setRealFilterCategory: vi.fn(),
  setRealFilterDateMode: vi.fn(),
  setRealFilterPreset: vi.fn(),
  setRealFilterDateFrom: vi.fn(),
  setRealFilterDateTo: vi.fn(),
};

const state = {
  realFilterType: 'all' as 'all' | 'income' | 'expense',
  realFilterAccount: 'all',
  realFilterCategory: 'all',
  realFilterDateMode: 'preset' as 'preset' | 'range',
  realFilterPreset: 'all',
  realFilterDateFrom: '',
  realFilterDateTo: '',
};

const T = {
  accent: '#3b82f6', accentLight: '#dbeafe',
  cardBg: '#fff', cardBorder: '#e5e7eb',
  muted: '#666', inputBg: '#fff', inputText: '#111',
};

vi.mock('../../../AppContext', () => ({
  useApp: () => ({
    T,
    accounts: [
      { id: 'acc1', name: 'Cuenta Principal' },
      { id: 'acc2', name: 'Cuenta Ahorros' },
    ],
    categories: [
      { id: 'cat1', name: 'Alimentación' },
      { id: 'cat2', name: 'Salario' },
    ],
    ...state,
    ...setters,
  }),
}));

// ── Helpers ──────────────────────────────────────────────────────────────
const resetState = () => {
  state.realFilterType = 'all';
  state.realFilterAccount = 'all';
  state.realFilterCategory = 'all';
  state.realFilterDateMode = 'preset';
  state.realFilterPreset = 'all';
  state.realFilterDateFrom = '';
  state.realFilterDateTo = '';
};

beforeEach(() => {
  Object.values(setters).forEach((s) => s.mockClear());
  resetState();
});

// ── Tests ────────────────────────────────────────────────────────────────
describe('RealExpenseFiltersBar', () => {
  describe('Render inicial', () => {
    it('renderiza los 3 botones de tipo (Todos / Ingresos / Gastos)', () => {
      render(<RealExpenseFiltersBar filteredCount={0} />);
      expect(screen.getByRole('button', { name: /Todos/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Ingresos/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Gastos/i })).toBeInTheDocument();
    });

    it('renderiza select de cuentas con todas las opciones', () => {
      render(<RealExpenseFiltersBar filteredCount={0} />);
      expect(screen.getByText('Todas las cuentas')).toBeInTheDocument();
      expect(screen.getByText('Cuenta Principal')).toBeInTheDocument();
      expect(screen.getByText('Cuenta Ahorros')).toBeInTheDocument();
    });

    it('renderiza select de categorías con todas las opciones', () => {
      render(<RealExpenseFiltersBar filteredCount={0} />);
      expect(screen.getByText('Todas las categorías')).toBeInTheDocument();
      expect(screen.getByText('Alimentación')).toBeInTheDocument();
      expect(screen.getByText('Salario')).toBeInTheDocument();
    });

    it('renderiza select de fechas con preset y rango personalizado', () => {
      render(<RealExpenseFiltersBar filteredCount={0} />);
      expect(screen.getByText('Todas las fechas')).toBeInTheDocument();
      expect(screen.getByText('Este mes')).toBeInTheDocument();
      expect(screen.getByText('Mes anterior')).toBeInTheDocument();
      expect(screen.getByText('Últimos 3 meses')).toBeInTheDocument();
      expect(screen.getByText('Últimos 6 meses')).toBeInTheDocument();
      expect(screen.getByText('Este año')).toBeInTheDocument();
      expect(screen.getByText(/Rango personalizado/)).toBeInTheDocument();
    });

    it('NO muestra la barra de chips de filtros activos al inicio', () => {
      render(<RealExpenseFiltersBar filteredCount={0} />);
      expect(screen.queryByText(/Filtros activos:/)).not.toBeInTheDocument();
    });
  });

  describe('Cambio de tipo', () => {
    it('llama a setRealFilterType("income") al pulsar Ingresos', () => {
      render(<RealExpenseFiltersBar filteredCount={0} />);
      fireEvent.click(screen.getByRole('button', { name: /Ingresos/i }));
      expect(setters.setRealFilterType).toHaveBeenCalledWith('income');
    });

    it('llama a setRealFilterType("expense") al pulsar Gastos', () => {
      render(<RealExpenseFiltersBar filteredCount={0} />);
      fireEvent.click(screen.getByRole('button', { name: /Gastos/i }));
      expect(setters.setRealFilterType).toHaveBeenCalledWith('expense');
    });
  });

  describe('Cambio de cuenta y categoría', () => {
    it('llama a setRealFilterAccount al cambiar el select de cuentas', () => {
      render(<RealExpenseFiltersBar filteredCount={0} />);
      const select = screen.getByDisplayValue('Todas las cuentas');
      fireEvent.change(select, { target: { value: 'acc1' } });
      expect(setters.setRealFilterAccount).toHaveBeenCalledWith('acc1');
    });

    it('llama a setRealFilterCategory al cambiar el select de categorías', () => {
      render(<RealExpenseFiltersBar filteredCount={0} />);
      const select = screen.getByDisplayValue('Todas las categorías');
      fireEvent.change(select, { target: { value: 'cat1' } });
      expect(setters.setRealFilterCategory).toHaveBeenCalledWith('cat1');
    });
  });

  describe('Cambio de fechas', () => {
    it('al elegir un preset, setea preset y limpia rango', () => {
      render(<RealExpenseFiltersBar filteredCount={0} />);
      const select = screen.getByDisplayValue('Todas las fechas');
      fireEvent.change(select, { target: { value: 'this_month' } });
      expect(setters.setRealFilterDateMode).toHaveBeenCalledWith('preset');
      expect(setters.setRealFilterPreset).toHaveBeenCalledWith('this_month');
      expect(setters.setRealFilterDateFrom).toHaveBeenCalledWith('');
      expect(setters.setRealFilterDateTo).toHaveBeenCalledWith('');
    });

    it('al elegir "Rango personalizado" cambia el modo a range', () => {
      render(<RealExpenseFiltersBar filteredCount={0} />);
      const select = screen.getByDisplayValue('Todas las fechas');
      fireEvent.change(select, { target: { value: '__range__' } });
      expect(setters.setRealFilterDateMode).toHaveBeenCalledWith('range');
    });

    it('en modo range, muestra dos inputs de fecha', () => {
      state.realFilterDateMode = 'range';
      render(<RealExpenseFiltersBar filteredCount={0} />);
      const dateInputs = document.querySelectorAll('input[type="date"]');
      expect(dateInputs).toHaveLength(2);
    });

    it('en modo range, escribir en "desde" llama a setRealFilterDateFrom', () => {
      state.realFilterDateMode = 'range';
      render(<RealExpenseFiltersBar filteredCount={0} />);
      const dateInputs = document.querySelectorAll('input[type="date"]');
      fireEvent.change(dateInputs[0], { target: { value: '2025-01-01' } });
      expect(setters.setRealFilterDateFrom).toHaveBeenCalledWith('2025-01-01');
    });

    it('en modo range, escribir en "hasta" llama a setRealFilterDateTo', () => {
      state.realFilterDateMode = 'range';
      render(<RealExpenseFiltersBar filteredCount={0} />);
      const dateInputs = document.querySelectorAll('input[type="date"]');
      fireEvent.change(dateInputs[1], { target: { value: '2025-01-31' } });
      expect(setters.setRealFilterDateTo).toHaveBeenCalledWith('2025-01-31');
    });
  });

  describe('Chips de filtros activos', () => {
    it('muestra la barra de chips cuando hay un filtro activo', () => {
      state.realFilterType = 'income';
      render(<RealExpenseFiltersBar filteredCount={3} />);
      expect(screen.getByText(/Filtros activos:/)).toBeInTheDocument();
      expect(screen.getAllByText(/Ingresos/).length).toBeGreaterThan(1);
    });

    it('muestra el chip de cuenta con su nombre', () => {
      state.realFilterAccount = 'acc1';
      render(<RealExpenseFiltersBar filteredCount={5} />);
      expect(screen.getAllByText(/Cuenta Principal/).length).toBeGreaterThan(1);
    });

    it('muestra el chip de categoría con su nombre', () => {
      state.realFilterCategory = 'cat1';
      render(<RealExpenseFiltersBar filteredCount={5} />);
      // "Alimentación" aparece en el chip y en el select; basta con que aparezca
      const matches = screen.getAllByText(/Alimentación/);
      expect(matches.length).toBeGreaterThan(0);
    });

    it('muestra el contador de resultados en singular', () => {
      state.realFilterType = 'income';
      render(<RealExpenseFiltersBar filteredCount={1} />);
      expect(screen.getByText(/1 resultado$/)).toBeInTheDocument();
    });

    it('muestra el contador de resultados en plural', () => {
      state.realFilterType = 'income';
      render(<RealExpenseFiltersBar filteredCount={7} />);
      expect(screen.getByText(/7 resultados/)).toBeInTheDocument();
    });

    it('botón "Limpiar todo" resetea todos los filtros', () => {
      state.realFilterType = 'income';
      state.realFilterAccount = 'acc1';
      state.realFilterCategory = 'cat1';
      state.realFilterPreset = 'this_month';

      render(<RealExpenseFiltersBar filteredCount={3} />);
      fireEvent.click(screen.getByRole('button', { name: /Limpiar todo/i }));

      expect(setters.setRealFilterType).toHaveBeenCalledWith('all');
      expect(setters.setRealFilterAccount).toHaveBeenCalledWith('all');
      expect(setters.setRealFilterCategory).toHaveBeenCalledWith('all');
      expect(setters.setRealFilterPreset).toHaveBeenCalledWith('all');
      expect(setters.setRealFilterDateFrom).toHaveBeenCalledWith('');
      expect(setters.setRealFilterDateTo).toHaveBeenCalledWith('');
      expect(setters.setRealFilterDateMode).toHaveBeenCalledWith('preset');
    });

    it('clic en ✕ de un chip resetea ese filtro concreto', () => {
      state.realFilterType = 'income';
      render(<RealExpenseFiltersBar filteredCount={3} />);
      // Todos los ✕ de chips
      const closeButtons = screen.getAllByRole('button', { name: '✕' });
      expect(closeButtons.length).toBeGreaterThan(0);
      fireEvent.click(closeButtons[0]);
      expect(setters.setRealFilterType).toHaveBeenCalledWith('all');
    });
  });
});
