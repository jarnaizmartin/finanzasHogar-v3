# 08 — MEJORAS FUTURAS

> Lista de mejoras identificadas para la aplicación, pendientes de priorizar y asignar a fase.
> No son bugs ni deuda técnica estructural (eso va en `06_BACKLOG.md`) — son funcionalidades y UX improvements detectados en uso real.
> Última actualización: 24/07/2026 (s.76 — 10 mejoras del founder en uso real de producción; 2 son bugs confirmados leyendo el código: B10 informe + parte de C5)

---

## 🆕 Anotado en s.69 (prueba del founder) — REVISAR en s.70

### O7 — El nombre como PRIMERA pregunta del onboarding, en tono de diálogo
- Hoy (O5, s.69) el nombre es un campo más al final de la bienvenida.
- **El founder quiere:** que el nombre sea **la primera pregunta** del onboarding y esté enmarcado como el **inicio de un diálogo** que dura toda la vida de uso de la app. Copy tipo *"¿Cómo quieres que me dirija a ti?"* / *"¿Con qué nombre quieres que hablemos?"* (afinar).
- Implica: mover el campo de nombre al principio del flujo (¿pantalla propia antes de idioma/divisa?), cambiar el copy a 1ª persona conversacional, y usar ese nombre de forma coherente en los saludos (portada, lock, coachmarks).
- Encaja con O5/O6 ya hechos (`fh_user_name`, `WelcomeSplash`). Clasif.: UX onboarding, no bloqueante.

### 🔴 BUG — CoachMark en móvil se sale de la pantalla / no se lee ni se puede desplazar
- **Síntoma (2 capturas del founder, iPhone, arranque):**
  1. En **Movimientos**: el coachmark ("…'+ Nuevo movimiento'.") aparece **cortado por arriba**, pegado al notch/status bar → **no se lee el título**; solo se ve el final del texto y el botón "¡Entendido!".
  2. En **Resumen** ("Aquí está tu dinero real"): el coachmark queda **flotando en el centro** tapando la tarjeta de configuración; su flecha apunta a un elemento (la tarjeta de saldo real) que está **fuera de vista abajo**, y **no se puede desplazar** la pantalla para verlo (el coachmark bloquea el scroll).
- **Causa probable:** el posicionamiento del `CoachMark`/`useCoachMark` calcula la posición respecto al elemento objetivo **sin (a) clamplearse al viewport** (se corta arriba) ni **(b) hacer `scrollIntoView` del objetivo** antes de abrir; y además **bloquea el scroll** mientras está abierto → el usuario no puede traer el objetivo a la vista.
- **Fix a diseñar (s.70):** antes de mostrar el coachmark, hacer `scrollIntoView({block:'center'})` del target; clampear la tarjeta del tooltip a los márgenes seguros (safe-area top/bottom, evitar el notch y la BottomNav); si el target no cabe/está oculto, reposicionar (arriba↔abajo) o degradar a tooltip centrado sin flecha. Revisar `src/components/CoachMark.tsx` + `useCoachMark`.
- Prioridad: **alta** — afecta a la 1ª experiencia real en móvil (los coachmarks de arranque del bucle). No bloquea el resto de pruebas pero sí la comunicación de valor.

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

### P3 — Enlaces a redes sociales en la app · **[FASE 4 / beta]**
Incluir en algún lugar de la app los enlaces a **todas las redes con presencia** (Instagram, Reddit, YouTube, X, TikTok, Facebook, LinkedIn — cuentas ya creadas y con el logo nuevo, s.67). Ayuda a comunidad/descubrimiento en la beta.
- **Ubicación sugerida:** dentro del **Centro de Ayuda** (o "Acerca de" / pie de Ajustes), **NO** en el dashboard principal (no ensuciar la vista de trabajo). Fila de iconos que abren en el navegador (`target="_blank"`, `rel="noopener noreferrer"`).
- ⚠️ **Coherencia con privacidad (Regla 2):** son **enlaces planos**, nada de SDKs/pixels/embeds incrustados → no rompen el local-first ni el "cero tracking". Un embed de feed sí lo rompería → evitarlo.
- **Datos a centralizar:** una sola constante con los handles/URLs (p. ej. `src/config/social.ts`) para reutilizar en la web de invitación (`public/beta-*.html`) y evitar duplicar.

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

## 🆕 Mejoras del founder (08/07/2026, sesión 68)

> Anotadas al cierre de la s.68 para no perderlas. Sin analizar ni clasificar a fase todavía.

| ID prov. | Descripción |
|---|---|
| **S1** | **Resumen — drill-down por concepto.** En la hoja de Resumen, la función que despliega la planificación y lo gastado del mes **por concepto (categoría)** debería tener, **por cada concepto, un botón/acción que abra un pop-up** con el **detalle**: tanto lo **planificado** como los **movimientos reales detallados** que ha habido ese mes en ese concepto. Referencia: extiende el "Ver detalle del mes" (`46f829f`, s.54) que despliega `ProjectedVsReal` (proyectado vs real por categoría, `src/views/ProjectedVsReal.tsx`). ⚠️ El pop-up = modal por **portal a `document.body`** (patrón anti-pantalla-negra). |

---

## 🆕 Tanda del founder en uso real de producción (24/07/2026, sesión 76)

> 10 mejoras vistas por el founder usando la app publicada. **Analizadas y desarrolladas por el asistente en rol de experto** (fintech + UX), con argumento contrario donde toca (Regla 2). Clasificación provisional.
> **Filtradas por el norte:** ¿esto acerca a "la mejor UX del mundo por sencillez, manejabilidad y privacidad"?
> ⚠️ **Dos de estos NO son mejoras, son bugs confirmados leyendo el código** (verificado en s.76, no supuesto): **B10** (totales del informe) y la mitad de **C5** (los saldos de Movimientos no reconcilian con Cuentas). Van marcados 🔴.

### 🧭 Hallazgo de análisis: los puntos 1 y 5 del founder son **la misma feature**

El founder pidió por separado (1) "un saldo acumulado al lado de cada movimiento, como los bancos, para ver discrepancias" y (5) "los saldos de la pestaña Movimientos no cuadran con el saldo de la pestaña Cuentas". **Son la misma cosa vista desde dos lados.** Hoy la cabecera de Movimientos (`RealExpenses.tsx:316-338`) calcula `totalIncome`, `totalExpense` y un "saldo real" = `totalIncome − totalExpense` sobre los movimientos **filtrados**, y **nunca** suma el **saldo inicial de la cuenta** (`account.balance`/`account.date`). Por eso ese número es un **flujo neto**, no un **saldo**, y no puede coincidir con Cuentas. La solución de C5 (saldo acumulado sembrado con el saldo inicial) hace que el **último acumulado == saldo de la cuenta en Cuentas** → se auto-reconcilia y de paso entrega el "saldo corrido estilo banco" del punto 1. Por eso se documentan juntos (**M12 + C5**).

### 🔴 Bugs confirmados (subir a prioridad de bug, no de "mejora futura")

#### B10 — Los totales del **Informe de movimientos** suman en vez de netear · **[AHORA] · 🔴 BUG CONFIRMADO**
- **Síntoma (founder):** "los totales están mal, suma todo en lugar de sumar ingresos y restar gastos; así es una suma aritmética sin valor."
- **Causa (verificada en código, s.76):** en `src/components/reports/MovementsReport.tsx`, la fila `<tfoot>` TOTAL pinta `fmt(totals.realIncome + totals.realExpense)` y `fmt(totals.pIncome + totals.pExpense)`. Los gastos se almacenan en **positivo** (`computeTotals` en `src/lib/reportsCalc.ts:145` reduce importes de tipo `expense` sin signo), así que la suma junta ingresos y gastos. El valor correcto es el **neto**: `realIncome − realExpense` y `pIncome − pExpense` (ya existe `totals.realNet` calculado bien en la misma librería, línea 165).
- **Fix:** usar el neto en las dos celdas del footer (o reutilizar `totals.realNet`). **Trivial**, pero **con test** en `MovementsReport.test.tsx` (que hoy no cubre el footer → por eso el bug pasó, misma lección que la s.73-75: los tests prueban `lib`, no la UI). Familia del bug de traspasos que inflaban ingresos/gastos (s.58).
- **Argumento contrario:** ninguno; es incorrecto. Único matiz de diseño: decidir si el footer muestra **neto** (recomendado) o **dos subtotales separados** (ingresos / gastos) — probablemente **ambos**: subtotal ingresos, subtotal gastos y neto, que es lo que un financiero espera.

### 🟠 Movimientos (lista y saldos)

#### M12 — Saldo **acumulado** por movimiento, estilo extracto bancario · **[FASE 4] · feature (núcleo)**
- **Qué:** una columna de **saldo corrido** junto a cada movimiento, para detectar discrepancias contra el extracto real del banco de un vistazo (el flujo mental del usuario de 15 años).
- **Condición de sentido (importante):** un saldo acumulado **solo es coherente con UNA cuenta seleccionada y UNA divisa**. Mezclar cuentas/divisas produce una columna sin significado. → La columna aparece **solo cuando hay una cuenta concreta filtrada**; con "Todas" se oculta (o se muestra deshabilitada con un aviso).
- **Semilla:** el acumulado arranca en el **saldo inicial de la cuenta** y se recalcula en **orden cronológico ascendente** (aunque la lista se muestre descendente). Reutilizar la lógica ya existente en `src/lib/balanceCalc.ts` (calcula el saldo de una cuenta a partir de inicial + movimientos) para no duplicar la fórmula ni arriesgar divergencias.
- **Pago doble:** el último acumulado **coincide con el saldo de la pestaña Cuentas** → cierra también **C5**.
- **Argumento contrario (Regla 2):** añade densidad visual a una tabla ya cargada en móvil. Mitigación: columna **opcional/colapsable** y solo con cuenta única; en móvil quizá como dato secundario dentro de cada fila, no columna.

#### C5 — 🔴 Los saldos de la cabecera de **Movimientos** no reconcilian con **Cuentas** · **[AHORA-revisar] · bug de concepto + presentación**
- **Síntoma (founder):** "el balance final de Movimientos debería coincidir con el de la cuenta en la pestaña Cuentas y no lo hace."
- **Causa (verificada, s.76):** la cabecera muestra `totalIncome − totalExpense` de los movimientos filtrados (`RealExpenses.tsx:527-537`, etiqueta `realExpenses.stats.realBalance` = "saldo real"). Es un **flujo**, no un **saldo**: no incluye el saldo inicial de la cuenta y depende del filtro de fechas. Llamarlo "saldo real" es **engañoso**.
- **Fix de diseño (elegir con el founder):**
  - (a) **Contextual:** con **una cuenta** seleccionada → mostrar su **saldo real** (inicial + movimientos, vía `balanceCalc`) y ofrecer la columna acumulada de **M12**. Con **"Todas"** → renombrar el KPI a **"Flujo del periodo"** (ingresos − gastos), dejando claro que NO es un saldo. Recomendado.
  - (b) Mínimo: renombrar la etiqueta a "Flujo neto (periodo)" y quitar la palabra "saldo" para no prometer reconciliación que no existe.
- **Enlaza con:** C1 (revisión de KPIs de cabeceras entre pestañas — mismo problema de criterios inconsistentes) y **M12**.

#### M13 — Descargar la lista de movimientos a **CSV según los filtros activos** · **[FASE 4] · UX (barato)**
- **Qué:** botón de exportar CSV en la pestaña Movimientos que respete los **filtros elegidos ahí** (cuenta, categoría, tipo, rango de fechas).
- **Infra ya existe:** `buildMovementsCsv(...)` + `downloadCsv(...)` ya se usan en `Reports.tsx:119-130` (el Informe exporta por **periodo**). La mejora es **exponer lo mismo en Movimientos** pasándole el array `filtered` de esta vista en lugar del periodo. Reutilización casi directa → coste bajo.
- **Coherencia con privacidad:** exportar CSV local no rompe nada (el usuario descarga sus propios datos en su dispositivo). ✅

#### M14 — Ordenar movimientos **ascendente/descendente** · **[FASE 4] · UX**
- Hoy la lista va fija a descendente por fecha (`RealExpenses.tsx:310`, `.sort((a,b)=>b.entryDate.localeCompare(a.entryDate))`). Añadir un toggle de orden. **Prerrequisito natural de M12** (el acumulado se lee mejor en ascendente). Considerar ordenar también por importe (enlaza con la búsqueda avanzada M1).

#### M15 — Botón "**ir al primer movimiento**" (subir al inicio) con listas largas · **[FASE 4] · UX**
- **Qué:** con muchos movimientos, un botón flotante para volver arriba (el founder nota que `Ctrl+Inicio` ya funciona, pero falta el equivalente táctil/visible, sobre todo en móvil donde no hay teclado).
- **Barato:** botón flotante "↑" que aparece tras cierto scroll; hacer `scrollTo({top:0})` sobre `listContainerRef` (ya existe el ref, se usa en `useScrollPosition`). Sin dependencias.

#### M16 — Al **importar** con una cuenta ya seleccionada, precargar **esa** cuenta, no la principal · **[AHORA] · bug UX**
- **Síntoma (founder):** en Movimientos con una cuenta concreta filtrada, pulsar "Importar movimientos" abre el asistente con la **cuenta principal** por defecto en vez de la que está mirando → fricción y riesgo de importar a la cuenta equivocada.
- **Fix:** el asistente de importación debe tomar como cuenta por defecto el `filterAccount` activo si es ≠ "all". Verificar el paso de selección de cuenta del import (`Step1BankSelection.tsx` / orquestación) y de dónde saca el default. **Bajo riesgo, alto valor de manejabilidad.**

### 🟢 Patrimonio / foto total

#### W1 — Incluir **inmuebles y otros activos** en el patrimonio (foto TOTAL) · **[POST-BETA / análisis] · feature de profundidad**
- **Qué:** poder registrar activos no bancarios (inmuebles, y por extensión vehículos, inversiones ilíquidas) para que el **patrimonio neto** refleje la foto completa, no solo cuentas.
- **Encaje con el norte:** ✅ fuerte — el pilar de "profundidad funcional" y la propuesta de valor ("proyecta tu **patrimonio**") piden esto. Un banco privado lo hace; nosotros deberíamos.
- **Diseño (clave para no romper la sencillez):** un activo **no es una cuenta**: es **ilíquido, sin movimientos, con valoración manual** que el usuario actualiza de vez en cuando. → Modelar como un **tipo aparte** ("Otros activos" / "Inmuebles") que **suma al patrimonio neto pero se excluye del flujo de caja, proyecciones de gasto y del saldo disponible**. Opcional: pasivo asociado (hipoteca ya existe como cuenta de préstamo → poder **vincular** el inmueble a su hipoteca daría el neto del activo, muy potente).
- **Argumento contrario (Regla 2):** es la puerta a convertirse en un gestor patrimonial completo (scope creep) y aleja del núcleo "planificación de tesorería". Mitigación: **v1 mínima** = activo manual con nombre, valor y fecha de valoración; nada de revalorización automática, tasaciones ni mercados. Si el usuario no lo usa, no ensucia nada.
- **Clasif.:** no bloquea beta; candidato fuerte a diferenciador **post-beta**.

### 🔵 Jubilación / proyección a largo plazo

#### J1 — **Fecha de jubilación** + contador + proyección de capital · **[POST-BETA / análisis] · feature estrella potencial**
- **Qué (founder):** definir una fecha de jubilación potencial, mostrar un **contador de días** que faltan, e incluso una **proyección del capital** que podría tener a esa fecha según la planificación de la app.
- **Encaje con el norte:** ✅ **altísimo** — es literalmente la propuesta de valor de FOUNDATION: *"Proyecta tu patrimonio a 6 meses, 5 años, hasta tu jubilación."* Hoy el motor de proyección (`forecastEngine`) llega a ~12 meses; extenderlo a horizonte "jubilación" es la evolución natural.
- **Dos piezas separables:**
  1. **Contador (barato, emocional):** un ajuste "fecha de jubilación" + un widget de días restantes. Simple, motivador, cero riesgo de cálculo. Podría entrar antes.
  2. **Proyección de capital (delicada):** proyectar patrimonio a 10-30 años multiplica la incertidumbre (inflación, rentabilidad, cambios de vida). ⚠️ **Argumento contrario y riesgo de producto:** una cifra de capital a 25 años presentada con falsa precisión es **engañosa y roza el asesoramiento financiero** (implicaciones legales/reputacionales). Si se hace, **framear con honestidad radical**: rango/escenarios (pesimista-base-optimista), supuestos **editables y visibles**, disclaimers claros, y lenguaje de "estimación", nunca "tendrás". Coherente con nuestra marca de confianza y privacidad.
- **Clasif.:** el **contador** es candidato a beta (barato, alto impacto emocional); la **proyección de capital** necesita diseño dedicado y decisión de producto/legal → post-beta o fase propia. Enlaza con W1 (para proyectar patrimonio total hace falta incluir activos).

### 🟠 Reglas de categorización

#### BK4 — Al **editar una regla** de categorización, la edición queda **oculta bajo el fold** (no hay auto-scroll) · **[AHORA] · bug UX**
- **Síntoma (founder):** al editar una regla en el editor, el formulario de edición aparece más abajo y el usuario tiene que **bajar a mano** para verlo; parece que "no pasa nada".
- **Fix:** al abrir la edición, `scrollIntoView({ block: 'center' })` sobre el formulario/fila en edición dentro de `RulesEditorModal.tsx`. Mismo patrón de la familia CoachMark móvil (s.69) y del anti-pantalla-negra: **presencia en el DOM ≠ que se vea**. Barato.
- **Nota:** revisar si el editor es un modal con scroll propio; el `scrollIntoView` debe operar sobre el contenedor scrollable correcto (no el `body`).

### 📋 Resumen de clasificación provisional

| ID | Título | Tipo | Clasif. prov. |
|---|---|---|---|
| **B10** | Totales del Informe suman en vez de netear | 🔴 bug confirmado | AHORA |
| **C5** | Saldos de Movimientos no reconcilian con Cuentas | 🔴 bug concepto/UX | AHORA (revisar diseño) |
| **M12** | Saldo acumulado por movimiento (estilo banco) | feature núcleo | FASE 4 |
| **M13** | Exportar movimientos a CSV según filtros | UX barato | FASE 4 |
| **M14** | Orden ascendente/descendente | UX | FASE 4 |
| **M15** | Botón "ir al primer movimiento" | UX | FASE 4 |
| **M16** | Importar precarga la cuenta seleccionada | bug UX | AHORA |
| **BK4** | Auto-scroll a la regla en edición | bug UX | AHORA |
| **W1** | Inmuebles/otros activos en patrimonio | feature profundidad | POST-BETA |
| **J1** | Jubilación: fecha + contador + proyección | feature estrella | contador→beta · proyección→post-beta |

> **Recomendación de secuencia (no decisión):** los cuatro **[AHORA]** (B10, C5, M16, BK4) son baratos y de correctitud/manejabilidad → buen bloque para cuando toque tocar código. **M12+C5** juntos resuelven la reconciliación de saldos de forma elegante. **W1/J1** son estratégicos y merecen su propia conversación de producto antes de tocar nada.

---
