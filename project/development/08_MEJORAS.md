# 08 — MEJORAS FUTURAS

> Lista de mejoras identificadas para la aplicación, pendientes de priorizar y asignar a fase.
> No son bugs ni deuda técnica estructural (eso va en `06_BACKLOG.md`) — son funcionalidades y UX improvements detectados en uso real.
> Última actualización: 07/07/2026 (s.67 — +O5: portada de bienvenida personalizada, pulido no bloqueante)

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

## 🆕 STAGING — Tanda de mejoras del founder (19/06/2026, sesión 57)

> **Registradas, pendientes de análisis (programado para 20/06/2026).** No clasificar a fase definitiva ni asignar IDs finales hasta analizarlas una a una. Las clasificaciones [AHORA]/[FASE 4]/etc. de abajo son **provisionales**.
> Se conservan los 5 buckets mentales del founder. Las referencias cruzadas a IDs/commits existentes están marcadas.

### Decisiones cerradas en esta sesión

- **🔁 B6 reabierto — Botón salir:** figuraba ✅ (02/06/2026) pero el founder confirma que sigue muerto y confunde. **Cambio de pedido: de "arreglar" a QUITAR.** En PWA no existe; en PC no salva nada (datos ya persistidos en localStorage cifrado + Drive). El único valor sería bloquear la sesión, que ya hace el candado → redundante. Verificar en código antes de tocar. *(Argumento contrario: un "Salir y bloquear" explícito tranquiliza al usuario pro-privacidad; si quitarlo deja el lock poco visible, valorar renombrar el candado.)*
- **🔁 Onboarding — deroga la espera de testers (s.53):** la decisión previa era "NO rediseñar con n=1". El founder lo ha visto fallar en **varios testers informales** → el onboarding **no cumple el objeto de la app**. **Nueva decisión: se retoca y pasa a BLOQUEANTE de beta.** Análisis de diseño mañana. Pendiente: actualizar la tabla de estado de `01_ROADMAP.md` y `CLAUDE.md` cuando se cierre el diseño.
- **Passwords / Licencias → `09_BETA_READINESS.md`:** no son mejoras UX, son gates de readiness (licencias ya consta como gate de Fase 6). Se referencian aquí pero viven allí. Preocupación concreta del founder a auditar: *"¿alguien puede identificar fácilmente la master password? ¿Drive cambia la protección?"* — marco preliminar: la password no se almacena (PBKDF2 200-250K); a Drive solo sube el vault ya cifrado, no la contraseña; riesgos reales a revisar = autocompletado de navegador, fuerza bruta local, frase de recuperación.

### Bucket 1 — Corto plazo

| ID prov. | Descripción | Clasif. prov. | Nota |
|---|---|---|---|
| **B8** | Click fuera del modal cierra **Ajustes** (y la **lista completa de divisas**) con pérdida de lo introducido | [AHORA] · bug UX | Acotar a modales con datos editables — el cierre por backdrop es convención esperada en otros |
| **B6** | Quitar botón salir (ver decisión arriba) | [AHORA] | — |
| **U6** | Reordenar los iconos de set-up: hoy no tienen orden lógico | [FASE 4] · UX | — |
| **B9** | Onboarding abierto **desde el Centro de Ayuda** invade toda la barra de estado del iPhone (no pasa abriéndolo desde el inicio) | [AHORA] · bug iOS | Safe-area / containing block — primo del fix de portales de s.56, pero distinto |
| **C4** | Selector **por cuenta** en el Calendario: hoy se mezclan conceptos de distintas cuentas (aunque al entrar en un día sí indica la cuenta afectada) | [FASE 4] · feature | — |
| *(ajuste)* | Tarjeta "¿Cómo vas este mes?" con desplegable de proyecciones: **ya hecho (`46f829f`, s.54) pero ahora muestra demasiada info** → simplificar | [FASE 4] · refinamiento | No es nuevo: ajuste de lo entregado en s.54 |
| **M7** | Cargar extractos arrastrando ficheros con el ratón desde otras apps (drag & drop) en vez de buscarlos | [FASE 4] · UX | — |
| **M8** | **Import — replantear formatos predefinidos.** El formato CaixaBank que implantamos **no funciona**. Propuesta del founder: **no tener formatos predefinidos** (cambian) → presentar el archivo en pantalla y que el usuario lo defina | 🔬 análisis | Argumento contrario: perderíamos el "0-fricción" para bancos comunes. A discutir |
| **M9** | La mayoría de bancos bajan **Excel** → rutina propia de conversión Excel→CSV (que el usuario no tenga que abrir y guardar como CSV) | 🔬 análisis | — |
| **M10** | A veces vienen **dos descripciones** en un movimiento → ¿la 2ª a Notas? Cómo gestionarlo | [FASE 4] · diseño | — |

### Bucket 2 — Medio plazo

| ID prov. | Descripción | Clasif. prov. | Nota |
|---|---|---|---|
| **M11** | Al asignar categoría manualmente a un movimiento importado, **actualizar automáticamente las reglas** de esa categoría para que la próxima vez se autoclasifique | 🔬 análisis | Muy alineado con "manejabilidad" |
| **C3-ext** | **Planes de ahorro: separar aportaciones vs revalorización.** Aportación = calculada desde los ingresos directos; revalorización = diferencia entre saldo y aportaciones. Además **timing de aportaciones** (llegan con decalaje respecto a la nómina) → introducir un **TIPO de confirmación** de movimiento (confirmado/pendiente) y seguimiento de lo pendiente | 🔬 análisis | Extiende **C3** (cuentas remuneradas: ganancia/pérdida real). El concepto "movimiento pendiente/confirmado" es **transversal** (afecta proyecciones, calendario, saldos) — posible pata de profundidad funcional |
| → `09` | Revisión completa de **Passwords** (sistema profesional para salir a la venta) | gate | Ver decisión arriba |
| → `09` | Revisión completa de **Licencias** (sistema profesional para salir a la venta) | gate (Fase 6) | Ya registrado como gate de producción pública |

### Bucket 3 — Pre-producción

| ID prov. | Descripción | Clasif. prov. | Nota |
|---|---|---|---|
| **P1-ext** | Revisar **todos los textos** del Manual, FAQ, etc. + **revisión completa del Centro de Ayuda** | pre-prod | Engancha con P1 (el buzón de sugerencias debe integrarse dentro del Centro de Ayuda al revisarlo) |

### Bucket 4 — Post-producción

| ID prov. | Descripción | Clasif. prov. | Nota |
|---|---|---|---|
| *(idea)* | ¿Leer las notificaciones de los bancos y generar un movimiento automáticamente? | [POST-LANZAMIENTO] | **El propio founder se autorresponde que probablemente NO** (exigiría la app ejecutándose siempre). Se deja anotado para pensar |

### Bucket 5 — Onboarding (rediseño — bloqueante de beta)

> Bloque estratégico. Deroga la espera de testers (ver decisión arriba). Diseño a analizar mañana.

| ID prov. | Descripción |
|---|---|
| **O1** | Quitar la activación de la seguridad durante el onboarding (el founder cree que no tiene sentido ahí) |
| **O2** | Redefinir la **verdadera utilidad** de la app y comunicarla en el onboarding de entrada. Con info básica la app ya debería ser útil. Set-up mínimo = **crear una cuenta + crear proyecciones + subir movimientos** |
| **O3** | Eliminar la **creación de un objetivo** como paso del set-up del onboarding |
| **O4** | Crear una **guía de funcionalidad amplia y profesional** (estilo de los HTML ya creados), con pantallas y casos de ejemplo, cubriendo: set-up/Ajustes · multi-device (Drive) vs mono-device y cómo se hace · multi-divisa · **Funcionalidad estándar** (Resumen: qué es y cómo se lee · Proyecciones: la funcionalidad estrella · Tendencias · Objetivos · Informes…) · casos de ejemplo · **Funciones avanzadas** (Traspasos: para qué y cómo · interpretar tendencias · Centro de ayuda y sugerencias) |
| **O5** | **Portada de bienvenida al entrar** (idea founder 07/07/2026). Al abrir/desbloquear la app, pantalla de portada con **logo + nombre en grande** (`BrandLogo`/`BrandWordmark` ya existen) y saludo personalizado: *"Bienvenido de nuevo, {nombre}. Tu última conexión fue el {fecha}…"*. **Comportamiento (decidido con founder):** se **auto-desvanece sola tras varios segundos** y el usuario puede **desactivarla** (toggle en Ajustes). **Requiere:** (a) pedir el **nombre del usuario en el onboarding** (nuevo dato, persistido **solo local-first**) y (b) guardar **timestamp de última conexión**. **Copy obligatorio al pedir el nombre:** dejar claro que *es solo para ti, no se guarda ni se envía a ningún sitio, únicamente sirve para dirigirnos a ti* (coherente con el norte de privacidad). **Clasif.: pulido, NO bloqueante** — "quizás quede chula en la beta, no es muy importante" (founder). Depende de O1-O4 (captura de nombre encaja en el rediseño de onboarding). ⚠️ Argumento contrario: una portada intersticial **añade fricción/1 tap extra** en cada arranque frente al norte de "sencillez y manejabilidad" → mitigado por el auto-desvanecido + el toggle de desactivación |
| **O6** | **Cablear el logo en las pantallas donde falta** (observación founder 07/07/2026). El logo **ya sale** en la pantalla de desbloqueo (`LockScreen.tsx:224`, `step==='unlock'`), pero el founder lo ve ausente en: (a) la(s) **pantalla(s) de contraseña del set-up / otros pasos del lock** (crear password en onboarding → `SecuritySetup`, y pasos `new-password`/recuperación del `LockScreen`), y (b) la **pantalla final de onboarding con las primeras opciones + Términos y Condiciones**. Añadir `BrandLogo`/`BrandWordmark` en esas vistas. **Extra:** en la pantalla de contraseña, mostrar también el **nombre del usuario** (encaja con O5). **Clasif.: pulido de marca, barato, NO bloqueante.** ⚠️ Verificar antes de tocar cuál es exactamente cada vista sin logo (auditar `SecuritySetup.tsx`, estados de `LockScreen.tsx`, la vista de T&C/primeras opciones — ¿`GettingStarted`/`LicenseScreens`?) |

---
