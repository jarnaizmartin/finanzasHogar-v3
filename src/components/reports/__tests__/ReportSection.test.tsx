import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReportSection } from '../ReportSection';
import { TEST_THEME as T } from '../../../test-fixtures';

describe('ReportSection', () => {
  describe('Render básico', () => {
    it('renderiza el título', () => {
      render(
        <ReportSection T={T} title="Detalle por cuenta">
          <div>contenido</div>
        </ReportSection>
      );
      expect(screen.getByText('Detalle por cuenta')).toBeInTheDocument();
    });

    it('renderiza los children', () => {
      render(
        <ReportSection T={T} title="X">
          <div data-testid="child">hola</div>
        </ReportSection>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('hola')).toBeInTheDocument();
    });

    it('aplica el color "muted" al título', () => {
      render(
        <ReportSection T={T} title="Título">
          <div />
        </ReportSection>
      );
      const titulo = screen.getByText('Título');
      expect(titulo).toHaveStyle({ color: T.muted });
    });
  });

  describe('Subtítulo', () => {
    it('NO renderiza subtítulo si no se pasa', () => {
      render(
        <ReportSection T={T} title="X">
          <div />
        </ReportSection>
      );
      // Solo debe estar el título, no hay otro texto suelto
      expect(screen.queryByText(/movimientos del período/i)).not.toBeInTheDocument();
    });

    it('renderiza subtítulo cuando se pasa', () => {
      render(
        <ReportSection T={T} title="X" subtitle="3 movimientos del período">
          <div />
        </ReportSection>
      );
      expect(screen.getByText('3 movimientos del período')).toBeInTheDocument();
    });
  });

  describe('scrollX', () => {
    it('por defecto NO envuelve children en wrapper con overflowX', () => {
      render(
        <ReportSection T={T} title="X">
          <div data-testid="child">child</div>
        </ReportSection>
      );
      const child = screen.getByTestId('child');
      const parent = child.parentElement as HTMLElement;
      expect(parent.style.overflowX).not.toBe('auto');
    });

    it('con scrollX=true envuelve children en div con overflowX:auto', () => {
      render(
        <ReportSection T={T} title="X" scrollX>
          <div data-testid="child">child</div>
        </ReportSection>
      );
      const child = screen.getByTestId('child');
      const wrapper = child.parentElement as HTMLElement;
      expect(wrapper).toHaveStyle({ overflowX: 'auto' });
    });
  });

  describe('Estilos del card', () => {
    it('aplica background y border del tema al contenedor', () => {
      const { container } = render(
        <ReportSection T={T} title="X">
          <div />
        </ReportSection>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveStyle({ background: T.cardBg });
    });
  });
});
