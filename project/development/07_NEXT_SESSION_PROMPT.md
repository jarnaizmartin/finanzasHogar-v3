Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 58**.

Protocolo de arranque:

Lee primero `00_FOUNDATION.md` (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de `05_SESSION_LOG.md` para saber dónde lo dejamos.
Lee `§Próximo hito inmediato` en `01_ROADMAP.md` y `A3_FIELD_TEST.md`.
Confirma con "listo" antes de proponer nada.

---

## 🎯 OBJETIVO DE HOY: rediseño del ONBOARDING (O1-O4) — bloqueante de beta

La sesión 57 (19/06/2026) solo registró una tanda de mejoras del founder en `08_MEJORAS.md`
(sección **"🆕 STAGING — sesión 57"**). El análisis se aplazó a hoy. **Empezamos por el onboarding.**

**Decisión cerrada en s.57 (Regla 4 — cambio honesto):** se **deroga** la decisión previa de
"NO rediseñar el onboarding con n=1 / esperar 2-3 testers" (s.53). El founder lo ha visto fallar
en **varios testers informales** → el onboarding **no cumple el objeto de la app** → se retoca YA
y pasa a **bloqueante de beta**.

**Dirección que quiere el founder (a analizar y aterrizar juntos hoy — leer `08_MEJORAS.md` §STAGING bucket 5):**
- **O1** — Quitar la activación de la seguridad del onboarding (cree que no tiene sentido ahí).
- **O2** — Redefinir la utilidad real y comunicarla de entrada. Set-up mínimo útil = **crear cuenta + crear proyecciones + subir movimientos**.
- **O3** — Eliminar la creación de un objetivo como paso del set-up.
- **O4** — Guía de funcionalidad amplia y profesional (estilo HTML), con pantallas y casos de ejemplo (estándar: Resumen/Proyecciones/Tendencias/Objetivos/Informes; avanzado: Traspasos, interpretar tendencias, Centro de ayuda).

**Antes de tocar código:** ver el onboarding actual (`WelcomeTour.tsx`, `GettingStarted.tsx`,
`onboarding` namespace) — Regla 1, no inventar el flujo. Rol esperado: consultor + abogado del diablo
(O1 quita la seguridad del arranque: argumentar el contra antes de ejecutar).

**Pendiente tras cerrar el diseño:** actualizar la tabla de estado de `01_ROADMAP.md` y `CLAUDE.md`.

---

## (En segundo plano) Validación del sync — sigue pendiente del founder en iPhone

---

## ⚠️ Lección operativa crítica (no repetir)

- **"Desplegado" SOLO es verdad tras `git push` confirmado con la salida del comando.** Producción la sirve el proyecto Vercel **`finanzas-hogar`** (URL **`https://finanzas-hogar-eta.vercel.app`**), que despliega desde `origin/main`. Hay un duplicado vivo (`finanzashogar-v3`) — compartir SIEMPRE la URL `-eta`.
- **El founder factura por token** — no gastar en bucles ni verificaciones que él hace en 30s.
- **Headless NO reproduce iOS ni el OAuth real** — esos los valida el founder en dispositivo real.
- **Gotcha PowerShell+git:** comillas dobles dentro del mensaje de `git commit -m` rompen el split → NO usar `"` en el cuerpo del commit (rompió un commit en s.56). Y `git add -A` fue bloqueado por el sandbox → stagear archivos explícitos.
- **No proponer rutas de prueba sin verificar que ejercitan lo que quieres validar** (s.56: sugerí desconectar-suave→reconectar para probar el auto-finish del redirect, pero la desconexión suave conserva el refresh_token → reconecta en silencio sin redirect → no ejercitaba ese código).

---

## ESTADO: §11 (reconexión del sync) CODE-COMPLETE + UX del completado mejorada. Falta validación del founder en dispositivo real.

La sesión 56 cerró la UX del alta de sync (Opción 2 — completado automático sin 2ª contraseña tras el redirect) y corrigió 2 bugs que salieron al dogfooding en iPhone:
- **Auto-finish del redirect** (`dfedfdf`): al volver de Google y desbloquear UNA vez, la conexión se completa sola (toast "Sincronización activada"); el formulario manual queda de red de seguridad.
- **Reconexión silenciosa tras desconexión suave** (`43141bd`): el botón "Conectar" ya no se queda muerto cuando hay refresh_token conservado.
- **Modal de duplicados fuera de pantalla en iOS** (`2263f16`): `Modal` ahora va por portal a `document.body` (escapa del containing block del `backdrop-filter` del modal padre).

**1133 tests, build OK, todo en `origin/main`.** Detalle en `05_SESSION_LOG.md` §Sesión 56.

### 🧪 LO INMEDIATO: validación del founder en dispositivo real (sobre todo iPhone)
1. **Reconexión silenciosa:** Ajustes → "Desconectar" → "Conectar Google Drive" → debe reconectar de **un toque**, sin Google y sin contraseña.
2. **Auto-finish del redirect (Opción 2), sin tocar datos:** abrir la app en **incógnito / navegador nuevo** → configurar seguridad con la **MISMA contraseña** → Ajustes → Conectar → va a Google → al volver, desbloquear **una vez** → debe emparejar con el vault y mostrar el toast, sin 2ª contraseña ni dejar en Resumen.
3. **Modal de duplicados:** al pulsar "Revisar", la lista debe verse centrada (también en iPhone).

### 🔴 SIN RESOLVER — origen del aviso de duplicado (s.56)
El founder vio un "posible duplicado" sin haber metido nada nuevo. No diagnosticado (Regla 1: faltaba el dato). **Cuando abra la lista, distinguir:**
- Entradas **idénticas** (descripción/importe/fecha exactos) → posible **duplicación real en el merge** → revisar a fondo `runSync`/`snapshot`/dedup + LWW.
- Entradas solo **parecidas** → **falso positivo** de la heurística §8.3 (mismo tipo + importe ±0,01 € + fecha ±2 días), inofensivo.

### ⚠️ Avisos honestos (Regla 1) sobre §11
- **Refresh tokens en modo "Testing":** si el consent de Google sigue en "Testing", caducan a los **7 días** → la reconexión automática se "olvida" cada semana. Para beta real: publicar la app (estado "In production"; con el scope `drive.appdata` puede requerir revisión de Google, sin confirmar). No bloquea validar ahora.
- Si el founder cambia de URL de producción (no `-eta`), añadir su origen a `OAUTH_ALLOWED_ORIGINS` en Vercel y la redirect_uri en Google.

---

## Resto del corte beta (Fase 5) — pendiente

1. **Sync — validación funcional restante** (tras la reconexión): #3 borrado/tombstones (ambos conectados → borrar en disp.1 → sincronizar ambos → ¿desaparece y NO reaparece?), LWW/contraseña distinta. Plan en `05_SESSION_LOG.md` §Sesión 50.
2. **A5** — pase de robustez en **Safari iOS real** (código ya blindado).

### 🔴 Sigue SIN resolver: hallazgo estratégico de onboarding (A3)
1er tester: arranque largo, no transmite valor. **Regla 2 (n=1): NO rediseñar con un solo tester.** Repartir invitaciones (`/beta-{es,en,fr}.html`) → 2-3 testers → sesión de rediseño. Detalle en `A3_FIELD_TEST.md` §Resultado.

## Deuda registrada (no bloquea beta — `06_BACKLOG.md`)
- 🔴 Lint/type-check pre-existente: `tsc -b` ~25 errores + eslint ~347 (React Compiler). El CI **no** corre `tsc`; el gate real es Vitest + `vite build`.
- **Tipos de cambio (`api.frankfurter.app`) bloquea CORS a veces** → la app usa tipos aproximados (fallback). Ajeno al sync; anotar si molesta.
- Cripto/IO sin tests unitarios; `useLoanAmortization` sin tests.

## Carril comercial (naming) — aparte
`FinanzasHogar` es placeholder. **Naming NO bloquea la beta.**

## Recordatorios operativos
- Conventional commits. Un commit = una idea. Cada commit deja la app funcionando.
- Lógica pura siempre en `src/lib/` con su test.
- gstack `/qa` y screenshots vía skill `gstack`; headless NO reproduce iOS ni OAuth.

Cuando hayas leído los .md, dime "listo".
