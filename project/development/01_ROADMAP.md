# 01 — ROADMAP

> Hoja de ruta del proyecto hacia el lanzamiento global.
> **Filosofía:** maratón, no sprint. Ritmo sostenible 10-15h/semana.
> Actualizar al cerrar cada fase. Mover items completados a `03_REFACTOR_LOG.md` o `05_SESSION_LOG.md` según corresponda.
> Última actualización: 31/05/2026

---

## 🎯 Norte estratégico

> **"Convertir esta aplicación en un éxito mundial y en la mejor UX del mundo por su sencillez, manejabilidad y privacidad."**

**Horizonte estimado:**
- **Beta privada:** Q4 2026 (oct-dic 2026)
- **Lanzamiento global:** Q1 2027 (ene-mar 2027)

*Ventanas orientativas, no compromisos. Se ajustan al cierre de cada fase.*

**Métricas de éxito a 12 meses post-lanzamiento:** 1.000-3.000 usuarios pagando · €9K-27K MRR.

---

## 📊 Vista general de fases

| Fase | Nombre | Estado | Duración estimada |
|---|---|---|---|
| **0** | Cierre estratégico + Setup técnico | ✅ HECHO | — |
| **0.5** | Cimentar (deuda técnica) | ✅ COMPLETA | 5-8 semanas |
| **1** | Refactor de monstruos | ✅ COMPLETA (Goals ✅, Accounts ✅, BankImportModal ✅, HelpCenter ✅, SecuritySetup ✅, TrendsView ✅, CalendarView ✅) | 4-6 semanas |
| **2** | Identidad de producto (rebrand + diseño) | 🔄 EN CURSO (A✅ B✅ C✅ D✅ · E1+E2✅ · E3 bloqueada) | 3-4 semanas |
| **3** | Internacionalización (i18n) | 🔄 EN CURSO (F1 ✅ · F2 ✅ · F3 ✅ · F4 pendiente) | 5-6 semanas |
| **4** | Mobile / PWA | ⏳ Pendiente | 6 semanas |
| **5** | Beta privada (red profesional) | ⏳ Pendiente | 6 semanas |
| **6** | Lanzamiento público | ⏳ Pendiente | 8 semanas |
| **7** | Post-lanzamiento: Sync E2E v2 | ⏳ Pendiente | meses 7+ |

---

## ✅ FASE 0 — Cierre estratégico + Setup técnico (HECHO)

### Logros
- ✅ Documento fundacional acordado (visión, usuario, principios, modelo)
- ✅ Análisis técnico completo del código existente
- ✅ Decisión: Fase 0.5 antes de Fase 2 (cimentar antes de rebrand)
- ✅ Repo en GitHub: `jarnaizmartin/finanzasHogar-v3`
- ✅ Setup local: Git Portable + VS Code + Node + npm
- ✅ Sync local ↔ GitHub ↔ Vercel funcionando
- ✅ CI/CD configurado (GitHub Actions: type-check + build)

### Decisiones clave tomadas
- Local-first puro en v1, sync E2E opcional en v2
- Modelo: Mensual €9,99 / Anual €79 / Lifetime €299
- Mobile-first cuando llegue Fase 4
- Rebrand de "FinanzasHogar" antes de beta (Fase 2)

---

## ✅ FASE 0.5 — Cimentar (COMPLETA)

**Objetivo:** liquidar las 4 deudas técnicas estructurales antes de tocar UI/rediseño. **Tag `v0.5.1-i18n-prep` publicado.**

### Bloques

| Bloque | Nombre | Estado |
|---|---|---|
| **B1** | Timestamps + UUIDs en entidades | ✅ HECHO |
| **B2** | Quick wins de limpieza | ✅ HECHO |
| **B3** | Red de seguridad (tests unitarios) | ✅ HECHO |
| **B4** | Extracción de strings (prep i18n) | ✅ HECHO (31/05/2026) |
| **B5** | Refactor de componentes monstruo | ✅ HECHO (5 grandes hechos) |

### Detalle B1 — Timestamps + UUIDs ✅
- 7 entidades core con tipo `Timestamped` (`createdAt`/`updatedAt`/`deletedAt`)
- Helpers puros: `stampNew`, `stampUpdate`, `stampDelete`, `ensureStamps`
- Migración silenciosa de datos legacy
- Setters auto-sellan timestamps en mutaciones
- **Base preparada para sync E2E v2**

### Detalle B2 — Quick wins ✅
- Reports.tsx: helpers duplicados eliminados (-80 líneas)
- BankImportModal: `CURRENCIES` + `fmtDateDMY` centralizados
- 4× CreditCard*: `fmtMoney` centralizado
- package.json: auditado, versiones reales (TS 6, Vite 8 son estables 2026)
- Web3Forms access key movida a `.env` + helper centralizado
- Dependencias actualizadas dentro de semver
- Dedup `ACCOUNT_TYPE_STYLES` en Dashboard (24/05 2ª sesión)

### Detalle B3 — Tests ✅
- Setup Vitest 4 + smoke tests
- Cobertura completa de `src/lib/` puro (18 módulos testeados, incluyendo `accountsCalc` añadido 24/05 2ª sesión)
- **855 tests totales pasando** (al cierre de la 2ª sesión 24/05)
- Tag `v0.5.0-tests` publicado
- **Tests de `components/reports/` completados** (24/05 2ª sesión, +81 tests)

### Detalle B4 — Extracción de strings ✅ (31/05/2026)
- `src/i18n/es.ts` creado con namespaces `loans` y `creditCards.healthScore`
- Strings extraídos de `lib/loanUtils.ts` y `lib/creditCardUtils.ts`
- Wrapper `t(key, params?)` simple en `src/i18n/t.ts` (stub de i18next para Fase 3)
- Strings dinámicos (interpolación) pendientes para Fase 3 con i18next real

### Detalle B5 — Refactor monstruos ✅
- **1.1 Projections.tsx** ✅ (PR #1, `909caa5`) — -66%, +106 tests, +1 bug fix
- **1.2 BankImportModal.tsx** ✅ extracción de lógica a `/lib/` (PR #2, `92a7693`) — UI sigue pendiente, va a Fase 1
- **1.3 AppProvider.tsx** ✅ (PR #3, `06945d5`)
- **1.4 Reports.tsx** ✅ (2.164 → 578 LOC) + tests añadidos 24/05 2ª sesión
- **1.5 RealExpenses.tsx** ✅ (~1.545 → 825 LOC)

### Salida esperada de Fase 0.5
- ✅ Datos preparados para sync E2E futuro
- ✅ Red de tests que permite refactorizar sin miedo
- ✅ Strings de lib/ centralizados en `src/i18n/es.ts` + wrapper `t()`
- ✅ Componentes principales digeribles
- ✅ Sin deudas críticas bloqueantes

---

## ✅ FASE 1 — Refactor de monstruos (COMPLETA)

**Objetivo:** convertir componentes "god" en arquitectura modular testeable.

### Alcance
Aplicar el patrón validado (extraer lógica a `src/lib/`, partir componentes, hook si hace falta) al resto de monstruos:

| Componente | LOC | Prioridad | Estado |
|---|---|---|---|
| ~~`Goals.tsx`~~ | ~~1.976~~ → 560 | — | ✅ HECHO (24/05/2026, -71%) |
| ~~`Accounts.tsx`~~ | ~~2.032~~ → 685 | — | ✅ HECHO (24/05/2026 2ª sesión, -60%) |
| ~~`BankImportModal.tsx`~~ | ~~2.221~~ → 242 | — | ✅ HECHO (29/05/2026, -89%) |
| ~~`HelpCenter.tsx`~~ | ~~2.077~~ → 226 | — | ✅ HECHO (29/05/2026, -89%) |
| ~~`src/views/SecuritySetup.tsx`~~ | ~~1.296~~ → 146 | — | ✅ HECHO (30/05/2026, -89%) |
| ~~`src/views/TrendsView.tsx`~~ | ~~1.223~~ → 58 | — | ✅ HECHO (30/05/2026, -95%) |
| ~~`CalendarView.tsx`~~ | ~~1.946~~ → 189 | — | ✅ HECHO (31/05/2026, -90%) |
| Resto (ver `06_BACKLOG.md`) | varios | 🟡 Baja | ⏳ Pendiente (no bloqueante) |

### Criterio de cierre
- Ningún componente >1.000 LOC sin justificación
- Lógica pura testeada al 80%+
- App funciona idéntica (cero regresiones)

### Patrón validado (replicable)
**constants → lib pura (con tests upfront) → cards/subcomponentes → hook de lógica → cleanup**

Confirmado en 8 refactors consecutivos: Projections, Goals, Accounts, BankImportModal, HelpCenter, SecuritySetup, TrendsView, CalendarView.

---

## 🔄 FASE 2 — Identidad de producto (EN CURSO)

**Objetivo:** matar "FinanzasHogar" y nacer con marca internacional.

**Punto de partida técnico (auditado 31/05/2026):**
- `theme.ts`: 2 temas (LIGHT/DARK) con ~35 tokens de color cada uno. Sin tokens de tipografía, espaciado, radio ni sombras.
- **2.655 bloques `style={{}}` inline** en la app — ninguno usa tokens del tema para tipografía/espaciado.
- **4.001 valores hardcodeados** de fontSize, fontWeight, padding, margin, borderRadius.
- Tipografía fragmentada: Inter en AppShell, system-ui en el resto.
- Naming en curso (ver `project/commercial/03_NAMING.md`): 6 finalistas, Fase C pendiente.

**Decisiones de diseño cerradas (31/05/2026):**
- ✅ **Color firma:** Teal `#0891b2` (light) / `#22d3ee` (dark) — distintivo, privacy-tech, no genérico
- ✅ **Modo primario:** Dark-first (Monarch style) · light disponible · respetar `prefers-color-scheme`
- ✅ **Tipografía:** Inter completo (una sola fuente, escala bien definida)
- ✅ **Border-radius:** Generoso — cards `1rem`, modales `1.25rem`, botones `0.75rem`, inputs `0.625rem`

### Bloques técnicos

#### Bloque A — Fundación del sistema de diseño ✅ (31/05/2026 · PR #19)
*Prerequisito de todo lo demás. Sin decisiones de diseño cerradas, no se toca UI.*

- [x] **A1** — `theme.ts` expandido: tokens BASE compartidos (fontFamily, escala tipográfica textXs→text3xl, radiusSm→radiusXl, transitions) + teal accent palette.
- [x] **A2** — `src/config/app.ts` creado: `APP_NAME`, `APP_TAGLINE`, `APP_DESCRIPTION`.
- [x] **A3** — Inter configurado. Teal `#0891b2` (light) / `#22d3ee` (dark) como color firma.
- [x] **A4** — Nueva paleta teal aplicada a ambos temas (LIGHT/DARK).

#### Bloque B — Shell: Header + Navegación ✅ (31/05/2026 · PR #19)
*Mayor impacto visual por menor número de archivos. Lo primero que ve el usuario.*

- [x] **B1** — Header: logo teal gradient, `APP_NAME`, botones glass unificados.
- [x] **B2** — Nav tabs: active teal bg, inactive muted, hover CSS.
- [x] **B3** — `LockScreen.tsx`: gradiente navy→teal, shield teal, botones teal.

#### Bloque C — Primitivos UI (`UI.tsx`) ✅ (31/05/2026 · PR #19)
*Multiplicador: rediseñar aquí se propaga automáticamente a toda la app.*

- [x] **C1** — `Card`: sombra premium multicapa, `radiusCard` (1rem), highlight inset dark-mode (Monarch style).
- [x] **C2** — Botones: gradiente teal, glow shadow, hover float (translateY -1px).
- [x] **C3** — Badges: `radiusPill` token.
- [x] **C4** — Inputs/Sel/Modal: `radiusInput`, teal focus ring glow, `fontFamily` token.
- [x] **C5** — `ConfirmModal` + `StickyCompactBar`: tokens de radius + hover classes.

#### Bloque D — Headers de vistas principales ✅ (31/05/2026 · PR #20)
*Solo el "chrome" de cada vista: título, subtítulo, KPIs de resumen. NO los modales ni tablas interiores (→ Fase 4).*

- [x] Dashboard — hero card: `radiusLg`, teal border+shadow, overline accent.
- [x] Accounts — overline accent.
- [x] Goals — overline accent añadida.
- [x] Reports — overline accent.
- [x] Calendar — overline accent (`CalendarHeader`). Fix alineación KPIs credit/loan.

#### Bloque E — Landing page (PARCIAL)
*Publicación bloqueada hasta tener nombre + dominio.*

- [x] **E1** — Copy y estructura (`landing/index.html` + `landing/style.css`) ✅ PR #22
- [x] **E2** — Diseño visual: Nortia (placeholder), teal accent, glow nav ✅ PR #22
- [ ] **E3** — Publicación ❌ bloqueada hasta nombre definitivo + dominio

### Scope explícito de lo que NO está en Fase 2
- ❌ Reemplazar los 2.655 `style={{}}` uno a uno → **Fase 4** (con responsive completo)
- ❌ Modales interiores y tablas de datos → **Fase 4**
- ❌ Logo/favicon definitivo → bloqueado hasta nombre
- ❌ Diseño responsive/mobile → **Fase 4**

### Referencias estéticas faro (cerradas en sesión comercial 2)
- 🥇 **Monarch** — premium oscuro/dorado, sensación "club privado moderno"
- 🥈 **Readwise** — sobriedad inteligente, claridad sin frialdad
- 🥉 **1Password** — calidez en categoría de privacidad, cuidado visual obsesivo
- **Calibración 80/20:** nombre/posicionamiento serio/clásico + ejecución visual moderna (degradados, micro-animaciones, copy directo)

### Deuda UX a abordar en esta fase
- Modal de amortización: mensaje técnico poco claro cuando `monthlyPayment` está inconsistente (detectado 24/05 2ª sesión).

### ⚠️ Reglas
- **NO mezclar con refactor de lógica** (eso fue Fase 0.5 y 1)
- **NO empezar antes de tener tests sólidos** ✅ (934 tests pasando)
- Cambios visuales en commits separados de cambios funcionales
- **Naming puede avanzar en paralelo** — la parte técnica de Fase 2 no requiere el nombre hasta Bloque E

---

## 🔄 FASE 3 — Internacionalización (EN CURSO)

**Objetivo:** sin i18n no hay éxito mundial.

### Idiomas mínimos al lanzamiento
- 🇬🇧 **EN** (prioridad #1)
- 🇪🇸 ES
- 🇧🇷 PT-BR
- 🇫🇷 FR

### Bloques técnicos

#### Bloque F1 — Tests + Type safety
- [x] i18next 26.3.0 instalado, `i18n.ts` inicializado con ES+EN, stub `t()` reemplazado ✅ (31/05/2026)
- [x] Tests de `t()` + `i18n.ts`: 16 tests — ES, EN, interpolación, fallback, cobertura de claves ✅ (31/05/2026)
- [x] TypeScript type-safe keys: `TranslationKey` (DotPaths sobre `Es`) — typos en claves = error de compilación ✅ (31/05/2026)

#### Bloque F2 — react-i18next + Selector de idioma ✅ (31/05/2026)
- [x] `react-i18next` 17.0.8 instalado, `initReactI18next` plugin wired
- [x] `main.tsx` importa `i18n/i18n` antes del render
- [x] `useTranslation()` disponible para cualquier componente React
- [x] Selector de idioma en modal "Configuración regional" (1er campo, dropdown ES/EN)
  — persistido en `localStorage['fh-lang']` vía `setLanguage()`
  — modal renombrado de "Configuración de divisas" → "Configuración regional"

#### Bloque F3 — Idiomas adicionales: PT-BR + FR ✅ (31/05/2026)
- [x] `pt-br.ts` — traducción completa de los strings existentes (loans + creditCards.healthScore)
- [x] `fr.ts` — traducción completa de los strings existentes
- [x] Registrados en `i18n.ts`, `SUPPORTED_LANGS` ahora `['es','en','pt-BR','fr']`
- [x] 4 opciones en el selector de idioma del modal de configuración regional
- [x] Tests de cobertura automáticos para los 3 diccionarios no-ES (6 tests) + spot checks PT-BR y FR
- [ ] Validación con nativos (hijas en Canadá/Bélgica) — pendiente para cuando haya más strings extraídos

#### Bloque F4 — Extracción sistemática de strings
*El trabajo gordo — semanas. Un namespace por sesión.*

**Estado tras sesión 16 (01/06/2026):** 58 ficheros wired + 15 namespaces completos.

##### ✅ COMPLETADO — Namespaces y ficheros

| Namespace | Claves | Ficheros cubiertos |
|---|---|---|
| `common` | 21 | Toda la app (20+ ficheros) |
| `goals` | 26 | Goals.tsx, GoalCard.tsx |
| `dashboard` | 15 | Dashboard.tsx |
| `accounts` | 9 | Accounts.tsx |
| `projections` | 10 | Projections.tsx |
| `realExpenses` | 17 | RealExpenses.tsx |
| `transfers` | 17 | Transfers.tsx |
| `categories` | 14 | Categories.tsx |

##### ⏳ PENDIENTE — Plan de sesiones restantes

> Ordenado por impacto en usuario final. Cada sesión = ~2-3h de trabajo.

**✅ Sesión F4-A — `goals` extension + `projections` extension** *(01/06/2026)*
- `GoalWizard.tsx`: 51 claves en `goals.wizard`
- `ProjectionListItem.tsx`: 28 claves en `projections.list` + 9 en `projections.frequencies`
- `ProjectionAnalysisView.tsx`: 13 claves en `projections.analysis`

**✅ Sesión F4-B — `accounts` extension** *(01/06/2026)*
- 6 ficheros wired, 87 claves en `accounts.summary/card/creditCard/loan/loanDetail/amortization`

**✅ Sesión F4-C — `bankImport` namespace** *(01/06/2026)*
- 3 ficheros wired, 46 claves en `bankImport.step1/upload/preview`

**✅ Sesión F4-D — `calendar` namespace** *(01/06/2026)*
- 6 ficheros wired (incl. CalendarDayPanel no planeado), 44 claves en `calendar` + `common.coachCta`

**✅ Sesión F4-E — `trends` namespace** *(01/06/2026)*
- 10 ficheros wired (5 planificados + 5 charts), 54 claves en `trends`

**✅ Sesión F4-F — `reports` namespace** *(01/06/2026)*
- 6 ficheros wired, 91 claves en `reports`
- Bonus: `test-setup.ts` con mock global de react-i18next (resuelve tests futuros automáticamente)

**✅ Sesión F4-G — `creditCards` namespace extension** *(01/06/2026)*
- 5 ficheros wired, ~123 claves en `creditCards` (detail, simulator, metrics, comparison, history, healthScoreUI, topCategories)

**✅ Sesión F4-H — `realExpenses` extension + subcomponentes** *(01/06/2026)*
- 4 ficheros wired, ~36 claves en `realExpenses` (filters ampliar, list, analysis, warning)

**✅ Sesión F4-I — `forecast` + `alerts` namespaces** *(01/06/2026)*
- 3 ficheros wired, ~61 claves: `forecast` (21 + `forecast.pvr` 19 claves), `alerts` (10 claves + toasts)
- Plurales complejos AlertsBanner diferidos a F4-M

**✅ Sesión F4-J — `security` namespace** *(01/06/2026)*
- 14 ficheros wired, ~100 claves: `security.step1-6`, `security.settings`, `security.changeMethod`, `security.authMethods`, `security.passwordStrength`

**Sesión F4-K — `onboarding` namespace** *(~82 strings — sesión larga)*
- `GettingStarted.tsx` (72): tutorial completo paso a paso ← mayor fichero restante
- `views/Onboarding.tsx` (30)
- `WelcomeTour.tsx` (14)
- `CoachMarksTour.tsx` (18)
- `FirstWinToast.tsx` (8)
- `SetupProgress.tsx` (10)
- Namespace: nuevo `onboarding`

**Sesión F4-L — `misc` namespace** *(~45 strings)*
- `BackupReminderBanner.tsx` (11)
- `VaultMigrationModal.tsx` (7)
- `InstitutionSelector.tsx` (8)
- `SnoozeMenu.tsx` (3)
- `ExitModal.tsx` (1 — contextual, quedó pendiente)
- `HelpCenter.tsx` (4)
- `help/HelpFAQView.tsx` (1) + `help/HelpHomeView.tsx` (5)
- `views/GoalsSummary.tsx` (3) + `views/RealExpensesSummary.tsx` (3)
- Namespace: nuevo `misc`

**Sesión F4-M — `alertGenerators` (lib/)** *(caso especial)*
- `lib/alertGenerators.ts`: 8 generadores con mensajes complejos
  - Interpolación dinámica: nombres de cuenta, importes, fechas
  - Plurales: `mes${n !== 1 ? 'es' : ''}` → necesita i18next plural forms
  - Patrón diferente: lib pura → usar `i18next.t()` directamente (no hook)
- Bloqueante: requiere definir estrategia de plurales ICU primero

**Sesión F4-N — `legal` namespace** *(caso especial: texto largo formal)*
- `views/Legal.tsx`: 3 secciones legales (Aviso Legal, Privacidad, Términos y Condiciones)
  - ~20 bloques `{ heading, text }` por sección
  - Texto legal formal — requiere traducción cuidadosa (no automática)
  - Enfoque: mover texto a namespace `legal` en los 4 idiomas
  - ⚠️ EN y FR requieren revisión por nativo o profesional para texto legal

**Sesión F4-O — `help` namespace** *(la tarea de contenido más grande del proyecto)*
- `lib/helpCenterData.ts` (717 líneas): datos puros de la ayuda integrada
  - `MANUAL_SECTIONS`: 8 secciones × ~5 bloques `{ heading, text, tip? }` = ~40 bloques
  - `FAQ_CATEGORIES`: preguntas frecuentes categorizadas
  - `SHORTCUTS`: descripciones de atajos de teclado
  - Enfoque especial: el archivo usa tipos estáticos — no puede usar hooks. Opciones:
    a) Mover contenido a namespace `help` en diccionarios + usar `t()` de i18next directamente
    b) Crear archivos de datos por idioma (`helpCenterData.en.ts`, etc.) — más mantenible para texto largo
  - 🔧 Decisión de arquitectura a tomar al inicio de la sesión
  - `HelpCenter.tsx` y subvistas (`HelpHomeView`, `HelpFAQView`, etc.) se actualizan en esta misma sesión

##### 🚫 FUERA DE SCOPE (explícitamente)
- `lib/loanUtils.ts` + `lib/creditCardUtils.ts`: ya migrados en B4 (Fase 0.5)

##### Tareas transversales (pendientes para F4 final)
- **Plurales ICU:** reemplazar `s : ''` rudimentario por `i18next count` — bloquea F4-M
- **Formatos `Intl`:** fechas, divisas, separadores numéricos según locale
- **Validación con nativos:** hijas en Canadá (EN/FR) y Bélgica (FR) — pendiente desde F3

### Tareas transversales (a abordar durante F4)
- Adaptación de formatos (fechas, divisas, separadores numéricos) — `Intl` API
- Plurales ICU (no `s : ''` rudimentario) — i18next `_plural` o `count`
- Selector de idioma en UI → Bloque F2

### ⚠️ Regla de oro
F2 antes que F4: los componentes React necesitan `useTranslation()` para re-renderizarse al cambiar idioma. No extraer strings de componentes antes de tener F2.

---

## ⏳ FASE 4 — Mobile / PWA (PENDIENTE)

**Objetivo:** captar el 70% del mercado mundial que vive en móvil.

### Tareas
- Diseño responsive completo (mobile-first)
- Service Worker (sin esto no hay PWA real)
- PWA instalable (manifest, iconos, splash)
- Optimización táctil (tap targets, gestos)
- Validación cross-device (iOS Safari, Android Chrome, desktop)

---

## ⏳ FASE 5 — Beta privada (PENDIENTE)

**Objetivo:** validar producto con usuarios reales antes del lanzamiento público.

### Tareas
- Lanzamiento a la red profesional del founder (15+ contactos seleccionados)
- Sistema de feedback estructurado (formulario + canal directo)
- Iteración rápida sobre quejas reales
- Definición de pricing final (validar €9,99/€79/€299 con benchmarking)
- Métricas de uso básicas (cuidando privacidad)

### Criterio de cierre
- 30+ usuarios beta activos
- Feedback sistematizado y priorizado
- Pricing validado o ajustado

---

## ⏳ FASE 6 — Lanzamiento público (PENDIENTE)

**Objetivo:** abrir las puertas al mundo.

### Tareas
- Pricing page profesional
- Sistema de pagos (Stripe o Paddle)
- Sistema de licencias robusto
- Estrategia de marketing inicial:
  - Product Hunt
  - Twitter/X (developers, finanzas, privacy)
  - IndieHackers
  - Reddit (r/personalfinance, r/privacy)
  - Newsletters relevantes
- Soporte al usuario (email + base de conocimiento)
- Documentación pública (docs.proyecto.com)

---

## ⏳ FASE 7 — Post-lanzamiento: Sync E2E v2 (PENDIENTE — meses 7+)

**Objetivo:** sync multi-dispositivo manteniendo privacidad radical.

### Solo si v1 valida hipótesis comercial.

### Tareas
- Sync E2E opcional con CRDTs (Yjs o similar)
- Servidor de sync mínimo (relay, sin acceso a datos cifrados)
- Multi-dispositivo (laptop ↔ móvil ↔ tablet)
- Mantener compatibilidad con usuarios local-only (no forzar migración)

### ⚠️ Decisión crítica
La arquitectura de datos YA está preparada para esto (timestamps + tombstones añadidos en Fase 0.5 B1). Sin embargo, esta fase **NO se activa automáticamente** — requiere validación previa de que el mercado lo demanda y de que el modelo de negocio lo justifica.

---

## 🛡️ Filosofía de ejecución

1. **Un commit = una idea pequeña y completa**
2. **Push frecuente** (Vercel valida que nada se rompe)
3. **Si dudas, paramos y razonamos** antes de tocar código
4. **El instinto de 15 años del founder manda** sobre cualquier framework teórico
5. **Cada fase deja la app funcionando** — nunca grandes refactors a medias
6. **No saltarse fases por ansiedad** — el orden es deliberado

---

## ⚠️ Riesgos estratégicos registrados

| Riesgo | Mitigación |
|---|---|
| Cargar mucho upfront → burnout en semana 4 | Ritmo sostenible 10-15h/sem, sin acelerar |
| Perder momentum personal con meses sin features | Cada commit cierra un entregable visible |
| IA (Claude) introduciendo inconsistencias entre sesiones | Sistema `/project` + tests + commits pequeños |
| "Lanza ya con lo que tienes" (argumento contrario) | Rechazado: contradice "éxito mundial" |
| Naming nuevo puede atascarse semanas | Sesión estructurada con criterios y deadline |
| Rebrand puede generar resistencia interna | El founder ya validó la decisión |

---

## 📍 Cómo se usa este documento

- **Al inicio de cada sesión:** el asistente IA lo lee para saber dónde estamos
- **Al cerrar una fase:** se actualiza el estado y se mueven items completados a `03_REFACTOR_LOG.md`
- **Al planificar trabajo nuevo:** se verifica que encaja en alguna fase (si no, va a `06_BACKLOG.md` para abordar después)
- **Si una decisión contradice este roadmap:** discusión explícita y razonada antes de actuar

---

## 🎯 Próximo hito inmediato

**Cerrar Fase 2 completamente** → dos bloqueantes pendientes:
1. **Naming definitivo** — "Nortia" es placeholder. Sesión estructurada pendiente (criterios en `project/commercial/03_NAMING.md`). Funciona en inglés, 1-2 palabras, .com/.app disponible, sin conflictos EUIPO/USPTO.
2. **Dominio** — comprar una vez cerrado el nombre.
3. **E3 (publicación landing)** — desbloqueada al tener nombre + dominio.

Una vez Fase 2 cerrada → **Fase 3 (i18n)**.

### Estimación realista de hitos próximos

| Hito | Ventana estimada |
|---|---|
| ✅ Fase 0.5 completa | HECHO (31/05/2026) |
| ✅ Fase 1 completa | HECHO (31/05/2026) |
| Cierre Fase 2 (naming + dominio + E3) | Junio 2026 |
| Fase 3 (i18n) | Junio-Agosto 2026 |
| Fase 4 (Mobile/PWA) | Agosto-Septiembre 2026 |
| **Fase 5 (Beta privada)** | **Octubre-Noviembre 2026** |
| **Fase 6 (Lanzamiento público)** | **Enero-Marzo 2027** |

*Estimaciones a 10-15h/semana sostenido. Ajustables.*
