Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 61**.

Protocolo de arranque:

Lee primero `00_FOUNDATION.md` (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de `05_SESSION_LOG.md` (Sesión 60) para saber dónde lo dejamos.
Lee `§Próximo hito inmediato` en `01_ROADMAP.md`.
Confirma con "listo" antes de proponer nada.

---

## ⚠️ LO PRIMERO: reconfirmar el foco (NO asumir)

El founder ha pivotado **3 veces seguidas** fuera del trabajo bloqueante de beta:
- s.58 → tanda de bugs
- s.59 → diseño de "Proyecciones con confirmación"
- s.60 → diseño del icono de marca

Al arrancar la s.61, **pregúntale explícitamente** por dónde vamos. Opciones:
- **(c) Cerrar el icono** — rápido, quedó a medias (ver abajo). Recomendado hacerlo primero.
- **(a) Implementar "Proyecciones con confirmación"** — diseño CERRADO en
  `11_PROJECTION_CONFIRMATION.md`. Objetivo real de la s.60 que quedó sin tocar. Hay que **rehacer
  el paso 1** de cimientos (`RealExpense.provisional` + `provisionalCalc.ts` + tests; el commit
  `b9da9b1` de s.59 se revirtió a propósito).
- **(b) Onboarding O1-O4** — 🔴 **bloqueante de beta, SIN empezar** desde s.58. Dirección en
  `08_MEJORAS.md` §STAGING bucket 5.

No asumas ninguno; el patrón dice que es probable que vuelva a proponer algo distinto.

---

## 🎨 ICONO DE MARCA — decisiones cerradas en s.60 (queda producirlo)

**Concepto:** una **casa hecha con las letras F, N, T** (FinNor**T** ya lleva esas 3 mayúsculas).
F = pared izq + agua izq del tejado + barra baja suelta = ventana · N = palo izq acortado = puerta ·
T = pared dcha (compartida) + agua dcha · las dos aguas **no se tocan** en la cumbrera.

**Decisiones del founder (NO reabrir):**
- ✅ **Icono de app = "Destilado"**: casa depurada en **cuadrado navy redondeado** (`rx≈30`,
  `fill #12253c→#081019`), marca en **trazo teal-gradiente** (`#22d3ee→#06b6d4`, `sw≈9`, redondeado),
  con **puerta + ventana + tejado partido, SIN diagonal**. Aguanta a 24px.
- ✅ **Landing = "Monoline"** (misma casa, sin contenedor).
- ❌ **Escalera DESCARTADA** (nada de convertir la diagonal de la N en escalera).

**Fuente duradera del SVG:** `project/commercial/assets/finnort-icon-mockups-s60.html`
→ el Destilado exacto está en el `<symbol id="ic-app">`. (El Artifact original puede haber caducado:
`https://claude.ai/code/artifact/411f6f05-b121-480f-ab46-6fafe2b1e25c`.)

**Trabajo pendiente del icono (s.61 si el founder elige (c)):**
1. Afinar el SVG del Destilado (paleta exacta ya correcta).
2. **Exportar los PNG del `manifest.json`**: 192, 512, **maskable**, apple-touch-icon + favicon.
   (Ojo: yo NO genero raster; el export se hace rasterizando el SVG — herramienta local o el founder.
   Evaluar si para el **maskable** conviene la "Silueta sólida" con más margen de seguridad.)
3. Reemplazar el placeholder actual de la PWA (`public/` + `manifest`).
4. Va de la mano de "renombrar la app a FinNort" (pendiente en el estado, no bloquea beta).

**Paleta de referencia (del código):** teal firma `#22d3ee → #06b6d4` (dark) / `#0891b2` (light)
sobre navy `#060610`. Tipografía **Inter**. Hero `linear-gradient(135deg,#030b0f,#051a26,#0a2e3f)`.

---

## (En segundo plano) Validación pendiente del founder

- **`Sel` (selector propio, s.58)** en sus 3 dispositivos. iOS categoría ✅.
- **Limpiar a mano** los traspasos duplicados ya existentes (s.58).
- **Sync §11 en iPhone**: reconexión silenciosa de 1 toque · auto-finish del redirect en incógnito ·
  #3 borrado/tombstones · LWW. ⚠️ Refresh tokens caducan a 7 días si el consent de Google sigue en
  "Testing". A5 Safari iOS también pendiente.

---

## ⚠️ Lección operativa crítica (no repetir)

- **"Desplegado" SOLO es verdad tras `git push` confirmado con la salida del comando.**
  Producción la sirve el proyecto Vercel **`finanzas-hogar`** (URL **`https://finanzas-hogar-eta.vercel.app`**).
  Compartir SIEMPRE la URL `-eta`.
- **El founder factura por token** — no gastar en bucles ni verificaciones que él hace en 30s.
- **Yo NO genero imágenes raster; la app de Claude tampoco.** Para logos/iconos → **SVG vectorial**.
- **Headless NO reproduce iOS/Android ni el OAuth real.**
- **Gotcha PowerShell+git:** NO comillas dobles en `git commit -m`. Usar `git commit -F -` con heredoc.
  Stagear archivos explícitos (`git add -A` bloqueado por sandbox).
- **Patrón anti-"pantalla en negro":** todo modal `position:fixed` por **portal a `document.body`**.
- **Antes de editar un archivo i18n hay que `Read`-lo.** 6 idiomas: es · en · fr · pt-pt · pt-br · it.
  Plurales `_one`/`_other`.
- **Antes de escribir un Artifact:** cargar la skill `artifact-design`.

---

## ESTADO: icono de marca DECIDIDO (Destilado app + Monoline landing, s.60), falta producir PNGs.
## La feature "Proyecciones con confirmación" (diseñada s.59, `11_...md`) y el onboarding O1-O4 (bloqueante de beta) siguen SIN implementar.

## Recordatorios operativos
- Conventional commits. Un commit = una idea. Cada commit deja la app funcionando.
- Lógica pura siempre en `src/lib/` con su test.
- gstack `/qa` y screenshots vía skill `gstack`; headless NO reproduce iOS/Android ni OAuth.

Cuando hayas leído los .md, dime "listo".
