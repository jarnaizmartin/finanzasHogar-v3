# 06 — BACKLOG

> Lista priorizada de trabajo pendiente: refactors, tests, decisiones técnicas y mejoras estructurales.
> Mover items a `03_REFACTOR_LOG.md` cuando se completen.
> Última actualización: 16/07/2026 (s.71 — +3 deudas de calidad descubiertas al activar el type-check)

---

## 0. 🔴 Deuda de calidad — abierta en la s.71, casi cerrada en la s.73

### 0.1 · ✅ CI diagnosticado (s.72) y ARREGLADO (s.73)
Nunca fallaba por diseño: `continue-on-error` en Lint + **sin** paso de type-check + `vite build` que no comprueba tipos. Desde `2d82f25` el workflow ejecuta **`npm run type-check` como paso bloqueante**. `00_FOUNDATION.md` §11 corregido para describir la realidad.

### 0.3bis · 🔴 LO ÚNICO QUE QUEDA: bajar el lint a 0 y quitarle el `continue-on-error`
**Encargo explícito del founder (22/07/2026):** *"quiero una aplicación limpia de errores y de basura que esté perfecta para su ejecución, y si eso requiere varias sesiones, nos tocará trabajar."* **No proponer atajos** (bajar una regla a `warn` es la misma trampa que el `continue-on-error`).

Estado: **404 → 140 errores**. Los ficheros de test están a **0**; los 140 son de producción:
- ~53 `any` repartidos (2-6 por fichero).
- **16 `react-hooks/set-state-in-effect`** → 🔴 leer uno a uno: renders en cascada, ahí puede haber bugs reales.
- 16 `react-refresh/only-export-components` → solo afecta al recargado en caliente en desarrollo.
- ~55 sueltos (unused, `no-empty`, memoization, refs — los `refs` son patrón deliberado, ver §3).

**Al llegar a 0:** quitar `continue-on-error: true` del paso Lint en `.github/workflows/ci.yml` + actualizar la nota de `00_FOUNDATION.md` §11.

### 0.4 · 🟠 Dos decisiones de PRODUCTO pendientes del founder (s.73)
Salieron como "código muerto" al limpiar el lint, pero son **funcionalidad escrita y nunca conectada**. Hay que decidir antes de borrarla o cablearla:
- **Deuda total de préstamos en el Resumen.** `Dashboard` calcula `totalLoanDebt` y **no lo pinta**: enseña cuota mensual e intereses anuales, pero no cuánto se debe en total. ¿KPI que falta o se quita?
- **"No volver a avisar" en la franja de alertas.** La función existe en `AlertsBanner` pero no hay botón; el panel completo sí lo tiene. *Recomendación del asistente: dejarlo solo en el panel* — desactivar avisos para siempre no debería estar a un toque en una franja de paso.

### 0.2 · ✅ Los errores de tipos: 611 → 251 → 107 → **0** (s.71-73)
`npx tsc --noEmit` a secas **no comprobaba nada** (tsconfig raíz de referencias con `files: []` → devolvía 0 siempre) y **el CI no corre type-check** (`vite build` no comprueba tipos: esbuild los borra). `00_FOUNDATION.md` §11 describe un gate **que no existe** → hay que corregir ese documento o el CI, pero no dejarlo mintiendo.

Medido en s.71: **611 → 251** con 2 líneas (`vitest/globals` −207 · `T: Theme` en SettingsContext −150 · import `Category` −2, commit `d57ea9a`). Script nuevo: **`npm run type-check`**.

Los **251 restantes son tipados laxos reales**, no ruido: `Account.currency` opcional pasándose donde se exige obligatorio, `unknown`→`string`, etc. **Ya escondían 2 crashes en producción** (`0a1742f` ADMIN · `dff6bdb` borrado selectivo). Opciones:
- **(a)** Congelar el número y bajarlo al tocar cada archivo (recomendado: no bloquea beta, no para el trabajo).
- **(b)** Sesión dedicada de saneamiento.
- **(c)** Dejarlo y asumir el riesgo.
⚠️ NO meter el type-check en el CI como bloqueante mientras haya 251: quedaría rojo permanente y se dejaría de mirar (peor que no tenerlo).

### 0.3 · `src/config/layers.ts` — escala de capas nombrada
**Ha mordido 3 veces en un solo día** (s.71) y ya venía de s.56 y s.58. Cada overlay se inventa su z-index: duplicados **100** · legal 200→**10050** · borrado **100** · tour **9000** · onboarding **9999** · coachmark **99996** · el **110** puesto a ojo en `dff6bdb`. Síntoma recurrente: un modal presente en el DOM pero **invisible detrás de otro** → "el botón no hace nada".
Propuesta: un único módulo con la escala nombrada y comentada, y que todo overlay la use. Es **refactor**: no mezclar con features ni fixes.

---

## 1. Refactors pendientes (monstruos)

### ✅ Completados en Fase 1 (ver `03_REFACTOR_LOG.md`)

| Archivo | LOC original | LOC final | Fecha |
|---------|-------------|-----------|-------|
| ~~`src/BankImportModal.tsx`~~ | 2.221 | 242 | 29/05/2026 |
| ~~`src/HelpCenter.tsx`~~ | 2.077 | 226 | 29/05/2026 |
| ~~`src/views/SecuritySetup.tsx`~~ | 1.296 | 146 | 30/05/2026 |
| ~~`src/views/TrendsView.tsx`~~ | 1.223 | 58 | 30/05/2026 |
| ~~`src/CalendarView.tsx`~~ | 1.946 | 189 | 31/05/2026 |

### 🔥 Prioridad ALTA — Próximo objetivo

*(Fase 1 completa — no hay monstruos prioritarios pendientes)*

### 🟠 Prioridad MEDIA — Siguiente tanda

*(vacío)*

### 🟡 Prioridad BAJA — A futuro (post-Fase 2)

| # | Archivo                                  | LOC   | Notas |
|---|------------------------------------------|-------|-------|
| 1 | `src/AppShell.tsx`                       | 1.243 | Shell de la app, tocar con cuidado. |
| 2 | `src/components/UI.tsx`                  | 1.178 | Barril de UI. Partir por familias de componentes. |
| 3 | `src/components/AccountFormModal.tsx`    | 1.173 | Modal grande. Pendiente desde refactor de Accounts. |
| 4 | `src/components/ProjectionFormModal.tsx` | 1.170 | Modal grande. |
| 5 | `src/components/AmortizationFormModal.tsx`| 647  | Pendiente desde refactor de Accounts. Tiene deuda UX (ver §3). |
| 6 | `src/views/Transfers.tsx`                | 834   | Manejable, no urgente. |
| 7 | `src/views/Categories.tsx`               | 829   | Manejable. |
| 8 | `src/GettingStarted.tsx`                 | 831   | Manejable. |
| 9 | `src/views/Dashboard.tsx`                | 797   | Manejable. |
| 10| `src/views/Projections.tsx`              | 799   | Manejable. |
| 11| `src/views/ProjectedVsReal.tsx`          | 773   | Manejable. |
| 12| `src/views/AlertsPanel.tsx`              | 771   | Manejable. |

---

## 1.5 Decisiones de terminología pendientes

- [ ] **Label "Transferencia" → "Traspaso"** (s.58). El founder vio que el badge `badgeTransfer` (`src/i18n/es.ts:946`, `'↔ Transferencia'`) dice "Transferencia" y querría "Traspaso". Pero toda la feature se llama "Transferencias" (título de la vista, toasts, descripciones auto `'Transferencia → X'`…). **Decisión:** ¿solo el badge o renombrar la feature entera? ¿solo ES o los 6 idiomas? El founder lo marcó como "lo de menos" → no urgente.

---

## 2. Tests pendientes

### 🟠 Deuda media (refactor reciente sin tests propios)

- [ ] **`hooks/useLoanAmortization.ts`** (refactor 24/05 2ª sesión) — **prioritario** porque mueve dinero real.
- [ ] Tests unitarios para los 4 componentes nuevos de Accounts:
  - `components/AccountsSummary.tsx`
  - `components/CreditCardAccountCard.tsx`
  - `components/LoanAccountCard.tsx`
  - `components/RegularAccountCard.tsx`
- [ ] Tests unitarios para `components/GoalCard.tsx` (615 LOC) y `components/GoalWizard.tsx` (865 LOC). Refactor hecho 24/05/2026 cubierto solo por regresión.
- [ ] Test de integración para `src/Reports.tsx` (post-refactor, 578 LOC).
- [ ] Test propio para `src/components/real/RealExpensesAnalysis.tsx`.
- [ ] **Bug menor en `RealExpenseFormModal.tsx`:** warning `React does not recognize the T prop on a DOM element`. Hay un spread `{...props}` que filtra una prop `T` al DOM. 5 min de fix. Detectado 23/05/2026 al correr tests.
- [ ] **🐛 Bugs UX en `RulesEditorModal` (eliminar regla)** — `[AHORA · BK1/BK2]` Detectados durante refactor BankImportModal commit 3/8. Son **preexistentes**, no introducidos por el refactor.
  - **BK1 — Toast no visible `[AHORA]`:** al eliminar una regla, `toast('Regla eliminada', 'success')` se dispara pero no se ve. Causa probable: el modal usa `zIndex: 999999` y el `ToastContainer` queda detrás. Fix sugerido: subir `zIndex` del toast por encima del modal, o renderizar el toast dentro del portal del modal.
  - **BK2 — Falta confirmación de borrado `[AHORA]`:** el botón 🗑️ elimina la regla sin preguntar. Añadir `confirm()` nativo o modal de confirmación. Revisar también si aplica al botón de eliminar filas en el preview del wizard.
  - **Archivo:** `src/components/bank-import/RulesEditorModal.tsx`.

### 🟢 Cerrado en sesión 24/05/2026 (2ª sesión)

- [x] ~~Tests unitarios para los 8 componentes de `src/components/reports/`~~ ✅ **HECHO** (81 tests, ver `03_REFACTOR_LOG.md`).

### 🟠 Tests pendientes a medio plazo

- [ ] Test de integración smoke para vistas grandes sin refactorizar.

---

## 3. Decisiones técnicas pendientes

### 🟡 UX del modal de amortización `[FASE 4 · BK3]`

**Problema detectado durante refactor de Accounts (24/05 2ª sesión):** cuando un préstamo tiene `monthlyPayment` inconsistente (ej. 0 por bug histórico ya corregido), al elegir "Reducir plazo" el modal muestra el mensaje técnico *"La cuota actual no cubre los intereses…"* que es confuso para el usuario.

**Decisión:** abordar en Fase 4 junto con el rediseño del modal de amortización. Reclasificado de Fase 2 → Fase 4 en sesión 02/06/2026.

### 🟠 Crypto / IO sin tests

**Módulos afectados:** `backupCrypto`, `crypto`, `encryptedStorage`, `storageCrypto`, `vaultKey`, `web3forms`.

**Decisión a tomar:**
- **Opción A:** Testear con mocks de WebCrypto/fetch → trabajo considerable.
- **Opción B:** Aceptar como "infra no testeable unitariamente" y cubrir con tests E2E.
- **Opción C:** Mix — mocks para los más críticos (`vaultKey`, `backupCrypto`), aceptar el resto.

**Estado:** sin decidir. Discutir en próxima sesión de planificación.

### 🟢 Deuda de lint — `react-hooks/refs` silenciado en 3 puntos

**Contexto (24/05/2026, sesión limpieza lint):** ESLint marcaba 12 errores `react-hooks/refs` por mutar `ref.current = …` durante el render. Tras análisis (ver conversación), se confirmó que es un **patrón deliberado y validado empíricamente** para que `useCallback`/`useEffect` sin deps lean siempre el último valor sin recrearse.

**Puntos afectados:**
- `src/AppProvider.tsx` — bloque de refs de backup (10 líneas).
- `src/hooks/useExchangeRates.ts` — `statusRef.current = data.status` (FIX 8).
- `src/hooks/useLocalStorage.ts` — `valueRef.current = value`.

**Decisión:** silenciar la regla solo en esos puntos con `eslint-disable-next-line` + comentario justificativo. **NO** refactorizar a `useEffect` porque introduciría un gap de 1 render donde callbacks leerían datos del render anterior.

**Reevaluar si:**
- Se activa `<React.StrictMode>` en `main.tsx` (actualmente no está).
- Se adoptan features concurrentes de React 18+.
- Aparece algún síntoma de stale data en backup / exchange rates / localStorage.

**Resto de errores de lint (~370):** estrategia "regla del boy scout" — limpiar al pasar por cada archivo en otras tareas. No prioritarios.

---

### 🟡 Convivencia `AppContext` legacy vs `contexts/*` modernos

**Problema:** hay 9 contextos en total. `AppContext` (raíz) convive con los contextos modernos en `src/contexts/`. Riesgo de solapamiento y confusión.

**Decisión a tomar:** ¿migrar `AppContext` a `contexts/`? ¿Disolverlo en piezas más pequeñas? ¿Mantener tal cual?

**Estado:** sin auditar.

---

## 4. Mejoras estructurales (no urgentes)

### 🟢 Reorganización de archivos top-level en `src/`

Hay archivos sueltos en la raíz de `src/` que deberían vivir en subcarpetas. **Hacer DESPUÉS de cada refactor**, no antes.

| Archivo                | Destino sugerido      |
|------------------------|-----------------------|
| `Reports.tsx`          | `src/views/`          |
| `HelpCenter.tsx`       | `src/views/`          |
| `CalendarView.tsx`     | `src/views/`          |
| `BackupPanel.tsx`      | `src/views/`          |
| `GettingStarted.tsx`   | `src/views/`          |
| `AdminPanel.tsx`       | `src/views/`          |
| `LicenseScreens.tsx`   | `src/views/`          |
| `BankImportModal.tsx`  | `src/components/`     |
| `WelcomeTour.tsx`      | `src/components/`     |
| `AppShell.tsx`         | quedarse en raíz (shell) |
| `AppProvider.tsx`      | quedarse en raíz (provider) |
| `App.tsx`              | quedarse en raíz       |
| `main.tsx`             | quedarse en raíz       |

### 🟢 Convención de nombres de ramas

**Estado:** ✅ formalizada en `00_FOUNDATION.md` sección 11 (23/05/2026).

### 🟢 Limpieza de assets de marca obsoletos (s.67, no urgente)

Al generar el kit de PNG definitivo (`project/commercial/assets/export-icons-s67/`, icono R3 espejo) quedaron restos de marcas anteriores y del scaffold de Vite:

- [ ] **`project/commercial/assets/export-icons-s62/`** — PNGs del icono **«Pico Norte» YA DESCARTADO** (16/32/180/1024). Borrar o archivar; confunden con la marca vigente.
- [ ] **`src/assets/react.svg` y `src/assets/vite.svg`** — cruft del scaffold de Vite. Verificar que no se importan y borrar.
- [ ] Revisar los muchos `finnort-icon-*.html` de `project/commercial/assets/` (bocetos de s.60-s.66): solo `finnort-icon-nf-mirror-s66.html` es la fuente viva vigente; el resto son iteraciones descartadas (¿archivar en subcarpeta?).

El founder lo clasificó "no urgente" (07/07/2026). No bloquea nada.

---

## 5. Proceso y herramientas

- [ ] Definir convención de mensajes de commit (Conventional Commits ya parece usarse: `refactor:`, `fix:`, `chore:`). Formalizar.
- [ ] Decidir si añadir `husky` + lint-staged para validar commits.
- [ ] Decidir si configurar GitHub Actions para correr tests en cada PR.
- [ ] Documentar comando(s) exacto(s) de build y deploy.
- [ ] **🔴 Sanear lint + type-check (deuda detectada en sesión 47).** Estado real a 08/06/2026: `npx tsc -b` da ~25 errores de tipos (`Transfers.tsx`, `TrendsView.tsx`, `WelcomeTour.tsx` — sobre todo `T` tipado como `Record<string,string>` vs el tipo estricto del theme, + 1 propiedad duplicada en `WelcomeTour.tsx:461`) y `npm run lint` da ~347 errores (la regla nueva `react-hooks/preserve-manual-memoization` del React Compiler + `@typescript-eslint/no-explicit-any` disparan la mayoría). El CI (`ci.yml`) **NO corre `tsc`** y por eso "type-check limpio / CI verde" en los docs ya no refleja la realidad. Tareas: (a) añadir `tsc --noEmit` al CI, (b) decidir severidad de las reglas del React Compiler (warn vs error), (c) ir saneando por archivo. **No mezclar con features** — tanda propia de limpieza.

---

## 6. Cómo usar este backlog

- **Al iniciar trabajo en un item:** moverlo a `05_SESSION_LOG.md` ("Trabajando en…").
- **Al terminar un refactor:** moverlo a `03_REFACTOR_LOG.md` con resumen de cambios.
- **Al descubrir nueva deuda:** añadirla aquí en la sección correspondiente.
- **Prioridades:** se revisan al inicio de cada sesión grande.
