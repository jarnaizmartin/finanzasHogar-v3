# 04 — TEST COVERAGE

> Mapa de cobertura de tests del proyecto. Actualizar cuando se añadan/quiten tests o se refactorice algo que afecte cobertura.
> Última actualización: 23/05/2026

---

## 1. Resumen ejecutivo

- **Framework:** Vitest (`src/test-setup.ts`)
- **Total tests files:** 23
- **Total tests:** **749 passed** (verificado 23/05/2026 con `npm test`, duración ~8.9s)
- Distribución aproximada:
  - 17 tests files de `lib/` (lógica pura) → mayor parte de los 749
  - 4 tests files de `components/real/`
  - 1 test de integración (`views/RealExpenses.test.tsx`)
  - 1 smoke test
- **Filosofía actual:** Lib pura testeada exhaustivamente ✅. UI testeada solo donde se ha refactorizado recientemente.
- **Mayor agujero:** Componentes nuevos de `reports/` sin tests + todos los "monstruos" sin tocar.

---

## 2. Cobertura por módulo

### ✅ Bien cubierto — `src/lib/` (lógica pura)

| Módulo                  | Test                                  |
|-------------------------|---------------------------------------|
| `alertGenerators`       | `alertGenerators.test.ts`             |
| `balanceCalc`           | `balanceCalc.test.ts`                 |
| `bankCSVParser`         | `bankCSVParser.test.ts`               |
| `bankFormats`           | `bankFormats.test.ts`                 |
| `bankImportRules`       | `bankImportRules.test.ts`             |
| `creditCardUtils`       | `creditCardUtils.test.ts` (1.010 LOC) |
| `financialInstitutions` | `financialInstitutions.test.ts`       |
| `forecastEngine`        | `forecastEngine.test.ts`              |
| `loanUtils`             | `loanUtils.test.ts`                   |
| `projectionAlerts`      | `projectionAlerts.test.ts`            |
| `projectionsForm`       | `projectionsForm.test.ts`             |
| `projectionsStats`      | `projectionsStats.test.ts`            |
| `recurringMotor`        | `recurringMotor.test.ts`              |
| `reportsCalc`           | `reportsCalc.test.ts`                 |
| `reportsCsv`            | `reportsCsv.test.ts`                  |
| `timestamps`            | `timestamps.test.ts`                  |
| `utils`                 | `utils.test.ts`                       |

### ✅ Componentes refactorizados con tests — `components/real/`

| Componente                  | Test                                      |
|-----------------------------|-------------------------------------------|
| `RealExpenseFiltersBar`     | `RealExpenseFiltersBar.test.tsx`          |
| `RealExpenseFormModal`      | `RealExpenseFormModal.test.tsx`           |
| `RealExpensesList`          | `RealExpensesList.test.tsx`               |
| `RealExpenseWarningModal`   | `RealExpenseWarningModal.test.tsx`        |
| `RealExpensesAnalysis`      | ❌ Sin test propio                        |

### ✅ Test de integración

| Vista                | Test                                |
|----------------------|-------------------------------------|
| `RealExpenses`       | `views/__tests__/RealExpenses.test.tsx` |

---

## 3. Agujeros de cobertura (lo que falta)

### 🔴 Crítico — Refactor reciente sin tests

**Toda la familia `components/reports/`** (8 archivos, refactor de Reports.tsx ya mergeado, 0 tests):
- `AccountsReport.tsx`
- `GoalsReport.tsx`
- `MovementsReport.tsx`
- `ProjectionsReport.tsx`
- `TrendsReport.tsx`
- `ReportBadge.tsx`
- `ReportKpiGrid.tsx`
- `ReportSection.tsx`

Y también:
- `src/Reports.tsx` (cascarón post-refactor, 578 LOC) → sin test de integración.
- `components/real/RealExpensesAnalysis.tsx` → sin test propio.

### 🟠 Importante — Lib sin tests (crypto / IO)

| Módulo              | Por qué falta                                   |
|---------------------|-------------------------------------------------|
| `backupCrypto`      | Requiere mocks de WebCrypto                     |
| `crypto` (582 LOC)  | Requiere mocks de WebCrypto                     |
| `encryptedStorage`  | Mocks de IO + crypto                            |
| `storageCrypto`     | Mocks de WebCrypto                              |
| `vaultKey`          | Mocks de WebCrypto                              |
| `web3forms`         | Mocks de fetch                                  |

→ **Decisión pendiente** (apuntada en `06_BACKLOG.md`): ¿se testean con mocks o se aceptan como "infra no testeable unitariamente"?

### 🔴 Crítico — Monstruos sin tests (pre-refactor)

Vistas/componentes grandes sin ningún test:
- `views/Goals.tsx` (1.976 LOC) — próximo refactor recomendado
- `views/Accounts.tsx` (2.032)
- `views/Categories.tsx` (829)
- `views/Transfers.tsx` (834)
- `views/Dashboard.tsx` (797)
- `views/Projections.tsx` (799)
- `views/ProjectedVsReal.tsx` (773)
- `views/AlertsPanel.tsx` (771)
- `views/TrendsView.tsx` (1.223)
- `views/SecuritySetup.tsx` (1.296)
- `BankImportModal.tsx` (2.221)
- `HelpCenter.tsx` (2.077)
- `CalendarView.tsx` (1.946)
- `AppShell.tsx` (1.243)
- `components/UI.tsx` (1.178)
- `components/AccountFormModal.tsx` (1.173)
- `components/ProjectionFormModal.tsx` (1.170)

---

## 4. Estrategia de testing

### Patrón validado (a replicar)

El refactor de RealExpenses estableció el patrón:
1. Extraer subcomponentes a `components/<modulo>/`.
2. Test unitario por subcomponente en `components/<modulo>/__tests__/`.
3. Test de integración de la vista en `views/__tests__/`.
4. Lógica pura → siempre en `lib/` con su test.

### Reglas prácticas

- **Lógica pura → test unitario obligatorio.**
- **Componente refactorizado → test mínimo de render + interacciones clave.**
- **Vista grande → test de integración smoke (que monte sin romperse).**
- **Crypto/IO → decisión caso a caso (ver backlog).**

---

## 5. Próximas acciones de cobertura

Por prioridad:

1. **Tests de `components/reports/*`** — deuda inmediata del último refactor.
2. **Test de integración para `Reports.tsx`** post-refactor.
3. **Test propio para `RealExpensesAnalysis.tsx`** (cierre del refactor de Real).
4. **Tests del refactor de Goals** (cuando se acometa).
5. **Decisión sobre crypto** (testear con mocks vs. aceptar gap).

---

## 6. Cómo lanzar los tests

```
npm test
```

(Comandos exactos pendientes de confirmar — verificar `package.json` y añadir aquí: `test`, `test:watch`, `test:coverage`.)
