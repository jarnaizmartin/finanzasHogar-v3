Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 56**.

Protocolo de arranque:

Lee primero `00_FOUNDATION.md` (las 5 reglas del juego, especialmente Reglas 1, 2 y 4).
Lee la última entrada de `05_SESSION_LOG.md` (Sesión 55) para saber dónde lo dejamos.
Lee `§Próximo hito inmediato` en `01_ROADMAP.md` y el ADR `10_SYNC_ARCHITECTURE.md` §11.
Confirma con "listo" antes de proponer nada.

---

## ⚠️ Lección operativa crítica (no repetir)

- **"Desplegado" SOLO es verdad tras `git push` confirmado con la salida del comando.** Producción la sirve el proyecto Vercel **`finanzas-hogar`** (URL **`https://finanzas-hogar-eta.vercel.app`**), que despliega desde `origin/main`. Hay un duplicado vivo (`finanzashogar-v3`) — compartir SIEMPRE la URL `-eta`.
- **El founder factura por token** — no gastar en bucles ni verificaciones que él hace en 30s.
- **Headless NO reproduce iOS ni el OAuth real** — esos los valida el founder en dispositivo real.
- **Gotcha PowerShell+git:** comillas dobles dentro del mensaje de `git commit -m` rompen el split → no usar `"` en el cuerpo del commit. Y `git add -A` fue bloqueado por el sandbox → stagear archivos explícitos.

---

## ESTADO: §11 (reconexión AUTOMÁTICA del sync) CODE-COMPLETE y desplegado. Falta que el founder TERMINE la validación e2e.

La sesión 55 resolvió el problema que reportó el founder (el sync no se reconectaba solo, sobre todo en iPhone). Se migró el sync de **GIS** (sin refresh token, roto en iOS) a **OAuth Authorization Code + PKCE con redirect + refresh token**, vía una **función serverless stateless de solo-auth** (`api/google-token.ts`, primer backend del proyecto — mantiene cero-conocimiento + GDPR). **Puntos 1-6 implementados, 1133 tests, en `origin/main`.** Detalle completo en `05_SESSION_LOG.md` §Sesión 55 y `10_SYNC_ARCHITECTURE.md` §11.

Config ya hecha por el founder: redirect URIs en Google Console + `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` en Vercel `finanzas-hogar` + redeploy.

### 🧪 LO INMEDIATO: terminar la validación e2e (el founder la dejó a medias)
Orden de prueba:
1. **PC A (primario):** recarga forzada → Ajustes → Sincronización → **Conectar Google Drive** → Google → vuelves → contraseña maestra → **Completar conexión**.
   - Si sale **`[INVALID_VAULT]`** (probable: hay un vault viejo en Drive con el salt corrupto del bug que arreglamos) → botón **"Borrar la copia de la nube y empezar de cero"** → confirmar → Completar otra vez (crea vault nuevo con salt válido).
2. **PC B (segundo), con A ya conectado:** recarga forzada → Conectar → **misma contraseña** → Completar → empareja.
3. **Sincroniza:** cambio en A → "Sincronizar ahora" → en B "Sincronizar ahora" → debe aparecer.
4. **Prueba clave (el motivo de §11):** cerrar/reabrir → **reconecta solo**, sin pedir reconectar. Sobre todo en **iPhone** (PWA), que es donde antes fallaba siempre.

Si algo falla: ahora hay pista → consola `[sync] completar conexión falló: …` + el `[CÓDIGO]` en pantalla. Pasar esa línea.

### ⚠️ Avisos honestos (Regla 1) sobre §11
- **Refresh tokens en modo "Testing":** si la pantalla de consentimiento de Google sigue en **Testing**, los refresh tokens **caducan a los 7 días** → la reconexión automática se "olvidaría" cada semana. Para la beta real hay que **publicar la app** (estado "In production"); con el scope `drive.appdata` puede requerir revisión de Google (sin confirmar). No bloquea validar ahora.
- Si el founder cambia de URL de producción (no `-eta`), añadir su origen a `OAUTH_ALLOWED_ORIGINS` en Vercel y la redirect_uri en Google.

---

## Resto del corte beta (Fase 5) — pendiente

1. **Sync — validación funcional restante** (tras la reconexión): #3 borrado/tombstones (ambos conectados → borrar en disp.1 → sincronizar ambos → ¿desaparece y NO reaparece?), #2 modal de duplicados, LWW/contraseña distinta. Plan en `05_SESSION_LOG.md` §Sesión 50.
2. **A5** — pase de robustez en **Safari iOS real** (código ya blindado).

### 🔴 Sigue SIN resolver: hallazgo estratégico de onboarding (A3)
1er tester: arranque largo, no transmite valor. **Regla 2 (n=1): NO rediseñar con un solo tester.** Repartir invitaciones (`/beta-{es,en,fr}.html`) → 2-3 testers → sesión de rediseño. Detalle en `A3_FIELD_TEST.md` §Resultado.

## Deuda registrada (no bloquea beta — `06_BACKLOG.md`)
- 🔴 Lint/type-check pre-existente: `tsc -b` ~25 errores + eslint ~347 (React Compiler). El CI **no** corre `tsc`; el gate real es Vitest + `vite build`.
- **Tipos de cambio (`api.frankfurter.app`) bloquea CORS a veces** → la app usa tipos aproximados (fallback). Ajeno al sync; anotar si molesta.
- Cripto/IO sin tests unitarios; `useLoanAmortization` sin tests.

## Carril comercial (naming) — aparte
`FinanzasHogar` es placeholder. **Naming NO bloquea la beta.**

## Recordatorios operativos
- Conventional commits. Un commit = una idea. Cada commit deja la app funcionando.
- Lógica pura siempre en `src/lib/` con su test.
- gstack `/qa` y screenshots vía skill `gstack`; headless NO reproduce iOS ni OAuth.

Cuando hayas leído los .md, dime "listo".
