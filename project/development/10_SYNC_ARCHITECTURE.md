# 10 — ARQUITECTURA DE SINCRONIZACIÓN (ADR)

> Registro de decisión de arquitectura para el sync multi-dispositivo.
> Creado: 08/06/2026 (sesión 46) — sesión de diseño A6.
> Estado: **DECIDIDO** (dirección y proveedor primario). Diseño de detalle e implementación: pendientes.
> Rol del asistente en esta decisión: consultor experto + abogado del diablo (Reglas 2 y 5).

---

## Estado

| Campo | Valor |
|---|---|
| Decisión | **Opción B — vault cifrado en la nube DEL USUARIO** |
| Proveedor primario | **Google Drive (`appDataFolder`)** |
| Motor de fusión | **Last-Write-Wins (LWW) por entidad + tombstones** (ya existe desde Fase 0.5 B1) |
| Activación | **Opt-in** vía Ajustes (toggle mono-dispositivo / multi-dispositivo) |
| Backend propio | **No** (OAuth PKCE puro cliente) — mantiene `00_FOUNDATION.md` |
| Impacto en FOUNDATION | Suave: adelanta a la beta una forma de sync que estaba en v2. NO rompe "sin backend propio". |

---

## 1. Problema

El founder considera el sync multi-dispositivo **crítico para que la beta sea "real en el mercado"** (sesión 45): una app de finanzas atrapada en un solo dispositivo se siente como un juguete. El requisito: **mismos datos en varios dispositivos, automático y transparente, manteniendo privacidad radical.**

## 2. Fuerzas en tensión

Tres requisitos que tiran en direcciones opuestas. No se maximizan los tres a la vez:

1. **Automático y transparente** (cero fricción para el usuario)
2. **Privacidad radical** — con dos sub-prioridades explícitas del founder:
   - 2a. Privacidad absoluta: **nadie**, ni el founder, puede acceder a los datos.
   - 2b. **Cero exposición a GDPR / protección de datos** por almacenar datos de usuarios.
3. **Founder solo, 10-15h/semana**, sin deuda operativa.

## 3. Decisión

**Opción B: los datos se guardan, siempre cifrados, en la cuenta de nube del propio usuario.** El founder no opera ningún servidor ni almacena nada. La llave de descifrado se deriva de la contraseña maestra del usuario y **nunca sale del dispositivo**.

### Por qué B y no un relay propio (Opción A)

La diferencia decisiva es la **prioridad 2b (GDPR)**:

- **B** — como no almacenas datos de usuarios en ningún sitio tuyo, **no eres custodio de una base de datos** de información financiera. La exposición GDPR se desploma. Es justo el lío que el founder quiere evitar.
- **A (relay zero-knowledge propio)** — aunque el servidor sea ciego (no puede descifrar), bajo GDPR **los datos cifrados que tú custodias siguen siendo datos personales** (el cifrado es medida de seguridad ex art. 32, no anonimización). Seguirías siendo responsable del tratamiento: notificación de brechas, derechos del usuario, etc. Menos carga que datos en claro, pero **no cero**.

> ⚠️ Honestidad (Regla 1): el asistente no es abogado. La dirección está bien establecida, pero la confirmación legal formal es parte de la auditoría **D2** antes de producción pública (Fase 6).

El único punto donde A ganaba era "automático sin elegir proveedor". No compensa frente a meterse en el compliance que se quiere evitar.

## 4. Proveedor primario: Google Drive

| Proveedor | PWA multiplataforma | Cobertura | Backend propio | Veredicto |
|---|---|---|---|---|
| **Google Drive** (`appDataFolder`) | ✅ API REST en web/iOS/Android/desktop | 🟢 Enorme (cualquier Gmail) | ❌ No (OAuth PKCE cliente) | 🥇 Primario |
| iCloud | ❌ Solo ecosistema Apple; acceso web complejo | 🟡 Solo Apple | — | ❌ No (reconsiderar en app nativa) |
| Dropbox | ✅ | 🟡 Menos extendido | ❌ No | 🥈 Segundo (post-beta) |

**Razón decisiva:** Drive es el único que funciona bien desde una PWA en **todas** las plataformas a la vez (iPhone + portátil de cualquier SO) con cliente puro sin backend, y con la cobertura más amplia.

**Ventajas de `appDataFolder`:**
- Carpeta **oculta por-app**: no aparece en el Drive del usuario, no la puede ensuciar ni borrar por error.
- Scope `drive.appdata` **acotado**: la app solo ve su propia carpeta, no el resto del Drive.

> Pendiente de confirmar al implementar (Regla 1): el nivel exacto de verificación que Google exige para el scope `drive.appdata`. Se cree ligero (no es acceso total a Drive), no afirmado al 100%.

**Argumento contrario (Regla 2):** atar la feature estrella de privacidad a **Google** tiene un roce narrativo ("privacidad radical... en Google"). Respuesta: está cifrado E2E (Google ve ruido), es la cuenta del usuario, no la del founder. Mitigación: añadir Dropbox/local pronto para el nicho anti-Google.

## 5. Arquitectura por capas

### Capa A — Transporte
- Google Drive REST API, carpeta `appDataFolder`.
- OAuth 2.0 con PKCE (flujo puro cliente, sin backend).
- Blob cifrado AES-GCM 256; llave derivada de la passphrase vía PBKDF2 (arquitectura KEK/VMK ya existente).

### Capa B — Motor de fusión
- **Ya resuelto al ~80% desde Fase 0.5 (B1):** las 7 entidades core tienen `createdAt`/`updatedAt`/`deletedAt`.
- **Last-Write-Wins por entidad** usando `updatedAt`. Tombstones (`deletedAt`) para borrados.
- Caso de uso = **un solo usuario con varios dispositivos** (no colaboración). LWW es suficiente y robusto.
- **CRDTs (Yjs/Automerge) descartados para v1:** resuelven edición colaborativa simultánea, problema que aquí no existe. Eran para v2 (Fase 7). No introducir ahora.

## 6. UX — el toggle mono/multi (idea del founder, sesión 46)

En **Ajustes de la aplicación** (modal ya existente: Idioma → Pestaña inicio → Fecha → Divisas), nuevo apartado **"Sincronización / Dispositivos"**:

- **Mono-dispositivo (por defecto):** local puro, sin conexión. Protege el onboarding sin fricción (A3) y la privacidad por defecto.
- **Multi-dispositivo:** "Conecta tu Google Drive". Tras OAuth, sincroniza al abrir la app y tras cada cambio (con debounce). Reversible.

**Beneficios del opt-in:**
1. Sync nunca por defecto → privacidad por defecto.
2. El usuario es dueño de la decisión → marketing de privacidad.
3. Cubre la pega de cobertura: quien no tenga/quiera Google se queda en mono-dispositivo y la app funciona igual (no se pierde al cliente, solo la feature de sync para esa minoría). Fallback: export/import manual cifrado.

### Flujo de emparejamiento del 2º dispositivo
1. Instala la app en el portátil → "¿Restaurar desde tu Google Drive?"
2. Conecta Google (misma cuenta).
3. Introduce **la misma contraseña maestra** → descifra el vault.

> Punto a comunicar claramente al usuario: **"usa la misma contraseña maestra en todos tus dispositivos"** — la llave se deriva de ella; sin la misma contraseña, el otro dispositivo no puede descifrar. Cero claves viajando = zero-knowledge real.

## 7. Limitaciones conocidas (honestidad)

- **"Background total" no existe en iOS PWA:** Safari iOS no soporta Background Sync ni Periodic Background Sync. El sync ocurre **al abrir y mientras se usa la app**, no con la app cerrada. Para el caso de uso es suficiente y se siente automático. Es limitación de plataforma (Apple), no de la arquitectura.
- **Misma contraseña obligatoria** en todos los dispositivos (ver §6).
- **Conflicto de edición offline simultánea** de la misma entidad en dos dispositivos → LWW descarta una versión. Aceptable para single-user en v1; registrar para v2 si el feedback lo pide.

## 8. Decisiones de detalle (sesión 46)

### ✅ Resueltas

**1. Formato del vault y ciclo de sync.**
- **Snapshot completo cifrado** (no oplog). Reutiliza el backup/restore ya probado. El oplog es sobreingeniería para el volumen de datos de finanzas personales. Re-evaluar a deltas solo si el tamaño molesta en beta.
- **Ciclo pull → merge → push** (nunca push directo):
  1. Al abrir la app (multi ON): descarga blob remoto → merge LWW → actualiza local.
  2. Tras cada cambio: debounce ~3s → push.
  3. Botón manual "Sincronizar ahora" (red de seguridad).
  4. **Anti-carrera (optimistic concurrency):** leer el `etag`/revisión de Drive antes de subir; si cambió entre medias (otro dispositivo escribió), re-pull-merge-push. Dos dispositivos nunca se pisan a nivel de archivo.

**2. Desconexión — dos acciones** (confirmado founder):
- **"Desconectar"** (suave): para de sincronizar, datos locales intactos, el blob en Drive permanece. Reconectar retoma.
- **"Desconectar y borrar de la nube"**: además borra el blob de Drive.
- ⚠️ Aviso obligatorio en la 2ª: *"Otros dispositivos conectados volverán a subir la copia al sincronizar"* (comportamiento distribuido honesto).

**3. Primer merge con datos preexistentes en ambos dispositivos** (confirmado founder — caso raro):
- Entidades creadas por separado tienen UUIDs distintos → el merge LWW las **une** (no se pierde nada). Único efecto: posibles **duplicados lógicos**.
- **Movimientos:** reutilizar `findDuplicate()` de `src/lib/bankImportRules.ts` (heurística tipo + importe ±0,01 + fecha ±2 días) tras el merge para marcar sospechosos. Cero heurística nueva. Apunte: O(n×m), se corre una vez, indexar por importe al implementar.
- **Resto de entidades** (cuentas, categorías, proyecciones, objetivos): pocas y visibles → aviso simple *"Hemos combinado los datos de tus dispositivos: X cuentas, Y movimientos. Revisa si hay duplicados."* Detección automática para estas entidades → backlog post-beta.
- **Casos límite defensivos del motor:**
  - Contraseña distinta en el 2º dispositivo → no descifra → mensaje *"La contraseña no coincide con tu vault. Usa la misma que en tu otro dispositivo."*
  - `schemaVersion` del blob > app local → *"Actualiza la app para sincronizar"*. Nunca corromper.

### ⏳ Aún abiertas
- **Multi-proveedor (Dropbox, iCloud):** post-beta, según feedback.
- **Tamaño del snapshot a largo plazo:** medir en beta; migrar a deltas solo si molesta.

## 9. Alternativas descartadas

| Opción | Por qué se descarta |
|---|---|
| **A — Relay zero-knowledge propio** | Mantiene responsabilidad GDPR (datos cifrados bajo tu custodia = datos personales) + coste/operación. Choca con prioridad 2b. |
| **C — Carpeta sincronizada (File System Access API)** | No funciona en iOS Safari (dispositivo principal de prueba). |
| **D — P2P directo (WebRTC)** | No es asíncrono: requiere ambos dispositivos online a la vez. |
| **E — Export/import manual cifrado** | Es el "manual" que el founder rechaza. Se mantiene solo como **fallback** para quien no use nube. |

## 10. Impacto en `00_FOUNDATION.md`

- **"Sin backend propio (cero servidor que vea datos)"** → **se mantiene y se refuerza.** B no introduce ningún backend.
- **"Local-first puro v1, sync E2E v2"** → matizado: local-first **por defecto**; sync **opcional y opt-in** vía nube del usuario **desde la beta**. Sync E2E con relay propio **sigue descartado**.
- Cambio aplicado con OK explícito del founder (sesión 46), cumpliendo el requisito del propio FOUNDATION (discusión explícita).
