import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrendsReport } from '../TrendsReport';

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

const mockComputeTrendsStats = vi.fn();
vi.mock('../../../lib/reportsCalc', () => ({
  computeTrendsStats: (...args: unknown[]) => mockComputeTrendsStats(...args),
}));

const baseCtx = {
  T,
  realExpenses: [],
  accounts: [],
  displayCurrency: 'EUR',
  rates: { EUR: 1 },
};

const defaultStats = {
  validExp: [
    { id: 'e1', valueDate: '2025-01-15', type: 'income',  amount: 1000, currency: 'EUR' },
    { id: 'e2', valueDate: '2025-01-20', type: 'expense', amount: 400,  currency: 'EUR' },
    { id: 'e3', valueDate: '2025-02-10', type: 'income',  amount: 1200, currency: 'EUR' },
  ],
  totalInc: 2200,
  totalExp: 400,
  net: 1800,
  savRate: 81.8,
  months: ['2025-01', '2025-02'],
};

beforeEach(() => {
  mockUseApp.mockReturnValue(baseCtx);
  mockComputeTrendsStats.mockReturnValue(defaultStats);
});

describe('TrendsReport', () => {
  describe('KPIs', () => {
    it('renderiza los 6 KPIs', () => {
      render(<TrendsReport periodKeys={['2025-01', '2025-02']} />);
      ['Ingresos totales', 'Gastos totales', 'Balance neto', 'Tasa ahorro media', 'Meses con datos', 'Movimientos']
        .forEach((l) => expect(screen.getByText(l)).toBeInTheDocument());
    });

    it('muestra el número de meses con datos', () => {
      render(<TrendsReport periodKeys={['2025-01', '2025-02']} />);
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('muestra el número de movimientos válidos', () => {
      render(<TrendsReport periodKeys={['2025-01', '2025-02']} />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('muestra la tasa de ahorro con un decimal y %', () => {
      render(<TrendsReport periodKeys={['2025-01', '2025-02']} />);
      expect(screen.getByText('81.8%')).toBeInTheDocument();
    });

    it('prefija "+" al balance neto positivo', () => {
      render(<TrendsReport periodKeys={['2025-01', '2025-02']} />);
      expect(screen.getByText('+€1800,00')).toBeInTheDocument();
    });

    it('NO prefija "+" si el balance neto es negativo', () => {
      mockComputeTrendsStats.mockReturnValue({ ...defaultStats, net: -500 });
      render(<TrendsReport periodKeys={['2025-01']} />);
      expect(screen.queryByText('+€-500,00')).not.toBeInTheDocument();
    });
  });

  describe('Tabla de resumen mensual', () => {
    it('renderiza el título de sección', () => {
      render(<TrendsReport periodKeys={['2025-01']} />);
      expect(screen.getByText('Resumen mensual histórico')).toBeInTheDocument();
    });

    it('muestra todas las cabeceras', () => {
      render(<TrendsReport periodKeys={['2025-01']} />);
      ['Mes', 'Ingresos', 'Gastos', 'Balance', 'Tasa ahorro']
        .forEach((h) => expect(screen.getByText(h)).toBeInTheDocument());
    });

    it('renderiza una fila por mes con etiqueta legible', () => {
      render(<TrendsReport periodKeys={['2025-01', '2025-02']} />);
      // "enero de 2025" / "febrero de 2025" (locale es-ES)
      expect(screen.getByText(/enero de 2025/i)).toBeInTheDocument();
      expect(screen.getByText(/febrero de 2025/i)).toBeInTheDocument();
    });

    it('renderiza tabla vacía cuando no hay meses', () => {
      mockComputeTrendsStats.mockReturnValue({
        validExp: [], totalInc: 0, totalExp: 0, net: 0, savRate: 0, months: [],
      });
      render(<TrendsReport periodKeys={[]} />);
      // Cabeceras presentes pero sin filas de meses
      expect(screen.getByText('Mes')).toBeInTheDocument();
      expect(screen.queryByText(/enero de 2025/i)).not.toBeInTheDocument();
    });
  });

  describe('Integración con computeTrendsStats', () => {
    it('llama a computeTrendsStats con los argumentos correctos', () => {
      render(<TrendsReport periodKeys={['2025-01', '2025-02']} />);
      expect(mockComputeTrendsStats).toHaveBeenCalledWith(
        baseCtx.realExpenses,
        baseCtx.accounts,
        ['2025-01', '2025-02'],
        'EUR',
        { EUR: 1 },
      );
    });
  });
});
