# CLAUDE.md — finanzasHogar-v3

> Leído automáticamente por Claude Code al arrancar. Actualizar al cerrar cada sesión.
> Última actualización: 11/06/2026 (sesión 53)

---

## Protocolo de arranque (obligatorio)

Lee en este orden antes de proponer nada:

1. `project/development/00_FOUNDATION.md` — Las 5 reglas del juego (Reglas 1, 2 y 4 son críticas)
2. `project/development/05_SESSION_LOG.md` — Última entrada: dónde lo dejamos
3. `project/development/01_ROADMAP.md` — §Próximo hito inmediato
4. `project/development/07_NEXT_SESSION_PROMPT.md` — Contexto exacto para retomar la sesión

Cuando hayas leído los cuatro, confirma con "listo" y espera instrucciones del founder.

---

## Identidad del proyecto

App de planificación financiera personal. Norte: **"éxito mundial + mejor UX del mundo por sencillez, manejabilidad y privacidad."**

Stack: React + TypeScript + Vite + Vitest. Local-first puro. Sin backend. Sin librerías UI externas (inline styles + theme tokens propios).

---

## Las 5 reglas del juego (resumen — leer completo en 00_FOUNDATION.md)

1. **"No lo sé" es respuesta válida** — nunca inventar criterio sin datos
2. **Argumento contrario obligatorio** en cada recomendación importante
3. **El instinto de 15 años del founder gana** salvo dato duro en contra
4. **Reset honesto al cambiar de opinión** — decir explícitamente qué cambió y por qué
5. **Rol explícito por tema** — consultor / ejecutor / abogado del diablo

---

## Estado actual (actualizar cada sesión)

| Item | Estado |
|---|---|
| Fase 4 — Responsive | ✅ 12/12 vistas |
| Fase 4 — Light mode | ✅ verificado |
| Fase 4 — PWA | ✅ validada en iPhone |
| Corte beta (A1-A6) | 🔄 A1✅ · A2✅ · A4✅ · A3🔶(**1er test de campo HECHO s.53**: 4 bugs objetivos B1-B4 corregidos; falta tema estratégico de onboarding + más testers) · A5✅código(pase iOS pend.) · **A6✅código (validación navegador pend.)**. Falta: validación A6 sync, A5 iOS, +2-3 testers A3 + D1 (sacar `Recuperación Pasword.txt`) → luego beta |
| A3 — Test de campo onboarding | 🔄 Guion versionado en `A3_FIELD_TEST.md`. 1er test (n=1): **B1-B4 corregidos** (idioma tour, contraste tabs/iconos, selector banco, banner backup). 🔴 **Hallazgo estratégico SIN resolver:** arranque largo/no transmite valor → NO rediseñar con n=1, recoger 2-3 testers más antes |
| Sync multi-dispositivo (A6) | 🔄 **EN VALIDACIÓN REAL en producción (sesión 52).** OK: 1er disp. conecta+crea vault, 2º empareja, altas se propagan. Endurecido: escape "olvidé contraseña", mensajes AUTH_FAILED y contraseña-maestra, revisión de duplicados, banner de reconexión iOS. **PENDIENTE probar (founder):** #3 borrado/tombstones (prueba limpia), #2 modal duplicados, #4 banner iOS, escenarios LWW/reconexión/borrar-nube. Ver SESSION_LOG §Sesión 52 |
| Producción / Vercel | ⚠️ La sirve el proyecto **`finanzas-hogar`** (URL `finanzas-hogar-eta.vercel.app`), NO `finanzashogar-v3` (duplicado). Env vars `VITE_*` ahí + redeploy. Compartir solo la URL `-eta` |
| Idiomas | ✅ 6 idiomas: es · en · fr · pt-PT · **pt-BR (restaurado s.51)** · it. Paridad de claves verificada · detección de navegador distingue región (pt-BR vs pt-PT) |
| Naming definitivo | 🔄 reset de método (sesión 10 comercial) — pool compuesto-inglés descartado; próximo: calibrar gusto/minar historia. NO bloquea la beta |
| Tests | 1091 pasando en main |
| Último commit | `1f7ade0 fix(ui): B2 — banner de backup rojo agresivo nada más crear la 1ª cuenta` |

---

## Reglas operativas clave

- **Ver el código antes de proponer cambios** — nunca inventar firmas ni comportamientos
- **Conventional Commits:** `feat:` / `fix:` / `refactor:` / `test:` / `docs:` / `chore:`
- **Un commit = una idea pequeña y completa**
- **Lógica pura siempre en `src/lib/` con su test**
- **No mezclar refactor con features nuevas** — lo nuevo va al backlog
- **Cada commit deja la app funcionando**
- Trabajo directo en `main` mientras estemos en Fase 4 (revisión visual)

---

## Archivos de referencia

| Archivo | Contenido |
|---|---|
| `project/development/00_FOUNDATION.md` | Visión, usuario, diferenciadores, reglas del juego |
| `project/development/09_BETA_READINESS.md` | Análisis crítico/no-crítico para lanzar la beta (Fase 5) |
| `project/development/01_ROADMAP.md` | Fases, estado, próximo hito |
| `project/development/05_SESSION_LOG.md` | Historial de sesiones |
| `project/development/06_BACKLOG.md` | Ideas pendientes (no bloqueantes) |
| `project/development/07_NEXT_SESSION_PROMPT.md` | Contexto exacto para retomar |
| `project/development/08_MEJORAS.md` | UX improvements Fase 4 |
| `project/commercial/` | Naming, positioning, estrategia comercial |
