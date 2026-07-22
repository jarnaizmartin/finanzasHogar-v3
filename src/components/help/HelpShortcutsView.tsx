import { useTranslation } from 'react-i18next';
import { getShortcuts } from '../../lib/helpCenterData';
import type { Theme } from '../../theme';

interface Props {
  T: Theme;
}

export function HelpShortcutsView({ T }: Props) {
  const { t } = useTranslation();
  const SHORTCUTS = getShortcuts();
  const kbdStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.2rem 0.5rem',
    borderRadius: '0.375rem',
    background: T.pageBg,
    border: `1.5px solid ${T.cardBorder}`,
    fontSize: '0.72rem',
    fontWeight: 700,
    color: T.body,
    fontFamily: 'monospace',
    boxShadow: `0 2px 0 ${T.cardBorder}`,
  };

  return (
    <div>
      <div
        style={{
          padding: '0.875rem 1rem',
          borderRadius: '0.875rem',
          background: T.accentLight,
          border: `1px solid ${T.accent}33`,
          fontSize: '0.775rem',
          color: T.accent,
          marginBottom: '1.5rem',
          lineHeight: 1.5,
        }}
      >
        {t('help.ui.shortcutsNote')}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {SHORTCUTS.map((group, gi) => (
          <div key={gi}>
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: T.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.625rem',
              }}
            >
              {group.category}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
              }}
            >
              {group.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    background: T.pageBg,
                    border: `1px solid ${T.cardBorder}`,
                  }}
                >
                  <span
                    style={{ fontSize: '0.825rem', color: T.body, flex: 1 }}
                  >
                    {item.description}
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.25rem',
                      alignItems: 'center',
                    }}
                  >
                    {item.keys.map((key, ki) => (
                      <span
                        key={ki}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        {ki > 0 && (
                          <span style={{ fontSize: '0.65rem', color: T.muted }}>
                            +
                          </span>
                        )}
                        <kbd style={kbdStyle}>{key}</kbd>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Nota sobre accesibilidad */}
      <div
        style={{
          marginTop: '1.5rem',
          padding: '0.875rem 1rem',
          borderRadius: '0.875rem',
          background: T.pageBg,
          border: `1px solid ${T.cardBorder}`,
          fontSize: '0.72rem',
          color: T.muted,
          lineHeight: 1.6,
        }}
      >
        {t('help.ui.accessibilityNote')}
      </div>
    </div>
  );
}
