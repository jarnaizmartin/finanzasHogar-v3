Hola. Retomamos proyecto finanzasHogar-v3.

Protocolo de arranque:

Lee primero 00_FOUNDATION.md (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de 05_SESSION_LOG.md para saber dónde lo dejamos.
Lee §F4-P→Y en 01_ROADMAP.md §Próximo hito inmediato antes de proponer nada.
Confirma que has entendido el contexto antes de proponer nada.

---

## ⚠️ CONTEXTO CRÍTICO — LEER ANTES DE NADA

**F4-A→O estaba INCOMPLETO.** Los dicts (es/en/fr/pt-br) tienen las traducciones bien, pero los componentes siguen con strings hardcodeados. Cobertura real ~45%. Se necesitan ~7 sesiones más (F4-S→Y).

**Protocolo obligatorio al cerrar cada sesión F4-X:**
1. Arrancar app local
2. Cambiar idioma a EN en la app
3. Navegar la sección trabajada
4. Solo commitear si TODO está visualmente en inglés
5. Si algo queda en español, corregirlo antes de cerrar

**NO declarar ninguna sesión completa sin haber ejecutado ese protocolo.**

---

## Estado de fases

| Fase | Estado |
|---|---|
| 0.5 | ✅ COMPLETA |
| 1 | ✅ COMPLETA |
| 2 | 🔄 EN CURSO — E3 bloqueada (naming pendiente) |
| 3 | 🔄 EN CURSO — F4 dicts OK · F4-P/Q/R ✅ · F4-S→Y pendiente |
| 4+ | ⏳ Pendiente |

Tests: **962 pasando**. Rama: `feat/f4-remaining-wiring` (sin PR todavía).

---

## Plan F4-P→Y

| Sesión | Target | Prioridad | Estado |
|---|---|---|---|
| **F4-P** | AppShell: TABS + modal settings + modal delete + RatesWidgets | ✅ HECHO (01/06/2026) |
| **F4-Q** | Dashboard view + hero card KPIs + account type labels | ✅ HECHO (01/06/2026) |
| **F4-R** | AlertsPanel completo | ✅ HECHO (01/06/2026) |
| **F4-S** | RealExpenses + RealExpenseFormModal | ✅ HECHO (02/06/2026) |
| **F4-T** | Accounts + AccountFormModal | ✅ HECHO (02/06/2026) |
| **F4-U** | Projections + ProjectionFormModal | ✅ HECHO (02/06/2026) |
| **F4-V** | TrendsView + trend components | ✅ HECHO (02/06/2026) |
| **F4-W** | Goals + Forecast + ProjectedVsReal | ✅ HECHO (02/06/2026) |
| **F4-X** | Transfers + Categories | 🟡 MEDIA | ← ESTA SESIÓN |
| **F4-Y** | Componentes sueltos (CreditCardHealth, StickyBar, UI.tsx…) | 🟡 MEDIA | ⏳ |

---

## Lo que toca esta sesión: F4-X — Transfers + Categories

**Ficheros objetivo:**
- `src/views/Transfers.tsx` — cabecera, KPIs, modal de nuevo traspaso, estado vacío
- `src/views/Categories.tsx` — cabecera, formulario de categoría

**Nota F4-W:** bug importante detectado — `useMemo` con `monthLabel` no incluía `i18next.language` → meses siempre en español. Patrón: buscar otros `useMemo` que llamen funciones de `i18nFormats.ts` (fmtMonthYear, monthLabel, etc.) en `AppProvider.tsx` y asegurarse de que tienen `i18next.language` como dep.

**Orden recomendado:**
1. Leer cada fichero para inventariar strings hardcodeados
2. Comprobar qué claves ya existen en `src/i18n/es.ts` (namespaces `transfers`, `categories`)
3. Añadir claves que falten a los 4 dicts
4. Reemplazar strings en los componentes
5. type-check + vitest
6. **Verificar visualmente en EN antes de commitear**
7. Un commit

---

## Recordatorios operativos

- BUSCAR / REEMPLAZAR con bloques exactos y completos. Leer el fichero antes de editar.
- Un commit por sesión completada y verificada.
- Verificación visual EN es OBLIGATORIA antes de cerrar.
- Al cerrar la sesión: actualizar 05_SESSION_LOG.md + este fichero + marcar la sesión en el plan.

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
