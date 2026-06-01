import { useTranslation } from 'react-i18next';
import {
  bodyStyle,
  titleStyle,
  subtitleStyle,
  inputStyle,
  btnPrimaryStyle,
  btnSecondaryStyle,
  errorStyle,
} from './constants';

interface Props {
  email: string;
  onEmailChange: (value: string) => void;
  emailSent: boolean;
  emailLoading: boolean;
  onSendEmail: () => void;
  emailCode: string;
  onEmailCodeChange: (value: string) => void;
  onVerifyEmail: () => void;
  resendWait: number;
  emailError: string | null;
  emailVerified: boolean;
  onSkip: () => void;
  onContinue: () => void;
  onBack: () => void;
}

export function Step5EmailVerification({
  email,
  onEmailChange,
  emailSent,
  emailLoading,
  onSendEmail,
  emailCode,
  onEmailCodeChange,
  onVerifyEmail,
  resendWait,
  emailError,
  emailVerified,
  onSkip,
  onContinue,
  onBack,
}: Props) {
  const { t } = useTranslation();
  return (
    <div style={bodyStyle}>
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📧</div>
      <h2 style={titleStyle}>{t('security.step5.title')}</h2>
      <p style={subtitleStyle}>{t('security.step5.subtitle')}</p>

      {!emailVerified ? (
        <>
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            disabled={emailSent}
            style={{ ...inputStyle, opacity: emailSent ? 0.6 : 1 }}
          />

          {!emailSent ? (
            <button
              onClick={onSendEmail}
              disabled={emailLoading || !email.trim()}
              style={{
                ...btnSecondaryStyle,
                marginTop: 0,
                marginBottom: '0.75rem',
                opacity: emailLoading || !email.trim() ? 0.5 : 1,
                cursor: emailLoading || !email.trim() ? 'not-allowed' : 'pointer',
                color: '#2563eb',
                borderColor: '#bfdbfe',
                background: '#eff6ff',
              }}
            >
              {emailLoading ? t('security.sendingBtn') : t('security.step5.sendBtn')}
            </button>
          ) : (
            <>
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#16a34a',
                  fontSize: '0.8rem',
                  marginBottom: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {t('security.step5.codeSentTo', { email })}
              </div>
              <input
                type="text"
                placeholder={t('security.step5.codePlaceholder')}
                value={emailCode}
                onChange={(e) => onEmailCodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                style={{
                  ...inputStyle,
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  letterSpacing: '0.3em',
                }}
              />
              <button
                onClick={onVerifyEmail}
                disabled={emailCode.length !== 6}
                style={{
                  ...btnSecondaryStyle,
                  marginTop: 0,
                  marginBottom: '0.5rem',
                  opacity: emailCode.length !== 6 ? 0.5 : 1,
                  cursor: emailCode.length !== 6 ? 'not-allowed' : 'pointer',
                  color: '#2563eb',
                  borderColor: '#bfdbfe',
                  background: '#eff6ff',
                }}
              >
                {t('security.verifyCodeBtn')}
              </button>
              <button
                onClick={onSendEmail}
                disabled={resendWait > 0 || emailLoading}
                style={{
                  ...btnSecondaryStyle,
                  opacity: resendWait > 0 ? 0.5 : 1,
                  cursor: resendWait > 0 ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                {resendWait > 0 ? t('security.step5.resendWait', { wait: resendWait }) : t('security.step5.resendBtn')}
              </button>
            </>
          )}

          {emailError && <div style={errorStyle}>⚠️ {emailError}</div>}
          <div style={{ height: '1px', background: '#e2e8f0', margin: '1rem 0' }} />
          <button
            onClick={onSkip}
            style={{ ...btnSecondaryStyle, color: '#94a3b8', fontSize: '0.8rem' }}
          >
            {t('security.step5.skipBtn')}
          </button>
        </>
      ) : (
        <>
          <div
            style={{
              padding: '1rem',
              borderRadius: '1rem',
              background: '#f0fdf4',
              border: '1.5px solid #bbf7d0',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontWeight: 800, color: '#16a34a', marginBottom: '0.25rem' }}>
              {t('security.step5.verifiedTitle')}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#065f46' }}>{email}</div>
          </div>
          <button onClick={onContinue} style={btnPrimaryStyle}>
            {t('security.continueBtn')}
          </button>
        </>
      )}

      <button onClick={onBack} style={btnSecondaryStyle}>
        {t('security.backBtn')}
      </button>
    </div>
  );
}
