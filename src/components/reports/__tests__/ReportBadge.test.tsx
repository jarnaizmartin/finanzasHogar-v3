import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReportBadge } from '../ReportBadge';

const T = {
  green: '#16a34a', greenBg: '#dcfce7', greenBorder: '#86efac',
  red: '#dc2626', redBg: '#fee2e2', redBorder: '#fca5a5',
  amber: '#d97706', amberBg: '#fef3c7', amberBorder: '#fcd34d',
};

describe('ReportBadge', () => {
  describe('Render por variante', () => {
    it('renderiza el children como texto visible', () => {
      render(<ReportBadge T={T} variant="success">✅ OK</ReportBadge>);
      expect(screen.getByText('✅ OK')).toBeInTheDocument();
    });

    it('aplica colores verdes en variant="success"', () => {
      render(<ReportBadge T={T} variant="success">OK</ReportBadge>);
      const span = screen.getByText('OK');
      expect(span).toHaveStyle({ color: T.green, background: T.greenBg });
    });

    it('aplica colores rojos en variant="danger"', () => {
      render(<ReportBadge T={T} variant="danger">Error</ReportBadge>);
      const span = screen.getByText('Error');
      expect(span).toHaveStyle({ color: T.red, background: T.redBg });
    });

    it('aplica colores ámbar en variant="warning"', () => {
      render(<ReportBadge T={T} variant="warning">Aviso</ReportBadge>);
      const span = screen.getByText('Aviso');
      expect(span).toHaveStyle({ color: T.amber, background: T.amberBg });
    });
  });

  describe('Children', () => {
    it('acepta texto plano', () => {
      render(<ReportBadge T={T} variant="success">Texto plano</ReportBadge>);
      expect(screen.getByText('Texto plano')).toBeInTheDocument();
    });

    it('acepta JSX como children', () => {
      render(
        <ReportBadge T={T} variant="success">
          <strong data-testid="inner">Bold</strong>
        </ReportBadge>
      );
      expect(screen.getByTestId('inner')).toBeInTheDocument();
    });
  });

  describe('Estilos base', () => {
    it('aplica forma de pill (borderRadius alto)', () => {
      render(<ReportBadge T={T} variant="success">X</ReportBadge>);
      const span = screen.getByText('X');
      expect(span).toHaveStyle({ borderRadius: '9999px' });
    });
  });
});
