import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BrandLogo } from '../components/BrandLogo';
import { useSecurityContext } from '../SecurityContext';
import { isWithinTotpGrace, TOTP_GRACE_DEFAULT_MS } from '../securityUtils';
import { hasVault } from '../lib/encryptedStorage';

export function LockScreen() {
  const { t } = useTranslation();
  const {
    security,
    unlock,
    sendCode,
    verifyCode,
    getCodeForDisplay,
    recoverWithPhrase,
    recoverWithFile,
    setPasswordDirectly,
  } = useSecurityContext();

  const [step, setStep] = useState<
    | 'unlock'
    | 'recovery'
    | 'phrase'
    | 'file'
    | 'email-send'
    | 'email-verify'
    | 'new-password'
  >('unlock');

  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phraseInput, setPhraseInput] = useState('');
  const [emailInput, setEmailInput] = useState(security.email ?? '');
  const [codeInput, setCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [resendWait, setResendWait] = useState(0);
  const [fileContent, setFileContent] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔴 FIX 1 — useEffect no puede ser async directamente
  // Solución: función interna async
  useEffect(() => {
    const checkGrace = async () => {
      if (
        security.authMethod === 'totp' &&
        isWithinTotpGrace(security.totpGraceMs ?? TOTP_GRACE_DEFAULT_MS)
      ) {
        await unlock('totp-grace');
      }
    };
    checkGrace();
  }, []);

  // Cuenta atrás reenvío
  useEffect(() => {
    if (resendWait <= 0) return;
    const timer = setTimeout(() => setResendWait((w) => w - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendWait]);

  // ── Estilos ──────────────────────────────────────────────────────────────
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background:
      'linear-gradient(135deg, #0f172a 0%, #0c3040 50%, #0e7490 100%)',
    padding: '1.5rem',
  };

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '26rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '2rem',
    padding: '2.5rem 2rem',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.03em',
    margin: '0 0 0.5rem',
    textAlign: 'center',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    color: '#93c5fd',
    textAlign: 'center',
    marginBottom: '1.75rem',
    lineHeight: 1.5,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: '0.875rem',
    border: '1.5px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.07)',
    color: '#ffffff',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '0.75rem',
  };

  const btnPrimaryStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.875rem',
    borderRadius: '0.875rem',
    border: 'none',
    background: '#0891b2',
    color: '#ffffff',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: '0.75rem',
  };

  const btnSecondaryStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.875rem',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'transparent',
    color: '#93c5fd',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '0.5rem',
  };

  const errorStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    background: 'rgba(220,38,38,0.15)',
    border: '1px solid rgba(220,38,38,0.3)',
    color: '#fca5a5',
    fontSize: '0.825rem',
    marginBottom: '0.75rem',
    lineHeight: 1.5,
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  // 🔴 FIX 2 — Eliminado verifyTOTP manual. unlock() ya lo hace internamente.
  const handleUnlock = async () => {
    if (!input.trim()) return;
    const ok = await unlock(input.trim());
    if (!ok) {
      if (security.authMethod === 'totp') {
        setError(t('lockScreen.errorTotp'));
      } else {
        setError(t('lockScreen.errorPassword'));
      }
      setInput('');
    }
  };

  const handlePhraseVerify = async () => {
    if (newPassword !== newPassword2) {
      setError(t('lockScreen.errorPasswordsMismatch'));
      return;
    }
    if (newPassword.length < 8) {
      setError(t('lockScreen.errorPasswordTooShort'));
      return;
    }
    const ok = await recoverWithPhrase(phraseInput, newPassword);
    if (!ok) setError(t('lockScreen.errorPhraseWrong'));
  };

  const handleSendCode = async () => {
    if (!emailInput.trim()) {
      setError(t('lockScreen.errorEmailRequired'));
      return;
    }
    setLoading(true);
    setError(null);
    const result = await sendCode(emailInput.trim());
    setLoading(false);
    if (result.ok) {
      setStep('email-verify');
      setResendWait(60);
    } else {
      setError(result.error ?? t('lockScreen.errorSendCode'));
    }
  };

  const handleVerifyCode = () => {
    const result = verifyCode(codeInput.trim());
    if (result.ok) {
      setStep('new-password');
      setError(null);
    } else {
      setError(result.error ?? t('lockScreen.errorCodeWrong'));
    }
  };

  // O5/O6 — saludo con el nombre local en la pantalla de contraseña.
  const userName = (() => {
    try {
      const raw = localStorage.getItem('fh_user_name');
      const v = raw ? (JSON.parse(raw) as string) : '';
      return typeof v === 'string' ? v.trim() : '';
    } catch {
      return '';
    }
  })();

  // ── Pantalla de desbloqueo ────────────────────────────────────────────────
  if (step === 'unlock') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '4rem',
                height: '4rem',
                margin: '0 auto 1rem',
                filter: 'drop-shadow(0 8px 24px rgba(8,145,178,0.4))',
              }}
            >
              <BrandLogo size={64} />
            </div>
            <h2 style={titleStyle}>
              {userName
                ? t('misc.welcomeSplash.greeting', { name: userName })
                : t('lockScreen.titleLocked')}
            </h2>
            <p style={subtitleStyle}>
              {security.authMethod === 'password'
                ? t('lockScreen.subtitlePassword')
                : t('lockScreen.subtitleTotp')}
            </p>
          </div>

          <input
            type={security.authMethod === 'password' ? 'password' : 'text'}
            placeholder={
              security.authMethod === 'password'
                ? t('lockScreen.placeholderPassword')
                : '000000'
            }
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            autoFocus
            style={inputStyle}
            maxLength={security.authMethod === 'totp' ? 6 : undefined}
          />

          {error && <div style={errorStyle}>⚠️ {error}</div>}
          <button onClick={handleUnlock} style={btnPrimaryStyle}>
            {t('lockScreen.btnUnlock')}
          </button>

          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '1rem',
              marginTop: '0.5rem',
            }}
          >
            <p
              style={{
                fontSize: '0.75rem',
                color: '#64748b',
                textAlign: 'center',
                marginBottom: '0.75rem',
              }}
            >
              {t('lockScreen.troubleAccess')}
            </p>
            <button
              onClick={() => {
                setStep('phrase');
                setError(null);
              }}
              style={btnSecondaryStyle}
            >
              {t('lockScreen.btnUsePhrase')}
            </button>
            <button
              onClick={() => {
                setStep('file');
                setFileError(null);
                setFileContent('');
              }}
              style={btnSecondaryStyle}
            >
              {t('lockScreen.btnUseFile')}
            </button>
            {/* F4.1 UX — solo mostrar si hay email Y NO hay datos cifrados.
            Si hay VMK envuelta, el flujo email no puede cambiar el password
            (haría falta la frase para reenvolver la VMK), así que ocultamos
            el botón en vez de llevar al usuario a un callejón sin salida. */}
            {security.email && !hasVault() && (
              <button
                onClick={() => {
                  setStep('email-send');
                }}
              >
                {t('lockScreen.btnRecoverEmail')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Frase de recuperación ─────────────────────────────────────────────────
  if (step === 'phrase') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2 style={titleStyle}>{t('lockScreen.titlePhrase')}</h2>
          <p style={subtitleStyle}>
            {t('lockScreen.subtitlePhrase')}
          </p>

          <textarea
            placeholder="palabra1 palabra2 palabra3 ... palabra12"
            value={phraseInput}
            onChange={(e) => {
              setPhraseInput(e.target.value);
              setError(null);
            }}
            style={{
              ...inputStyle,
              height: '6rem',
              resize: 'vertical',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
            }}
          />

          {phraseInput.trim().split(/\s+/).filter(Boolean).length > 0 && (
            <div
              style={{
                fontSize: '0.72rem',
                color: '#93c5fd',
                marginBottom: '0.75rem',
              }}
            >
              {t('lockScreen.wordsCount', { n: phraseInput.trim().split(/\s+/).filter(Boolean).length })}
            </div>
          )}

          {phraseInput.trim().split(/\s+/).filter(Boolean).length === 12 && (
            <>
              <input
                type="password"
                placeholder={t('lockScreen.placeholderNewPassword')}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError(null);
                }}
                style={inputStyle}
              />
              <input
                type="password"
                placeholder={t('lockScreen.placeholderRepeatPassword')}
                value={newPassword2}
                onChange={(e) => {
                  setNewPassword2(e.target.value);
                  setError(null);
                }}
                style={inputStyle}
              />
            </>
          )}

          {error && <div style={errorStyle}>⚠️ {error}</div>}

          <button
            onClick={handlePhraseVerify}
            disabled={
              phraseInput.trim().split(/\s+/).filter(Boolean).length !== 12
            }
            style={{
              ...btnPrimaryStyle,
              opacity:
                phraseInput.trim().split(/\s+/).filter(Boolean).length !== 12
                  ? 0.5
                  : 1,
              cursor:
                phraseInput.trim().split(/\s+/).filter(Boolean).length !== 12
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            {t('lockScreen.btnRecoverAccess')}
          </button>
          <button
            onClick={() => {
              setStep('unlock');
              setError(null);
            }}
            style={btnSecondaryStyle}
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  // ── Fichero de recuperación ───────────────────────────────────────────────
  if (step === 'file') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2 style={titleStyle}>{t('lockScreen.titleFile')}</h2>
          <p style={subtitleStyle}>
            {t('lockScreen.subtitleFile')}
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                const content = ev.target?.result as string;
                try {
                  const parsed = JSON.parse(content);
                  if (parsed.type !== 'fh-recovery') {
                    setFileError(t('lockScreen.errorFileInvalid'));
                    setFileContent('');
                    return;
                  }
                  if (
                    !parsed.phraseHash ||
                    !parsed.phraseSalt ||
                    parsed.phraseHash !== security.phraseHash ||
                    parsed.phraseSalt !== security.phraseSalt
                  ) {
                    setFileError(t('lockScreen.errorFileMismatch'));
                    setFileContent('');
                    return;
                  }
                  setFileContent(content);
                  setFileError(null);
                } catch {
                  setFileError(t('lockScreen.errorFileUnreadable'));
                  setFileContent('');
                }
              };
              reader.onerror = () =>
                setFileError(t('lockScreen.errorFileRead'));
              reader.readAsText(file);
              e.target.value = '';
            }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              ...btnSecondaryStyle,
              color: fileContent ? '#16a34a' : '#93c5fd',
              borderColor: fileContent
                ? 'rgba(34,197,94,0.4)'
                : 'rgba(255,255,255,0.15)',
              marginBottom: '0.75rem',
            }}
          >
            {fileContent ? t('lockScreen.btnFileLoaded') : t('lockScreen.btnSelectFile')}
          </button>

          {fileContent && (
            <>
              <input
                type="password"
                placeholder={t('lockScreen.placeholderNewPassword')}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setFileError(null);
                }}
                style={inputStyle}
              />
              <input
                type="password"
                placeholder={t('lockScreen.placeholderRepeatPassword')}
                value={newPassword2}
                onChange={(e) => {
                  setNewPassword2(e.target.value);
                  setFileError(null);
                }}
                style={inputStyle}
              />
            </>
          )}

          {fileError && <div style={errorStyle}>⚠️ {fileError}</div>}

          <button
            onClick={async () => {
              if (newPassword !== newPassword2) {
                setFileError(t('lockScreen.errorPasswordsMismatch'));
                return;
              }
              if (newPassword.length < 8) {
                setFileError(t('lockScreen.errorPasswordTooShort'));
                return;
              }
              const ok = await recoverWithFile(fileContent, newPassword);
              if (!ok)
                setFileError(t('lockScreen.errorFileInvalidOrApp'));
            }}
            disabled={!fileContent}
            style={{
              ...btnPrimaryStyle,
              opacity: !fileContent ? 0.5 : 1,
              cursor: !fileContent ? 'not-allowed' : 'pointer',
            }}
          >
            {t('lockScreen.btnRecoverAccess')}
          </button>
          <button
            onClick={() => {
              setStep('unlock');
              setFileError(null);
              setFileContent('');
            }}
            style={btnSecondaryStyle}
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  // ── Email — enviar código ─────────────────────────────────────────────────
  if (step === 'email-send') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2 style={titleStyle}>{t('lockScreen.titleEmailSend')}</h2>
          <p style={subtitleStyle}>
            {t('lockScreen.subtitleEmailSend')}
          </p>
          <input
            type="email"
            placeholder={t('lockScreen.placeholderEmail')}
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              setError(null);
            }}
            style={inputStyle}
          />
          {error && <div style={errorStyle}>⚠️ {error}</div>}
          <button
            onClick={handleSendCode}
            disabled={loading}
            style={{ ...btnPrimaryStyle, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? t('lockScreen.btnSending') : t('lockScreen.btnSendCode')}
          </button>
          <button
            onClick={() => {
              setStep('unlock');
              setError(null);
            }}
            style={btnSecondaryStyle}
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  // ── Email — verificar código ──────────────────────────────────────────────
  if (step === 'email-verify') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2 style={titleStyle}>{t('lockScreen.titleVerifyCode')}</h2>
          <p style={subtitleStyle}>
            {t('lockScreen.subtitleVerifyCodeBefore')}<br />
            <strong style={{ color: '#ffffff' }}>{emailInput}</strong>
          </p>
          <p style={{ ...subtitleStyle, fontSize: '0.75rem', opacity: 0.7 }}>
            {t('lockScreen.codeValidFor')}
          </p>
          {(() => {
            const code = getCodeForDisplay();
            return code ? (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.65)',
                lineHeight: 1.6,
              }}>
                <div>{t('lockScreen.codeOnScreen')}</div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginTop: '0.4rem',
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.375rem', letterSpacing: '0.2em', color: '#ffffff', fontWeight: 700 }}>
                    {code}
                  </span>
                  <button
                    onClick={() => navigator.clipboard?.writeText(code)}
                    style={{
                      padding: '0.3rem 0.6rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                    }}
                  >
                    📋
                  </button>
                </div>
              </div>
            ) : null;
          })()}
          <input
            type="text"
            placeholder="000000"
            value={codeInput}
            onChange={(e) => {
              setCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6));
              setError(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
            autoFocus
            maxLength={6}
            style={{
              ...inputStyle,
              textAlign: 'center',
              fontSize: '1.5rem',
              letterSpacing: '0.3em',
            }}
          />
          {error && <div style={errorStyle}>⚠️ {error}</div>}
          <button
            onClick={handleVerifyCode}
            disabled={codeInput.length !== 6}
            style={{
              ...btnPrimaryStyle,
              opacity: codeInput.length !== 6 ? 0.5 : 1,
              cursor: codeInput.length !== 6 ? 'not-allowed' : 'pointer',
            }}
          >
            {t('lockScreen.btnVerifyCode')}
          </button>
          <button
            onClick={handleSendCode}
            disabled={resendWait > 0 || loading}
            style={{
              ...btnSecondaryStyle,
              opacity: resendWait > 0 ? 0.5 : 1,
              cursor: resendWait > 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {resendWait > 0
              ? t('lockScreen.resendCountdown', { n: resendWait })
              : t('lockScreen.btnResendCode')}
          </button>
          <button
            onClick={() => {
              setStep('unlock');
              setError(null);
            }}
            style={btnSecondaryStyle}
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  // ── Nueva contraseña tras email ───────────────────────────────────────────
  if (step === 'new-password') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          {/* O6 — logo en la pantalla de nueva contraseña */}
          <div style={{ width: '3.25rem', margin: '0 auto 1rem' }}>
            <BrandLogo size={52} title="FinNort" />
          </div>
          <h2 style={titleStyle}>{t('lockScreen.titleNewPassword')}</h2>
          <p style={subtitleStyle}>
            {t('lockScreen.subtitleNewPassword')}
          </p>
          <input
            type="password"
            placeholder={t('lockScreen.placeholderNewPassword')}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setError(null);
            }}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder={t('lockScreen.placeholderRepeatPassword')}
            value={newPassword2}
            onChange={(e) => {
              setNewPassword2(e.target.value);
              setError(null);
            }}
            style={inputStyle}
          />
          {error && <div style={errorStyle}>⚠️ {error}</div>}

          {/* 🔴 FIX 3 — onClick ahora es async para poder usar await unlock() */}
          <button
            onClick={async () => {
              if (newPassword !== newPassword2) {
                setError(t('lockScreen.errorPasswordsMismatch'));
                return;
              }
              if (newPassword.length < 8) {
                setError(t('lockScreen.errorPasswordTooShort'));
                return;
              }
              // F4.1 — usar setPasswordDirectly en vez del hack recoverWithPhrase('')
              const ok = await setPasswordDirectly(newPassword);
              if (!ok) {
                setError(t('lockScreen.errorCannotChangeVault'));
                return;
              }
              await unlock(newPassword);
            }}
            style={btnPrimaryStyle}
          >
            ✅ {t('common.saveNewPassword')}
          </button>
          {/* F4.1 fix UX — botón para salir si el usuario se queda atascado */}
          <button
            onClick={() => {
              setStep('unlock');
              setError(null);
              setNewPassword('');
              setNewPassword2('');
              setCodeInput('');
            }}
            style={btnSecondaryStyle}
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
