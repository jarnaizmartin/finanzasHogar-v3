Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 68**.

Protocolo de arranque:

Lee primero `00_FOUNDATION.md` (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de `05_SESSION_LOG.md` (Sesión 67) para saber dónde lo dejamos.
Lee `§Próximo hito inmediato` en `01_ROADMAP.md`.
Confirma con "listo" antes de proponer nada.

---

## 🎯 FOCO DE ESTA SESIÓN: PRODUCTO (el founder deja la parte comercial)

Decisión explícita del founder al cerrar s.67: llevaban **varios días con lo comercial/marca** → **mañana se revisa el PRODUCTO**. La marca queda finiquitada salvo dos tareas suyas (no de código): validar el icono en iPhone + registro formal 9+36.

**Bloqueantes de beta, sin empezar (el founder pivotó a marca ~10 sesiones seguidas):**

- **(a) Onboarding O1-O4** — 🔴 bloqueante, sin empezar desde s.58. Dirección en `08_MEJORAS.md` §STAGING bucket 5:
  - O1: quitar la activación de seguridad del onboarding.
  - O2: comunicar la **utilidad real** de la app en el arranque (set-up mínimo = crear cuenta + proyecciones + subir movimientos). El hallazgo de campo fue que **el arranque no transmite valor**.
  - O3: eliminar la creación de objetivo del set-up.
  - O4: guía de funcionalidad amplia y profesional.
- **(b) "Proyecciones con confirmación"** (movimientos provisionales) — diseño CERRADO en `11_PROJECTION_CONFIRMATION.md`. Hay que **rehacer el paso 1** de cimientos (el commit `b9da9b1` de s.59 se revirtió a propósito).

Propón al founder por cuál empezar (no asumas). Ambos acercan la beta.

---

## 🎨 MARCA — ✅ CERRADA (icono + nombre + wordmark + assets + handles)

- **Icono = R3 «barras sólidas» EN ESPEJO** (se lee **F→N**). **Nombre = `FinNort`** (t final **minúscula** — ⚠️ NO "FinNorT"). **Wordmark = opción B** (F y N en teal, resto blanco, derechas).
- En código (s.66): `BrandLogo.tsx` + `BrandWordmark.tsx`; logo real en header/lock/bienvenida; `public/favicon.svg` + `android-chrome-192/512` regenerados. Commits `a880c57` + `c2d74bd`.
- **Kit de PNG para registro/redes (s.67):** `project/commercial/assets/export-icons-s67/` (README dentro) — tile 16/32/48/256/1024 + **máster 2048 (EUIPO 9+36)**, full-bleed apple-touch/android-chrome, wordmark + lockup (horizontal y apilado) dark/light. Rasterizado con `@resvg/resvg-js` (scratchpad, no en el repo). Commit `067d5e8`.
- **Handles sociales ✅:** cuentas creadas y logo nuevo puesto en TODAS (Instagram, Reddit, YouTube, X, TikTok, Facebook, LinkedIn).
- 🔴 **Solo falta (tareas del founder, no de código):** validar el icono en iPhone (PWA: push→redeploy Vercel `finanzas-hogar`→reinstalar PWA) + registro formal TMview 9+36.
- **Ideas de marca/UX aparcadas en `08_MEJORAS.md`:** O5 (portada de bienvenida personalizada), O6 (logo en pantalla de contraseña del set-up + pantalla final de onboarding con T&C), P3 (enlaces a redes en el Centro de Ayuda). Limpieza de `export-icons-s62` (Pico Norte) en `06_BACKLOG.md §4`.

---

## Bug de ADMIN — corregido, pendiente validación
- `fix(admin)` `1f9318f`: el panel reventaba (`JSON.parse` de valor cifrado `enc:v1:`). Arreglado leyendo `fh_admin_codes` por `encryptedStorage`. 🔴 **El founder debe confirmar en su dispositivo.**

## (En segundo plano) Validación pendiente del founder
- **`Sel` (selector propio, s.58)** en sus 3 dispositivos. iOS categoría ✅.
- **Limpiar a mano** los traspasos duplicados ya existentes (s.58).
- **Sync §11 en iPhone:** reconexión silenciosa de 1 toque · auto-finish del redirect en incógnito · #3 borrado/tombstones · LWW. ⚠️ Refresh tokens caducan a 7 días si el consent de Google sigue en "Testing". A5 Safari iOS también pendiente.

---

## ⚠️ Lección operativa crítica (no repetir)

- **"Desplegado" SOLO es verdad tras `git push` confirmado con la salida del comando.** Producción la sirve el proyecto Vercel **`finanzas-hogar`** (URL **`https://finanzas-hogar-eta.vercel.app`**).
- **El founder factura por token** — no gastar en bucles ni verificaciones que él hace en 30s. No verbose. No bucle "tienes razón".
- **SVG→PNG:** ya NO hace falta gstack — usar **`@resvg/resvg-js`** (WASM puro-node, instalar en scratchpad, no en `package.json`); renderiza texto con `loadSystemFonts`. gstack sigue valiendo para QA de navegador. Yo NO genero imágenes raster directamente.
- **Gradientes SVG:** `userSpaceOnUse` o sólido, nunca `objectBoundingBox` con trazos rectos.
- **Headless NO reproduce iOS/Android ni el OAuth real.**
- **Gotcha PowerShell+git:** NO comillas dobles en `git commit -m`. Usar heredoc en Bash/git-bash. Stagear archivos explícitos.
- **Patrón anti-"pantalla en negro":** todo modal `position:fixed` por **portal a `document.body`**.
- **Antes de editar un archivo i18n hay que `Read`-lo.** 6 idiomas: es · en · fr · pt-pt · pt-br · it.
- **Antes de escribir un Artifact:** cargar la skill `artifact-design`.

---

## ESTADO: ✅ MARCA CERRADA por completo (icono/nombre/wordmark/assets/handles). Falta validación founder en iPhone + registro 9+36 (tareas suyas).
## 🔴 FOCO s.68 = PRODUCTO: onboarding O1-O4 · "Proyecciones con confirmación". Ambos bloqueantes de beta, sin empezar.

## Recordatorios operativos
- Conventional commits. Un commit = una idea. Cada commit deja la app funcionando.
- Lógica pura siempre en `src/lib/` con su test.
- Trabajo directo en `main` (Fase 4).

Cuando hayas leído los .md, dime "listo".
