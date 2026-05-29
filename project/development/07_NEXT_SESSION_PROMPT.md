Hola. Retomamos proyecto FinanzasHogar-v3.

Protocolo de arranque:

Lee primero 00_FOUNDATION.md (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de 05_SESSION_LOG.md para saber dónde lo dejamos.
Confirma que has entendido el contexto antes de proponer nada.

Resumen rápido de dónde estoy:

Rama activa: main (limpia, PRs #13 y #14 mergeados).
Tests: 858 passing.

Fase 1 — Estado de monstruos:
- Goals.tsx ✅ (560 LOC)
- Accounts.tsx ✅ (685 LOC)
- BankImportModal.tsx ✅ (242 LOC, PR #13)
- HelpCenter.tsx ✅ (226 LOC, PR #14)
- SecuritySetup.tsx ⏳ PRÓXIMO (1.296 LOC actual)
- TrendsView.tsx ⏳ Pendiente (1.223 LOC)
- CalendarView.tsx ⏳ Pendiente (1.946 LOC)

Lo que toca hacer:

Refactor de SecuritySetup.tsx (1.296 LOC). Es el componente más sensible que queda: gestiona contraseñas, TOTP, frase de recuperación y fichero de recuperación. Aplicar el patrón validado (constants → lib pura con tests si hay lógica pura → subcomponentes → hook) pero con más cuidado que en los anteriores porque toca flujos de seguridad reales.

Antes de proponer el plan de commits, leer el archivo completo para entender su estructura y decidir qué partes tienen lógica pura testeable vs qué es pura UI.

Rol que te pido para esta sesión: ejecutor que documenta + abogado del diablo en las decisiones de diseño del refactor (qué sube al hook, qué es UI pura, qué merece tests de lib).

Recordatorios operativos:

BUSCAR / REEMPLAZAR con bloques exactos y completos.
Antes de tocar cualquier handler existente, lee el bloque original directamente del archivo.
No mezclar fixes nuevos en el refactor.
Al cerrar la sesión: actualizar este archivo (07_NEXT_SESSION_PROMPT.md) + entrada en 05_SESSION_LOG.md.

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
