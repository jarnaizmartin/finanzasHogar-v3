import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReportBadge } from '../ReportBadge';
// Theme REAL: las aserciones siguen comparando contra T.green/T.redBg, así que
// el test no depende de valores concretos, pero ahora sí se entera si un token
// desaparece del tema de verdad.
import { TEST_THEME as T } from '../../../test-fixtures';

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
