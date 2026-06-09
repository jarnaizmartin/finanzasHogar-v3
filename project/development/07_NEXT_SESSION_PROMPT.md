Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 49**.

Protocolo de arranque:

Lee primero `00_FOUNDATION.md` (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de `05_SESSION_LOG.md` (Sesión 48) para saber dónde lo dejamos.
Lee `§Próximo hito inmediato` en `01_ROADMAP.md`.
Lee `10_SYNC_ARCHITECTURE.md` COMPLETO — es el ADR del sync (el trabajo en curso). Presta atención a **§5.1 (estrategia de tombstones INLINE)**, que es la decisión que gobierna la sesión 49.
Confirma con "listo" antes de proponer nada.

---

## ⚠️ Lección operativa crítica (no repetir)

- **"Desplegado" SOLO es verdad tras `git push` confirmado con la salida del comando.** Vercel (`finanzas-hogar-eta.vercel.app`) despliega desde `origin/main`.
- **El founder factura por token** — no gastar en bucles ni verificaciones que él hace en 30s.
- **Headless NO reproduce iOS** — esos bugs los valida el founder en dispositivo real.

---

## 🥇 LO PRIMERO sesión 49 — A6 #1: PLUMBING DE TOMBSTONES (invasivo)

**Contexto:** en la sesión 48 se construyó y probó TODA la base pura del sync (transporte OAuth+Drive validado en navegador real, motor de merge `mergeSnapshots`, codec del vault `vaultCodec`). Lo único que queda de A6 es la **integración con React/datos**, y empieza por el bloque más delicado, que se aparcó a propósito para hacerlo con cabeza fresca.

**Decisión ya tomada (ADR §5.1): tombstones INLINE** — el borrado es `deletedAt` en el propio registro, con **API de borrado explícita + filtrado en la frontera del `DataContext`**. NO log separado.

**Hoy los borrados son DUROS:** los componentes hacen `setX(prev => prev.filter(...))` y la entidad desaparece. `stampDelete` (lib/timestamps.ts) existe pero nadie lo llama. Con borrado duro el merge no propaga borrados (un elemento borrado reaparece desde el otro dispositivo). Activar tombstones es el prerrequisito de #2.

**Plan de #1 (trocear en commits pequeños y verificables):**
1. **Filtrado en la frontera del `DataContext` (`src/contexts/DataContext.tsx`):** exponer a la UI las listas ya filtradas (`x.filter(e => !e.deletedAt)`) manteniendo la lista completa (con tombstones) para persistencia/sync. ⚠️ Verificar que `buildFullSnapshot` (AppProvider) lea la lista COMPLETA, no la filtrada — si no, el sync no propagaría borrados. Y que los contadores de backup cuenten solo vivos.
2. **API de borrado explícita:** `deleteX(id)` que pone `deletedAt` (usar `stampDelete`). Reescribir los sitios de *hard delete* (greppar `\.filter(` sobre setters de entidades) para que pasen por la nueva API.
3. Tests: borrar pone `deletedAt`; la UI no ve la entidad; el snapshot sí la incluye.

⚠️ Vigilar: nada de *hard delete* debe quedar (rompería la propagación). El radio de impacto se contiene en la frontera del DataContext — los 100+ consumidores no cambian.

---

## 🥈 Después de #1

- **#2 Bucle pull→merge→push:** construir `SyncSnapshot` desde el estado → `encodeVault` → `provider.writeVault`; `provider.readVault` → `decodeVault` → `mergeSnapshots` → aplicar al estado (patrón `restoreBackup` en AppProvider). Anti-carrera (§8.1): re-pull-merge-push si `writeVault` lanza `CONFLICT`. `findDuplicate` (lib/bankImportRules.ts) para marcar movimientos sospechosos tras el primer merge (§8.3). Disparadores: al abrir (multi ON), debounce ~3s tras cambios, botón "Sincronizar ahora".
- **#3 Toggle en Ajustes:** apartado "Sincronización / Dispositivos" (opt-in mono/multi), "Conectar Google Drive", estado conectado, "Desconectar" (suave) / "Desconectar y borrar de la nube" (con aviso §8.2), emparejamiento del 2º dispositivo (misma contraseña), i18n ×4.

Estimación: ~3 sesiones para cerrar A6.

---

## Piezas del sync ya construidas y probadas (sesión 48) — en `src/lib/sync/`
- `types.ts` — interfaz `SyncProvider` + `VaultBlob` + `SyncError` (códigos incl. `WRONG_PASSWORD`, `SCHEMA_TOO_NEW`, `CONFLICT`…).
- `tokenState.ts` — estado del access_token de GIS (caducidad + margen).
- `googleScript.ts` — carga idempotente del SDK de Google (bajo demanda).
- `googleDriveProvider.ts` — `connect`/`disconnect`/`isConnected`/`isConfigured` + I/O del vault. `getActiveAccessToken()` (no en la interfaz) da el token vivo. **Validado en navegador real.**
- `driveRest.ts` — REST de Drive `appDataFolder` (read/write/delete) con concurrencia optimista por `version`.
- `mergeSnapshots.ts` — `mergeCollection` (LWW por id) + `mergeSnapshots` + tipo `SyncSnapshot`.
- `vaultCodec.ts` — `encodeVault`/`decodeVault` (snapshot ⇄ blob cifrado) + `VAULT_SCHEMA_VERSION`.

**Forma del snapshot** (lo que cifra el vault) = `buildFullSnapshot().data` en `AppProvider.tsx`: `{accounts, categories, projections, realExpenses, goals, bankFormats, categoryRules, baseCurrency, displayCurrency, dark, licenseState}`. `SyncSnapshot` = eso + `timestamp`.

---

## Estado al cerrar sesión 48
- **1027 tests** · sin errores de tipo en `src/lib/sync/` · trabajo directo en `main` (Fase 4).
- Capa A (transporte) ✅ validada en navegador real · merge ✅ · codec ✅. Falta integración React/datos (#1→#2→#3).
- Client ID de Google en `.env` local **y** en Vercel (prod). Consent screen en "Testing" con el founder como test user.
- Corte beta: A1 ✅ · A2 ✅ · A3 🔶 (idioma ✅) · A4 ✅ · A5 ✅ código · **A6 base hecha, integración pendiente**.
- Último commit técnico: `51ec19e feat(sync): codec del vault`.

## Pendientes menores (no bloquean A6)
- **A3 (resto):** test de campo de onboarding con usuario nuevo real (founder).
- **A5 (resto):** pase de robustez en Safari iOS real (founder).
- **D1:** sacar `Recuperación Pasword.txt` de la raíz (auditoría seguridad pre-producción).
- **Deuda lint/type-check** (`06_BACKLOG.md` §5): añadir `tsc` al CI + reglas del React Compiler. Tanda propia.

## Recordatorios operativos
- Conventional commits. Un commit = una idea. Cada commit deja la app funcionando.
- Lógica pura siempre en `src/lib/` con su test.
- gstack `/qa`: vía skill `gstack`; headless NO reproduce bugs de iOS.

Cuando hayas leído los .md, dime "listo".
