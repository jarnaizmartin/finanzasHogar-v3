# 04 — TEST COVERAGE

> Mapa de cobertura de tests del proyecto. Actualizar cuando se añadan/quiten tests o se refactorice algo que afecte cobertura.
> Última actualización: 24/05/2026 (2ª sesión)

---

## 1. Resumen ejecutivo

- **Framework:** Vitest (`src/test-setup.ts`)
- **Total tests files:** 33 (24 previos + 1 `accountsCalc` + 8 reports)
- **Total tests:** **~855 passing** (verificado 24/05/2026 tras Accounts + Reports).
- Distribución aproximada:
  - 18 tests files de `lib/` (lógica pura)
  - 4 tests files de `components/real/`
  - 8 tests files de `components/reports/` ✅ **NUEVO**
  - 1 test de integración (`views/RealExpenses.test.tsx`)
  - 1 smoke test
- **Filosofía actual:** Lib pura testeada exhaustivamente ✅. UI testeada en módulos refactorizados (real + reports).
- **Mayor agujero restante:** Componentes nuevos de Goals + Accounts + crypto/IO.

---

## 2. Cobertura por módulo

### ✅ Bien cubierto — `src/lib/` (lógica pura)

| Módulo                  | Test                                  |
|-------------------------|---------------------------------------|
| `accountsCalc` 🆕       | `accountsCalc.test.ts` (+13 tests)    |
| `alertGenerators`       | `alertGenerators.test.ts`             |
| `balanceCalc`           | `balanceCalc.test.ts`                 |
| `bankCSVParser`         | `bankCSVParser.test.ts`               |
| `bankFormats`           | `bankFormats.test.ts`                 |
| `bankImportRules`       | `bankImportRules.test.ts`             |
| `creditCardUtils`       | `creditCardUtils.test.ts` (1.010 LOC) |
| `financialInstitutions` | `financialInstitutions.test.ts`       |
| `forecastEngine`        | `forecastEngine.test.ts`              |
| `loanUtils`             | `loanUtils.test.ts` (+regresión 64%)  |
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

### ✅ Componentes refactorizados con tests — `components/reports/` 🆕

| Componente            | Test                              | # tests |
|-----------------------|-----------------------------------|---------|
| `ReportBadge`         | `ReportBadge.test.tsx`            | 7       |
| `ReportKpiGrid`       | `ReportKpiGrid.test.tsx`          | 7       |
| `ReportSection`       | `ReportSection.test.tsx`          | 8       |
| `AccountsReport`      | `AccountsReport.test.tsx`         | 10      |
| `GoalsReport`         | `GoalsReport.test.tsx`            | 13      |
| `MovementsReport`     | `MovementsReport.test.tsx`        | 15      |
| `ProjectionsReport`   | `ProjectionsReport.test.tsx`      | 10      |
| `TrendsReport`        | `TrendsReport.test.tsx`           | 11      |

**Total módulo reports: 81 tests.**

### ✅ Test de integración

| Vista                | Test                                |
|----------------------|-------------------------------------|
| `RealExpenses`       | `views/__tests__/RealExpenses.test.tsx` |

---

## 3. Agujeros de cobertura (lo que falta)

### 🟠 Importante — Refactors recientes sin tests propios

- `components/AccountsSummary.tsx` (refactor 24/05 2ª sesión)
- `components/CreditCardAccountCard.tsx` (refactor 24/05 2ª sesión)
- `components/LoanAccountCard.tsx` (refactor 24/05 2ª sesión)
- `components/RegularAccountCard.tsx` (refactor 24/05 2ª sesión)
- `hooks/useLoanAmortization.ts` (refactor 24/05 2ª sesión) — **prioritario** por mover dinero real
- `components/GoalCard.tsx` (refactor 24/05/2026)
- `components/GoalWizard.tsx` (refactor 24/05/2026)
- `components/real/RealExpensesAnalysis.tsx` (pendiente histórico)
- `src/Reports.tsx` (cascarón post-refactor, 578 LOC) — sin test de integración

### 🟠 Importante — Lib sin tests (crypto / IO)

| Módulo              | Por qué falta                                   |
|---------------------|-------------------------------------------------|
| `backupCrypto`      | Requiere mocks de WebCrypto                     |
| `crypto` (582 LOC)  | Requiere mocks de WebCrypto                     |
| `encryptedStorage`  | Mocks de IO + crypto                            |
| `storageCrypto`     | Mocks de WebCrypto                              |
| `vaultKey`          | Mocks de WebCrypto                              |
| `web3forms`         | Mocks de fetch                                  |

→ **Decisión pendiente** (apuntada en `06_BACKLOG.md`).

### 🔴 Crítico — Monstruos sin tests (pre-refactor)

Vistas/componentes grandes sin ningún test:
- ~~`views/Accounts.tsx`~~ ✅ refactorizado (24/05/2026 2ª sesión, 685 LOC).
- `views/Categories.tsx` (829)
- `views/Transfers.tsx` (834)
- `views/Dashboard.tsx` (797)
- `views/Projections.tsx` (799)
- `views/ProjectedVsReal.tsx` (773)
- `views/AlertsPanel.tsx` (771)
- `views/TrendsView.tsx` (1.223)
- `views/SecuritySetup.tsx` (1.296)
- `BankImportModal.tsx` (2.221) — próximo refactor recomendado
- `HelpCenter.tsx` (2.077)
- `CalendarView.tsx` (1.946)
- `AppShell.tsx` (1.243)
- `components/UI.tsx` (1.178)
- `components/AccountFormModal.tsx` (1.173)
- `components/ProjectionFormModal.tsx` (1.170)

---

## 4. Estrategia de testing

### Patrón validado (a replicar)

1. **Lib pura** → test unitario obligatorio.
2. **Componente extraído de refactor** → test mínimo de render + interacciones clave.
3. **Componente con `useApp()`** → mock del contexto:
   ```ts
   const mockUseApp = vi.fn();
   vi.mock('../../../AppContext', () => ({ useApp: () => mockUseApp() }));
   const setCtx = (overrides = {}) => mockUseApp.mockReturnValue({ ...baseCtx, ...overrides });
   ```
4. **Componente que consume lib** → mockear la lib para aislar el render:
   ```ts
   vi.mock('../../../lib/reportsCalc', () => ({ computeTrendsStats: (...a) => mockFn(...a) }));
   ```
5. **Vista grande** → test de integración smoke (que monte sin romperse).
6. **Crypto/IO** → decisión caso a caso (ver backlog).

### Reglas prácticas

- **Matemática financiera** → tests **upfront**, no diferidos (lección de `accountsCalc.ts`).
- **Tests reflejan especificación, no comportamiento** — prohibido adaptar tests a bugs ("cheating"). Si un test falla porque el código tiene un bug, se arregla el código (caso `calcLoanProgress` 24/05 2ª sesión).

---

## 5. Próximas acciones de cobertura

Por prioridad:

1. **`useLoanAmortization` hook** — mueve dinero real, prioritario.
2. **Tests de los 4 componentes nuevos de Accounts** (`AccountsSummary`, `CreditCardAccountCard`, `LoanAccountCard`, `RegularAccountCard`).
3. **Test de integración para `Reports.tsx`** post-refactor.
4. **Test propio para `RealExpensesAnalysis.tsx`** (cierre del refactor de Real).
5. **Tests del refactor de Goals** — `GoalCard.tsx` y `GoalWizard.tsx`.
6. **Decisión sobre crypto** (testear con mocks vs. aceptar gap).

---

## 6. Cómo lanzar los tests

Scripts disponibles en `package.json` (verificados 23/05/2026):

| Comando                  | Qué hace                                              |
|--------------------------|-------------------------------------------------------|
| `npm test`               | Vitest en modo **watch** (queda activo, recarga).     |
| `npm run test:run`       | Vitest **one-shot**, ideal para CI o verificación.    |
| `npm run test:coverage`  | One-shot + reporte de cobertura.                      |
| `npm run test:ui`        | Vitest con interfaz gráfica en navegador.             |
| `npm run test:run -- <patrón>` | Filtra y ejecuta solo tests cuyo path coincida. |

**Recomendación:** usar `npm run test:run` para verificación rápida, `npm test` durante desarrollo activo, `npm run test:run -- <nombre>` durante iteración sobre un archivo concreto.
