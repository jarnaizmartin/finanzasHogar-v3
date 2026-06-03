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
| 4 | 🔄 EN CURSO — Dashboard ✅, UX features ✅, sticky bar ✅, responsive pendiente |

---

## ✅ Completado en Sesión 38 (03/06/2026)

**Bugs críticos corregidos:**
- iOS crash "Can't find variable: useRef" — import faltante en SetupProgress (commit 4e6253a)
- CriticalAlertsModal: useEffect con deps [] → ahora deps [criticalAlerts.length] + ref guard

**Sticky bar Dashboard rediseñada:**
- Prop `spread` en StickyCompactBar → KPIs distribuidos con etiqueta visible
- Título acortado a "🏠 Resumen" (4 idiomas)
- Nuevo token `stickyBg` en tema: Dark #0d2a3c / Light #cffafe (antes era casi invisible en dark)
- Márgenes -1.5rem → -2rem: barra ocupa el ancho completo del contenedor

---

## Próxima prioridad: Responsive completo (Fase 4 mobile pass)

Es la tarea más grande que queda antes de la Beta. Muchos ajustes pendientes en iPhone para todas las vistas fuera del Dashboard.

### Pendientes antes de cerrar Fase 4

| Item | Prioridad | Notas |
|---|---|---|
| Responsive completo de todas las vistas | 🔴 Alta | Bugs detectados en iPhone — pasar vista a vista |
| Verificación visual light mode | 🟠 Media | Hacer al cierre de Fase 4 |
| Verificación visual EN de F4-Y+Z | 🟡 Baja | LockScreen, BackupPanel, etc. |
| Naming (Fase B) | 🟡 Baja | Tarea del founder — desbloquea landing E3 |

### Recordatorios operativos

- **Naming:** Fase B pendiente — desbloquea E3 y landing pública
- **Tests:** 964 pasando en main
- **Tablet:** probar en tablet (pendiente de confirmar)
- **Modal alertas:** verificar en PC que aparece al arrancar sesión nueva con alertas críticas activas

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
