import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MovementsReport } from '../MovementsReport';

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
  categories: [
    { id: 'c1', name: 'Salario', color: '#16a34a' },
    { id: 'c2', name: 'Comida', color: '#dc2626' },
  ],
  accounts: [
    { id: 'a1', name: 'Nómina', currency: 'EUR' },
  ],
  displayCurrency: 'EUR',
  rates: { EUR: 1 },
  dateFormat: 'dmy',
};

const setCtx = () => mockUseApp.mockReturnValue(baseCtx);

const defaultTotals = {
  realIncome: 1000,
  realExpense: 400,
  realNet: 600,
  savingsRate: 60,
  pIncome: 1100,
  pExpense: 500,
};

const defaultCatRows = [
  { catId: 'c1', type: 'income' as const, projected: 1100, real: 1000 },
  { catId: 'c2', type: 'expense' as const, projected: 300, real: 400 },
];

const defaultReals = [
  {
    id: 'e1', description: 'Nómina enero', amount: 1000, currency: 'EUR',
    type: 'income' as const, categoryId: 'c1', accountId: 'a1',
    valueDate: '2025-01-15',
  },
  {
    id: 'e2', description: 'Super', amount: 400, currency: 'EUR',
    type: 'expense' as const, categoryId: 'c2', accountId: 'a1',
    valueDate: '2025-01-20',
  },
] as any;

describe('MovementsReport', () => {
  describe('KPIs', () => {
    it('renderiza los 6 KPIs', () => {
      setCtx();
      render(<MovementsReport totals={defaultTotals} catRows={defaultCatRows} periodReals={defaultReals} />);
      ['Ingresos reales', 'Gastos reales', 'Balance neto', 'Tasa de ahorro', 'Ingresos proyect.', 'Gastos proyect.']
        .forEach((l) => expect(screen.getByText(l)).toBeInTheDocument());
    });

    it('muestra la tasa de ahorro formateada con un decimal y %', () => {
      setCtx();
      render(<MovementsReport totals={defaultTotals} catRows={defaultCatRows} periodReals={defaultReals} />);
      expect(screen.getByText('60.0%')).toBeInTheDocument();
    });

    it('prefija "+" al balance neto positivo', () => {
      setCtx();
      render(<MovementsReport totals={defaultTotals} catRows={defaultCatRows} periodReals={defaultReals} />);
      expect(screen.getByText('+€600,00')).toBeInTheDocument();
    });
  });

  describe('Tabla por categoría', () => {
    it('renderiza título y subtítulo de la sección', () => {
      setCtx();
      render(<MovementsReport totals={defaultTotals} catRows={defaultCatRows} periodReals={defaultReals} />);
      expect(screen.getByText('Detalle por categoría')).toBeInTheDocument();
      expect(screen.getByText(/Comparativa entre lo proyectado/)).toBeInTheDocument();
    });

    it('muestra todas las cabeceras', () => {
      setCtx();
      render(<MovementsReport totals={defaultTotals} catRows={defaultCatRows} periodReals={defaultReals} />);
      expect(screen.getAllByText('Categoría').length).toBeGreaterThanOrEqual(1);
      ['Tipo', 'Proyectado', 'Real', 'Diferencia', '% Ejec.']
        .forEach((h) => expect(screen.getByText(h)).toBeInTheDocument());
    });

    it('renderiza una fila por catRow con nombre de categoría', () => {
      setCtx();
      render(<MovementsReport totals={defaultTotals} catRows={defaultCatRows} periodReals={defaultReals} />);
      expect(screen.getAllByText('Salario').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Comida').length).toBeGreaterThanOrEqual(1);
    });

    it('muestra badge "Ingreso" y "Gasto" según el tipo', () => {
      setCtx();
      render(<MovementsReport totals={defaultTotals} catRows={defaultCatRows} periodReals={defaultReals} />);
      expect(screen.getByText('Ingreso')).toBeInTheDocument();
      expect(screen.getByText('Gasto')).toBeInTheDocument();
    });

    it('muestra "Sin datos para el período seleccionado" si catRows está vacío', () => {
      setCtx();
      render(<MovementsReport totals={defaultTotals} catRows={[]} periodReals={[]} />);
      expect(screen.getByText('Sin datos para el período seleccionado')).toBeInTheDocument();
    });

    it('renderiza el TOTAL en el footer', () => {
      setCtx();
      render(<MovementsReport totals={defaultTotals} catRows={defaultCatRows} periodReals={defaultReals} />);
      expect(screen.getByText('TOTAL')).toBeInTheDocument();
    });
  });

  describe('Lista de movimientos', () => {
    it('renderiza la sección si hay movimientos', () => {
      setCtx();
      render(<MovementsReport totals={defaultTotals} catRows={defaultCatRows} periodReals={defaultReals} />);
      expect(screen.getByText('Movimientos reales del período')).toBeInTheDocument();
    });

    it('NO renderiza la sección si periodReals está vacío', () => {
      setCtx();
      render(<MovementsReport totals={defaultTotals} catRows={defaultCatRows} periodReals={[]} />);
      expect(screen.queryByText('Movimientos reales del período')).not.toBeInTheDocument();
    });

    it('muestra subtítulo en singular para 1 movimiento', () => {
      setCtx();
      render(<MovementsReport totals={defaultTotals} catRows={defaultCatRows} periodReals={[defaultReals[0]]} />);
      expect(screen.getByText(/1 movimiento ·/)).toBeInTheDocument();
    });

    it('muestra subtítulo en plural para >1 movimientos', () => {
      setCtx();
      render(<MovementsReport totals={defaultTotals} catRows={defaultCatRows} periodReals={defaultReals} />);
      expect(screen.getByText(/2 movimientos ·/)).toBeInTheDocument();
    });

    it('renderiza descripción de cada movimiento', () => {
      setCtx();
      render(<MovementsReport totals={defaultTotals} catRows={defaultCatRows} periodReals={defaultReals} />);
      expect(screen.getByText('Nómina enero')).toBeInTheDocument();
      expect(screen.getByText('Super')).toBeInTheDocument();
    });

    it('muestra cabeceras de la tabla de movimientos', () => {
      setCtx();
      render(<MovementsReport totals={defaultTotals} catRows={defaultCatRows} periodReals={defaultReals} />);
      ['Fecha valor', 'Descripción', 'Cuenta', 'Importe']
        .forEach((h) => expect(screen.getByText(h)).toBeInTheDocument());
    });
  });
});
