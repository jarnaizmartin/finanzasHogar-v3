Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 63**.

Protocolo de arranque:

Lee primero `00_FOUNDATION.md` (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de `05_SESSION_LOG.md` (Sesión 62) para saber dónde lo dejamos.
Lee `§Próximo hito inmediato` en `01_ROADMAP.md`.
Confirma con "listo" antes de proponer nada.

---

## ⚠️ LO PRIMERO: reconfirmar el foco — 6º aviso, ahora en serio

El founder ha pivotado a **marca/icono 5 sesiones seguidas** (s.58 bugs → s.59 diseño → s.60/61/62 icono).
**El icono está CERRADO** (ver abajo). Ya no hay excusa de marca. Al arrancar la s.63, **pregúntale explícitamente**
por el trabajo **bloqueante de beta**, que sigue sin empezar:

- **(a) Onboarding O1-O4** — 🔴 bloqueante de beta, SIN empezar desde s.58. Dirección en `08_MEJORAS.md` §STAGING bucket 5.
- **(b) "Proyecciones con confirmación"** — diseño CERRADO en `11_PROJECTION_CONFIRMATION.md`. Hay que **rehacer el paso 1**
  de cimientos (el commit `b9da9b1` de s.59 se revirtió a propósito).

Recomienda (a): es lo que más acerca la beta. No asumas.

---

## 🎨 ICONO DE MARCA — ✅ CERRADO (s.62): "Pico Norte" #6

**Definitivo:** doble chevron ascendente (norte + crecimiento) con **degradado holograma** que brilla en la punta
y se apaga hacia los extremos, sobre cuadrado navy, a sangre completa. Se **abandonó** la casa-letras F·N·T
(el "de niños" era el concepto literal, no el acabado).

**Specs exactas (por si hay que regenerar):**
- Navy tile: `#12253c → #070e18`, a sangre (rect 0,0,120,120, sin redondeo propio — lo redondea el SO).
- Trazo: `linearGradient` **`userSpaceOnUse`** x1/y1 `60,34` → x2/y2 `60,80`, stops `#c4f9ff@1 · #2ad8f0@.95 · #1391b0@.42`.
- Geometría: exterior `M32,76 L60,36 L88,76` sw10 · interior `M50,76 L60,60 L70,76` sw8 · `stroke-linecap/linejoin round`.
- ⚠️ **Bug s61 vigente:** degradados SIEMPRE `userSpaceOnUse` (nunca `objectBoundingBox` con trazos rectos).

**Ficheros ya en el repo (drop-in, mismo nombre → cero cambios de código):**
- `public/favicon.svg` (reescrito) · `public/android-chrome-512x512.png` (any+maskable) · `public/android-chrome-192x192.png` (+apple-touch).
**Extras** en `project/commercial/assets/export-icons-s62/`: `finnort-icon-1024-social.png` (handles), `-apple-touch-180`, `-favicon-32/16`.
**Fuentes vivas** (comparativas SVG): `finnort-icon-champions-s62.html` (los 3 finalistas), `-peak-tests-s62.html` (8 tratamientos), `-elevate-s62.html` (A/B/C).

**⚠️ NO desplegado.** El icono del móvil del founder NO cambia hasta: `git push` → redeploy Vercel `finanzas-hogar` →
**borrar la PWA de la pantalla de inicio y re-añadirla** (iOS/Android cachean el icono al instalar, no lo refrescan solos).

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

## ESTADO: icono de marca ✅ CERRADO ("Pico Norte" #6, PNGs exportados a `public/`, NO desplegado).
## 🔴 Bloqueante de beta y SIN empezar: onboarding O1-O4 · feature "Proyecciones con confirmación" (diseño s.59). ESTE es el trabajo de la s.63.

## Recordatorios operativos
- Conventional commits. Un commit = una idea. Cada commit deja la app funcionando.
- Lógica pura siempre en `src/lib/` con su test.
- gstack `/qa` y screenshots vía skill `gstack`; headless NO reproduce iOS/Android ni OAuth.

Cuando hayas leído los .md, dime "listo".
