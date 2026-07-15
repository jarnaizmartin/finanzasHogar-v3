Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 71**.

Protocolo de arranque:

Lee primero `00_FOUNDATION.md` (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee `CLAUDE.md` §Protocolo de arranque — **el norte es un FILTRO, no una cita** (fallo registrado s.70; lee también la memoria `norte_filter.md`).
Lee la última entrada de `05_SESSION_LOG.md` (Sesión 70).
Lee `§Próximo hito inmediato` en `01_ROADMAP.md`.
Spec canónico del arranque: `12_ONBOARDING_REDESIGN.md`.
Confirma con "listo" antes de proponer nada.

---

## 🎯 FOCO DE ESTA SESIÓN: prueba del founder en iPhone del arranque nuevo

En la s.70 se rediseñó el **arranque como una charla** y se pusheó (`b153cd5..37b9a5e`, producción `finanzas-hogar`, `https://finanzas-hogar-eta.vercel.app`). Toca que el founder lo valide en su iPhone.

### 🔵 Qué probar (en el iPhone, ya en producción — reinstalar la PWA tras el redeploy y arrancar de cero / resetear)

**Onboarding conversacional (nuevo, la pieza de la s.70):**
1. Tras el WelcomeTour, aparece el **diálogo de 5 slides con la misma piel** (negro cinematográfico, sin latigazo azul): **Idioma → Nombre → Divisa → Datos reales/Prueba → Legal**.
2. **Slide de idioma:** las **banderas reales** salen en iOS (en Windows headless salían como "ES/GB/PT"); el idioma elegido cambia el resto de la charla al vuelo.
3. **Nombre (O7):** primera pregunta real, en tono de diálogo, con microcopy de privacidad y "Prefiero no decirlo".
4. **Divisa:** chips EUR/USD/GBP + desplegable; eyebrow personalizado con el nombre ("Un placer, {nombre}").
5. **Datos reales/Prueba:** "Probar con un ejemplo" entra bien en **Modo Prueba** (banner morado); "Con mis datos" sigue a Legal. ⚠️ **Bug reportado s.70 + fix `5debb88`:** en el iPhone del founder, al elegir el ejemplo la app **rebotaba a la pantalla de idioma** (siembra demo que fallaba a medias → `fh_demo_onboarded` sin escribir pero `fh_mode='demo'` puesto). Blindado (marca onboarded primero + `enterDemo` no cambia a demo si la siembra no cuajó). **NO reproducible en desktop.** Verificar: ya no rebota; si aún rebota = estado residual → **reset/reinstalar limpio** y pasar el error de consola `[appMode]` si aparece.
6. **Que ningún título se corte** en pantalla pequeña; que el **formato de fecha** ya no se pregunte (se deriva del idioma).
7. **6 idiomas:** cambiar idioma y ver la charla traducida.

**Fixes de la s.70:**
8. **Coachmark móvil:** ya NO se corta arriba ni apunta a un target fuera de vista; al aparecer, el target se trae a la vista solo.
9. **Franja blanca inferior:** bajo el WelcomeTour y el onboarding ya NO asoma blanco en el home indicator.
10. **Marca:** logo + "FinNort" más grandes y con presencia en el header del tour y del onboarding.
11. **iPhone SE:** confirmar que "Planning" (5 pestañas fijas + Más) no aprieta en la pantalla estrecha.

### 🟠 DESPUÉS (según lo que salga)
- Corregir lo que aparezca en el test.
- Limpieza opcional: claves i18n huérfanas `onboarding.welcome.*` (title/subtitle/languageLabel/dateLabel/startBtn) que el diálogo nuevo ya no usa (paridad intacta).
- Deuda menor previa: MockupPrivacy hardcodeado ES; pasos de Profundidad en la guía (Traspasos/Tendencias/Informes/Multi-divisa); `onboarding.securityStep.*` sin usar.
- Mejora **S1** (`08_MEJORAS.md`): Resumen, drill-down por concepto.
- Retomar **"Proyecciones con confirmación"** (`11_PROJECTION_CONFIRMATION.md`) cuando el arranque esté validado.

**Arrastradas (siguen sin validar):** Modo Prueba (reload + aislamiento) en iPhone · `Sel` en 3 dispositivos · bug ADMIN `1f9318f` · sync §11 iPhone (reconexión 1 toque, auto-finish redirect, tombstones, LWW; refresh tokens 7 días si consent en "Testing") · A5 Safari iOS · icono R3 PWA + logo en lock · limpiar traspasos duplicados a mano.

---

## ⚠️ Lección operativa crítica (no repetir)
- **El norte es un FILTRO, no una cita.** Antes de dar una pantalla por buena: ¿es de verdad la mejor UX del mundo por sencillez? ¿la experiencia completa se siente como UN producto? Señalar incoherencias sin que me lo pidan. NUNCA excusarse con "no tengo memoria" (la bitácora existe para eso). Ver `norte_filter.md`.
- **"Desplegado/pusheado" SOLO es verdad tras `git push` confirmado con la salida del comando.** Producción la sirve **`finanzas-hogar`** (`https://finanzas-hogar-eta.vercel.app`). Ciclo: push → redeploy Vercel → reinstalar PWA.
- **El founder factura por token** — no gastar en bucles ni verificaciones que él hace en 30s. No verbose. No bucle "tienes razón".
- **Antes de editar un archivo i18n hay que `Read`-lo.** 6 idiomas: es · en · fr · pt-pt · pt-br · it. Cambiar solo VALORES mantiene la paridad de claves.
- **Patrón anti-"pantalla en negro":** todo modal `position:fixed` por **portal a `document.body`**.
- **Gotcha PowerShell+git:** NO comillas dobles en `git commit -m`. Usar heredoc en git-bash. Stagear archivos explícitos.
- **Verificar cada commit:** `npx tsc --noEmit` + `npm run test:run` (**1148 tests**). Trabajo directo en `main`.

## ESTADO: arranque rediseñado como charla + fixes (coachmark, franja iOS, marca, rebote Modo Prueba) en producción. Falta la validación del founder en ordenador + iPhone.

Cuando hayas leído los .md, dime "listo".
