import {
  bodyStyle,
  titleStyle,
  subtitleStyle,
  btnPrimaryStyle,
  btnSecondaryStyle,
} from './constants';

interface Props {
  phrase: string;
  phraseCopied: boolean;
  onCopyPhrase: () => void;
  onContinue: () => void;
  onBack: () => void;
}

export function Step3RecoveryPhrase({
  phrase,
  phraseCopied,
  onCopyPhrase,
  onContinue,
  onBack,
}: Props) {
  return (
    <div style={bodyStyle}>
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔒</div>
      <h2 style={titleStyle}>Tu frase de recuperación</h2>
      <p style={subtitleStyle}>
        Estas 12 palabras son la <strong>única forma</strong> de recuperar tu
        cuenta si olvidas tu contraseña. Guárdalas en un lugar seguro.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          marginBottom: '1.25rem',
        }}
      >
        {phrase.split(' ').map((word, i) => (
          <div
            key={i}
            style={{
              padding: '0.5rem 0.625rem',
              borderRadius: '0.625rem',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span
              style={{
                fontSize: '0.65rem',
                color: '#94a3b8',
                fontWeight: 700,
                minWidth: '1rem',
              }}
            >
              {i + 1}
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
              {word}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onCopyPhrase}
        style={{
          ...btnSecondaryStyle,
          marginTop: 0,
          marginBottom: '0.75rem',
          color: phraseCopied ? '#16a34a' : '#475569',
          borderColor: phraseCopied ? '#bbf7d0' : '#e2e8f0',
          background: phraseCopied ? '#f0fdf4' : '#f8fafc',
        }}
      >
        {phraseCopied ? '✅ Copiado al portapapeles' : '📋 Copiar frase'}
      </button>

      <div
        style={{
          padding: '0.875rem 1rem',
          borderRadius: '0.875rem',
          background: '#fffbeb',
          border: '1px solid #fde68a',
          fontSize: '0.775rem',
          color: '#92400e',
          lineHeight: 1.6,
          marginBottom: '1rem',
        }}
      >
        ⚠️ <strong>Importante:</strong> Nunca compartas esta frase con nadie.
        Quien la tenga puede acceder a tu app. Guárdala fuera del ordenador
        (papel, gestor de contraseñas, etc.)
      </div>

      <button onClick={onContinue} style={btnPrimaryStyle}>
        Ya la he guardado → Continuar
      </button>
      <button onClick={onBack} style={btnSecondaryStyle}>
        ← Atrás
      </button>
    </div>
  );
}
