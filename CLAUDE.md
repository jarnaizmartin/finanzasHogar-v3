# CLAUDE.md — finanzasHogar-v3

> Leído automáticamente por Claude Code al arrancar. Actualizar al cerrar cada sesión.
> Última actualización: 09/06/2026 (sesión 49)

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
| Corte beta (A1-A6) | 🔄 A1✅(vite-plugin-pwa) · A2✅ · A4✅ · A3🔶(idioma✅, test campo pend.) · A5✅código(pase iOS pend.) · **A6 = siguiente (codificar)** |
| Sync multi-dispositivo (A6) | 🔄 EN CURSO — **#1 tombstones COMPLETO** (enchufado a datos) · **#2 TODA la lógica del bucle HECHA y probada en puro** (motor `syncOnce` + anti-carrera · claves opción B: NUNCA se guarda la contraseña · codec por clave · snapshot · `runSync` · `applySyncedData`). **Falta solo wiring React/UI: C2-hook `useSync` + C3 toggle Ajustes.** Ver ADR §5.1 (tombstones) y §5.2 (clave de sync) |
| Naming definitivo | 🔄 reset (founder) — NORZIQ y carril latino descartados. NO bloquea la beta |
| Tests | 1080 pasando en main |
| Último commit | `6bfafcb feat(sync): runSync — una pasada de sync a nivel de app (composición pura)` |

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
