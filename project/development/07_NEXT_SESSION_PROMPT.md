Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 70**.

Protocolo de arranque:

Lee primero `00_FOUNDATION.md` (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de `05_SESSION_LOG.md` (Sesión 69) para saber dónde lo dejamos.
Lee `§Próximo hito inmediato` en `01_ROADMAP.md`.
Lee el spec canónico del trabajo: `12_ONBOARDING_REDESIGN.md`.
Confirma con "listo" antes de proponer nada.

---

## 🎯 FOCO DE ESTA SESIÓN: pruebas del founder del onboarding COMPLETO (Fases 1-5) en el iPhone

En la s.69 se **completó y pusheó** el rediseño del onboarding: **Fases 4 (Modo Prueba + guía) y 5 (marca O5/O6 + copy)**, tras las Fases 1-3 de la s.68. **Todo está en producción** (`finanzas-hogar`, `https://finanzas-hogar-eta.vercel.app`). Toca **que el founder lo valide en su iPhone**.

### 🔵 Ronda de pruebas (en el iPhone, ya en producción)

**Modo Prueba (Fase 4 — la pieza delicada, prioridad de validación):**
1. **Onboarding → "🧪 Explorar con datos de ejemplo":** entra y la app aparece llena (Resumen, Planificación, Previsión, Tendencias, Informes lucen). Banner morado arriba "Modo Prueba".
2. **Ajustes → "Modo Prueba":** entrar / **Regenerar** datos de ejemplo / **Ir a mis datos reales**.
3. **Aislamiento (crítico):** los datos de ejemplo **no se mezclan** con los reales. Al salir a "mis datos reales", tus datos siguen intactos; al volver a Prueba, siguen los de ejemplo.
4. **Sync/backup en demo:** NO se sincroniza el sandbox; el backup avisa/bloquea en Prueba.
5. **Reload:** entrar/salir/reset recargan la app; comprueba que arranca bien en cada modo (con y sin seguridad activada).

**Guía (Fase 4):**
6. **Centro de Ayuda → guía:** dos secciones — **"El bucle · empieza aquí"** (Cuentas→Planificación→Movimientos→**Previsión**, con el paso Previsión nuevo) y **"Profundidad"** (Objetivos ahora aquí).

**Marca + copy (Fase 5):**
7. **WelcomeTour:** card de privacidad ya NO dice "0 bytes a la nube" (falso); menciona el sync cifrado por tu nube. Card final: mensaje **maratón** (no "2 minutos").
8. **O5 nombre + portada:** el onboarding pide tu nombre (opcional, con copy de privacidad). Al abrir/desbloquear aparece la **portada "Bienvenido de nuevo, {nombre}"** que se **auto-desvanece**; se puede apagar en Ajustes ("Portada de bienvenida"). La pantalla de contraseña también saluda con el nombre.
9. **O6 logo:** logo real en cabecera de onboarding, set-up de seguridad y pantalla de "nueva contraseña".
10. **6 idiomas:** cambiar idioma y ver el Modo Prueba, la guía y el copy nuevos traducidos.

**Fases 1-3 (recordatorio, por si no se validaron):** nav móvil 5 pestañas fijas (¿"Planificación" aprieta en iPhone SE?), onboarding sin seguridad + aviso suave, espina sin Objetivo, 3 empty states, coach import-first.

**Arrastradas (siguen sin validar):** `Sel` en 3 dispositivos · bug ADMIN `1f9318f` · sync §11 iPhone (reconexión 1 toque, auto-finish redirect, tombstones, LWW; refresh tokens 7 días si consent en "Testing") · A5 Safari iOS · icono R3 PWA + logo en lock · limpiar traspasos duplicados a mano.

### 🟠 DESPUÉS (según lo que salga de las pruebas)
- **Ya anotado de la 1ª prueba (s.69, ver `08_MEJORAS.md` §"Anotado en s.69"):**
  - **🔴 Bug CoachMark móvil:** los coachmarks de arranque se **cortan arriba** (no se lee el título) o tapan el contenido apuntando a un target **fuera de vista** que **no se puede scrollear** (2 capturas del founder). Fix: `scrollIntoView` del target + clamp al safe-area + reposicionar/degradar. Revisar `CoachMark.tsx`/`useCoachMark`.
  - **O7 — nombre como PRIMERA pregunta** del onboarding, en tono de diálogo ("¿Cómo quieres que me dirija a ti?"). Mover el campo al inicio + copy conversacional.
- Corregir lo demás que aparezca en el test del founder.
- Deuda menor opcional: i18n-ificar los items del `MockupPrivacy` (hoy hardcodeados en ES); pasos dedicados de Profundidad en la guía (Traspasos/Tendencias/Informes/Multi-divisa).
- Mejora **S1** (`08_MEJORAS.md`): Resumen, drill-down por concepto → pop-up con planificado + movimientos reales (extiende `46f829f`/`ProjectedVsReal`; portal a `document.body`). Sin implementar.
- Retomar **"Proyecciones con confirmación"** (`11_PROJECTION_CONFIRMATION.md`) cuando el onboarding esté validado.

---

## ⚠️ Lección operativa crítica (no repetir)
- **"Desplegado/pusheado" SOLO es verdad tras `git push` confirmado con la salida del comando.** Producción la sirve **`finanzas-hogar`** (`https://finanzas-hogar-eta.vercel.app`). Ciclo: push → redeploy Vercel → reinstalar PWA.
- **El founder factura por token** — no gastar en bucles ni verificaciones que él hace en 30s. No verbose. No bucle "tienes razón".
- **Antes de editar un archivo i18n hay que `Read`-lo.** 6 idiomas: es · en · fr · pt-pt · pt-br · it. Cambiar solo VALORES mantiene la paridad de claves.
- **Modo Prueba:** el aislamiento es por prefijo `fh_demo_*` (`src/lib/appMode.ts`, `keyFor`); el cambio de modo **recarga**. `encryptedStorage` es demo-aware (whitelist por `baseKey`).
- **Patrón anti-"pantalla en negro":** todo modal `position:fixed` por **portal a `document.body`**.
- **Gotcha PowerShell+git:** NO comillas dobles en `git commit -m`. Usar heredoc en git-bash. Stagear archivos explícitos.
- **Verificar cada commit:** `npx tsc --noEmit` + `npm run test:run` (**1148 tests**). Trabajo directo en `main`.

## ESTADO: rediseño del onboarding COMPLETO (Fases 1-5) en producción. Falta la validación del founder en iPhone → especialmente el Modo Prueba (reload + aislamiento).

Cuando hayas leído los .md, dime "listo".
