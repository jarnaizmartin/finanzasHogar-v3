# 08 — MEJORAS FUTURAS

> Lista de mejoras identificadas para la aplicación, pendientes de priorizar y asignar a fase.
> No son bugs ni deuda técnica estructural (eso va en `06_BACKLOG.md`) — son funcionalidades y UX improvements detectados en uso real.
> Última actualización: 02/06/2026

---

## Cómo usar este archivo

- **Al identificar una mejora:** añadirla aquí con descripción breve y categoría.
- **Al priorizar:** mover a `01_ROADMAP.md` dentro de la fase correspondiente.
- **Al implementar:** registrar en `05_SESSION_LOG.md` como parte de la sesión.
- **Prioridades:** se revisan periódicamente. Los marcados 🔴 son bugs o errores graves.

---

## Clasificación AHORA vs FASE 4

> Decisión cerrada en sesión 02/06/2026.
> **AHORA** = bug de correctitud o fix trivial que no requiere rediseño visual. Se ejecuta en bloque Pre-Fase 4.
> **FASE 4** = mejora UX/visual/feature nueva — se aborda durante el rediseño responsive completo.
> **POST-LANZAMIENTO** = requiere validación de mercado o infraestructura que no existe aún.

### ⚡ Pendientes AHORA

| ID | Descripción | Estado |
|---|---|---|
| B1 | Error en cálculo cuota mensual hipoteca/préstamo (capital+intereses → solo capital) | ✅ 02/06/2026 |
| B2 | Email verificación seguridad llega a admin / inconsistencia tiempo (1 min app / 10 min email) | ✅ 02/06/2026 |
| B3 | Panel administrador no accesible desde producción | ✅ 02/06/2026 |
| B4 | Sin validación de viabilidad cuota vs plazo en préstamos | ✅ 02/06/2026 |
| B5 | Modal carga extracto: ampliar de 30 a 50+ líneas | ✅ 02/06/2026 |
| B6 | Botón salir de la aplicación no funciona | ✅ 02/06/2026 |
| B7 | Objetivos sin fecha límite no generan cuota mensual automática | ✅ 02/06/2026 |
| M6 | Error no controlado al cargar extracto con divisa inexistente | ✅ 02/06/2026 |
| N1 | Renombrar "Transferencias" → "Traspasos" + contador de items | ✅ 02/06/2026 |
| BK1 | RulesEditorModal: toast invisible al eliminar regla (zIndex) *(ver 06_BACKLOG.md)* | ✅ 02/06/2026 |
| BK2 | RulesEditorModal: falta confirmación antes de borrar regla *(ver 06_BACKLOG.md)* | ✅ 02/06/2026 |
| Extra | Edición de traspasos — botón ✏️ faltaba en la lista de traspasos | ✅ 02/06/2026 |

### 📱 Incluidos en FASE 4

| ID | Descripción |
|---|---|
| U1–U5 | Mejoras UX navegación (sticky cards, barras con importes, Enter en borrado, entidad en desplegables, salir sin guardar) |
| M1–M5 | Mejoras movimientos/extractos (búsqueda avanzada, borrado masivo, origen de movimiento, confirmación pre-import, deshacer descarte) |
| C1 | Coherencia de KPIs en headers entre pestañas |
| C2 | "Ver movimientos" desde hipoteca redirige mal (verificar si bug o comportamiento esperado) |
| C3 | Cuentas remuneradas: control de ganancia/pérdida real |
| A1 | Alertas inteligentes de saldos anómalos |
| A2 | Notificaciones push/email de proyecciones *(al final de Fase 4 — analizar juntos antes de implementar)* |
| N2 | Abreviatura e icono en lista de bancos |
| P1 | Buzón de sugerencias integrado |
| BK3 | AmortizationFormModal: mensaje técnico confuso *(ver 06_BACKLOG.md)* |
| D1 | Modal de alertas críticas al arrancar (solo severity alta, condicional — sin modal blindness) |
| D2 | Selector de pestaña de inicio en "Configuración regional" (persiste en localStorage) |
| D3 | Badge semántico en pestaña Alertas con color por severidad máxima activa |

### 🔮 Post-lanzamiento

| ID | Descripción |
|---|---|
| P2 | Contadores de uso opt-in (requiere validación de que el mercado lo acepta bien con el posicionamiento de privacidad) |

---

## 🔴 Bugs / Errores graves (prioridad alta)

### B1 — Error grave en cuota mensual de hipoteca/préstamo · **[AHORA]**
Al aplicar la cuota mensual, el sistema descuenta el importe **total** de la cuota (capital + intereses) en lugar de solo el capital. Aunque sea orientativo, debería calcularse correctamente separando ambos componentes.

### B2 — Error en verificación de email de seguridad · **[AHORA]**
Dos problemas detectados:
1. El email de verificación lo recibe el **administrador** en lugar del usuario — comportamiento incorrecto.
2. El tiempo para introducir el código es **1 minuto** en la app, pero el email indica **10 minutos** — inconsistencia.
Requiere revisión completa de la funcionalidad de recuperación de seguridad.

### B3 — Panel de Administrador no accesible desde URL de producción · **[AHORA]**
No se puede acceder a la funcionalidad de Administrador desde la URL de producción. Hay que identificar el motivo (¿guard de entorno? ¿ruta no publicada?).

### B4 — Control de viabilidad cuota vs plazo en préstamos · **[AHORA]**
Al introducir el importe de la cuota y los plazos/fecha de finalización, el sistema no comprueba si esa cuota es suficiente para cubrir el préstamo en el tiempo restante. Hay que añadir validación o recalcular la cuota automáticamente cuando los parámetros son inconsistentes.

### B5 — Modal de Carga de Movimientos Bancarios · **[AHORA]**
Cuando se elige a partir de qué línea hay que coger registros, sólo presenta 30 líneas y en ocasiones empieza más abajo. Ampliar a 50 líneas como mínimo.

### B6 — Botón de salir de la aplicación · **[AHORA]**
No funciona bien ya que no hace nada.

### B7 — Creación de objetivos automáticos · **[AHORA]**
Si no ponemos fecha límite el sistema no propone ninguna cantidad a cargar automáticamente. Debería proponer que se definiese la cantidad que quieres traspasar o cargar cada mes, dado que cuando se pone una fecha límite el sistema lo genera automáticamente.

---

## 🟠 UX / Navegación

### U1 — Sticky cards en scroll por pestaña · **[FASE 4]**
Mantener las cards principales de cada pestaña visibles al hacer scroll, para conservar un mínimo de información de contexto siempre visible (resumen/KPIs).

### U2 — Progresión de gastos: mostrar cantidades además de barras · **[FASE 4]**
Actualmente se ve la barra de progresión pero no las cantidades gastadas hasta la fecha. Mostrar el importe consumido junto a la barra.
*(Ver captura adjunta en la conversación de 31/05/2026)*

### U3 — Botón "Eliminar" activo con Enter en confirmación de borrado · **[FASE 4]**
Al borrar movimientos, el sistema pide confirmación pero al pulsar Enter no ejecuta ninguna acción. El botón "Eliminar" debería activarse con Enter — aunque es menos seguro, es más intuitivo. Evaluar bien el trade-off (quizás solo si el foco está en el botón).

### U4 — Lista de cuentas en desplegables: mostrar entidad bancaria · **[FASE 4]**
En los desplegables de selección de cuenta, mostrar la entidad bancaria antes del nombre de la cuenta (o su abreviatura) para identificarla más fácilmente.

### U5 — Opción de salir sin guardar los datos de la sesión · **[FASE 4]**
Permitir salir de la aplicación descartando todos los cambios introducidos en la sesión actual, para poder recuperarse de errores de entrada de datos sin tener que corregirlos uno a uno.

---

## 🟠 Movimientos / Extractos bancarios

### M1 — Búsqueda y filtros avanzados de movimientos · **[FASE 4]**
Poder buscar movimientos por múltiples criterios: concepto con comodines (`*`), importes (rango), fecha, cuenta, categoría, etc.

### M2 — Borrado masivo de movimientos seleccionados · **[FASE 4]**
Al seleccionar múltiples movimientos, poder borrarlos de golpe con confirmación doble (para evitar borrados accidentales).

### M3 — Indicador de origen de movimiento (cargado vs. manual) · **[FASE 4]**
Diferenciar visualmente si un movimiento ha sido importado desde un extracto bancario o introducido manualmente por el usuario.

### M4 — Panel de confirmación final al cargar extracto · **[FASE 4]**
Antes de importar definitivamente un extracto, mostrar un resumen de los movimientos que se van a cargar: cuántos, en qué cuenta y en qué entidad. Permite revisar y confirmar antes de ejecutar.

### M5 — Movimiento descartado en extracto no recuperable · **[FASE 4]**
Al cargar un extracto, si el sistema detecta un duplicado y el usuario lo descarta, ya no puede volver a seleccionarlo si cometió un error. Hay que permitir deshacer el descarte.

### M6 — Carga de extracto con divisa inexistente · **[AHORA]**
Verificar qué ocurre cuando se intenta cargar un extracto con una divisa que no existe en el sistema. Puede ser un caso de error no controlado que tire la app.

---

## 🟠 Cuentas / Saldos

### C1 — Revisión de saldos en headers de todas las pestañas · **[FASE 4]**
Revisar que los KPIs de los headers de cada pestaña usan criterios consistentes: qué cuentas incluyen, si usan fecha de apunte o fecha de valor, y qué rango temporal aplican. Actualmente parece que cada pestaña toma referencias distintas.

### C2 — Botón "ver movimientos" desde hipoteca lleva a cuenta principal · **[FASE 4]**
Al pulsar el botón de ver movimientos desde la tarjeta de una hipoteca/préstamo, redirige a la cuenta principal en lugar de filtrar los movimientos de esa cuenta. Verificar si es comportamiento esperado o bug (puede ser trivial — investigar al tocar la vista de cuentas en Fase 4).

### C3 — Cuentas con remuneración: control de ganancia/pérdida · **[FASE 4]**
Para cuentas remuneradas, el balance incluye la inversión. Añadir algún mecanismo para ver la ganancia/pérdida real: diferencia entre los ingresos reales recibidos y el capital invertido. Requiere análisis de diseño.

---

## 🟡 Alertas / Notificaciones

### A1 — Alertas inteligentes de saldos anómalos · **[FASE 4]**
Detectar situaciones sospechosas automáticamente:
- Saldos muy altos con ingresos medios bajos (posible error de entrada).
- Ingresos/gastos que suenan exagerados en proporción al número total de cuentas y patrimonio registrado.

### A2 — Envío de avisos de proyecciones por email o móvil · **[FASE 4 — final, analizar juntos]**
Los avisos generados por el módulo de proyecciones deberían poder enviarse al email o al móvil del usuario (notificaciones push o email). Analizar juntos al final de Fase 4 antes de implementar: implicaciones de infraestructura, coste, privacidad y complejidad.

---

## 🟡 Navegación / Pestañas

### N1 — Pestaña "Transferencias" → renombrar a "Traspasos" + contador · **[AHORA]**
La pestaña de transferencias debería llamarse "Traspasos" (término más preciso en español financiero). Además, le falta el contador de transacciones que muestran otras pestañas. Fix de texto i18n + lógica de contador.

### N2 — Abreviatura e icono en lista de bancos · **[FASE 4]**
En la lista de entidades bancarias, incluir la abreviatura oficial del banco además del icono (que habría que conseguir en formato adecuado).

---

## 🟡 Comunidad / Producto

### P1 — Buzón de sugerencias integrado · **[✅ IMPLEMENTADO — A4 sesión 46]**
Permitir al usuario enviar sugerencias de mejora directamente desde la aplicación a un buzón genérico del administrador/fundador. Puede reutilizar la infraestructura Web3Forms existente.
- ✅ Hecho (sesión 46): `FeedbackModal` vía Web3Forms, accesible desde header desktop + menú móvil.
- 🔜 **Pendiente de integración:** ahora es un icono/acción aparte. Debería ir **dentro del Centro de Ayuda**, no como botón suelto. Se hará cuando se revise el Centro de Ayuda por completo.

### P2 — Contadores de uso opt-in · **[POST-LANZAMIENTO]**
Implementar contadores de utilización por sección/funcionalidad. Completamente opt-in: el usuario solo los envía si decide compartirlos explícitamente, para identificar qué funcionalidades son más usadas y cuáles no. Requiere validación previa de que el posicionamiento de privacidad radical del producto no genera fricción con esta feature.

---
