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

## ✅ Completado en Sesión 43 (05/06/2026)

**Revisión visual — múltiples rondas de fixes:**

| Fix | Archivo | Descripción |
|---|---|---|
| 1 | `Dashboard.tsx` | Sticky: `T.green`/`T.red` en lugar de SOFT — más contraste en light mode |
| 2 | `AccountsSummary.tsx` | Sticky completamente rediseñado: 2 filas × 3 columnas (INICIAL/REAL/CTAS. + TARJETAS/PRÉSTAMOS/+Nueva) |
| 3 | `RegularAccountCard.tsx` | Grid 2→3 col: INGRESOS / GASTOS / PROYECTADO en la misma línea |
| 4 | `AccountFormModal.tsx` | Grid divisa+fecha: `7rem minmax(0,1fr)` — no desborda en iOS |
| 5 | `AccountFormModal.tsx` | `height:2.55rem` explícita en divisa y fecha — simétricas |
| 6 | `AccountFormModal.tsx` | `-webkit-appearance:none` en date input para iOS |
| 7 | `AccountFormModal.tsx` | `autoFocus` solo en desktop; en mobile no abre teclado al abrir modal |
| 8 | `AccountFormModal.tsx` | Todos los inputs numéricos: `textAlign:right` + `paddingRight:3rem` |
| 9 | `UI.tsx` | `Input` y `Sel`: soporte de prop `style` externa (merge) |

**CLAUDE.md creado:**
- Protocolo de arranque automático — Claude lee Foundation + Log + Roadmap sin que lo pida el founder

**Emulador Playwright montado (`tmp_pw/shot.cjs`):**
- Viewport 390×844 (iPhone), útil para verificar cambios antes de deploy
- Limitación: banners trial/backup obstruyen navegación en contexto limpio

---

## Próxima prioridad

| Prioridad | Tarea | Notas |
|---|---|---|
| 🔴 Alta | **Continuar revisión visual** (founder) | Verificar en iPhone — sticky Cuentas y modal validados ✅ |
| 🔴 Alta | **Naming definitivo** (founder) | En curso — desbloquea E3 + landing |
| 🟠 Media | UX improvements Fase 4 | Ver `08_MEJORAS.md` — D1/D2/D3, U1-U5, M1-M5 |
| 🟡 Baja | Reemplazar 2.655 `style={{}}` inline | Post-UX |

### Recordatorios operativos
- **Tests:** 964 pasando en main
- **Último commit:** `4162a57 fix(ui): sticky cuentas rediseño 2 filas + modal fecha/autofocus`
- **Vercel:** desplegado y validado por el founder en iPhone ✅
- **Naming:** decisión en curso con el founder
- **CLAUDE.md:** ya en repo — arranca automáticamente en próximas sesiones

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
