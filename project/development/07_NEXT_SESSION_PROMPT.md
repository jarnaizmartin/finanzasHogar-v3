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
| Pre-4 | ✅ COMPLETA — todos los items AHORA cerrados |
| 4 | 🔄 EN CURSO — rediseño visual Dashboard en progreso |

---

## Próxima prioridad: Dashboard — secciones pendientes

### Rama activa: `feat/dashboard-redesign`

El Hero del Dashboard ya está rediseñado y commiteado (`6f612f4`). Faltan por rediseñar:

1. **Sección "Estado por cuenta"** — grid de cards por cuenta (header con tinte por tipo, saldo real, previsión mensual)
2. **Sección "Tarjetas de crédito"** — resumen de deuda/disponible/utilización + lista por tarjeta
3. **Sección "Préstamos e hipotecas"** — resumen + lista con barra de progreso

El criterio visual es el mismo que el onboarding y la landing: tipografía más grande y bold, más aire, identidad premium.

Al terminar: merge `feat/dashboard-redesign` → `main` + push.

---

## Recordatorios operativos

- **Naming:** Fase B (generación de candidatos) pendiente — desbloquea E3
- **Verificación visual EN completa** de F4-Y y F4-Z (LockScreen, BackupPanel, etc.) — sigue pendiente
- **vercel.json** añadido: el routing SPA es explícito en Vercel
- **Tests:** 964 pasando en main

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
