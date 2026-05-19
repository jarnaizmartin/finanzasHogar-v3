import { useState, useEffect } from 'react';
import { Modal } from './UI';

type Props = {
  T: any;
  mode: 'encrypt' | 'decrypt';
  onConfirm: (password: string) => Promise<void> | void;
  onCancel: () => void;
  errorMessage?: string | null;
  busy?: boolean;
};

export function BackupPasswordModal({
  T,
  mode,
  onConfirm,
  onCancel,
  errorMessage,
  busy,
}: Props) {
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setLocalError(null);
  }, [errorMessage]);

  const isEncrypt = mode === 'encrypt';
  const title = isEncrypt
    ? '🔐 Proteger backup con contraseña'
    : '🔓 Backup cifrado';
  const subtitle = isEncrypt
    ? 'Elige una contraseña para cifrar este backup. La necesitarás para restaurarlo en el futuro.'
    : 'Este backup está cifrado. Introduce la contraseña con la que se creó.';

  const canSubmit = isEncrypt
    ? password.length >= 8 && password === password2
    : password.length > 0;

  const handleSubmit = async () => {
    setLocalError(null);
    if (isEncrypt) {
      if (password.length < 8) {
        setLocalError('La contraseña debe tener al menos 8 caracteres.');
        return;
      }
      if (password !== password2) {
        setLocalError('Las contraseñas no coinciden.');
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
          ⚠️ <strong>Importante:</strong> Si pierdes esta contraseña,{' '}
          <strong>no podrás recuperar los datos</strong> de este backup.
          Guárdala en un sitio seguro (gestor de contraseñas, papel...).
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <input
          type={showPwd ? 'text' : 'password'}
          placeholder={
            isEncrypt
              ? 'Contraseña (mínimo 8 caracteres)'
              : 'Contraseña del backup'
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
          placeholder="Repite la contraseña"
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
            ? '⏳ Procesando...'
            : isEncrypt
            ? '🔐 Cifrar y descargar'
            : '🔓 Descifrar'}
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
          Cancelar
        </button>
      </div>
    </Modal>
  );
}
