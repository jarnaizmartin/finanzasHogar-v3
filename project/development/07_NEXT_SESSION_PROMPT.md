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
| 0.5 | ✅ COMPLETA |
| 1 | ✅ COMPLETA |
| 2 | 🔄 EN CURSO — E3 bloqueada (naming pendiente) |
| 3 | 🔄 EN CURSO — F4 en progreso (sesión 16) |
| 4+ | ⏳ Pendiente |

Tests: **962 pasando**. `main`: CI verde, build verde.

---

## Estado de Fase 3 — F4 (extracción de strings)

**Namespaces:** `common`, `goals` (+ wizard), `dashboard`, `accounts` (completo), `projections` (+ list + frequencies + analysis), `realExpenses`, `transfers`, `categories`, `bankImport`, `calendar`, `trends`, `reports`.

**58 ficheros wired.** Plan completo en `01_ROADMAP.md §Bloque F4`.

**Setup de tests:** `test-setup.ts` tiene mock global de `react-i18next` que resuelve claves ES automáticamente. Los tests futuros de componentes i18n funcionarán sin configuración adicional.

### Lo que toca esta sesión: F4-G

**`creditCards` namespace extension** (~39 strings):
- `CreditCardDetailView.tsx` (~5)
- `CreditCardSimulator.tsx` (~6)
- `CreditCardMetrics.tsx` (~12)
- `CreditCardsComparison.tsx` (~7)
- `CreditCardHistoryChart.tsx` (~9)
- Namespace: ampliar `creditCards` (ya existe con `healthScore`)

**Orden recomendado:**
1. Localizar los 5 ficheros con glob
2. Auditar strings (la realidad suele superar la estimación)
3. Definir claves ES → traducir a EN/PT-BR/FR → aplicar
4. type-check + vitest run
5. Un commit

---

## Recordatorios operativos

- BUSCAR / REEMPLAZAR con bloques exactos y completos. Leer el fichero antes de editar.
- Un commit por namespace completado.
- `common.coachCta` ya existe — úsalo para botones '¡Entendido! →'.
- `test-setup.ts` ya tiene el mock de react-i18next — no hace falta añadirlo por fichero.
- Al cerrar la sesión: actualizar 05_SESSION_LOG.md + este fichero.
- Marcar la sesión completada en el plan de 01_ROADMAP.md §Bloque F4.

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
