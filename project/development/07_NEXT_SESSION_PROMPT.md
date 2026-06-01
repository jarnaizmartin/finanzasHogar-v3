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
| 3 | 🔄 EN CURSO — F4-A→O ✅ COMPLETO · queda: formatos Intl |
| 4+ | ⏳ Pendiente |

Tests: **962 pasando**. Rama: `feat/i18n-help` (pendiente PR + merge).

---

## Estado de Fase 3 — F4 completado

**Todos los namespaces completados (A→O):** `common`, `goals`, `dashboard`, `accounts`, `projections`, `realExpenses`, `transfers`, `categories`, `bankImport`, `calendar`, `trends`, `reports`, `creditCards`, `security`, `onboarding`, `misc`, `alerts.content`, `legal`, **`help`**.

**Setup de tests:** `test-setup.ts` tiene mock global de `react-i18next` que resuelve claves ES automáticamente.

### Lo que toca esta sesión

**Opción 1 — PR + merge primero:**
Abrir PR de `feat/i18n-help` → merge a main → CI verde → actualizar docs.

**Opción 2 — Formatos `Intl` (sesión corta):**
Adaptar fechas, divisas y separadores numéricos según el locale activo.
- Fechas: usar `Intl.DateTimeFormat` según locale (es-ES, en-US, fr-FR, pt-BR)
- Divisas: `Intl.NumberFormat` con `style: 'currency'` — respetar posición símbolo por locale
- Separadores: coma vs punto según locale
- Buscar todos los `toLocaleDateString` / `toFixed` / formato manual en el código y centralizar

**Recomendación:** hacer el PR primero (5 min) y luego Intl si hay tiempo.

---

## Recordatorios operativos

- BUSCAR / REEMPLAZAR con bloques exactos y completos. Leer el fichero antes de editar.
- Un commit por tarea completada.
- `test-setup.ts` ya tiene el mock de react-i18next — no hace falta añadirlo por fichero.
- Al cerrar la sesión: actualizar 05_SESSION_LOG.md + este fichero.

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
