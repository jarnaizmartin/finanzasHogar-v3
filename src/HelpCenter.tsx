// ============================================================
// HELP CENTER — FinanzasHogar
// Centro de ayuda: Manual, FAQ, Tour y Atajos
// ============================================================

import { useState, useEffect } from 'react';
import { GettingStarted } from './GettingStarted';
import { X } from 'lucide-react';
import { HelpSection, MANUAL_SECTIONS } from '../lib/helpCenterData';
import { HelpShortcutsView } from './components/help/HelpShortcutsView';
import { HelpManualView } from './components/help/HelpManualView';
import { HelpFAQView } from './components/help/HelpFAQView';
import { HelpHomeView } from './components/help/HelpHomeView';

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
          {section === 'home' && (
            <HelpHomeView
              T={T}
              onClose={onClose}
              onRestartTour={onRestartTour}
              onRestartCoachTour={onRestartCoachTour}
              onNavigate={setSection}
            />
          )}
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