# 12 — REDISEÑO DEL ONBOARDING (bloqueante de beta)

> **Spec canónico.** Fija el alcance del rediseño del onboarding y de la comunicación de valor.
> Diseño cerrado con el founder en la sesión 68 (08/07/2026). Objetivo: desbloquear la beta.
> Estilo y estatus equivalentes a `11_PROJECTION_CONFIRMATION.md`.

---

## 1. Por qué (el problema real)

El 1er test de campo (A3, s.53) reveló: **el arranque es largo y no transmite el valor de la app.**
La auditoría de la s.68 encontró la causa raíz — no falta onboarding, **sobra y está fragmentado**:

Hoy conviven **5 sistemas** que se solapan y compiten:

1. `WelcomeTour.tsx` — 4 pantallas full-screen (calidad landing). *Cuenta* el valor.
2. `Onboarding.tsx` — config (idioma/divisa/fecha/legal) → pantalla "¿Activar seguridad?".
3. `SetupProgress.tsx` — checklist reanudable del Dashboard (cuenta → movimiento → proyección → objetivo), bloqueado en orden.
4. `GettingStarted.tsx` — guía completa (esenciales + recomendados), desplegable.
5. `CoachMarksTour` (iconos del header) + `CoachMark` contextual (ya cableado en las vistas núcleo).

El usuario recibe tour + config + aviso de seguridad + guía + checklist + coachmarks. **El valor se diluye en 5 capas.** Además, la app **pone la maquinaria por delante del valor** (el checklist pide "crea un movimiento" como paso 2, cuando un movimiento manual suelto no aporta casi nada).

---

## 2. Filosofía de mensaje (el norte de este rediseño)

- **Comunicar el BUCLE, no la lista de funciones.** El usuario necesita un modelo mental de una frase que pueda repetir, no un catálogo.
- **Maratón, no sprint** (coherente con `00_FOUNDATION.md`). Se elimina el mensaje "en 2 minutos ya está": es falso y vende la app corta. Esta es una **relación de larga distancia** — la app se vuelve más valiosa cuanto más tiempo la usas y más lejos planificas. El copy debe transmitir eso, con honestidad.
- **Guiar haciendo > informar y soltar.** Cada paso te lleva a la pantalla real y te acompaña, con el *porqué* del paso, no solo el *cómo*.
- **Rampa simple, profundidad progresiva.** El bucle simple es la puerta de entrada; los diferenciadores de profundidad (traspasos, health score, simulador de hipoteca, multi-divisa) se revelan después. Así se protege *sencillez* Y *profundidad* a la vez (no somos YNAB: la profundidad sigue siendo el pilar 2).

### El bucle núcleo (modelo mental canónico)

> **Cuentas** (dónde estás) → **Planificación** (tu plan de ingresos y gastos fijos) → **Movimientos** (carga tu banco = la realidad) → **Previsión** (a dónde vas).

Todo lo demás es profundidad opcional.

---

## 3. Decisiones cerradas (s.68)

| # | Decisión |
|---|---|
| Onboarding | Asistente **guiado, cerrable y reanudable**. Mantiene el bloqueo por "requiere cuenta". |
| Naming | `Proyecciones` → **`Planificación`**. `Previsión` (forecast) **NO se toca**. Descartado "Presupuesto" (no somos app de presupuestos). |
| Orden de tabs | Escritorio: bucle primero. Móvil: **5 pestañas fijas** (Resumen · Cuentas · Planificación · Movimientos · Previsión). |
| Espina de activación | **Cuenta → Planificación → Movimientos**. **Fuera**: Objetivo (O3), movimiento-manual como paso destacado, Traspasos. |
| Seguridad (O1) | **Fuera del arranque.** Disponible en header + recomendada en la guía + **aviso suave, desactivable** tras el primer dato real. |
| Guía (O4) | `GettingStarted` reestructurada: **Núcleo (el bucle)** vs **Profundidad (con ejemplos)**. |
| Comunicación de valor | Empty states que **enseñan** (muestran ejemplo + CTA). Ejemplos donde el valor no es obvio. |
| Modo Prueba | Ruta de **datos de ejemplo aislados** ("sin miedo"). Ver §5.H. |
| WelcomeTour | Se **mantiene** (calidad landing); revisar copy "2 minutos"; desembocar en la espina guiada. |
| O5 / O6 | **Incluidos** en esta tanda (marketing barato: nombre + logo desde el principio). |
| Sync E2E | **Comunicarlo** como expresión de la privacidad (no excepción). Arreglar el copy falso "0 bytes a la nube". Ver §5.L. |

---

## 4. No-objetivos (fuera de alcance)

- No se rediseña el **layout/estética** del onboarding — es bueno. Solo cambia el **contenido, el orden y el flujo**.
- No se renombra `Previsión` ni ninguna otra sección salvo `Proyecciones→Planificación`.
- No se toca el `id` interno `projections` (solo la etiqueta visible) → cero riesgo en badges, `fh_start_tab`, sync, tests.
- No entra "Proyecciones con confirmación" (`11_...md`) — es un hito aparte.

---

## 5. Cambios por área

### A. Naming: Proyecciones → Planificación
- Cambiar **solo la etiqueta visible** en i18n ×6 (`appShell.tabs.projections` + título/subtítulo de la sección `projections:`). El `id` sigue `projections`.
- Revisar referencias textuales a "proyección/proyecciones" en guía, setup, tour, alertas — donde signifiquen "el plan" pasar a "Planificación"; donde signifiquen "el resultado" mantener "Previsión".
- Par que cuenta la historia: **"Defines tu Plan → ves tu Previsión."**

### B. Orden de tabs
- **Escritorio** (`AppShell` `TAB_DEFS`): `dashboard · accounts · projections · real · forecast · │ · transfers · goals · calendar · trends · alerts · reports · categories`.
- **Móvil** (`BottomNav`): `PRIMARY_TABS` pasa a **5**: `dashboard · accounts · projections · real · forecast` (+ botón "Más"). `forecast` sale de `MORE_TABS`.
- ⚠️ **Validación founder en iPhone SE:** 5 iconos + "Más" puede apretar. Verificar antes de dar por bueno.
- El gate `REQUIRES_ACCOUNT` (`real, transfers, projections, goals`) se mantiene igual.

### C. Espina de activación (`SetupProgress`)
- Reordenar `steps` a: **account → projection → movement**.
- **Eliminar** el paso `goal` (O3). El objetivo se crea después, desde su sección, cuando el usuario ya entiende la app.
- Recopy: el paso "movement" lidera con **"importa tu banco"** (no "crea un movimiento manual"). Mantener el bloqueo secuencial y el reanudado.
- El paso "projection" usa el copy coloquial ya existente ("Define tus ingresos y gastos fijos · tu nómina, el alquiler, las suscripciones…").

### D. Guiar haciendo (el puente que falta)
- Al pulsar un paso de la espina y aterrizar en la pestaña, **disparar un `CoachMark` contextual** que lleve de la mano en la acción real, con **marco de valor** (por qué + cómo), no solo "aquí está la pantalla".
- Reutiliza la infra existente (`CoachMark`/`useCoachMark`, ya cableada en Cuentas/Planificación/Movimientos/Previsión).
- Cada coachmark: 1 frase de *por qué* + 1 de *cómo* + apuntar al botón de acción real (ej. "＋ Nueva cuenta").

### E. Empty states que enseñan
- **Planificación** vacía: muestra una fila de ejemplo (nómina + alquiler) semitransparente + CTA "Añade tu primer ingreso/gasto fijo".
- **Previsión** vacía: mini-gráfico de ejemplo + "Así verás tu futuro cuando definas tu plan".
- **Movimientos** vacío: destacar "Importa tu banco" sobre "crear a mano".
- Objetivo: vender el *resultado*, no la mecánica.

### F. Seguridad fuera del arranque (O1)
- Quitar la pantalla `showSecurityStep` de `Onboarding.tsx` (el `setShowSecurityStep(true)` y su render).
- La seguridad sigue disponible desde el icono del header y como paso "recomendado" en la guía.
- **Aviso suave, desactivable:** un banner discreto (patrón `BackupReminderBanner`) que aparece **tras el primer dato real** (p. ej. primera cuenta o primer import) sugiriendo proteger la app. Con "No volver a mostrar". No modal, no bloqueante. Nueva clave `fh_security_hint_dismissed`.

### G. WelcomeTour — mantener + arreglar mensaje
- Se mantiene el componente (4 cards, calidad landing).
- **Revisar copy de la card `start`:** hoy dice *"2 minutos. Eso es todo."* / *"El resto lo descubres usando la app."* → cambiar por un mensaje **maratón** honesto (ej. eje: *"Empieza en un minuto. Mejora contigo cada mes."* o *"Cuanto más la usas, más te anticipa."*). Copy final a afinar con el founder.
- Al terminar el tour, **desembocar en la espina guiada** (hoy desemboca en la config).

### H. Modo Prueba (datos de ejemplo) — diseño completo

**Objetivo:** que cualquiera pueda **usar la app entera desde el minuto uno, sin miedo**, con datos realistas de ejemplo, y pasar a sus datos reales sin mezclar nada.

**Garantía de aislamiento (lo crítico):** el modo Prueba y el modo Real usan **almacenamiento separado por prefijo**. Nunca se mezclan.

- Flag de modo: `fh_mode` = `'real'` | `'demo'` (por defecto `'real'`).
- `DataContext` (y prefs de display) leen/escriben con **prefijo dependiente del modo**:
  - Real: `fh_accounts`, `fh_categories`, `fh_projections`, `fh_real_expenses`, `fh_goals`.
  - Demo: `fh_demo_accounts`, `fh_demo_categories`, `fh_demo_projections`, `fh_demo_real_expenses`, `fh_demo_goals`.
  - Implementación: helper `keyFor(base)` que antepone `demo_` si el modo es demo. `useLocalStorage`/`DataContext` lo consumen. **Los datos reales no se leen ni se escriben jamás mientras estás en Prueba** → aislamiento por construcción.
- **Contenido demo:** un dataset semilla realista y curado (varias cuentas incl. tarjeta y préstamo, plan de fijos con nómina/hipoteca/suscripciones, movimientos importados de ejemplo, 1-2 objetivos, algún traspaso) para lucir Resumen/Planificación/Previsión/Tendencias/Informes desde el arranque. Vive en `src/lib/demoData.ts` (función pura + test).
- **Banner persistente e inconfundible** mientras estás en Prueba: *"Modo Prueba · estás explorando con datos de ejemplo"* + botón **"Ir a mis datos"**. Patrón portal a `document.body` (anti-pantalla-negra).
- **Entradas:** (1) desde el onboarding — CTA "Explorar con datos de ejemplo" junto a "Empezar de verdad"; (2) toggle en Ajustes.
- **Salidas / acciones:**
  - `exitDemo()` → vuelve a modo Real (su sandbox real, vacío/parcial → continúa la espina guiada).
  - `resetDemo()` → regenera los datos de ejemplo frescos (borra solo el sandbox `fh_demo_*`).
  - Como el sandbox demo está aislado, se puede purgar sin tocar nada real.
- **Naming (definición):** en UI se llama **"Modo Prueba"** (claro y honesto en ES). El modo Real es "la app normal" — el banner y el término solo aparecen en Prueba (no se etiqueta el uso normal como "Modo Real" en toda la UI para no meter ruido). Salir = **"Ir a mis datos reales"**.
- ⚠️ Backups/sync: un backup/export en modo Prueba debe avisar de que son datos de ejemplo (o deshabilitarse). El sync (`useLocalStorageSync`) **no debe sincronizar** el sandbox demo. Revisar en implementación.

### I. Guía `GettingStarted` reestructurada (O4)
- Dos secciones nuevas: **"El bucle (empieza aquí)"** = Cuentas · Planificación · Movimientos · Previsión — y **"Profundidad"** = Traspasos · Objetivos · Tendencias · Informes · Multi-divisa · Seguridad · Backup.
- Objetivo sale de "esenciales" → va a Profundidad.
- **Ejemplos/casos** donde el valor no es obvio (Traspasos "¿para qué?", interpretar Tendencias). En el núcleo prima el coaching en contexto sobre la lectura.
- Enlaza con el Centro de Ayuda (biblioteca de referencia, no muro de arranque).

### J. Portada de bienvenida + captura de nombre (O5)
- **Captura del nombre** en el onboarding (nuevo campo, **solo local-first**). Copy de privacidad obligatorio: *"Es solo para ti. No se guarda ni se envía a ningún sitio; únicamente sirve para dirigirnos a ti."* Nueva clave `fh_user_name` (cifrada) + `fh_last_connection`.
- **Portada al abrir/desbloquear:** `BrandLogo` + `BrandWordmark` + *"Bienvenido de nuevo, {nombre}. Tu última conexión fue el {fecha}."*
- **Auto-desvanece** tras unos segundos + **toggle de desactivación** en Ajustes (`fh_welcome_splash_enabled`).
- ⚠️ Regla 2: una intersticial añade 1 tap/fricción por arranque → mitigado por auto-fade + toggle. Clasif. pulido.

### L. Comunicar el sync E2E — privacidad como superpoder, no como excepción
**Contexto:** el sync multidispositivo (vault E2E en la nube del usuario, ADR `10_SYNC_ARCHITECTURE.md`) es espectacular y **hoy no se comunica en ningún sitio**. Hay que contarlo — con cuidado de no dañar el pilar de privacidad.

- **Arreglo obligatorio de honestidad (independiente del bombo):** el copy actual de `WelcomeTour` (`MockupPrivacy`) dice *"0 bytes enviados a la nube"* y *"Solo en tu dispositivo"* → **literalmente falso** con el sync activo. Corregir a un enunciado preciso: *"Por defecto, solo en tu dispositivo. Sin servidores nuestros."*
- **Encuadre:** el sync es una **expresión** de la privacidad, no una excepción. Titular que se mantiene: *"Nadie puede leer tu dinero. Ni nosotros."* Distinciones clave: (a) es **TU** nube (Google Drive), no un servidor nuestro — **cero backend que vea datos**; (b) **cifrado E2E / zero-knowledge** (ni Google ni nosotros lo leemos); (c) **opt-in** (por defecto local puro).
- **Dónde (dos trabajos distintos):**
  1. **Card de privacidad del tour:** UNA línea, como superpoder, no como titular — *"…y si quieres tus finanzas en todos tus aparatos, viajan cifradas por TU nube; nadie las lee, ni nosotros."* No hacer de "Google Drive" el titular (palabra-gatillo para el usuario pro-privacidad).
  2. **Guía (Profundidad) + momento contextual** (cuando el usuario ya está dentro): beneficio completo del multidispositivo como argumento de venta. **No** va en la espina de activación (es opt-in, no núcleo).
- Encaja con el punto ya previsto en la guía O4 ("multi-device (Drive) vs mono-device y cómo se hace").

### K. Logo en pantallas donde falta (O6)
- Cablear `BrandLogo`/`BrandWordmark` en: (a) pantallas de contraseña del set-up (`SecuritySetup` / pasos `new-password`/recuperación de `LockScreen`), (b) pantalla final de onboarding con T&C.
- En la pantalla de contraseña, mostrar además el nombre del usuario (encaja con O5).
- ⚠️ Auditar cada vista sin logo antes de tocar.

---

## 6. Fases de implementación (commits pequeños; app siempre funcionando)

**Fase 1 — Estructura (barato, alto impacto)**
1. `refactor(nav)`: Proyecciones → Planificación (i18n ×6, solo label).
2. `refactor(nav)`: reordenar tabs (escritorio bucle-first + móvil 5 fijas; Previsión sube).

**Fase 2 — Espina de activación (O2/O3, O1)**
3. `feat(setup)`: `SetupProgress` reordenado (cuenta→planificación→movimientos), fuera objetivo, copy orientado a banco.
4. `feat(onboarding)`: quitar seguridad del arranque + banner de aviso suave desactivable.

**Fase 3 — Guiar haciendo**
5. `feat(coaching)`: coachmarks contextuales con marco de valor al aterrizar en cada paso.
6. `feat(empty-states)`: estados vacíos que enseñan (Planificación/Previsión/Movimientos).

**Fase 4 — Modo Prueba + Guía**
7. `feat(demo)`: `src/lib/demoData.ts` + test (dataset semilla).
8. `feat(demo)`: almacenamiento por prefijo (`keyFor`) + `enterDemo/exitDemo/resetDemo` + flag `fh_mode`.
9. `feat(demo)`: banner persistente + entradas (onboarding + Ajustes) + guardas de backup/sync.
10. `refactor(guide)`: `GettingStarted` Núcleo vs Profundidad + ejemplos.

**Fase 5 — Marca + copy**
11. `feat(brand)`: captura de nombre (O5) + portada de bienvenida + toggle Ajustes.
12. `feat(brand)`: logo en pantallas de contraseña / T&C (O6).
13. `docs/copy`: pasada de copy al WelcomeTour (fix "2 minutos" **+ fix "0 bytes a la nube" + línea de sync E2E**, §5.L) + bienvenida.

*(El orden fino de commits lo ajusta el ejecutor; cada uno deja la app funcionando y no mezcla refactor con feature.)*

---

## 7. Riesgos y validaciones del founder

- **Móvil 5 pestañas fijas** — verificar en iPhone SE que no aprieta.
- **Modo Prueba = la pieza más grande y delicada.** El aislamiento por prefijo es lo que garantiza el "sin miedo"; hay que probar a fondo: entrar/salir, reset, que los datos reales queden intactos, y que backup/sync no toquen el sandbox demo.
- **Copy final** del WelcomeTour y de la portada — afinar con el founder.
- Reordenar tabs cambia memoria muscular pero es seguro técnicamente (todo indexado por `id`).

---

## 8. Archivos afectados (mapa previsto)

- Naming/orden: `src/i18n/*.ts` (×6), `src/AppShell.tsx`, `src/components/BottomNav.tsx`.
- Espina: `src/components/SetupProgress.tsx`, `src/views/Onboarding.tsx`.
- Coaching/empty: `src/components/CoachMark.tsx`, `src/views/{Projections,Forecast,RealExpenses,Accounts}.tsx`.
- Seguridad: `src/views/Onboarding.tsx`, nuevo banner (patrón `BackupReminderBanner.tsx`).
- Modo Prueba: `src/lib/demoData.ts` (nuevo), `src/hooks/useLocalStorage.ts`, `src/contexts/DataContext.tsx`, `src/AppProvider.tsx`, `src/hooks/useLocalStorageSync.ts`, nuevo banner, Ajustes.
- Guía: `src/GettingStarted.tsx`.
- Marca: `src/views/Onboarding.tsx`, `src/WelcomeTour.tsx`, `src/LockScreen.tsx`, `src/views/SecuritySetup.tsx`, portada nueva, Ajustes.

---

## 9. Estado

**Spec cerrado (s.68). Sin implementar.** Objetivo: desbloquear la beta. Siguiente: Fase 1.
