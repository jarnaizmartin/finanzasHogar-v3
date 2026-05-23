import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RealExpenseWarningModal } from '../RealExpenseWarningModal';

// Mock de useApp — el modal solo consume T (tema)
vi.mock('../../../AppContext', () => ({
  useApp: () => ({
    T: {
      cardBg: '#fff',
      amberBorder: '#f59e0b',
      amberBg: '#fef3c7',
      amber: '#d97706',
      title: '#111',
      muted: '#666',
      cardShadowLg: '0 10px 30px rgba(0,0,0,0.1)',
    },
  }),
}));

describe('RealExpenseWarningModal', () => {
  it('renderiza el mensaje recibido por props', () => {
    render(
      <RealExpenseWarningModal
        message="Movimiento fuera de rango"
        onClose={() => {}}
      />
    );
    expect(screen.getByText(/Movimiento fuera de rango/i)).toBeInTheDocument();
  });

  it('muestra el título de aviso', () => {
    render(<RealExpenseWarningModal message="x" onClose={() => {}} />);
    expect(
      screen.getByText(/Movimiento guardado — fuera del rango calculado/i)
    ).toBeInTheDocument();
  });

  it('muestra la pista informativa con la sugerencia del saldo base', () => {
    render(<RealExpenseWarningModal message="x" onClose={() => {}} />);
    expect(screen.getByText(/Fecha del saldo base/i)).toBeInTheDocument();
  });

  it('llama a onClose al pulsar "Entendido"', () => {
    const onClose = vi.fn();
    render(<RealExpenseWarningModal message="x" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /Entendido/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('respeta saltos de línea en el mensaje (whiteSpace: pre-line)', () => {
    const msg = 'Línea 1\nLínea 2';
    render(<RealExpenseWarningModal message={msg} onClose={() => {}} />);
    const p = screen.getByText(/Línea 1/);
    expect(p).toHaveTextContent('Línea 1');
    expect(p).toHaveTextContent('Línea 2');
  });
});
