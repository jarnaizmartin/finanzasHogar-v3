import {
  bodyStyle,
  titleStyle,
  subtitleStyle,
  inputStyle,
  btnPrimaryStyle,
  btnSecondaryStyle,
  errorStyle,
} from './constants';
import { TOTP_GRACE_OPTIONS } from '../../securityUtils';

interface Props {
  totpSecret: string;
  totpCopied: boolean;
  onCopy: () => void;
  totpVerified: boolean;
  totpCode: string;
  onTotpCodeChange: (value: string) => void;
  totpError: string | null;
  totpVerifying: boolean;
  onVerify: () => void;
  totpGraceMs: number;
  onGraceChange: (value: number) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function Step2Totp({
  totpSecret,
  totpCopied,
  onCopy,
  totpVerified,
  totpCode,
  onTotpCodeChange,
  totpError,
  totpVerifying,
  onVerify,
  totpGraceMs,
  onGraceChange,
  onContinue,
  onBack,
}: Props) {
  const otpauthUrl = `otpauth://totp/${encodeURIComponent(
    'FinanzasHogar'
  )}:${encodeURIComponent(
    'usuario'
  )}?secret=${totpSecret}&issuer=${encodeURIComponent(
    'FinanzasHogar'
  )}&algorithm=SHA1&digits=6&period=30`;

  return (
    <div style={bodyStyle}>
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📱</div>
      <h2 style={titleStyle}>Configura la verificación en dos pasos</h2>
      <p style={subtitleStyle}>
        Escanea el QR con Google Authenticator, Authy u otra app similar.
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <div
          style={{
            padding: '0.875rem',
            background: '#ffffff',
            borderRadius: '1rem',
            border: '2px solid #e2e8f0',
            marginBottom: '0.75rem',
            display: 'inline-block',
          }}
        >
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
              otpauthUrl
            )}`}
            alt="QR TOTP"
            width={160}
            height={160}
            style={{ display: 'block', borderRadius: '0.5rem' }}
          />
        </div>
        <div
          style={{
            fontSize: '0.72rem',
            color: '#64748b',
            textAlign: 'center',
            marginBottom: '0.5rem',
          }}
        >
          ¿No puedes escanear el QR? Introduce el código manualmente:
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            borderRadius: '0.75rem',
            background: '#f1f5f9',
            border: '1.5px solid #e2e8f0',
            width: '100%',
            boxSizing: 'border-box',
            marginBottom: '0.25rem',
          }}
        >
          <code
            style={{
              flex: 1,
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              color: '#0f172a',
              letterSpacing: '0.1em',
              wordBreak: 'break-all',
            }}
          >
            {totpSecret}
          </code>
          <button
            onClick={onCopy}
            style={{
              padding: '0.3rem 0.625rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              background: totpCopied ? '#f0fdf4' : '#ffffff',
              color: totpCopied ? '#16a34a' : '#64748b',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {totpCopied ? '✅ Copiado' : '📋 Copiar'}
          </button>
        </div>
      </div>

      {!totpVerified ? (
        <>
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#334155',
              marginBottom: '0.5rem',
            }}
          >
            Introduce el código de 6 dígitos de tu app:
          </div>
          <input
            type="text"
            placeholder="000000"
            value={totpCode}
            onChange={(e) => onTotpCodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onVerify();
              }
            }}
            maxLength={6}
            autoFocus
            style={{
              ...inputStyle,
              textAlign: 'center',
              fontSize: '1.5rem',
              letterSpacing: '0.3em',
            }}
          />
          {totpError && <div style={errorStyle}>⚠️ {totpError}</div>}
          <button
            onClick={onVerify}
            disabled={totpCode.length !== 6 || totpVerifying}
            style={{
              ...btnPrimaryStyle,
              opacity: totpCode.length !== 6 || totpVerifying ? 0.5 : 1,
              cursor: totpCode.length !== 6 || totpVerifying ? 'not-allowed' : 'pointer',
            }}
          >
            {totpVerifying ? '⏳ Verificando...' : '✅ Verificar código'}
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
              textAlign: 'center',
              marginBottom: '1rem',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>✅</div>
            <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.9rem' }}>
              Verificación en dos pasos configurada correctamente
            </div>
          </div>
          <div
            style={{
              padding: '1rem',
              borderRadius: '0.875rem',
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              marginBottom: '0.5rem',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.08em',
                marginBottom: '0.5rem',
              }}
            >
              ⏱️ ¿Cada cuánto pedir el código?
            </div>
            <p
              style={{
                fontSize: '0.78rem',
                color: '#64748b',
                margin: '0 0 0.75rem',
                lineHeight: 1.5,
              }}
            >
              Si cierras y vuelves a abrir la app dentro de este tiempo, no te
              pedirá el código.
            </p>
            <select
              value={totpGraceMs}
              onChange={(e) => onGraceChange(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.65rem 0.875rem',
                borderRadius: '0.75rem',
                border: '1.5px solid #e2e8f0',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '0.875rem',
                outline: 'none',
                cursor: 'pointer',
                boxSizing: 'border-box' as const,
              }}
            >
              {TOTP_GRACE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {totpVerified && (
        <button onClick={onContinue} style={{ ...btnPrimaryStyle, marginTop: '0.75rem' }}>
          Continuar →
        </button>
      )}
      <button onClick={onBack} style={{ ...btnSecondaryStyle, marginTop: '0.5rem' }}>
        ← Atrás
      </button>
    </div>
  );
}
