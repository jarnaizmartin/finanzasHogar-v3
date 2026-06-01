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
| 3 | 🔄 EN CURSO — F1/F2/F3 ✅ · F4 en progreso (sesión 11) |
| 4+ | ⏳ Pendiente |

Tests: **962 pasando**. `main`: CI verde, build verde.

---

## Estado de Fase 3 — F4 (extracción de strings)

**Namespaces completos (11):** `common`, `goals` (+ wizard), `dashboard`, `accounts`, `projections` (+ list + frequencies + analysis), `realExpenses`, `transfers`, `categories`.

**27 ficheros wired** con `useTranslation`. Plan completo con 14 sesiones pendientes en `01_ROADMAP.md §Bloque F4`.

### Lo que toca esta sesión: F4-B

**`accounts` extension** (~25 strings):
- `AccountsSummary.tsx` (~4): resumen patrimonial
- `RegularAccountCard.tsx` (~2): labels de tarjeta
- `CreditCardAccountCard.tsx` (~4): labels tarjeta crédito
- `LoanAccountCard.tsx` (~3): labels préstamo
- `LoanDetailView.tsx` (~9): detalle préstamo, amortizaciones
- `AmortizationHistory.tsx` (~3): historial amortizaciones
- Namespace: ampliar `accounts` (ya existe con 9 claves)

**Orden recomendado:**
1. Localizar todos los ficheros con glob/grep
2. Auditar strings de cada fichero antes de tocar nada
3. Definir todas las claves nuevas en ES → traducir a EN/PT-BR/FR → aplicar en componentes
4. type-check + vitest run al finalizar
5. Un commit por namespace (todos los ficheros de `accounts` van en un solo commit)

---

## Estado de Fase 2 (bloqueante activo)

- Bloque E3 bloqueada hasta naming definitivo + dominio
- Naming: 6 finalistas (NORTIA, AEQUORA, TENUIA, AEVITAS, STABILA, AEQUILA)
- Fase C (filtro técnico) pendiente desde sesión comercial 3

---

## Recordatorios operativos

- BUSCAR / REEMPLAZAR con bloques exactos y completos. Leer el fichero antes de editar.
- No mezclar lógica con strings. Un commit por namespace completado.
- Vigilar colisiones de nombres de variable con `t` (el hook de useTranslation).
- Al cerrar la sesión: actualizar 05_SESSION_LOG.md + este fichero.
- Marcar la sesión completada en el plan de 01_ROADMAP.md §Bloque F4.

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
