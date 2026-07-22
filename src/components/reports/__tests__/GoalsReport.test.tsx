import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GoalsReport } from '../GoalsReport';
import { mkGoal } from '../../../test-fixtures';

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

// Fecha futura y pasada para deadlines
const futureDate = '2099-12-31';
const pastDate = '2000-01-01';

const defaultCtx = {
  T,
  goals: [
    {
      id: 'g1', name: 'Vacaciones', emoji: '🏖️', color: '#3b82f6',
      mode: 'manual', currentAmount: 500, targetAmount: 1000,
      currency: 'EUR', deadline: futureDate,
    },
    {
      id: 'g2', name: 'Coche', emoji: '🚗', color: '#16a34a',
      mode: 'manual', currentAmount: 2000, targetAmount: 2000, // completado
      currency: 'EUR', deadline: futureDate,
    },
    {
      id: 'g3', name: 'Reforma', emoji: '🔨', color: '#dc2626',
      mode: 'manual', currentAmount: 100, targetAmount: 5000, // vencido
      currency: 'EUR', deadline: pastDate,
    },
  ],
  realExpenses: [],
  displayCurrency: 'EUR',
  rates: { EUR: 1 },
  dateFormat: 'dmy',
};

const setCtx = (overrides: Partial<typeof defaultCtx> = {}) => {
  mockUseApp.mockReturnValue({ ...defaultCtx, ...overrides });
};

describe('GoalsReport', () => {
  describe('KPIs', () => {
    it('renderiza los 3 KPIs', () => {
      setCtx();
      render(<GoalsReport />);
      expect(screen.getByText('Total objetivos')).toBeInTheDocument();
      expect(screen.getByText('Completados')).toBeInTheDocument();
      expect(screen.getByText('Total objetivo')).toBeInTheDocument();
    });

    it('muestra el total de objetivos', () => {
      setCtx();
      render(<GoalsReport />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('muestra "completados / total" correctamente', () => {
      setCtx();
      render(<GoalsReport />);
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('cuando no hay objetivos muestra 0', () => {
      setCtx({ goals: [] });
      render(<GoalsReport />);
      expect(screen.getByText('0 / 0')).toBeInTheDocument();
    });
  });

  describe('Tabla de detalle', () => {
    it('renderiza el título de sección', () => {
      setCtx();
      render(<GoalsReport />);
      expect(screen.getByText('Estado de cada objetivo')).toBeInTheDocument();
    });

    it('muestra todas las cabeceras', () => {
      setCtx();
      render(<GoalsReport />);
      ['Objetivo', 'Modo', 'Ahorrado', 'Meta', '% Progreso', 'Fecha límite', 'Estado']
        .forEach((h) => expect(screen.getByText(h)).toBeInTheDocument());
    });

    it('renderiza una fila por objetivo con emoji y nombre', () => {
      setCtx();
      render(<GoalsReport />);
      expect(screen.getByText(/🏖️ Vacaciones/)).toBeInTheDocument();
      expect(screen.getByText(/🚗 Coche/)).toBeInTheDocument();
      expect(screen.getByText(/🔨 Reforma/)).toBeInTheDocument();
    });
  });

  describe('Estado de cada objetivo', () => {
    it('muestra badge "Completado" para objetivos al 100%', () => {
      setCtx();
      render(<GoalsReport />);
      expect(screen.getByText('✅ Completado')).toBeInTheDocument();
    });

    it('muestra badge "Vencido" para objetivos pasados sin completar', () => {
      setCtx();
      render(<GoalsReport />);
      expect(screen.getByText('⏰ Vencido')).toBeInTheDocument();
    });

    it('muestra badge "En progreso" para objetivos activos no completados', () => {
      setCtx();
      render(<GoalsReport />);
      expect(screen.getByText('🔄 En progreso')).toBeInTheDocument();
    });
  });

  describe('Modo del objetivo', () => {
    it('muestra "Manual" para modo manual', () => {
      setCtx();
      render(<GoalsReport />);
      expect(screen.getAllByText('✍️ Manual').length).toBe(3);
    });

    it('muestra "Auto" para modo automático', () => {
      setCtx({
        goals: [mkGoal({
          id: 'gx', name: 'AutoGoal', emoji: '⚡', color: '#000',
          mode: 'auto', currentAmount: 0, targetAmount: 100,
          currency: 'EUR', deadline: futureDate,
          categoryId: 'c1', autoType: 'income', autoStartDate: '2025-01-01',
        })],
      });
      render(<GoalsReport />);
      expect(screen.getByText('⚡ Auto')).toBeInTheDocument();
    });
  });

  describe('Deadline', () => {
    it('muestra "—" cuando no hay deadline', () => {
      setCtx({
        goals: [mkGoal({
          id: 'gx', name: 'Sin fecha', emoji: '🎯', color: '#000',
          mode: 'manual', currentAmount: 0, targetAmount: 100,
          currency: 'EUR', deadline: null,
        })],
      });
      render(<GoalsReport />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });
});
