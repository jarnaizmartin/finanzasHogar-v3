Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 59**.

Protocolo de arranque:

Lee primero `00_FOUNDATION.md` (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de `05_SESSION_LOG.md` (Sesión 58) para saber dónde lo dejamos.
Lee `§Próximo hito inmediato` en `01_ROADMAP.md` y `A3_FIELD_TEST.md`.
Confirma con "listo" antes de proponer nada.

---

## 🎯 OBJETIVO DE HOY: rediseño del ONBOARDING (O1-O4) — bloqueante de beta

⚠️ **Este objetivo viene aplazado de la s.58.** La sesión 58 fue una **tanda de bugs** del founder
(10 commits, ver `05_SESSION_LOG.md`), no se tocó el onboarding. Sigue siendo lo prioritario.

**Decisión cerrada en s.57 (Regla 4 — cambio honesto):** se **deroga** la decisión previa de
"NO rediseñar el onboarding con n=1 / esperar 2-3 testers" (s.53). El founder lo ha visto fallar
en **varios testers informales** → el onboarding **no cumple el objeto de la app** → se retoca YA
y pasa a **bloqueante de beta**.

**Dirección que quiere el founder (leer `08_MEJORAS.md` §STAGING bucket 5):**
- **O1** — Quitar la activación de la seguridad del onboarding (cree que no tiene sentido ahí).
- **O2** — Redefinir la utilidad real y comunicarla de entrada. Set-up mínimo útil = **crear cuenta + crear proyecciones + subir movimientos**.
- **O3** — Eliminar la creación de un objetivo como paso del set-up.
- **O4** — Guía de funcionalidad amplia y profesional (estilo HTML), con pantallas y casos de ejemplo (estándar: Resumen/Proyecciones/Tendencias/Objetivos/Informes; avanzado: Traspasos, interpretar tendencias, Centro de ayuda).

**Antes de tocar código:** ver el onboarding actual (`WelcomeTour.tsx`, `GettingStarted.tsx`,
`onboarding` namespace) — Regla 1, no inventar el flujo. Rol esperado: consultor + abogado del diablo
(O1 quita la seguridad del arranque: argumentar el contra antes de ejecutar).

**Pendiente tras cerrar el diseño:** actualizar la tabla de estado de `01_ROADMAP.md` y `CLAUDE.md`.

---

## ✅ Sesión 58 — lo que se cerró (tanda de bugs, 10 commits en `main`, todo pusheado)

`d58261d` → `99efe17`. **1137 tests verdes, build OK.** Detalle completo en `05_SESSION_LOG.md` §Sesión 58.

1. `2ae6aea` — Duplicados de traspasos recurrentes entre dispositivos: id auto-movimiento **determinista** (`auto-<projId>-<mes>`) en `recurringMotor.ts` → el merge del sync los colapsa.
2. `b930717` — Botón "+" de categoría oculto en modales (z-index): `Modal` admite prop `zIndex`; `QuickCategoryModal` a 100000.
3. `df3d91d` — Botones editar/borrar invisibles en `RegularAccountCard` → tokens theme-aware (`T.title`/`T.red`, transparente, 14px).
4. `4e1b0f6` — Pantalla en negro al guardar movimiento con fecha previa a la base: `RealExpenseWarningModal` → portal a `document.body`.
5. `24d0b2e` — Barrido: `CriticalAlertsModal`, `VaultMigrationModal`, `BackupPanel` → portal. **Ya no queda ningún modal `fixed` sin portal.**
6. `e01e73d` — Fugas de español con app en inglés: `CoachMark` (ctaLabel + hint → i18n, nueva `common.coachDismissHint`) y "1 cuenta" (`cuentasActivasValue` plural). 6 idiomas.
7. `1958d4b` — Badge `✓N`/`⚠N` del saldo ilegible: tinte semántico theme-aware.
8. `d4ebcc4` — **`feat`: selector propio `Sel`** en vez del `<select>` nativo (hoja inferior en móvil / dropdown anclado en escritorio, portal). Misma API → todos los selects. **Alto blast-radius.**
9-10. `7069243` + `99efe17` — **Traspasos inflaban ingresos/gastos** (patrimonio neutro): excluido `isTransfer` en Dashboard, ProjectedVsReal, RealExpensesSummary e Informes (`reportsCalc`, +1 test).

### 🧪 Validación pendiente del founder (de la s.58)
- **`Sel` nuevo en sus 3 dispositivos** (lo gordo). iOS categoría ✅ ya confirmado. Falta: lista larga (divisas/scroll), opciones **deshabilitadas** (origen/destino en Traspasos), anidamiento profundo (el "Tipo" del `QuickCategoryModal`), **auto-divisa** al elegir cuenta, y en **escritorio** el dropdown anclado + flip-up cuando no cabe abajo.
- **Limpiar a mano** los traspasos duplicados ya existentes (borrar una de cada pareja en Traspasos → se propaga al otro dispositivo).

### 🟡 Decisión menor pendiente (en backlog)
- Label "**Transferencia**" → "**Traspaso**": ¿solo el badge `badgeTransfer` (`es.ts:946`) o renombrar toda la feature? ¿solo ES o los 6 idiomas? El founder lo marcó como "lo de menos".

---

## (En segundo plano) Validación del sync §11 — sigue pendiente del founder en iPhone

Reconexión silenciosa de 1 toque · auto-finish del redirect en incógnito con misma contraseña · #3 borrado/tombstones · LWW. ⚠️ Refresh tokens caducan a 7 días si el consent de Google sigue en "Testing" (para beta real: publicar la app). A5 Safari iOS también pendiente.

---

## ⚠️ Lección operativa crítica (no repetir)

- **"Desplegado" SOLO es verdad tras `git push` confirmado con la salida del comando.** Producción la sirve el proyecto Vercel **`finanzas-hogar`** (URL **`https://finanzas-hogar-eta.vercel.app`**), que despliega desde `origin/main`. Hay un duplicado vivo (`finanzashogar-v3`) — compartir SIEMPRE la URL `-eta`.
- **El founder factura por token** — no gastar en bucles ni verificaciones que él hace en 30s. Verifica él en sus dispositivos (sobre todo lo visual/iOS/Android).
- **Headless NO reproduce iOS/Android ni el OAuth real.**
- **Gotcha PowerShell+git:** NO usar comillas dobles en el cuerpo de `git commit -m` (rompió un commit en s.56). Usar `git commit -F -` con heredoc. Y stagear archivos explícitos (`git add -A` bloqueado por sandbox).
- **Patrón anti-"pantalla en negro" (s.56 y s.58):** todo modal `position:fixed` debe ir por **portal a `document.body`**, o un ancestro con `transform`/`filter`/`backdrop-filter`/`contain` lo manda fuera de pantalla. Ya están todos migrados.
- **Antes de editar un archivo i18n hay que `Read`-lo** (el Edit falla si no). Los 6 idiomas: es · en · fr · pt-pt · pt-br · it. Plurales con `_one`/`_other`.

---

## ESTADO: §11 sync CODE-COMPLETE + tanda de bugs s.58 cerrada. Onboarding O1-O4 SIN empezar (bloqueante de beta).

## Recordatorios operativos
- Conventional commits. Un commit = una idea. Cada commit deja la app funcionando.
- Lógica pura siempre en `src/lib/` con su test.
- gstack `/qa` y screenshots vía skill `gstack`; headless NO reproduce iOS/Android ni OAuth.

Cuando hayas leído los .md, dime "listo".
