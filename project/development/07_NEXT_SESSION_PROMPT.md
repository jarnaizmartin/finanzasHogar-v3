Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 65**.

Protocolo de arranque:

Lee primero `00_FOUNDATION.md` (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de `05_SESSION_LOG.md` (Sesión 63) para saber dónde lo dejamos.
Lee `§Próximo hito inmediato` en `01_ROADMAP.md`.
Confirma con "listo" antes de proponer nada.

---

## 🎨 ICONO DE MARCA — 🔴 ABIERTO (s.64): réplica "casa F·N·T" lograda, falta ELEGIR variante

**Dónde estamos (fin s.64):** tras descartar la dirección NORTE/monograma N (s.63) y 3 exploraciones más de inicio de
s.64, el founder trajo una **imagen de referencia** (logo de stock): una **casa = tejado a dos aguas (chevron con
aleros) coronando las letras F·N·T en bold**, monocroma. La repliqué bien esta vez en nuestra paleta:
**`finnort-icon-fnthouse-s64.html`** (fuente viva, renderizable/rasterizable con gstack). La clave que faltaba en
intentos previos: las letras van **grandes, bold y metidas bajo el alero** (son los muros de la casa), no pequeñas y sueltas.

**Variantes en ese archivo (SIN decisión del founder):**
- Sobre claro: **V1 monocromo navy** (la réplica fiel, mi recomendación) · V2 tejado teal · V3 N en teal (guiño Nor**t**/norte).
- App-icon sobre tile navy: **T1 tejado+FNT teal** (mejor a 16px, mi recomendación) · T2 letras blancas + N teal.

**Lo que falta para cerrar el icono:**
1. Que el founder **elija V + T** (o pida ajuste). No asumir; **enseñar renderizado, no describir**.
2. **Resolver el casing:** la marca es **`FinNorT`** (T MAYÚSCULA, s.62). En el archivo de descarte `finnort-lockup-s64.html`
   se coló "t" minúscula / "FinNort" — NO es la decisión. El icono va con las 3 consonantes en mayúscula.

⚠️ Los PNGs de "Pico Norte" (s.62) **siguen físicamente en `public/`** (favicon.svg + android-chrome-{192,512}) y el móvil
del founder sigue mostrándolos → **reemplazarlos** cuando se cierre el icono nuevo.

**Aprendizaje de método (vigente):** lo **literal** (pico, montaña, flecha) está saturado. La casa-de-letras F·N·T sí
funciona porque el símbolo **deriva del nombre** y está anclado en LETRA (registrable). Descartados por aquí:
`finnort-icon-fhouse-s63.html` (F se pierde), dirección NORTE `finnort-icon-north{,-refine}-s63.html` (no convenció),
y las 3 de inicio de s.64 (`finnort-{wordmark,icon-house,lockup}-s64.html`).

**Specs base heredadas (paleta, se mantiene):** navy tile `#12253c → #070e18` a sangre (rect 0,0,120,120, lo redondea
el SO). Teal holograma en `linearGradient`/`radialGradient` **`userSpaceOnUse`** (nunca `objectBoundingBox` con trazos
rectos → bug s61 vigente). Rasterizar PNGs con **gstack**: `$B viewport NxN --scale 1` + `$B screenshot --viewport out.png`
sobre HTML a sangre = PNG exacto.

**Cuando se cierre el icono nuevo:** reemplazar `public/favicon.svg` + `android-chrome-{192,512}.png` (drop-in, mismo
nombre = cero código) + extras · **búsqueda TMview 9+36** antes de nada formal · avisar del ciclo
`git push` → redeploy Vercel `finanzas-hogar` → **reinstalar la PWA** (el móvil no refresca el icono solo).

---

## ⚠️ Trabajo bloqueante de beta (sigue SIN empezar — pero ahora el icono es un bloqueo real de marca, no un capricho)

- **(a) Onboarding O1-O4** — 🔴 bloqueante de beta, SIN empezar desde s.58. Dirección en `08_MEJORAS.md` §STAGING bucket 5.
- **(b) "Proyecciones con confirmación"** — diseño CERRADO en `11_PROJECTION_CONFIRMATION.md`. Hay que **rehacer el paso 1**
  de cimientos (el commit `b9da9b1` de s.59 se revirtió a propósito).

Si el founder cierra el icono rápido, recomienda (a) después: es lo que más acerca la beta. No asumas.

---

**Nombre de marca = `FinNorT`** (T final en MAYÚSCULA; las 3 consonantes F·N·T van en mayúscula). NO escribirlo "FinNort".

**Flecos de marca:**
- ✅ **Rename a "FinNorT" HECHO** (`b947cc0` + corrección T `1b4379c`): nombre visible en todas partes (APP_NAME, manifest, title, i18n 6 idiomas, ficheros de export, TOTP). ⚠️ Identificadores internos (`app:` de backups/sync/licencias + `ADMIN_PASSWORD`) siguen `'FinanzasHogar'` A PROPÓSITO (romperían restaurar backups / vault de sync). NO reabrir.
- 🔴 **PENDIENTE — wordmark F·N·T en color:** falta que el nombre-logo pinte las **3 consonantes F·N·T en teal** (como en el icono). Hoy el header es texto plano de un color. Crear `<Wordmark/>` (F/N/T en `#22d3ee` oscuro / `#0891b2` claro) y usarlo SOLO en logo (cabecera `AppShell.tsx:421` + `WelcomeTour.tsx`), NO en títulos/ficheros/legales. Cambio pequeño, no bloquea beta.
- ⏳ **Subir los iconos a los handles sociales** (Instagram/X/…): manual del founder, con `finnort-icon-1024-social.png`.

**Bug de ADMIN — corregido, pendiente validación:**
- `fix(admin)` `1f9318f`: el panel reventaba (`JSON.parse` de valor cifrado `enc:v1:`). Arreglado leyendo `fh_admin_codes` por `encryptedStorage`. 🔴 **El founder debe confirmar en su dispositivo** (la repro real era con sus datos cifrados).

---

## (En segundo plano) Validación pendiente del founder

- **`Sel` (selector propio, s.58)** en sus 3 dispositivos. iOS categoría ✅.
- **Limpiar a mano** los traspasos duplicados ya existentes (s.58).
- **Sync §11 en iPhone:** reconexión silenciosa de 1 toque · auto-finish del redirect en incógnito · #3 borrado/tombstones · LWW.
  ⚠️ Refresh tokens caducan a 7 días si el consent de Google sigue en "Testing". A5 Safari iOS también pendiente.

---

## ⚠️ Lección operativa crítica (no repetir)

- **"Desplegado" SOLO es verdad tras `git push` confirmado con la salida del comando.**
  Producción la sirve el proyecto Vercel **`finanzas-hogar`** (URL **`https://finanzas-hogar-eta.vercel.app`**).
- **El founder factura por token** — no gastar en bucles ni verificaciones que él hace en 30s.
- **Yo NO genero imágenes raster; la app de Claude tampoco.** Para logos/iconos → **SVG vectorial** + rasterizar con gstack
  headless (`$B viewport NxN --scale 1` + `$B screenshot --viewport out.png` sobre un HTML a sangre = PNG exacto NxN).
- **Gradientes SVG:** `userSpaceOnUse` o sólido, nunca `objectBoundingBox` con trazos rectos.
- **Headless NO reproduce iOS/Android ni el OAuth real** (pero SÍ rasteriza SVG local, útil para iconos).
- **Gotcha PowerShell+git:** NO comillas dobles en `git commit -m`. Usar `git commit -F -` con heredoc.
  Stagear archivos explícitos (`git add -A` bloqueado por sandbox).
- **Patrón anti-"pantalla en negro":** todo modal `position:fixed` por **portal a `document.body`**.
- **Antes de editar un archivo i18n hay que `Read`-lo.** 6 idiomas: es · en · fr · pt-pt · pt-br · it.
- **Antes de escribir un Artifact:** cargar la skill `artifact-design`.

---

## ESTADO: icono de marca 🔴 ABIERTO (s.64: réplica "casa F·N·T" LOGRADA en `finnort-icon-fnthouse-s64.html`; falta ELEGIR variante V1/V2/V3 + T1/T2 y confirmar casing FinNorT). PNGs viejos "Pico Norte" aún en `public/`.
## 🔴 Bloqueante de beta y SIN empezar: onboarding O1-O4 · feature "Proyecciones con confirmación" (diseño s.59).

## Recordatorios operativos
- Conventional commits. Un commit = una idea. Cada commit deja la app funcionando.
- Lógica pura siempre en `src/lib/` con su test.
- gstack `/qa` y screenshots vía skill `gstack`; headless NO reproduce iOS/Android ni OAuth.

Cuando hayas leído los .md, dime "listo".
