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
  saveTotpLastUnlock,
} from '../securityUtils';
import type { AuthMethod } from '../types';

export const TOTAL_STEPS = 6;

export function useSecuritySetup({ onComplete }: { onComplete: () => void }) {
  const { setupSecurity, sendCode, verifyCode } = useSecurityContext();

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Auth method
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password');

  // Password
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Recovery phrase
  const [phrase] = useState(() => generateRecoveryPhrase());
  const [phraseConfirm, setPhraseConfirm] = useState('');
  const [phraseCopied, setPhraseCopied] = useState(false);

  // Email verification
  const [email, setEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [resendWait, setResendWait] = useState(0);

  // Recovery file
  const [fileDownloaded, setFileDownloaded] = useState(false);
  const [pendingPhraseHash, setPendingPhraseHash] = useState<string | null>(null);
  const [pendingPhraseSalt, setPendingPhraseSalt] = useState<string | null>(null);

  // TOTP
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

  useEffect(() => {
    if (resendWait <= 0) return;
    const t = setTimeout(() => setResendWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [resendWait]);

  // ── Validations ─────────────────────────────────────────────────────────────
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

  const canContinueStep4 = () =>
    normalizePhrase(phraseConfirm) === normalizePhrase(phrase);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const onPasswordChange = (v: string) => { setPassword(v); setError(null); };
  const onPassword2Change = (v: string) => { setPassword2(v); setError(null); };
  const toggleShowPassword = () => setShowPassword((s) => !s);

  const onTotpCodeChange = (v: string) => { setTotpCode(v); setTotpError(null); };
  const handleCopyTotpSecret = () => {
    navigator.clipboard.writeText(totpSecret);
    setTotpCopied(true);
    setTimeout(() => setTotpCopied(false), 2000);
  };
  const handleVerifyTotp = async () => {
    if (totpVerifying) return;
    setTotpVerifying(true);
    setTotpError(null);
    try {
      const ok = await verifyTOTP(totpSecret, totpCode);
      if (ok) {
        setTotpVerified(true);
      } else {
        setTotpError('Código incorrecto. Comprueba que la hora de tu dispositivo es correcta.');
      }
    } catch {
      setTotpError('Error al verificar el código. Inténtalo de nuevo.');
    } finally {
      setTotpVerifying(false);
    }
  };

  const handleCopyPhrase = () => {
    navigator.clipboard.writeText(phrase).then(() => setPhraseCopied(true));
  };

  const onPhraseConfirmChange = (v: string) => { setPhraseConfirm(v); setError(null); };

  const onEmailChange = (v: string) => { setEmail(v); setEmailError(null); };
  const onEmailCodeChange = (v: string) => {
    setEmailCode(v.replace(/\D/g, '').slice(0, 6));
    setEmailError(null);
  };
  const handleSendEmail = async () => {
    if (!email.trim()) { setEmailError('Introduce tu email.'); return; }
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
    if (authMethod === 'totp') saveTotpLastUnlock();
    onComplete();
  };

  return {
    // Navigation
    step, setStep,
    // Shared
    error, setError,
    // Auth method
    authMethod, setAuthMethod,
    // Password
    password, password2, showPassword,
    onPasswordChange, onPassword2Change, toggleShowPassword,
    canContinueStep2,
    // TOTP
    totpSecret, totpCode, totpVerified, totpError, totpCopied, totpVerifying,
    totpGraceMs, setTotpGraceMs,
    onTotpCodeChange, handleCopyTotpSecret, handleVerifyTotp,
    // Phrase
    phrase, phraseConfirm, phraseCopied,
    onPhraseConfirmChange, handleCopyPhrase,
    canContinueStep4,
    // Email
    email, emailCode, emailSent, emailVerified, emailError, emailLoading, resendWait,
    onEmailChange, onEmailCodeChange, handleSendEmail, handleVerifyEmail,
    // File & finish
    fileDownloaded, handleDownloadRecoveryFile, handleFinish,
  };
}
