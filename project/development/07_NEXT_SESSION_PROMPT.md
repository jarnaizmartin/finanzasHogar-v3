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

## ✅ Completado en Sesión 42 (04/06/2026)

**7 fixes revisión visual — feedback del founder en iPhone:**

| Fix | Archivo | Descripción |
|---|---|---|
| 1 | `Dashboard.tsx` | Bloque 3 Deuda: cifras con `clamp+overflow` — ya no se cortan |
| 2 | `Dashboard.tsx` | `SOFT_AMBER` → `#fbbf24` (amber-400, legible en ambos modos) |
| 3 | `StickyCompactBar.tsx` | Spread mode: fuente más grande (1rem desktop / 0.82rem mobile) |
| 4 | `AccountsSummary.tsx` | Sticky con `spread` — etiquetas visibles sobre cada número |
| 5 | `RegularAccountCard.tsx` | Ingresos/Mes y Gastos/Mes alineados a la derecha |
| 6 | `AccountFormModal.tsx` | Campo fecha no desborda (`overflow:hidden` en grid) |
| 7 | `AccountFormModal.tsx` | Overlay de divisa en campos Saldo, Mínimo, Límite, Cuota |

---

## Próxima prioridad

| Prioridad | Tarea | Notas |
|---|---|---|
| 🔴 Alta | **Continuar revisión visual** (founder) | Verificar los 7 fixes en iPhone real + detectar más bugs |
| 🔴 Alta | **Naming definitivo** (founder) | En curso — desbloquea E3 + landing |
| 🔴 Alta | Aplicar nuevos bugs detectados en revisión | Si el founder encuentra más tras ver el deploy |
| 🟠 Media | UX improvements Fase 4 | Ver `08_MEJORAS.md` — D1/D2/D3, U1-U5, M1-M5 |
| 🟡 Baja | Reemplazar 2.655 `style={{}}` inline | Post-UX |

### Recordatorios operativos
- **Tests:** 964 pasando en main
- **Último commit:** `7ef9d90 fix(ui): 7 correcciones revisión visual sesión 42`
- **Vercel:** desplegado con los 7 fixes — founder verifica en iPhone real
- **Naming:** decisión en curso con el founder

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
