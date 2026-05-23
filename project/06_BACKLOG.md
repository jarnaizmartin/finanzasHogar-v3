# 06 — BACKLOG

> Lista priorizada de trabajo pendiente: refactors, tests, decisiones técnicas y mejoras estructurales.
> Mover items a `03_REFACTOR_LOG.md` cuando se completen.
> Última actualización: 23/05/2026

---

## 1. Refactors pendientes (monstruos)

### 🔥 Prioridad ALTA — Próximo objetivo

| # | Archivo                     | LOC   | Notas |
|---|-----------------------------|-------|-------|
| 1 | `src/views/Goals.tsx`       | 1.976 | **Próximo refactor recomendado (decidido 23/05/2026).** Similar a RealExpenses → reaprovecha el patrón validado (lista + filtros + modal + análisis). Riesgo medio. |
| 2 | `src/BankImportModal.tsx`   | 2.221 | **Siguiente tras Goals.** El PR #2 extrajo la lógica a `/lib/` pero NO troceó la UI. Sigue siendo el monstruo más grande del repo. Crítico por privacidad (parsea datos bancarios reales). Aplicar patrón validado con todo el aprendizaje acumulado. |

### 🟠 Prioridad MEDIA — Siguiente tanda

| # | Archivo                              | LOC   | Notas |
|---|--------------------------------------|-------|-------|
| 3 | `src/views/Accounts.tsx`             | 2.032 | Núcleo de datos. Riesgo alto, hacer con patrón ya pulido. |
| 4 | `src/HelpCenter.tsx`                 | 2.077 | Bajo riesgo (info estática). Buen "respiro" entre refactors complejos. |
| 5 | `src/views/SecuritySetup.tsx`        | 1.296 | Sensible (seguridad), requiere cuidado. |
| 6 | `src/views/TrendsView.tsx`           | 1.223 | Compleja, mucha visualización. |

### 🟡 Prioridad BAJA — A futuro

| # | Archivo                                  | LOC   | Notas |
|---|------------------------------------------|-------|-------|
| 6 | `src/CalendarView.tsx`                   | 1.946 | Naturaleza distinta al resto. |
| 8 | `src/AppShell.tsx`                       | 1.243 | Shell de la app, tocar con cuidado. |
| 9 | `src/components/UI.tsx`                  | 1.178 | Barril de UI. Partir por familias de componentes. |
| 10| `src/components/AccountFormModal.tsx`    | 1.173 | Modal grande. |
| 11| `src/components/ProjectionFormModal.tsx` | 1.170 | Modal grande. |
| 12| `src/views/Transfers.tsx`                | 834   | Manejable, no urgente. |
| 13| `src/views/Categories.tsx`               | 829   | Manejable. |
| 14| `src/GettingStarted.tsx`                 | 831   | Manejable. |
| 15| `src/views/Dashboard.tsx`                | 797   | Manejable. |
| 16| `src/views/Projections.tsx`              | 799   | Manejable. |
| 17| `src/views/ProjectedVsReal.tsx`          | 773   | Manejable. |
| 18| `src/views/AlertsPanel.tsx`              | 771   | Manejable. |

---
## 2. Tests pendientes

### 🔴 Deuda inmediata (refactor reciente sin tests)

- [ ] Tests unitarios para los 8 componentes de `src/components/reports/`:
  - `AccountsReport`, `GoalsReport`, `MovementsReport`, `ProjectionsReport`, `TrendsReport`
  - `ReportBadge`, `ReportKpiGrid`, `ReportSection`
- [ ] Test de integración para `src/Reports.tsx` (post-refactor, 578 LOC).
- [ ] Test propio para `src/components/real/RealExpensesAnalysis.tsx`.
- [ ] **Bug menor en `RealExpenseFormModal.tsx`:** warning `React does not recognize the T prop on a DOM element`. Hay un spread `{...props}` que filtra una prop `T` al DOM. 5 min de fix. Detectado 23/05/2026 al correr tests.

### 🟠 Tests pendientes a medio plazo

- [ ] Tests del refactor de `Goals.tsx` (cuando se acometa).
- [ ] Test de integración smoke para vistas grandes sin refactorizar.

---

## 3. Decisiones técnicas pendientes

### 🟠 Crypto / IO sin tests

**Módulos afectados:** `backupCrypto`, `crypto`, `encryptedStorage`, `storageCrypto`, `vaultKey`, `web3forms`.

**Decisión a tomar:**
- **Opción A:** Testear con mocks de WebCrypto/fetch → trabajo considerable.
- **Opción B:** Aceptar como "infra no testeable unitariamente" y cubrir con tests E2E.
- **Opción C:** Mix — mocks para los más críticos (`vaultKey`, `backupCrypto`), aceptar el resto.

**Estado:** sin decidir. Discutir en próxima sesión de planificación.

### 🟡 Convivencia `AppContext` legacy vs `contexts/*` modernos

**Problema:** hay 9 contextos en total. `AppContext` (raíz) convive con los contextos modernos en `src/contexts/`. Riesgo de solapamiento y confusión.

**Decisión a tomar:** ¿migrar `AppContext` a `contexts/`? ¿Disolverlo en piezas más pequeñas? ¿Mantener tal cual?

**Estado:** sin auditar.

### 🟡 Comandos de test no documentados

**Pendiente:** verificar `package.json` y documentar en `04_TEST_COVERAGE.md` los scripts exactos (`test`, `test:watch`, `test:coverage`).

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

**Problema observado:** la rama `refactor/fase-2-reports` contenía en realidad el refactor de **Real Expenses**, no Reports. Confusión innecesaria.

**Propuesta de convención:**
- `refactor/<modulo>` → `refactor/real-expenses`, `refactor/goals`, etc.
- `feat/<modulo>-<descripcion-corta>`
- `fix/<descripcion-corta>`
- `chore/<descripcion-corta>`

**Estado:** ✅ formalizado en `00_FOUNDATION.md` sección 11 (23/05/2026).

---

## 5. Proceso y herramientas

- [ ] Definir convención de mensajes de commit (Conventional Commits ya parece usarse: `refactor:`, `fix:`, `chore:`). Formalizar.
- [ ] Decidir si añadir `husky` + lint-staged para validar commits.
- [ ] Decidir si configurar GitHub Actions para correr tests en cada PR.
- [ ] Documentar comando(s) exacto(s) de build y deploy.

---

## 6. Cómo usar este backlog

- **Al iniciar trabajo en un item:** moverlo a `05_SESSION_LOG.md` ("Trabajando en…").
- **Al terminar un refactor:** moverlo a `03_REFACTOR_LOG.md` con resumen de cambios.
- **Al descubrir nueva deuda:** añadirla aquí en la sección correspondiente.
- **Prioridades:** se revisan al inicio de cada sesión grande.
