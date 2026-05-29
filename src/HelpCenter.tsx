// ============================================================
// HELP CENTER — FinanzasHogar
// Centro de ayuda: Manual, FAQ, Tour y Atajos
// ============================================================

import { useState, useEffect } from 'react';
import { GettingStarted } from './GettingStarted';
import { X, ChevronRight } from 'lucide-react';
import {
  HelpSection,
  MANUAL_SECTIONS,
  FAQ_CATEGORIES,
} from '../lib/helpCenterData';
import { HelpShortcutsView } from './components/help/HelpShortcutsView';
import { HelpManualView } from './components/help/HelpManualView';
import { HelpFAQView } from './components/help/HelpFAQView';

// ─── Componente principal ─────────────────────────────────────────────────────

interface HelpCenterProps {
  T: any;
  securityEnabled?: boolean;
  onClose: () => void;
  onRestartTour: () => void;
  onNavigate: (tab: string) => void;
  onNavigateKeepOpen?: (tab: string) => void;
  onOpenSecurity: () => void;
  onOpenBackup: () => void;
  onRestartCoachTour?: () => void;
  initialSection?: HelpSection;
}

export function HelpCenter({
  T,
  securityEnabled = false,
  onClose,
  onRestartTour,
  onNavigate,
  onNavigateKeepOpen,
  onOpenSecurity,
  onOpenBackup,
  onRestartCoachTour,
  initialSection,
}: HelpCenterProps)
 {
  const [section, setSection] = useState<HelpSection>(initialSection ?? 'home');
  const [manualSection, setManualSection] = useState<string | null>(null);
  const [navigatedAway, setNavigatedAway] = useState(false);

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (manualSection) {
          setManualSection(null);
        } else if (section !== 'home') {
          setSection('home');
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [section, manualSection, onClose]);

  // ── Estilos ──────────────────────────────────────────────────────────────

  const isMobile = window.innerWidth < 768;

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: isMobile && navigatedAway ? 'auto' : '7.5rem',
    bottom: 0,
    right: 0,
    left: isMobile && navigatedAway ? 0 : 'auto',
    width: '100%',
    maxWidth: isMobile ? '100%' : '34rem',
    height: isMobile && navigatedAway ? '45vh' : undefined,
    background: T.cardBg,
    borderLeft: isMobile ? 'none' : `1px solid ${T.cardBorder}`,
    borderTop: `1px solid ${T.cardBorder}`,
    boxShadow: '-8px 0 40px rgba(0,0,0,0.2)',
    zIndex: 60,
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideInRight 0.3s ease both',
    borderRadius: '1rem 0 0 0',
  };

  const headerStyle: React.CSSProperties = {
    padding: isMobile ? '1rem' : '1.25rem 1.5rem',
    borderBottom: `1px solid ${T.cardBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    background: T.headerBg,
    flexShrink: 0,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: isMobile ? '1rem' : '1.25rem 1.5rem',
    paddingBottom: isMobile ? '5rem' : '1.25rem',
  };

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

  // ── Render Home ─────────────────────────────────────────────────────────

  const renderHome = () => (
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
        onClick={() => setSection('getting-started')}
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
          onClick={() => setSection(opt.id)}
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

  // ── Render Manual ───────────────────────────────────────────────────────

  // ── Render FAQ ─────────────────────────────────────────────────────────
  );

  // ── Render Shortcuts ───────────────────────────────────────────────────


  // ── Título de sección activa ──────────────────────────────────────────

  const sectionTitles = {
    home: { title: 'Centro de Ayuda', emoji: '❓' },
    'getting-started': { title: 'Guía de primeros pasos', emoji: '🚀' },
    manual: {
      title: manualSection
        ? MANUAL_SECTIONS.find((s) => s.id === manualSection)?.title ?? 'Manual'
        : 'Manual de usuario',
      emoji: '📖',
    },
    faq: { title: 'Preguntas frecuentes', emoji: '💬' },
    shortcuts: { title: 'Atajos de teclado', emoji: '⌨️' },
  };

  const currentTitle = sectionTitles[section];

  // ── Render principal ──────────────────────────────────────────────────

  return (
    <>
      {/* Overlay */}
      {!navigatedAway && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 59,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease both',
          }}
        />
      )}

      {/* Panel */}
      <div style={panelStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            {section !== 'home' && (
              <button
                onClick={() => {
                  if (manualSection) {
                    setManualSection(null);
                  } else {
                    setSection('home');
                  }
                }}
                style={{
                  padding: '0.4rem 0.625rem',
                  borderRadius: '0.5rem',
                  border: `1px solid rgba(255,255,255,0.15)`,
                  background: 'rgba(255,255,255,0.08)',
                  color: '#93c5fd',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                ←
              </button>
            )}
            <div>
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                }}
              >
                {currentTitle.emoji} {currentTitle.title}
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: '#94a3b8',
                  marginTop: '0.1rem',
                }}
              >
                FinanzasHogar · Ayuda
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.4rem',
              borderRadius: '0.625rem',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs de navegación (cuando no estamos en home) */}
        {section !== 'home' && (
          <div
            style={{
              display: 'flex',
              borderBottom: `1px solid ${T.cardBorder}`,
              background: T.pageBg,
              flexShrink: 0,
            }}
          >
            {(
              [
                { id: 'getting-started', emoji: '🚀', label: 'Primeros pasos' },
                { id: 'faq', emoji: '💬', label: 'FAQ' },
                { id: 'manual', emoji: '📖', label: 'Manual' },
                { id: 'shortcuts', emoji: '⌨️', label: 'Atajos' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSection(tab.id);
                  setManualSection(null);
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem 0.5rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: section === tab.id ? T.accent : T.muted,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  borderBottom:
                    section === tab.id
                      ? `2px solid ${T.accent}`
                      : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {tab.emoji} {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Contenido */}
        <div style={contentStyle}>
          {section === 'home' && renderHome()}
          {section === 'getting-started' && (
            <GettingStarted
              T={T}
              securityEnabled={securityEnabled}
              onNavigate={onNavigate}
              onNavigateKeepOpen={(tab) => {
                setNavigatedAway(true);
                onNavigateKeepOpen?.(tab);
              }}
              onOpenSecurity={onOpenSecurity}
              onOpenBackup={onOpenBackup}
              onClose={onClose}
            />
          )}
          {section === 'manual' && (
            <HelpManualView
              T={T}
              manualSection={manualSection}
              onSectionChange={setManualSection}
            />
          )}
          {section === 'faq' && <HelpFAQView T={T} />}
          {section === 'shortcuts' && <HelpShortcutsView T={T} />}
        </div>
      </div>
    </>
  );
}