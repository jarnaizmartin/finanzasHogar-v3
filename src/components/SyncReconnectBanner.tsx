// ─── Banner de reconexión del sync (§8 — UX iOS) ─────────────────────────────
//
// El token de Drive vive solo en memoria (nunca toca disco), así que al cerrar la
// app se pierde. Al reabrir se intenta reconectar en silencio; si la sesión de
// Google no persiste (típico en PWA de iOS), el silencioso falla y el sync queda
// en pausa. Este banner lo hace visible y ofrece reconectar de un toque, en vez
// de un estado ambiguo escondido en Ajustes.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../AppContext';

export function SyncReconnectBanner() {
  const { T, sync } = useApp();
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  if (!sync.needsReconnect) return null;

  const handleReconnect = async () => {
    setBusy(true);
    try {
      await sync.reconnect();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        margin: '0 0 1.5rem',
        borderRadius: '1rem',
        background: T.amberBg,
        border: `1.5px solid ${T.amberBorder}`,
        padding: '0.875rem 1.125rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
        animation: 'fadeSlideIn 0.4s ease both',
      }}
    >
      <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>☁️</span>
      <div style={{ flex: 1, minWidth: '12rem' }}>
        <div style={{ fontSize: '0.825rem', fontWeight: 800, color: T.amber, marginBottom: '0.15rem' }}>
          {t('appShell.sync.reconnectBannerTitle')}
        </div>
        <div style={{ fontSize: '0.775rem', color: T.amber, opacity: 0.85, lineHeight: 1.4 }}>
          {t('appShell.sync.reconnectBannerText')}
        </div>
      </div>
      <button
        onClick={handleReconnect}
        disabled={busy}
        style={{
          padding: '0.5rem 0.875rem',
          borderRadius: '0.625rem',
          border: 'none',
          background: T.amber,
          color: '#ffffff',
          fontSize: '0.775rem',
          fontWeight: 700,
          cursor: busy ? 'default' : 'pointer',
          opacity: busy ? 0.6 : 1,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {busy ? t('appShell.sync.connecting') : t('appShell.sync.reconnectBtn')}
      </button>
    </div>
  );
}
