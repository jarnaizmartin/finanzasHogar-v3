import { useState } from 'react';
import { Shield, Lock, AlertTriangle, X } from 'lucide-react';
import { useSecurityContext } from '../SecurityContext';
import { useApp } from '../AppContext';
import { useToast } from '../contexts/ToastContext';

// ⚠️ S.2.6a — Modal mostrado a usuarios LEGACY (con seguridad activada
// pre-S.2 pero sin VMK). Pide la frase de 12 palabras para activar el
// cifrado at-rest sin pérdida de datos.
//
// El usuario puede posponerlo ("Ahora no") — la app sigue funcionando
// con datos en CLARO en localStorage hasta que complete la migración.
// El modal se volverá a mostrar tras el siguiente unlock.

export function VaultMigrationModal({ onClose }: { onClose: () => void }) {
  const { T } = useApp();
  const { migrateLegacyToVault } = useSecurityContext();
  const toast = useToast();

  const [phrase, setPhrase] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMigrate = async () => {
    if (!phrase.trim()) {
      setError('Introduce tu frase de 12 palabras.');
      return;
    }
    setBusy(true);
    setError(null);
    const result = await migrateLegacyToVault(phrase);
    setBusy(false);
    if (result.ok) {
      toast(
        '🔐 Cifrado activado. Tus datos ya están protegidos en disco.',
        'success'
      );
      onClose();
    } else {
      setError(result.error ?? 'No se pudo activar el cifrado.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: T.cardBg,
          border: `1px solid ${T.cardBorder}`,
          borderRadius: '1.5rem',
          boxShadow: T.cardShadowLg,
          width: '100%',
          maxWidth: '32rem',
          padding: '1.75rem',
          position: 'relative',
        }}
      >
        {/* Cerrar (posponer) */}
        <button
          onClick={onClose}
          aria-label="Posponer activación de cifrado"
          title="Ahora no"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: T.muted,
            padding: '0.25rem',
            borderRadius: '0.5rem',
          }}
        >
          <X size={18} />
        </button>

        {/* Icono + título */}
        <div
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
          }}
        >
          <Shield size={20} color="#fff" />
        </div>

        <h3
          style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: T.title,
            margin: '0 0 0.5rem',
            letterSpacing: '-0.02em',
          }}
        >
          Activa el cifrado de tus datos
        </h3>

        <p
          style={{
            fontSize: '0.875rem',
            color: T.muted,
            lineHeight: 1.6,
            margin: '0 0 1.25rem',
          }}
        >
          Esta versión cifra tus datos en el disco usando tu contraseña. Para no
          perder tu capacidad de recuperación si olvidas la contraseña,
          necesitamos verificar tu <strong>frase de 12 palabras</strong>.
        </p>

        {/* Aviso */}
        <div
          style={{
            display: 'flex',
            gap: '0.625rem',
            padding: '0.75rem 0.875rem',
            borderRadius: '0.75rem',
            background: T.amberBg,
            border: `1px solid ${T.amberBorder}`,
            marginBottom: '1.25rem',
          }}
        >
          <AlertTriangle
            size={16}
            color={T.amber}
            style={{ flexShrink: 0, marginTop: '0.1rem' }}
          />
          <div style={{ fontSize: '0.775rem', color: T.body, lineHeight: 1.5 }}>
            Es la misma frase que guardaste cuando configuraste la seguridad. La
            introduces <strong>una sola vez</strong> y nunca más se te pedirá.
          </div>
        </div>

        {/* Input */}
        <label
          style={{
            display: 'block',
            fontSize: '0.775rem',
            fontWeight: 700,
            color: T.title,
            marginBottom: '0.5rem',
          }}
        >
          🔑 Tu frase de recuperación (12 palabras)
        </label>
        <textarea
          value={phrase}
          onChange={(e) => {
            setPhrase(e.target.value);
            if (error) setError(null);
          }}
          placeholder="palabra1 palabra2 palabra3 palabra4 ..."
          rows={3}
          autoFocus
          disabled={busy}
          style={{
            width: '100%',
            padding: '0.75rem 0.875rem',
            borderRadius: '0.75rem',
            border: `1.5px solid ${error ? T.redBorder : T.cardBorder}`,
            background: T.pageBg,
            color: T.body,
            fontSize: '0.875rem',
            fontFamily: '"SF Mono","Menlo",monospace',
            resize: 'vertical',
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />

        {error && (
          <div
            style={{
              marginTop: '0.625rem',
              fontSize: '0.775rem',
              color: T.red,
              fontWeight: 600,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Botones */}
        <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1.5rem' }}>
          <button
            onClick={handleMigrate}
            disabled={busy || !phrase.trim()}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '0.75rem',
              border: 'none',
              background:
                busy || !phrase.trim()
                  ? T.cardBorder
                  : 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: busy || !phrase.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <Lock size={14} />
            {busy ? 'Activando cifrado...' : 'Activar cifrado'}
          </button>
          <button
            onClick={onClose}
            disabled={busy}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              border: `1.5px solid ${T.btnSecBorder}`,
              background: T.btnSecBg,
              color: T.btnSecText,
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >
            Ahora no
          </button>
        </div>

        <p
          style={{
            fontSize: '0.7rem',
            color: T.muted,
            marginTop: '1rem',
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          Si pospones, tus datos seguirán <strong>sin cifrar</strong> en este
          dispositivo y volveremos a pedírtelo en el próximo desbloqueo.
        </p>
      </div>
    </div>
  );
}
