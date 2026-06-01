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
| 3 | 🔄 EN CURSO — F4 en progreso (sesión 24) |
| 4+ | ⏳ Pendiente |

Tests: **962 pasando**. Rama: `feature/f4-remaining`.

---

## Estado de Fase 3 — F4 (extracción de strings)

**Namespaces completados (A→N):** `common`, `goals`, `dashboard`, `accounts`, `projections`, `realExpenses`, `transfers`, `categories`, `bankImport`, `calendar`, `trends`, `reports`, `creditCards`, `security`, `onboarding`, `misc`, `alerts.content`, **`legal`**.

**Setup de tests:** `test-setup.ts` tiene mock global de `react-i18next` que resuelve claves ES automáticamente.

### Lo que toca esta sesión: F4-O

**`help` namespace** (la tarea de contenido más grande del proyecto):

**Ficheros a tocar:**
- `lib/helpCenterData.ts` (~717 líneas): datos puros — MANUAL_SECTIONS (8 secciones × ~5 bloques), FAQ_CATEGORIES, SHORTCUTS
- `views/HelpCenter.tsx` y subvistas (HelpHomeView, HelpFAQView, etc.)

**Decisión de arquitectura (tomar al inicio):**
- **Opción A:** mover contenido a namespace `help` en diccionarios i18n + usar `i18next.t()` directo en `helpCenterData.ts` (sin hooks — es un archivo de datos puro)
- **Opción B:** crear archivos de datos por idioma (`helpCenterData.en.ts`, etc.) — más mantenible para texto largo pero más ficheros

El patrón de F4-M (`alertGenerators.ts` usa `at()` helper con `i18next.t()`) es válido para Opción A.

**Orden recomendado:**
1. Leer `lib/helpCenterData.ts` completo para entender la estructura real
2. Decidir arquitectura (A vs B)
3. Auditar strings en HelpCenter.tsx y subvistas
4. Definir claves ES → traducir a EN/PT-BR/FR → aplicar
5. type-check + vitest run
6. Un commit

---

## Recordatorios operativos

- BUSCAR / REEMPLAZAR con bloques exactos y completos. Leer el fichero antes de editar.
- Un commit por namespace completado.
- `common.coachCta` ya existe — úsalo para botones '¡Entendido! →'.
- `common.close` ya existe — úsalo para botones "Cerrar".
- `test-setup.ts` ya tiene el mock de react-i18next — no hace falta añadirlo por fichero.
- Al cerrar la sesión: actualizar 05_SESSION_LOG.md + este fichero.
- Marcar la sesión completada en el plan de 01_ROADMAP.md §Bloque F4.

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
