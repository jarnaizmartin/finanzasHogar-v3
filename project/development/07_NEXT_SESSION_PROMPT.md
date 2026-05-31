Hola. Retomamos proyecto FinanzasHogar-v3.

Protocolo de arranque:

Lee primero 00_FOUNDATION.md (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de 05_SESSION_LOG.md para saber dónde lo dejamos.
Confirma que has entendido el contexto antes de proponer nada.

Resumen rápido de dónde estoy:

Estado de fases:
- Fase 0.5: ✅ COMPLETA — tag v0.5.1-i18n-prep
- Fase 1: ✅ COMPLETA — todos los monstruos refactorizados
- Fase 2 (Identidad de producto): 🔄 EN CURSO — plan definido, decisiones de diseño pendientes
- Tests: 934 passing. main: CI verde, build verde.

Estado de Fase 2:

Plan completo documentado en 01_ROADMAP.md §Fase 2.
Bloques: A (fundación) → B (shell) → C (UI primitivos) → D (vistas) → E (landing)

BLOQUEANTE antes de escribir código: 4 decisiones de diseño pendientes:
  1. Color firma: ¿azul actual o nuevo color signature?
  2. Modo primario: ¿dark-first (Monarch) o light-first (1Password)?
  3. Tipografía: ¿Inter solo o Inter + fuente de display para títulos?
  4. Border-radius: ¿generoso ~1rem (Monarch) o contenido ~0.5rem?

Referencias estéticas faro (ya cerradas, ver 01_ROADMAP.md §Fase 2):
  - Monarch (premium oscuro), Readwise (sobriedad), 1Password (calidez en privacidad)
  - Calibración 80/20: posicionamiento serio + ejecución visual moderna

Estado del naming (paralelo, ver project/commercial/03_NAMING.md):
  - 6 finalistas SÍ: AEVITAS, NORTIA, STABILA, AEQUORA, AEQUILA, TENUIA
  - Pendiente: Sesión 4 comercial (limpieza quizás + Fase C técnica)
  - La parte técnica de Fase 2 NO requiere el nombre hasta Bloque E (landing)

Lo que toca hacer esta sesión:

OPCIÓN A (recomendada): Cerrar las 4 decisiones de diseño → arrancar Bloque A
  Rol: consultor experto + abogado del diablo en las decisiones de diseño.
  Para cada decisión: presentar opciones con trade-offs, el founder elige.

OPCIÓN B: Sesión 4 comercial (limpieza quizás naming + Fase C técnica)
  Rol: según 09_NEXT_SESSION_PROMPT.md comercial.

Recordatorios operativos:

BUSCAR / REEMPLAZAR con bloques exactos y completos.
Antes de tocar cualquier archivo de UI, leerlo primero.
No mezclar fixes de lógica con cambios visuales.
Al cerrar la sesión: actualizar este archivo + entrada en 05_SESSION_LOG.md.

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
