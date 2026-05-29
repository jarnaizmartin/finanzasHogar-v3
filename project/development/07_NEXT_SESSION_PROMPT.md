Hola. Retomamos proyecto FinanzasHogar-v3.

Protocolo de arranque:

Lee primero 00_FOUNDATION.md (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de 05_SESSION_LOG.md para saber dónde lo dejamos.
Confirma que has entendido el contexto antes de proponer nada.

Resumen rápido de dónde estoy:

Rama activa: refactor/bank-import-modal.
Llevamos commits 1-6 de 8 hechos y validados.
BankImportModal.tsx: de 2.221 LOC a 558 LOC (−75%).

Lo que queda (commits 7 y 8):

COMMIT 7 — Revisar al inicio de sesión: el plan original decía "Step4Confirm" pero el wizard solo tiene 3 pasos. El confirm es un botón del footer inline. La mejor opción es evaluar si vale la pena extraer BankImportHeader (~70 LOC: progress bar + título dinámico), o ir directo al commit 8. Si el archivo tiene menos de 600 LOC y el header es pequeño, podemos saltarnos el 7 y hacer un solo commit 8 más completo. Decídelo tú con abogado del diablo.

COMMIT 8 — Extraer hook useBankImport: mover todo el estado (useState, useEffect, handlers: handleSelectFormat, generatePreview, confirmImport, saveCustomFormat, saveRule, reApplyRules) fuera del componente al hook. El componente quedará como pura presentación que consume el hook. Es el commit de mayor impacto restante y debe ir acompañado de validación completa: tsc + tests + smoke test en navegador (flujo completo del wizard: banco → CSV → preview → importar).

Rol que te pido para esta sesión: ejecutor que documenta + abogado del diablo cuando detectes algo raro (Regla 5).

Recordatorios operativos:

BUSCAR / REEMPLAZAR con bloques exactos y completos.
Antes de tocar cualquier handler existente, lee el bloque original directamente del archivo — nada de reconstruir de memoria.
Cambios en bloques pequeños, confirmación "hecho N" entre cada uno.
No mezclar fixes nuevos en el refactor (los bugs preexistentes ya están en 06_BACKLOG.md).

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
