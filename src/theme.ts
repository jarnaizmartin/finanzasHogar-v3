// ─── Design tokens ───────────────────────────────────────────────────────────
//
// Arquitectura:
//   BASE   — tokens que no cambian entre temas (tipografía, radios, transiciones)
//   LIGHT  — tema claro  (= BASE + colores light)
//   DARK   — tema oscuro (= BASE + colores dark)  ← modo primario
//
// Fase 2 — Identidad de producto:
//   · Accent: teal #0891b2 (light) / #22d3ee (dark)
//   · Tipografía: Inter completo
//   · Radios: generosos (cards 1rem, modales 1.25rem, botones 0.75rem)
//
// ─────────────────────────────────────────────────────────────────────────────

// ── Tokens compartidos (no dependen del tema) ─────────────────────────────────

const BASE = {
  // ── Familias tipográficas ─────────────────────────────────────────────────
  fontFamily:     '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
  fontFamilyMono: '"SF Mono", "Menlo", "Cascadia Code", "Consolas", monospace',

  // ── Escala tipográfica ────────────────────────────────────────────────────
  textXs:   '0.65rem',    //  ~10px — etiquetas muy pequeñas, overlines
  textSm:   '0.75rem',    //  ~12px — captions, labels de tabla
  textBase: '0.875rem',   //  ~14px — body estándar
  textMd:   '1rem',       //  ~16px — body grande, inputs
  textLg:   '1.125rem',   //  ~18px — subtítulos de sección
  textXl:   '1.375rem',   //  ~22px — títulos de sección
  text2xl:  '1.75rem',    //  ~28px — títulos de página
  text3xl:  '2rem',       //  ~32px — hero

  // ── Border radius ─────────────────────────────────────────────────────────
  radiusPill:  '9999px',    // circular / pill
  radiusSm:    '0.375rem',  //  6px — badges, chips pequeños
  radiusInput: '0.625rem',  // 10px — inputs, selects, textareas
  radiusBtn:   '0.75rem',   // 12px — botones estándar
  radiusMd:    '0.875rem',  // 14px — cards compactas
  radiusCard:  '1rem',      // 16px — cards estándar
  radiusLg:    '1.25rem',   // 20px — modales, paneles grandes
  radiusXl:    '1.5rem',    // 24px — drawers, overlays

  // ── Transiciones ──────────────────────────────────────────────────────────
  transition:     'all 0.15s ease',
  transitionFast: 'all 0.1s ease',
  transitionSlow: 'all 0.25s ease',
};

// ── Tema claro ────────────────────────────────────────────────────────────────

export const LIGHT = {
  ...BASE,

  pageBg:       '#e8eef5',
  headerBg:     '#0f172a',
  headerBorder: '#1e293b',
  headerText:   '#f8fafc',
  headerMuted:  '#94a3b8',
  navActive:    '#0891b2',
  navInactive:  '#64748b',

  cardBg:       '#ffffff',
  cardBorder:   '#d8e0ea',
  cardShadow:   '0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.08), 0 0 0 1px rgba(15,23,42,0.03)',
  cardShadowLg: '0 4px 8px rgba(15,23,42,0.06), 0 16px 48px rgba(15,23,42,0.12), 0 0 0 1px rgba(15,23,42,0.04)',

  title: '#0f172a',
  body:  '#334155',
  muted: '#64748b',

  heroBg:    'linear-gradient(135deg, #0f172a 0%, #0c3040 50%, #0e7490 100%)',
  heroText:  '#ffffff',
  heroMuted: '#7dd3fc',

  accent:      '#0891b2',
  accentHover: '#0e7490',
  accentLight: '#ecfeff',
  stickyBg:    '#cffafe',

  green:       '#16a34a',
  greenBg:     '#f0fdf4',
  greenBorder: '#bbf7d0',

  red:       '#dc2626',
  redBg:     '#fef2f2',
  redBorder: '#fecaca',

  amber:       '#d97706',
  amberBg:     '#fffbeb',
  amberBorder: '#fde68a',

  info:       '#0369a1',
  infoBg:     '#f0f9ff',
  infoBorder: '#bae6fd',

  inputBg:     '#f8fafc',
  inputBorder: '#cbd5e1',
  inputText:   '#0f172a',

  tableHead:    '#f8fafc',
  tableRow:     '#ffffff',
  tableRowAlt:  '#fafbfc',
  tableBorder:  '#e2e8f0',

  btnSecBg:     '#f1f5f9',
  btnSecText:   '#334155',
  btnSecBorder: '#cbd5e1',

  errorText:   '#dc2626',
  errorBg:     '#fef2f2',
  errorBorder: '#fecaca',
};

// ── Tema oscuro (modo primario) ───────────────────────────────────────────────

export const DARK = {
  ...BASE,

  pageBg:       '#060610',
  headerBg:     '#080812',
  headerBorder: '#12122a',
  headerText:   '#f1f5f9',
  headerMuted:  '#475569',
  navActive:    '#22d3ee',
  navInactive:  '#64748b',

  cardBg:       '#0d0d1f',
  cardBorder:   '#1e1e3a',
  cardShadow:   'inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)',
  cardShadowLg: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 8px rgba(0,0,0,0.4), 0 16px 48px rgba(0,0,0,0.35)',

  title: '#f1f5f9',
  body:  '#cbd5e1',
  muted: '#94a3b8',

  heroBg:    'linear-gradient(135deg, #030b0f 0%, #051a26 50%, #0a2e3f 100%)',
  heroText:  '#ffffff',
  heroMuted: '#7dd3fc',

  accent:      '#22d3ee',
  accentHover: '#06b6d4',
  accentLight: '#071e26',
  stickyBg:    '#0d2a3c',

  green:       '#22c55e',
  greenBg:     '#052e16',
  greenBorder: '#14532d',

  red:       '#f87171',
  redBg:     '#1f0a0a',
  redBorder: '#450a0a',

  amber:       '#fbbf24',
  amberBg:     '#1c0f00',
  amberBorder: '#451a00',

  info:       '#38bdf8',
  infoBg:     '#0c1a2e',
  infoBorder: '#0e3a5e',

  inputBg:     '#12122a',
  inputBorder: '#1e1e40',
  inputText:   '#f1f5f9',

  tableHead:    '#0a0a1e',
  tableRow:     '#0d0d1f',
  tableRowAlt:  '#0a0a1a',
  tableBorder:  '#1a1a35',

  btnSecBg:     '#12122a',
  btnSecText:   '#94a3b8',
  btnSecBorder: '#1e1e40',

  errorText:   '#f87171',
  errorBg:     '#1f0a0a',
  errorBorder: '#450a0a',
};

export type Theme = typeof LIGHT;
