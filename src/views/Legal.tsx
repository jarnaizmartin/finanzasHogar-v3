import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { useApp } from '../AppContext';

// Por encima del overlay del onboarding (z-index 9999), que es fullscreen: si
// este modal queda por debajo, los enlaces legales "no hacen nada" — en
// realidad abren el documento detrás del fondo negro. Portal a <body> para que
// ningún stacking context de un padre lo atrape.
const LEGAL_MODAL_Z = 10050;

// ─── Metadatos de documentos legales ──────────────────────────────────────────
// Contenido completo en i18n/*/legal.docs.*
export const LEGAL_DOCS = {
  aviso:      { sectionCount: 7 },
  privacidad: { sectionCount: 8 },
  terminos:   { sectionCount: 8 },
  cookies:    { sectionCount: 6 },
} as const;

// ─── LegalModal ───────────────────────────────────────────────────────────────
export function LegalModal({
  docKey,
  onClose,
}: {
  docKey: keyof typeof LEGAL_DOCS;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { T } = useApp();
  const meta = LEGAL_DOCS[docKey];
  const title = t(`legal.docs.${docKey}.title` as Parameters<typeof t>[0]);
  const emoji = t(`legal.docs.${docKey}.emoji` as Parameters<typeof t>[0]);
  const sections = Array.from({ length: meta.sectionCount }, (_, i) => ({
    heading: t(`legal.docs.${docKey}.s${i + 1}h` as Parameters<typeof t>[0]),
    text: t(`legal.docs.${docKey}.s${i + 1}t` as Parameters<typeof t>[0]),
  }));

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: LEGAL_MODAL_Z,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '1rem',
        paddingTop: '4.5rem',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        overflowY: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.cardBg,
          border: `1px solid ${T.cardBorder}`,
          borderRadius: '1.5rem',
          boxShadow: T.cardShadowLg,
          width: '100%',
          maxWidth: '44rem',
          maxHeight: 'calc(100vh - 5.5rem)',
          overflowY: 'auto',
          animation: 'fadeSlideIn 0.2s ease both',
        }}
      >
        {/* Cabecera */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: `1px solid ${T.cardBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            background: T.cardBg,
            zIndex: 1,
          }}
        >
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
            <h2
              style={{
                fontSize: '1.125rem',
                fontWeight: 800,
                color: T.title,
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.4rem',
              borderRadius: '0.625rem',
              border: 'none',
              background: T.btnSecBg,
              color: T.muted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido */}
        <div style={{ padding: '1.5rem' }}>
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              background: T.amberBg,
              border: `1px solid ${T.amberBorder}`,
              fontSize: '0.775rem',
              color: T.amber,
              fontWeight: 600,
              marginBottom: '1.5rem',
              lineHeight: 1.5,
            }}
          >
            {t('legal.ui.updateNotice', { year: new Date().getFullYear() })}
          </div>

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            {sections.map((section, i) => (
              <div key={i}>
                <h3
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 800,
                    color: T.title,
                    margin: '0 0 0.5rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {section.heading}
                </h3>
                <p
                  style={{
                    fontSize: '0.825rem',
                    color: T.body,
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {section.text}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '2rem',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '0.875rem',
                border: `1.5px solid ${T.cardBorder}`,
                background: T.btnSecBg,
                color: T.btnSecText,
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── LegalFooter ──────────────────────────────────────────────────────────────
export function LegalFooter() {
  const { T } = useApp();
  const { t } = useTranslation();
  const [openDoc, setOpenDoc] = useState<keyof typeof LEGAL_DOCS | null>(null);

  const links = (
    ['aviso', 'privacidad', 'terminos', 'cookies'] as const
  ).map((key) => ({
    key,
    emoji: t(`legal.docs.${key}.emoji` as Parameters<typeof t>[0]),
    label: t(`legal.ui.link${key.charAt(0).toUpperCase()}${key.slice(1)}` as Parameters<typeof t>[0]),
  }));

  return (
    <>
      <footer
        style={{
          borderTop: `1px solid ${T.cardBorder}`,
          background: T.headerBg,
          padding: '1.25rem 2rem',
          marginTop: '2rem',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}
          >
            <span
              style={{
                fontSize: '0.775rem',
                color: T.headerMuted,
                fontWeight: 600,
              }}
            >
              {t('legal.ui.footerCopyright', { year: new Date().getFullYear() })}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              flexWrap: 'wrap',
            }}
          >
            {links.map((link, i) => (
              <span
                key={link.key}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <button
                  onClick={() => setOpenDoc(link.key)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: T.headerMuted,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  {link.emoji} {link.label}
                </button>
                {i < links.length - 1 && (
                  <span
                    style={{
                      color: T.headerMuted,
                      opacity: 0.3,
                      fontSize: '0.75rem',
                    }}
                  >
                    ·
                  </span>
                )}
              </span>
            ))}
          </div>

          <div
            style={{ fontSize: '0.68rem', color: T.headerMuted, opacity: 0.6 }}
          >
            {t('legal.ui.footerPrivacy')}
          </div>
        </div>
      </footer>

      {openDoc && (
        <LegalModal docKey={openDoc} onClose={() => setOpenDoc(null)} />
      )}
    </>
  );
}
