Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 66**.

Protocolo de arranque:

Lee primero `00_FOUNDATION.md` (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de `05_SESSION_LOG.md` (Sesión 65) para saber dónde lo dejamos.
Lee `§Próximo hito inmediato` en `01_ROADMAP.md`.
Confirma con "listo" antes de proponer nada.

---

## 🎨 ICONO DE MARCA — 🔴 ABIERTO (s.65): monograma N+F con corte óptico. Favoritos R3/R4, falta CERRAR.

**Dónde estamos (fin s.65):** el founder descartó la "casa F·N·T" (s.64) y trajo **idea propia** (Regla 3): un
**monograma N + F** donde la **N va primero y la F después, compartiendo el palo vertical derecho de la N**, y con las
**barras horizontales de la F SEPARADAS** de ese palo (hueco real → efecto óptico, el ojo completa la F). Lo construí en
3 tandas, autoverificado con gstack:
- `finnort-icon-nf-s65.html` — 1ª tanda (A–E). Malinterpreté el hueco (barras casi pegadas). **Superado.**
- `finnort-icon-nf-cut-s65.html` — 2ª tanda (P1–P4). **Hueco real corregido** + degradados pro. El founder eligió **P2** y **P3**.
- **`finnort-icon-nf-refine-s65.html`** — 3ª tanda (R1–R4). **FUENTE VIVA, la buena.** Barra baja acortada + el **HÍBRIDO**.

**Favoritos del founder: R3 y R4** (ambos híbridos = juntan lo que le gustó de P2 y P3):
- **R3 · Híbrido barras sólidas** — N teal profundo (dos planos, detrás) + palo compartido como **haz de luz** (casi blanco
  arriba, guiño norte) + barras F brillantes **sólidas** flotando. **MI RECOMENDACIÓN** (aguanta mejor a 16-24px).
- **R4 · Híbrido barras con luz** — igual pero las barras se **encienden en el borde interior** (fade, "la luz salta el
  corte"). Más sofisticado en grande, pierde fuerza antes al reducir.

**Lo que falta para CERRAR el icono:**
1. Que el founder **elija R3 vs R4** (o pida ajuste). No asumir; **enseñar renderizado, no describir**.
2. **Confirmar casing `FinNorT`** (T MAYÚSCULA).
3. **Opcional:** versión "micro" del favicon 16px — a 16px el hueco se cierra y la F flotante casi se funde con la N.
   Ofrecí barras un pelo más gruesas/pegadas SOLO para ese tamaño (logo grande + favicon simplificado = práctica estándar).

**Anatomía técnica (para retomar sin reinventar):** viewBox 200×200. N: palo izq `x41` (y54→146) + diagonal + **palo
compartido `x95`**. Barras F **flotantes**: top `M123,54 L159,54` · mid **corta** `M123,96 L144,96`. Stroke 16, cabos
redondeados, hueco palo↔barra ≈12px. Gradientes `userSpaceOnUse` (regla s61): `gDeep` (N), `gBright`/`gBarFade` (barras),
`gBeacon` (palo-haz). App-icon tile: `gTile` + glow radial `gGlow` + rim light `gEdge`.

⚠️ **Nota consciente:** el monograma es **N+F** → deja fuera la **T** de FinNor**T**. Es decisión del founder (Regla 3).
Si algún día quiere las 3 consonantes, cabe reintroducir la T.

⚠️ Los PNGs de "Pico Norte" (s.62) **siguen físicamente en `public/`** (favicon.svg + android-chrome-{192,512}) y el móvil
del founder sigue mostrándolos → **reemplazarlos** cuando se cierre el icono nuevo.

**Cuando se cierre el icono:** exportar PNGs con **gstack** (`$B viewport NxN --scale 1` + `$B screenshot --viewport out.png`
sobre HTML a sangre = PNG exacto) → reemplazar `public/favicon.svg` + `android-chrome-{192,512}.png` (drop-in, mismo nombre
= cero código) + extras 1024 social / apple-touch 180 / favicon 32-16 · **búsqueda TMview 9+36** antes de nada formal ·
avisar del ciclo `git push` → redeploy Vercel `finanzas-hogar` → **reinstalar la PWA** (el móvil no refresca el icono solo).

---

## ⚠️ Trabajo bloqueante de beta (sigue SIN empezar — el icono es un bloqueo real de marca, no un capricho)

- **(a) Onboarding O1-O4** — 🔴 bloqueante de beta, SIN empezar desde s.58. Dirección en `08_MEJORAS.md` §STAGING bucket 5.
- **(b) "Proyecciones con confirmación"** — diseño CERRADO en `11_PROJECTION_CONFIRMATION.md`. Hay que **rehacer el paso 1**
  de cimientos (el commit `b9da9b1` de s.59 se revirtió a propósito).

Si el founder cierra el icono rápido, recomienda (a) después: es lo que más acerca la beta. No asumas.

---

**Nombre de marca = `FinNorT`** (T final en MAYÚSCULA; las 3 consonantes F·N·T van en mayúscula). NO escribirlo "FinNort".

**Flecos de marca:**
- ✅ **Rename a "FinNorT" HECHO** (`b947cc0` + corrección T `1b4379c`): nombre visible en todas partes (APP_NAME, manifest, title, i18n 6 idiomas, ficheros de export, TOTP). ⚠️ Identificadores internos (`app:` de backups/sync/licencias + `ADMIN_PASSWORD`) siguen `'FinanzasHogar'` A PROPÓSITO (romperían restaurar backups / vault de sync). NO reabrir.
- 🔴 **PENDIENTE — wordmark F·N·T en color:** falta que el nombre-logo pinte las **3 consonantes F·N·T en teal**. Hoy el header es texto plano de un color. Crear `<Wordmark/>` (F/N/T en `#22d3ee` oscuro / `#0891b2` claro) y usarlo SOLO en logo (cabecera `AppShell.tsx:421` + `WelcomeTour.tsx`), NO en títulos/ficheros/legales. Cambio pequeño, no bloquea beta.
- ⏳ **Subir los iconos a los handles sociales** (Instagram/X/…): manual del founder, con el PNG 1024 social.

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
- **Gotcha PowerShell+git:** NO comillas dobles en `git commit -m`. Usar `git commit -F -` con heredoc (o el Bash/git-bash).
  Stagear archivos explícitos (`git add -A` bloqueado por sandbox).
- **Patrón anti-"pantalla en negro":** todo modal `position:fixed` por **portal a `document.body`**.
- **Antes de editar un archivo i18n hay que `Read`-lo.** 6 idiomas: es · en · fr · pt-pt · pt-br · it.
- **Antes de escribir un Artifact:** cargar la skill `artifact-design`.

---

## ESTADO: icono de marca 🔴 ABIERTO (s.65: monograma **N+F** con corte óptico; favoritos **R3/R4** en `finnort-icon-nf-refine-s65.html`; falta ELEGIR R3 vs R4 + confirmar casing FinNorT + ¿favicon micro 16px?). PNGs viejos "Pico Norte" aún en `public/`.
## 🔴 Bloqueante de beta y SIN empezar: onboarding O1-O4 · feature "Proyecciones con confirmación" (diseño s.59).

## Recordatorios operativos
- Conventional commits. Un commit = una idea. Cada commit deja la app funcionando.
- Lógica pura siempre en `src/lib/` con su test.
- gstack `/qa` y screenshots vía skill `gstack`; headless NO reproduce iOS/Android ni OAuth.

Cuando hayas leído los .md, dime "listo".
