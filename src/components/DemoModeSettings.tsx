// ─── DemoModeSettings.tsx ────────────────────────────────────────────────────
// Sección de Ajustes para entrar/salir/regenerar el Modo Prueba (spec 12 §5.H).
// Datos de ejemplo aislados por prefijo `fh_demo_*`: explorar sin miedo.
// ─────────────────────────────────────────────────────────────────────────────

import { useTranslation } from 'react-i18next';
import { FlaskConical } from 'lucide-react';
import type { Theme } from '../theme';
import { isDemoMode, enterDemo, exitDemo, resetDemo } from '../lib/appMode';

export function DemoModeSettings({ T }: { T: Theme }) {
  const { t } = useTranslation();
  const demo = isDemoMode();

  const btn = (bg: string, color: string, border?: string) => ({
    padding: '0.6rem 1rem',
    borderRadius: '0.75rem',
    border: border ?? 'none',
    background: bg,
    color,
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    width: '100%',
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
        <FlaskConical size={16} color={T.accent} />
        <strong style={{ color: T.body, fontSize: '0.9rem' }}>
          {t('demo.entry.settingsTitle')}
        </strong>
        {demo && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#7c3aed',
              background: 'rgba(124,58,237,0.12)',
              padding: '0.15rem 0.5rem',
              borderRadius: '0.5rem',
            }}
          >
            {t('demo.entry.active')}
          </span>
        )}
      </div>
      <p style={{ fontSize: '0.75rem', color: T.muted, lineHeight: 1.5, margin: '0 0 0.75rem' }}>
        {t('demo.entry.settingsDesc')}
      </p>

      {!demo ? (
        <button onClick={enterDemo} style={btn(T.accent, '#ffffff')}>
          {t('demo.entry.enter')}
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => {
              if (window.confirm(t('demo.resetConfirm'))) resetDemo();
            }}
            style={btn('transparent', T.body, `1.5px solid ${T.cardBorder}`)}
          >
            {t('demo.entry.reset')}
          </button>
          <button
            onClick={() => {
              if (window.confirm(t('demo.exitConfirm'))) exitDemo();
            }}
            style={btn('#7c3aed', '#ffffff')}
          >
            {t('demo.entry.exit')}
          </button>
        </div>
      )}
    </div>
  );
}
