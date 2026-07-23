Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 75**.

Protocolo de arranque:

Lee `00_FOUNDATION.md` (las 5 reglas del juego). El CI bloquea por type-check desde la s.73; el Lint sigue advisory (`continue-on-error`) — se quita cuando el lint llegue a 0.
Lee `CLAUDE.md` — **REGLA 0 primero** (cómo se informa al founder) y el norte como FILTRO, no como cita.
Lee la última entrada de `05_SESSION_LOG.md` (Sesión 74).
Confirma con "listo" antes de proponer nada.

---

## 📍 DE DÓNDE VENIMOS (s.74)

Sesión de limpieza de lint. **8 commits, `6ba92d4..d2c153d`, todo pusheado.**

- **Lint: 404 → 16.** Todo lo que no era decisión del founder está a **0**: `no-explicit-any` 50→0, `no-unused-vars` 29→0, `set-state-in-effect` 16→0, `rules-of-hooks`/`static-components`/`refs`/`preserve-manual-memoization`/`no-empty`/`no-unused-expressions` → 0.
- **Los 16 que quedan son TODOS `react-refresh/only-export-components`** = un único refactor pendiente.
- **3 hallazgos reales** cazados al tipar (ninguno por un test): Tendencias pintaba 📦 en toda categoría (`cat.emoji` no existe) · el bug del `undefined as any` del s.73 repetido 18 veces (no borra la clave del error) · `ActivationModal` de licencia inalcanzable.
- **1174 tests** y **type-check exit 0** verdes en cada commit.

⚠️ Método acordado con el founder: **por causa raíz, sin atajos.** Un `eslint-disable-next-line` con MOTIVO en una línea donde la regla es falso positivo (efecto de I/O externo, memo que el React Compiler no preserva) NO es el atajo del s.73 — mantiene la regla estricta para todo lo demás. Bajar una regla a `warn` o a nivel de fichero SÍ lo sería.

---

## 🎯 FOCO DE ESTA SESIÓN

### 1. react-refresh → 0 (el último grupo de lint) — decisión del founder: SPLIT, no disable
Detalle completo en `06_BACKLOG.md §0.5`. 11 ficheros de contexto exportan Provider + hook + context juntos, lo que rompe el Fast Refresh en desarrollo (**solo dev-HMR, cero impacto en producción/correctitud**). Hay que **partir cada uno**: mover el hook/const a un fichero aparte y actualizar imports.

- **Alcance:** ~89 imports en toda la app + ~11 ficheros nuevos. Riesgo de correctitud BAJO (TS + 1174 tests cazan cualquier import roto) pero es trabajo mecánico concentrado.
- **Método:** **un contexto por commit, `npm run type-check` + tests verdes tras cada uno.** No big-bang.
- **Orden sugerido:** empezar por los baratos (Legal `LEGAL_DOCS` 2 imports · CoachMarksTour helpers 1-2 · useLicense/useTour/useUI 3) y terminar por los gordos (useToast 22 · DataContext 13 · useSecurityContext 10).
- **Al llegar a 0:** quitar `continue-on-error: true` del paso de Lint en `.github/workflows/ci.yml` y actualizar la nota de `00_FOUNDATION.md` §11 (el Lint pasa a ser gate real).

### 2. 🔴 Pruebas del founder en iPhone — LA RUTA CRÍTICA
Llevan **8 sesiones** pendientes y **no las desbloquea ningún código mío**: A3 (onboarding con testers), A5 (Safari iOS), A6 (sync real). Sin ellas no hay beta (Q4 2026). De paso, validar en dispositivo lo del s.73-74: borrar regla de auto-categorización, Centro de Ayuda en oscuro, y que Tendencias ahora sí pinta los iconos reales de cada categoría (no 📦).

### 3. Arrastradas
`src/config/layers.ts` (escala de capas) · test de `useLoanAmortization` (mueve dinero real y no tiene test) · **"Proyecciones con confirmación"** (`11_...md`, desde s.59) · materiales de beta (`09_BETA_READINESS.md` §E) · `ActivationModal` de licencia (§0.4, decidir en Fase 6).

---

## 🔴 RECORDATORIOS OPERATIVOS

- **REGLA 0 de `CLAUDE.md`**: nada de "verificado/limpio/funciona" sin decir con qué comando y con qué resultado. Y antes de fiarse de una comprobación, **comprobar que sabe fallar**.
- **Baselines: 0 tipos · 16 lint (todos react-refresh) · 1174 tests.** Cualquier error de tipos o lint fuera de react-refresh que aparezca ahora es NUEVO.
- **Verificar con `npm run type-check`**, nunca `npx tsc --noEmit` a secas.
- **`encryptedStorage` tiene whitelist**: esas claves van en claro; usar los helpers cifrados con ellas **lanza excepción** en dev/tests.
- **Los modales se portean a `document.body`**: en los tests se consultan con `screen`, nunca con el `container`.
- **El founder no es técnico y factura por token** — no trasladarle decisiones técnicas (delega en el asistente), no verbose, no bucles. Si algo es decisión suya de PRODUCTO, explicárselo en simple.

## ESTADO: lint 404→16 (solo react-refresh) · tipos 0 · 1174 tests · 3 hallazgos reales. Todo pusheado.

Cuando hayas leído los .md, dime "listo".
