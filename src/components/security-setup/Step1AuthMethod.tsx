import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import type { AuthMethod } from '../../types';
import {
  AUTH_METHODS,
  bodyStyle,
  titleStyle,
  subtitleStyle,
  btnPrimaryStyle,
  btnSecondaryStyle,
} from './constants';

interface Props {
  authMethod: AuthMethod;
  onSelect: (method: AuthMethod) => void;
  onContinue: () => void;
  onCancel: () => void;
}

export function Step1AuthMethod({ authMethod, onSelect, onContinue, onCancel }: Props) {
  const { t } = useTranslation();
  const methodLabels: Record<AuthMethod, { title: string; desc: string }> = {
    password: { title: t('security.authMethods.passwordTitle'), desc: t('security.authMethods.passwordDesc') },
    totp: { title: t('security.authMethods.totpTitle'), desc: t('security.authMethods.totpDesc') },
  };

  return (
    <div style={bodyStyle}>
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔐</div>
      <h2 style={titleStyle}>{t('security.step1.title')}</h2>
      <p style={subtitleStyle}>{t('security.step1.subtitle')}</p>

      {AUTH_METHODS.map(({ method, emoji }) => (
        <div
          key={method}
          onClick={() => onSelect(method)}
          style={{
            padding: '1.25rem',
            borderRadius: '1rem',
            border: `2px solid ${authMethod === method ? '#2563eb' : '#e2e8f0'}`,
            background: authMethod === method ? '#eff6ff' : '#f8fafc',
            cursor: 'pointer',
            marginBottom: '0.75rem',
            transition: 'all 0.15s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
            <div>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                {methodLabels[method].title}
              </div>
              <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.2rem' }}>
                {methodLabels[method].desc}
              </div>
            </div>
            {authMethod === method && (
              <Check size={18} color="#2563eb" style={{ marginLeft: 'auto', flexShrink: 0 }} />
            )}
          </div>
        </div>
      ))}

      <button onClick={onContinue} style={btnPrimaryStyle}>
        {t('security.continueBtn')}
      </button>
      <button
        onClick={onCancel}
        style={{
          ...btnSecondaryStyle,
          marginTop: '0.25rem',
          color: '#94a3b8',
          borderColor: 'rgba(255,255,255,0.1)',
          background: 'transparent',
          fontSize: '0.825rem',
        }}
      >
        {t('security.step1.skipBtn')}
      </button>
    </div>
  );
}
