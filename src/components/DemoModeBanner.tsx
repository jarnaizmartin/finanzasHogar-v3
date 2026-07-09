// ─── DemoModeBanner.tsx ──────────────────────────────────────────────────────
// Banner persistente e inconfundible mientras estás en Modo Prueba (spec 12 §5.H).
// Se renderiza como tira superior dentro del header (sticky) → siempre visible.
// El botón "Ir a mis datos reales" sale del sandbox y recarga.
// ─────────────────────────────────────────────────────────────────────────────

import { useTranslation } from 'react-i18next';
import { FlaskConical } from 'lucide-react';
import { isDemoMode, exitDemo } from '../lib/appMode';

export function DemoModeBanner() {
  const { t } = useTranslation();
  if (!isDemoMode()) return null;

  return (
    <div
      role="status"
      style={{
        background: 'linear-gradient(90deg, #7c3aed, #4f46e5)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
        padding: '0.4rem 1rem',
        fontSize: '0.8rem',
        fontWeight: 700,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          minWidth: 0,
        }}
      >
        <FlaskConical size={15} style={{ flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {t('demo.banner.text')}
        </span>
      </span>
      <button
        onClick={exitDemo}
        style={{
          padding: '0.3rem 0.75rem',
          borderRadius: '0.5rem',
          border: '1.5px solid rgba(255,255,255,0.55)',
          background: 'rgba(255,255,255,0.15)',
          color: '#ffffff',
          fontSize: '0.75rem',
          fontWeight: 800,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {t('demo.banner.exit')}
      </button>
    </div>
  );
}
