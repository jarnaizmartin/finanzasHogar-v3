Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 51**.

Protocolo de arranque:

Lee primero `00_FOUNDATION.md` (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de `05_SESSION_LOG.md` (Sesión 50) para saber dónde lo dejamos.
Lee `§Próximo hito inmediato` en `01_ROADMAP.md`.
Confirma con "listo" antes de proponer nada.

---

## ⚠️ Lección operativa crítica (no repetir)

- **"Desplegado" SOLO es verdad tras `git push` confirmado con la salida del comando.** Vercel (`finanzas-hogar-eta.vercel.app`) despliega desde `origin/main`.
- **El founder factura por token** — no gastar en bucles ni verificaciones que él hace en 30s.
- **Headless NO reproduce iOS ni el OAuth real** — esos los valida el founder en dispositivo real.

---

## 🥇 ESTADO: A6 está CODE-COMPLETE. Lo que queda son VALIDACIONES MANUALES del founder.

En la sesión 50 se cerró TODO el wiring del sync (hook `useSync` + toggle `<SyncSettings>` en Ajustes + `getSyncSalt`). 1080 tests · build OK · pusheado. El hook es **inerte** mientras el opt-in (`fh_sync_enabled`) esté off → la app actual es idéntica.

**No hay código pendiente de A6.** Falta SOLO que el founder valide en navegador real (no lo puede hacer el asistente).

### 🧪 LO PRIMERO sesión 51 — el founder ejecuta el PLAN DE PRUEBA de A6

> El plan completo (10 escenarios + preparación) está guardado en `05_SESSION_LOG.md` §Sesión 50. Resumen de preparación: auth por **contraseña**, `VITE_GOOGLE_CLIENT_ID` en `.env`, `npm run dev`, **2 almacenamientos** (perfil + incógnito), misma cuenta Google (test user) y **la MISMA contraseña maestra**.

Escenarios clave: activar (primario) · emparejar (2º disp.) · alta se propaga · borrado se propaga y NO reaparece (tombstone) · LWW (gana el más reciente) · duplicados del primer merge · contraseña distinta da error limpio · reconectar · desconexión suave · desconectar+borrar nube.

**Si algo falla:** el founder trae el mensaje de consola (F12) + el escenario, y se corrige. **Si todo OK → A6 cerrado de verdad.**

### Piezas de A6 ya construidas (referencia rápida)
- `src/hooks/useSync.ts` — controlador del bucle (gating + disparadores + aplica merge con `applySyncedData` preservando LWW + errores a estado). Expuesto en `useApp().sync`.
- `src/components/SyncSettings.tsx` — toggle de Ajustes (conectar/emparejar/estado/sincronizar/desconectar/borrar nube) + i18n `appShell.sync.*` ×4.
- `SecurityContext`: `getSyncKey`/`getSyncSalt`/`hasSyncSalt`/`prepareSyncKey`/`adoptSyncKey`/`clearSyncKey`.
- `src/lib/sync/*` — toda la lógica pura (transporte Drive, merge, codec, runSync). Validado en navegador (transporte) en sesión 48.

---

## Después de A6 — camino a la BETA (Fase 5)

Quedan, además de la validación de A6, **2 validaciones manuales** del founder y **1 limpieza**:
1. **A3** — test de campo del onboarding con un usuario nuevo real (un amigo), en dispositivo real.
2. **A5** — pase de robustez en **Safari iOS real** (el código ya está blindado; falta el pase manual).
3. **D1** — sacar `Recuperación Pasword.txt` de la raíz del repo (no debe estar versionado).

Con eso, el corte beta A1-A6 queda cerrado y se puede **arrancar la beta privada**. B y C (pulido móvil, KPIs, búsqueda avanzada, etc.) se trabajan DURANTE la beta con feedback real.

## Deuda registrada (no bloquea beta — `06_BACKLOG.md`)
- 🔴 **Lint/type-check**: `tsc -b` ~25 errores (el `Record<string,string>` del tema, etc.) + eslint ~347 (React Compiler). El CI **no** corre `tsc`; el gate real es Vitest + `vite build`. Tanda propia de limpieza, sin mezclar con features.
- Tests pendientes de algunos componentes (prioritario `useLoanAmortization` — mueve dinero).
- Cripto/IO sin tests unitarios (decisión A/B/C). Convivencia `AppContext` legacy vs `contexts/*`.

## Carril comercial (naming) — aparte
Sesión 10 de naming cerrada con **reset de método** (ver `commercial/09_NEXT_SESSION_PROMPT.md`): el pool compuesto-inglés fue rechazado (no se deletrea de oído fuera del inglés); el próximo intento calibra primero el gusto del founder / mina su historia. **Naming NO bloquea la beta.**

## Recordatorios operativos
- Conventional commits. Un commit = una idea. Cada commit deja la app funcionando.
- Lógica pura siempre en `src/lib/` con su test.
- gstack `/qa`: vía skill `gstack`; headless NO reproduce bugs de iOS ni OAuth.

Cuando hayas leído los .md, dime "listo".
