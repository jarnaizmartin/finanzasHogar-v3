# CLAUDE.md — finanzasHogar-v3

> Leído automáticamente por Claude Code al arrancar. Actualizar al cerrar cada sesión.
> Última actualización: 04/06/2026

---

## Protocolo de arranque (obligatorio)

Lee en este orden antes de proponer nada:

1. `project/development/00_FOUNDATION.md` — Las 5 reglas del juego (Reglas 1, 2 y 4 son críticas)
2. `project/development/05_SESSION_LOG.md` — Última entrada: dónde lo dejamos
3. `project/development/01_ROADMAP.md` — §Próximo hito inmediato

Cuando hayas leído los tres, confirma con "listo" y espera instrucciones del founder.

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
| Revisión visual | 🔄 en curso (founder verifica en iPhone) |
| Naming definitivo | 🔄 en curso (founder) — desbloquea E3 + landing |
| Tests | 964 pasando en main |
| Último commit | `50a4278 fix(ui): 5 correcciones revisión visual sesión 43` |

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
| `project/development/01_ROADMAP.md` | Fases, estado, próximo hito |
| `project/development/05_SESSION_LOG.md` | Historial de sesiones |
| `project/development/06_BACKLOG.md` | Ideas pendientes (no bloqueantes) |
| `project/development/07_NEXT_SESSION_PROMPT.md` | Contexto exacto para retomar |
| `project/development/08_MEJORAS.md` | UX improvements Fase 4 |
| `project/commercial/` | Naming, positioning, estrategia comercial |
