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
| Pre-4 | ✅ COMPLETA — todos los items AHORA cerrados (02/06/2026) |
| 4 | ⏳ Pendiente — Mobile / PWA + Mejoras UX (ver 08_MEJORAS.md) |

Tests: **964 pasando**. Rama: `fix/pre-fase4-bugs` — **pendiente de mergear a main**.

---

## Próxima prioridad: Merge + inicio Fase 4

### Paso 1 — Merge `fix/pre-fase4-bugs` → `main`
El branch está en origin con todos los fixes cerrados. Hay que:
1. Abrir PR en GitHub o hacer merge directo
2. Verificar CI verde
3. Push a main

### Paso 2 — Inicio Fase 4 (Mobile / PWA + Mejoras UX)
Ver sección `⏳ FASE 4` en 01_ROADMAP.md para el scope completo.

Tareas técnicas de Fase 4:
- Diseño responsive completo (mobile-first)
- Reemplazar los 2.655 `style={{}}` inline por tokens del sistema de diseño
- Service Worker (ya mejorado en B3) + PWA instalable completa
- Optimización táctil (tap targets, gestos)
- Validación cross-device (iOS Safari, Android Chrome, desktop)

Mejoras UX incluidas en Fase 4 (ver 08_MEJORAS.md tabla "Incluidos en FASE 4"):
- U1–U5, M1–M5, C1/C2/C3, A1, N2, P1, BK3
- A2 (notificaciones push/email): analizar juntos al final antes de implementar

### Notas sobre B2 (email seguridad)
El fix de B2 es pragmático: el código se muestra en pantalla (local-first = el código
ya está en el dispositivo del usuario). El email va al admin como audit log. Para una
solución completa de envío al usuario, habría que migrar a un servicio transaccional
(Resend, SendGrid) — se deja para post-beta cuando haya ingresos.

---

## Recordatorios operativos

- **Naming:** Fase B (generación de candidatos) pendiente — desbloquea E3
- **Verificación visual EN completa** de F4-Y y F4-Z (LockScreen, BackupPanel, etc.) — sigue pendiente
- **vercel.json** añadido: el routing SPA ahora es explícito en Vercel

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
