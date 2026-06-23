# 11 — PROYECCIONES CON CONFIRMACIÓN (movimientos provisionales)

> Especificación funcional. Scope cerrado con el founder en la **sesión 59 (23/06/2026)**.
> Estado: **diseño cerrado, SIN implementar.** Es el objetivo de la sesión 60.
> Rol del asistente en el diseño: consultor + abogado del diablo.

---

## 1. Problema

Esperas un movimiento en una fecha (la nómina el 25), pero llega en otra (el 28),
aunque el importe coincida. Hoy:

- Si la proyección es **recurrente** (`isRecurring`), el motor crea el movimiento
  el día de cargo y lo da por **real al instante** → el saldo cuenta dinero que
  **aún no ha llegado**.
- El aviso de vencimiento (F2.10, `projection_due_soon`) **desaparece** en cuanto
  pasa la fecha prevista (`projectionAlerts.ts` → `if (daysUntil < 0) return empty`)
  → justo cuando el movimiento se retrasa, deja de ayudarte.

El founder quiere distinguir **lo que tiene de verdad** de **lo que está
esperando recibir**, y poder confirmar (auto o manual) cuando llega.

---

## 2. Concepto: movimiento PROVISIONAL ⏳

Un movimiento **provisional** es un `RealExpense` marcado como *pendiente de
confirmar recepción*:

- **NO cuenta como real en NINGÚN cálculo**: saldo, forecast, tarjetas/préstamos,
  informes, objetivos, calendario. (Misma exclusión sistémica que `isTransfer` de
  la s.58, pero por otra razón.)
- **Sí está registrado y visible**, en una zona de **"Pendientes de confirmar"**.
- La **proyección sigue cubriendo el hueco** en el forecast (mes actual:
  `forecastEngine.ts` ya hace `Math.max(0, proyectado − real)` por categoría) →
  el **saldo previsto NO se mueve**. Confirmar solo sube el **saldo real de hoy**.
  → El saldo previsto es **invariante** a si está confirmado o no. Esta es la
  propiedad que hace segura toda la feature.
- Se puede **borrar** si nunca llegó (como cualquier movimiento).

**Decisión de saldo (founder, s.59):** el provisional **NO cuenta** hasta
confirmar. Saldo = solo lo recibido de verdad; lo pendiente se ve aparte.

---

## 3. Modo de materialización de la proyección (el "flag" del founder)

Hoy la proyección tiene un checkbox `isRecurring` =
*"🔄 Es un cargo automático confirmado · La app lo registrará como movimiento real
al vencer"*. Ese interruptor se convierte en una **elección de cómo nace el
movimiento** — selector segmentado de **3 opciones** (decisión B s.59: el
segmentado de 3 es más explícito y mejor UX que un check + sub-check):

| Modo | Al vencer | Para qué |
|---|---|---|
| **Manual** | Nada automático; lo registras tú | lo de siempre (`isRecurring` off) |
| **Automático — confirmado** | Crea el movimiento **real tal cual** | 100% seguro: cuota hipoteca, suscripción fija (`isRecurring` on hoy) |
| **Automático — pendiente de confirmar** ⏳ | Crea el movimiento **provisional** | esperado pero puede retrasarse: nómina, ingresos variables |

- **El modo vale para proyecciones recurrentes Y sueltas/una vez** (founder,
  punto 3 + decisión A): una proyección suelta en modo auto se materializa **una
  vez**, en su fecha. → El motor (`recurringMotor.ts`), que hoy solo procesa
  `isRecurring`, se **extiende** para materializar también proyecciones auto no
  recurrentes (una sola vez, marcando `lastApplied`/equivalente para idempotencia).
  ⚠️ **Este es el trozo de mayor riesgo del lote** — aislar y testear bien.

### Migración / compatibilidad (founder, punto 1)
- **No afecta a las proyecciones ya creadas ni a sus movimientos ya generados.**
  Las proyecciones con `isRecurring` actual = modo **"automático — confirmado"**.
  El modo "pendiente de confirmar" es **opt-in**, solo para nuevos vencimientos.
- Si el founder quiere cambiar una existente, lo hace **a mano** editándola.

---

## 4. Confirmación

- **Automática (al importar del banco):** un movimiento del extracto que casa con
  un provisional (importe ±tolerancia, cuenta, tipo) lo **confirma** y adopta la
  **fecha real** en que llegó (28, no 25). Cambia la reconciliación de import:
  hoy ese movimiento se marcaría "duplicado"; ahora **confirma** el provisional.
- **Manual:** botón **"Confirmar"** en el movimiento provisional, con opción de
  ajustar la fecha real.

Confirmar = quitar el flag `provisional` (+ fecha real opcional + `updatedAt`
para el LWW del sync).

---

## 5. UI

- **Lista de movimientos**: sello ⏳ en los provisionales + botón "Confirmar".
  Filtro nuevo **por estado**: todos / confirmados / pendientes.
- **Sección "Pendientes de confirmar"**: detalle filtrable + **totales** (ingreso /
  gasto / neto que esperas recibir).
- **Saldo de cuenta**: muestra solo lo confirmado, con nota "⏳ +X € pendientes".

---

## 6. Alerta ROJA persistente (founder, punto 4)

- Si hay movimientos provisionales pendientes → **alerta crítica/roja** cada vez
  que entras en la app: *"Tienes X movimientos pendientes de confirmar (dinero no
  recibido) — revisar"* → navega a la sección de pendientes.
- Es **dinero NO recibido** → severidad roja, persistente hasta confirmar o borrar.
- Nuevo `AlertType` (p. ej. `pending_confirmation`). Solo la disparan los
  **provisionales**, no los auto-confirmados.

---

## 7. Aviso de vencimiento que NO caduca (founder, punto 3)

- `shouldAlertProjection` (`projectionAlerts.ts`) deja de devolver vacío cuando
  `daysUntil < 0`: el aviso **sigue** mostrándose tras la fecha prevista
  (*"vencía hace N días, ¿llegó?"*) hasta que registres/confirmes.
- Aplica sobre todo a proyecciones **manuales/sueltas** (las auto ya generan su
  provisional, que dispara la alerta roja de §6).

---

## 8. Modelo de datos (mínimo, retro-compatible)

```ts
// RealExpense
provisional?: boolean;              // ⏳ pendiente de confirmar (ausencia = confirmado → legacy + banco intactos)
provisionalProjectionId?: string;   // proyección de la que nació (trazabilidad / no duplicar)

// Projection — modo de materialización (3-way). Nombres a decidir en implementación;
// ausencia/legacy debe resolver a "automático — confirmado" cuando isRecurring.
// Decoplar "auto" de "recurrente" para soportar sueltas en modo auto.
```

---

## 9. Orden de construcción (cada paso deja la app funcionando + tests)

1. **Cimientos:** tipos + `provisionalCalc.ts` (helpers `isProvisional`/`isConfirmed`/
   `confirmMovement`/`computeProvisionalTotals`) + tests. *Sin cambio visible.*
2. **Barrido de exclusión:** excluir provisionales en `balanceCalc`,
   `forecastEngine` (past + current), `creditCardUtils` (debt/history/topCats),
   `loanUtils`, `Dashboard`, `ProjectedVsReal`, `RealExpensesSummary`,
   `reportsCalc` (`filterPeriodReals` + `computeTrendsStats`), `goalsCalc`,
   `calendarCalc` (`buildAnnualMonthStats`). Tests. *Riesgo = olvidar un sitio.*
3. **Modo + motor:** selector de 3 modos en el form de proyección + el motor crea
   provisionales y se extiende a sueltas auto. Tests.
4. **UI:** sello ⏳, filtro por estado, botón confirmar, sección pendientes.
5. **Alertas:** roja persistente de pendientes (§6) + aviso que no caduca (§7).
6. **Auto-confirmación al importar del banco** (§4) — cambia la reconciliación.

---

## 10. Notas de riesgo

- **Barrido (paso 2):** el riesgo no es matemático (el saldo previsto es
  invariante), es **dejarse un sitio**. Buscar todos los sumatorios de
  `realExpenses` (el mismo conjunto que el barrido `isTransfer` de la s.58).
- **Motor sueltas (paso 3):** extender el motor a no-recurrentes es lo más nuevo.
- **Reconciliación de import (paso 6):** no romper la detección de duplicados
  existente; un provisional debe **confirmarse**, no marcarse "duplicado".
- **i18n:** todo texto nuevo en los **6 idiomas** (es · en · fr · pt-pt · pt-br · it),
  plurales `_one`/`_other`. `Read` del archivo i18n antes de editar.
- **Traspasos:** sin cambios de comportamiento (siguen patrimonio neutro).
