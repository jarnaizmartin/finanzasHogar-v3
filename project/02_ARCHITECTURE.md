# 02 — ARCHITECTURE

> Mapa real del repositorio. Actualizar cuando se añadan/muevan archivos importantes o se cree una nueva carpeta.
> Última actualización: 23/05/2026
> ⚠️ LOC verificados contra `main` el 24/05/2026 (working tree clean, 762 tests passing).

---

## 1. Resumen ejecutivo

- **Stack:** React + TypeScript + Vite
- **Tests:** Vitest (setup en `src/test-setup.ts`)
- **Tamaño:** ~140 archivos .ts/.tsx · ~61.300 líneas
- **Estado general:** App madura, en proceso de modularización progresiva. Lógica de negocio (`src/lib/`) muy bien testeada. UI con varios "monstruos" pendientes de trocear.

---

## 2. Estructura de carpetas

```
src/
├── lib/                    → Lógica pura (cálculos, parsers, crypto, utils). MUY testeada.
│   └── __tests__/          → Tests unitarios de lib (17 ficheros).
├── hooks/                  → Hooks custom reutilizables (7 hooks).
├── contexts/               → React Contexts modernos (Data, Settings, Toast, UI).
├── views/                  → Pantallas principales de la app (17 vistas).
│   └── __tests__/          → Tests de integración de vistas.
├── components/             → Componentes UI reutilizables.
│   ├── real/               → Componentes del módulo Real Expenses (refactor reciente ✅).
│   │   └── __tests__/
│   └── reports/            → Componentes del módulo Reports (refactor reciente ✅).
└── (raíz src/)             → Archivos top-level: App, AppShell, contextos legacy, vistas grandes sin migrar a /views.
```

---

## 3. Contextos React (estado global)

| Contexto                  | Ubicación                          | Notas |
|---------------------------|------------------------------------|-------|
| `AppContext`              | `src/AppContext.tsx`               | Legacy. Convive con los `contexts/` modernos. |
| `AppProvider`             | `src/AppProvider.tsx`              | Orquesta todos los providers (521 líneas, grande). |
| `DataContext`             | `src/contexts/DataContext.tsx`     | Datos principales. |
| `SettingsContext`         | `src/contexts/SettingsContext.tsx` | Ajustes del usuario. |
| `ToastContext`            | `src/contexts/ToastContext.tsx`    | Sistema de notificaciones. |
| `UIContext`               | `src/contexts/UIContext.tsx`       | Estado UI (modales, vistas activas). |
| `LicenseContext`          | `src/LicenseContext.tsx`           | Gestión de licencia. |
| `SecurityContext`         | `src/SecurityContext.tsx`          | Seguridad/cifrado (782 líneas). |
| `TourContext`             | `src/components/TourContext.tsx`   | Onboarding / coachmarks. |

⚠️ **Pendiente revisar:** 9 contextos es mucho. Posible solapamiento entre `AppContext` y los `contexts/` nuevos. Apuntado al backlog.

---

## 4. Hooks custom

| Hook                       | Propósito |
|----------------------------|-----------|
| `useExchangeRates`         | Tipos de cambio (API externa). |
| `useHydration`             | Detección de hidratación inicial. |
| `useLocalStorage`          | Persistencia local genérica. |
| `useLocalStorageSync`      | Sincronización entre pestañas. |
| `useScrollPosition`        | Tracking de scroll. |
| `useTrendsData`            | Datos para vista de tendencias. |
| `useVisibleItemCounter`    | Contador de elementos visibles. |

---

## 5. Lib — Lógica de negocio (src/lib/)

Cada archivo es una unidad de lógica pura, en su mayoría con tests.

| Módulo                  | Propósito                                  | Test |
|-------------------------|--------------------------------------------|------|
| `alertGenerators`       | Generación de alertas financieras          | ✅ |
| `balanceCalc`           | Cálculo de balances                        | ✅ |
| `bankCSVParser`         | Parser de CSVs bancarios                   | ✅ |
| `bankFormats`           | Formatos por banco                         | ✅ |
| `bankImportRules`       | Reglas de importación                      | ✅ |
| `creditCardUtils`       | Utilidades de tarjetas de crédito (938 LOC)| ✅ |
| `financialInstitutions` | Catálogo de instituciones                  | ✅ |
| `forecastEngine`        | Motor de previsiones                       | ✅ |
| `loanUtils`             | Utilidades de préstamos                    | ✅ |
| `projectionAlerts`      | Alertas de proyecciones                    | ✅ |
| `projectionsForm`       | Lógica del formulario de proyecciones      | ✅ |
| `projectionsStats`      | Estadísticas de proyecciones               | ✅ |
| `recurringMotor`        | Motor de movimientos recurrentes           | ✅ |
| `reportsCalc`           | Cálculos para reports                      | ✅ |
| `reportsCsv`            | Export CSV de reports                      | ✅ |
| `timestamps`            | Utilidades de fechas                       | ✅ |
| `utils`                 | Utilidades generales                       | ✅ |
| `backupCrypto`          | Cifrado de backups                         | ❌ |
| `crypto`                | Crypto genérico (582 LOC)                  | ❌ |
| `encryptedStorage`      | Storage cifrado                            | ❌ |
| `storageCrypto`         | Crypto de storage                          | ❌ |
| `vaultKey`              | Gestión de claves del vault                | ❌ |
| `web3forms`             | Integración Web3Forms (envío email)        | ❌ |

> Lo no testeado es **crypto/IO real** — testearlo requiere mocks complejos. Decisión a tomar en `06_BACKLOG.md`.

---

## 6. Vistas principales (src/views/)

| Vista                     | LOC   | Notas |
|---------------------------|-------|-------|
| `Accounts.tsx`            | 2.032 | 🐉 MONSTRUO — pendiente refactor |
| `Goals.tsx`               | 560   | Refactor completo ✅ (de 1.948 LOC, -71%) |
| `Transfers.tsx`           | 834   | Grande pero manejable |
| `Categories.tsx`          | 829   | Grande pero manejable |
| `RealExpenses.tsx`        | 825   | Refactor parcial hecho ✅ |
| `Projections.tsx`         | 799   | Grande |
| `Dashboard.tsx`           | 797   | Grande |
| `ProjectedVsReal.tsx`     | 773   | Grande |
| `AlertsPanel.tsx`         | 771   | Grande |
| `LockScreen.tsx`          | 735   | |
| `Onboarding.tsx`          | 606   | |
| `SecuritySettingsPanel`   | 536   | |
| `AlertsBanner.tsx`        | 524   | |
| `GoalsSummary.tsx`        | 422   | |
| `Forecast.tsx`            | 405   | |
| `Legal.tsx`               | 432   | |
| `RealExpensesSummary.tsx` | 237   | OK |
| `SecuritySetup.tsx`       | 1.296 | 🐉 MONSTRUO |
| `TrendsView.tsx`          | 1.223 | 🐉 MONSTRUO |

---

## 7. Componentes (src/components/)

### Refactorizados recientemente ✅
- **`real/`**: `RealExpenseFiltersBar`, `RealExpenseFormModal`, `RealExpensesAnalysis`, `RealExpensesList`, `RealExpenseWarningModal` (todos testeados)
- **`reports/`**: `AccountsReport`, `GoalsReport`, `MovementsReport`, `ProjectionsReport`, `TrendsReport`, `ReportBadge`, `ReportKpiGrid`, `ReportSection` (sin tests aún ❌)
- **Goals (raíz `components/`)**: `GoalCard.tsx` (615 LOC, tarjeta de objetivo con CRUD + aportes) y `GoalWizard.tsx` (865 LOC, wizard de 3 pasos del modal de nuevo/editar objetivo). Cubiertos por tests de regresión existentes.

### Constantes extraídas
- `src/lib/goalsConstants.ts` — emojis y paleta de colores de objetivos (compartidos por `GoalCard` y `GoalWizard`).

### Componentes grandes sueltos en `components/` (sin agrupar)
| Componente                  | LOC   |
|-----------------------------|-------|
| `UI.tsx`                    | 1.178 | Barril de componentes UI básicos |
| `AccountFormModal.tsx`      | 1.173 | 🐉 |
| `ProjectionFormModal.tsx`   | 1.170 | 🐉 |
| `LoanDetailView.tsx`        | 740   | |
| `CreditCardDetailView.tsx`  | 785   | |
| `AmortizationFormModal.tsx` | 647   | |
| `CreditCardPaymentModal.tsx`| 584   | |
| `CreditCardSimulator.tsx`   | 536   | |
| `ProjectionListItem.tsx`    | 509   | |
| `CoachMarksTour.tsx`        | 494   | |
| `InstitutionSelector.tsx`   | 494   | |
| `SetupProgress.tsx`         | 485   | |
| `RatesWidgets.tsx`          | 477   | |
| Resto: <460 LOC             |       | |

---

## 8. Archivos top-level en src/ (sin carpeta)

⚠️ Falta consistencia organizativa. Estos archivos están sueltos en `src/`:

| Archivo                | LOC   | Sugerencia futura |
|------------------------|-------|-------------------|
| `BankImportModal.tsx`  | 2.221 | 🐉 mover a `components/` tras refactor |
| `HelpCenter.tsx`       | 2.077 | 🐉 mover a `views/` tras refactor |
| `CalendarView.tsx`     | 1.946 | 🐉 mover a `views/` tras refactor |
| `AppShell.tsx`         | 1.243 | dejar en raíz (shell) |
| `BackupPanel.tsx`      | 814   | mover a `views/` o `components/` |
| `GettingStarted.tsx`   | 831   | mover a `views/` |
| `Reports.tsx`          | 578   | refactor reciente ✅, mover a `views/` |
| `WelcomeTour.tsx`      | 528   | mover a `components/` |
| `AdminPanel.tsx`       | 472   | mover a `views/` |
| `LicenseScreens.tsx`   | 419   | mover a `views/` |
| `AppProvider.tsx`      | 521   | dejar en raíz (provider) |

**Decisión:** la reorganización física **no es urgente**. Refactor primero, mover después.

---

## 9. Convenciones observadas

- Tests viven en `__tests__/` al lado del código que testean.
- Naming en inglés (PascalCase para componentes, camelCase para utils).
- Archivos `.tsx` solo si llevan JSX; lógica pura en `.ts`.

## ✅ Checklist obligatorio post-extracción de componente

1. `npx tsc --noEmit` → 0 errores
2. `npm run test:run` → 100% verde
3. `npm run dev` → abrir navegador → DevTools Console sin errores
4. Smoke test manual de la vista afectada (render + 1-2 interacciones básicas)

⚠️ Pasos 3 y 4 son **innegociables**. Justificación e historial del caso que
motivó esta regla: ver `05_SESSION_LOG.md` sesión 24/05/2025 tarde.


---

## 10. Cosas a vigilar / deudas estructurales

1. **9 contextos** — riesgo de solapamiento. Auditar.
2. **Archivos sueltos en `src/`** — inconsistencia organizativa.
3. **Crypto sin tests** — decisión consciente o pendiente.
4. **`AppContext` legacy vs `contexts/*` modernos** — convivencia confusa.
5. **`UI.tsx` (1.178 LOC)** — barril de componentes, puede partirse por familias.
