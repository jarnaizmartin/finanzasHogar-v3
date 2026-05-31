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
| 3 | 🔄 EN CURSO — F1/F2/F3 ✅ · F4 en progreso (sesión 10) |
| 4+ | ⏳ Pendiente |

Tests: **962 pasando**. `main`: CI verde, build verde.

---

## Estado de Fase 3 — F4 (extracción de strings)

**Namespaces completos:** `common` (21 claves), `goals`, `dashboard`, `accounts`, `projections`, `realExpenses`, `transfers`, `categories`.

**24 ficheros wired** con `useTranslation`. Plan completo con 15 sesiones pendientes en `01_ROADMAP.md §Bloque F4`.

### Lo que toca esta sesión: F4-A

**GoalWizard.tsx** (~24 strings):
- Wizard de creación de objetivos — muchos field labels, pasos, modos, resumen final
- Namespace: ampliar `goals` (ya existe, añadir sub-clave `wizard`)
- Leer el fichero antes de tocar nada (es complejo, ~900 LOC)

**ProjectionListItem.tsx** (~24 strings):
- Lista de proyecciones — labels de tipo, frecuencia, estado, alertas, acciones
- Namespace: ampliar `projections` (ya existe, añadir sub-clave `list`)
- Revisar si hay colisión de variables (como pasó con `t` en Projections.tsx)

**Orden recomendado:**
1. Auditar strings de ambos ficheros con grep antes de tocar nada
2. Definir las claves nuevas en ES → traducir a EN/PT-BR/FR → aplicar en componentes
3. type-check + vitest run tras cada fichero
4. Commit al cerrar cada fichero (no juntar los dos en un solo commit)

---

## Estado de Fase 2 (bloqueante activo)

- Bloque E3 bloqueada hasta naming definitivo + dominio
- Naming: 6 finalistas (NORTIA, AEQUORA, TENUIA, AEVITAS, STABILA, AEQUILA)
- Fase C (filtro técnico) pendiente desde sesión comercial 3
- Si el founder tiene tiempo: resolver naming primero → desbloquea E3 → Fase 2 CERRADA

---

## Recordatorios operativos

- BUSCAR / REEMPLAZAR con bloques exactos y completos. Leer el fichero antes de editar.
- No mezclar lógica con strings. Un commit por fichero traducido.
- Vigilar colisiones de nombres de variable con `t` (el hook de useTranslation).
- Al cerrar la sesión: actualizar 05_SESSION_LOG.md + este fichero.
- Marcar la sesión completada en el plan de 01_ROADMAP.md §Bloque F4.

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
