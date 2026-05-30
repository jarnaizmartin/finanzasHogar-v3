import { useState, useEffect } from 'react';
import { useSecurityContext } from '../SecurityContext';
import {
  generateRecoveryPhrase,
  normalizePhrase,
  verifyTOTP,
  hashPhrase,
} from '../lib/crypto';
import CryptoJS from 'crypto-js';

import {
  TOTP_GRACE_DEFAULT_MS,
  TOTP_GRACE_OPTIONS,
  saveTotpLastUnlock,
} from '../securityUtils';

import type { AuthMethod } from '../types';
import {
  containerStyle,
  cardStyle,
  bodyStyle,
  titleStyle,
  subtitleStyle,
  inputStyle,
  btnPrimaryStyle,
  btnSecondaryStyle,
  errorStyle,
} from '../components/security-setup/constants';
import {
  getPasswordStrength,
  getPasswordStrengthLabel,
  STRENGTH_COLORS,
} from '../lib/securitySetupValidation';
import { Step1AuthMethod } from '../components/security-setup/Step1AuthMethod';
import { Step2Password } from '../components/security-setup/Step2Password';
import { Step2Totp } from '../components/security-setup/Step2Totp';
import { Step3RecoveryPhrase } from '../components/security-setup/Step3RecoveryPhrase';
import { Step4ConfirmPhrase } from '../components/security-setup/Step4ConfirmPhrase';
import { Step5EmailVerification } from '../components/security-setup/Step5EmailVerification';
import { Step6Summary } from '../components/security-setup/Step6Summary';

export function SecuritySetup({
  onComplete,
  onCancel,
}: {
  onComplete: () => void;
  onCancel: () => void;
}) {
  const { setupSecurity, sendCode, verifyCode, generateRecoveryFile } =
    useSecurityContext();

  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 6;

  const [authMethod, setAuthMethod] = useState<AuthMethod>('password');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [phrase] = useState(() => generateRecoveryPhrase());
  const [phraseConfirm, setPhraseConfirm] = useState('');
  const [phraseCopied, setPhraseCopied] = useState(false);

  const [email, setEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [resendWait, setResendWait] = useState(0);

  const [fileDownloaded, setFileDownloaded] = useState(false);
  const [pendingPhraseHash, setPendingPhraseHash] = useState<string | null>(
    null
  );
  const [pendingPhraseSalt, setPendingPhraseSalt] = useState<string | null>(
    null
  );

  const [totpSecret] = useState<string>(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map((b) => chars[b % 32])
      .join('');
  });

  const [totpCode, setTotpCode] = useState('');
  const [totpVerified, setTotpVerified] = useState(false);
  const [totpError, setTotpError] = useState<string | null>(null);
  const [totpCopied, setTotpCopied] = useState(false);
  const [totpVerifying, setTotpVerifying] = useState(false);
  const [totpGraceMs, setTotpGraceMs] = useState(TOTP_GRACE_DEFAULT_MS);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resendWait <= 0) return;
    const t = setTimeout(() => setResendWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [resendWait]);

  // ── Validaciones ──────────────────────────────────────────────────────────
  const canContinueStep2 = () => {
    if (authMethod === 'password') {
      if (password.length < 8) return false;
      if (password !== password2) return false;
    }
    if (authMethod === 'totp') {
      if (!totpVerified) return false;
    }
    return true;
  };

  const canContinueStep4 = () => {
    const typed = normalizePhrase(phraseConfirm);
    const original = normalizePhrase(phrase);
    return typed === original;
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleVerifyTotp = async () => {
    if (totpVerifying) return;
    setTotpVerifying(true);
    setTotpError(null);
    try {
      const ok = await verifyTOTP(totpSecret, totpCode);
      if (ok) {
        setTotpVerified(true);
        setTotpError(null);
      } else {
        setTotpError(
          'Código incorrecto. Comprueba que la hora de tu dispositivo es correcta.'
        );
      }
    } catch (err) {
      setTotpError('Error al verificar el código. Inténtalo de nuevo.');
    } finally {
      setTotpVerifying(false);
    }
  };

  const handleCopyPhrase = () => {
    navigator.clipboard.writeText(phrase).then(() => setPhraseCopied(true));
  };

  const handleSendEmail = async () => {
    if (!email.trim()) {
      setEmailError('Introduce tu email.');
      return;
    }
    setEmailLoading(true);
    setEmailError(null);
    const result = await sendCode(email.trim());
    setEmailLoading(false);
    if (result.ok) {
      setEmailSent(true);
      setResendWait(60);
    } else {
      setEmailError(result.error ?? 'Error al enviar el email.');
    }
  };

  const handleVerifyEmail = () => {
    const result = verifyCode(emailCode.trim());
    if (result.ok) {
      setEmailVerified(true);
      setEmailError(null);
    } else {
      setEmailError(result.error ?? 'Código incorrecto.');
    }
  };

  const handleDownloadRecoveryFile = () => {
    const phraseSalt = CryptoJS.lib.WordArray.random(16).toString();
    const phraseHash = hashPhrase(phrase, phraseSalt);

    const content = JSON.stringify({
      type: 'fh-recovery',
      version: '2.0',
      app: 'FinanzasHogar',
      createdAt: Date.now(),
      salt: CryptoJS.lib.WordArray.random(16).toString(),
      phrase,
      phraseHash,
      phraseSalt,
      authMethod,
    });

    setPendingPhraseHash(phraseHash);
    setPendingPhraseSalt(phraseSalt);

    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `FinanzasHogar_recovery_${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFileDownloaded(true);
  };

  const handleFinish = () => {
    setupSecurity({
      authMethod,
      password: authMethod === 'password' ? password : undefined,
      totpSecret: authMethod === 'totp' ? totpSecret : undefined,
      totpGraceMs: authMethod === 'totp' ? totpGraceMs : undefined,
      phrase,
      email: emailVerified ? email : undefined,
      forcePhraseHash: pendingPhraseHash ?? undefined,
      forcePhraseSalt: pendingPhraseSalt ?? undefined,
    });
    if (authMethod === 'totp') {
      saveTotpLastUnlock();
    }
    onComplete();
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ height: '4px', background: '#e2e8f0' }}>
          <div
            style={{
              height: '100%',
              background: '#2563eb',
              width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%`,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
        <div
          style={{
            padding: '0.875rem 2.25rem 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
            }}
          >
            Configuración de seguridad
          </span>
          <span
            style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}
          >
            Paso {step} de {TOTAL_STEPS}
          </span>
        </div>

        {step === 1 && (
          <Step1AuthMethod
            authMethod={authMethod}
            onSelect={setAuthMethod}
            onContinue={() => setStep(2)}
            onCancel={onCancel}
          />
        )}
        {step === 2 && authMethod === 'password' && (
          <Step2Password
            password={password}
            password2={password2}
            showPassword={showPassword}
            error={error}
            onPasswordChange={(v) => { setPassword(v); setError(null); }}
            onPassword2Change={(v) => { setPassword2(v); setError(null); }}
            onToggleShow={() => setShowPassword((s) => !s)}
            canContinue={canContinueStep2()}
            onContinue={() => canContinueStep2() ? setStep(3) : setError('Revisa los campos antes de continuar.')}
            onBack={() => setStep(1)}
          />
        )}
        {step === 2 && authMethod === 'totp' && (
          <Step2Totp
            totpSecret={totpSecret}
            totpCopied={totpCopied}
            onCopy={() => {
              navigator.clipboard.writeText(totpSecret);
              setTotpCopied(true);
              setTimeout(() => setTotpCopied(false), 2000);
            }}
            totpVerified={totpVerified}
            totpCode={totpCode}
            onTotpCodeChange={(v) => { setTotpCode(v); setTotpError(null); }}
            totpError={totpError}
            totpVerifying={totpVerifying}
            onVerify={handleVerifyTotp}
            totpGraceMs={totpGraceMs}
            onGraceChange={setTotpGraceMs}
            onContinue={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <Step3RecoveryPhrase
            phrase={phrase}
            phraseCopied={phraseCopied}
            onCopyPhrase={handleCopyPhrase}
            onContinue={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <Step4ConfirmPhrase
            phraseConfirm={phraseConfirm}
            onPhraseConfirmChange={(v) => { setPhraseConfirm(v); setError(null); }}
            canContinue={canContinueStep4()}
            error={error}
            onContinue={() => canContinueStep4() ? setStep(5) : setError('La frase no coincide con la que generamos. Revísala.')}
            onBack={() => setStep(3)}
          />
        )}
        {step === 5 && (
          <Step5EmailVerification
            email={email}
            onEmailChange={(v) => { setEmail(v); setEmailError(null); }}
            emailSent={emailSent}
            emailLoading={emailLoading}
            onSendEmail={handleSendEmail}
            emailCode={emailCode}
            onEmailCodeChange={(v) => { setEmailCode(v); setEmailError(null); }}
            onVerifyEmail={handleVerifyEmail}
            resendWait={resendWait}
            emailError={emailError}
            emailVerified={emailVerified}
            onSkip={() => setStep(6)}
            onContinue={() => setStep(6)}
            onBack={() => setStep(4)}
          />
        )}
        {step === 6 && (
          <Step6Summary
            authMethod={authMethod}
            emailVerified={emailVerified}
            email={email}
            fileDownloaded={fileDownloaded}
            onDownload={handleDownloadRecoveryFile}
            onFinish={handleFinish}
          />
        )}
      </div>
    </div>
  );
}
