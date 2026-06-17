# CLAUDE.md — finanzasHogar-v3

> Leído automáticamente por Claude Code al arrancar. Actualizar al cerrar cada sesión.
> Última actualización: 17/06/2026 (sesión 55)

---

## Protocolo de arranque (obligatorio)

Lee en este orden antes de proponer nada:

1. `project/development/00_FOUNDATION.md` — Las 5 reglas del juego (Reglas 1, 2 y 4 son críticas)
2. `project/development/05_SESSION_LOG.md` — Última entrada: dónde lo dejamos
3. `project/development/01_ROADMAP.md` — §Próximo hito inmediato
4. `project/development/07_NEXT_SESSION_PROMPT.md` — Contexto exacto para retomar la sesión

Cuando hayas leído los cuatro, confirma con "listo" y espera instrucciones del founder.

---

## Identidad del proyecto

App de planificación financiera personal. Norte: **"éxito mundial + mejor UX del mundo por sencillez, manejabilidad y privacidad."**

Stack: React + TypeScript + Vite + Vitest. Local-first puro. Sin backend. Sin librerías UI externas (inline styles + theme tokens propios).

---

## Las 5 reglas del juego (resumen — leer completo en 00_FOUNDATION.md)

1. **"No lo sé" es respuesta válida** — nunca inventar criterio sin datos
2. **Argumento contrario obligatorio** en cada recomendación importante
3. **El instinto de 15 años del founder gana** salvo dato duro en contra
4. **Reset honesto al cambiar de opinión** — decir explícitamente qué cambió y por qué
5. **Rol explícito por tema** — consultor / ejecutor / abogado del diablo

---

## Estado actual (actualizar cada sesión)

| Item | Estado |
|---|---|
| Fase 4 — Responsive | ✅ 12/12 vistas |
| Fase 4 — Light mode | ✅ verificado |
| Fase 4 — PWA | ✅ validada en iPhone |
| Corte beta (A1-A6) | 🔄 A1✅ · A2✅ · A4✅ · A3🔶(**1er test de campo HECHO s.53**: 4 bugs objetivos B1-B4 corregidos; falta tema estratégico de onboarding + más testers) · A5✅código(pase iOS pend.) · **A6✅código (validación navegador pend.)**. Falta: validación A6 sync, A5 iOS, +2-3 testers A3 → luego beta. **D1 ✅** (`Recuperación Pasword.txt` verificado fuera del repo y del historial, gitignored — s.53) |
| A3 — Test de campo onboarding | 🔄 Guion en `A3_FIELD_TEST.md`. 1er test (n=1): **B1-B4 corregidos** (idioma tour, contraste tabs/iconos, selector banco, banner backup). **Invitación lista** (`public/beta-{es,en,fr}.html`, servible como URL) + **deep-link `?lang=`** para abrir la app en el idioma del enlace. 🔴 **Hallazgo estratégico SIN resolver:** arranque largo/no transmite valor → NO rediseñar con n=1, repartir invitaciones y recoger 2-3 testers más antes |
| Calendario anual | ✅ Meses futuros muestran desglose Ingresos/Gastos/Neto proyectado (antes solo el neto) — `9a97b43` |
| Sync — reconexión automática (ADR §11) | ✅ **CODE-COMPLETE + desplegado (s.55).** Migrado de GIS a **OAuth Authorization Code + PKCE + redirect + refresh token** vía **función serverless stateless de solo-auth** (`api/google-token.ts`, 1er backend; cero-conocimiento + GDPR intactos) → reconexión automática real, también en iOS. Founder configuró Google Console (redirect URIs + secret) + Vercel (env vars). **PENDIENTE founder: terminar validación e2e** (la dejó a medias; ver SESSION_LOG §s.55). ⚠️ refresh tokens caducan a 7 días si el consent sigue en "Testing" |
| Sync — validación funcional (A6) | 🔄 Tras la reconexión, falta validar: #3 borrado/tombstones, #2 modal duplicados, LWW/contraseña distinta. Plan en SESSION_LOG §Sesión 50 |
| Producción / Vercel | ⚠️ La sirve el proyecto **`finanzas-hogar`** (URL `finanzas-hogar-eta.vercel.app`), NO `finanzashogar-v3` (duplicado). Env vars `VITE_*` + (s.55) `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` ahí + redeploy. Compartir solo la URL `-eta` |
| Idiomas | ✅ 6 idiomas: es · en · fr · pt-PT · **pt-BR (restaurado s.51)** · it. Paridad de claves verificada · detección de navegador distingue región (pt-BR vs pt-PT) |
| Naming definitivo | 🔄 reset de método (sesión 10 comercial) — pool compuesto-inglés descartado; próximo: calibrar gusto/minar historia. NO bloquea la beta |
| Resumen — detalle del mes | ✅ Botón "Ver detalle del mes" en la tarjeta del mes despliega inline `ProjectedVsReal` (proyectado vs real por categoría) — `46f829f` (s.54) |
| Fix préstamo/hipoteca | ✅ Crash TDZ al editar cuenta de préstamo (`loanValidation` usado antes de declararse en `AccountFormModal`) corregido — `6b02d4c` (s.54) |
| Tests | 1133 pasando en main |
| Último commit | `ec40272 feat(sync): UX del paso final + recuperacion ante vault corrupto + diagnostico` (+ docs cierre s.55) |

---

## Reglas operativas clave

- **Ver el código antes de proponer cambios** — nunca inventar firmas ni comportamientos
- **Conventional Commits:** `feat:` / `fix:` / `refactor:` / `test:` / `docs:` / `chore:`
- **Un commit = una idea pequeña y completa**
- **Lógica pura siempre en `src/lib/` con su test**
- **No mezclar refactor con features nuevas** — lo nuevo va al backlog
- **Cada commit deja la app funcionando**
- Trabajo directo en `main` mientras estemos en Fase 4 (revisión visual)

---

## Archivos de referencia

| Archivo | Contenido |
|---|---|
| `project/development/00_FOUNDATION.md` | Visión, usuario, diferenciadores, reglas del juego |
| `project/development/09_BETA_READINESS.md` | Análisis crítico/no-crítico para lanzar la beta (Fase 5) |
| `project/development/01_ROADMAP.md` | Fases, estado, próximo hito |
| `project/development/05_SESSION_LOG.md` | Historial de sesiones |
| `project/development/06_BACKLOG.md` | Ideas pendientes (no bloqueantes) |
| `project/development/07_NEXT_SESSION_PROMPT.md` | Contexto exacto para retomar |
| `project/development/08_MEJORAS.md` | UX improvements Fase 4 |
| `project/commercial/` | Naming, positioning, estrategia comercial |
