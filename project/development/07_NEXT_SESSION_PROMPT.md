Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 69**.

Protocolo de arranque:

Lee primero `00_FOUNDATION.md` (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de `05_SESSION_LOG.md` (Sesión 68) para saber dónde lo dejamos.
Lee `§Próximo hito inmediato` en `01_ROADMAP.md`.
Lee el spec canónico del trabajo en curso: `12_ONBOARDING_REDESIGN.md`.
Confirma con "listo" antes de proponer nada.

---

## 🎯 FOCO DE ESTA SESIÓN: pruebas del founder + continuar el rediseño del onboarding

En la s.68 se cerró el **spec del rediseño del onboarding** (`12_ONBOARDING_REDESIGN.md`) y se implementaron y **pushearon las Fases 1-3** (9 commits, en producción `finanzas-hogar`). Toca **que el founder valide en su iPhone** y luego seguir con Fase 4/5.

### 🔵 PRIMERO — Ronda de pruebas del founder (en el iPhone, ya en producción)

**De esta sesión (Fases 1-3):**
1. **Nav móvil:** 5 pestañas fijas (Resumen · Cuentas · **Planificación** · Movimientos · **Previsión**). ⚠️ ¿"Planificación" aprieta/se corta en iPhone SE? (duda principal — si molesta, etiqueta corta "Plan" solo en móvil).
2. **Nav escritorio:** orden bucle-first.
3. **Onboarding:** al terminar **ya NO pide seguridad** → entra directo y **desbloqueado**.
4. **Aviso suave de seguridad:** banner ámbar tras crear la 1ª cuenta; "No volver a mostrar" permanente.
5. **Espina (tarjeta setup en Resumen):** Cuenta → Planificación → Movimientos, **sin Objetivo**; paso Movimientos dice "importa tu banco".
6. **Empty state Planificación:** filas de ejemplo (Salario/Alquiler/Suscripciones), importes en tu divisa.
7. **Empty state Previsión:** aparece sin plan; mini-gráfico + CTA "Ir a Planificación" navega.
8. **Empty state Movimientos:** botón primario "📥 Cargar extracto del banco" abre el import; enlace manual debajo.
9. **Coachmarks** (1ª visita): el de Movimientos lidera con importar.
10. **6 idiomas:** cambiar idioma y ver Planificación + textos nuevos traducidos.

**Arrastradas (siguen sin validar por el founder):**
11. `Sel` (selector propio) en los 3 dispositivos (iOS categoría ✅). · 12. Bug ADMIN `1f9318f`. · 13. Sync §11 iPhone (reconexión 1 toque · auto-finish redirect incógnito · borrado/tombstones · LWW; ⚠️ refresh tokens 7 días si consent en "Testing"). · 14. A5 Safari iOS. · 15. Icono R3 PWA + logo en lock. · 16. Limpiar a mano traspasos duplicados.

### 🟠 DESPUÉS — Continuar el rediseño (spec `12_ONBOARDING_REDESIGN.md`)

- **Fase 4 (pieza grande y delicada):** **modo Prueba** — datos de ejemplo **aislados por prefijo `fh_demo_*`** (garantía "sin miedo": los reales no se leen/escriben en modo demo), banner persistente, entradas onboarding + Ajustes, `enterDemo/exitDemo/resetDemo`, guardas de backup/sync. `src/lib/demoData.ts` (puro + test). + **guía `GettingStarted`** reestructurada Núcleo vs Profundidad (con ejemplos donde el valor no es obvio).
- **Fase 5:** **O5** (portada de bienvenida + captura de nombre solo-local con copy de privacidad) · **O6** (logo en pantallas de contraseña / T&C) · **pasada de copy**: WelcomeTour (arreglar "2 minutos" → maratón, no sprint) + **arreglar el copy falso "0 bytes a la nube"** + añadir la línea del **sync E2E** como expresión de privacidad (§5.L).

**Propón al founder por dónde seguir** tras las pruebas (no asumas). Ambas acercan la beta.

---

## Estado del rediseño (spec `12_ONBOARDING_REDESIGN.md`)
- ✅ **Fase 1** (naming Planificación + reorden tabs) · ✅ **Fase 2** (espina + O1 + aviso suave) · ✅ **Fase 3** (coach import-first + 3 empty states). Todo en producción.
- ⏳ **Fase 4** (modo Prueba + guía) · ⏳ **Fase 5** (marca O5/O6 + copy).
- ⚠️ Deuda menor: claves i18n `onboarding.securityStep.*` sin usar (limpieza trivial).

## Mejora nueva del founder (s.68) — anotada, sin implementar
- **S1** (`08_MEJORAS.md`): Resumen, **drill-down por concepto** → botón por categoría que abre pop-up con lo **planificado** + los **movimientos reales** del mes. Extiende `46f829f`/`ProjectedVsReal`. Pop-up = portal a `document.body`.

---

## ⚠️ Lección operativa crítica (no repetir)
- **"Desplegado/pusheado" SOLO es verdad tras `git push` confirmado con la salida del comando.** Producción la sirve el proyecto Vercel **`finanzas-hogar`** (URL **`https://finanzas-hogar-eta.vercel.app`**). Ciclo: push → redeploy Vercel → reinstalar PWA.
- **El founder factura por token** — no gastar en bucles ni verificaciones que él hace en 30s. No verbose. No bucle "tienes razón".
- **Antes de editar un archivo i18n hay que `Read`-lo.** 6 idiomas: es · en · fr · pt-pt · pt-br · it. Cambiar solo VALORES mantiene la paridad de claves.
- **Patrón anti-"pantalla en negro":** todo modal `position:fixed` por **portal a `document.body`**.
- **Gotcha PowerShell+git:** NO comillas dobles en `git commit -m`. Usar heredoc en git-bash. Stagear archivos explícitos.
- **Verificar cada commit:** `npx tsc --noEmit` + `npm run test:run` (1137 tests). Trabajo directo en `main` (Fase 4).
- **SVG→PNG:** usar `@resvg/resvg-js` en scratchpad (no gstack, no `package.json`).

## ESTADO: rediseño del onboarding — Fases 1-3 EN PRODUCCIÓN. Falta validación del founder en iPhone → luego Fase 4 (modo Prueba) y Fase 5 (marca+copy).

Cuando hayas leído los .md, dime "listo".
