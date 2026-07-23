// ─── WelcomeSplash.tsx ───────────────────────────────────────────────────────
// Portada de bienvenida personalizada (O5, spec 12 §5.J).
// "Bienvenido de nuevo, {nombre}. Tu última conexión fue el {fecha}."
// - Nombre solo-local (fh_user_name), capturado en el onboarding.
// - Se auto-desvanece a los ~2,5 s (mitiga la fricción del intersticial).
// - Desactivable en Ajustes (fh_welcome_splash_enabled, por defecto ON).
// - Actualiza fh_last_connection SIEMPRE (aunque la portada esté desactivada).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../AppContext';
import { BrandLogo } from './BrandLogo';
import { BrandWordmark } from './BrandWordmark';
import { fmtDate } from '../lib/i18nFormats';
import { isDemoMode } from '../lib/appMode';

const NAME_KEY = 'fh_user_name';
const CONN_KEY = 'fh_last_connection';
const ENABLED_KEY = 'fh_welcome_splash_enabled';

const FADE_MS = 450;
const HOLD_MS = 2500;

function readName(): string {
  try {
    const raw = localStorage.getItem(NAME_KEY);
    const v = raw ? (JSON.parse(raw) as string) : '';
    return typeof v === 'string' ? v.trim() : '';
  } catch {
    return '';
  }
}

function readPrevConnection(): number {
  try {
    const raw = localStorage.getItem(CONN_KEY);
    return raw ? (JSON.parse(raw) as number) : 0;
  } catch {
    return 0;
  }
}

function splashEnabled(): boolean {
  try {
    // Por defecto ON: solo desactivado si vale explícitamente 'false'.
    return localStorage.getItem(ENABLED_KEY) !== JSON.stringify(false);
  } catch {
    return true;
  }
}

export function WelcomeSplash() {
  const { t } = useTranslation();
  const { T } = useApp();

  // Capturamos el estado ANTES de marcar la conexión de esta sesión. Se leen en
  // render, así que son estado con inicializador perezoso (snapshot de montaje),
  // no refs — leer un ref en render dispara react-hooks/refs.
  const [name] = useState(() => readName());
  const [prevConn] = useState(() => readPrevConnection());
  const shouldShow = !isDemoMode() && splashEnabled() && name.length > 0;

  const [visible, setVisible] = useState(shouldShow);
  const [opacity, setOpacity] = useState(shouldShow ? 1 : 0);

  useEffect(() => {
    // Marca la conexión de ESTA sesión (siempre, aunque no se muestre).
    try {
      localStorage.setItem(CONN_KEY, JSON.stringify(Date.now()));
    } catch {
      /* ignore */
    }
    if (!shouldShow) return;
    const fadeTimer = setTimeout(() => setOpacity(0), HOLD_MS);
    const hideTimer = setTimeout(() => setVisible(false), HOLD_MS + FADE_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [shouldShow]);

  if (!visible) return null;

  const dismiss = () => {
    setOpacity(0);
    setTimeout(() => setVisible(false), FADE_MS);
  };

  const prev = prevConn;
  const lastLine =
    prev > 0
      ? t('misc.welcomeSplash.lastConnection', {
          date: fmtDate(new Date(prev), {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
        })
      : t('misc.welcomeSplash.firstTime');

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        background:
          'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)',
        opacity,
        transition: `opacity ${FADE_MS}ms ease`,
        cursor: 'pointer',
      }}
    >
      <BrandLogo size={72} />
      <BrandWordmark
        accent={T.accent}
        base="#ffffff"
        style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}
      />
      <div style={{ textAlign: 'center', padding: '0 1.5rem' }}>
        <div
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '0.4rem',
          }}
        >
          {t('misc.welcomeSplash.greeting', { name })}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#93c5fd' }}>{lastLine}</div>
      </div>
    </div>
  );
}
