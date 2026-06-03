import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, X, Bell } from 'lucide-react';
import { useApp } from '../AppContext';

const SESSION_KEY = 'fh_critical_shown';

export function CriticalAlertsModal() {
  const { t } = useTranslation();
  const { T, computedAlerts, setTab } = useApp();
  const [visible, setVisible] = useState(false);

  const criticalAlerts = computedAlerts.filter(a => a.severity === 'critical');

  useEffect(() => {
    if (criticalAlerts.length === 0) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    // Delay mínimo para no bloquear el render inicial de la app
    const timerId = setTimeout(() => setVisible(true), 700);
    return () => clearTimeout(timerId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setVisible(false);
  };

  const goToAlerts = () => {
    dismiss();
    setTab('alerts');
  };

  if (!visible) return null;

  const shown = criticalAlerts.slice(0, 3);
  const remaining = criticalAlerts.length - shown.length;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onClick={dismiss}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: T.cardBg,
          border: '1.5px solid rgba(220,38,38,0.5)',
          borderRadius: T.radiusLg,
          padding: '1.75rem',
          width: '100%',
          maxWidth: '28rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.65), 0 0 80px rgba(220,38,38,0.18)',
          animation: 'fadeSlideIn 0.25s ease both',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.5rem', height: '2.5rem', borderRadius: T.radiusBtn, flexShrink: 0,
              background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={18} color="#fca5a5" />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: T.title, letterSpacing: '-0.02em' }}>
                {t('criticalAlerts.title')}
              </div>
              <div style={{ fontSize: '0.72rem', color: T.muted, marginTop: '0.2rem' }}>
                {t(criticalAlerts.length === 1 ? 'criticalAlerts.subtitle1' : 'criticalAlerts.subtitleN', { n: criticalAlerts.length })}
              </div>
            </div>
          </div>
          <button
            onClick={dismiss}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.muted, padding: '0.25rem', borderRadius: T.radiusSm, flexShrink: 0, lineHeight: 1 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Lista — máximo 3 alertas críticas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {shown.map(alert => (
            <div
              key={alert.id}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: T.radiusMd,
                background: 'rgba(220,38,38,0.07)',
                border: '1px solid rgba(220,38,38,0.18)',
              }}
            >
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#fca5a5', marginBottom: '0.2rem', lineHeight: 1.3 }}>
                {alert.title}
              </div>
              <div style={{ fontSize: '0.72rem', color: T.muted, lineHeight: 1.45 }}>
                {alert.message}
              </div>
            </div>
          ))}
          {remaining > 0 && (
            <div style={{ fontSize: '0.72rem', color: T.muted, textAlign: 'center', padding: '0.25rem 0' }}>
              {t('criticalAlerts.andMore', { n: remaining })}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          <button
            onClick={goToAlerts}
            style={{
              padding: '0.8125rem 1.5rem', borderRadius: T.radiusBtn, border: 'none',
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: '0 4px 16px rgba(220,38,38,0.35)',
            }}
          >
            <Bell size={15} />
            {t('criticalAlerts.viewAll')}
          </button>
          <button
            onClick={dismiss}
            style={{
              padding: '0.6875rem 1.5rem', borderRadius: T.radiusBtn,
              border: `1px solid ${T.cardBorder}`,
              background: T.btnSecBg, color: T.btnSecText,
              fontSize: '0.825rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            {t('criticalAlerts.dismiss')}
          </button>
        </div>
      </div>
    </div>
  );
}
