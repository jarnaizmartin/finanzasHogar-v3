# CLAUDE.md — finanzasHogar-v3

> Leído automáticamente por Claude Code al arrancar. Actualizar al cerrar cada sesión.
> Última actualización: 10/07/2026 (sesión 69 — **REDISEÑO DEL ONBOARDING COMPLETO**: Fases 4 y 5 implementadas y pusheadas (8 commits, producción). **Fase 4 = Modo Prueba** (flag `fh_mode`; `appMode.keyFor()` aísla las claves de datos en `fh_demo_*`; `enterDemo/exitDemo/resetDemo` recargan; `demoData.ts` dataset rico; `encryptedStorage` demo-aware; guardas de sync/backup; banner + CTA onboarding + toggle Ajustes) + **guía Núcleo/Profundidad** (paso Previsión nuevo). **Fase 5 = copy honesto** (fin del FALSO "0 bytes a la nube" + maratón + sync E2E) + **O5** (nombre local + `WelcomeSplash` auto-fade + toggle) + **O6** (logo en onboarding/set-up/lock + saludo con nombre). **1148 tests OK.** 🔴 Falta ronda de pruebas del founder en iPhone — sobre todo el Modo Prueba (reload + aislamiento), no probado en navegador)

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
| Naming definitivo | ✅ **CERRADO (s.66): `FinNort`** (t final **minúscula** — revierte la T mayúscula de s.11; coherente con el logo, que deja la T fuera). Dominios registrados `.com .eu .app .io` · TMview clases 9+36 limpias. **Handles ✅ CERRADOS (s.67):** cuenta creada y logo nuevo puesto en las 7 redes (Instagram · Reddit · YouTube · X · TikTok · Facebook · LinkedIn). **Kit de PNG (s.67)** en `export-icons-s67` (README): tile 16-2048 (máster 2048 = registro EUIPO) + full-bleed + wordmark/lockup dark-light; rasterizado con `@resvg/resvg-js`. **Búsqueda de imágenes sin similares → probable registrable.** ✅ **App = `FinNort`** en todo el texto VISIBLE (APP_NAME, manifest, title, i18n 6 idiomas, exports, TOTP issuer, email — `c2d74bd`). ⚠️ Identificadores internos (`app:` de backups/sync/licencias + `ADMIN_PASSWORD`) siguen `'FinanzasHogar'` a propósito. ✅ **Wordmark (opción B):** `BrandWordmark.tsx` pinta **F y N en teal** (`T.accent`, adapta light/dark), resto blanco; cableado en header + bienvenida. **✅ ICONO CERRADO (s.66): R3 «híbrido barras sólidas» EN ESPEJO** (idea del founder: reflejar el monograma N+F sobre el eje vertical → se lee **F→N** de izq. a der.; original y más registrable). Anatomía: tile navy + glow + rim; N teal profundo (dos planos) + palo = **haz de luz** (guiño norte) + barras sólidas brillantes; barra baja acortada. `BrandLogo.tsx` = fuente de verdad; `favicon.svg` (tile) + `android-chrome-192/512.png` (full-bleed, maskable) regenerados (`a880c57`). Fuente viva del espejo: `finnort-icon-nf-mirror-s66.html`. Descartados R4 (con luz), «Pico Norte» (s.62), casa F·N·T (s.64). ⚠️ **Los PNG viejos ya NO están** (reemplazados por R3). Método: símbolo derivado del nombre, anclado en LETRA (registrable), paleta navy+teal `userSpaceOnUse` (nunca `objectBoundingBox` con trazos rectos). Pendiente (no bloquea): registro formal 9+36 · subir iconos a handles · **validación founder en iPhone** (instalación PWA + icono real). Bloqueo de marca real, no técnico de beta |
| Resumen — detalle del mes | ✅ Botón "Ver detalle del mes" en la tarjeta del mes despliega inline `ProjectedVsReal` (proyectado vs real por categoría) — `46f829f` (s.54) |
| Fix préstamo/hipoteca | ✅ Crash TDZ al editar cuenta de préstamo (`loanValidation` usado antes de declararse en `AccountFormModal`) corregido — `6b02d4c` (s.54) |
| Tanda de bugs (s.58) | ✅ 10 commits en `main`: duplicados de traspasos recurrentes entre dispositivos (id determinista) · "+" categoría oculto (z-index) · botones/badges ilegibles en tarjeta de cuenta · pantalla en negro al guardar (warning modal → portal) + barrido de los 3 modales `fixed` restantes · fugas de español (CoachMark, "1 cuenta") · **selector propio `Sel`** (sustituye el `<select>` nativo, hoja inferior móvil / dropdown escritorio) · **traspasos inflaban ingresos/gastos** (Resumen, Transacciones, Informes). 🔴 Pendiente: validación del founder del `Sel` en sus 3 dispositivos (iOS categoría ✅) + limpiar a mano duplicados ya existentes |
| Proyecciones con confirmación (provisionales) | 🔄 **DISEÑO CERRADO (s.59), SIN implementar.** Scope canónico en `11_PROJECTION_CONFIRMATION.md`. Proyección elige modo de materialización (Manual / Auto-confirmado / **Auto-pendiente ⏳**); el provisional NO cuenta en ningún cálculo hasta confirmar (auto al importar del banco / manual); sección "Pendientes de confirmar" + alerta roja persistente + aviso de vencimiento que no caduca. No afecta a lo ya creado (opt-in). Objetivo de la s.60 |
| Onboarding (rediseño) | ✅ **COMPLETO (Fases 1-5) y pusheado (s.69).** Canónico en `12_ONBOARDING_REDESIGN.md`. Bucle núcleo Cuentas→Planificación→Movimientos→Previsión. ✅ naming · tabs (móvil 5 fijas) · espina sin Objetivo · seguridad fuera del arranque + `SecurityHintBanner` · coach import-first · 3 empty states · **Modo Prueba** (`fh_mode`+`appMode.keyFor` prefijo `fh_demo_*`, `demoData.ts`, enter/exit/reset por reload, guardas sync/backup, banner+CTA+toggle, `encryptedStorage` demo-aware) · **guía Núcleo/Profundidad** (paso Previsión) · **copy honesto** (fin del FALSO "0 bytes"+maratón+sync E2E) · **O5** (nombre local + `WelcomeSplash` auto-fade + toggle) · **O6** (logo en onboarding/set-up/lock + saludo). 🔴 **Falta validación founder en iPhone (esp. Modo Prueba: reload + aislamiento, no probado en navegador).** Deuda menor: MockupPrivacy hardcodeado ES; Profundidad sin pasos Traspasos/Tendencias/Informes/Multi-divisa; claves `onboarding.securityStep.*` sin usar. |
| Tests | 1148 pasando en main |
| Fix ADMIN (s.62) | ✅ `1f9318f` — el panel de ADMIN reventaba al abrir (`JSON.parse` de un valor cifrado `enc:v1:`: leía `fh_admin_codes` crudo en vez de por `encryptedStorage`). Arreglado con helpers `readAdminCodes/writeAdminCodes/clearAdminCodes` (vía `getEncryptedItem` si `hasVault()`). 🔴 Validación en dispositivo del founder pendiente |
| Último commit | s.69: `692e1e5` — O6 (logo en pantallas de arranque/contraseña). Fases 4-5 del onboarding = 8 commits pusheados (`fd761c7..692e1e5`): demoData `fd761c7` · appMode/aislamiento `849dcde` · banner+entradas+guardas `b9c0fd8` · saldos demo `fe11c2d` · guía Núcleo/Profundidad `d75aee3` · copy honesto `a054bb4` · O5 `50424cd` · O6 `692e1e5`. **1148 tests OK.** 🔴 Siguiente: ronda de pruebas del founder en iPhone (esp. Modo Prueba) |

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
| `project/development/12_ONBOARDING_REDESIGN.md` | Spec del rediseño del onboarding (bucle núcleo, modo Prueba, empty states, O1/O5/O6, sync E2E) — s.68 |
| `project/development/13_TEST_PLAN_ONBOARDING.md` | **Plan de pruebas** del onboarding (qué probar + cómo, local vs producción) — s.69 |
| `project/commercial/` | Naming, positioning, estrategia comercial |
