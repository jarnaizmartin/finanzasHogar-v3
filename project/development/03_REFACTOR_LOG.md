# 03 — REFACTOR LOG

> Registro histórico de refactors completados. Una entrada por refactor significativo.
> **Formato:** fecha · módulo · antes → después · qué se hizo · tests · commits.
> **Cuándo añadir:** al terminar un refactor y fusionarlo a `main`.

---

## 30/05/2026 — Refactor de TrendsView.tsx (1.223 → 58 LOC, -95%)

### 🎯 Módulo
`src/views/TrendsView.tsx` — refactor completo en 4 commits sobre rama `refactor/trends-view` (PR #16).

### 📏 Antes → Después
- `TrendsView.tsx`: **1.223 → 58 LOC** (–95%).
- Lógica de cómputo pura → `lib/trendsCalc.ts` con 19 tests.
- Hook de medición de contenedor → `hooks/useContainerWidth.ts`.
- 10 subcomponentes extraídos a `components/trends/`.

### 🔨 Qué se hizo
- **Commit 1** (`18476ea`): `ACCOUNT_COLORS` → `constants.ts`.
- **Commit 2** (`d126f43`): `useTrendsData` (era función pura sin hooks) → `lib/trendsCalc.ts` con 19 tests.
- **Commit 3** (`423766b`): `useContainerWidth` → `src/hooks/useContainerWidth.ts`.
- **Commit 4** (`fd1a4c3`): 9 subcomponentes + reescritura de la vista (58 LOC).

### 💎 Estructura resultante
```
src/
  views/TrendsView.tsx               58 LOC
  lib/trendsCalc.ts                  (con tests)
  hooks/useContainerWidth.ts         (reutilizable)
  components/trends/
    constants.ts · TrendsEmptyState · TrendsHeader
    TrendsStatsGrid · TrendsStickyBar · TrendsTooltip
    TrendsChartIncomeExpenses · TrendsChartSavingsRate
    TrendsChartBalance · TrendsCategoryCharts · TrendsSummaryHighlights
```

### 🧪 Tests
- **910 passing** al cerrar (sin regresiones, +19 tests en trendsCalc).

### 💡 Notas
- `useTrendsData` no tenía ningún hook React dentro — era función pura. Movida a `lib/` directamente.
- `useContainerWidth` (ResizeObserver con debounce) ahora reutilizable para futuros gráficos.
- Refactor completado en la misma sesión que SecuritySetup, en tiempo extra.

---

## 30/05/2026 — Refactor de SecuritySetup.tsx (1.296 → 146 LOC, -89%)

### 🎯 Módulo
`src/views/SecuritySetup.tsx` — refactor completo en 7 commits sobre rama `refactor/security-setup` (PR #15).

### 📏 Antes → Después
- `SecuritySetup.tsx`: **1.296 → 146 LOC** (–89%).
- 6 render functions inline → 6 subcomponentes independientes.
- Todo el estado y lógica → `useSecuritySetup` hook.
- Lógica de fuerza de contraseña → `lib/securitySetupValidation.ts` con tests.

### 🔨 Qué se hizo
- **Commit 1** (`d1684ca`): estilos compartidos + `AUTH_METHODS` → `constants.ts`.
- **Commit 2** (`2168635`): `getPasswordStrength`, `getPasswordStrengthLabel`, `STRENGTH_COLORS` → `lib/securitySetupValidation.ts` **con tests upfront**.
- **Commit 3** (`b3a6b28`): extracción de `Step1AuthMethod`.
- **Commit 4** (`619f834`): extracción de `Step2Password`.
- **Commit 5** (`e4071b8`): extracción de `Step2Totp`.
- **Commit 6** (`6324493`): extracción de `Step3RecoveryPhrase`, `Step4ConfirmPhrase`, `Step5EmailVerification`, `Step6Summary`.
- **Commit 7** (`29f8ccc`): extracción de `useSecuritySetup` hook — vista queda como wiring puro (146 LOC).

### 💎 Estructura resultante
```
src/
  views/SecuritySetup.tsx          146 LOC
  hooks/useSecuritySetup.ts        218 LOC
  components/security-setup/
    constants.ts
    Step1AuthMethod.tsx
    Step2Password.tsx
    Step2Totp.tsx
    Step3RecoveryPhrase.tsx
    Step4ConfirmPhrase.tsx
    Step5EmailVerification.tsx
    Step6Summary.tsx
  lib/securitySetupValidation.ts   (con tests)
```

### 🧪 Tests
- **891 passing** al cerrar (sin regresiones).
- Tests de `securitySetupValidation.ts` añadidos en commit 2.
- ❌ Sin tests de integración propios para los subcomponentes → **PENDIENTE** (anotado en `06_BACKLOG.md`).

### 💡 Notas
- Componente más sensible del proyecto (TOTP, hash de frase, descarga de fichero). Ningún handler de lógica de seguridad fue modificado, solo movido al hook.
- **Sesión interrumpida** a mitad (cierre accidental). Retomada en la misma sesión sin pérdida de trabajo gracias al git history.

---

## 24/05/2026 (2ª sesión) — Tests del módulo Reports

### 🎯 Módulo
`src/components/reports/__tests__/*` — cierre de deuda del refactor de Reports (mergeado 22/05).

### 📏 Cobertura añadida
8 archivos de tests nuevos cubriendo los 8 componentes de `components/reports/`:

| Componente | Tests |
|---|---|
| `ReportBadge` | 7 ✅ |
| `ReportKpiGrid` | 7 ✅ |
| `ReportSection` | 8 ✅ |
| `AccountsReport` | 10 ✅ |
| `GoalsReport` | 13 ✅ |
| `MovementsReport` | 15 ✅ |
| `ProjectionsReport` | 10 ✅ |
| `TrendsReport` | 11 ✅ |

**Total: +81 tests.**

### 💎 Patrón establecido (replicable)

Para tests de componentes que dependen de `useApp()`:
```ts
const mockUseApp = vi.fn();
vi.mock('../../../AppContext', () => ({ useApp: () => mockUseApp() }));
const setCtx = (overrides = {}) => mockUseApp.mockReturnValue({ ...baseCtx, ...overrides });
```

Para componentes que consumen lib pura (ej. `TrendsReport` → `computeTrendsStats`):
```ts
const mockCompute = vi.fn();
vi.mock('../../../lib/reportsCalc', () => ({ computeTrendsStats: (...a) => mockCompute(...a) }));
```

### 📦 Commits en `test/reports-coverage`
```
xxxxxxx test(reports): add unit tests for ReportBadge
xxxxxxx test(reports): add unit tests for ReportKpiGrid
xxxxxxx test(reports): add unit tests for ReportSection
xxxxxxx test(reports): add unit tests for AccountsReport
xxxxxxx test(reports): add unit tests for GoalsReport
xxxxxxx test(reports): add unit tests for MovementsReport
xxxxxxx test(reports): add unit tests for ProjectionsReport
xxxxxxx test(reports): add unit tests for TrendsReport
```

### 💡 Notas
Saldada la deuda más crítica de `04_TEST_COVERAGE.md`. Queda pendiente:
- Test de integración para `Reports.tsx` (post-refactor, 578 LOC).
- Test propio para `RealExpensesAnalysis.tsx`.
- Tests para `GoalCard.tsx` y `GoalWizard.tsx`.
- Tests para los 4 componentes nuevos de Accounts + `useLoanAmortization` hook.

---

## 24/05/2026 (2ª sesión) — Refactor de Accounts.tsx

### 🎯 Módulo
`src/views/Accounts.tsx` — refactor completo en 9 commits sobre rama `refactor/accounts`.

### 📏 Antes → Después
- `Accounts.tsx`: **1.730 → 685 LOC** (–60%).
- 4 componentes nuevos + 1 hook + 2 libs.
- Dedup colateral en `Dashboard.tsx`.

### 🔨 Qué se hizo
- **Commit 1** (`c12cf59`): `ACCOUNT_TYPE_STYLES` y `getAccountStyle` → `src/lib/accountsConstants.ts`.
- **Commit 1b** (`8945c10`): `Dashboard.tsx` consume el helper compartido (eliminada duplicación).
- **Commit 2**: matemática pura a `src/lib/accountsCalc.ts` (`recalcLoanAfterAmortization` + `estimateInterestSaved`) **con +13 tests unitarios upfront**.
- **Commit 3**: `AccountsSummary` (KPIs grid + StickyCompactBar) → `src/components/AccountsSummary.tsx`.
- **Commit 4**: `CreditCardAccountCard` → `src/components/CreditCardAccountCard.tsx`.
- **Commit 5**: `LoanAccountCard` → `src/components/LoanAccountCard.tsx`.
- **Commit 6**: `RegularAccountCard` → `src/components/RegularAccountCard.tsx`.
- **Commit 7**: `useLoanAmortization` → `src/hooks/useLoanAmortization.ts` (estado + handlers de amortización y undo).
- **Commit 8**: `fix(amortization)` — ocultar selector de modo en liquidación total.
- **Commit 9**: `fix(loans)` — `calcLoanProgress` basado en capital pagado, no en cuotas (+ tests de regresión).

### 💎 Decisiones de diseño
- **3 cards separadas** (no un `AccountCard` polimórfico): los diseños de credit/loan/normal son visualmente muy distintos.
- **Hijos consumen `useApp()` directamente** → props mínimas (account + callbacks UI).
- **`accountsCalc.ts` con tests upfront** (no diferidos): la matemática financiera no admite regresión silenciosa.
- **Hook `useLoanAmortization`** encapsula estado + handlers + derivado (`amortizingLoan`), dejando `Accounts.tsx` como pura orquestación de UI.
- **`AccountFormModal` y `AmortizationFormModal` quedan fuera** de esta tanda (ya extraídos, pendientes en backlog).

### 🧪 Tests
- ✅ +13 tests nuevos en `src/lib/__tests__/accountsCalc.test.ts` (escenarios: liquidación total, modo `reduce_payment`, modo `reduce_term`, caso defensivo cuota < intereses).
- ✅ Tests de regresión en `loanUtils.test.ts` (incluye caso real del bug: 64% pagado tras amortización masiva).
- ❌ Sin tests unitarios propios para los 4 componentes de UI extraídos → **PENDIENTE** (anotado en `06_BACKLOG.md`).

### 🐛 Bugs cazados y corregidos (regalos del refactor)
1. **Liquidación total + Reducir cuota** bloqueaba el botón "Aplicar" (cuota resultante 0 + plazo > 0). Fix: cartel "🎯 Liquidación total" y selector oculto.
2. **Progreso del préstamo** infravalorado tras amortizaciones grandes (cuotas vs capital). Fix: fórmula basada en capital pagado.

### 💡 Notas
Tercer refactor "modelo" tras Projections y Goals. Confirma definitivamente el patrón:
**constants → lib pura (con tests) → cards → hook de lógica → cleanup**.
Próximo monstruo recomendado: `BankImportModal.tsx` (2.221 LOC).

---

## 24/05/2026 — Refactor de Goals.tsx

### 🎯 Módulo
`src/views/Goals.tsx` — refactor completo en 5 commits sobre rama `refactor/goals`.

### 📏 Antes → Después
- `Goals.tsx`: **1.948 LOC → 560 LOC** (–71%).
- Constantes extraídas a `src/lib/goalsConstants.ts` (emojis + paleta).
- UI dividida en 2 componentes nuevos en `src/components/`.

### 🔨 Qué se hizo
- **Commit 1-2**: limpieza menor + extracción de `lib/goalsConstants.ts`.
- **Commit 3** (`7953383`): extracción de `components/GoalCard.tsx` (615 LOC). Goals.tsx: 1.921 → 1.374 LOC.
- **Commit 4** (`a26683e`): extracción de `components/GoalWizard.tsx` (865 LOC) con los 3 pasos del wizard del modal. Goals.tsx: 1.374 → 560 LOC.
- **Commit 5**: cleanup final + docs.

### 💎 Decisiones de diseño
- `GoalWizard` como componente único (no 3 sub-componentes por paso): los 3 steps comparten el mismo shape de estado.
- Hijos consumen `useApp()` directamente → props mínimas, call-sites legibles.
- Modal NO extraído (la lógica de orquestación sigue acoplada a Goals; 560 LOC ya es manejable).

### 🧪 Tests
- ✅ **762 tests passing** antes y después (sin regresiones, cobertura por test de regresión).
- ❌ Sin tests unitarios propios para `GoalCard.tsx` ni `GoalWizard.tsx` → **PENDIENTE** (anotado en `06_BACKLOG.md`).

### 📦 Commits en `refactor/goals`
```
7953383 refactor(goals): extract GoalCard to its own component file
a26683e refactor(goals): extract wizard (3 steps) to GoalWizard component
```

### ⚠️ Hotfix post-merge — commit `e0e4fb9`
Stub duplicado de `GoalCard` no detectado por tests/tsc, error runtime en navegador.
**Lección:** validación en navegador es obligatoria tras extracción de componentes.
Ver detalle en `05_SESSION_LOG.md` (sesión 24/05).

---

## 22/05/2026 — Refactor de Projections.tsx (PR #1, Fase 1.1 completa)

### 🎯 Módulo
`src/views/Projections.tsx` — refactor completo en 5 bloques.

### 📏 Antes → Después
- Projections.tsx: **-66%** del tamaño original (estado final: 799 LOC)
- Lógica extraída a `src/lib/projectionsForm.ts`, `projectionsStats.ts`, etc.

### 🧪 Tests
- ✅ **+106 tests** añadidos
- ✅ **+1 bug fix** detectado y corregido gracias a los tests

### 📦 Commit en main
`909caa5 Fase 1.1: Refactor Projections.tsx (-66%, +106 tests, 1 bug fix) (#1)`

### 💡 Notas
Primer refactor "modelo" del proyecto. Validó el patrón replicado después en BankImport, AppProvider, Reports, RealExpenses, Goals y Accounts.

---

## 22/05/2026 — Refactor de AppProvider.tsx (PR #3)

### 📏 Antes → Después
- AppProvider: **~870 LOC → ~521 LOC** (–40% aprox.)

### 📦 Commit en main
`06945d5 refactor: Fase 1.3 — Extracción de lógica pura de AppProvider (#3)`

---

## 22/05/2026 — Refactor de BankImportModal.tsx (PR #2)

### 📏 Antes → Después
- BankImportModal: extracción de lógica a `src/lib/` (componente sigue ~2.221 LOC, UI pendiente de trocear)

### 📦 Commit en main
`92a7693 refactor(bank-import): extract logic from BankImportModal to /lib (#2)`

### 💡 Notas
Solo se extrajo lógica a `/lib/`. La UI (2.221 LOC) sigue pendiente y va a Fase 1 propiamente dicha. **Próximo objetivo de refactor**.

---

## 22/05/2026 — Refactor de Reports.tsx

### 🎯 Módulo
`src/Reports.tsx` y nueva carpeta `src/components/reports/`.

### 📏 Antes → Después
- `Reports.tsx`: **2.164 LOC → 578 LOC** (–73%).
- Lógica extraída a `src/lib/reportsCalc.ts` (286 LOC) y `src/lib/reportsCsv.ts` (105 LOC).
- UI dividida en 8 componentes en `src/components/reports/`.

### 🔨 Qué se hizo
- Extraídos como componentes independientes:
  - `AccountsReport.tsx` (144 LOC)
  - `GoalsReport.tsx` (151 LOC)
  - `MovementsReport.tsx` (389 LOC)
  - `ProjectionsReport.tsx` (148 LOC)
  - `TrendsReport.tsx` (160 LOC)
  - `ReportBadge.tsx` (42 LOC)
  - `ReportKpiGrid.tsx` (72 LOC)
  - `ReportSection.tsx` (61 LOC)
- Lógica de cálculo aislada en `lib/reportsCalc.ts`.
- Lógica de export CSV aislada en `lib/reportsCsv.ts`.

### 🧪 Tests
- ✅ `reportsCalc.test.ts` (352 LOC)
- ✅ `reportsCsv.test.ts` (156 LOC)
- ✅ **Tests de los 8 componentes UI añadidos en sesión 24/05 (2ª sesión)** — ver entrada arriba.
- ❌ Test de integración de `Reports.tsx` → **PENDIENTE**.

---

## 22/05/2026 — Refactor de Real Expenses

### 🎯 Módulo
`src/views/RealExpenses.tsx` y nueva carpeta `src/components/real/`.

### 📏 Antes → Después
- `RealExpenses.tsx`: **~1.545 LOC → 825 LOC** (–47%).
- UI dividida en 5 componentes en `src/components/real/`.

### 🔨 Qué se hizo
Extraídos como componentes independientes:
- `RealExpenseFormModal.tsx` (321 LOC)
- `RealExpenseFiltersBar.tsx` (282 LOC)
- `RealExpensesList.tsx` (184 LOC)
- `RealExpensesAnalysis.tsx` (166 LOC)
- `RealExpenseWarningModal.tsx` (76 LOC)

Cleanup adicional: eliminado bloque de análisis huérfano de un refactor anterior.

### 🧪 Tests
- ✅ `RealExpenseFormModal.test.tsx` (287 LOC)
- ✅ `RealExpenseFiltersBar.test.tsx` (239 LOC)
- ✅ `RealExpensesList.test.tsx` (292 LOC)
- ✅ `RealExpenseWarningModal.test.tsx` (57 LOC)
- ✅ Test de integración: `views/__tests__/RealExpenses.test.tsx` (266 LOC)
- ❌ `RealExpensesAnalysis.tsx` → sin test propio (**PENDIENTE**, anotado en `06_BACKLOG.md`).

### 📦 Commits
```
5a41278 refactor(real-expenses): extract RealExpenseFormModal
d053301 refactor(real-expenses): extract RealExpenseFiltersBar
2f1c67e refactor(real-expenses): extract RealExpensesList and RealExpensesAnalysis
5fd6843 refactor(real-expenses): extract RealExpenseWarningModal + cleanup
133b630 fix(real-expenses): remove orphan analysis block from old refactor
```

### 💡 Notas
Este refactor estableció el **patrón a replicar** en futuros refactors:
1. Extraer subcomponentes a `components/<modulo>/`.
2. Test unitario por subcomponente.
3. Test de integración de la vista.
4. Lógica pura siempre en `lib/`.

---

## Plantilla para futuras entradas

