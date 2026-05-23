# 03 — REFACTOR LOG

> Registro histórico de refactors completados. Una entrada por refactor significativo.
> **Formato:** fecha · módulo · antes → después · qué se hizo · tests · commits.
> **Cuándo añadir:** al terminar un refactor y fusionarlo a `main`.

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
- **Commit 5**: cleanup final + docs (este archivo, `02_ARCHITECTURE.md`, `01_ROADMAP.md`, `04_TEST_COVERAGE.md`, `06_BACKLOG.md`, `05_SESSION_LOG.md`).

### 💎 Decisiones de diseño
- `GoalWizard` como componente único (no 3 sub-componentes por paso): los 3 steps comparten el mismo shape de estado.
- Hijos consumen `useApp()` directamente → props mínimas, call-sites legibles.
- Modal NO extraído (la lógica de orquestación sigue acoplada a Goals; 560 LOC ya es manejable).

### 🧪 Tests
- ✅ **762 tests passing** antes y después (sin regresiones, cobertura por test de regresión).
- ❌ Sin tests unitarios propios para `GoalCard.tsx` ni `GoalWizard.tsx` → **PENDIENTE** (anotado en `06_BACKLOG.md`).

### 📦 Commits en `refactor/goals`
7953383 refactor(goals): extract GoalCard to its own component file a26683e refactor(goals): extract wizard (3 steps) to GoalWizard component (commit 5 pendiente — docs)

### 💡 Notas
Segundo refactor "modelo" tras Projections, aplicando el patrón validado en RealExpenses (extraer card → extraer wizard → cleanup). Confirma que el patrón es replicable. Próximo monstruo recomendado: `Accounts.tsx` (2.032 LOC).

### ⚠️ Hotfix post-merge — commit `e0e4fb9`
Stub duplicado de `GoalCard` no detectado por tests/tsc, error runtime en navegador.
**Lección:** validación en navegador es obligatoria tras extracción de componentes.
Ver detalle en `05_SESSION_LOG.md` (sesión 24/05 tarde).

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
Primer refactor "modelo" del proyecto. Validó el patrón replicado después en BankImport, AppProvider, Reports y RealExpenses.
Entrada añadida retroactivamente el 23/05/2026 durante auditoría de estado.

---

## 22/05/2026 — Refactor de AppProvider.tsx (PR #3)

### 📏 Antes → Después
- AppProvider: **~870 LOC → ~521 LOC** (–40% aprox.)

### 📦 Commit en main
`06945d5 refactor: Fase 1.3 — Extracción de lógica pura de AppProvider (#3)`

### 💡 Notas
Entrada retroactiva (23/05/2026). Detalles exactos a revisar en PR #3 si se aborda futuro refactor.

---

## 22/05/2026 — Refactor de BankImportModal.tsx (PR #2)

### 📏 Antes → Después
- BankImportModal: extracción de lógica a `src/lib/` (componente sigue ~2.221 LOC, posible discrepancia inventario vs merge)

### 📦 Commit en main
`92a7693 refactor(bank-import): extract logic from BankImportModal to /lib (#2)`

### 💡 Notas
Entrada retroactiva (23/05/2026). Verificar LOC real con `wc -l src/BankImportModal.tsx` al inicio de próxima sesión.

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
- ❌ Tests de componentes UI de reports → **PENDIENTE** (anotado en `06_BACKLOG.md`).
- ❌ Test de integración de `Reports.tsx` → **PENDIENTE**.

### 📦 Commits
Incluidos en la rama `refactor/fase-2-reports` junto al refactor de Real Expenses.

### 💡 Notas
Este refactor estaba hecho pero no documentado. Se redescubrió durante el inventario en la sesión de bootstrap del cerebro del proyecto.

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

