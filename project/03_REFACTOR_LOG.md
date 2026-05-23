# 03 — REFACTOR LOG

> Registro histórico de refactors completados. Una entrada por refactor significativo.
> **Formato:** fecha · módulo · antes → después · qué se hizo · tests · commits.
> **Cuándo añadir:** al terminar un refactor y fusionarlo a `main`.

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

