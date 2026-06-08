Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 48**.

Protocolo de arranque:

Lee primero `00_FOUNDATION.md` (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de `05_SESSION_LOG.md` (Sesión 47) para saber dónde lo dejamos.
Lee `§Próximo hito inmediato` en `01_ROADMAP.md`.
Lee `10_SYNC_ARCHITECTURE.md` COMPLETO (es el ADR del sync — el trabajo de esta sesión).
Confirma con "listo" antes de proponer nada.

---

## ⚠️ Lección operativa crítica (no repetir)

- **"Desplegado" SOLO es verdad tras `git push` confirmado con la salida del comando.** Vercel (`finanzas-hogar-eta.vercel.app`) despliega desde `origin/main`.
- **A1 ya resuelto:** el SW ahora es `vite-plugin-pwa` (Workbox) con banner "Nueva versión disponible → Actualizar". Si el founder no ve un cambio, ya NO suele ser caché del SW (el banner lo gobierna); aun así verificar con `curl` del bundle de prod antes de tocar nada.
- **El founder factura por token** — no gastar en bucles ni verificaciones que él hace en 30s.

---

## 🥇 LO PRIMERO sesión 48 — A6: empezar a CODIFICAR el sync

**Decidido y diseñado (sesión 46): Opción B — vault cifrado en la nube DEL USUARIO, sin backend propio.** Todo el diseño en `10_SYNC_ARCHITECTURE.md`. Resumen para no perderlo:
- **Proveedor primario:** Google Drive `appDataFolder` (OAuth PKCE en cliente). iCloud/Dropbox post-beta.
- **Motor de fusión:** LWW por entidad + tombstones (ya existe desde Fase 0.5 B1 — reusar, no reinventar).
- **UX:** toggle mono/multi-dispositivo en Ajustes, **opt-in**. Emparejamiento con la misma contraseña maestra.
- **Mantiene "sin backend propio"** (no rompe `00_FOUNDATION.md`); saca al proyecto de la exposición GDPR (prioridad del founder).

**Enfoque sugerido:** sesión dedicada y fresca. Trocear el sync en bloques pequeños y verificables (OAuth/conexión Drive → leer/escribir vault cifrado → motor de merge → toggle de Ajustes → casos límite). Un commit = un bloque. NO big-bang.

**Casos límite ya identificados en el diseño:** desconexión (suave / borrar de nube), primer merge (reutilizar `findDuplicate` para movimientos), contraseña distinta, schemaVersion.

---

## 🥈 Pendientes menores (no bloquean A6)
- **A3 (resto):** test de campo de onboarding con un usuario nuevo real (tarea del founder; audit + guion ya entregados). La detección de idioma ya está hecha.
- **A5 (resto):** pase de robustez en **Safari iOS real** (tarea del founder; el lado código está hecho).
- **D1:** sacar `Recuperación Pasword.txt` de la raíz (no versionar) — se trata en la auditoría de seguridad pre-producción.
- **Deuda lint/type-check** (`06_BACKLOG.md` §5): añadir `tsc` al CI + decidir severidad de reglas del React Compiler. Tanda propia, no mezclar con features.

---

## Estado al cerrar sesión 47
- **980 tests** · build OK · trabajo directo en `main` (Fase 4).
- Corte beta: A1 ✅ · A2 ✅ · A3 🔶 (idioma ✅) · A4 ✅ · A5 ✅ código · **A6 = siguiente**.
- Último commit: `9ff356c fix(bank-import): A5 — fechas invalidas del CSV usan today()`.

## Recordatorios operativos
- Conventional commits. Un commit = una idea. Cada commit deja la app funcionando.
- Lógica pura siempre en `src/lib/` con su test.
- gstack `/qa`: vía skill `gstack`; headless NO reproduce bugs de iOS (esos los valida el founder).

Cuando hayas leído los .md, dime "listo".
