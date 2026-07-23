import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSecurityContext } from '../useSecurityContext';
import { useApp } from '../AppContext';
import { useToast } from '../contexts/ToastContext';
import { Modal } from '../components/UI';
import { Check } from 'lucide-react';
import { verifyTOTP } from '../lib/crypto';
import {
  TOTP_GRACE_OPTIONS,
  TOTP_GRACE_DEFAULT_MS,
  INACTIVITY_OPTIONS,
  saveTotpLastUnlock,
} from '../securityUtils';
import type { AuthMethod } from '../types';

export function SecuritySettingsPanel({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const {
    security,
    updateInactivity,
    updateTotpGrace,
    updateEmail,
    sendCode,
    verifyCode,
    setupSecurity,
    unlock,
  } = useSecurityContext();

  const { T } = useApp();
  const toast = useToast();

  // ── Estado ajustes básicos ────────────────────────────────────────────────
  const [inactivityMs, setInactivityMs] = useState(security.inactivityMs);
  const [totpGraceMs, setTotpGraceMs] = useState(security.totpGraceMs ?? TOTP_GRACE_DEFAULT_MS);

  // ── Estado email ──────────────────────────────────────────────────────────
  const [emailInput, setEmailInput] = useState(security.email ?? '');
  const [emailStep, setEmailStep] = useState<'idle' | 'verifying'>('idle');
  const [emailCode, setEmailCode] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [resendWait, setResendWait] = useState(0);

  // ── Estado cambio de método ───────────────────────────────────────────────
  const [changeStep, setChangeStep] = useState<
    null | 'verify' | 'choose' | 'new-password' | 'new-totp'
  >(null);

  const [verifyInput, setVerifyInput] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [newAuthMethod, setNewAuthMethod] = useState<AuthMethod>('password');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);

  const [newTotpSecret] = useState<string>(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array).map((b) => chars[b % 32]).join('');
  });
  const [newTotpCode, setNewTotpCode] = useState('');
  const [newTotpVerified, setNewTotpVerified] = useState(false);
  const [newTotpError, setNewTotpError] = useState<string | null>(null);
  const [newTotpVerifying, setNewTotpVerifying] = useState(false);
  const [newTotpCopied, setNewTotpCopied] = useState(false);
  const [newTotpGraceMs, setNewTotpGraceMs] = useState(TOTP_GRACE_DEFAULT_MS);

  // ── Reset estado de cambio ────────────────────────────────────────────────
  // Declarada ANTES del efecto de teclado que la invoca (Escape).
  const resetChangeState = () => {
    setVerifyInput('');
    setVerifyError(null);
    setNewPassword('');
    setNewPassword2('');
    setNewPasswordError(null);
    setNewTotpCode('');
    setNewTotpVerified(false);
    setNewTotpError(null);
    setNewTotpCopied(false);
    setNewTotpGraceMs(TOTP_GRACE_DEFAULT_MS);
  };

  // ── Timers ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (resendWait <= 0) return;
    const t = setTimeout(() => setResendWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [resendWait]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (changeStep) { setChangeStep(null); resetChangeState(); }
        else onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, changeStep]);

  // ── Estilos ───────────────────────────────────────────────────────────────
  const sectionStyle: React.CSSProperties = {
    padding: '1.25rem',
    borderRadius: '1rem',
    background: T.pageBg,
    border: `1px solid ${T.cardBorder}`,
    marginBottom: '1rem',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.68rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: T.muted,
    marginBottom: '0.5rem',
    display: 'block',
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.65rem 0.875rem',
    borderRadius: '0.75rem',
    border: `1.5px solid ${T.inputBorder}`,
    background: T.inputBg,
    color: T.inputText,
    fontSize: '0.875rem',
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box' as const,
    marginBottom: '0.75rem',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.65rem 0.875rem',
    borderRadius: '0.75rem',
    border: `1.5px solid ${T.inputBorder}`,
    background: T.inputBg,
    color: T.inputText,
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
    marginBottom: '0.75rem',
  };

  const saveBtnStyle: React.CSSProperties = {
    padding: '0.6rem 1.25rem',
    borderRadius: '0.75rem',
    border: 'none',
    background: T.accent,
    color: '#ffffff',
    fontSize: '0.825rem',
    fontWeight: 700,
    cursor: 'pointer',
  };

  const errorStyle: React.CSSProperties = {
    padding: '0.625rem 0.875rem',
    borderRadius: '0.625rem',
    background: T.redBg,
    border: `1px solid ${T.redBorder}`,
    color: T.red,
    fontSize: '0.775rem',
    marginBottom: '0.75rem',
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSaveInactivity = () => {
    updateInactivity(inactivityMs);
    toast(t('security.settings.inactivitySaved'), 'success');
  };

  const handleSaveGrace = () => {
    updateTotpGrace(totpGraceMs);
    toast(t('security.settings.graceSaved'), 'success');
  };

  const handleSendEmailCode = async () => {
    if (!emailInput.trim()) { setEmailError(t('security.settings.emailSendError')); return; }
    setEmailLoading(true);
    setEmailError(null);
    const result = await sendCode(emailInput.trim());
    setEmailLoading(false);
    if (result.ok) { setEmailStep('verifying'); setResendWait(60); }
    else setEmailError(result.error ?? t('security.settings.emailSendError'));
  };

  const handleVerifyEmailCode = () => {
    const result = verifyCode(emailCode.trim());
    if (result.ok) {
      updateEmail(emailInput.trim());
      setEmailStep('idle');
      setEmailError(null);
      toast(t('security.settings.emailUpdated'), 'success');
    } else {
      setEmailError(result.error ?? t('security.settings.emailCodeError'));
    }
  };

  const handleVerifyCurrent = async () => {
    if (!verifyInput.trim()) { setVerifyError(t('security.settings.enterCurrentCredential')); return; }
    if (security.authMethod === 'password') {
      const ok = await unlock(verifyInput.trim());
      if (ok) { setChangeStep('choose'); setVerifyError(null); }
      else setVerifyError(t('security.settings.wrongPassword'));
      return;
    }
    if (security.authMethod === 'totp') {
      setVerifyLoading(true);
      try {
        const ok = await verifyTOTP(security.totpSecret ?? '', verifyInput.trim());
        if (ok) { setChangeStep('choose'); setVerifyError(null); }
        else setVerifyError(t('security.settings.wrongTotp'));
      } catch {
        setVerifyError(t('security.settings.verifyGenericError'));
      } finally {
        setVerifyLoading(false);
      }
    }
  };

  const handleVerifyNewTotp = async () => {
    if (newTotpVerifying) return;
    setNewTotpVerifying(true);
    setNewTotpError(null);
    try {
      const ok = await verifyTOTP(newTotpSecret, newTotpCode);
      if (ok) setNewTotpVerified(true);
      else setNewTotpError(t('security.settings.totpWrongCode'));
    } catch {
      setNewTotpError(t('security.settings.verifyError'));
    } finally {
      setNewTotpVerifying(false);
    }
  };

  const handleSaveMethodChange = () => {
    if (newAuthMethod === 'password') {
      if (newPassword.length < 8) { setNewPasswordError(t('security.settings.passwordTooShort')); return; }
      if (newPassword !== newPassword2) { setNewPasswordError(t('security.settings.passwordsMismatch')); return; }
    }
    setupSecurity({
      authMethod: newAuthMethod,
      password: newAuthMethod === 'password' ? newPassword : undefined,
      totpSecret: newAuthMethod === 'totp' ? newTotpSecret : undefined,
      totpGraceMs: newAuthMethod === 'totp' ? newTotpGraceMs : undefined,
      phrase: '',
      email: security.email ?? undefined,
      forcePhraseHash: security.phraseHash ?? undefined,
      forcePhraseSalt: security.phraseSalt ?? undefined,
    });
    if (newAuthMethod === 'totp') saveTotpLastUnlock();
    toast(newAuthMethod === 'password' ? t('security.changeMethod.methodChangedPassword') : t('security.changeMethod.methodChangedTotp'), 'success');
    setChangeStep(null);
    resetChangeState();
  };

  // ── Panel de cambio de método ─────────────────────────────────────────────
  if (changeStep) {
    return (
      <Modal
        title={t('security.changeMethod.title')}
        subtitle={
          changeStep === 'verify' ? t('security.changeMethod.verifySubtitle')
          : changeStep === 'choose' ? t('security.changeMethod.chooseSubtitle')
          : changeStep === 'new-password' ? t('security.changeMethod.newPasswordSubtitle')
          : t('security.changeMethod.newTotpSubtitle')
        }
        onClose={() => { setChangeStep(null); resetChangeState(); }}
        T={T}
      >
        {/* PASO 1: Verificar método actual */}
        {changeStep === 'verify' && (
          <div>
            <div style={{ padding: '0.875rem 1rem', borderRadius: '0.875rem', background: T.accentLight, border: `1px solid ${T.accent}33`, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{security.authMethod === 'totp' ? '📱' : '🔑'}</span>
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: T.accent }}>
                  {security.authMethod === 'totp' ? t('security.changeMethod.currentMethodTotp') : t('security.changeMethod.currentMethodPassword')}
                </div>
                <div style={{ fontSize: '0.72rem', color: T.muted, marginTop: '0.1rem' }}>
                  {security.authMethod === 'totp' ? t('security.changeMethod.totpHint') : t('security.changeMethod.passwordHint')}
                </div>
              </div>
            </div>
            <input
              type={security.authMethod === 'password' ? 'password' : 'text'}
              placeholder={security.authMethod === 'password' ? t('security.changeMethod.passwordPlaceholder') : '000000'}
              value={verifyInput}
              onChange={(e) => { const val = security.authMethod === 'totp' ? e.target.value.replace(/\D/g, '').slice(0, 6) : e.target.value; setVerifyInput(val); setVerifyError(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyCurrent()}
              maxLength={security.authMethod === 'totp' ? 6 : undefined}
              autoFocus
              style={{ ...inputStyle, ...(security.authMethod === 'totp' ? { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.3em' } : {}) }}
            />
            {verifyError && <div style={errorStyle}>⚠️ {verifyError}</div>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleVerifyCurrent} disabled={verifyLoading || !verifyInput.trim()} style={{ ...saveBtnStyle, flex: 1, opacity: verifyLoading || !verifyInput.trim() ? 0.5 : 1, cursor: verifyLoading || !verifyInput.trim() ? 'not-allowed' : 'pointer' }}>
                {verifyLoading ? t('security.verifyingBtn') : t('security.changeMethod.verifyIdentityBtn')}
              </button>
              <button onClick={() => { setChangeStep(null); resetChangeState(); }} style={{ padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: `1.5px solid ${T.cardBorder}`, background: T.btnSecBg, color: T.btnSecText, fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer' }}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: Elegir nuevo método */}
        {changeStep === 'choose' && (
          <div>
            <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', background: T.greenBg, border: `1px solid ${T.greenBorder}`, color: T.green, fontSize: '0.775rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              {t('security.changeMethod.identityVerified')}
            </div>
            {[
              { method: 'password' as AuthMethod, emoji: '🔑', title: t('security.authMethods.passwordTitle'), desc: security.authMethod === 'password' ? t('security.changeMethod.currentDesc') : t('security.changeMethod.passwordDesc') },
              { method: 'totp' as AuthMethod, emoji: '📱', title: t('security.authMethods.totpTitle'), desc: security.authMethod === 'totp' ? t('security.changeMethod.currentDesc') : t('security.changeMethod.totpDesc') },
            ].map(({ method, emoji, title, desc }) => (
              <div
                key={method}
                onClick={() => security.authMethod !== method && setNewAuthMethod(method)}
                style={{ padding: '1.25rem', borderRadius: '1rem', border: `2px solid ${newAuthMethod === method ? T.accent : T.cardBorder}`, background: newAuthMethod === method ? T.accentLight : T.pageBg, cursor: security.authMethod === method ? 'not-allowed' : 'pointer', marginBottom: '0.75rem', opacity: security.authMethod === method ? 0.5 : 1, transition: 'all 0.15s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, color: T.title, fontSize: '0.95rem' }}>{title}</div>
                    <div style={{ fontSize: '0.775rem', color: T.muted, marginTop: '0.2rem' }}>{desc}</div>
                  </div>
                  {newAuthMethod === method && security.authMethod !== method && <Check size={18} color={T.accent} style={{ flexShrink: 0 }} />}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => { if (newAuthMethod !== security.authMethod) setChangeStep(newAuthMethod === 'password' ? 'new-password' : 'new-totp'); }} disabled={newAuthMethod === security.authMethod} style={{ ...saveBtnStyle, flex: 1, opacity: newAuthMethod === security.authMethod ? 0.4 : 1, cursor: newAuthMethod === security.authMethod ? 'not-allowed' : 'pointer' }}>
                {t('security.continueBtn')}
              </button>
              <button onClick={() => { setChangeStep(null); resetChangeState(); }} style={{ padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: `1.5px solid ${T.cardBorder}`, background: T.btnSecBg, color: T.btnSecText, fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer' }}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}

        {/* PASO 3a: Nueva contraseña */}
        {changeStep === 'new-password' && (
          <div>
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <input type={showNewPassword ? 'text' : 'password'} placeholder={t('security.changeMethod.newPasswordPlaceholder')} value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setNewPasswordError(null); }} autoFocus style={{ ...inputStyle, marginBottom: 0, paddingRight: '3rem' }} />
              <button onClick={() => setShowNewPassword((s) => !s)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.muted, fontSize: '0.8rem' }}>
                {showNewPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {newPassword.length > 0 && (
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
                  {[1, 2, 3, 4].map((level) => {
                    const strength = newPassword.length >= 12 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword) ? 4
                      : newPassword.length >= 10 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 3
                      : newPassword.length >= 8 ? 2 : 1;
                    const colors = ['#dc2626', '#d97706', '#16a34a', '#2563eb'];
                    return <div key={level} style={{ flex: 1, height: '0.25rem', borderRadius: '9999px', background: level <= strength ? colors[strength - 1] : T.cardBorder, transition: 'all 0.2s' }} />;
                  })}
                </div>
                <div style={{ fontSize: '0.7rem', color: T.muted }}>
                  {newPassword.length < 8 ? t('security.passwordStrength.tooShort')
                    : newPassword.length < 10 ? t('security.passwordStrength.acceptable')
                    : newPassword.length >= 12 && /[^A-Za-z0-9]/.test(newPassword) ? t('security.passwordStrength.strong')
                    : t('security.passwordStrength.good')}
                </div>
              </div>
            )}
            <input type={showNewPassword ? 'text' : 'password'} placeholder={t('security.changeMethod.repeatPlaceholder')} value={newPassword2} onChange={(e) => { setNewPassword2(e.target.value); setNewPasswordError(null); }} style={inputStyle} />
            {newPassword2.length > 0 && newPassword !== newPassword2 && <div style={{ ...errorStyle, marginTop: '-0.5rem' }}>⚠️ {t('security.settings.passwordsMismatch')}</div>}
            {newPasswordError && <div style={errorStyle}>⚠️ {newPasswordError}</div>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleSaveMethodChange} disabled={newPassword.length < 8 || newPassword !== newPassword2} style={{ ...saveBtnStyle, flex: 1, background: T.green, opacity: newPassword.length < 8 || newPassword !== newPassword2 ? 0.5 : 1, cursor: newPassword.length < 8 || newPassword !== newPassword2 ? 'not-allowed' : 'pointer' }}>
                {t('security.changeMethod.savePasswordBtn')}
              </button>
              <button onClick={() => setChangeStep('choose')} style={{ padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: `1.5px solid ${T.cardBorder}`, background: T.btnSecBg, color: T.btnSecText, fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer' }}>
                {t('security.backBtn')}
              </button>
            </div>
          </div>
        )}

        {/* PASO 3b: Nuevo TOTP */}
        {changeStep === 'new-totp' && (() => {
          const otpauthUrl = `otpauth://totp/${encodeURIComponent('FinNort')}:${encodeURIComponent('usuario')}?secret=${newTotpSecret}&issuer=${encodeURIComponent('FinNort')}&algorithm=SHA1&digits=6&period=30`;
          return (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.875rem', background: '#ffffff', borderRadius: '1rem', border: `2px solid ${T.cardBorder}`, marginBottom: '0.75rem' }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(otpauthUrl)}`} alt="QR TOTP" width={160} height={160} style={{ display: 'block', borderRadius: '0.5rem' }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: T.muted, marginBottom: '0.5rem', textAlign: 'center' }}>{t('security.noQrHint')}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', borderRadius: '0.75rem', background: T.pageBg, border: `1.5px solid ${T.cardBorder}`, width: '100%', boxSizing: 'border-box' as const }}>
                  <code style={{ flex: 1, fontSize: '0.8rem', fontFamily: 'monospace', color: T.title, letterSpacing: '0.1em', wordBreak: 'break-all' as const }}>{newTotpSecret}</code>
                  <button onClick={() => { navigator.clipboard.writeText(newTotpSecret); setNewTotpCopied(true); setTimeout(() => setNewTotpCopied(false), 2000); }} style={{ padding: '0.3rem 0.625rem', borderRadius: '0.5rem', border: `1px solid ${T.cardBorder}`, background: newTotpCopied ? T.greenBg : T.cardBg, color: newTotpCopied ? T.green : T.muted, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                    {newTotpCopied ? t('security.secretCopiedBtn') : t('security.copySecretBtn')}
                  </button>
                </div>
              </div>

              {!newTotpVerified ? (
                <>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: T.body, marginBottom: '0.5rem' }}>{t('security.enterCode')}</div>
                  <input type="text" placeholder="000000" value={newTotpCode} onChange={(e) => { setNewTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setNewTotpError(null); }} onKeyDown={(e) => e.key === 'Enter' && handleVerifyNewTotp()} maxLength={6} autoFocus style={{ ...inputStyle, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.3em' }} />
                  {newTotpError && <div style={errorStyle}>⚠️ {newTotpError}</div>}
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={handleVerifyNewTotp} disabled={newTotpCode.length !== 6 || newTotpVerifying} style={{ ...saveBtnStyle, flex: 1, opacity: newTotpCode.length !== 6 || newTotpVerifying ? 0.5 : 1, cursor: newTotpCode.length !== 6 || newTotpVerifying ? 'not-allowed' : 'pointer' }}>
                      {newTotpVerifying ? t('security.verifyingBtn') : t('security.verifyCodeBtn')}
                    </button>
                    <button onClick={() => setChangeStep('choose')} style={{ padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: `1.5px solid ${T.cardBorder}`, background: T.btnSecBg, color: T.btnSecText, fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer' }}>{t('security.backBtn')}</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ padding: '1rem', borderRadius: '1rem', background: T.greenBg, border: `1.5px solid ${T.greenBorder}`, textAlign: 'center', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>✅</div>
                    <div style={{ fontWeight: 800, color: T.green, fontSize: '0.9rem' }}>{t('security.totpConfiguredOk')}</div>
                  </div>
                  <div style={{ padding: '1rem', borderRadius: '0.875rem', background: T.pageBg, border: `1.5px solid ${T.cardBorder}`, marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{t('security.graceFreqLabel')}</div>
                    <select value={newTotpGraceMs} onChange={(e) => setNewTotpGraceMs(Number(e.target.value))} style={selectStyle}>
                      {TOTP_GRACE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={handleSaveMethodChange} style={{ ...saveBtnStyle, flex: 1, background: T.green }}>{t('security.changeMethod.activateTotpBtn')}</button>
                    <button onClick={() => setChangeStep('choose')} style={{ padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: `1.5px solid ${T.cardBorder}`, background: T.btnSecBg, color: T.btnSecText, fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer' }}>{t('security.backBtn')}</button>
                  </div>
                </>
              )}
            </div>
          );
        })()}
      </Modal>
    );
  }

  // ── Panel principal ───────────────────────────────────────────────────────
  return (
    <Modal
      title={t('security.settings.title')}
      subtitle={t('security.settings.subtitle')}
      onClose={onClose}
      T={T}
      preventClickOutside={true}
    >
      {/* Método de autenticación */}
      <div style={sectionStyle}>
        <span style={labelStyle}>{t('security.settings.authMethodLabel')}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: T.accentLight, border: `1px solid ${T.accent}33`, marginBottom: '0.875rem' }}>
          <span style={{ fontSize: '1.25rem' }}>{security.authMethod === 'totp' ? '📱' : '🔑'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: T.accent }}>
              {security.authMethod === 'totp' ? t('security.authMethods.totpTitle') : t('security.authMethods.passwordTitle')}
            </div>
          </div>
        </div>
        <button
          onClick={() => { resetChangeState(); setNewAuthMethod(security.authMethod === 'password' ? 'totp' : 'password'); setChangeStep('verify'); }}
          style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '0.75rem', border: `1.5px solid ${T.cardBorder}`, background: T.btnSecBg, color: T.btnSecText, fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          {t('security.settings.changeMethodBtn')}
        </button>
      </div>

      {/* Frecuencia de verificación TOTP */}
      {security.authMethod === 'totp' && (
        <div style={sectionStyle}>
          <span style={labelStyle}>{t('security.settings.graceLabel')}</span>
          <p style={{ fontSize: '0.775rem', color: T.muted, marginBottom: '0.75rem', lineHeight: 1.5 }}>{t('security.settings.graceHint')}</p>
          <select value={totpGraceMs} onChange={(e) => setTotpGraceMs(Number(e.target.value))} style={selectStyle}>
            {TOTP_GRACE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <div style={{ fontSize: '0.72rem', color: T.muted, padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: T.cardBg, border: `1px solid ${T.cardBorder}`, marginBottom: '0.75rem' }}>
            {t('security.settings.currentValuePrefix')} <strong style={{ color: T.body }}>{TOTP_GRACE_OPTIONS.find((o) => o.value === security.totpGraceMs)?.label ?? t('security.notConfigured')}</strong>
          </div>
          <button onClick={handleSaveGrace} style={saveBtnStyle}>{t('security.settings.saveGraceBtn')}</button>
        </div>
      )}

      {/* Bloqueo por inactividad */}
      <div style={sectionStyle}>
        <span style={labelStyle}>{t('security.settings.inactivityLabel')}</span>
        <p style={{ fontSize: '0.775rem', color: T.muted, marginBottom: '0.75rem', lineHeight: 1.5 }}>{t('security.settings.inactivityHint')}</p>
        <select value={inactivityMs} onChange={(e) => setInactivityMs(Number(e.target.value))} style={selectStyle}>
          {INACTIVITY_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <div style={{ fontSize: '0.72rem', color: T.muted, padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: T.cardBg, border: `1px solid ${T.cardBorder}`, marginBottom: '0.75rem' }}>
          {t('security.settings.currentValuePrefix')} <strong style={{ color: T.body }}>{INACTIVITY_OPTIONS.find((o) => o.value === security.inactivityMs)?.label ?? t('security.notConfigured')}</strong>
        </div>
        <button onClick={handleSaveInactivity} style={saveBtnStyle}>{t('security.settings.saveInactivityBtn')}</button>
      </div>

      {/* Email de recuperación */}
      <div style={sectionStyle}>
        <span style={labelStyle}>{t('security.settings.emailLabel')}</span>
        <div style={{ padding: '0.625rem 0.875rem', borderRadius: '0.625rem', background: security.emailVerified ? T.greenBg : T.amberBg, border: `1px solid ${security.emailVerified ? T.greenBorder : T.amberBorder}`, fontSize: '0.775rem', color: security.emailVerified ? T.green : T.amber, fontWeight: 600, marginBottom: '0.875rem' }}>
          {security.emailVerified ? t('security.settings.emailVerified', { email: security.email }) : t('security.settings.emailNotSet')}
        </div>

        {emailStep === 'idle' && (
          <>
            <input type="email" placeholder="tu@email.com" value={emailInput} onChange={(e) => { setEmailInput(e.target.value); setEmailError(null); }} style={inputStyle} />
            {emailError && <div style={errorStyle}>⚠️ {emailError}</div>}
            <button onClick={handleSendEmailCode} disabled={emailLoading} style={{ ...saveBtnStyle, opacity: emailLoading ? 0.7 : 1 }}>
              {emailLoading ? t('security.sendingBtn') : t('security.settings.sendCodeBtn')}
            </button>
          </>
        )}

        {emailStep === 'verifying' && (
          <>
            <div style={{ padding: '0.625rem 0.875rem', borderRadius: '0.625rem', background: T.greenBg, border: `1px solid ${T.greenBorder}`, color: T.green, fontSize: '0.775rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              {t('security.settings.codeSentTo', { email: emailInput })}
            </div>
            <input type="text" placeholder="000000" value={emailCode} onChange={(e) => { setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setEmailError(null); }} maxLength={6} style={{ ...inputStyle, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.3em' }} />
            {emailError && <div style={errorStyle}>⚠️ {emailError}</div>}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={handleVerifyEmailCode} disabled={emailCode.length !== 6} style={{ ...saveBtnStyle, opacity: emailCode.length !== 6 ? 0.5 : 1, cursor: emailCode.length !== 6 ? 'not-allowed' : 'pointer' }}>
                {t('security.verifyCodeBtn')}
              </button>
              <button onClick={handleSendEmailCode} disabled={resendWait > 0 || emailLoading} style={{ padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: `1.5px solid ${T.cardBorder}`, background: T.btnSecBg, color: T.btnSecText, fontSize: '0.825rem', fontWeight: 700, cursor: resendWait > 0 ? 'not-allowed' : 'pointer', opacity: resendWait > 0 ? 0.5 : 1 }}>
                {resendWait > 0 ? t('security.settings.resendWait', { wait: resendWait }) : t('security.settings.resendBtn')}
              </button>
              <button onClick={() => { setEmailStep('idle'); setEmailError(null); setEmailCode(''); }} style={{ padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: `1.5px solid ${T.cardBorder}`, background: T.btnSecBg, color: T.btnSecText, fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer' }}>
                {t('common.cancel')}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
