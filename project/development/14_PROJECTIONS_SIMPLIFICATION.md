# 14 — REPLANTEAMIENTO DE PROYECCIONES / TRASPASOS (¿algo más sencillo?)

> Reflexión estratégica abierta por el founder en la **sesión 76 (24/07/2026)**, tras usar la app en producción.
> Estado: **análisis hecho y anclado en el código; SIN decidir.** Pendiente de que el founder revise y responda las 2 preguntas del final.
> Rol del asistente: consultor + abogado del diablo.
> ⚠️ Esto **reconsidera** el spec `11_PROJECTION_CONFIRMATION.md` (s.59). Ver §"Reset honesto".

---

## 1. El problema que ve el founder (en producción)

Las proyecciones/planificaciones que se **confirman como movimientos reales** generan más problemas que ayuda:

- **Descuadres / duplicados:** si al importar el banco no se identifica el duplicado, el movimiento auto-generado por la proyección + el importado = doble conteo.
- **Discrepancias de saldo por decalaje:** ciertos movimientos llegan con retraso (fines de semana, tiempo sin cargar el extracto) → el saldo de la app no coincide con el banco.

Le hace cuestionar si estamos enfocando bien la utilidad. Lo que de verdad quiere:
1. **Conocer saldos y patrimonio actual de forma SENCILLA.**
2. Un **análisis** de las proyecciones/planificaciones (del mes y de otros periodos).

Dudas explícitas del founder:
- Las proyecciones son el **objeto principal** de la app → tienen todo el sentido. Pero ¿algo **más sencillo**?
- ¿Los **traspasos** tienen sentido, o generan el mismo tipo de problema?

---

## 2. Diagnóstico (anclado en el código, verificado en s.76)

**Hay dos números que deben vivir separados y que hoy se mezclan:**

- **Saldo/patrimonio real AHORA** → debe ser **idéntico al banco**. Fuente honesta = solo lo que pasó de verdad (import + apuntes manuales de hechos reales).
- **Previsión (mes y otros periodos)** → es el **plan**, hacia delante. Ahí viven las proyecciones.

**El villano que los mezcla es UNO solo:** la proyección recurrente que se convierte en movimiento real **automáticamente**.

Evidencia en código:
- `applyRecurringProjections` (`src/lib/recurringMotor.ts`) corre **solo, en cada arranque** (`src/AppProvider.tsx:436`, efecto sobre `onboarded`).
- El movimiento auto-generado se **fecha el día planificado** (`chargeDate`), no el día real del banco → **decalaje ⇒ el saldo no coincide con el banco** hasta que el banco lo carga.
- El anti-duplicado es una **heurística frágil**: mismo mes + importe **±5%** (`recurringMotor.ts:75-82`). Si la nómina cae en otro mes del previsto, varía >5%, o entra en otra cuenta/categoría al importar → **no lo caza** ⇒ auto-generado + importado = descuadre. (Es el origen probable del "posible duplicado" de la s.56.)

**Clave:** el saldo en sí está **bien diseñado** — `calcRealBalance` (`src/lib/balanceCalc.ts`) solo mira movimientos reales (saldo inicial + reales con `valueDate > account.date`). Lo que lo envenena es el motor que **inyecta "reales falsos"** antes de que el banco los confirme.

---

## 3. Reset honesto (Regla 4) — esto contradice la s.59

En la s.59 (`11_PROJECTION_CONFIRMATION.md`), ante el mismo decalaje, el plan era construir **MÁS maquinaria**: movimientos "provisionales ⏳", confirmación auto/manual, alerta roja persistente, barrido de exclusión por ~10 módulos, reconciliación en el import.

**Dato nuevo:** la experiencia del founder en producción muestra que el problema **no es la falta de un estado intermedio, es que las proyecciones se materialicen siquiera.** Añadir "provisional" cura el síntoma (la fecha) con más complejidad; la enfermedad es el acto de materializar. El instinto del founder ("¿algo más sencillo?") va en la dirección correcta (Regla 3).

---

## 4. Propuesta: el modelo sencillo

**"Las proyecciones NUNCA se vuelven reales. Dos números, jamás mezclados."**

1. **Real = solo lo que pasó** (importado o tecleado como hecho). → **El saldo es igual al banco por construcción.** Sin decalaje ni duplicados posibles: no se inventa nada.
2. **Proyección = solo plan.** Alimenta una vista hacia delante, separada: *"este mes planificaste X, llevas Y real, previsión de cierre X"* y *"saldo previsto a 1 / 3 meses / jubilación"*.
3. **Ya funciona gratis:** `forecastEngine` hace `Math.max(0, proyectado − real)` por categoría → según importas el banco, el plan se rellena solo y **converge a la realidad**. No hace falta confirmar, ni ⏳, ni alertas rojas, ni barridos. **El spec de la s.59 deja de ser necesario** (una feature que NO construyes = la mejor simplificación).

Concretamente: **eliminar/neutralizar `applyRecurringProjections`** (`isRecurring` deja de crear movimientos) + ajustar la dedup del import. Es *quitar* un motor, no añadir uno.

---

## 5. Argumento contrario (Regla 2) — lo que CUESTA

- **El usuario que NO importa del banco pierde el "manos libres".** Hoy, marca la hipoteca recurrente y su saldo se mueve solo. En el modelo sencillo, si no importa, su saldo solo se mueve al teclear. Para el perfil "lo dejo configurado y que la app lo lleve", es una **regresión**.
- **Mitigación:** en una proyección vencida, un botón **de un toque "registrar / ya ocurrió"** que crea el movimiento real **ese mes, fechado por el usuario** (opt-in, explícito). Diferencia con hoy: **lo decides y lo fechas tú** → casa con tu realidad y no se inventa en silencio el día del plan. Como la previsión ya cede vía `max(0, …)`, no descuadra.
- **Contra de la mitigación:** con 20 cargos fijos, el botón es más fricción que el automático de hoy.
- **Respuesta:** un saldo mostrado con confianza pero **equivocado** es peor que un "importa para actualizar" honesto → coherente con el norte (privacidad + confianza + sencillez). **Pero es decisión del founder.**

---

## 6. Traspasos — el mismo villano, no un problema aparte

- El **concepto** de traspaso es **correcto y valioso**: "moví dinero entre MIS cuentas, patrimonio neutro" para que no cuente como ingreso/gasto (ya neutro desde la s.58).
- El problema surge **solo cuando un traspaso recurrente se auto-materializa** (el motor genera el par out/in, `recurringMotor.ts:109-142`) **y además importas ambos extractos** → doble conteo.
- **Veredicto:** conservar los traspasos como herramienta de **enlazar dos movimientos reales como neutros**; retirarlos como fuente de **auto-generación** (misma regla que las proyecciones). Futuro opcional: al importar, sugerir *"¿esto es un traspaso?"* cuando hay salida+entrada del mismo importe entre cuentas propias en fechas próximas.

---

## 7. Resumen de la decisión (es del founder)

| | Modelo de hoy (híbrido) | Modelo sencillo (propuesto) |
|---|---|---|
| Saldo vs banco | descuadra por decalaje/duplicados | **igual al banco siempre** |
| Proyecciones | plan + se materializan | **solo plan** (convergen solas al importar) |
| Traspasos | concepto + auto-generación | **solo enlace neutro de reales** |
| Complejidad | crece (spec s.59) | **decrece** (quitas un motor, no construyes el spec) |
| Coste | — | el que no importa pierde "manos libres" → botón "registrar" |

**Recomendación del asistente (consultor):** ir al modelo sencillo. Cura el problema de raíz, es más fiel al norte, y ahorra construir toda la maquinaria de la s.59. El precio (usuario que no importa) es real pero acotado y mitigable.

---

## 8. 🔴 PENDIENTE — 2 preguntas para el founder (la bisagra de todo)

1. **¿El objetivo #1 es "saldo = banco, SIEMPRE"**, aunque cueste el automático de los cargos fijos? De aquí sale todo.
2. **El perfil "no importo, quiero que la app lleve mi saldo sola"** — ¿usuario **real y a defender**, o comodidad de la que podemos prescindir en favor de la exactitud? De esto depende cuánto peso dar a la mitigación (botón "registrar").

Cuando el founder responda: formalizar (reescribir el `11` o abrir spec nuevo) + ajustar `01_ROADMAP.md`. Opción abierta por el founder: traer **mercado/competencia** (cómo lo resuelven YNAB, Monarch, Copilot) con búsqueda web + pensamiento de alto nivel, para contrastar antes de decidir.

---

## 9. Ficheros tocados en el diagnóstico (para retomar rápido)

- `src/lib/recurringMotor.ts` — el motor de auto-materialización (el villano).
- `src/AppProvider.tsx:436` — dónde se dispara (efecto de arranque).
- `src/lib/balanceCalc.ts` — `calcRealBalance` (saldo = solo reales; está bien).
- `src/lib/forecastEngine.ts` — `Math.max(0, proyectado − real)` (la convergencia que hace innecesaria la materialización).
- `src/views/Transfers.tsx` — traspasos.
- `11_PROJECTION_CONFIRMATION.md` — el spec de la s.59 que esto reconsidera.
