# 05 — SESSION LOG

> Bitácora de sesiones de trabajo. Una entrada por sesión significativa.
> **Formato:** fecha · objetivo · qué se hizo · qué quedó pendiente · siguiente paso.
> **Protocolo:** al iniciar sesión nueva, leer la última entrada para retomar contexto.

---

## 02/06/2026 — Sesión 30: F4-U — Projections + ProjectionFormModal

### 🎯 Objetivo
Wiring i18n completo de la sección Proyecciones.

### ✅ Qué se hizo

- **Projections.tsx:** overline, title, subtitle, KPIs (4 labels + activeSub + activeCountLabel), newBtn, stickyTitle/itemLabel, analysisSubtitle, filtros (accountAll + sort × 3), empty addFirstBtn, confirm delete (title+msg), toasts × 4, duplicateSuffix, printSubtitle refactorizada inline con t() reemplazando buildProjectionsPrintSubtitle hardcodeada
- **ProjectionFormModal.tsx:** header (titleAdd/titleEdit/subtitle), selector tipo (Income/Expense/Transfer), `FREQ_LABELS` eliminado → `t('projections.frequencies.*')`, todos los field labels + placeholders, zona "When it occurs" (frecuencia/fechas/paymentDayHint/recurringLabel/recurringDesc), "More options" (notas/alerts × 6/override × 3/pause toggle × 4)
- **projectionsForm.ts:** `validateProjectionForm` → `i18next.t()` directo (8 errores), import i18next
- **test-setup.ts + projectionsForm.test.ts:** mock local de i18next (chainable use/init), test `.toBe(hardcoded)` → `.toBeDefined()`
- **4 dicts:** ~85 claves nuevas en `projections` (print ext. + stats ext. + empty ext. + filters + confirm + form × 4 idiomas)
- Verificado visualmente EN ✅

### 📌 Commits de la sesión

```
801455f feat(i18n): F4-U — Projections + ProjectionFormModal (EN/FR/PT-BR)
```

### 📌 Estado al cerrar

- Rama: `feat/f4-remaining-wiring` (sin PR aún)
- F4-P ✅ F4-Q ✅ F4-R ✅ F4-S ✅ F4-T ✅ F4-U ✅ — 6 sesiones completadas y verificadas
- 962 tests pasando

### ➡️ Siguiente sesión

**F4-V** — TrendsView + trend components

---

## 02/06/2026 — Sesión 29: F4-T — Accounts + AccountFormModal + AmortizationFormModal

### 🎯 Objetivo
Wiring i18n completo de la sección Cuentas.

### ✅ Qué se hizo

- **Accounts.tsx:** overline, title, subtitle, print subtitle (plural), estado vacío (title/body/btn), toasts (accountSaved/accountDeleted/accountDeletedWithData), deleteImpact con plurales × 3 tipos, confirm modals × 3 (delete cuenta, delete préstamo, undo amortización), loanQuotaName
- **AccountFormModal.tsx:** header (titleAdd/titleEdit/subtitle), selector de tipo de cuenta (5 labels), todos los field labels + placeholders, sección préstamo completa (banner, tipo préstamo, 4 estados de validación matemática, cuenta de cargo), opciones de tipo de interés
- **LoanAccountCard.tsx:** `getLoanTypeLabel()` hardcodeada en ES → `t('loans.types.*')` — fix extra detectado en verificación visual
- **AmortizationFormModal.tsx:** wiring completo del modal de amortización parcial (header, campos importe/cuenta/comisión/modalidad, panel liquidación total, tabla preview, highlights, gráfica SVG, botón aplicar)
- **4 dicts:** ~76 claves nuevas (print + toast extend + deleteImpact + confirm + form + amortization.form)
- Verificado visualmente EN ✅

### 📌 Commits de la sesión

```
6a51508 feat(i18n): F4-T — Accounts + AccountFormModal + AmortizationFormModal + LoanAccountCard (EN/FR/PT-BR)
4e0a006 feat(i18n): F4-S — RealExpenses + RealExpenseFormModal + Badge (EN/FR/PT-BR)  [sesión anterior]
```

### 📌 Estado al cerrar

- Rama: `feat/f4-remaining-wiring` (sin PR aún)
- F4-P ✅ F4-Q ✅ F4-R ✅ F4-S ✅ F4-T ✅ — 5 sesiones completadas y verificadas
- 962 tests pasando

### ➡️ Siguiente sesión

**F4-U** — Projections + ProjectionFormModal

---

## 02/06/2026 — Sesión 28: F4-S — RealExpenses + RealExpenseFormModal + Badge

### 🎯 Objetivo
Wiring i18n completo de la sección Movimientos Reales.

### ✅ Qué se hizo

- **Inventario:** RealExpensesList, RealExpenseFiltersBar, RealExpensesAnalysis ya estaban 100% wired → sin trabajo adicional
- **RealExpenses.tsx:** overline, title, subtitle, botones (nuevo/importar), sticky bar (title + itemLabel), análisis subtitle, botón back-to, confirm delete (title + mensaje), toasts (saved/updated/deleted), warning modal messages con interpolación, coach CTA, print subtitle (account/category/period/count con plural)
- **RealExpenseFormModal.tsx:** título modal (add/edit), subtitle, todos los field labels, placeholders, hints de fechas, 6 mensajes de validación
- **UI.tsx Badge:** `'INGRESO'/'GASTO'` → `t('categories.typeIncome/typeExpense')` — bug encontrado en verificación visual
- **4 dicts:** +44 claves en `realExpenses` (print ext. + form + warning.msg + toasts + top-level)
- Verificado visualmente EN ✅ (incluyendo badges de tipo en lista de movimientos)

### 📌 Commits de la sesión

```
4e0a006 feat(i18n): F4-S — RealExpenses + RealExpenseFormModal + Badge (EN/FR/PT-BR)
```

### 📌 Estado al cerrar

- Rama: `feat/f4-remaining-wiring` (sin PR aún)
- F4-P ✅ F4-Q ✅ F4-R ✅ F4-S ✅ — 4 sesiones completadas y verificadas
- 962 tests pasando

### ➡️ Siguiente sesión

**F4-T** — Accounts + AccountFormModal

---

## 01/06/2026 — Sesión 27: F4-Q · F4-R · bug fix prefill alertas

### 🎯 Objetivo
Continuar wiring i18n con F4-Q (Dashboard) y F4-R (AlertsPanel) + verificar alertas.

### ✅ Qué se hizo

- **F4-Q** — Dashboard completo: hero KPIs, section labels, account type labels, welcome banner. Verificado EN ✅
- **F4-R** — AlertsPanel completo: todos los strings de alertas (titles, bodies, CTA, vacío, loading). Verificado EN ✅
- **fix(i18n)** — PrintButton: 'Imprimir' → `common.print` en los 4 idiomas
- **Bug fix crítico** — `RealExpenses.tsx:147`: el `useEffect` del prefill F2.10 (abrir modal desde alerta) llamaba a `setForm` y `setErrors` que ya no existen en el padre tras extraer `RealExpenseFormModal`. Corregido a `setInitialFormValues` (elimina `setErrors` que el modal gestiona internamente). La app ya no se rompe al pulsar "Registrar Movimiento" desde una alerta.

### 📌 Commits de la sesión

```
3557c5d feat(i18n): F4-R — AlertsPanel completo (EN/FR/PT-BR)
93de211 fix(i18n): PrintButton 'Imprimir' → common.print × 4 idiomas
4aa1df9 feat(i18n): F4-Q — Dashboard completo + account type labels (EN/FR/PT-BR)
22e8235 feat(i18n): F4-P — AppShell + RatesWidgets completos (EN/FR/PT-BR)
```

### 📌 Estado al cerrar

- Rama: `feat/f4-remaining-wiring` (sin PR aún)
- F4-P ✅ F4-Q ✅ F4-R ✅ — 3 sesiones completadas y verificadas
- Bug fix alertas → RealExpenses funcional

### ➡️ Siguiente sesión

**F4-S** — RealExpenses + RealExpenseFormModal: strings del modal de alta/edición, filtros, etiquetas de la lista, toasts.

---

## 01/06/2026 — Sesión 26: Audit F4 + F4-P inicio

### 🎯 Objetivo
Audit completo del estado real de i18n tras detectar que la app seguía en español con idioma EN seleccionado.

### ⚠️ Hallazgo crítico

**F4-A→O declarado "100% completo" era incorrecto.** Audit visual con idioma EN reveló que la mayoría de la UI permanecía en español. Causa raíz: las sesiones F4-A→O crearon los namespaces y dicts correctamente, pero NO terminaron de reemplazar los strings hardcodeados en los componentes. Cobertura real estimada: ~45%.

**Errores de proceso identificados:**
1. Nunca se verificó la app con cambio de idioma al cierre de cada sesión
2. La métrica "fichero wired" significaba "tiene useTranslation()" no "todos sus strings usan t()"
3. Se declaró F4 completo sin evidencia de completitud
4. Los tests (962) usan mocks de i18n y no detectan strings hardcodeados

**Scope real pendiente (audit 01/06/2026):**
- ~500 strings hardcodeados en español estimados
- ~45% cobertura real (vs 100% declarado)
- 10 sesiones adicionales estimadas (F4-P→Y)

**Ficheros más críticos:**
- `AppShell.tsx`: 1 t() call en 1242 líneas — TABS hardcodeados, modal settings completo
- `AccountFormModal.tsx`: 2 t() calls en 1175 líneas
- `ProjectionFormModal.tsx`: 2 t() calls en 1172 líneas
- `TrendsView.tsx`: 2 t() calls en 60 líneas — casi vacío
- `AlertsPanel.tsx`: 5 t() calls en 773 líneas
- `Dashboard.tsx`: 14 t() calls en 801 líneas (hero card, sección labels)

### ✅ Qué se hizo en esta sesión (pre-audit)

- F4-O: help namespace (218 claves × 4 idiomas) ✅
- Formatos Intl: i18nFormats.ts, 30 ficheros actualizados ✅
- Fix sintaxis rota en ProjectionListItem ✅
- PR #24 abierto (feat/i18n-help)
- Audit completo de cobertura real
- Roadmap, session log y next session prompt actualizados con estado real

### 📌 Estado al cerrar

- PR #24 mergeado a main.
- Rama nueva: `feat/f4-remaining-wiring` para F4-P→Y.
- Protocolo obligatorio añadido: verificación visual EN antes de cada commit.

### ➡️ Siguiente sesión

**F4-P** — AppShell completo: TABS (11 labels), modal de settings regionales, modal de borrado selectivo.

---

## 01/06/2026 — Sesión 25: F4-O — help namespace

### 🎯 Objetivo
Sesión F4-O: última sesión de extracción de strings. Namespace `help` (~218 claves) en 4 idiomas + refactorizar `helpCenterData.ts` y wiring de subvistas del HelpCenter.

### ✅ Qué se hizo

**1 commit, 11 ficheros:**
- `src/i18n/es.ts` / `en.ts` / `fr.ts` / `pt-br.ts` — namespace `help` añadido:
  - `help.ui`: 10 claves (tabs, backToManual, selectSection, sections1/N, shortcutsNote, accessibilityNote)
  - `help.manual`: 8 secciones × {title, subtitle, bloques con heading+text+tip?}
  - `help.faq`: 9 categorías × {label + items con question+answer+tags}
  - `help.shortcuts`: 4 categorías + 6 descripciones de atajos
- `src/lib/helpCenterData.ts` — refactorizado completo:
  - `MANUAL_SECTIONS` / `FAQ_CATEGORIES` / `SHORTCUTS` → funciones `getManualSections()` / `getFaqCategories()` / `getShortcuts()`
  - Helper local `t()` = `i18next.t()` + `tags()` helper para split de tags CSV
- `src/components/help/HelpManualView.tsx` — `useTranslation()` wired, 3 UI strings i18n
- `src/components/help/HelpShortcutsView.tsx` — `useTranslation()` wired, 2 UI strings i18n
- `src/components/help/HelpFAQView.tsx` + `HelpHomeView.tsx` + `useHelpCenter.ts` — callers actualizados a funciones
- `src/HelpCenter.tsx` — 4 tab labels hardcodeados → `help.ui.tab*`

**Decisión arquitectónica:** Opción A (namespace en dicts) vs Opción B (ficheros por idioma). Se eligió A por consistencia con el patrón del proyecto.

**FAQ g5 actualizado:** "solo en español" → "disponible en ES/EN/FR/PT-BR".

### 📊 Métricas

| Métrica | Valor |
|---|---|
| Tests totales | **962 pasando** (sin cambio) |
| Ficheros tocados | 11 |
| Claves help añadidas | ~218 por idioma |
| Strings hardcodeados eliminados | 100% en HelpCenter y subvistas |

### 📌 Estado al cerrar

- **Rama:** `feat/i18n-help` — 3 commits, lista para PR + merge.
- **F4-O:** ✅ + **Formatos Intl:** ✅. F4 completamente terminado.
- **Pendiente Fase 3:** solo merge y validación con nativos (asíncrona).

### ➡️ Siguiente sesión

**PR feat/i18n-help → merge a main.** Luego iniciar Fase 4 (Mobile/PWA) o desbloquear Fase 2 (naming).

---

## 01/06/2026 — Sesión 24: F4-N — legal namespace

### 🎯 Objetivo
Sesión F4-N: mover el contenido legal (Aviso Legal, Privacidad, Términos, Cookies) a namespace `legal` en los 4 idiomas + refactorizar `Legal.tsx` para usar `useTranslation()`.

### ✅ Qué se hizo

**1 commit, 5 ficheros:**
- `src/i18n/es.ts` / `en.ts` / `fr.ts` / `pt-br.ts` — namespace `legal` añadido:
  - `legal.ui`: 6 claves (updateNotice con `{{year}}`, footerCopyright, footerPrivacy, linkAviso/Privacidad/Terminos/Cookies)
  - `legal.docs.aviso` (7 secciones), `privacidad` (8), `terminos` (8), `cookies` (6)
- `src/views/Legal.tsx` — refactorización completa:
  - `LEGAL_DOCS` reducido a metadata pura (`sectionCount`)
  - `LegalModal`: título, emoji y secciones dinámicas via `t()` + `common.close` para botón
  - `LegalFooter`: `useTranslation()` añadido, links y footer texts 100% i18n

### 📊 Métricas

| Métrica | Valor |
|---|---|
| Tests totales | **962 pasando** (sin cambio) |
| Ficheros tocados | 5 |
| Claves legal añadidas | ~88 por idioma |
| Strings hardcodeados eliminados | 100% en Legal.tsx |

### 📌 Estado al cerrar

- **Rama:** mergeada a `main` vía PR #23. 962 tests, type-check limpio.
- **F4-N:** ✅ COMPLETA.
- **Pendiente:** F4-O (HelpCenter + helpCenterData.ts — la tarea de contenido más grande).

### ➡️ Siguiente sesión

**F4-O — `help` namespace** (la tarea más grande): `lib/helpCenterData.ts` (717 líneas) + `HelpCenter.tsx` y subvistas.

---

## 01/06/2026 — Sesión 23: F4-M — alerts.content namespace (lib pura)

### 🎯 Objetivo
Sesión F4-M: traducir `alertGenerators.ts` (lib pura, 8 generadores) + cerrar plurales pendientes de AlertsBanner (F4-I).

### ✅ Qué se hizo

**1 commit, 8 ficheros:**
- `lib/alertGenerators.ts` — 8 generadores usando `i18next.t()` directo via helper `at()`
- `views/AlertsBanner.tsx` — plurales deferred (active1/N, critical1/N, warning1/N, positive1/N, more1/N)
- `lib/__tests__/alertGenerators.test.ts` — mock local de i18next (no global, para no romper i18n.test.ts)
- 4 diccionarios i18n: namespace `alerts.content` (~51 claves) + 10 claves plurales en `alerts`

**Patrón clave:** lib pura sin React usa `import i18next from 'i18next'` + helper `at()` en lugar de `useTranslation()`.
**Mock de tests:** el mock de i18next va en el fichero de test específico (no global) para evitar romper `i18n.test.ts`.

**Rama:** `feature/f4-remaining`

### 📊 Métricas
- Tests: **962 pasando** (sin regresiones)
- type-check: limpio

### 🔜 Siguiente sesión
**F4-N:** `legal` namespace — Legal.tsx con texto legal formal (~3 secciones, ~20 bloques heading+text cada una). Requiere revisión por nativo/profesional para EN y FR.

---

## 01/06/2026 — Sesión 22: F4-L — misc namespace (15 ficheros)

### 🎯 Objetivo
Sesión F4-L: namespace `misc` — componentes varios: banner de backup, migración de vault, selector de entidades, snooze, modal de salida, centro de ayuda y tarjetas de resumen del dashboard.

### ✅ Qué se hizo

**1 commit, 15 ficheros wired:**
- `components/BackupReminderBanner.tsx`, `components/VaultMigrationModal.tsx`
- `components/InstitutionSelector.tsx`, `components/SnoozeMenu.tsx`, `components/ExitModal.tsx`
- `HelpCenter.tsx`, `hooks/useHelpCenter.ts`
- `components/help/HelpFAQView.tsx`, `components/help/HelpHomeView.tsx`
- `views/GoalsSummary.tsx`, `views/RealExpensesSummary.tsx`

**~90 claves** en namespace `misc` con 10 sub-namespaces.

**Nota:** `CATEGORY_LABELS` de `lib/financialInstitutions.ts` internalizado en el componente — sin tocar la lib. `useHelpCenter.ts` ahora usa `useTranslation()` para los títulos de sección.

**Rama:** `feature/f4-remaining`

### 📊 Métricas
- Tests: **962 pasando** (sin regresiones)
- type-check: limpio

### 🔜 Siguiente sesión
**F4-M:** `alertGenerators` — lib pura con plurales complejos (strings dinámicos, ICU). Requiere definir estrategia de plurales i18next primero.

---

## 01/06/2026 — Sesión 21: F4-K — onboarding namespace (10 ficheros)

### 🎯 Objetivo
Sesión F4-K: namespace `onboarding` — tour de bienvenida, pantalla de onboarding, guía de primeros pasos, coach tour, toasts de primer logro y barra de progreso.

### ✅ Qué se hizo

**1 commit, 10 ficheros wired:**
- `WelcomeTour.tsx`, `views/Onboarding.tsx`, `GettingStarted.tsx`
- `components/CoachMarksTour.tsx`, `components/FirstWinToast.tsx`, `components/SetupProgress.tsx`

**~177 claves** en namespace `onboarding`:
- `tour` (4 cards × 4 strings + 7 UI)
- `welcome` (pantalla inicial + categorías por defecto 21 items)
- `securityStep` (6 strings)
- `defaultCategories` (21 categorías traducidas)
- `guide` (8 pasos × contenido completo: title, description, tip, substeps, actionLabel)
- `coachTour` (8 pasos × title + description + 5 UI)
- `firstWin` (4 configs × title + sub + ctaLabel)
- `setup` (4 pasos × label + hint + 6 UI)

**Patrón clave:** arrays estáticos fuera del componente migrados a `useMemo` + `t()`.
`DEFAULT_CATEGORIES` ahora traducidas en el idioma del usuario al crear la app.
`FIRST_WIN_CONFIGS` internalizado (ya no es necesario exportarlo).

**Rama:** `feature/f4-remaining`

### 📊 Métricas
- Tests: **962 pasando** (sin regresiones)
- type-check: limpio
- Commits: 1 commit limpio en la rama

### 🔜 Siguiente sesión
**F4-L:** `misc` namespace — BackupReminderBanner, VaultMigrationModal, InstitutionSelector, SnoozeMenu, HelpCenter, help subvistas, GoalsSummary, RealExpensesSummary.

---

## 01/06/2026 — Sesión 20: F4-J — security namespace (14 ficheros)

### 🎯 Objetivo
Sesión F4-J: namespace `security` — flujo completo de setup de seguridad y panel de ajustes.

### ✅ Qué se hizo

**1 commit, 14 ficheros wired:**
- `views/SecuritySetup.tsx`, `views/SecuritySettingsPanel.tsx`
- `security-setup/constants.ts` — `AUTH_METHODS` saneado (eliminados title/desc hardcodeados)
- `security-setup/Step1AuthMethod.tsx` ... `Step6Summary.tsx` (6 steps)

**~100 claves** en namespace `security` con 7 sub-namespaces:
- `authMethods`, `passwordStrength` (compartidos)
- `step1` … `step6` (flujo wizard de setup)
- `settings` (panel de ajustes: inactividad, TOTP grace, email)
- `changeMethod` (modal de cambio de método de acceso)

**Notas:**
- `getPasswordStrengthLabel` en lib/ conservada (tests existentes la cubren); Step2Password y SecuritySettingsPanel usan t() inline en su lugar
- El roadmap estimaba ~15 strings — el scope real era ~100 (9 componentes + SecuritySettingsPanel)

### 📊 Métricas
- Tests: **962 pasando** (sin regresiones)
- type-check: limpio
- Commits: 1 commit limpio en `main`

### 🔜 Siguiente sesión
**F4-K:** `onboarding` namespace (~82 strings — sesión larga) — GettingStarted.tsx, Onboarding.tsx, WelcomeTour.tsx, CoachMarksTour.tsx, FirstWinToast.tsx, SetupProgress.tsx.

---

## 01/06/2026 — Sesión 19: F4-I — forecast + alerts namespaces (3 ficheros)

### 🎯 Objetivo
Sesión F4-I: nuevos namespaces `forecast` y `alerts` — módulo de previsión patrimonial y banner de alertas.

### ✅ Qué se hizo

**1 commit, 3 ficheros wired:**
- Forecast.tsx, ProjectedVsReal.tsx, AlertsBanner.tsx

**~61 claves** en `forecast` (21 directas + `forecast.pvr` subnamespace con 19) y `alerts` (10 + toasts).

**Notas:**
- `printSubtitle` extraído como variable para reutilizar en PrintHeader y PrintButton
- Totales de ProjectedVsReal refactorizados de multi-línea `fmt()` a una línea por item
- Plurales complejos de AlertsBanner (`alerta/alertas`, `crítica/críticas`, etc.) deferred a F4-M

### 📊 Métricas
- Tests: **962 pasando** (sin regresiones)
- type-check: limpio
- Commits: 1 commit limpio en `main`

### 🔜 Siguiente sesión
**F4-J:** `security` namespace (~15 strings) — SecuritySetup, Step2Password, y otros componentes del flujo de seguridad.

---

## 01/06/2026 — Sesión 18: F4-H — realExpenses extension (4 subcomponentes)

### 🎯 Objetivo
Sesión F4-H: ampliar namespace `realExpenses` con los 4 subcomponentes del módulo de movimientos reales.

### ✅ Qué se hizo

**1 commit, 4 ficheros wired:**
- RealExpenseFiltersBar.tsx, RealExpensesList.tsx, RealExpensesAnalysis.tsx, RealExpenseWarningModal.tsx

**~36 claves** en `realExpenses` (filters ampliado, list, analysis, warning nuevos).

**Notas:**
- Plurales simples `resultsOne`/`resultsMany` — patrón dos claves en lugar de ICU (diferido a F4-M)
- Hint del modal de warning tiene `<strong>` → dividido en `hintBefore`, `hintBold`, `hintAfter` para mantener el JSX limpio
- Chips de fecha en filtros activos reutilizan las mismas claves que los `<option>` del select

### 📊 Métricas
- Tests: **962 pasando** (sin regresiones)
- type-check: limpio
- Commits: 1 commit limpio en `main`

### 🔜 Siguiente sesión
**F4-I:** `forecast` + `alerts` namespaces (~22 strings) — Forecast.tsx, ProjectedVsReal.tsx, AlertsBanner.tsx.

---

## 01/06/2026 — Sesión 17: F4-G — creditCards namespace extension (5 ficheros)

### 🎯 Objetivo
Sesión F4-G: ampliar namespace `creditCards` con todos los subcomponentes del módulo de tarjetas.

### ✅ Qué se hizo

**1 commit, 5 ficheros wired:**
- CreditCardDetailView.tsx, CreditCardSimulator.tsx, CreditCardMetrics.tsx, CreditCardsComparison.tsx, CreditCardHistoryChart.tsx

**~123 claves** en `creditCards` (detail, simulator, metrics, comparison, history, healthScoreUI, topCategories).

**Notas:**
- Los 4 primeros componentes ya estaban parcialmente migrados al retomar la sesión — solo faltaba CreditCardHistoryChart.tsx
- Strings en Recharts `name` props (Bar/Area) también traducidos → aparecen en leyendas del gráfico histórico
- Interpolaciones ICU usadas: `{{n}}`, `{{amount}}`, `{{label}}`, `{{pct}}`, etc.

### 📊 Métricas
- Tests: **962 pasando** (sin regresiones)
- type-check: limpio
- Commits: 1 commit limpio en `main`

### 🔜 Siguiente sesión
**F4-H:** `realExpenses` extension + subcomponentes (~20 strings) — RealExpenseFiltersBar, RealExpensesAnalysis, RealExpensesList, RealExpenseWarningModal.

---

## 01/06/2026 — Sesión 16: F4-F — reports namespace (6 ficheros)

### 🎯 Objetivo
Sesión F4-F: namespace `reports` nuevo — módulo de informes completo.

### ✅ Qué se hizo

**1 commit, 6 ficheros wired + fix importante de test setup:**
- Reports.tsx, AccountsReport.tsx, MovementsReport.tsx, ProjectionsReport.tsx, GoalsReport.tsx, TrendsReport.tsx
- 91 claves en `reports`
- `src/test-setup.ts` actualizado con mock global de `react-i18next` que resuelve claves ES — esto arreglará automáticamente TODOS los tests futuros de componentes con i18n

**Notas:**
- Los tests de reports buscaban strings hardcodeados ES → roto por la migración i18n
- Fix: mock global en `test-setup.ts` con `resolveKey` contra diccionario ES (mismo patrón que ya usaba `RealExpenseFormModal.test.tsx`)
- Test singular `movimiento` actualizado a `movimientos` (plural diferido a F4-M)

### 📊 Métricas
- Tests: **962 pasando** (sin regresiones)
- type-check: limpio
- Commits: 1 commit limpio en `main`

### 🔜 Siguiente sesión
**F4-G:** `creditCards` namespace extension (~39 strings) — CreditCardDetailView, CreditCardSimulator, CreditCardMetrics, CreditCardsComparison, CreditCardHistoryChart.

---

## 01/06/2026 — Sesión 15: F4-E — trends namespace (10 ficheros)

### 🎯 Objetivo
Sesión F4-E: namespace `trends` nuevo — vista completa de análisis de tendencias.

### ✅ Qué se hizo

**1 commit, 10 ficheros wired** (el plan decía 5, había 10 en realidad):
TrendsView, TrendsHeader, TrendsStatsGrid, TrendsStickyBar, TrendsSummaryHighlights, TrendsEmptyState, TrendsChartIncomeExpenses, TrendsChartSavingsRate, TrendsChartBalance, TrendsCategoryCharts.

**54 claves en `trends`.**

**Notas:**
- Strings en Recharts `name` props (Bar/Line/Area) también traducidos → aparecen en leyendas de gráficos
- `TrendsTooltip.tsx` no necesitaba strings — usa `entry.name` del chart padre
- Plural `mes/meses` en sticky bar rightSlot y summary → diferido a F4-M

### 📊 Métricas
- Tests: **962 pasando** (sin regresiones)
- type-check: limpio
- Commits: 1 commit limpio en `main`

### 🔜 Siguiente sesión
**F4-F:** `reports` namespace (~65 strings) — Reports.tsx + 5 sub-componentes de informes.

---

## 01/06/2026 — Sesión 14: F4-D — calendar namespace (6 ficheros)

### 🎯 Objetivo
Sesión F4-D: namespace `calendar` nuevo — vista de calendario completa.

### ✅ Qué se hizo

**1 commit, 6 ficheros wired:**
- CalendarView.tsx, CalendarHeader.tsx, CalendarMonthlySummary.tsx, CalendarAnnualView.tsx, CalendarGrid.tsx, CalendarDayPanel.tsx (no estaba en el plan original, pero tenía strings)

**44 claves en `calendar` + `common.coachCta` bonus** (EN: `'Got it! →'`).

**Notas:**
- `DAYS` array constante del módulo → reemplazado por array dentro del componente con `t()` calls
- `SummaryCard` helper actualizado para aceptar `projLabel`/`realLabel` props
- `common.coachCta: '¡Entendido! →'` añadido — será reutilizable en otras vistas con CoachMark

### 📊 Métricas
- Tests: **962 pasando** (sin regresiones)
- type-check: limpio
- Commits: 1 commit limpio en `main`

### 🔜 Siguiente sesión
**F4-E:** `trends` namespace (~23 strings) — TrendsView + TrendsHeader + TrendsStatsGrid + TrendsStickyBar + TrendsSummaryHighlights.

---

## 01/06/2026 — Sesión 13: F4-C — bankImport namespace (3 ficheros)

### 🎯 Objetivo
Sesión F4-C: namespace `bankImport` nuevo — wizard de importación bancaria.

### ✅ Qué se hizo

**1 commit, 3 ficheros wired:**

| Sub-namespace | Claves | Fichero |
|---|---|---|
| `bankImport.step1` | 21 | Step1BankSelection.tsx |
| `bankImport.upload` | 10 | Step2Upload.tsx |
| `bankImport.preview` | 15 | Step3Preview.tsx |

**Total:** 46 claves en los 4 idiomas (ES/EN/PT-BR/FR).

**Notas:**
- Componentes son puramente presentacionales (no usan useApp) — solo necesitaban `useTranslation`
- `'⚠️ {n} líneas con errores'`: plural diferido a F4-M, string usa `{{count}}` sin forma plural
- `'Cancelar'` en confirm delete → reusa `common.cancel`

### 📊 Métricas
- Tests: **962 pasando** (sin regresiones)
- type-check: limpio
- Commits: 1 commit limpio en `main`

### 🔜 Siguiente sesión
**F4-D:** `calendar` namespace (~18 strings) — CalendarView + CalendarHeader + CalendarMonthlySummary + CalendarAnnualView + CalendarGrid.

---

## 01/06/2026 — Sesión 12: F4-B — accounts extension (6 ficheros)

### 🎯 Objetivo
Sesión F4-B: namespace `accounts` ampliado con tarjetas de cuenta, préstamos, amortizaciones.

### ✅ Qué se hizo

**1 commit, 6 ficheros wired:**

| Sub-namespace | Claves | Ficheros |
|---|---|---|
| `accounts.summary` | 7 | AccountsSummary.tsx |
| `accounts.card` | 11 | RegularAccountCard + CreditCardAccountCard + LoanAccountCard |
| `accounts.creditCard` | 16 | CreditCardAccountCard.tsx |
| `accounts.loan` | 17 | LoanAccountCard + LoanDetailView |
| `accounts.loanDetail` | 21 | LoanDetailView.tsx (incl. DebtEvolutionChart) |
| `accounts.amortization` | 15 | AmortizationHistory.tsx |

**Total:** 87 claves nuevas en los 4 idiomas (ES/EN/PT-BR/FR), 6 ficheros migrados.

**Notas:**
- Strings plurales (`cuenta/cuentas`, `movimiento/movimientos`) diferidos a F4-M (patrón establecido)
- `DebtEvolutionChart` (helper interno de LoanDetailView) recibe su propio `useTranslation()`
- `KpiCard` recibe labels como props — traducciones pasadas desde el padre

### 📊 Métricas
- Tests: **962 pasando** (sin regresiones)
- type-check: limpio
- Commits: 1 commit limpio en `main`

### 🔜 Siguiente sesión
**F4-C:** `bankImport` namespace (~14 strings) — Step1BankSelection + Step2Upload + Step3Preview.

---

## 01/06/2026 — Sesión 11: F4-A — GoalWizard + ProjectionListItem + ProjectionAnalysisView

### 🎯 Objetivo
Sesión F4-A: wiring de GoalWizard.tsx (wizard de objetivos) + ProjectionListItem.tsx + ProjectionAnalysisView.tsx.

### ✅ Qué se hizo

**2 commits:**

| Commit | Scope |
|---|---|
| 1 | `goals.wizard` (51 claves) — GoalWizard.tsx wired |
| 2 | `projections.frequencies` (9) + `projections.list` (28) + `projections.analysis` (13) — ProjectionListItem.tsx + ProjectionAnalysisView.tsx wired |

**Total:** ~101 claves nuevas en los 4 idiomas (ES/EN/PT-BR/FR), 3 ficheros migrados.

**Notas técnicas:**
- `FREQ_LABELS` local eliminada de ProjectionListItem — reemplazada por `t('projections.frequencies.${freq}' as any)`
- Modo selector en GoalWizard: `as const` → `as ['manual' | 'auto', string, string, string][]` (i18next devuelve `string`)
- Bloque proyección en GoalWizard: JSX con `<strong>` preservado, texto fragmentado en claves

### 📊 Métricas
- Tests: **962 pasando** (sin regresiones)
- type-check: limpio en ambos commits
- Commits: 2 commits limpios en `main`

### 📌 Estado de salida

| Namespace | Estado |
|---|---|
| `goals` | ✅ Goals.tsx + GoalCard.tsx + GoalWizard.tsx |
| `projections` | ✅ Projections.tsx + ProjectionListItem.tsx + ProjectionAnalysisView.tsx |

### 🔜 Siguiente sesión
**F4-B:** AccountsSummary.tsx + RegularAccountCard.tsx + CreditCardAccountCard.tsx + LoanAccountCard.tsx + LoanDetailView.tsx + AmortizationHistory.tsx (~25 strings, namespace `accounts` extension).
Ver `07_NEXT_SESSION_PROMPT.md` para contexto.

---

## 31/05/2026 — Sesión 10: F4 — extracción masiva de strings (namespaces common + 7 vistas)

### 🎯 Objetivo
Avanzar F4 (extracción sistemática de strings de componentes React) lo máximo posible en una sesión.

### ✅ Qué se hizo

**7 commits, 6 batches de trabajo:**

| Batch | Namespaces / Scope |
|---|---|
| 1 | `common` (8 claves base) — UI.tsx + 3 modales principales |
| 2 | `common` +3 claves — 4 modales secundarios |
| 3 | `common` +1 clave — 8 vistas y componentes (AlertsPanel, AppShell, BackupPanel, Transfers, SecuritySettingsPanel, Categories, Goals, GoalCard) |
| 4 | `common` +2 claves — 4 ficheros raíz (BankImportModal, LicenseScreens, AdminPanel, LockScreen) |
| 5 | `goals` (26 claves) + `common.irreversible` — Goals.tsx + GoalCard.tsx |
| 6 | `dashboard` (15 claves) + `accounts` (9 claves) — Dashboard.tsx + Accounts.tsx |
| 7 | `projections` (10) + `realExpenses` (17) + `transfers` (17) + `categories` (14) + `common` +4 — 4 vistas |

**Total:** ~130 claves añadidas a los 4 idiomas (ES/EN/PT-BR/FR), ~100+ strings migrados en 20+ ficheros.

**Fix notable:** colisión `t` variable de loop vs hook en Projections.tsx → renombrado a `filterVal`.

### 📊 Métricas
- Tests: **962 pasando** (sin regresiones)
- type-check: limpio en todos los commits
- Commits: 7 commits limpios en `main`

**Cierre de sesión — Auditoría completa de F4 + plan:**
- 10 commits totales en `main` (7 de código + 2 de docs + 1 de plan)
- Plan F4 completo documentado en `01_ROADMAP.md §Bloque F4` — 15 sesiones mapeadas con scope exacto
- `legal` y `help` confirmados en scope (corrección respecto a borrador inicial)

### 📊 Métricas
- Tests: **962 pasando** (sin regresiones)
- Type-check: limpio en todos los commits
- Commits: 10 commits limpios en `main`
- Namespaces creados: 8 (common, goals, dashboard, accounts, projections, realExpenses, transfers, categories)
- Ficheros wired: 24 de ~100 ficheros .tsx totales

### 📌 Estado de salida
| Namespace | Estado |
|---|---|
| `common` | ✅ prácticamente completo en toda la app |
| `goals` | ✅ Goals.tsx + GoalCard.tsx (falta GoalWizard) |
| `dashboard` | ✅ Dashboard.tsx |
| `accounts` | ✅ Accounts.tsx (faltan tarjetas + LoanDetailView) |
| `projections` | ✅ Projections.tsx (falta ProjectionListItem) |
| `realExpenses` | ✅ RealExpenses.tsx (faltan subcomponentes) |
| `transfers` | ✅ Transfers.tsx |
| `categories` | ✅ Categories.tsx |

- `main`: CI verde, build verde. 962 tests pasando.
- Plan completo de F4 en `01_ROADMAP.md` §Bloque F4 — leer antes de la próxima sesión.

### 🔜 Siguiente sesión
**F4-A:** GoalWizard.tsx (~24 strings, namespace `goals` extension) + ProjectionListItem.tsx (~24 strings, namespace `projections` extension).
Ver `07_NEXT_SESSION_PROMPT.md` para contexto completo.

---

## 31/05/2026 — Sesión 8: Plan de Fase 2 definido + lectura área comercial

### 🎯 Objetivo
Planificar Fase 2 (identidad de producto) con criterios reales del código y del área comercial antes de tocar ningún pixel.

### ✅ Qué se hizo

**Lectura completa del área comercial** (`project/commercial/` 00→09):
- Contexto de naming asimilado: 6 finalistas (AEVITAS, NORTIA, STABILA, AEQUORA, AEQUILA, TENUIA), Fase C pendiente.
- Referencias estéticas faro confirmadas: Monarch + Readwise + 1Password, calibración 80/20.
- Brief de naming y decisiones de diseño documentados.

**Auditoría técnica del punto de partida:**
- `theme.ts`: solo tokens de color (~35 por tema). Sin tipografía, espaciado ni radios.
- 2.655 bloques `style={{}}` inline. 4.001 valores hardcodeados de tipografía/espaciado.
- Tipografía fragmentada (Inter en AppShell, system-ui en el resto).

**Plan completo de Fase 2 documentado en `01_ROADMAP.md` §Fase 2:**
- 5 bloques: A (fundación tokens) → B (shell/nav) → C (UI primitivos) → D (vistas) → E (landing)
- Scope explícito de lo que NO entra en Fase 2 (estilos inline masivos y modales → Fase 4)
- Identificadas 4 decisiones de diseño bloqueantes para Bloque A.

**Decisión estratégica confirmada:** la parte técnica de Fase 2 puede avanzar en paralelo con el naming, ya que nombre y logo solo bloquean el Bloque E (landing page).

### 📊 Documentos actualizados
- `01_ROADMAP.md` — Fase 2 expandida con plan completo de bloques
- `07_NEXT_SESSION_PROMPT.md` — Estado exacto + 4 decisiones pendientes

### 📌 Estado de salida
- Plan de Fase 2: ✅ definido y documentado
- Bloqueante para arrancar código: 4 decisiones de diseño (color, modo, tipografía, radios)
- `main`: sin cambios de código en esta sesión

### 🔜 Siguiente sesión
**Opción A (recomendada):** cerrar las 4 decisiones de diseño → arrancar Bloque A (expandir theme.ts).
**Opción B:** Sesión 4 comercial (limpieza quizás naming + Fase C técnica).

---

## 31/05/2026 — Sesión 7: Merge PR #16 (TrendsView) + Refactor CalendarView.tsx (-90%) + inicio B4

### 🎯 Objetivo
Mergear PR #16, cerrar Fase 1 con CalendarView.tsx, y arrancar B4 (extracción de strings para i18n).

### ✅ Qué se hizo

**Merge PR #16 + fix preexistente:**
- Detectados 26 errores ESLint en archivos de trends (`any` types) → corregidos con `Theme`, `Account`, `RealExpense`, `Category`.
- Bug preexistente en HelpCenter (`import path` roto + `import type` para `HelpSection`) que rompía el build desde PR #14 → corregido.
- PR #16 mergeado a main con CI verde.

**CalendarView.tsx — Fase 1 CERRADA** (7 commits, PR #17, mergeado):
- `CalendarView.tsx`: **1.946 → 189 LOC (−90%)**.
- `lib/calendarCalc.ts` con 24 tests (`getProjectionsForDay`, `getRealsForDay`, `getRealsForMonth`, `buildAnnualMonthStats`).
- 5 subcomponentes: `CalendarAnnualView`, `CalendarHeader`, `CalendarMonthlySummary`, `CalendarGrid`, `CalendarDayPanel`.

**Inicio B4:** pendiente de esta sesión (ver siguiente paso).

### 📊 Métricas

| Componente | Antes | Después | Δ |
|---|---|---|---|
| `CalendarView.tsx` | 1.946 | 189 | **-90%** |
| Tests totales | 910 | **934** | +24 |

### 📌 Estado de salida
- Fase 1 (Refactor de monstruos): **✅ COMPLETA**.
- Fase 0.5 B4 (strings i18n): **🔄 EN CURSO** (rama a crear).
- `main`: CI verde, build verde.

### 🔜 Siguiente paso
**B4 — Extracción de strings para i18n** (única deuda de Fase 0.5 pendiente).

---

## 30/05/2026 — Sesión 6: Refactor de SecuritySetup.tsx (-89%) + TrendsView.tsx (-95%)

### 🎯 Objetivo
Domar SecuritySetup.tsx y, en tiempo extra, TrendsView.tsx.

### ✅ Qué se hizo

**SecuritySetup.tsx** — 7 commits sobre `refactor/security-setup` (PR #15, mergeado):
- constants + lib password strength + tests + 6 subcomponentes + useSecuritySetup hook

**TrendsView.tsx** — 4 commits sobre `refactor/trends-view` (PR #16, abierto):
- ACCOUNT_COLORS → constants · lógica pura → lib/trendsCalc.ts + 19 tests · useContainerWidth → hooks/ · 9 subcomponentes

### 📊 Métricas

| Componente | Antes | Después | Δ |
|---|---|---|---|
| `SecuritySetup.tsx` | 1.296 | 146 | **-89%** |
| `TrendsView.tsx` | 1.223 | 58 | **-95%** |
| Tests totales | 858 | 910 | +52 |

### ⚠️ Incidente
Sesión cerrada de golpe a mitad del trabajo de SecuritySetup. Retomada sin pérdida.

### 📌 Estado de salida
- PR #15 mergeado a main.
- PR #16 `refactor/trends-view` → ABIERTO, pendiente de merge.
- Tests: **910 passing**.

### 🔜 Siguiente sesión
Mergear PR #16 y arrancar refactor de **`CalendarView.tsx`** (1.946 LOC — el último monstruo de Fase 1).

---

## 21-22/05/2026 — Sesión 0: Maratón de refactor (retroactiva)

### 🎯 Objetivo
Domar `SecuritySetup.tsx` (1.296 LOC), el monstruo más sensible de Fase 1: gestiona contraseñas, TOTP, frase de recuperación y fichero de recuperación.

### ✅ Qué se hizo
Refactor en 7 commits sobre rama `refactor/security-setup`:
1. constants + AUTH_METHODS
2. lib `securitySetupValidation.ts` con tests (fuerza de contraseña)
3–7. Extracción de 6 subcomponentes (Step1–Step6) + hook `useSecuritySetup`

### 📊 Métricas

| Métrica | Antes | Después | Δ |
|---|---|---|---|
| `SecuritySetup.tsx` LOC | 1.296 | 146 | **-89%** |
| Tests totales | 858 | 891 | +33 |
| Errores TypeScript | 0 | 0 | ✅ |

### ⚠️ Incidente
Sesión cerrada de golpe a mitad del trabajo. Retomada sin pérdida: `Step2Password` estaba creado pero sin commitear → commit inmediato al retomar y continuación normal.

### 📌 Estado de salida
- Rama: `refactor/security-setup` (PR #15 abierto, pendiente de merge)
- Tests: **891 passing**
- `main` limpia (sin cambios)

### 🔜 Siguiente sesión
Mergear PR #15 y arrancar refactor de **`TrendsView.tsx`** (1.223 LOC). Aplicar mismo patrón validado.

---

## 21-22/05/2026 — Sesión 0: Maratón de refactor (retroactiva)

> Entrada añadida el 23/05/2026 durante el bootstrap del sistema de memoria.

### ✅ Qué se hizo (verificado contra `git log main` el 23/05/2026)
- Refactor `Projections.tsx` ✅ **Fase 1.1 COMPLETA** (PR #1, `909caa5`): -66%, +106 tests, +1 bug fix
- Refactor `BankImportModal.tsx` ✅ mergeado (PR #2, `92a7693`)
- Refactor `AppProvider.tsx` ✅ mergeado (PR #3, `06945d5`)
- Refactor `Reports.tsx` ✅ mergeado (2.164 → 578 LOC)
- Refactor `RealExpenses.tsx` ✅ mergeado (~1.545 → 825 LOC)

### ⚠️ Problemas detectados (justifican el bootstrap del 23/05)
- Pérdida de contexto entre sesiones (sin memoria externa)
- Tests creados de forma improvisada al final
- Confusión con nombres de ramas (`refactor/fase-2-reports` contenía Real Expenses)
- Founder olvidó guardar archivos antes de commits varias veces

### 📌 Estado al cerrar (verificado el 23/05/2026)
- Rama actual: **`main` limpia, working tree clean**
- Tests totales: **749 passed** en 23 test files
- Decisión: **PARAR y montar memoria externa antes de seguir**

---

## 23/05/2026 — Sesión 1: Bootstrap completo del sistema de memoria

### 🎯 Objetivo
Crear un sistema de documentación persistente (`/project`) para no perder contexto entre sesiones de trabajo con IA, y poblarlo con datos reales del proyecto.

### ✅ Qué se hizo
- Setup del sistema de memoria (7 archivos `.md` versionados).
- Cierre formal del refactor de Real Expenses (rama mergeada y borrada).
- Inventario REAL del repositorio (140 archivos, ~61.300 LOC).
- Descubrimiento clave: el refactor de Reports ya estaba hecho y desconocido.
- Documentos del cerebro rellenados con datos reales.

### 💎 Decisiones estratégicas tomadas
- **Lema oficial del proyecto:** *"Convertir esta aplicación en un éxito mundial y en la mejor UX del mundo por su sencillez, manejabilidad y privacidad."*
- **Las 5 reglas del juego con el asistente IA** (ver `00_FOUNDATION.md`).
- **Reconocimiento honesto del rol:** el partner real es el founder consigo mismo.

### 📌 Estado de salida
- ✅ Sistema `/project` operativo al 100%
- ✅ Lema oficial definido y documentado
- ✅ Protocolo de trabajo IA + founder formalizado
- 🔄 Rama activa en código: `fase-1.1/projections-refactor` (sin tocar hoy)

---

## 24/05/2026 — Sesión 2: Refactor de Goals.tsx (1.948 → 560 LOC, -71%)

### 🎯 Objetivo
Domar el segundo "monstruo" del listado: `Goals.tsx`.

### ✅ Qué se hizo
Refactor en 5 commits sobre rama `refactor/goals`:
1. Limpieza menor y extracción de `lib/goalsConstants.ts`.
2. Extracción de `components/GoalCard.tsx` (615 LOC). Goals.tsx: 1.921 → 1.374 LOC.
3. Extracción de `components/GoalWizard.tsx` (865 LOC) con los 3 pasos del wizard.
4. Cleanup final + actualización de docs.

### 📊 Métricas

| Métrica | Antes | Después | Δ |
|---|---|---|---|
| `Goals.tsx` LOC | 1.948 | 560 | **-71%** |
| Tests totales | 762 | 762 | 0 (regresión OK) |

### ⚠️ Incidente post-merge — commit `e0e4fb9`
Stub duplicado de `GoalCard` no detectado por tests/tsc, error runtime en navegador.
**Lección:** validación en navegador es obligatoria tras extracción de componentes.

### 🔑 Protocolo actualizado
Tras CUALQUIER extracción de componente:
1. `npx tsc --noEmit`
2. `npm run test:run`
3. **`npm run dev` + navegador + DevTools Console sin errores** ⬅️ innegociable
4. **Smoke test manual** ⬅️ innegociable

---

## 24/05/2026 (2ª sesión) — Sesión 3: Refactor de Accounts.tsx + Tests de Reports

### 🎯 Objetivo
Doble cierre en una sesión:
1. Domar el monstruo `Accounts.tsx` (2.032 LOC) aplicando el patrón validado en Goals.
2. Saldar la deuda inmediata de tests de `components/reports/*` (8 componentes sin cobertura).

### ✅ Parte A — Refactor de Accounts.tsx

Refactor en 9 commits sobre rama `refactor/accounts` (PR mergeado a `main`):

1. **Commit 1** (`c12cf59`) — Extracción de `ACCOUNT_TYPE_STYLES` y `getAccountStyle` a `src/lib/accountsConstants.ts`.
2. **Commit 1b** (`8945c10`) — Dedup: `Dashboard.tsx` consume el helper compartido.
3. **Commit 2** — Extracción de matemática de amortización a `src/lib/accountsCalc.ts` **con +13 tests unitarios desde el primer momento**.
4. **Commit 3** — Extracción de `AccountsSummary` (KPIs grid + sticky bar).
5. **Commit 4** — Extracción de `CreditCardAccountCard` (~180 LOC).
6. **Commit 5** — Extracción de `LoanAccountCard` (~280 LOC).
7. **Commit 6** — Extracción de `RegularAccountCard` (~380 LOC).
8. **Commit 7** — Extracción de `useLoanAmortization` hook.
9. **Commits 8-9** — Dos bugfixes detectados durante el refactor.

### 📊 Métricas del refactor de Accounts

| Métrica | Antes | Después | Δ |
|---|---|---|---|
| `Accounts.tsx` LOC | 1.730 (~2.032 originales) | **685** | **-60%** |
| Componentes nuevos | — | 4 | — |
| Hooks nuevos | — | 1 (`useLoanAmortization`) | — |
| Libs nuevas | — | 2 (`accountsConstants`, `accountsCalc`) | — |

### 🐛 Bugs detectados durante el refactor (fixeados en commits 8 y 9)

1. **Amortización total + selector de modo**: al amortizar el 100%, elegir "Reducir cuota" bloqueaba el botón porque la cuota resultante sería 0. Fix: cartel "🎯 Liquidación total" y selector oculto.
2. **Barra de progreso del préstamo**: `calcLoanProgress` usaba `appliedCount / totalEstimated` (cuotas), infravalorando progreso tras amortizaciones masivas (64% real → marcaba 10%). Fix: fórmula `(initialDebt - currentDebt) / initialDebt`.

### ⚠️ Deuda apuntada para el rediseño (Fase 2)
- UX del modal de amortización cuando `monthlyPayment` queda inconsistente.

### ✅ Parte B — Tests del módulo Reports

Rama `test/reports-coverage`. 8 archivos de tests nuevos:

| # | Componente | Tests |
|---|---|---|
| 1 | `ReportBadge` | 7 ✅ |
| 2 | `ReportKpiGrid` | 7 ✅ |
| 3 | `ReportSection` | 8 ✅ |
| 4 | `AccountsReport` | 10 ✅ |
| 5 | `GoalsReport` | 13 ✅ |
| 6 | `MovementsReport` | 15 ✅ |
| 7 | `ProjectionsReport` | 10 ✅ |
| 8 | `TrendsReport` | 11 ✅ |

**Patrón establecido para tests de componentes con `useApp`:**
```ts
const mockUseApp = vi.fn();
vi.mock('../../../AppContext', () => ({ useApp: () => mockUseApp() }));
const setCtx = (overrides = {}) => mockUseApp.mockReturnValue({ ...baseCtx, ...overrides });
```

### 📊 Métricas globales de la sesión

| Métrica | Inicio sesión | Fin sesión |
|---|---|---|
| Tests totales | 762 | **~855 passing** |
| Tests nuevos | — | +13 (accountsCalc) +81 (reports) = **+94** |
| Monstruos restantes | 5 | 4 (Accounts fuera de la lista 🐉) |
| Cobertura `components/reports/` | 0% | 100% |

### 📌 Estado al cerrar

- **Rama actual:** `test/reports-coverage` lista para PR (8 commits limpios).
- **`main`:** contiene refactor de Accounts mergeado.
- **B4 (Fase 0.5):** sigue pendiente — próxima sesión.

### ➡️ Siguiente paso recomendado

1. Hacer push y PR de `test/reports-coverage` → merge a `main`.
2. Sesión siguiente: **Fase 0.5 B4** (extracción de strings + wrapper `t()`).
3. Al cerrar B4 → **Fase 0.5 oficialmente COMPLETA** → tag `v0.5.1-i18n-prep`.
4. Después → continuar **Fase 1** (próximo monstruo: `BankImportModal.tsx` 2.221 LOC).

### 💡 Aprendizajes

1. **Tests "para regresión" no son suficientes** cuando refactorizas matemática financiera. Por eso `accountsCalc.ts` se testeó upfront (commit 2), no al final.
2. **Refactor puede descubrir bugs viejos**: los 2 bugs de amortización existían desde antes. El refactor los hizo visibles porque obligaba a entender el código.
3. **Mock de `useApp` con `vi.fn()` + helper `setCtx`** es el patrón más limpio para tests de componentes que dependen del contexto. Replicable a cualquier futuro test.
4. **Patrón `extract card → extract card → extract hook`** funciona en cascada. Es ya un patrón cerrado del proyecto, no una hipótesis.

---

## 23/05/2026 — Sesión 4: Limpieza puntual de lint (`react-hooks/refs`)

### 🎯 Objetivo
Decidir qué hacer con los ~386 errores de ESLint del repo y, en concreto, con los 12 errores de la regla `react-hooks/refs` (potencialmente bugs reales, no cosméticos).

### ✅ Qué se hizo
- **Análisis honesto** (siguiendo Reglas 1, 2 y 3 del protocolo): aplicado abogado del diablo a la propuesta inicial de mover refs a `useEffect`. Descartada por introducir gap de 1 render.
- Confirmado con el founder que el flujo de backup es **sólido** tras meses de uso real → instinto de 15 años gana sobre regla teórica de ESLint.
- **Silenciada la regla `react-hooks/refs` en 3 puntos** con `eslint-disable-next-line` + comentarios justificativos:
  - `src/AppProvider.tsx` (10 líneas, bloque de refs de backup).
  - `src/hooks/useExchangeRates.ts` (`statusRef.current = data.status`).
  - `src/hooks/useLocalStorage.ts` (`valueRef.current = value`).
- Documentada la decisión en `06_BACKLOG.md` §3, con criterios explícitos de reevaluación.
- **Estrategia acordada para los ~370 errores restantes:** *regla del boy scout* — limpiar al pasar por cada archivo en otras tareas. Sin sesión dedicada.

### 📊 Métricas

| Métrica | Antes | Después |
|---|---|---|
| Errores `react-hooks/refs` | 12 | **0** |
| Errores totales ESLint | ~386 | ~370 |
| Archivos tocados | — | 3 |
| Tests | 855 ✅ | 855 ✅ |

### 💎 Decisiones y aprendizajes

1. **No todo error de lint es un bug.** Algunas reglas marcan patrones deliberados. Documentar el porqué del silenciado vale más que refactorizar a un patrón "canónico" que rompería un flujo validado empíricamente.
2. **Aplicación viva de la Regla 4 (reset honesto):** el asistente cambió su recomendación al recibir nueva info (founder confirma que no hay StrictMode + flujo sólido). Quedó registrado en la conversación.
3. **Reevaluar este patrón si:** se activa `<React.StrictMode>` en `main.tsx`, se adoptan features concurrentes de React 18+, o aparece algún síntoma de stale data.

### 📌 Estado al cerrar
- **Rama actual:** pendiente de commit (`fix: silence react-hooks/refs in intentional ref-sync patterns`).
- **`main`:** sin cambios todavía.
- **Tests:** verdes.

### ➡️ Siguiente paso
Retomar el plan principal (Fase 0.5 B4 o el monstruo `BankImportModal.tsx`, según orden del backlog).

---

## [24/05/2026] — Sesión: Refactor BankImportModal.tsx (commits 1-3/8)

### 🎯 Objetivo
Iniciar el último gran monstruo pendiente de la Fase 1: `BankImportModal.tsx` (2.221 LOC). Plan total: 8 commits incrementales (extracción de tipos compartidos → orquestador → modal de reglas → pasos del wizard → hook de estado).

### ✅ Qué se hizo (commits 1-3 de 8)

1. **Commit 1 — Tipos compartidos:** extracción de tipos del módulo a `src/components/bank-import/types.ts`. Sin cambios funcionales.
2. **Commit 2 — Orquestador puro:** extracción de `buildImportRows`, `reApplyRules`, `importRowsToRealExpenses` a `src/lib/bankImportOrchestrator.ts` **con tests upfront** (siguiendo patrón establecido).
3. **Commit 3 — `RulesEditorModal` extraído:** nuevo componente `src/components/bank-import/RulesEditorModal.tsx` (~280 LOC). `BankImportModal.tsx` ahora consume `<RulesEditorModal />` en vez de portal inline. Estado (`editingRule`, `ruleForm`, `saveRule`) sigue en el padre — se migrará al hook en commit 8.

### 🐛 Bugs preexistentes detectados (NO introducidos por el refactor)

Durante la validación manual del commit 3, al probar "eliminar regla":
- **Toast no visible** (probable z-index del modal tapando al `ToastContainer`).
- **Falta confirmación de borrado** (el 🗑️ borra sin preguntar).

Confirmado vía `git show HEAD:src/BankImportModal.tsx` que el handler original era idéntico al refactorizado → bugs preexistentes. Anotados en `06_BACKLOG.md` §2 para abordar tras Fase 1. **Decisión consciente:** no contaminar el refactor con fixes nuevos (refactor sin cambios funcionales).

### 📊 Métricas

| Métrica | Inicio sesión | Fin sesión |
|---|---|---|
| `BankImportModal.tsx` LOC | 2.221 | ~1.940 (estimado tras commit 3) |
| Componentes nuevos en `bank-import/` | 0 | 1 (`RulesEditorModal`) |
| Libs nuevas | 0 | 1 (`bankImportOrchestrator`) |

### 📌 Estado al cerrar

- **Rama actual:** `refactor/bank-import-modal` con commits 1, 2 y 3 hechos y validados.
- **Pendiente:** commits 4-8 del plan (Step1BankSelection, Step2Upload, Step3Preview, Step4Confirm, hook `useBankImport`).
- **App:** funcionando, tests verdes, sin regresiones.

### ➡️ Siguiente paso

Próxima sesión: **commit 4 — extraer `Step1BankSelection`** (paso 1 del wizard: selección de banco/formato).

### 💡 Aprendizajes

1. **Verificar el original con `git show` antes de asumir** que un bug es regresión. Salvó tiempo y evitó "arreglar" algo que ya estaba roto antes.
2. **El protocolo BUSCAR/REEMPLAZAR con bloques exactos** sigue siendo crítico en archivos de 2.000+ LOC. Reconstruir "de memoria" handlers introduce divergencias silenciosas.
3. **Refactor descubre bugs viejos** (patrón ya visto en Accounts). Confirmado de nuevo.

---

## 27/05/2026 — Sesión: Refactor BankImportModal.tsx (commits 4-6/8)

### 🎯 Objetivo
Continuar el refactor de `BankImportModal.tsx`. Sesión anterior dejó commits 1-3 hechos. Hoy: extraer los tres pasos del wizard (commit 4, 5 y 6).

### ✅ Qué se hizo (commits 4-6 de 8)

1. **Commit 4 — `Step1BankSelection` extraído:** nuevo componente `src/components/bank-import/Step1BankSelection.tsx` (~330 LOC). Contiene tanto la lista de bancos como el formulario de formato personalizado. `showRulesEditor` se pasó como prop (guard `!showRulesEditor` del padre original preservado).
2. **Commit 5 — `Step2Upload` extraído:** nuevo componente `src/components/bank-import/Step2Upload.tsx` (~340 LOC). Contiene el badge de banco seleccionado, selector de cuenta destino, selector de fichero CSV, visor de preview con stepper de filas y banner de errores. **Decisión clave:** `fileRef` (DOM ref del file input) se movió DENTRO del componente — no es estado de aplicación, es detalle de implementación DOM.
3. **Commit 6 — `Step3Preview` extraído:** nuevo componente `src/components/bank-import/Step3Preview.tsx` (~360 LOC). Contiene el grid KPI (Nuevos/Duplicados/Descartados), el banner de reglas con botón "Gestionar reglas", y la lista completa de movimientos con categorizador, descarte/restauración/importar-igualmente, y aviso de duplicado.

### 📊 Métricas

| Métrica | Inicio sesión | Fin sesión |
|---|---|---|
| `BankImportModal.tsx` LOC | ~1.940 | **558** |
| Reducción total desde inicio del refactor | 2.221 | **558 (−75%)** |
| Componentes nuevos en `bank-import/` | 1 | **4** (RulesEditorModal + Steps 1/2/3) |
| Tests totales | 878 | **878** (sin regresiones) |

### 📌 Estado al cerrar

- **Rama actual:** `refactor/bank-import-modal` — commits 1-6 hechos y validados.
- **Pendiente:** commits 7-8 del plan original.
- **App:** funcionando, tests verdes (878), TypeScript limpio.

### ➡️ Siguiente paso

- **Commit 7:** El plan original decía "Step4Confirm" pero el wizard solo tiene 3 pasos (el confirm es un botón del footer). Revisar al inicio de sesión qué tiene más sentido: extraer `BankImportHeader` (~70 LOC: progress bar + título dinámico), o ir directamente al commit 8.
- **Commit 8:** Extraer hook `useBankImport` — mover todo el estado, efectos y handlers fuera del componente al hook. Es el commit de mayor impacto restante.

### 💡 Aprendizajes

1. **DOM refs internos no son estado de aplicación.** `fileRef` pertenece al componente que lo usa, no al padre. Pasar refs como props añade acoplamiento innecesario.
2. **La decisión "¿prop vs interno?" es la más importante de cada extracción.** Si algo solo existe para un efecto de DOM, queda en el hijo. Si su valor importa al flujo de negocio, sube al padre.
3. **`tsconfig` laxo (`strict: false`, `noImplicitAny: false`) es cómodo pero oculta inconsistencias.** `c.type` no existe en `Category` del modelo TypeScript pero funciona en runtime (datos de localStorage). El comentario en `bankImportRules.ts` lo documenta. A revisar si el tsconfig se endurece.

---

## 31/05/2026 — Sesión 9: Cierre de Fase 2 + Fase 3 i18n (F1+F2+F3)

### 🎯 Objetivo
Cerrar la Fase 2 (merge landing page + actualizar docs) y arrancar Fase 3 (i18n) con los bloques F1, F2 y F3.

### ✅ Qué se hizo

#### Apertura — Merge PR #22 (landing page)
- Mergeada rama `feat/landing-page` → `main` (PR #22): `landing/index.html` + `landing/style.css` en main.
- Actualización de todos los archivos de development excepto `05_SESSION_LOG.md`:
  - `01_ROADMAP.md`: Fases 0.5 y 1 marcadas COMPLETAS; Fase 2 EN CURSO con bloques A/B/C/D ✅ y E1+E2 ✅; Fase 3 añadida con plan F1→F4; ventanas de hitos ajustadas.
  - `06_BACKLOG.md`: SecuritySetup, TrendsView, CalendarView movidos a completados.
  - `07_NEXT_SESSION_PROMPT.md`: reescrito con estado real de Fase 2 y arranque de Fase 3.

#### Bloque F1 — Infraestructura i18next + Type safety + Tests
1. **i18next 26.3.0 instalado.**
2. **`src/i18n/i18n.ts` creado** — init con ES+EN, fallback ES.
3. **`src/i18n/en.ts` creado** — traducciones EN espejando `es.ts`.
4. **`src/i18n/t.ts` reescrito** — stub reemplazado por `i18next.t()`. Cero cambios en call sites.
5. **`TranslationKey`** — tipo derivado de `Es` via `DotPaths<>`. `t('typo.aqui')` es error de compilación.
6. **`src/i18n/__tests__/i18n.test.ts`** — 16 tests: resolución ES, resolución EN, interpolación, fallback a locale desconocida, cobertura estructural (EN tiene exactamente las mismas claves que ES).

#### Bloque F2 — react-i18next + Selector de idioma
1. **react-i18next 17.0.8 instalado**, `initReactI18next` plugin wired en `i18n.ts`.
2. **`main.tsx`** importa `i18n/i18n` antes del render.
3. **Selector de idioma en modal "Configuración regional"** — primer campo del modal (antes era "Configuración de divisas"). `Sel` con ES/EN, persiste en `localStorage['fh-lang']` vía `setLanguage()`. Modal renombrado + subtítulo actualizado.
4. **`useTranslation()`** disponible para cualquier componente React — re-renders reactivos al cambiar idioma.

#### Bloque F3 — PT-BR + FR
1. **`src/i18n/pt-br.ts`** — Português (Brasil): traducción completa de strings existentes.
2. **`src/i18n/fr.ts`** — Français: traducción completa de strings existentes.
3. **`i18n.ts`** — `SUPPORTED_LANGS` ampliado a `['es','en','pt-BR','fr']`, recursos registrados.
4. **AppShell** — 4 opciones en el Sel del modal (🇪🇸 🇬🇧 🇧🇷 🇫🇷).
5. **Tests ampliados** — cobertura automática para los 3 diccionarios no-ES (6 tests paramétricos) + spot checks PT-BR y FR.

### 📊 Métricas

| Métrica | Inicio sesión | Fin sesión |
|---|---|---|
| Tests totales | 934 | **958** (+24) |
| Idiomas soportados | 0 (stub) | **4** (ES, EN, PT-BR, FR) |
| Archivos i18n | 2 | **6** (es, en, pt-br, fr, i18n, t) |
| Commits en `main` | — | **5** (F1 infra · F1 tests · F2 · F3) |

### 📌 Estado al cerrar

- **Rama:** `main` — CI verde, build verde, 958 tests pasando.
- **Fase 2:** prácticamente completa. Único bloqueante: naming definitivo → dominio → E3 (publicación landing).
- **Fase 3:** F1+F2+F3 ✅. Pendiente **F4** — extracción de strings de componentes (el trabajo gordo, sesiones múltiples).

### ➡️ Siguiente sesión

**Opción A (si naming resuelto esta noche):** registrar dominio + publicar landing (E3) → Fase 2 CERRADA.
**Opción B:** arrancar F4 — primer namespace `common` (botones, labels, errores genéricos) + `projectionAlerts`.

### 💡 Aprendizajes

1. **El selector de idioma va en el modal de configuración regional, no en el header.** El usuario ya está tomando decisiones de localización ahí (moneda, formato de fecha) — el idioma encaja como primer campo. En el header sería ruido visual.
2. **`DotPaths<T>` para type-safe i18n keys** — derivar el tipo de claves válidas directamente del objeto fuente garantiza que cualquier typo sea error de compilación, sin mantener tipos manualmente.
3. **Tests de cobertura paramétricos** — `for (const { name, dict } of allDicts)` genera un test por idioma automáticamente. Al añadir un nuevo idioma en F3 solo hay que añadirlo al array; los tests de cobertura se generan solos.

---

## Plantilla para futuras entradas

