Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 62**.

Protocolo de arranque:

Lee primero `00_FOUNDATION.md` (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de `05_SESSION_LOG.md` (Sesión 61) para saber dónde lo dejamos.
Lee `§Próximo hito inmediato` en `01_ROADMAP.md`.
Confirma con "listo" antes de proponer nada.

---

## ⚠️ LO PRIMERO: reconfirmar el foco (NO asumir)

El founder ha pivotado **4 veces seguidas** a marca/icono fuera del trabajo bloqueante de beta:
- s.58 → bugs · s.59 → diseño confirmación · s.60 → icono · s.61 → icono (sigue abierto)

Al arrancar la s.62, **pregúntale explícitamente** por dónde vamos. Opciones:
- **(c) Terminar el icono** — quedó a medias y el founder no está contento (ver abajo). Rápido de retomar.
- **(a) Implementar "Proyecciones con confirmación"** — diseño CERRADO en
  `11_PROJECTION_CONFIRMATION.md`. Hay que **rehacer el paso 1** de cimientos (el commit `b9da9b1` de s.59 se revirtió a propósito).
- **(b) Onboarding O1-O4** — 🔴 **bloqueante de beta, SIN empezar** desde s.58. Dirección en
  `08_MEJORAS.md` §STAGING bucket 5.

No asumas ninguno.

---

## 🎨 ICONO DE MARCA — abierto, dirección viva pero SIN cerrar

**Concepto vigente (s.61):** una **casa hecha con las letras F·N·T renderizada como HOLOGRAMA FANTASMA** —
solo contorno teal, cuerpo transparente, **degradado que se apaga hacia abajo** sin llegar a la base;
el tejado (aguas) es la parte sólida arriba.

**Decisiones cerradas del founder (NO reabrir):**
- **Aguas separadas** (no se tocan) + **más verticales** → hueco real entre F y T.
- **N = tres peldaños sueltos, SIN montante** (escalera "volada"), apagándose.
- **Segunda barra de la F más abajo.**
- **Estrella-norte descartada.** Casa "sólida" (Destilado s.60) **descartada**. Escalera-diagonal descartada.
- **Sistema de dos niveles:** icono detallado (grande) + simplificado/maskable (para 28px y móvil).

**🔴 Veredicto del founder que hay que resolver:** *"me gusta pero parece poco profesional / letras
para niños; hay que hacerlo más ELEGANTE y 'gustable' para público profesional."* → El trabajo de la
s.62 (si elige (c)) es **subir el oficio**: proporciones tipográficas reales, óptica de grosores, quizá
menos literal / más sofisticado. Traer 2-3 propuestas maduras, no otra iteración cruda.

**Archivos (SVG duradero):**
- `project/commercial/assets/finnort-icon-ghost-house-s61.html` → **dirección viva (v3)**. `<symbol id="ic-1">` detallado, `ic-2` maskable, `ic-3` monoline.
- `project/commercial/assets/finnort-icon-arrow-s61.html` → concepto intermedio (flecha+holograma), **superado**.
- `project/commercial/assets/finnort-icon-mockups-s60.html` → el "Destilado" (descartado); **su gradiente ya está arreglado**.

**Trabajo pendiente del icono (tras cerrarlo):**
1. Congelar la versión elegida.
2. **Exportar los PNG del `manifest.json`**: 192, 512, **maskable**, apple-touch + favicon (rasterizando el SVG).
3. Reemplazar el placeholder de la PWA (`public/` + `manifest`).
4. Va de la mano de "renombrar la app a FinNort" (no bloquea beta).

**⚠️ BUG TÉCNICO CRÍTICO PARA EL EXPORT (descubierto s.61):** un gradiente SVG con `objectBoundingBox`
(el modo por defecto) **NO pinta los trazos perfectamente verticales u horizontales** (bounding box de
área cero) → desaparecen al rasterizar. **Usar SIEMPRE `gradientUnits="userSpaceOnUse"` o color sólido.**
Fue la causa de que el "Destilado" de la s.60 se viera como un chevron `^`.

**Paleta (del código):** teal firma `#22d3ee → #06b6d4` (dark) / `#0891b2` (light) sobre navy `#060610`.
Tipografía **Inter**. Cuadrado navy del icono `#12253c→#081019`, `rx≈30`.

**Cómo ver los SVG:** ábrelos en navegador, o renderiza con gstack:
`$B goto file://...` + `$B screenshot --selector ".sel" out.png` (headless rasteriza HTML/SVG local).

---

## (En segundo plano) Validación pendiente del founder

- **`Sel` (selector propio, s.58)** en sus 3 dispositivos. iOS categoría ✅.
- **Limpiar a mano** los traspasos duplicados ya existentes (s.58).
- **Sync §11 en iPhone:** reconexión silenciosa de 1 toque · auto-finish del redirect en incógnito ·
  #3 borrado/tombstones · LWW. ⚠️ Refresh tokens caducan a 7 días si el consent de Google sigue en
  "Testing". A5 Safari iOS también pendiente.

---

## ⚠️ Lección operativa crítica (no repetir)

- **"Desplegado" SOLO es verdad tras `git push` confirmado con la salida del comando.**
  Producción la sirve el proyecto Vercel **`finanzas-hogar`** (URL **`https://finanzas-hogar-eta.vercel.app`**).
- **El founder factura por token** — no gastar en bucles ni verificaciones que él hace en 30s.
- **Yo NO genero imágenes raster; la app de Claude tampoco.** Para logos/iconos → **SVG vectorial**.
- **Gradientes SVG:** `userSpaceOnUse` o sólido, nunca `objectBoundingBox` con trazos rectos (ver bug arriba).
- **Headless NO reproduce iOS/Android ni el OAuth real** (pero SÍ rasteriza SVG local, útil para iconos).
- **Gotcha PowerShell+git:** NO comillas dobles en `git commit -m`. Usar `git commit -F -` con heredoc.
  Stagear archivos explícitos (`git add -A` bloqueado por sandbox).
- **Patrón anti-"pantalla en negro":** todo modal `position:fixed` por **portal a `document.body`**.
- **Antes de editar un archivo i18n hay que `Read`-lo.** 6 idiomas: es · en · fr · pt-pt · pt-br · it.
- **Antes de escribir un Artifact:** cargar la skill `artifact-design`.

---

## ESTADO: icono de marca ABIERTO (dirección: casa-letras F·N·T en holograma; falta ELEGANCIA profesional + exportar PNGs).
## La feature "Proyecciones con confirmación" (diseñada s.59) y el onboarding O1-O4 (bloqueante de beta) siguen SIN implementar.

## Recordatorios operativos
- Conventional commits. Un commit = una idea. Cada commit deja la app funcionando.
- Lógica pura siempre en `src/lib/` con su test.
- gstack `/qa` y screenshots vía skill `gstack`; headless NO reproduce iOS/Android ni OAuth.

Cuando hayas leído los .md, dime "listo".
