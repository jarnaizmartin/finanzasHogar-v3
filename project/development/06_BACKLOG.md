# 06 — BACKLOG

> Lista priorizada de trabajo pendiente: refactors, tests, decisiones técnicas y mejoras estructurales.
> Mover items a `03_REFACTOR_LOG.md` cuando se completen.
> Última actualización: 01/06/2026

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
