# 08 — MEJORAS FUTURAS

> Lista de mejoras identificadas para la aplicación, pendientes de priorizar y asignar a fase.
> No son bugs ni deuda técnica estructural (eso va en `06_BACKLOG.md`) — son funcionalidades y UX improvements detectados en uso real.
> Última actualización: 31/05/2026

---

## Cómo usar este archivo

- **Al identificar una mejora:** añadirla aquí con descripción breve y categoría.
- **Al priorizar:** mover a `01_ROADMAP.md` dentro de la fase correspondiente.
- **Al implementar:** registrar en `05_SESSION_LOG.md` como parte de la sesión.
- **Prioridades:** se revisan periódicamente. Los marcados 🔴 son bugs o errores graves.

---

## 🔴 Bugs / Errores graves (prioridad alta)

### B1 — Error grave en cuota mensual de hipoteca/préstamo
Al aplicar la cuota mensual, el sistema descuenta el importe **total** de la cuota (capital + intereses) en lugar de solo el capital. Aunque sea orientativo, debería calcularse correctamente separando ambos componentes.

### B2 — Error en verificación de email de seguridad
Dos problemas detectados:
1. El email de verificación lo recibe el **administrador** en lugar del usuario — comportamiento incorrecto.
2. El tiempo para introducir el código es **1 minuto** en la app, pero el email indica **10 minutos** — inconsistencia.
Requiere revisión completa de la funcionalidad de recuperación de seguridad.

### B3 — Panel de Administrador no accesible desde URL de producción
No se puede acceder a la funcionalidad de Administrador desde la URL de producción. Hay que identificar el motivo (¿guard de entorno? ¿ruta no publicada?).

### B4 — Control de viabilidad cuota vs plazo en préstamos
Al introducir el importe de la cuota y los plazos/fecha de finalización, el sistema no comprueba si esa cuota es suficiente para cubrir el préstamo en el tiempo restante. Hay que añadir validación o recalcular la cuota automáticamente cuando los parámetros son inconsistentes.

---

## 🟠 UX / Navegación

### U1 — Sticky cards en scroll por pestaña
Mantener las cards principales de cada pestaña visibles al hacer scroll, para conservar un mínimo de información de contexto siempre visible (resumen/KPIs).

### U2 — Progresión de gastos: mostrar cantidades además de barras
Actualmente se ve la barra de progresión pero no las cantidades gastadas hasta la fecha. Mostrar el importe consumido junto a la barra.
*(Ver captura adjunta en la conversación de 31/05/2026)*

### U3 — Botón "Eliminar" activo con Enter en confirmación de borrado
Al borrar movimientos, el sistema pide confirmación pero al pulsar Enter no ejecuta ninguna acción. El botón "Eliminar" debería activarse con Enter — aunque es menos seguro, es más intuitivo. Evaluar bien el trade-off (quizás solo si el foco está en el botón).

### U4 — Lista de cuentas en desplegables: mostrar entidad bancaria
En los desplegables de selección de cuenta, mostrar la entidad bancaria antes del nombre de la cuenta (o su abreviatura) para identificarla más fácilmente.

### U5 — Opción de salir sin guardar los datos de la sesión
Permitir salir de la aplicación descartando todos los cambios introducidos en la sesión actual, para poder recuperarse de errores de entrada de datos sin tener que corregirlos uno a uno.

---

## 🟠 Movimientos / Extractos bancarios

### M1 — Búsqueda y filtros avanzados de movimientos
Poder buscar movimientos por múltiples criterios: concepto con comodines (`*`), importes (rango), fecha, cuenta, categoría, etc.

### M2 — Borrado masivo de movimientos seleccionados
Al seleccionar múltiples movimientos, poder borrarlos de golpe con confirmación doble (para evitar borrados accidentales).

### M3 — Indicador de origen de movimiento (cargado vs. manual)
Diferenciar visualmente si un movimiento ha sido importado desde un extracto bancario o introducido manualmente por el usuario.

### M4 — Panel de confirmación final al cargar extracto
Antes de importar definitivamente un extracto, mostrar un resumen de los movimientos que se van a cargar: cuántos, en qué cuenta y en qué entidad. Permite revisar y confirmar antes de ejecutar.

### M5 — Movimiento descartado en extracto no recuperable
Al cargar un extracto, si el sistema detecta un duplicado y el usuario lo descarta, ya no puede volver a seleccionarlo si cometió un error. Hay que permitir deshacer el descarte.

### M6 — Prueba de carga de extracto en divisa inexistente
Verificar qué ocurre cuando se intenta cargar un extracto con una divisa que no existe en el sistema. Puede ser un caso de error no controlado.

---

## 🟠 Cuentas / Saldos

### C1 — Revisión de saldos en headers de todas las pestañas
Revisar que los KPIs de los headers de cada pestaña usan criterios consistentes: qué cuentas incluyen, si usan fecha de apunte o fecha de valor, y qué rango temporal aplican. Actualmente parece que cada pestaña toma referencias distintas.

### C2 — Botón "ver movimientos" desde hipoteca lleva a cuenta principal
Al pulsar el botón de ver movimientos desde la tarjeta de una hipoteca/préstamo, redirige a la cuenta principal en lugar de filtrar los movimientos de esa cuenta. Verificar si es comportamiento esperado o bug.

### C3 — Cuentas con remuneración: control de ganancia/pérdida
Para cuentas remuneradas, el balance incluye la inversión. Añadir algún mecanismo para ver la ganancia/pérdida real: diferencia entre los ingresos reales recibidos y el capital invertido. Requiere análisis de diseño.

---

## 🟡 Alertas / Notificaciones

### A1 — Alertas inteligentes de saldos anómalos
Detectar situaciones sospechosas automáticamente:
- Saldos muy altos con ingresos medios bajos (posible error de entrada).
- Ingresos/gastos que suenan exagerados en proporción al número total de cuentas y patrimonio registrado.

### A2 — Envío de avisos de proyecciones por email o móvil
Los avisos generados por el módulo de proyecciones deberían poder enviarse al email o al móvil del usuario (notificaciones push o email).

---

## 🟡 Navegación / Pestañas

### N1 — Pestaña "Transferencias" → renombrar a "Traspasos" + contador
La pestaña de transferencias debería llamarse "Traspasos" (término más preciso). Además, le falta el contador de transacciones que muestran otras pestañas.

### N2 — Abreviatura e icono en lista de bancos
En la lista de entidades bancarias, incluir la abreviatura oficial del banco además del icono (que habría que conseguir en formato adecuado).

---

## 🟡 Comunidad / Producto

### P1 — Buzón de sugerencias integrado
Permitir al usuario enviar sugerencias de mejora directamente desde la aplicación a un buzón genérico del administrador/fundador.

### P2 — Contadores de uso opt-in
Implementar contadores de utilización por sección/funcionalidad. Completamente opt-in: el usuario solo los envía si decide compartirlos explícitamente, para identificar qué funcionalidades son más usadas y cuáles no.

---
