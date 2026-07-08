// ─── SecurityHintBanner.tsx ──────────────────────────────────────────────────
// Aviso SUAVE y desactivable para proteger la app con contraseña.
// Sustituye a la pantalla de seguridad forzada del arranque (O1).
// Aparece tras el primer dato real (primera cuenta), solo si no hay seguridad
// configurada y el usuario no lo ha descartado. "No volver a mostrar" = permanente.
// Ver 12_ONBOARDING_REDESIGN.md §5.F.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../AppContext';

const LS_KEY_DISMISSED = 'fh_security_hint_dismissed';

export function SecurityHintBanner({
  securityConfigured,
  onActivate,
}: {
  securityConfigured: boolean;
  onActivate: () => void;
}) {
  const { t } = useTranslation();
  const { T, accounts } = useApp();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(LS_KEY_DISMISSED) === 'true'
  );

  // Solo tras el primer dato real, sin seguridad y sin descartar.
  if (securityConfigured || dismissed || accounts.length === 0) return null;

  const dismiss = () => {
    localStorage.setItem(LS_KEY_DISMISSED, 'true');
    setDismissed(true);
  };

  return (
    <div
      style={{
        margin: '0 0 1.5rem',
        borderRadius: '1rem',
        background: T.amberBg,
        border: `1.5px solid ${T.amberBorder}`,
        overflow: 'hidden',
        animation: 'fadeSlideIn 0.4s ease both',
      }}
    >
      <div
        style={{
          padding: '0.875rem 1.125rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>🔐</span>
        <div style={{ flex: 1, minWidth: '12rem' }}>
          <div
            style={{
              fontSize: '0.825rem',
              fontWeight: 800,
              color: T.amber,
              marginBottom: '0.15rem',
            }}
          >
            {t('misc.securityHint.title')}
          </div>
          <div
            style={{
              fontSize: '0.775rem',
              color: T.amber,
              opacity: 0.85,
              lineHeight: 1.4,
            }}
          >
            {t('misc.securityHint.subtitle')}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexShrink: 0,
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={onActivate}
            style={{
              padding: '0.5rem 0.875rem',
              borderRadius: '0.625rem',
              border: 'none',
              background: T.amber,
              color: '#ffffff',
              fontSize: '0.775rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {t('misc.securityHint.activateBtn')}
          </button>
          <button
            onClick={dismiss}
            style={{
              padding: '0.5rem 0.875rem',
              borderRadius: '0.625rem',
              border: `1.5px solid ${T.amberBorder}`,
              background: 'transparent',
              color: T.amber,
              fontSize: '0.775rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {t('misc.securityHint.dismissBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
