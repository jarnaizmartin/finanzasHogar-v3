import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReportKpiGrid, type ReportKpiItem } from '../ReportKpiGrid';

const makeItem = (overrides: Partial<ReportKpiItem> = {}): ReportKpiItem => ({
  label: 'Ingresos',
  value: '€ 1.234,56',
  color: '#16a34a',
  bg: '#dcfce7',
  border: '#86efac',
  icon: '📈',
  ...overrides,
});

describe('ReportKpiGrid', () => {
  describe('Render de items', () => {
    it('renderiza un único item con label, value e icon', () => {
      const item = makeItem();
      render(<ReportKpiGrid items={[item]} />);
      expect(screen.getByText('Ingresos')).toBeInTheDocument();
      expect(screen.getByText('€ 1.234,56')).toBeInTheDocument();
      expect(screen.getByText('📈')).toBeInTheDocument();
    });

    it('renderiza múltiples items en orden', () => {
      const items = [
        makeItem({ label: 'Ingresos', value: '100', icon: '📈' }),
        makeItem({ label: 'Gastos', value: '50', icon: '📉' }),
        makeItem({ label: 'Balance', value: '50', icon: '✅' }),
      ];
      render(<ReportKpiGrid items={items} />);
      expect(screen.getByText('Ingresos')).toBeInTheDocument();
      expect(screen.getByText('Gastos')).toBeInTheDocument();
      expect(screen.getByText('Balance')).toBeInTheDocument();
      expect(screen.getByText('📈')).toBeInTheDocument();
      expect(screen.getByText('📉')).toBeInTheDocument();
      expect(screen.getByText('✅')).toBeInTheDocument();
    });

    it('renderiza lista vacía sin romperse', () => {
      const { container } = render(<ReportKpiGrid items={[]} />);
      const grid = container.firstChild as HTMLElement;
      expect(grid).toBeInTheDocument();
      expect(grid.children.length).toBe(0);
    });
  });

  describe('Estilos por item', () => {
    it('aplica color, bg y border del item al label', () => {
      const item = makeItem({
        label: 'Test',
        color: '#ff0000',
        bg: '#ffeeee',
        border: '#ffcccc',
      });
      render(<ReportKpiGrid items={[item]} />);
      const label = screen.getByText('Test');
      expect(label).toHaveStyle({ color: '#ff0000' });
    });

    it('aplica el color del item al value', () => {
      const item = makeItem({ value: '999', color: '#123456' });
      render(<ReportKpiGrid items={[item]} />);
      const value = screen.getByText('999');
      expect(value).toHaveStyle({ color: '#123456' });
    });
  });

  describe('Casos límite', () => {
    it('soporta labels duplicados (usa label como key — aceptado por contrato)', () => {
      const items = [
        makeItem({ label: 'Total', value: '1' }),
        makeItem({ label: 'Total', value: '2' }),
      ];
      render(<ReportKpiGrid items={items} />);
      expect(screen.getAllByText('Total')).toHaveLength(2);
    });

    it('renderiza values con caracteres especiales y emojis', () => {
      const item = makeItem({ value: '€ 1.234,56 ✨' });
      render(<ReportKpiGrid items={[item]} />);
      expect(screen.getByText('€ 1.234,56 ✨')).toBeInTheDocument();
    });
  });
});
