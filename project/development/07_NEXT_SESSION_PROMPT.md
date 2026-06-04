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
| 4 | 🔄 EN CURSO — Responsive ✅ · Light mode ✅ · PWA ✅ · Pendiente: revisión visual + UX |

---

## ✅ Completado en Sesiones 39–41 (04/06/2026)

**Responsive pass COMPLETO (12/12 vistas)** ✅

**PWA COMPLETA** ✅
- Service Worker (network-first + SPA routing fallback)
- Manifest corregido (iconos reales, teal theme)
- Header safe-area: `paddingTop: env(safe-area-inset-top)` — no se solapa con barra iPhone
- Validado en iPhone por el founder

**Onboarding: selector de idioma** ✅
- Primer campo de la pantalla de bienvenida (antes de divisa)
- Cambia UI al instante, persiste en localStorage

**Header desktop mejorado** ✅
- Botón "EUR →" → icono `Settings` (engranaje = ajustes generales)
- Botón seguridad → icono `ShieldCheck` (diferenciado del anterior)

---

## Próxima prioridad

| Prioridad | Tarea | Notas |
|---|---|---|
| 🔴 Alta | **Revisión visual completa** (founder) | Pendiente — detectar bugs / ajustes |
| 🔴 Alta | **Naming definitivo** (founder) | En curso — desbloquea E3 + landing |
| 🔴 Alta | Aplicar feedback de la revisión visual | Bugs o ajustes detectados |
| 🟠 Media | UX improvements | Ver `08_MEJORAS.md` Fase 4 |
| 🟡 Baja | Reemplazar 2.655 `style={{}}` inline | Post-UX |

### Recordatorios operativos
- **Tests:** 964 pasando en main
- **Último commit:** `c5d7a97 fix(header): icono seguridad → ShieldCheck`
- **Vercel:** desplegado y accesible
- **Naming:** decisión en curso con el founder

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
