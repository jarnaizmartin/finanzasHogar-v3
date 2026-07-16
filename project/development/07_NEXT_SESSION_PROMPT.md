Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 72**.

Protocolo de arranque:

Lee primero `00_FOUNDATION.md` (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
⚠️ **Ojo con §11 de ese documento: describe un gate ("CI verde: type-check + build") que NO EXISTE.** Ver abajo.
Lee `CLAUDE.md` §Protocolo de arranque — **el norte es un FILTRO, no una cita** (fallo registrado s.70; memoria `norte_filter.md`).
Lee la última entrada de `05_SESSION_LOG.md` (Sesión 71).
Lee `§Próximo hito inmediato` en `01_ROADMAP.md`.
Confirma con "listo" antes de proponer nada.

---

## 📍 DE DÓNDE VENIMOS (s.71)

El founder probó el arranque nuevo en el **ordenador** y trajo 4 hallazgos con capturas. Los 3 primeros eran **el mismo bug encadenado** (el modal de duplicados del Modo Prueba tapaba y ennegrecía el coach). Todo corregido: **11 commits pusheados `925b86c..dff6bdb`** → producción `finanzas-hogar` (`https://finanzas-hogar-eta.vercel.app`).

Además se rehízo **Ajustes** entero (5 bloques + nombre editable) y se descubrió que **el gate de calidad no existía**.

---

## 🎯 FOCO DE ESTA SESIÓN

### 1. 🔴 Recoger las pruebas del founder en iPhone
Las iba a hacer por su cuenta al cerrar la s.71. **Preguntar primero qué salió.** Lista de lo que había que mirar:
- Arranque conversacional (banderas reales, ningún título cortado, 6 idiomas).
- **Rebote del Modo Prueba** (`5debb88` de s.70): no debe volver a la pantalla de idioma. Si aún rebota = estado residual → reset/reinstalar limpio + error de consola `[appMode]`.
- Modo Prueba: **ya no debe salir el modal de "posible duplicado"** ni movimientos "🔄 generado automáticamente" en el ejemplo. Debe entrar en **+3.200 / 1.176 / neto +2.024** (nómina al día 1, decisión del founder).
- Coachmark (no se corta, no apunta a la nada), franja blanca inferior del tour, iPhone SE ("Planning" en el bottom-nav).
- **Ajustes nuevo**: 5 bloques (Tú · Idioma y formatos · Dinero · Tus datos · La app), nombre editable/borrable, tasas plegadas.
- **Enlaces legales del onboarding**: ahora abren de verdad.
- **Borrado selectivo con "Descargar copia antes de borrar"**: debe pedir contraseña, descargar y solo entonces borrar. ⚠️ Se ejerció en navegador **antes** de un último cambio de tipos (equivalente, tests/lint/tipos en baseline, pero sin re-ejercer).

### 2. 🔴 Diagnosticar el CI — ANTES que los 251 errores
`npm run lint` da **402 errores** y el workflow de GitHub Actions **lo ejecuta** (`lint` + `test` + `build`). Entonces: ¿el CI lleva rojo mucho tiempo? ¿nunca falla? ¿nadie lo mira? Hay que verlo antes de añadir más gates. Es barato y explica mucho.

### 3. Decidir qué hacer con los 251 errores de tipos
Contexto medido en la s.71 (ver §HALLAZGO CRÍTICO abajo). Los 251 restantes son **tipados laxos reales** (`Account.currency` opcional donde se exige obligatorio, `unknown`→`string`), no ruido — y ya han escondido 2 crashes. Opciones: congelar el número y bajarlo al tocar cada archivo · sesión dedicada · dejarlo. **Decisión del founder.**
**Argumento contrario que sigue vigente:** nada de esto ha dado la cara en sus pruebas de campo y compite con "Proyecciones con confirmación", que espera desde la s.59.

### 4. `src/config/layers.ts` — escala de capas nombrada
La deuda que **mordió 3 veces en un solo día** (s.71) y ya venía de s.56 y s.58. Cada overlay inventa su número: duplicados 100 · legal 200→10050 · borrado 100 · tour 9000 · onboarding 9999 · coachmark 99996 · el 110 que puse a ojo. Es refactor: no mezclar con fixes.

---

## 🔴 HALLAZGO CRÍTICO DE LA s.71 — leer antes de decir "está verde"

- **`npx tsc --noEmit` (a secas) NO COMPRUEBA NADA.** El `tsconfig.json` raíz es de referencias con `files: []` → devuelve 0 siempre. Usar **`npm run type-check`** (= `tsc --noEmit -p tsconfig.app.json`), añadido en `d57ea9a`.
- **El CI no corre type-check** y `vite build` no comprueba tipos (esbuild los borra). El gate de `00_FOUNDATION.md` §11 es **ficción**: corregir ese documento o el CI, pero no dejarlo mintiendo.
- **Baseline actual: 251 errores de tipos · 402 errores de lint · 1150 tests.** Comparar SIEMPRE contra baseline con `git stash` antes de afirmar "no he añadido errores".
- Ya cazó 2 crashes reales: `0a1742f` (ADMIN, `t` fuera de scope) y `dff6bdb` (borrado, `downloadBackup` huérfano desde s.1).

---

## ⚠️ Lecciones operativas (no repetir)
- **Comprobar presencia en el DOM ≠ comprobar que se ve.** En la s.71 di por bueno un modal que estaba DETRÁS de otro porque `document.body.textContent` lo encontraba. Falso positivo, el mismo engaño que el bug legal arreglado ese mismo día. **Abrir la captura y mirarla.**
- **El norte es un FILTRO, no una cita.** Señalar incoherencias sin que las pidan. Nunca excusarse con "no tengo memoria" (la bitácora existe para eso). Ver `norte_filter.md`.
- **"Desplegado/pusheado" SOLO tras `git push` confirmado con la salida del comando.** Producción la sirve **`finanzas-hogar`**. Ciclo: push → redeploy → **reinstalar PWA**.
- **El founder factura por token** — no gastar en bucles ni en verificaciones que él hace en 30s. No verbose. No bucle "tienes razón".
- **gstack va a trompicones en este proyecto**: el daemon se reinicia y pierde `localStorage`. Preparar estado + acción + captura en UNA sola `chain`. No insistir más de 2-3 intentos: el founder lo ve en 30s.
- **Antes de editar i18n hay que `Read`-lo.** 6 idiomas: es · en · fr · pt-pt · pt-br · it. Plurales con `_one`/`_other`.
- **Patrón anti-"pantalla en negro":** todo modal `position:fixed` por **portal a `document.body`** — y con z-index POR ENCIMA de quien lo abre (comprobar el z-index real del padre, no suponerlo).
- **Gotcha PowerShell+git:** NO comillas dobles en `git commit -m`. Usar heredoc en git-bash. Stagear archivos explícitos.

## ESTADO: 4 bugs del founder corregidos + Ajustes rehecho + type-check activado (611→251) + 2 crashes reales arreglados. Todo en producción. Falta la validación en iPhone y decidir el plan de errores.

Cuando hayas leído los .md, dime "listo".
