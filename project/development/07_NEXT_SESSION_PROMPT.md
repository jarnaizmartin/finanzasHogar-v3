Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 54**.

Protocolo de arranque:

Lee primero `00_FOUNDATION.md` (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de `05_SESSION_LOG.md` (Sesión 53) para saber dónde lo dejamos.
Lee `§Próximo hito inmediato` en `01_ROADMAP.md`.
Confirma con "listo" antes de proponer nada.

---

## ⚠️ Lección operativa crítica (no repetir)

- **"Desplegado" SOLO es verdad tras `git push` confirmado con la salida del comando.** Producción la sirve el proyecto Vercel **`finanzas-hogar`** (URL **`https://finanzas-hogar-eta.vercel.app`**), que despliega desde `origin/main`. Hay un duplicado vivo (`finanzashogar-v3`) — compartir SIEMPRE la URL `-eta`.
- **El founder factura por token** — no gastar en bucles ni verificaciones que él hace en 30s.
- **Headless NO reproduce iOS ni el OAuth real** — esos los valida el founder en dispositivo real.

---

## ESTADO: corte beta casi cerrado. Falta validación manual + el tema estratégico del onboarding.

La sesión 53 (larga) cerró el 1er test de campo (A3) y todo el pulido derivado. Todo en `origin/main` (último `aa67ee5`, **1097 tests** verdes):
- **B1-B4** — bugs objetivos del 1er test: idioma del tour (`1da6ce3`), contraste tabs/iconos (`eaaf4cd`), selector de banco camuflado (`2b8116a`), banner de backup agresivo en el 1er alta (`1f7ade0`).
- **Calendario anual** (`9a97b43`) — meses futuros ahora muestran Ingresos/Gastos/Neto proyectado (antes solo el neto).
- **Invitación al test A3** (`public/beta-{es,en,fr}.html`) — HTML profesional, 3 idiomas, servible como URL: `/beta-es.html` · `/beta-en.html` · `/beta-fr.html`.
- **Deep-link `?lang=`** (`aa67ee5`) — la app abre en el idioma del enlace (antes detectaba el navegador y abría en español).
- **D1 verificado** — `Recuperación Pasword.txt` ya estaba fuera del repo/historial; nada que sacar.

### 🔴 LO IMPORTANTE: hallazgo estratégico de A3 SIN resolver
El feedback de fondo del 1er tester: **arranque largo, fatiga, no transmite el valor** (salió frío; no entendió el objetivo ni dónde se guardan los datos / multi-dispositivo). Detalle en `A3_FIELD_TEST.md` §Resultado.

**Decisión vigente (Regla 2 — n=1):** NO reestructurar el onboarding con un solo tester (riesgo de diluir la profundidad; puede no ser el usuario norte "Jesús"). **Antes de la sesión de rediseño hay que repartir las invitaciones y recoger 2-3 testers más**, idealmente alguno cercano al perfil norte.

### 🧪 Pendiente del founder
1. **Repartir las invitaciones** (`/beta-*.html`) a testers de confianza y recoger feedback → cuando haya 2-3 → **sesión de rediseño de onboarding**.
2. **Validar en producción** B1-B4 + calendario anual + deep-link de idioma (deploy de Vercel desde `main`).

---

## Camino a la BETA (Fase 5) — lo que sigue pendiente

1. **Sync A6** — validación REAL del founder en producción: #3 borrado/tombstones (prueba limpia: ambos "✅ Conectado" → borrar en disp.1 → sincronizar ambos → ¿desaparece y NO reaparece?), #2 modal de duplicados, #4 banner de reconexión iOS, + LWW/contraseña distinta/desconectar+borrar nube. Plan completo en `05_SESSION_LOG.md` §Sesión 50. Si algo falla: consola (F12) + escenario.
2. **A5** — pase de robustez en **Safari iOS real** (código ya blindado).

Con eso, el corte beta A1-A6 queda cerrado. B/C (pulido móvil, KPIs, búsqueda avanzada, 2.655 inline styles) se trabajan DURANTE la beta.

## Deuda registrada (no bloquea beta — `06_BACKLOG.md`)
- 🔴 Lint/type-check: `tsc -b` ~25 errores + eslint ~347 (React Compiler). El CI **no** corre `tsc`; el gate real es Vitest + `vite build`.
- Tests pendientes de algunos componentes (prioritario `useLoanAmortization`). Cripto/IO sin tests unitarios.

## Carril comercial (naming) — aparte
Reset de método (sesión 10 comercial). El nombre actual `FinanzasHogar` es placeholder (también en las invitaciones). **Naming NO bloquea la beta.**

## Recordatorios operativos
- Conventional commits. Un commit = una idea. Cada commit deja la app funcionando.
- Lógica pura siempre en `src/lib/` con su test.
- gstack `/qa` y screenshots: vía skill `gstack` (binario `~/.claude/skills/gstack/browse/dist/browse`); headless NO reproduce iOS ni OAuth. Escribir capturas a carpeta del repo (`tmp_*`, ignorada) — el Read no resuelve `/tmp` de git-bash.

Cuando hayas leído los .md, dime "listo".
