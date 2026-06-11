# A3 — Test de campo del onboarding

> Guion para validar el onboarding con un **usuario nuevo real** (un amigo), en **dispositivo real**.
> Parte del corte beta (A3). Ver `09_BETA_READINESS.md` y `05_SESSION_LOG.md`.
> Creado: 11/06/2026 (sesión 53)

---

## Objetivo

A3 no mide "que funcione". Mide **que un usuario nuevo no técnico entienda qué hacer sin que tú le ayudes**.
Por eso la checklist mezcla *funciona* + *se entiende*. El orden es el real que verá el usuario (sacado del código de arranque: `WelcomeTour.tsx` → `Onboarding.tsx` → paso de seguridad → `SecuritySetup` → Dashboard con `SetupProgress` + `CoachMarksTour`).

**Regla de oro del observador:** tú **observa callado** y apunta dónde duda. Esa duda *es* el dato de A3. Si intervienes, contaminas la prueba.

---

## Preparación — arrancar como "usuario nuevo de verdad"

El dispositivo/navegador debe estar **virgen** (sin datos previos de la app). Tres formas:

### Opción A — Reset limpio (recomendado)
En la consola del navegador, **estando en la página de la app** (`finanzas-hogar-eta.vercel.app`):

```js
localStorage.clear(); location.reload();
```

`localStorage.clear()` borra **solo los datos de este origen** (tour, onboarding, cuentas, seguridad, idioma). **NO toca la caché del navegador ni otras webs.** Es lo más fiel: borra también cualquier dato/seguridad que dejara una maqueta vieja.

### Opción B — Solo revivir la bienvenida (conservar datos)
Si quieres mantener cuentas/datos existentes y solo repetir tour + onboarding:

```js
['fh_tour_completed','fh_tour_first_time','fh_onboarded','fh_onboarded_at',
 'fh_header_tour_done','fh_coach_seen','fh_setup_dismissed','fh_setup_celebrated',
 'fh_setup_first_seen','fh_setup_highlight','fh_gs_visited','fh_first_session_done']
 .forEach(k => localStorage.removeItem(k));
location.reload();
```
⚠️ Re-hacer el onboarding con datos vivos vuelve a crear las categorías por defecto. Para A3 limpio, usa la **Opción A**.

### Opción C — Incógnito (lo más cómodo en el móvil del amigo)
Ventana de incógnito = sin Service Worker previo ni `localStorage` → usuario nuevo **y** última versión del código, todo en uno.

> **Versión del código (PWA):** A y B reinician el *flujo* pero no actualizan el bundle si el Service Worker cacheó una maqueta vieja. Para forzar la última versión: F12 → **Application** → **Service Workers** → *Unregister* → recarga. O usa incógnito (Opción C).

### Cómo abrir la consola
- **Chrome/Edge/Brave:** `⌘ + ⌥ + J` (Mac) / `Ctrl + Shift + J` (Win).
- **Safari (Mac):** Ajustes → Avanzado → "Mostrar funciones para desarrolladores web"; luego **Desarrollo → Mostrar consola** o `⌘ + ⌥ + C`.
- **iPhone (Safari iOS):** no hay consola en el móvil; conectar por cable al Mac y abrir desde **Safari del Mac → Desarrollo → [nombre del iPhone]**.

---

## Checklist (en el orden que lo vive el usuario)

### 0. Detección de idioma (primer arranque)
- [ ] ¿Arranca en el idioma del dispositivo, sin tocarlo? (móvil en inglés → app en inglés).
- [ ] Distingue 🇧🇷 pt-BR de 🇵🇹 pt-PT.

### 1. Tour de bienvenida (`WelcomeTour` — 4 pantallas)
- [ ] Las 4 tarjetas se ven bien (problema → privacidad → proyección → empezar), texto no cortado, mockups legibles.
- [ ] Móvil: ¿descubre que se pasa con **swipe**, o se atasca buscando botón?
- [ ] La primera vez **no hay botón "saltar"** (a propósito). ¿Le frustra o lo completa?
- [ ] El CTA final ("2 minutos / Empezar") lleva al onboarding.

### 2. Configuración inicial (`Onboarding`)
- [ ] **Idioma**: viene en su idioma detectado; al cambiarlo, la pantalla cambia al instante.
- [ ] **Divisa**: ¿encuentra la suya? ¿Entiende "es tu divisa base"?
- [ ] **Formato de fecha**: ¿la previsualización (ej: 31/01/2025) le aclara qué elige?
- [ ] **Aceptación legal**: "Empezar" está **bloqueado** hasta marcar la casilla. ¿Lo entiende o cree que está rota? *(punto caliente)*
- [ ] ¿Abre algún documento legal (aviso/privacidad/términos/cookies)? ¿Cargan en su idioma?

### 3. Paso de seguridad (tras "Empezar")
- [ ] Ve "Activar protección (recomendado)" vs "Omitir".
- [ ] ¿Entiende qué implica cada opción, o elige al azar?
- [ ] Si **activa** → asistente `SecuritySetup` (método + frase de recuperación). ¿Lo completa sin perderse?
- [ ] ¿**Apunta la frase de recuperación** o la ignora? *(crítico: si la ignora, perderá los datos)*
- [ ] Si **omite** → entra directo, sin bloqueo.

### 4. Primer contacto (Dashboard)
- [ ] Aparece la **guía de primeros pasos** (`SetupProgress`). ¿La sigue?
- [ ] A los ~1,5 s aparece el **tour del header** (`CoachMarksTour`). ¿Ayuda o molesta? ¿Puede cerrarlo?
- [ ] **Prueba de fuego**: ¿crea su **primera cuenta + un movimiento** él solo, sin que intervengas? Apunta dónde se atasca.
- [ ] ¿Aparece el `FirstWinToast` (primera victoria) al completar algo?

### 5. Cierre — la pregunta que de verdad mide A3
- [ ] Pregúntale: **"¿qué crees que hace esta app y para quién es?"**
  - "Planificación financiera privada/seria" → el onboarding comunica bien. ✅
  - "Otra app de gastos" → problema de posicionamiento a arreglar antes de la beta. ⚠️

---

## Resultado del test

> Rellenar tras la sesión con el amigo. Anotar fricciones concretas (pantalla + qué pasó) para priorizar fixes.

### Test #1 — 11/06/2026 (n=1)

- **Tester:** una persona que ya vio una maqueta antigua (perfil no confirmado como usuario norte).
- **Dispositivo / navegador:** dispositivo con idioma inglés detectado.

**Fricciones detectadas (verbatim + clasificación):**

| Reporte | Tipo | Estado |
|---|---|---|
| El banner/título principal del onboarding sale siempre en español aunque detectó inglés | 🐞 Bug | ✅ **B1 corregido** (`1da6ce3` — títulos del WelcomeTour hardcodeados) |
| Tras crear la cuenta salta en ROJO el banner de backup que había quitado hace tiempo | 🐞 Bug | ⏳ B2 — a investigar (`BackupReminderBanner`) |
| En la cuenta no vio que se puede seleccionar el banco | 🐞 UX/visibilidad | ⏳ B3 — selector existe (`InstitutionSelector`) pero no se descubre |
| Los títulos de cada pestaña e iconos se ven muy tenues, difíciles de distinguir (light y dark) | 🐞 Bug visual | ⏳ B4 — contraste de nav tabs / iconos |
| En seguridad dudó | 🔵 UX | Rediseño onboarding |
| El proceso de recuperación con la frase no lo vio claro | 🔵 UX | Rediseño onboarding |
| "El email de confirmación es muy pesado" | 🔵 UX | Rediseño onboarding |
| Le cansó el proceso de alta de seguridad | 🔵 UX | Rediseño onboarding |
| Se saltó la presentación de los iconos (coachmarks) | 🔵 UX | Rediseño onboarding |
| "Muy complejo el arranque; la gente se queda fría, no ve el potencial" | 🔴 Estratégico | Rediseño onboarding |
| Difícil entender el objetivo real y el potencial de la app | 🔴 Estratégico | Rediseño onboarding |
| No se entiende dónde se guardan los datos ni la posibilidad multi-dispositivo | 🔴 Estratégico | Rediseño onboarding |
| Propuesta del founder: guía rápida de funcionalidad/arranque que invite a usarla; el onboarding es demasiado largo, ¿guiamos demasiado? | 🔴 Estratégico | Rediseño onboarding |

**Veredicto pregunta de cierre:** no comunica el valor — el tester salió frío y no entendió el objetivo. ⚠️

**Lectura (consultor + abogado del diablo):**
- El patrón de fondo es uno solo: **arranque largo que fatiga y no transmite valor.** Probable causa: exceso de pasos obligatorios antes del primer "wow", no falta de guía (ya hay 3 capas: WelcomeTour + CoachMarks + SetupProgress).
- **Contraargumento (Regla 2):** n=1 y el tester puede NO ser el usuario norte ("Jesús" busca profundidad, no se queda frío ante ella). Riesgo de diluir el diferenciador (profundidad) si se rediseña para un perfil casual.
- **Decisión:** arreglar ya los bugs objetivos (B1✅, B2, B3, B4 — molestan a cualquiera). **No** reestructurar el onboarding con un solo tester → recoger 2-3 testers más, idealmente alguno cercano al perfil norte, antes de la sesión de rediseño.

**Acciones derivadas:**
1. ✅ B1 — i18n títulos del tour (hecho).
2. ⏳ B2 — banner de backup reaparece tras descartarlo.
3. ⏳ B3 — visibilidad del selector de banco en el alta de cuenta.
4. ⏳ B4 — contraste de títulos de pestañas e iconos (tenues en light y dark).
5. 🔴 Sesión dedicada de rediseño de onboarding (recorte de pasos + momento "wow" + mensaje de privacidad/multi-dispositivo) — **tras 2-3 testers más**.
