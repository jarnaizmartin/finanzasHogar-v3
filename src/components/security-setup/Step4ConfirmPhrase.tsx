import {
  bodyStyle,
  titleStyle,
  subtitleStyle,
  inputStyle,
  btnPrimaryStyle,
  btnSecondaryStyle,
  errorStyle,
} from './constants';

interface Props {
  phraseConfirm: string;
  onPhraseConfirmChange: (value: string) => void;
  canContinue: boolean;
  error: string | null;
  onContinue: () => void;
  onBack: () => void;
}

export function Step4ConfirmPhrase({
  phraseConfirm,
  onPhraseConfirmChange,
  canContinue,
  error,
  onContinue,
  onBack,
}: Props) {
  const wordCount = phraseConfirm.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div style={bodyStyle}>
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✍️</div>
      <h2 style={titleStyle}>Confirma la frase</h2>
      <p style={subtitleStyle}>
        Escribe las 12 palabras en el mismo orden para confirmar que las has
        guardado correctamente.
      </p>

      <textarea
        placeholder="palabra1 palabra2 palabra3 ... palabra12"
        value={phraseConfirm}
        onChange={(e) => onPhraseConfirmChange(e.target.value)}
        style={{
          ...inputStyle,
          height: '6rem',
          resize: 'vertical',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
        }}
      >
        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
          {wordCount} / 12 palabras
        </span>
        {canContinue && (
          <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>
            ✅ Frase correcta
          </span>
        )}
        {phraseConfirm.length > 0 && !canContinue && wordCount === 12 && (
          <span style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 700 }}>
            ❌ La frase no coincide
          </span>
        )}
      </div>

      {error && <div style={errorStyle}>⚠️ {error}</div>}

      <button
        onClick={onContinue}
        style={{
          ...btnPrimaryStyle,
          opacity: canContinue ? 1 : 0.5,
          cursor: canContinue ? 'pointer' : 'not-allowed',
        }}
      >
        Continuar →
      </button>
      <button onClick={onBack} style={btnSecondaryStyle}>
        ← Ver la frase de nuevo
      </button>
    </div>
  );
}
