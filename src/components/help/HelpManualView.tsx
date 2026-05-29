import { ChevronRight } from 'lucide-react';
import { MANUAL_SECTIONS } from '../../lib/helpCenterData';

interface Props {
  T: any;
  manualSection: string | null;
  onSectionChange: (id: string | null) => void;
}

export function HelpManualView({ T, manualSection, onSectionChange }: Props) {
  const navBtnStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.25rem',
    borderRadius: '0.875rem',
    border: `1.5px solid ${active ? T.accent : T.cardBorder}`,
    background: active ? T.accentLight : T.pageBg,
    color: active ? T.accent : T.body,
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'all 0.15s',
    width: '100%',
  });

  if (manualSection) {
    const sec = MANUAL_SECTIONS.find((s) => s.id === manualSection);
    if (!sec) return null;
    const Icon = sec.icon;
    return (
      <div>
        {/* Cabecera sección */}
        <button
          onClick={() => onSectionChange(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.625rem',
            border: `1px solid ${T.cardBorder}`,
            background: T.btnSecBg,
            color: T.muted,
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '1.25rem',
          }}
        >
          ← Volver al manual
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
            padding: '1.25rem',
            borderRadius: '1rem',
            background: sec.color + '15',
            border: `1.5px solid ${sec.color}33`,
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '0.875rem',
              background: sec.color + '22',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              flexShrink: 0,
            }}
          >
            {sec.emoji}
          </div>
          <div>
            <div
              style={{
                fontSize: '1.125rem',
                fontWeight: 800,
                color: sec.color,
              }}
            >
              {sec.title}
            </div>
            <div
              style={{
                fontSize: '0.775rem',
                color: T.muted,
                marginTop: '0.2rem',
              }}
            >
              {sec.subtitle}
            </div>
          </div>
        </div>

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          {sec.content.map((item, i) => (
            <div
              key={i}
              style={{
                padding: '1.125rem',
                borderRadius: '0.875rem',
                background: T.pageBg,
                border: `1px solid ${T.cardBorder}`,
              }}
            >
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  color: T.title,
                  marginBottom: '0.625rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    borderRadius: '50%',
                    background: sec.color,
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                {item.heading}
              </div>
              <p
                style={{
                  fontSize: '0.825rem',
                  color: T.body,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {item.text}
              </p>
              {item.tip && (
                <div
                  style={{
                    marginTop: '0.875rem',
                    padding: '0.75rem 0.875rem',
                    borderRadius: '0.625rem',
                    background: item.tip.startsWith('⚠️')
                      ? T.amberBg
                      : T.accentLight,
                    border: `1px solid ${
                      item.tip.startsWith('⚠️')
                        ? T.amberBorder
                        : T.accent + '33'
                    }`,
                    fontSize: '0.775rem',
                    color: item.tip.startsWith('⚠️') ? T.amber : T.accent,
                    lineHeight: 1.5,
                    fontWeight: 600,
                  }}
                >
                  {item.tip}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          color: T.muted,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '0.875rem',
        }}
      >
        Selecciona una sección
      </div>
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        {MANUAL_SECTIONS.map((sec) => {
          const Icon = sec.icon;
          return (
            <button
              key={sec.id}
              onClick={() => onSectionChange(sec.id)}
              style={navBtnStyle(false)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = sec.color + '66';
                e.currentTarget.style.background = sec.color + '0a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = T.cardBorder;
                e.currentTarget.style.background = T.pageBg;
              }}
            >
              <div
                style={{
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: '0.625rem',
                  background: sec.color + '18',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.125rem',
                  flexShrink: 0,
                }}
              >
                {sec.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: T.title,
                  }}
                >
                  {sec.title}
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    color: T.muted,
                    marginTop: '0.1rem',
                  }}
                >
                  {sec.content.length} secciones
                </div>
              </div>
              <ChevronRight
                size={14}
                color={T.muted}
                style={{ flexShrink: 0 }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
