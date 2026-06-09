Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 50**.

Protocolo de arranque:

Lee primero `00_FOUNDATION.md` (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de `05_SESSION_LOG.md` (Sesión 49) para saber dónde lo dejamos.
Lee `§Próximo hito inmediato` en `01_ROADMAP.md`.
Lee `10_SYNC_ARCHITECTURE.md` COMPLETO — es el ADR del sync. Presta atención a **§5.1 (tombstones INLINE)** y a la **decisión de la opción B (clave de sync derivada)** registrada en sesión 49.
Confirma con "listo" antes de proponer nada.

---

## ⚠️ Lección operativa crítica (no repetir)

- **"Desplegado" SOLO es verdad tras `git push` confirmado con la salida del comando.** Vercel (`finanzas-hogar-eta.vercel.app`) despliega desde `origin/main`.
- **El founder factura por token** — no gastar en bucles ni verificaciones que él hace en 30s.
- **Headless NO reproduce iOS** — esos bugs los valida el founder en dispositivo real.

---

## 🥇 LO PRIMERO sesión 50 — A6 #2: WIRING DEL BUCLE (C2-hook) + TOGGLE (C3)

**Contexto:** en la sesión 49 quedó TODA la lógica del sync hecha, pura y probada (1080 tests). Solo falta el **wiring React/UI**: enchufar el bucle a la app y el toggle de Ajustes. Esta parte se valida **en navegador real**, no por unit tests.

### Piezas ya construidas y probadas (en `src/lib/sync/`)
- `types.ts` — interfaz `SyncProvider` + `VaultBlob` + `SyncError`.
- `tokenState.ts`, `googleScript.ts`, `googleDriveProvider.ts`, `driveRest.ts` — transporte OAuth+Drive (**validado en navegador real, sesión 48**). `getActiveAccessToken()` da el token vivo.
- `mergeSnapshots.ts` — `mergeCollection` (LWW por id, tombstones-aware) + `mergeSnapshots` + tipo `SyncSnapshot`.
- `syncKey.ts` — `deriveSyncKey(password, salt)` / `generateSyncSalt` / `encryptWithKey` / `decryptWithKey`. (Opción B.)
- `vaultCodec.ts` — `encodeVault(snapshot, key, salt)` / `decodeVault(content, key)` / `readVaultHeader(content)` (basado en CLAVE).
- `syncEngine.ts` — `syncOnce(transport, codec, local)` (pull→merge→push + anti-carrera §8.1) + `snapshotsEquivalent`.
- `snapshot.ts` — `buildSyncSnapshot(parts)` + `findMergeDuplicates(before, after)`.
- `runSync.ts` — `runSync({transport, codec, localParts, beforeLiveRealExpenses})` → `{ result, duplicates }`. **Es la pasada completa; el hook solo tiene que llamar a esto.**

### En `DataContext` (ya listo)
- `raw` = las 7 colecciones COMPLETAS (con tombstones) → para armar el snapshot.
- `applySyncedData(data)` = aplica el merge VERBATIM (sin re-sellar timestamps). **Úsalo para volcar `result.snapshot`.**

### En `SecurityContext` (opción B, ya listo)
- `getSyncKey()` → `CryptoKey | null` (en memoria; se deriva en el unlock por contraseña si hay salt).
- `hasSyncSalt()`, `prepareSyncKey(password)` (activar/opt-in primario), `adoptSyncKey(password, salt, iter)` (emparejar 2º dispositivo), `clearSyncKey()`.
- 🔴 **FALTA exponer `getSyncSalt(): string | null`** (lee `fh_sync_salt`) — lo necesita el hook para `encodeVault`. Es un getter de 1 línea; añádelo al empezar.

### Plan de #2 wiring (trocear en commits pequeños)
1. **`getSyncSalt()` en `SecurityContext`** (1 línea + tipo).
2. **C2-hook `useSync`** (probablemente `src/hooks/useSync.ts`, montado en `AppCoreProvider`):
   - **Gating:** solo sincroniza si multi-ON (flag `fh_sync_enabled`) + `googleDriveProvider.isConnected()` + `getSyncKey()` != null.
   - **Pasada:** arma `localParts` desde `raw` (DataContext) + escalares (Settings: baseCurrency/displayCurrency/dark) + `licenseState` (getEncryptedItem) + `timestamp: Date.now()`; construye el codec `{ encode: s => encodeVault(s, key, salt), decode: c => decodeVault(c, key) }`; llama `runSync({ transport: googleDriveProvider, codec, localParts, beforeLiveRealExpenses: liveRealExpenses })`.
   - **Aplicar:** si `result.remoteChanged` → `applySyncedData(result.snapshot)` + setBaseCurrency/setDisplayCurrency/setDark + license. Si `duplicates.length` → avisar (contador + i18n).
   - **Errores → estado:** TOKEN_EXPIRED (re-conectar silencioso o marcar desconectado) · WRONG_PASSWORD (no debería pasar; avisar) · SCHEMA_TOO_NEW ("actualiza la app") · NETWORK (silencioso, reintentar luego).
   - **Disparadores:** al abrir (multi-ON) · debounce ~3s tras cambios en `raw` · botón manual "Sincronizar ahora".
   - **OJO LWW:** aplica SIEMPRE con `applySyncedData` (no con los setters envueltos) para no re-sellar `updatedAt`.
3. **C3 — Toggle en Ajustes** (apartado "Sincronización / Dispositivos"): opt-in mono/multi · "Conectar Google Drive" (`prepareSyncKey(password)` + `googleDriveProvider.connect(true)`) · estado conectado · "Desconectar" (suave) / "Desconectar y borrar de la nube" (aviso §8.2) · emparejamiento del 2º dispositivo (`readVaultHeader` → `adoptSyncKey(password, salt)` → primer pull) · i18n ×4.
4. **Reset masivo de `AppShell`** (deferido de #1): con sync activo, "borrar mis datos" debe tombstonear, no vaciar. Decidir semántica aquí.

⚠️ **Verificación en navegador real** (no headless): round-trip de 2 "dispositivos" (2 perfiles/navegadores) con la misma contraseña → crear en A, sincronizar, abrir B, ver datos; borrar en A → desaparece en B; editar en ambos → LWW.

---

## Estado al cerrar sesión 49
- **1080 tests** · build OK · todo pusheado a origin/main. Último commit: `6bfafcb`.
- **A6 #1 COMPLETO** (tombstones inline enchufados a datos). **A6 #2: toda la lógica pura HECHA y probada**; falta solo wiring React/UI (C2-hook + C3).
- Decisión de seguridad sesión 49: **opción B** — la app mantiene en memoria la CLAVE de sync derivada de la contraseña, **nunca la contraseña**. Aprobado por el founder.
- Client ID de Google en `.env` local **y** en Vercel (prod). Consent screen en "Testing" con el founder como test user.
- Corte beta: A1 ✅ · A2 ✅ · A3 🔶 (idioma ✅) · A4 ✅ · A5 ✅ código · **A6 lógica completa, wiring UI pendiente**.

## Pendientes menores (no bloquean A6)
- **A3 (resto):** test de campo de onboarding con usuario nuevo real (founder).
- **A5 (resto):** pase de robustez en Safari iOS real (founder).
- **D1:** sacar `Recuperación Pasword.txt` de la raíz (auditoría seguridad pre-producción).
- **Deuda lint/type-check** (`06_BACKLOG.md` §5): `tsc` no está en el CI; el gate real es Vitest + build.

## Recordatorios operativos
- Conventional commits. Un commit = una idea. Cada commit deja la app funcionando.
- Lógica pura siempre en `src/lib/` con su test.
- gstack `/qa`: vía skill `gstack`; headless NO reproduce bugs de iOS.

Cuando hayas leído los .md, dime "listo".
