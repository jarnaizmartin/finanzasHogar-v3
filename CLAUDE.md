# CLAUDE.md — finanzasHogar-v3

> Leído automáticamente por Claude Code al arrancar. Actualizar al cerrar cada sesión.
> Última actualización: 23/06/2026 (sesión 59)

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
| Sync — reconexión automática (ADR §11) | ✅ **CODE-COMPLETE + desplegado.** Migrado de GIS a **OAuth Authorization Code + PKCE + redirect + refresh token** vía **función serverless stateless de solo-auth** (`api/google-token.ts`, 1er backend; cero-conocimiento + GDPR intactos). **UX del alta mejorada (s.56, Opción 2):** al volver del redirect y desbloquear 1 vez la conexión se completa sola (toast); formulario manual de red de seguridad. Founder configuró Google Console + Vercel. ⚠️ refresh tokens caducan a 7 días si el consent sigue en "Testing" |
| Sync — fixes s.56 | ✅ Reconexión silenciosa tras desconexión suave (el botón "Conectar" se quedaba muerto al conservar refresh_token — `43141bd`) · Modal de duplicados que salía fuera de pantalla en iOS (`Modal`→portal a `document.body` por el containing block del `backdrop-filter` — `2263f16`) |
| Sync — validación funcional (A6) | 🔄 **Pendiente founder en dispositivo real (iPhone):** reconexión silenciosa de 1 toque · auto-finish del redirect en incógnito con misma contraseña · #3 borrado/tombstones · LWW. **🔴 Sin diagnosticar:** origen de un aviso de "posible duplicado" (s.56) → al ver la lista, distinguir entradas idénticas (duplicación real en merge) vs parecidas (falso positivo heurística §8.3) |
| Producción / Vercel | ⚠️ La sirve el proyecto **`finanzas-hogar`** (URL `finanzas-hogar-eta.vercel.app`), NO `finanzashogar-v3` (duplicado). Env vars `VITE_*` + (s.55) `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` ahí + redeploy. Compartir solo la URL `-eta` |
| Idiomas | ✅ 6 idiomas: es · en · fr · pt-PT · **pt-BR (restaurado s.51)** · it. Paridad de claves verificada · detección de navegador distingue región (pt-BR vs pt-PT) |
| Naming definitivo | 🔄 **Finalista: `FinNort`** (s.59, método availability-first vía RDAP). Dominio LIBRE en todas las extensiones · TMview clases 9+36 limpias (homónimos solo en 32/33/25 bebidas/ropa) · homónimo exacto `FINNORT ALLIANCE S.L.` extinguido 2011/inmobiliario = sin riesgo. Pendiente: **registrar dominios** + clearance/registro de marca formal en 9+36. Detalle en `project/commercial/NAMING_FINNORT.md`. NO bloquea la beta |
| Resumen — detalle del mes | ✅ Botón "Ver detalle del mes" en la tarjeta del mes despliega inline `ProjectedVsReal` (proyectado vs real por categoría) — `46f829f` (s.54) |
| Fix préstamo/hipoteca | ✅ Crash TDZ al editar cuenta de préstamo (`loanValidation` usado antes de declararse en `AccountFormModal`) corregido — `6b02d4c` (s.54) |
| Tanda de bugs (s.58) | ✅ 10 commits en `main`: duplicados de traspasos recurrentes entre dispositivos (id determinista) · "+" categoría oculto (z-index) · botones/badges ilegibles en tarjeta de cuenta · pantalla en negro al guardar (warning modal → portal) + barrido de los 3 modales `fixed` restantes · fugas de español (CoachMark, "1 cuenta") · **selector propio `Sel`** (sustituye el `<select>` nativo, hoja inferior móvil / dropdown escritorio) · **traspasos inflaban ingresos/gastos** (Resumen, Transacciones, Informes). 🔴 Pendiente: validación del founder del `Sel` en sus 3 dispositivos (iOS categoría ✅) + limpiar a mano duplicados ya existentes |
| Proyecciones con confirmación (provisionales) | 🔄 **DISEÑO CERRADO (s.59), SIN implementar.** Scope canónico en `11_PROJECTION_CONFIRMATION.md`. Proyección elige modo de materialización (Manual / Auto-confirmado / **Auto-pendiente ⏳**); el provisional NO cuenta en ningún cálculo hasta confirmar (auto al importar del banco / manual); sección "Pendientes de confirmar" + alerta roja persistente + aviso de vencimiento que no caduca. No afecta a lo ya creado (opt-in). Objetivo de la s.60 |
| Onboarding O1-O4 | 🔴 **Bloqueante de beta, SIN empezar** (aplazado de s.58 y s.59). Dirección en `08_MEJORAS.md` §STAGING bucket 5 |
| Tests | 1137 pasando en main |
| Último commit | `e0721ea docs: cierre sesion 58` (la s.59 fue solo diseño + docs; un commit de cimientos se revirtió a propósito) |

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
| `project/development/11_PROJECTION_CONFIRMATION.md` | Spec de Proyecciones con confirmación (movimientos provisionales) — objetivo s.60 |
| `project/commercial/` | Naming, positioning, estrategia comercial |
