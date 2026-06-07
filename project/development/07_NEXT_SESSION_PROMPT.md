Hola. Retomamos proyecto finanzasHogar-v3.

Protocolo de arranque:

Lee primero 00_FOUNDATION.md (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de 05_SESSION_LOG.md (Sesión 45) para saber dónde lo dejamos.
Lee §Próximo hito inmediato en 01_ROADMAP.md antes de proponer nada.
**Lee 09_BETA_READINESS.md — lo revisamos juntos esta sesión.**
Confirma que has entendido el contexto antes de proponer nada.

---

## ⚠️ Lección operativa crítica (no repetir)

- **"Desplegado" SOLO es verdad tras `git push` confirmado con la salida del comando.** La sesión 44 dejó 12 commits sin pushear y se afirmó como desplegado lo que no lo estaba. Vercel (`finanzas-hogar-eta.vercel.app`) despliega desde `origin/main` — sin push, no hay deploy.
- **No afirmar acciones no comprobadas.** Si dependes de un paso, ejecútalo y enseña la prueba.
- **El founder factura por token** — no gastar en bucles de disculpas ni en verificaciones automáticas que él puede hacer en 30s. Preguntar antes de gastar tokens en screenshots/emuladores.

---

## Estado de fases

| Fase | Estado |
|---|---|
| 0.5 / 1 | ✅ COMPLETAS |
| 2 | 🔄 E3 bloqueada (naming + dominio — founder) |
| 3 | ✅ COMPLETA — i18n ×4, 964 tests |
| Pre-4 | ✅ COMPLETA |
| 4 | 🔄 Responsive ✅ · Light ✅ · PWA ✅ · **sticky móvil RESUELTO (sesión 45)** |

---

## Estado tras Sesión 45 (07/06/2026)

### ✅ Cerrado y verificado por el founder
- **U1 resuelto**: las 6 barras sticky llegan al borde derecho en móvil. Causa raíz: faltaba `maxWidth:'none'` para anular la regla global `* { max-width: 100% }` de `index.css:22`.
- Sticky en 2 filas (móvil) en: Movimientos, Proyecciones, Alertas, Tendencias, Traspasos.
- Todo pusheado a `origin/main` (último commit `b7c3c96`).

### ✅ Decisiones del founder ya tomadas (sesión 45)
- **Naming NO bloquea la beta** — placeholder OK, registro de marca/dominio en paralelo.
- **Sync asíncrono multi-dispositivo = CRÍTICO para la beta.** ⚠️ Contradice `00_FOUNDATION.md` (local-first puro v1 / sync v2) → decisión arquitectónica ABIERTA, requiere sesión de diseño antes de codificar. Opción recomendada por el asistente: **(b) vault cifrado vía la nube DEL USUARIO** (iCloud/Drive/Dropbox) — sin backend propio, encaja con privacidad, fracción del coste del sync E2E completo.
- **Auditorías de seguridad (auth/cifrado/recuperación) + licencias** obligatorias antes de **producción pública** (no bloquean beta). Incluye sacar `Recuperación Pasword.txt` del repo.

### 🔝 LO PRIMERO mañana — revisar juntos (orden del founder, sesión 45)
0. **CONFIRMAR AL FOUNDER que `/qa` quedó operativo** (lo pidió expresamente). Verificar: skills cargadas tras reiniciar Claude Code + Chromium de Playwright presente (`~/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe` ya descargado en sesión 45).
1. **gstack — cómo nos mejora el proyecto.** Acabamos de instalarlo (bun + 54 skills en `~/.claude/skills/gstack`, aislado, sin tocar `/project` ni `settings.json`). Evaluar su impacto real en:
   - **Velocidad de desarrollo** (¿hacemos más rápido y mejor?)
   - **Diseño de fama mundial** (`/design-review`, `/design-shotgun`, `ios-design-review`)
   - **Pruebas futuras / errores cero** (`/qa` testing en navegador real + tests de regresión — el agujero que dejó pasar los bugs de sticky/modales)
   - Candidatas inmediatas: `/qa` (para A2 modales) y `/cso` (para D1 seguridad).
   - **Objetivo declarado del founder:** acelerar el desarrollo, diseño de clase mundial, **cero errores**.
   - ⚠️ Las skills se cargan al **reiniciar Claude Code**.
2. **Sync asíncrono multi-dispositivo (A6)** — sesión de diseño (ver abajo).

### 📋 Esta sesión (46): revisar beta-readiness juntos
Abrir `09_BETA_READINESS.md` (ya actualizado con A6 sync + D1/D2 auditorías). Corte beta = **A1-A6**.

### 🥇 Tras la revisión: A6 — SESIÓN DE DISEÑO del sync asíncrono
Es lo que más condiciona el alcance de la beta. **Decisión de arquitectura primero** (opción a/b/c — ver tabla en `09_BETA_READINESS.md`), antes de escribir código. De ahí sale si hay que actualizar `00_FOUNDATION.md`.

### 🥈 Primera tarea de código: A2 — modales de entrada
El founder ya lo pidió: en **Nuevo Movimiento / Proyección / Traspaso** los campos de **fecha se pisan**. Deben seguir el patrón ya validado en **Nueva Cuenta** (formato fecha, límites, alineación importes derecha, overlay divisa). Ver `AccountFormModal.tsx` como referencia del patrón bueno.

---

## Recordatorios operativos
- **Tests:** 964 pasando en main · type-check limpio
- **Trabajo directo en `main`** durante Fase 4
- **Vercel:** `finanzas-hogar-eta.vercel.app` auto-despliega desde GitHub `origin/main`
- **AccountsSummary.tsx:** sticky propio de 2 filas — NO reemplazar por StickyCompactBar genérico
- **Patrón sticky ancho móvil:** `{ width:'100vw', maxWidth:'none', marginLeft:'-1rem' }` (el `maxWidth:'none'` es obligatorio)
- ⚠️ Hay un archivo sensible sin trackear en la raíz (`Recuperación Pasword.txt`) — recomendar al founder sacarlo del repo.

Cuando hayas leído los .md (incluido 09_BETA_READINESS.md), dime "listo" y lo revisamos juntos.
