import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectionsReport } from '../ProjectionsReport';

const T = {
  cardBg: '#fff', cardBorder: '#e5e7eb',
  title: '#111', muted: '#666', body: '#333',
  pageBg: '#fafafa', accent: '#3b82f6', accentLight: '#dbeafe',
  green: '#16a34a', greenBg: '#dcfce7', greenBorder: '#86efac',
  red: '#dc2626', redBg: '#fee2e2', redBorder: '#fca5a5',
  amber: '#d97706', amberBg: '#fef3c7', amberBorder: '#fcd34d',
  tableHead: '#f9fafb', tableBorder: '#e5e7eb',
  tableRow: '#fff', tableRowAlt: '#fafafa',
};

const mockUseApp = vi.fn();
vi.mock('../../../AppContext', () => ({
  useApp: () => mockUseApp(),
}));

const baseCtx = {
  T,
  projections: [
    {
      id: 'p1', name: 'Nómina', type: 'income',
      amount: 2000, frequency: 'monthly',
      categoryId: 'c1', accountId: 'a1',
      startDate: '2025-01-01', endDate: null,
    },
    {
      id: 'p2', name: 'Alquiler', type: 'expense',
      amount: 800, frequency: 'monthly',
      categoryId: 'c2', accountId: 'a1',
      startDate: '2025-01-01', endDate: '2025-12-31',
    },
  ],
  categories: [
    { id: 'c1', name: 'Salario', color: '#16a34a' },
    { id: 'c2', name: 'Vivienda', color: '#dc2626' },
  ],
  accounts: [
    { id: 'a1', name: 'Cuenta principal', currency: 'EUR' },
  ],
  baseCurrency: 'EUR',
  rates: { EUR: 1 },
  dateFormat: 'dmy',
};

const setCtx = (overrides: Partial<typeof baseCtx> = {}) => {
  mockUseApp.mockReturnValue({ ...baseCtx, ...overrides });
};

describe('ProjectionsReport', () => {
  describe('KPIs', () => {
    it('renderiza los 3 KPIs', () => {
      setCtx();
      render(<ProjectionsReport />);
      ['Total proyecciones', 'Ingresos mensuales', 'Gastos mensuales']
        .forEach((l) => expect(screen.getByText(l)).toBeInTheDocument());
    });

    it('muestra el total de proyecciones', () => {
      setCtx();
      render(<ProjectionsReport />);
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('muestra 0 cuando no hay proyecciones', () => {
      setCtx({ projections: [] });
      render(<ProjectionsReport />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Tabla', () => {
    it('renderiza el título de sección', () => {
      setCtx();
      render(<ProjectionsReport />);
      expect(screen.getByText('Listado completo de proyecciones')).toBeInTheDocument();
    });

    it('muestra todas las cabeceras', () => {
      setCtx();
      render(<ProjectionsReport />);
      ['Concepto', 'Tipo', 'Categoría', 'Cuenta', 'Importe', 'Frecuencia', 'Equiv./mes', 'Inicio', 'Fin']
        .forEach((h) => expect(screen.getByText(h)).toBeInTheDocument());
    });

    it('renderiza una fila por proyección con su nombre', () => {
      setCtx();
      render(<ProjectionsReport />);
      expect(screen.getByText('Nómina')).toBeInTheDocument();
      expect(screen.getByText('Alquiler')).toBeInTheDocument();
    });

    it('muestra badges "Ingreso" y "Gasto"', () => {
      setCtx();
      render(<ProjectionsReport />);
      expect(screen.getByText('Ingreso')).toBeInTheDocument();
      expect(screen.getByText('Gasto')).toBeInTheDocument();
    });

    it('muestra "Sin fin" cuando endDate es null', () => {
      setCtx();
      render(<ProjectionsReport />);
      expect(screen.getByText('Sin fin')).toBeInTheDocument();
    });

    it('muestra "—" cuando la categoría o cuenta no existen', () => {
      setCtx({
        projections: [{
          id: 'px', name: 'Huérfana', type: 'income',
          amount: 100, frequency: 'monthly',
          categoryId: 'ghost', accountId: 'ghost',
          startDate: '2025-01-01', endDate: null,
        } as any],
      });
      render(<ProjectionsReport />);
      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
    });

    it('renderiza nombres de categoría y cuenta cuando existen', () => {
      setCtx();
      render(<ProjectionsReport />);
      expect(screen.getByText('Salario')).toBeInTheDocument();
      expect(screen.getByText('Vivienda')).toBeInTheDocument();
      expect(screen.getAllByText('Cuenta principal').length).toBe(2);
    });
  });
});
