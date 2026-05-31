Hola. Retomamos proyecto finanzasHogar-v3.

Protocolo de arranque:

Lee primero 00_FOUNDATION.md (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de 05_SESSION_LOG.md para saber dónde lo dejamos.
Confirma que has entendido el contexto antes de proponer nada.

Resumen rápido de dónde estoy:

Estado de fases:
- Fase 0.5: ✅ COMPLETA — tag v0.5.1-i18n-prep
- Fase 1: ✅ COMPLETA — todos los monstruos refactorizados (7 componentes)
- Fase 2 (Identidad de producto): 🔄 EN CURSO — casi completa, bloqueante pendiente
- Tests: 934 passing. main: CI verde, build verde.

Estado de Fase 2 (detalle por bloque):

- Bloque A (fundación design system): ✅ COMPLETO — PR #19
  theme.ts expandido con tokens BASE (tipografía, radius, transiciones).
  src/config/app.ts creado (APP_NAME, APP_TAGLINE, APP_DESCRIPTION).
  Teal #0891b2 (light) / #22d3ee (dark) como color firma definitivo.

- Bloque B (Shell: header + nav + lockscreen): ✅ COMPLETO — PR #19
  Header: logo teal gradient, APP_NAME, botones glass.
  Nav tabs: active teal bg, inactive muted, hover CSS.
  LockScreen: gradiente navy→teal, shield teal.

- Bloque C (primitivos UI): ✅ COMPLETO — PR #19
  Card premium, botones teal + glow + hover float, badges, inputs focus ring teal,
  ConfirmModal, StickyCompactBar — todos con tokens del sistema.

- Bloque D (headers de vistas): ✅ COMPLETO — PR #20
  Overline accent en todas las vistas (Dashboard, Accounts, Goals, Reports, CalendarHeader).
  Fix alineación KPIs credit/loan en Dashboard.

- Bloque E (landing page):
  E1+E2: ✅ COMPLETO — PR #22 (landing/index.html + landing/style.css en main)
  E3: ❌ BLOQUEADA hasta nombre definitivo + dominio

BLOQUEANTE principal de Fase 2:
  Naming — "Nortia" es placeholder. Ver project/commercial/03_NAMING.md.
  Sesión de naming pendiente: criterios (funciona en inglés, 1-2 palabras,
  .com/.app disponible, sin conflictos EUIPO/USPTO).
  Al tener nombre → comprar dominio → publicar landing (E3) → Fase 2 CERRADA.

Lo que toca hacer esta sesión (opciones):

OPCIÓN A (recomendada si no se ha hecho naming): Sesión de naming
  Rol del asistente: abogado del diablo + consultor experto.
  Para cada candidato: análisis pronunciación EN, disponibilidad estimada, riesgos.
  Finalistas actuales: ver project/commercial/03_NAMING.md.

Estado de Fase 3 (i18n) — F1+F2+F3 COMPLETOS:
  F1: i18next 26.3.0, ES+EN, t() type-safe (TranslationKey), 16 tests.
  F2: react-i18next, selector idioma en modal "Configuración regional" (ES/EN/PT-BR/FR).
  F3: pt-br.ts + fr.ts, 4 idiomas activos, 958 tests pasando.
  Pendiente: F4 — extracción de strings de componentes (primer namespace: 'common' + 'projectionAlerts').
  Plan completo F1→F4 documentado en 01_ROADMAP.md §Fase 3.

Recordatorios operativos:

BUSCAR / REEMPLAZAR con bloques exactos y completos.
Antes de tocar cualquier archivo de UI, leerlo primero.
No mezclar fixes de lógica con cambios visuales.
Al cerrar la sesión: actualizar este archivo + entrada en 05_SESSION_LOG.md.

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
