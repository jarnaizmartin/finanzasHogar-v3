// ============================================================
// HELP CENTER — FinanzasHogar
// Centro de ayuda: Manual, FAQ, Tour y Atajos
// ============================================================

import { useState, useEffect, useRef, useMemo } from 'react';
import { GettingStarted } from './GettingStarted';
import { X, Search, ChevronDown, ChevronRight } from 'lucide-react';
import {
  HelpSection,
  MANUAL_SECTIONS,
  FAQ_CATEGORIES,
} from '../lib/helpCenterData';
import { HelpShortcutsView } from './components/help/HelpShortcutsView';
import { HelpManualView } from './components/help/HelpManualView';

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
  const [faqSearch, setFaqSearch] = useState('');
  const [faqCategory, setFaqCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [navigatedAway, setNavigatedAway] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

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

  // Focus en buscador al abrir FAQ
  useEffect(() => {
    if (section === 'faq' && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [section]);

  // Filtrado FAQ
  const filteredFAQ = useMemo(() => {
    const q = faqSearch.toLowerCase();
    return FAQ_CATEGORIES.filter(
      (cat) => faqCategory === 'all' || cat.id === faqCategory
    )
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            !q ||
            item.question.toLowerCase().includes(q) ||
            item.answer.toLowerCase().includes(q) ||
            item.tags.some((t) => t.includes(q))
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [faqSearch, faqCategory]);

  const totalResults = filteredFAQ.reduce((s, c) => s + c.items.length, 0);

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

  const renderFAQ = () => (
    <div>
      {/* Buscador */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search
          size={16}
          color={T.muted}
          style={{
            position: 'absolute',
            left: '0.875rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        />
        <input
          ref={searchRef}
          type="text"
          placeholder="Buscar en las preguntas frecuentes..."
          value={faqSearch}
          onChange={(e) => setFaqSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 0.875rem 0.75rem 2.5rem',
            borderRadius: '0.875rem',
            border: `1.5px solid ${faqSearch ? T.accent : T.inputBorder}`,
            background: T.inputBg,
            color: T.inputText,
            fontSize: '0.875rem',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s',
          }}
        />
        {faqSearch && (
          <button
            onClick={() => setFaqSearch('')}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: T.muted,
              fontSize: '0.8rem',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Filtro por categoría */}
      <div
        style={{
          display: 'flex',
          gap: '0.375rem',
          flexWrap: 'wrap',
          marginBottom: '1.25rem',
        }}
      >
        <button
          onClick={() => setFaqCategory('all')}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            border:
              faqCategory === 'all' ? 'none' : `1px solid ${T.cardBorder}`,
            background: faqCategory === 'all' ? T.accent : T.pageBg,
            color: faqCategory === 'all' ? '#fff' : T.muted,
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Todas
        </button>
        {FAQ_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              setFaqCategory(faqCategory === cat.id ? 'all' : cat.id)
            }
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              border:
                faqCategory === cat.id ? 'none' : `1px solid ${T.cardBorder}`,
              background: faqCategory === cat.id ? cat.color : T.pageBg,
              color: faqCategory === cat.id ? '#fff' : T.muted,
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Contador de resultados */}
      {faqSearch && (
        <div
          style={{
            fontSize: '0.72rem',
            color: T.muted,
            marginBottom: '0.875rem',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            background: T.accentLight,
            border: `1px solid ${T.accent}33`,
          }}
        >
          🔍 {totalResults} resultado{totalResults !== 1 ? 's' : ''} para "
          {faqSearch}"
        </div>
      )}

      {/* Lista de preguntas */}
      {filteredFAQ.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: T.muted,
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
          <div
            style={{ fontSize: '0.875rem', fontWeight: 700, color: T.title }}
          >
            Sin resultados
          </div>
          <div style={{ fontSize: '0.775rem', marginTop: '0.25rem' }}>
            Prueba con otras palabras
          </div>
        </div>
      ) : (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          {filteredFAQ.map((cat) => (
            <div key={cat.id}>
              {/* Cabecera categoría */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.625rem',
                  paddingBottom: '0.5rem',
                  borderBottom: `2px solid ${cat.color}33`,
                }}
              >
                <span style={{ fontSize: '1rem' }}>{cat.emoji}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: cat.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {cat.label}
                </span>
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    background: cat.color + '18',
                    color: cat.color,
                  }}
                >
                  {cat.items.length}
                </span>
              </div>

              {/* Preguntas */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.375rem',
                }}
              >
                {cat.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      borderRadius: '0.875rem',
                      border: `1px solid ${
                        expandedFAQ === item.id
                          ? cat.color + '44'
                          : T.cardBorder
                      }`,
                      background:
                        expandedFAQ === item.id ? cat.color + '08' : T.pageBg,
                      overflow: 'hidden',
                      transition: 'all 0.15s',
                    }}
                  >
                    <button
                      onClick={() =>
                        setExpandedFAQ(expandedFAQ === item.id ? null : item.id)
                      }
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.825rem',
                          fontWeight: 700,
                          color: expandedFAQ === item.id ? cat.color : T.title,
                          flex: 1,
                          lineHeight: 1.4,
                        }}
                      >
                        {item.question}
                      </span>
                      {expandedFAQ === item.id ? (
                        <ChevronDown
                          size={14}
                          color={cat.color}
                          style={{ flexShrink: 0 }}
                        />
                      ) : (
                        <ChevronRight
                          size={14}
                          color={T.muted}
                          style={{ flexShrink: 0 }}
                        />
                      )}
                    </button>
                    {expandedFAQ === item.id && (
                      <div
                        style={{
                          padding: '0 1rem 1rem',
                          animation: 'fadeSlideIn 0.15s ease both',
                        }}
                      >
                        <div
                          style={{
                            height: '1px',
                            background: cat.color + '22',
                            marginBottom: '0.875rem',
                          }}
                        />
                        <p
                          style={{
                            fontSize: '0.825rem',
                            color: T.body,
                            lineHeight: 1.7,
                            margin: 0,
                          }}
                        >
                          {item.answer}
                        </p>
                        {/* Tags */}
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.375rem',
                            flexWrap: 'wrap',
                            marginTop: '0.75rem',
                          }}
                        >
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              onClick={() => {
                                setFaqSearch(tag);
                                setExpandedFAQ(null);
                              }}
                              style={{
                                fontSize: '0.62rem',
                                fontWeight: 600,
                                padding: '0.15rem 0.5rem',
                                borderRadius: '9999px',
                                background: T.cardBg,
                                border: `1px solid ${T.cardBorder}`,
                                color: T.muted,
                                cursor: 'pointer',
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
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
          {section === 'faq' && renderFAQ()}
          {section === 'shortcuts' && <HelpShortcutsView T={T} />}
        </div>
      </div>
    </>
  );
}