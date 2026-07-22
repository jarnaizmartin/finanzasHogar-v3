import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccountsReport } from '../AccountsReport';
import { mkAccount } from '../../../test-fixtures';
import type { Account } from '../../../types';

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

const defaultCtx = {
  T,
  accounts: [
    mkAccount({ id: 'a1', name: 'Cuenta Nómina', balance: 1000, minBalance: 500, date: '2025-01-15' }),
    mkAccount({ id: 'a2', name: 'Cuenta Ahorro', balance: 5000, minBalance: 0, date: '2025-01-10' }),
    mkAccount({ id: 'a3', name: 'Cuenta Roja', balance: 100, minBalance: 200, date: '2025-01-12' }),
  ] as Account[],
  baseCurrency: 'EUR',
  displayCurrency: 'EUR',
  rates: { EUR: 1, USD: 1.1 },
  // Record, no el objeto literal de 3 cuentas: si no, `Partial<typeof
  // defaultCtx>` obliga a cada test a repetir exactamente a1/a2/a3.
  realBalanceMap: {
    a1: { realBalance: 1200 },
    a2: { realBalance: 5500 },
    a3: { realBalance: 150 }, // por debajo de minBalance 200
  } as Record<string, { realBalance: number }>,
  dateFormat: 'dmy',
};

const setCtx = (overrides: Partial<typeof defaultCtx> = {}) => {
  mockUseApp.mockReturnValue({ ...defaultCtx, ...overrides });
};

describe('AccountsReport', () => {
  describe('KPIs', () => {
    it('muestra el número total de cuentas', () => {
      setCtx();
      render(<AccountsReport />);
      expect(screen.getByText('Total cuentas')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renderiza los 3 KPIs principales', () => {
      setCtx();
      render(<AccountsReport />);
      expect(screen.getByText('Total cuentas')).toBeInTheDocument();
      expect(screen.getByText('Patrimonio base')).toBeInTheDocument();
      expect(screen.getByText('Patrimonio real')).toBeInTheDocument();
    });

    it('muestra "0" cuando no hay cuentas', () => {
      setCtx({ accounts: [], realBalanceMap: {} });
      render(<AccountsReport />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Tabla de detalle', () => {
    it('renderiza el título de sección', () => {
      setCtx();
      render(<AccountsReport />);
      expect(screen.getByText('Detalle por cuenta')).toBeInTheDocument();
    });

    it('renderiza una fila por cuenta', () => {
      setCtx();
      render(<AccountsReport />);
      expect(screen.getByText('Cuenta Nómina')).toBeInTheDocument();
      expect(screen.getByText('Cuenta Ahorro')).toBeInTheDocument();
      expect(screen.getByText('Cuenta Roja')).toBeInTheDocument();
    });

    it('muestra todas las cabeceras de la tabla', () => {
      setCtx();
      render(<AccountsReport />);
      ['Cuenta', 'Divisa', 'Fecha saldo', 'Saldo base', 'Saldo real', 'Mínimo', 'Estado']
        .forEach((h) => expect(screen.getByText(h)).toBeInTheDocument());
    });
  });

  describe('Badge de estado', () => {
    it('muestra "✅ OK" para cuentas por encima del mínimo', () => {
      setCtx();
      render(<AccountsReport />);
      expect(screen.getAllByText('✅ OK').length).toBeGreaterThanOrEqual(2);
    });

    it('muestra "⚠️ Bajo mínimo" para cuentas por debajo del mínimo', () => {
      setCtx();
      render(<AccountsReport />);
      expect(screen.getByText('⚠️ Bajo mínimo')).toBeInTheDocument();
    });

    it('cuenta con minBalance=0 nunca aparece como "bajo mínimo"', () => {
      setCtx({
        accounts: [
          mkAccount({ id: 'x', name: 'Sin min', balance: 0, minBalance: 0, date: '2025-01-01' }),
        ],
        realBalanceMap: { x: { realBalance: 0 } },
      });
      render(<AccountsReport />);
      expect(screen.queryByText('⚠️ Bajo mínimo')).not.toBeInTheDocument();
      expect(screen.getByText('✅ OK')).toBeInTheDocument();
    });
  });

  describe('Fallback de divisa', () => {
    it('usa baseCurrency si la cuenta no tiene currency', () => {
      setCtx({
        accounts: [
          mkAccount({ id: 'x', name: 'Sin divisa', balance: 100, minBalance: 0, date: '2025-01-01', currency: undefined }),
        ],
        realBalanceMap: { x: { realBalance: 100 } },
      });
      render(<AccountsReport />);
      // EUR debe aparecer en la columna Divisa
      expect(screen.getByText('Sin divisa')).toBeInTheDocument();
      expect(screen.getAllByText('EUR').length).toBeGreaterThanOrEqual(1);
    });
  });
});
