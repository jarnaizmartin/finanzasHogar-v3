import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './UI';
import type { Theme } from '../theme';

type Props = {
  T: Theme;
  mode: 'encrypt' | 'decrypt';
  onConfirm: (password: string) => Promise<void> | void;
  onCancel: () => void;
  errorMessage?: string | null;
  busy?: boolean;
  /** Súbelo cuando este modal se abre ENCIMA de otro Modal (que va a 50): a
   *  igual z-index gana el último del DOM y quedaría detrás, presente pero
   *  invisible. Lo necesita el borrado selectivo. */
  zIndex?: number;
};

export function BackupPasswordModal({
  T,
  mode,
  onConfirm,
  onCancel,
  errorMessage,
  busy,
  zIndex,
}: Props) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setLocalError(null);
  }, [errorMessage]);

  const isEncrypt = mode === 'encrypt';
  const title = isEncrypt
    ? t('misc.backupPasswordModal.encryptTitle')
    : t('misc.backupPasswordModal.decryptTitle');
  const subtitle = isEncrypt
    ? t('misc.backupPasswordModal.encryptSubtitle')
    : t('misc.backupPasswordModal.decryptSubtitle');

  const canSubmit = isEncrypt
    ? password.length >= 8 && password === password2
    : password.length > 0;

  const handleSubmit = async () => {
    setLocalError(null);
    if (isEncrypt) {
      if (password.length < 8) {
        setLocalError(t('misc.backupPasswordModal.errorMinLength'));
        return;
      }
      if (password !== password2) {
        setLocalError(t('misc.backupPasswordModal.errorMismatch'));
        return;
      }
    }
    await onConfirm(password);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 2.75rem 0.75rem 1rem',
    borderRadius: '0.75rem',
    border: `1.5px solid ${T.inputBorder}`,
    background: T.inputBg,
    color: T.inputText,
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '0.75rem',
  };

  const errorStyle: React.CSSProperties = {
    padding: '0.65rem 0.875rem',
    borderRadius: '0.625rem',
    background: T.redBg,
    border: `1px solid ${T.redBorder}`,
    color: T.red,
    fontSize: '0.78rem',
    marginBottom: '0.75rem',
    fontWeight: 600,
  };

  const finalError = localError ?? errorMessage ?? null;

  return (
    <Modal
      title={title}
      subtitle={subtitle}
      onClose={onCancel}
      T={T}
      preventClickOutside={true}
      zIndex={zIndex}
    >
      {isEncrypt && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            background: T.amberBg,
            border: `1px solid ${T.amberBorder}`,
            fontSize: '0.78rem',
            color: T.amber,
            lineHeight: 1.5,
            marginBottom: '1rem',
          }}
        >
          {t('misc.backupPasswordModal.warningText')}
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <input
          type={showPwd ? 'text' : 'password'}
          placeholder={
            isEncrypt
              ? t('misc.backupPasswordModal.placeholderNewPwd')
              : t('misc.backupPasswordModal.placeholderBackupPwd')
          }
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setLocalError(null);
          }}
          onKeyDown={(e) =>
            e.key === 'Enter' && canSubmit && !busy && handleSubmit()
          }
          autoFocus
          disabled={busy}
          style={inputStyle}
        />
        <button
          onClick={() => setShowPwd((s) => !s)}
          tabIndex={-1}
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '0.75rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: T.muted,
            fontSize: '0.95rem',
          }}
        >
          {showPwd ? '🙈' : '👁️'}
        </button>
      </div>

      {isEncrypt && (
        <input
          type={showPwd ? 'text' : 'password'}
          placeholder={t('misc.backupPasswordModal.placeholderRepeat')}
          value={password2}
          onChange={(e) => {
            setPassword2(e.target.value);
            setLocalError(null);
          }}
          onKeyDown={(e) =>
            e.key === 'Enter' && canSubmit && !busy && handleSubmit()
          }
          disabled={busy}
          style={{ ...inputStyle, paddingRight: '1rem' }}
        />
      )}

      {finalError && <div style={errorStyle}>⚠️ {finalError}</div>}

      <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.5rem' }}>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || busy}
          style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: '0.75rem',
            border: 'none',
            background: isEncrypt ? T.green : T.accent,
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: !canSubmit || busy ? 'not-allowed' : 'pointer',
            opacity: !canSubmit || busy ? 0.5 : 1,
          }}
        >
          {busy
            ? t('misc.backupPasswordModal.btnProcessing')
            : isEncrypt
            ? t('misc.backupPasswordModal.btnEncrypt')
            : t('misc.backupPasswordModal.btnDecrypt')}
        </button>
        <button
          onClick={onCancel}
          disabled={busy}
          style={{
            padding: '0.75rem 1.25rem',
            borderRadius: '0.75rem',
            border: `1.5px solid ${T.cardBorder}`,
            background: T.btnSecBg,
            color: T.btnSecText,
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: busy ? 'not-allowed' : 'pointer',
          }}
        >
          {t('common.cancel')}
        </button>
      </div>
    </Modal>
  );
}
