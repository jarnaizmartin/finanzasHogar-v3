# 01 — ROADMAP

> Hoja de ruta del proyecto hacia el lanzamiento global.
> **Filosofía:** maratón, no sprint. Ritmo sostenible 10-15h/semana.
> Actualizar al cerrar cada fase. Mover items completados a `03_REFACTOR_LOG.md` o `05_SESSION_LOG.md` según corresponda.
> Última actualización: 24/05/2026 (2ª sesión)

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
| **0.5** | Cimentar (deuda técnica) | 🟢 CASI COMPLETA (solo falta B4) | 5-8 semanas |
| **1** | Refactor de monstruos | 🔄 EN CURSO (Accounts ✅, queda BankImportModal) | 4-6 semanas |
| **2** | Identidad de producto (rebrand + diseño) | ⏳ Pendiente | 3-4 semanas |
| **3** | Internacionalización (i18n) | ⏳ Pendiente | 5-6 semanas |
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

## 🔄 FASE 0.5 — Cimentar (EN CURSO)

**Objetivo:** liquidar las 4 deudas técnicas estructurales antes de tocar UI/rediseño.

### Bloques

| Bloque | Nombre | Estado |
|---|---|---|
| **B1** | Timestamps + UUIDs en entidades | ✅ HECHO |
| **B2** | Quick wins de limpieza | ✅ HECHO |
| **B3** | Red de seguridad (tests unitarios) | ✅ HECHO |
| **B4** | Extracción de strings (prep i18n) | ⏳ Pendiente (única deuda restante) |
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

### Detalle B4 — Extracción de strings ⏳ (única deuda restante)
- Crear `src/i18n/es.ts` con namespaces
- Extraer strings de `lib/` (loanUtils, creditCardUtils, projectionAlerts)
- Extraer strings de componentes principales
- Wrapper `t(key, params)` simple (sin i18next aún)
- **NO implementar i18n todavía, solo preparar terreno**
- **Próxima sesión dedicada exclusivamente a esto.**

### Detalle B5 — Refactor monstruos ✅
- **1.1 Projections.tsx** ✅ (PR #1, `909caa5`) — -66%, +106 tests, +1 bug fix
- **1.2 BankImportModal.tsx** ✅ extracción de lógica a `/lib/` (PR #2, `92a7693`) — UI sigue pendiente, va a Fase 1
- **1.3 AppProvider.tsx** ✅ (PR #3, `06945d5`)
- **1.4 Reports.tsx** ✅ (2.164 → 578 LOC) + tests añadidos 24/05 2ª sesión
- **1.5 RealExpenses.tsx** ✅ (~1.545 → 825 LOC)

### Salida esperada de Fase 0.5
- ✅ Datos preparados para sync E2E futuro
- ✅ Red de tests que permite refactorizar sin miedo
- ⏳ Strings centralizados listos para traducir (**B4 pendiente**)
- ✅ Componentes principales digeribles
- ✅ Sin deudas críticas bloqueantes

---

## 🔄 FASE 1 — Refactor de monstruos (EN CURSO)

**Objetivo:** convertir componentes "god" en arquitectura modular testeable.

### Alcance
Aplicar el patrón validado (extraer lógica a `src/lib/`, partir componentes, hook si hace falta) al resto de monstruos:

| Componente | LOC | Prioridad | Estado |
|---|---|---|---|
| ~~`Goals.tsx`~~ | ~~1.976~~ → 560 | — | ✅ HECHO (24/05/2026, -71%) |
| ~~`Accounts.tsx`~~ | ~~2.032~~ → 685 | — | ✅ HECHO (24/05/2026 2ª sesión, -60%) |
| `BankImportModal.tsx` | 2.221 → ~1.940 | 🔥 Alta | 🔄 EN CURSO (commits 1-3/8 hechos, sesión [24/05/2026]) |
| `CalendarView.tsx` | 1.946 | 🟠 Media | ⏳ Pendiente |
| `HelpCenter.tsx` | 2.077 | 🟡 Baja (info estática) | ⏳ Pendiente |
| `SecuritySetup.tsx` | 1.296 | 🟡 Sensible | ⏳ Pendiente |
| Resto (ver `06_BACKLOG.md`) | varios | 🟡 Baja | ⏳ Pendiente |

### Criterio de cierre
- Ningún componente >1.000 LOC sin justificación
- Lógica pura testeada al 80%+
- App funciona idéntica (cero regresiones)

### Patrón validado (replicable)
**constants → lib pura (con tests upfront) → cards/subcomponentes → hook de lógica → cleanup**

Confirmado en 3 refactors consecutivos: Projections, Goals, Accounts.

---

## ⏳ FASE 2 — Identidad de producto (PENDIENTE)

**Objetivo:** matar "FinanzasHogar" y nacer con marca internacional.

### Bloques
1. **Naming** — sesión estructurada con criterios:
   - Funciona en inglés (idioma principal global)
   - Una o dos palabras cortas
   - `.com` o `.app`/`.io` disponible
   - Sugiere control, anticipación o claridad financiera
   - Sin conflictos EUIPO/USPTO
2. **Identidad visual** — sistema de diseño fintech-grade:
   - Color signature único (no azul/verde genérico)
   - Tipografía con carácter
   - Tokens en `theme.ts` (centralizar, eliminar inline styles)
   - Logo definitivo
3. **Landing page** — primera versión
4. **Rediseño visual de la app** — aplicar tokens al UI

### Deuda UX a abordar en esta fase
- Modal de amortización: mensaje técnico poco claro cuando `monthlyPayment` está inconsistente (detectado 24/05 2ª sesión).

### ⚠️ Reglas
- **NO mezclar con refactor de lógica** (eso fue Fase 0.5 y 1)
- **NO empezar antes de tener tests sólidos**
- Cambios visuales en commits separados de cambios funcionales

---

## ⏳ FASE 3 — Internacionalización (PENDIENTE)

**Objetivo:** sin i18n no hay éxito mundial.

### Idiomas mínimos al lanzamiento
- 🇬🇧 **EN** (prioridad #1)
- 🇪🇸 ES
- 🇧🇷 PT-BR
- 🇫🇷 FR

### Tareas
- Implementar i18next (o equivalente) sobre la estructura creada en B4 de Fase 0.5
- Traducciones (validar con nativos — hijas en Canadá/Bélgica como recurso)
- Adaptación de formatos (fechas, divisas, separadores numéricos)
- Plurales ICU (no `s : ''` rudimentario)
- Selector de idioma en UI

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

**Cerrar Fase 0.5** → completar **B4** (extracción de strings, única deuda restante).

Después: continuar **Fase 1** con `BankImportModal.tsx` (próximo monstruo del backlog) → **Fase 2** (rebrand + diseño).

### Estimación realista de hitos próximos

| Hito | Ventana estimada |
|---|---|
| Cierre Fase 0.5 completa (B4) | Junio 2026 |
| Fase 1 (resto de monstruos) | Junio-Agosto 2026 |
| Fase 2 (rebrand + diseño) | Agosto-Septiembre 2026 |
| Fase 3 (i18n) | Septiembre-Octubre 2026 |
| Fase 4 (Mobile/PWA) | Octubre 2026 |
| **Fase 5 (Beta privada)** | **Noviembre-Diciembre 2026** |
| **Fase 6 (Lanzamiento público)** | **Enero-Marzo 2027** |

*Estimaciones a 10-15h/semana sostenido. Ajustables.*
