Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 73**.

Protocolo de arranque:

Lee `00_FOUNDATION.md` (las 5 reglas del juego). ⚠️ **§11 describe un gate ("CI verde: type-check + build") que NO EXISTE** — ver abajo.
Lee `CLAUDE.md` §Protocolo de arranque — **el norte es un FILTRO, no una cita** (memorias `norte_filter.md`, `quality_gate.md`, `verify_visually.md`).
Lee la última entrada de `05_SESSION_LOG.md` (Sesión 72).
Confirma con "listo" antes de proponer nada.

---

## 📍 DE DÓNDE VENIMOS (s.72)

El founder retomó los bugs del Modo Prueba (pasaban **también en ordenador** → no era iOS, era la app). Arreglados. Luego pidió diagnosticar el CI y, al ver que no comprueba nada, **dejarlo todo limpio de verdad**. Empezamos la limpieza de tipos por causa raíz: **251 → 107**, cazando **5 bugs reales**.

- **3 commits pusheados** (demo+coach): `9e2e44f`, `ee8fb97`, `4cb0d14`.
- **8 commits de limpieza EN LOCAL, SIN PUSHEAR** (`a858dd0..450081f`). `origin/main` = `4cb0d14`; `main` local = 8 por delante. Se dejaron sin subir a petición del founder para no redesplegar Vercel mientras probaba en su dispositivo.

---

## 🎯 FOCO DE ESTA SESIÓN

### 1. 🔴 LO PRIMERO: pushear los 8 commits de limpieza
En cuanto el founder confirme que terminó de probar: `git push origin main`. Ciclo: push → redeploy Vercel (`finanzas-hogar`) → reinstalar PWA. **Comprobar antes:** `git log --oneline origin/main..HEAD` (deben ser los 8 `a858dd0..450081f`), `npm run type-check` (baseline **107**), `npx vitest run` (**1154**).

### 2. Recoger el resultado de las pruebas del founder
Demo sin trampa (elegir "datos reales" tras la demo NO debe repetir onboarding ni dejar el banner de prueba), coach del Resumen (apunta al Patrimonio), y de paso: **los selectores de categoría en Modo Prueba ya no deben salir vacíos** (bug `6f0c85b`).

### 3. Terminar la limpieza de tipos (opcional, hasta 0) — LUEGO CI real
Los **107 restantes ya son mayormente higiene** (reset honesto de la s.72): `error={string}` (~11, funciona por truthiness), entidades nuevas sin timestamps (~10, el setter las sella → runtime OK; valorar el **arreglo arquitectónico**: tipar los setters sellados de `DataContext` como "aceptan entidad nueva" con `Omit<T,'createdAt'|'updatedAt'>`), tipos de Web Crypto (`Uint8Array`/`BufferSource`, ~7, rareza de librería), tipos de Theme (~7), y **~60 fixtures de test**. Método probado: **por causa raíz, no picando líneas**; cada arreglo un commit, tests verdes; comparar contra baseline.
**Cuando esté a 0:** convertir el CI en gate real → `.github/workflows/ci.yml`: quitar `continue-on-error: true` del Lint (o bajar lint a 0 también) **y añadir un paso `npm run type-check`**. Corregir entonces `00_FOUNDATION.md` §11 para que describa la realidad.

### 4. Arrastradas
`Sel` 3 dispositivos · sync §11 iPhone · A5 Safari iOS · **"Proyecciones con confirmación"** (`11_...md`, espera desde la s.59) · `src/config/layers.ts` (escala de capas).

---

## 🔴 RECORDATORIOS OPERATIVOS (no repetir errores)

- **Verificar tipos con `npm run type-check`, NUNCA `npx tsc --noEmit` a secas** (el tsconfig raíz devuelve 0 siempre). Baselines: **107 tipos · 402 lint · 1154 tests**.
- **El CI no comprueba tipos y se traga el lint** (`continue-on-error`). El verde de GitHub es falso para lint/tipos.
- **Presencia en el DOM ≠ que se vea.** Los fixes visuales (coach, modales) se **miran en captura** con gstack. En la s.72 el coach se verificó a 375×812.
- **"Pusheado" SOLO tras `git push` confirmado.** Producción la sirve `finanzas-hogar` (`finanzas-hogar-eta.vercel.app`).
- **El founder factura por token** — no verbose, no bucles, no verificaciones que él hace en 30s.

## ESTADO: Modo Prueba arreglado + coach + CI diagnosticado + tipos 251→107 (5 bugs reales). 3 commits en producción, 8 de limpieza en local pendientes de push.

Cuando hayas leído los .md, dime "listo".
