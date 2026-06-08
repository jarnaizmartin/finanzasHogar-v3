Hola. Retomamos proyecto finanzasHogar-v3.

Protocolo de arranque:

Lee primero 00_FOUNDATION.md (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de 05_SESSION_LOG.md (Sesión 46) para saber dónde lo dejamos.
Lee §Próximo hito inmediato en 01_ROADMAP.md antes de proponer nada.
Lee 09_BETA_READINESS.md (corte beta A1-A6) y 10_SYNC_ARCHITECTURE.md (decisión de sync).
Confirma que has entendido el contexto antes de proponer nada.

---

## ⚠️ Lección operativa crítica (no repetir)

- **"Desplegado" SOLO es verdad tras `git push` confirmado con la salida del comando.** Vercel (`finanzas-hogar-eta.vercel.app`) despliega desde `origin/main`.
- **Caché del Service Worker:** un fix desplegado puede no verse sin recarga forzada / limpiar SW. Esto es justo lo que arregla A1 (próxima tarea). Si el founder dice "no veo el cambio", verificar primero con `curl` del bundle de producción si Vercel ya lo tiene (probablemente sí) → entonces es caché del cliente.
- **El founder factura por token** — no gastar en bucles ni verificaciones que él hace en 30s. Preguntar antes de gastar en screenshots/emuladores.

---

## Estado de fases

| Fase | Estado |
|---|---|
| 0.5 / 1 | ✅ COMPLETAS |
| 2 | 🔄 E3 bloqueada (naming — NO bloquea beta) |
| 3 | ✅ COMPLETA — i18n ×4 |
| Pre-4 | ✅ COMPLETA |
| 4 | 🔄 Responsive ✅ · Light ✅ · PWA ✅ · trabajando el corte beta (A1-A6) |

---

## Estado tras Sesión 46 (08/06/2026)

- **965 tests** pasando en `main` · type-check limpio · 8 commits pusheados.
- **Corte beta (A1-A6):** A6 ✅ (diseño) · A2 ✅ · A4 ✅ · **A1 decidido (sin implementar)** · A3 ❌ · A5 ❌.

### ✅ Cerrado esta sesión
- **`/qa` operativo** (gstack): junction headless-shell 1208→1223 (la descarga del CDN de Playwright se cuelga en este entorno). Ver memoria.
- **A6 sync DISEÑADO** → ADR `10_SYNC_ARCHITECTURE.md`: Opción B (vault cifrado en nube del usuario, Google Drive primario), motor LWW+tombstones, toggle mono/multi, opt-in. Falta CODIFICAR.
- **A2** modales de fecha (fix iOS appearance) + **MoneyInput** (importes a la derecha con divisa) + **modal de reglas** (svh/safe-area) + **A4 feedback** (Web3Forms) + 2 bugs (dedup por cuenta, sticky desktop una fila).

### 🥇 LO PRIMERO sesión 47 — A1: implementar `vite-plugin-pwa`
**Decisión tomada (founder, sesión 46): Opción A — `vite-plugin-pwa` (Workbox).**
- Objetivo: aviso **"Nueva versión disponible → Actualizar"** fiable. Hoy el SW manual (`public/sw.js`) hace `skipWaiting()` automático y `sw.js` no cambia entre deploys (`CACHE_NAME` fijo) → nunca avisa.
- Plan: instalar `vite-plugin-pwa`, configurar en `vite.config`, usar `registerSW({ onNeedRefresh })` para un banner "Actualizar". Reemplaza `public/sw.js` manual → **reconfigurar para no romper el SPA routing/offline ya validado en iPhone** (network-first / navigation fallback a index.html).
- Verificar en iPhone que sigue funcionando offline + que el aviso de update aparece tras un deploy nuevo.

### 🥈 Después
- **A3** — verificar onboarding en dispositivo real (usuario nuevo, no el founder).
- **A5** — pase de robustez "nada rompe la app" en Safari iOS.
- **Empezar a CODIFICAR el sync (A6)** según `10_SYNC_ARCHITECTURE.md` (OAuth Drive + vault cifrado + toggle en Ajustes).

---

## Recordatorios operativos
- **Trabajo directo en `main`** durante Fase 4. Conventional commits. Un commit = una idea.
- **AccountsSummary.tsx:** sticky propio — móvil 2 filas, **desktop 1 fila** (arreglado sesión 46).
- **Patrón modales móvil:** `maxHeight: min(90svh,90vh)` + overlay `padding: max(1rem, env(safe-area-inset-*))` + `overflowY:auto`. Date inputs: `Input` ya aplica `appearance:none` para `type="date"`. Importes: usar `MoneyInput`.
- ⚠️ **`Recuperación Pasword.txt`** sigue sin trackear en la raíz — sacarlo del repo (D1). También hay muchos `tmp_*.png` acumulados.
- **gstack `/qa`:** se invoca vía la skill `gstack` (no es comando suelto). Funciona con el junction del headless-shell. Es Chromium headless: NO reproduce bugs específicos de iOS — esos los valida el founder en su iPhone.

Cuando hayas leído los .md, dime "listo".
