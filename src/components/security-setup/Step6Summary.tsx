import type { AuthMethod } from '../../types';
import {
  bodyStyle,
  titleStyle,
  subtitleStyle,
  btnPrimaryStyle,
  btnSecondaryStyle,
} from './constants';

interface Props {
  authMethod: AuthMethod;
  emailVerified: boolean;
  email: string;
  fileDownloaded: boolean;
  onDownload: () => void;
  onFinish: () => void;
}

export function Step6Summary({
  authMethod,
  emailVerified,
  email,
  fileDownloaded,
  onDownload,
  onFinish,
}: Props) {
  const summaryItems = [
    {
      icon: authMethod === 'password' ? '🔑' : '📱',
      label: 'Método de acceso',
      value: authMethod === 'password' ? 'Contraseña' : 'Código de verificación',
      ok: true,
    },
    {
      icon: '📝',
      label: 'Frase de recuperación',
      value: '12 palabras guardadas',
      ok: true,
    },
    {
      icon: '📧',
      label: 'Email de recuperación',
      value: emailVerified ? email : 'No configurado',
      ok: emailVerified,
    },
    {
      icon: '📄',
      label: 'Fichero de recuperación',
      value: fileDownloaded ? 'Descargado' : 'Pendiente de descargar',
      ok: fileDownloaded,
    },
  ];

  return (
    <div style={bodyStyle}>
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎉</div>
      <h2 style={titleStyle}>¡Todo listo!</h2>
      <p style={subtitleStyle}>
        Un último paso: descarga tu fichero de recuperación como copia de
        seguridad adicional.
      </p>

      <div
        style={{
          padding: '1rem',
          borderRadius: '1rem',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          marginBottom: '1.25rem',
        }}
      >
        <div
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
            marginBottom: '0.75rem',
          }}
        >
          Resumen de seguridad configurada
        </div>
        {summaryItems.map((item) => (
          <div
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 0',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                {item.label}
              </div>
              <div style={{ fontSize: '0.825rem', color: '#334155', fontWeight: 600 }}>
                {item.value}
              </div>
            </div>
            <span style={{ fontSize: '0.9rem' }}>{item.ok ? '✅' : '⚪'}</span>
          </div>
        ))}
      </div>

      {!fileDownloaded ? (
        <>
          <div
            style={{
              padding: '0.875rem 1rem',
              borderRadius: '0.875rem',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              fontSize: '0.775rem',
              color: '#92400e',
              lineHeight: 1.6,
              marginBottom: '0.75rem',
            }}
          >
            💡 El fichero de recuperación es un respaldo adicional. Guárdalo en
            un lugar seguro (USB, nube privada, etc.)
          </div>
          <button
            onClick={onDownload}
            style={{
              ...btnSecondaryStyle,
              marginTop: 0,
              color: '#2563eb',
              borderColor: '#bfdbfe',
              background: '#eff6ff',
            }}
          >
            ⬇️ Descargar fichero de recuperación
          </button>
        </>
      ) : (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.875rem',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#16a34a',
            fontSize: '0.8rem',
            marginBottom: '0.75rem',
            fontWeight: 600,
          }}
        >
          ✅ Fichero descargado correctamente
        </div>
      )}

      <button
        onClick={onFinish}
        style={{ ...btnPrimaryStyle, background: '#16a34a', marginTop: '0.75rem' }}
      >
        ✅ Activar seguridad y entrar
      </button>
    </div>
  );
}
