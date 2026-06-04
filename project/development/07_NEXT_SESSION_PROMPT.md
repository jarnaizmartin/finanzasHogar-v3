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
| Pre-4 | ✅ COMPLETA |
| 4 | 🔄 EN CURSO — Responsive 12/12 ✅ · Light mode ✅ · Pendiente: PWA + UX |

---

## ✅ Completado en Sesiones 39 + 40 (04/06/2026)

**Responsive pass COMPLETO (12/12 vistas):**
Bottom Nav ✅ · Categorías ✅ · Cuentas ✅ · Movimientos ✅ · Proyecciones ✅
Objetivos ✅ · Alertas ✅ · Tendencias ✅ · Calendario ✅ · Traspasos ✅ · Previsión ✅ · Informes ✅

**StickyCompactBar responsive** (global — afecta todas las vistas) ✅

**Modales safe-area iOS** (AccountForm, RealExpenseForm, ProjectionForm, GoalWizard) ✅

**Verificación light mode** (7 vistas, 390×844): PASS ✅
Fix: CalendarHeader "Junio De 2026" → "Junio de 2026" ✅

**Patrón establecido:**
- `useIsMobile()` hook con guard JSDOM
- Grids: `isMobile ? 'repeat(M,1fr)' : 'repeat(N,1fr)'`
- Modales: `max(1rem, env(safe-area-inset-top/bottom))` + `min(90svh, 90vh)`

---

## Próxima prioridad — validación del founder en curso

El founder está realizando una **comprobación visual y funcional completa** de la app.
Esperar feedback antes de arrancar trabajo nuevo.

### Una vez validado, el orden de trabajo es:

| Prioridad | Tarea | Notas |
|---|---|---|
| 🔴 Alta | Aplicar feedback del founder de la validación | Bugs o ajustes detectados |
| 🔴 Alta | Service Worker (PWA real) | Sin SW no hay PWA instalable |
| 🟠 Media | PWA: manifest + iconos + splash | Instalar en iPhone |
| 🟠 Media | UX improvements (D1 ya ✅) | Ver `08_MEJORAS.md` Fase 4 |
| 🟡 Baja | Reemplazar 2.655 `style={{}}` inline | Post-PWA |
| 🟡 Baja | Naming (tarea founder) | Desbloquea E3 + landing |

### Recordatorios operativos
- **Tests:** 964 pasando en main
- **Último commit:** `4e014a2 fix(calendar): capitalización correcta del nombre del mes`
- **Vercel:** desplegado y accesible para validación del founder
- **Naming:** pendiente del founder — desbloquea E3 y landing pública

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
