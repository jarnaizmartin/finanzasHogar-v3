Hola. Retomamos proyecto FinanzasHogar-v3.

Protocolo de arranque:

Lee primero 00_FOUNDATION.md (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de 05_SESSION_LOG.md para saber dónde lo dejamos.
Confirma que has entendido el contexto antes de proponer nada.
Resumen rápido de dónde estoy:

Rama activa: refactor/bank-import-modal.
Llevamos commits 1, 2 y 3 de 8 hechos y validados.
Próximo paso planificado: commit 4 — extraer Step1BankSelection (paso 1 del wizard de BankImportModal.tsx).
Rol que te pido para esta sesión: ejecutor que documenta + abogado del diablo cuando detectes algo raro (Regla 5).

Recordatorios operativos:

BUSCAR / REEMPLAZAR con bloques exactos y completos.
Antes de tocar cualquier handler/JSX existente, pídeme que pegue el original con git show o grep — nada de reconstruir de memoria.
Cambios en bloques pequeños, confirmación "hecho N" entre cada uno.
No mezclar fixes nuevos en el refactor (los bugs preexistentes ya están en 06_BACKLOG.md).
Te subiré los archivos .md del /project al inicio. Cuando los hayas leído, dime "listo" y arrancamos commit 4.