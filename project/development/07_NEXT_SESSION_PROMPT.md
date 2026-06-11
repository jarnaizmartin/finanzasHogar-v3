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

## ESTADO: arrancó el primer test de campo (A3). 4 bugs objetivos corregidos.

En la sesión 53 llegó el **primer feedback de un usuario real** (A3). Se versionó el guion (`A3_FIELD_TEST.md`) y se corrigieron los 4 bugs objetivos, todos en `origin/main` (último `1f7ade0`, 1091 tests verdes):
- **B1** (`1da6ce3`) — títulos del WelcomeTour estaban hardcodeados en español.
- **B4** (`eaaf4cd`) — contraste de tabs/iconos del header (ilegibles sobre el header navy en ambos temas).
- **B3** (`2b8116a`) — el selector de banco se camuflaba con el fondo del modal.
- **B2** (`1f7ade0`) — banner de backup rojo agresivo nada más crear la 1ª cuenta (ahora gracia de 3 días).

### 🔴 LO IMPORTANTE de A3: hallazgo estratégico SIN resolver
El feedback de fondo es uno: **el arranque es largo, fatiga y no transmite el valor** (el tester salió frío; no entendió el objetivo ni dónde se guardan los datos / el multi-dispositivo). Detalle completo y clasificación en `A3_FIELD_TEST.md` §Resultado.

**Decisión tomada (Regla 2 — n=1):** NO reestructurar el onboarding con un solo tester (riesgo de diluir la profundidad, que es el diferenciador; el tester puede no ser el usuario norte "Jesús"). **Antes de la sesión de rediseño hay que recoger 2-3 testers más**, idealmente alguno cercano al perfil norte.

### 🧪 Pendiente del founder
1. **Validar B1–B4** en producción/móvil (deploy de Vercel desde `main`; al ser UI, basta con eso).
2. **Más testers de A3** (usar `A3_FIELD_TEST.md`) → cuando haya 2-3 → **sesión de rediseño de onboarding**.

---

## Camino a la BETA (Fase 5) — lo que sigue pendiente (sin cambios)

1. **Sync A6** — validación REAL del founder en producción: #3 borrado/tombstones (prueba limpia: ambos "✅ Conectado" → borrar en disp.1 → sincronizar ambos → ¿desaparece y NO reaparece?), #2 modal de duplicados ("Revisar"→lista→eliminar), #4 banner de reconexión iOS, + LWW/contraseña distinta/desconectar+borrar nube. Plan completo en `05_SESSION_LOG.md` §Sesión 50. Si algo falla: traer consola (F12) + escenario.
2. **A5** — pase de robustez en **Safari iOS real** (código ya blindado).
3. ~~**D1** — sacar `Recuperación Pasword.txt`~~ ✅ **HECHO/verificado (s.53)**: no está en el repo, en disco ni en el historial git, y está en `.gitignore` (3 reglas). La auditoría de seguridad completa (D1 en `09_BETA_READINESS`) sigue siendo gate de producción pública, no de beta.

Con eso, el corte beta A1-A6 queda cerrado. B/C (pulido móvil, KPIs, búsqueda avanzada) se trabajan DURANTE la beta.

## Deuda registrada (no bloquea beta — `06_BACKLOG.md`)
- 🔴 Lint/type-check: `tsc -b` ~25 errores + eslint ~347 (React Compiler). El CI **no** corre `tsc`; el gate real es Vitest + `vite build`. Tanda propia de limpieza.
- Tests pendientes de algunos componentes (prioritario `useLoanAmortization`). Cripto/IO sin tests unitarios.

## Carril comercial (naming) — aparte
Reset de método (sesión 10 comercial). El pool compuesto-inglés fue rechazado. **Naming NO bloquea la beta.**

## Recordatorios operativos
- Conventional commits. Un commit = una idea. Cada commit deja la app funcionando.
- Lógica pura siempre en `src/lib/` con su test.
- gstack `/qa`: vía skill `gstack`; headless NO reproduce bugs de iOS ni OAuth.

Cuando hayas leído los .md, dime "listo".
