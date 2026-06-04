Hola. Retomamos proyecto finanzasHogar-v3.

Protocolo de arranque:

Lee primero 00_FOUNDATION.md (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de 05_SESSION_LOG.md para saber dónde lo dejamos.
Lee §Próximo hito inmediato en 01_ROADMAP.md antes de proponer nada.
Confirma que has entendido el contexto antes de proponer nada.

---

## Estado de fases

| Fase | Estado |
|---|---|
| 0.5 | ✅ COMPLETA |
| 1 | ✅ COMPLETA |
| 2 | 🔄 EN CURSO — E3 bloqueada (naming + dominio pendientes del founder) |
| 3 | ✅ COMPLETA — i18n 4 idiomas, 964 tests pasando |
| Pre-4 | ✅ COMPLETA — todos los items cerrados |
| 4 | 🔄 EN CURSO — Bottom Nav ✅, Responsive 9/12 vistas ✅ |

---

## ✅ Completado en Sesión 39 (04/06/2026)

**Infrastructure mobile:**
- `useIsMobile` hook (con guard JSDOM para tests)
- `BottomNav` — 4 tabs primarias + panel "Más" — patrón Revolut/N26
- AppShell header móvil: logo + lock + ⋯ (bottom sheet con todas las acciones)
- Fix: T.text → T.title (token inexistente → texto invisible dark mode)
- Settings modal: título "Ajustes de la aplicación" + reordenado

**StickyCompactBar responsive (fix global):**
- Título oculto en móvil, márgenes corregidos (-1rem vs -2rem), KPI font reducida

**Modales safe-area iOS (global):**
- Overlay: `max(1rem, env(safe-area-inset-top/bottom))`
- maxHeight: `min(90svh, 90vh)` — `svh` excluye chrome Safari

**Responsive pass completado (9/12 vistas):**
Categorías ✅ · Cuentas ✅ · Gastos Reales ✅ · Proyecciones ✅
Objetivos ✅ · Alertas ✅ · Tendencias ✅ · Calendario ✅ · Dashboard ✅

---

## Próxima prioridad: Responsive vistas pendientes

### Pendientes antes de cerrar el responsive pass

| Vista | Estado | Notas |
|---|---|---|
| Traspasos | ⏳ Pendiente | Vista lista de traspasos entre cuentas |
| Previsión | ⏳ Pendiente | Forecast/previsión a largo plazo |
| Informes | ⏳ Pendiente | La vista más compleja — gráficos + tablas |

### Después del responsive
- Verificación visual light mode — todas las vistas en modo claro
- PWA: Service Worker + manifest + iconos + splash
- Validación cross-device: iOS Safari real + Android Chrome
- UX improvements pendientes (U1-U5, M1-M5, etc.)
- Naming (tarea del founder) → desbloquea landing E3

### Recordatorios operativos

- **Tests:** 964 pasando en main
- **Commits sesión 39:** f4405ce → 3d7db58 (12 commits)
- **Patrón responsive establecido:** `useIsMobile` + grid condicional + clamp() + safe-area
- **Naming:** Fase B pendiente — desbloquea E3 y landing pública

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
