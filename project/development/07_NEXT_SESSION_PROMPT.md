Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 74**.

Protocolo de arranque:

Lee `00_FOUNDATION.md` (las 5 reglas del juego). ✅ §11 ya describe la realidad: el CI **sí** bloquea por type-check desde la s.73; el Lint sigue advisory y está anotado.
Lee `CLAUDE.md` — **REGLA 0 primero** (cómo se informa al founder) y el norte como FILTRO, no como cita.
Lee la última entrada de `05_SESSION_LOG.md` (Sesión 73).
Confirma con "listo" antes de proponer nada.

---

## 📍 DE DÓNDE VENIMOS (s.73)

Sesión larga de saneamiento. **27 commits, `40314ef..b1050a9`, todo pusheado, CI verde.**

- **Tipos: 107 → 0.** El CI **ya bloquea** por `npm run type-check` (`2d82f25`).
- **Lint: 404 → 140.** Los ficheros de test están a **0**; los 140 son todos de producción.
- **1174 tests**, incluida la **primera prueba que arranca la aplicación de verdad** (`nucleo.smoke.test.tsx`).
- **6 bugs reales** cazados por el compilador y el lint — ninguno por un test. El peor: **la licencia no se guardaba en ningún backup ni viajaba en el sync** (desde el `Initial commit`, ~2 meses).

⚠️ **El founder frenó la sesión** porque recomendé bajar una regla a *warn* para "cerrar antes". Su instrucción, literal: **"quiero una aplicación limpia de errores y de basura que esté perfecta para su ejecución, y si eso requiere varias sesiones, nos tocará trabajar."** No proponer atajos.

---

## 🎯 FOCO DE ESTA SESIÓN

### 1. Terminar el lint hasta 0 (encargo explícito)
Método probado: **por causa raíz, no error a error**. Cada bloque, un commit, con type-check + tests verdes.

| Bloque | Errores | Nota |
|---|---|---|
| `any` repartidos en producción | ~53 | Ya sin concentración: 2-6 por fichero |
| `set-state-in-effect` | 16 | 🔴 **Leer uno a uno: aquí puede haber bugs de verdad** (renders en cascada, estado que se pisa) |
| `react-refresh/only-export-components` | 16 | Solo afecta al recargado en caliente en desarrollo |
| Sueltos a mano (unused, `no-empty`, memoization, refs) | ~55 | Los `refs` son un patrón deliberado ya documentado (`06_BACKLOG.md` §3) |

**Cuando llegue a 0:** quitar el `continue-on-error: true` del paso de Lint en `.github/workflows/ci.yml` y actualizar la nota de `00_FOUNDATION.md` §11.

### 2. 🔴 Pruebas del founder en iPhone — LA RUTA CRÍTICA
Llevan **7 sesiones** pendientes y **no las desbloquea ningún código mío**: A3 (onboarding con testers), A5 (Safari iOS), A6 (sync real). Sin ellas no hay beta, y la beta es Q4 2026 (confirmado por el founder el 22/07).
De paso, validar lo de esta sesión: **borrar una regla de auto-categorización** (antes no hacía nada) y el **Centro de Ayuda en modo oscuro** (antes se pintaba en claro).

### 3. Dos decisiones de producto pendientes del founder
Ver `06_BACKLOG.md` §0.4. Son funcionalidad escrita y nunca conectada; hay que decidir antes de borrarla o cablearla.

### 4. Arrastradas
`src/config/layers.ts` (escala de capas) · test de `useLoanAmortization` (mueve dinero real y no tiene test) · **"Proyecciones con confirmación"** (`11_...md`, espera desde la s.59) · materiales de beta (`09_BETA_READINESS.md` §E).

---

## 🔴 RECORDATORIOS OPERATIVOS

- **REGLA 0 de `CLAUDE.md`**: nada de "verificado/limpio/funciona" sin decir con qué comando y con qué resultado. Y antes de fiarse de una comprobación, **comprobar que sabe fallar** (en la s.73 se hizo dos veces: reintroduciendo el bug a propósito).
- **Baselines: 0 tipos · 140 lint · 1174 tests.** Cualquier error de tipos que aparezca ahora es NUEVO.
- **Verificar con `npm run type-check`**, nunca `npx tsc --noEmit` a secas.
- **`encryptedStorage` tiene whitelist**: esas claves van en claro y se leen con `localStorage` directo. Usar los helpers cifrados con ellas **ya lanza excepción** en dev/tests.
- **Los modales se portean a `document.body`**: en los tests se consultan con `screen`, nunca con el `container`.
- **El founder factura por token** — no verbose, no bucles, no verificaciones que él hace en 30s.

## ESTADO: tipos 0 · CI = gate real · lint 404→140 · 1174 tests · 6 bugs reales corregidos. Todo pusheado.

Cuando hayas leído los .md, dime "listo".
