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
| 2 | 🔄 EN CURSO — E3 bloqueada (naming + dominio pendientes) |
| 3 | ✅ COMPLETA — F4-P→Z4 ✅ · Landing EN/FR/PT-BR ✅ |
| 4+ | ⏳ Pendiente |

Tests: **962 pasando**. Rama: `main` — al día con origin/main (push hecho al cerrar sesión 34).

---

## Próxima prioridad

**Fase 3 está COMPLETA.** La siguiente sesión tiene dos opciones:

### Opción A — Verificación visual EN (pendiente de hacer)
Protocolo: cambiar idioma a EN en la app y navegar todas las secciones trabajadas en F4-Y y F4-Z para confirmar que no quedan strings en español. Especialmente:
- LockScreen (bloquear app → todos los steps)
- BackupPanel (📦 icono en header)
- LicenseScreens (solo visible en modo trial/expired)
- GoalCard (pestaña Objetivos)
- RulesEditorModal (importación bancaria → ⚙️ Reglas)
- Wizard de importación (títulos de pasos)
- Print (imprimir cualquier sección, revisar cover + header + footer)

### Opción B — Fase 2-E3 (si naming está cerrado)
Si el nombre definitivo ya está decidido:
1. Actualizar `src/config/app.ts` con `APP_NAME` real
2. Registrar dominio
3. Publicar landing con los 4 idiomas (E3)
4. Traducir landing (E4) — ya tenemos EN/FR/PT-BR ✅

### Opción C — Iniciar Fase 4 (Mobile/PWA)
Si se prefiere avanzar con el producto antes que resolver naming:
- Diseño responsive completo (mobile-first)
- Service Worker + PWA manifest
- Validación cross-device

---

## Recordatorios operativos

- Verificación visual EN es OBLIGATORIA antes de declarar Fase 3 como "lista para beta"
- Naming: 6 finalistas, decisión pendiente del founder (ver `project/commercial/03_NAMING.md`)
- Push hecho: rama `main` sincronizada con origin/main

Cuando hayas leído los archivos .md del /project, dime "listo" y arrancamos.
