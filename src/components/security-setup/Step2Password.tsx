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
import {
  getPasswordStrength,
  STRENGTH_COLORS,
} from '../../lib/securitySetupValidation';

interface Props {
  password: string;
  password2: string;
  showPassword: boolean;
  error: string | null;
  onPasswordChange: (value: string) => void;
  onPassword2Change: (value: string) => void;
  onToggleShow: () => void;
  canContinue: boolean;
  onContinue: () => void;
  onBack: () => void;
}

export function Step2Password({
  password,
  password2,
  showPassword,
  error,
  onPasswordChange,
  onPassword2Change,
  onToggleShow,
  canContinue,
  onContinue,
  onBack,
}: Props) {
  const { t } = useTranslation();
  return (
    <div style={bodyStyle}>
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔑</div>
      <h2 style={titleStyle}>{t('security.step2Password.title')}</h2>
      <p style={subtitleStyle}>{t('security.step2Password.subtitle')}</p>

      <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder={t('security.step2Password.placeholder')}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          style={{ ...inputStyle, marginBottom: 0, paddingRight: '3rem' }}
        />
        <button
          onClick={onToggleShow}
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b',
            fontSize: '0.8rem',
          }}
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>

      {password.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
            {[1, 2, 3, 4].map((level) => {
              const strength = getPasswordStrength(password);
              return (
                <div
                  key={level}
                  style={{
                    flex: 1,
                    height: '0.25rem',
                    borderRadius: '9999px',
                    background: level <= strength ? STRENGTH_COLORS[strength] : '#e2e8f0',
                    transition: 'all 0.2s',
                  }}
                />
              );
            })}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
            {password.length < 8 ? t('security.passwordStrength.tooShort')
              : password.length < 10 ? t('security.passwordStrength.acceptable')
              : password.length >= 12 && /[^A-Za-z0-9]/.test(password) ? t('security.passwordStrength.strong')
              : t('security.passwordStrength.good')}
          </div>
        </div>
      )}

      <input
        type={showPassword ? 'text' : 'password'}
        placeholder={t('security.step2Password.repeatPlaceholder')}
        value={password2}
        onChange={(e) => onPassword2Change(e.target.value)}
        style={inputStyle}
      />

      {password2.length > 0 && password !== password2 && (
        <div style={{ ...errorStyle, marginTop: '-0.5rem' }}>
          ⚠️ {t('security.step2Password.mismatch')}
        </div>
      )}
      {error && <div style={errorStyle}>⚠️ {error}</div>}

      <button
        onClick={onContinue}
        style={{
          ...btnPrimaryStyle,
          opacity: canContinue ? 1 : 0.5,
          cursor: canContinue ? 'pointer' : 'not-allowed',
        }}
      >
        {t('security.continueBtn')}
      </button>
      <button onClick={onBack} style={btnSecondaryStyle}>
        {t('security.backBtn')}
      </button>
    </div>
  );
}
