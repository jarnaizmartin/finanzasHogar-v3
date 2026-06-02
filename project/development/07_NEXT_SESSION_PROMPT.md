Hola. Retomamos proyecto finanzasHogar-v3.

Protocolo de arranque:

Lee primero 00_FOUNDATION.md (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de 05_SESSION_LOG.md para saber dónde lo dejamos.
Lee §F4-P→Y en 01_ROADMAP.md §Próximo hito inmediato antes de proponer nada.
Confirma que has entendido el contexto antes de proponer nada.

---

## ⚠️ CONTEXTO CRÍTICO — LEER ANTES DE NADA

**F4-A→O estaba INCOMPLETO.** Los dicts (es/en/fr/pt-br) tienen las traducciones bien, pero los componentes siguen con strings hardcodeados. F4-P→X ✅ completadas. Solo queda **F4-Y: componentes sueltos**.

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
| 3 | 🔄 EN CURSO — F4 dicts OK · F4-P→X ✅ · F4-Y pendiente (última sesión) |
| 4+ | ⏳ Pendiente |

Tests: **962 pasando**. Rama: `main` — 11 commits por pushear a `origin/main` (push pendiente).

---

## Plan F4-P→Y

| Sesión | Target | Estado |
|---|---|---|
| **F4-P** | AppShell: TABS + modal settings + modal delete + RatesWidgets | ✅ HECHO (01/06/2026) |
| **F4-Q** | Dashboard view + hero card KPIs + account type labels | ✅ HECHO (01/06/2026) |
| **F4-R** | AlertsPanel completo | ✅ HECHO (01/06/2026) |
| **F4-S** | RealExpenses + RealExpenseFormModal | ✅ HECHO (02/06/2026) |
| **F4-T** | Accounts + AccountFormModal | ✅ HECHO (02/06/2026) |
| **F4-U** | Projections + ProjectionFormModal | ✅ HECHO (02/06/2026) |
| **F4-V** | TrendsView + trend components | ✅ HECHO (02/06/2026) |
| **F4-W** | Goals + Forecast + ProjectedVsReal | ✅ HECHO (02/06/2026) |
| **F4-X** | Transfers + Categories | ✅ HECHO (02/06/2026) |
| **F4-Y** | Componentes sueltos | ← ESTA SESIÓN |

---

## Lo que toca esta sesión: F4-Y — Componentes sueltos

**Ficheros objetivo (inventariados con grep, strings hardcodeados confirmados):**

| Fichero | Strings pendientes |
|---|---|
| `src/views/LockScreen.tsx` | 6 × `<h2>` en español (App bloqueada, Frase de recuperación, Fichero de recuperación, Recuperación por email, Introduce el código, Nueva contraseña) |
| `src/components/UI.tsx` | Print cover: "Informe Financiero Personal", "FinanzasHogar", "Generado el", "Confidencial…" + `<option>Ingreso</option>` + `<option>Gasto</option>` |
| `src/components/BackupPasswordModal.tsx` | 1 string: aviso "⚠️ Importante: Si pierdes esta contraseña…" |
| `src/components/CreditCardPaymentModal.tsx` | 2 strings: referencias a "Cuentas" y "Transferencias" |
| `src/components/CreditCardTopCategories.tsx` | 1 string: sugerencia de ir a "Movimientos" |

**Nota antes de arrancar:** hacer un grep más completo en estos ficheros (buscar también `placeholder=`, template literals con español, `toast(`, `t(` ausentes) — el inventario de arriba es de JSX text, puede haber más.

**Orden recomendado:**
1. Leer cada fichero para inventariar strings hardcodeados completamente
2. Comprobar qué claves ya existen en `src/i18n/es.ts`
3. Añadir claves que falten a los 4 dicts
4. Reemplazar strings en los componentes
5. type-check + vitest
6. **Verificar visualmente en EN antes de commitear**
7. Un commit

**Tras F4-Y:** F4 completa → actualizar `01_ROADMAP.md` marcando Fase 3 como ✅ COMPLETA → PR o push a origin/main.

---

## Recordatorios operativos

- BUSCAR / REEMPLAZAR con bloques exactos y completos. Leer el fichero antes de editar.
- Un commit por sesión completada y verificada.
- Verificación visual EN es OBLIGATORIA antes de cerrar.
- Al cerrar la sesión: actualizar 05_SESSION_LOG.md + este fichero + marcar la sesión en el plan.
- **Push pendiente:** `main` tiene 11 commits por delante de `origin/main` — pushear al terminar F4-Y.

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
