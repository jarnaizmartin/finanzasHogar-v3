Hola. Retomamos proyecto FinanzasHogar-v3.

Protocolo de arranque:

Lee primero 00_FOUNDATION.md (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de 05_SESSION_LOG.md para saber dónde lo dejamos.
Confirma que has entendido el contexto antes de proponer nada.

Resumen rápido de dónde estoy:

Hay un PR abierto: #16 — refactor(trends) en rama refactor/trends-view.
Hacer merge de ese PR a main antes de empezar cualquier otra cosa.
Tests: 910 passing.

Fase 1 — Estado de monstruos:
- Goals.tsx ✅ (560 LOC)
- Accounts.tsx ✅ (685 LOC)
- BankImportModal.tsx ✅ (242 LOC, PR #13)
- HelpCenter.tsx ✅ (226 LOC, PR #14)
- SecuritySetup.tsx ✅ (146 LOC, PR #15)
- TrendsView.tsx ✅ (58 LOC, PR #16)
- CalendarView.tsx ⏳ PRÓXIMO (1.946 LOC actual) — último monstruo de Fase 1

Lo que toca hacer:

1. Merge PR #16 (rama refactor/trends-view → main).
2. Arrancar refactor de CalendarView.tsx (1.946 LOC). Aplicar el patrón validado:
   constants → lib pura (con tests si hay lógica pura) → subcomponentes → hook.
   Antes de proponer el plan de commits, leer el archivo completo.

Rol que te pido para esta sesión: ejecutor que documenta + abogado del diablo en las decisiones de diseño del refactor.

Recordatorios operativos:

BUSCAR / REEMPLAZAR con bloques exactos y completos.
Antes de tocar cualquier handler existente, lee el bloque original directamente del archivo.
No mezclar fixes nuevos en el refactor.
Al cerrar la sesión: actualizar este archivo (07_NEXT_SESSION_PROMPT.md) + entrada en 05_SESSION_LOG.md.

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
