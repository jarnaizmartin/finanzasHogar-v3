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
| 4 | 🔄 EN CURSO — Responsive ✅ · Light mode ✅ · PWA ✅ · Revisión visual en curso |

---

## Estado tras Sesión 44 (05/06/2026)

### ✅ Fix útil en main
- `fh_start_tab` en `ENCRYPTION_WHITELIST` — arregla pantalla negra tras contraseña (no confirmado por founder)

### ❌ Pendiente crítico: U1 — sticky bars móvil demasiado estrechas
- Las barras sticky (Dashboard, Proyecciones, Tendencias, etc.) no llegan al borde derecho en móvil
- Se probaron dos técnicas en `StickyCompactBar.tsx` — ninguna funcionó
- `StickyCompactBar.tsx` actual: `marginLeft:-1rem + marginRight:-1rem` (sin `width` explícito)
- El fix de PC es perfecto — solo falla en móvil

### ⚠️ AccountsSummary.tsx
- Restaurado al diseño validado de sesión 43 (sticky propio 2 filas × 3 columnas)
- NO usar `StickyCompactBar` genérico para Cuentas — tiene su sticky propio por diseño

### Vercel
- Proyecto original: `finanzas-hogar-eta.vercel.app` — conectado a GitHub main, el que usa el founder
- Proyecto nuevo (error): `finanzashogar-v3.vercel.app` — puede eliminarse desde Vercel dashboard

---

## Próxima prioridad

| Prioridad | Tarea | Notas |
|---|---|---|
| 🔴 Alta | **U1: sticky bars móvil** | NO resuelto tras sesión 44 — diagnóstico diferente necesario |
| 🔴 Alta | **Naming definitivo** (founder) | En curso — desbloquea E3 + landing |
| 🟠 Media | U2: barras de progreso con importes | |
| 🟠 Media | U3: Enter activa botón Eliminar en ConfirmModal | |
| 🟠 Media | U4: Entidad bancaria en desplegables | |
| 🟠 Media | U5: Salir sin guardar | |
| 🟡 Baja | UX improvements Fase 4 | Ver `08_MEJORAS.md` — D1/D2/D3, M1-M5 |

### Recordatorios operativos
- **Tests:** 964 pasando en main
- **Último commit:** `23b341d revert(ui): restaurar sticky Cuentas a diseño 2 filas original`
- **AccountsSummary.tsx:** sticky propio — NO reemplazar por StickyCompactBar genérico
- **Vercel original:** `finanzas-hogar-eta.vercel.app` — auto-despliega desde GitHub main

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
