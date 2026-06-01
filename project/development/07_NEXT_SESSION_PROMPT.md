Hola. Retomamos proyecto finanzasHogar-v3.

Protocolo de arranque:

Lee primero 00_FOUNDATION.md (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de 05_SESSION_LOG.md para saber dónde lo dejamos.
Lee el plan completo de F4 en 01_ROADMAP.md §Bloque F4 antes de proponer nada.
Confirma que has entendido el contexto antes de proponer nada.

---

## Estado de fases

| Fase | Estado |
|---|---|
| 0.5 | ✅ COMPLETA — tag v0.5.1-i18n-prep |
| 1 | ✅ COMPLETA — 7 monstruos refactorizados |
| 2 | 🔄 EN CURSO — A/B/C/D/E1+E2 ✅ · E3 bloqueada (naming pendiente) |
| 3 | 🔄 EN CURSO — F1/F2/F3 ✅ · F4 en progreso (sesión 15) |
| 4+ | ⏳ Pendiente |

Tests: **962 pasando**. `main`: CI verde, build verde.

---

## Estado de Fase 3 — F4 (extracción de strings)

**Namespaces:** `common` (+ coachCta), `goals` (+ wizard), `dashboard`, `accounts` (completo), `projections` (+ list + frequencies + analysis), `realExpenses`, `transfers`, `categories`, `bankImport`, `calendar`, `trends` (completo).

**52 ficheros wired.** Plan completo en `01_ROADMAP.md §Bloque F4`.

### Lo que toca esta sesión: F4-F

**`reports` namespace** (~65 strings):
- `Reports.tsx` (~15): cabeceras, tabs, filtros
- `reports/AccountsReport.tsx` (~12)
- `reports/MovementsReport.tsx` (~14)
- `reports/ProjectionsReport.tsx` (~9)
- `reports/GoalsReport.tsx` (~6)
- `reports/TrendsReport.tsx` (~9)
- Namespace: **nuevo** `reports`

**Orden recomendado:**
1. Localizar todos los ficheros
2. Auditar strings (la realidad suele superar la estimación)
3. Definir claves ES → traducir a EN/PT-BR/FR → aplicar
4. type-check + vitest run
5. Un commit

---

## Estado de Fase 2 (bloqueante activo)

- Bloque E3 bloqueada hasta naming definitivo + dominio
- Naming: 6 finalistas (NORTIA, AEQUORA, TENUIA, AEVITAS, STABILA, AEQUILA)

---

## Recordatorios operativos

- BUSCAR / REEMPLAZAR con bloques exactos y completos. Leer el fichero antes de editar.
- Un commit por namespace completado.
- `common.coachCta` ya existe — úsalo para botones '¡Entendido! →'.
- Strings en Recharts name props (Bar/Line/Area) también deben traducirse.
- Al cerrar la sesión: actualizar 05_SESSION_LOG.md + este fichero.
- Marcar la sesión completada en el plan de 01_ROADMAP.md §Bloque F4.

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
