// ─── Modal de aviso: movimiento fuera del rango calculado ───────────────────
// Extraído de RealExpenses.tsx (Fase 3, paso 4).

import { AlertTriangle } from 'lucide-react';
import { useApp } from '../../AppContext';

type Props = {
  message: string;
  onClose: () => void;
};

export function RealExpenseWarningModal({ message, onClose }: Props) {
  const { T } = useApp();

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          background: T.cardBg, border: `1px solid ${T.amberBorder}`,
          borderRadius: '1.5rem', boxShadow: T.cardShadowLg,
          width: '100%', maxWidth: '28rem', padding: '1.75rem',
        }}
      >
        <div
          style={{
            width: '3rem', height: '3rem', borderRadius: '50%',
            background: T.amberBg, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          <AlertTriangle size={20} color={T.amber} />
        </div>
        <h3 style={{
          fontSize: '1rem', fontWeight: 800, color: T.title,
          margin: '0 0 0.75rem', letterSpacing: '-0.02em',
        }}>
          ⚠️ Movimiento guardado — fuera del rango calculado
        </h3>
        <p style={{
          fontSize: '0.825rem', color: T.muted, lineHeight: 1.6,
          margin: '0 0 0.75rem', whiteSpace: 'pre-line',
        }}>
          {message}
        </p>
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '0.75rem',
          background: T.amberBg, border: `1px solid ${T.amberBorder}`,
          fontSize: '0.775rem', color: T.amber, lineHeight: 1.5,
          marginBottom: '1.25rem',
        }}>
          💡 Si quieres que este movimiento afecte al saldo calculado, edita
          la <strong>Fecha del saldo base</strong> de la cuenta a una fecha
          anterior a la del movimiento.
        </div>
        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '0.75rem', borderRadius: '0.875rem',
            border: 'none', background: T.amber, color: '#fff',
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
          }}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
