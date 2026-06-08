/// <reference types="vite-plugin-pwa/react" />
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useTranslation } from 'react-i18next';

// ─── Aviso de nueva versión (A1 — vite-plugin-pwa) ───────────────────────────
// Con registerType: 'prompt' el SW nuevo ESPERA. `useRegisterSW` registra el
// SW al montar y expone `needRefresh` cuando hay una versión nueva esperando.
// "Actualizar" → updateServiceWorker(true) activa el SW y recarga la página.
export function UpdatePrompt() {
  const { t } = useTranslation();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        // Despeja la BottomNav en móvil + safe-area del home indicator.
        bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
        width: 'calc(100% - 2rem)',
        maxWidth: '24rem',
        zIndex: 1000000,
        background: '#0f172a',
        border: '1px solid rgba(34,211,238,0.35)',
        borderRadius: '1rem',
        boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
        padding: '0.875rem 1rem',
        color: '#e2e8f0',
        animation: 'fadeSlideIn 0.4s ease both',
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#22d3ee' }}>
        {t('misc.updateBanner.title')}
      </div>
      <div
        style={{
          fontSize: '0.775rem',
          opacity: 0.85,
          lineHeight: 1.4,
          margin: '0.25rem 0 0.75rem',
        }}
      >
        {t('misc.updateBanner.subtitle')}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setNeedRefresh(false)}
          style={{
            padding: '0.5rem 0.875rem',
            borderRadius: '0.625rem',
            border: '1px solid rgba(226,232,240,0.25)',
            background: 'transparent',
            color: '#e2e8f0',
            fontSize: '0.775rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {t('misc.updateBanner.dismiss')}
        </button>
        <button
          onClick={() => updateServiceWorker(true)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.625rem',
            border: 'none',
            background: '#0891b2',
            color: '#ffffff',
            fontSize: '0.775rem',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {t('misc.updateBanner.update')}
        </button>
      </div>
    </div>
  );
}
