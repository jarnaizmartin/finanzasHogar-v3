import { ChevronRight } from 'lucide-react';
import type { HelpSection } from '../../lib/helpCenterData';
import { FAQ_CATEGORIES } from '../../lib/helpCenterData';

interface Props {
  T: any;
  onClose: () => void;
  onRestartTour: () => void;
  onRestartCoachTour?: () => void;
  onNavigate: (section: HelpSection) => void;
}

export function HelpHomeView({
  T,
  onClose,
  onRestartTour,
  onRestartCoachTour,
  onNavigate,
}: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Hero */}
      <div
        style={{
          padding: '1.5rem',
          borderRadius: '1.25rem',
          background:
            'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)',
          marginBottom: '0.5rem',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❓</div>
        <div
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
          }}
        >
          Centro de Ayuda
        </div>
        <div
          style={{
            fontSize: '0.825rem',
            color: '#93c5fd',
            marginTop: '0.25rem',
            lineHeight: 1.5,
          }}
        >
          Todo lo que necesitas para sacar el máximo partido a FinanzasHogar
        </div>
      </div>

      {/* Opciones principales */}
      {/* Tour */}
      <div
        style={{
          padding: '1.25rem',
          borderRadius: '1rem',
          border: `1.5px solid ${T.greenBorder}`,
          background: T.greenBg,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '0.875rem',
              background: T.green + '22',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              flexShrink: 0,
            }}
          >
            🎬
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{ fontSize: '0.95rem', fontWeight: 800, color: T.green }}
            >
              Ver el tour de bienvenida
            </div>
            <div
              style={{
                fontSize: '0.775rem',
                color: T.muted,
                marginTop: '0.2rem',
              }}
            >
              Repasa la introducción guiada de la app
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              setTimeout(onRestartTour, 100);
            }}
            style={{
              padding: '0.55rem 1.125rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: T.green,
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            ▶ Iniciar
          </button>
        </div>
      </div>

      {/* Guía de iconos del header */}
      {onRestartCoachTour && (
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '1rem',
            border: '1.5px solid #a5b4fc',
            background: T.dark ? 'rgba(99,102,241,0.1)' : '#eef2ff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.875rem',
                background: '#6366f122',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                flexShrink: 0,
              }}
            >
              🎯
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#6366f1' }}>
                Guía de iconos del header
              </div>
              <div style={{ fontSize: '0.775rem', color: T.muted, marginTop: '0.2rem' }}>
                Repasa para qué sirve cada botón de la barra superior
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                setTimeout(onRestartCoachTour, 400);
              }}
              style={{
                padding: '0.55rem 1.125rem',
                borderRadius: '0.75rem',
                border: 'none',
                background: '#6366f1',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              ▶ Iniciar
            </button>
          </div>
        </div>
      )}

      {/* Primeros pasos */}
      <button
        onClick={() => onNavigate('getting-started')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1.25rem',
          borderRadius: '1rem',
          border: '1.5px solid #fde68a',
          background: '#fffbeb',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'all 0.15s',
          width: '100%',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateX(4px)';
          e.currentTarget.style.boxShadow = T.cardShadow;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateX(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '0.875rem',
            background: '#f59e0b22',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0,
          }}
        >
          🚀
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{ fontSize: '0.95rem', fontWeight: 800, color: '#92400e' }}
          >
            Guía de primeros pasos
          </div>
          <div
            style={{
              fontSize: '0.775rem',
              color: T.muted,
              marginTop: '0.2rem',
            }}
          >
            8 pasos para dominar FinanzasHogar en ~25 minutos
          </div>
        </div>
        <ChevronRight size={16} color="#92400e" style={{ flexShrink: 0 }} />
      </button>

      {[
        {
          id: 'faq' as HelpSection,
          emoji: '💬',
          title: 'Preguntas frecuentes',
          desc: `${FAQ_CATEGORIES.reduce(
            (s, c) => s + c.items.length,
            0
          )} preguntas con buscador y categorías`,
          color: '#7c3aed',
          bg: '#f5f3ff',
          border: '#ddd6fe',
        },
        {
          id: 'manual' as HelpSection,
          emoji: '📖',
          title: 'Manual de usuario',
          desc: 'Guía completa de todas las funcionalidades',
          color: '#2563eb',
          bg: '#eff6ff',
          border: '#bfdbfe',
        },
        {
          id: 'shortcuts' as HelpSection,
          emoji: '⌨️',
          title: 'Atajos de teclado',
          desc: 'Navega y actúa más rápido con el teclado',
          color: '#0891b2',
          bg: '#ecfeff',
          border: '#a5f3fc',
        },
      ].map((opt) => (
        <button
          key={opt.id}
          onClick={() => onNavigate(opt.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.25rem',
            borderRadius: '1rem',
            border: `1.5px solid ${opt.border}`,
            background: T.dark ? T.accentLight : opt.bg,
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s',
            width: '100%',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(4px)';
            e.currentTarget.style.boxShadow = T.cardShadow;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div
            style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '0.875rem',
              background: opt.color + '22',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              flexShrink: 0,
            }}
          >
            {opt.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{ fontSize: '0.95rem', fontWeight: 800, color: opt.color }}
            >
              {opt.title}
            </div>
            <div
              style={{
                fontSize: '0.775rem',
                color: T.muted,
                marginTop: '0.2rem',
              }}
            >
              {opt.desc}
            </div>
          </div>
          <ChevronRight size={16} color={opt.color} style={{ flexShrink: 0 }} />
        </button>
      ))}

      {/* Nota de privacidad */}
      <div
        style={{
          padding: '0.875rem 1rem',
          borderRadius: '0.875rem',
          background: T.pageBg,
          border: `1px solid ${T.cardBorder}`,
          fontSize: '0.72rem',
          color: T.muted,
          lineHeight: 1.6,
          textAlign: 'center',
        }}
      >
        🔒 Todos tus datos se guardan solo en tu dispositivo. Nunca se envían a
        ningún servidor.
      </div>
    </div>
  );
}
