Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 60**.

Protocolo de arranque:

Lee primero `00_FOUNDATION.md` (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de `05_SESSION_LOG.md` (Sesión 59) para saber dónde lo dejamos.
Lee `§Próximo hito inmediato` en `01_ROADMAP.md`.
Lee **`11_PROJECTION_CONFIRMATION.md`** entero (es el scope cerrado que vas a implementar).
Confirma con "listo" antes de proponer nada.

---

## 🎯 OBJETIVO DE HOY: implementar "Proyecciones con confirmación" (movimientos provisionales)

**Diseño cerrado en s.59** con el founder. Todo el scope está en
**`11_PROJECTION_CONFIRMATION.md`** (canónico). No re-discutir el diseño salvo que
aparezca un dato duro nuevo (Regla 4). Rol: ejecutor + abogado del diablo en los puntos de riesgo.

**Qué es, en una frase:** una proyección que vence puede crear su movimiento como
**provisional ⏳** (pendiente de confirmar recepción) en vez de como real. El provisional
**no cuenta** en ningún cálculo (saldo, forecast, tarjetas, informes, objetivos, calendario);
se confirma **auto** (al importar del banco, adoptando la fecha real) o **manual** (botón).
Sirve para movimientos que esperas pero pueden llegar más tarde (nómina, ingresos variables).

**Orden de construcción** (de `11_PROJECTION_CONFIRMATION.md` §9 — cada paso deja la app
funcionando + tests, un commit por idea):
1. **Cimientos:** `RealExpense.provisional` + `provisionalProjectionId` en `types.ts` +
   `src/lib/provisionalCalc.ts` (`isProvisional`/`isConfirmed`/`confirmMovement`/
   `computeProvisionalTotals`) + tests. *Sin cambio visible.*
2. **Barrido de exclusión:** excluir provisionales en `balanceCalc`, `forecastEngine`
   (past + current), `creditCardUtils`, `loanUtils`, `Dashboard`, `ProjectedVsReal`,
   `RealExpensesSummary`, `reportsCalc`, `goalsCalc`, `calendarCalc`. *Riesgo = dejarse un
   sitio; es el mismo conjunto de sumatorios que el barrido `isTransfer` de la s.58.*
3. **Modo + motor:** selector segmentado de 3 modos (Manual / Auto-confirmado / Auto-pendiente)
   en el form de proyección + el motor (`recurringMotor.ts`) crea provisionales y se extiende
   a proyecciones **sueltas auto** (materializan una vez). ⚠️ El trozo de más riesgo.
4. **UI:** sello ⏳ en la lista, filtro por estado (todos/confirmados/pendientes), botón
   "Confirmar" (ajusta fecha real), sección "Pendientes de confirmar" (detalle + totales).
5. **Alertas:** alerta **roja persistente** de pendientes (§6) + el aviso de vencimiento que
   **ya no caduca** al pasar la fecha (§7, `projectionAlerts.ts`).
6. **Auto-confirmación al importar del banco** (§4): un movimiento del extracto confirma el
   provisional (adopta fecha real) en vez de marcarlo "duplicado".

**Decisiones ya tomadas (no reabrir):**
- El provisional **NO cuenta** en el saldo (founder).
- **No afecta a lo ya creado**; el modo nuevo es opt-in (founder, punto 1).
- Modo = **3 opciones segmentadas** (decisión B). Las **sueltas también** entran (decisión A).

**Nota de método:** en s.59 se hizo un commit de cimientos (`b9da9b1`) y se **revirtió entero**
a petición del founder para reconfirmar el scope antes de picar. Hay que **rehacer** el paso 1.

---

## ⚠️ Onboarding O1-O4 — sigue bloqueante de beta, SIN empezar

Aplazado desde s.58 y s.59. Dirección en `08_MEJORAS.md` §STAGING bucket 5 (O1 quita la
seguridad del arranque; O2 set-up mínimo útil = cuenta + proyecciones + movimientos; O3 quita
el objetivo del set-up; O4 guía profesional estilo HTML). **Al arrancar la s.60, decidir con el
founder si va primero la feature de confirmación o el onboarding** (él pivotó dos veces seguidas
fuera del onboarding; conviene confirmarlo explícitamente, no asumirlo).

---

## (En segundo plano) Validación pendiente del founder

- **`Sel` (selector propio, s.58)** en sus 3 dispositivos: lista larga (divisas/scroll),
  opciones deshabilitadas (Traspasos), anidamiento profundo (Tipo en QuickCategory), auto-divisa,
  y en escritorio el dropdown anclado + flip-up. iOS categoría ✅.
- **Limpiar a mano** los traspasos duplicados ya existentes (s.58).
- **Sync §11 en iPhone**: reconexión silenciosa de 1 toque · auto-finish del redirect en
  incógnito · #3 borrado/tombstones · LWW. ⚠️ Refresh tokens caducan a 7 días si el consent de
  Google sigue en "Testing". A5 Safari iOS también pendiente.

---

## ⚠️ Lección operativa crítica (no repetir)

- **"Desplegado" SOLO es verdad tras `git push` confirmado con la salida del comando.**
  Producción la sirve el proyecto Vercel **`finanzas-hogar`** (URL **`https://finanzas-hogar-eta.vercel.app`**).
  Compartir SIEMPRE la URL `-eta`.
- **El founder factura por token** — no gastar en bucles ni verificaciones que él hace en 30s.
- **Headless NO reproduce iOS/Android ni el OAuth real.**
- **Gotcha PowerShell+git:** NO comillas dobles en `git commit -m` (rompió un commit en s.56).
  Usar `git commit -F -` con heredoc. Stagear archivos explícitos (`git add -A` bloqueado por sandbox).
- **Patrón anti-"pantalla en negro":** todo modal `position:fixed` por **portal a `document.body`**.
- **Antes de editar un archivo i18n hay que `Read`-lo.** 6 idiomas: es · en · fr · pt-pt · pt-br · it.
  Plurales `_one`/`_other`.

---

## ESTADO: feature "Proyecciones con confirmación" DISEÑADA (s.59, `11_...md`), sin implementar. Onboarding O1-O4 sigue bloqueante de beta sin empezar.

## Recordatorios operativos
- Conventional commits. Un commit = una idea. Cada commit deja la app funcionando.
- Lógica pura siempre en `src/lib/` con su test.
- gstack `/qa` y screenshots vía skill `gstack`; headless NO reproduce iOS/Android ni OAuth.

Cuando hayas leído los .md, dime "listo".
