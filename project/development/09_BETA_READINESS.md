# 09 — BETA READINESS

> Análisis honesto de qué falta para una **beta privada buena** (Fase 5).
> Rol del asistente aquí: **consultor experto + abogado del diablo** (Reglas 2 y 5).
> Creado: 07/06/2026 (sesión 45). **Para revisar junto al founder.**
> Este documento NO es el roadmap — es el insumo para decidir el corte beta.

---

## Premisa

La beta va a la **red profesional del founder** (~15-30 personas) que meterán **datos financieros reales** en una app **sin backend**. Eso define las prioridades:

> En una app local-first, **perder los datos del usuario una sola vez mata el boca a boca** — que es el predictor #1 de éxito de este proyecto. La fiabilidad del dato pesa más que cualquier feature nueva.

El producto ya es **funcionalmente potente** (cuentas, movimientos, traspasos, proyecciones, objetivos, calendario, previsión, tendencias, informes, alertas, tarjetas, préstamos/amortización, importación bancaria, cifrado, i18n ×4, PWA, backup/restore · 964 tests). El trabajo que falta NO es "más funciones", es **blindaje, pulido de entrada de datos y confianza**.

---

## A) CRÍTICO — bloquea una beta buena

### A1 · Seguridad del dato (lo no negociable)
- **Round-trip backup/restore verificado**: exportar → borrar → importar deja el estado **idéntico** (incluye cifrado, timestamps, todas las entidades). Test e2e real, no unitario con mocks.
- **Auditoría de la whitelist de cifrado**: el bug de pantalla negra (`fh_start_tab` cifrado por error) demuestra que `ENCRYPTION_WHITELIST` es frágil. Revisar TODA clave de `localStorage` leída con `getItem` directo vs la que pasa por cifrado. Puede haber más casos latentes.
- **Estrategia de actualización del Service Worker**: hoy mismo lo sufrimos — un fix desplegado no se ve sin *recarga forzada*. En beta, esto **contamina el feedback** ("sigue roto" cuando es caché). Necesita un aviso "nueva versión disponible → tocar para actualizar" (skipWaiting + prompt). **Crítico para que el feedback de beta sea fiable.**
  - ✅ **Enfoque DECIDIDO (sesión 46): Opción A — `vite-plugin-pwa` (Workbox).** Estándar de industria, detección fiable (assets hasheados que cambian cada deploy), callback `registerSW({ onNeedRefresh })` listo para el banner "Actualizar". Reemplaza el `public/sw.js` manual actual (validado en iPhone) → reconfigurar para no romper el SPA routing/offline que ya funciona. **Pendiente de implementar (sesión 47).** Causa raíz del SW actual: hace `skipWaiting()` automático y `sw.js` no cambia entre deploys (`CACHE_NAME` fijo), por eso nunca dispara `updatefound`.

### A2 · Modales de entrada de datos (UX de captura)
- **Bug conocido del founder**: en los modales de alta (Nuevo Movimiento, Proyección, Traspaso) **los campos de fecha se pisan**. Deben seguir el patrón ya definido y validado en **Nueva Cuenta**: formato de fecha correcto, límites, alineación de importes a la derecha, overlay de divisa.
- En beta la gente **introduce datos constantemente** — si la captura tiene fricción, abandonan. Es de lo primero que tocan.

### A3 · Onboarding → primer valor sin fricción
- Verificar en **dispositivo real** que un usuario nuevo (que NO es el founder) llega a un estado útil sin ayuda: bienvenida → idioma/divisa → primera cuenta → primer movimiento → "ajá".
- Los amigos del founder no tienen su contexto de 15 años. El cold-start tiene que sostenerse solo.

### A4 · Canal de feedback integrado (P1 del backlog)
- Una beta **sin forma de reportar dentro de la app** desperdicia el activo más valioso de la fase: el feedback estructurado.
- No hace falta nada complejo: un "Enviar sugerencia/bug" → email (Web3Forms ya está integrado en el proyecto).

### A5 · Pase de robustez "nada rompe la app"
- Estados límite: CSV malformado, divisa inexistente (M6 ✅), cuentas vacías, importes extremos, fechas inválidas, borrados en cascada.
- Objetivo: **ningún callejón sin salida ni pantalla en blanco**. Safari/iOS es estricto (ya nos crasheó 2 veces por JSC) → probar TODO en Safari real, no solo Chrome.

### A6 · Sincronización ASÍNCRONA multi-dispositivo — 🆕 decisión del founder (sesión 45)
> **El founder considera esto CRÍTICO para que la beta sea "real en el mercado":** una app de finanzas atrapada en un solo dispositivo se siente como un juguete, no como herramienta. Argumento de product-market-fit legítimo.

✅ **DECIDIDO (sesión 46) — Opción (b): vault cifrado vía la nube DEL USUARIO (Google Drive primario).** Diseño completo en `10_SYNC_ARCHITECTURE.md`. **Mantiene "sin backend propio"** (no rompe `00_FOUNDATION.md`); solo adelanta a la beta una forma de sync que estaba en v2. Activación opt-in vía Ajustes (toggle mono/multi-dispositivo). Motor de fusión: LWW por entidad + tombstones (ya existe desde Fase 0.5 B1).

**Argumento contrario (Regla 2):** el sync E2E en tiempo real es el trabajo más grande y arriesgado del proyecto (estaba en Fase 7, "meses 7+"). Forzarlo a la beta amenaza la ventana Q4 2026 y el ritmo sostenible (riesgo de burnout). Cualquier transporte propio erosiona el "sin backend propio".

**Opciones a evaluar (la palabra clave es ASÍNCRONO, no tiempo real):**
| Opción | Backend propio | Esfuerzo | Privacidad |
|---|---|---|---|
| (a) Sync E2E tiempo real + relay propio | Sí | 🔴 Enorme (Fase 7) | Compromete "sin backend" |
| **(b) Vault cifrado vía la nube DEL USUARIO** (iCloud/Drive/Dropbox) | **No** | 🟠 Medio | ✅ Excelente — usuario controla el archivo |
| (c) Export/import manual cifrado | No | 🟢 Casi existe ya | Bien, pero tosco |

**Recomendación del asistente:** ✅ **elegida la opción (b)** (sesión 46). Razón decisiva: además de resolver multi-dispositivo sin operar servidor, **saca al proyecto de la exposición GDPR** (no almacenas datos de usuarios en ningún sitio tuyo) — prioridad explícita del founder. Proveedor primario: **Google Drive `appDataFolder`**. Detalle completo en `10_SYNC_ARCHITECTURE.md`.

---

## B) IMPORTANTE — deseable antes, tolerable durante la beta

- **Pase de pulido móvil completo** de los modales restantes (más allá del fix de fecha de A2): safe-area, tap targets, teclado numérico.
- **Coherencia visual de KPIs entre headers** (C1-C3): no rompe nada, pero da sensación de producto cuidado (referencia Monarch/1Password).
- **Mensaje técnico confuso en AmortizationFormModal** (BK3): si un beta-tester tiene hipoteca, lo verá.
- **Naming + dominio (E3)**: ✅ **DECIDIDO (founder, sesión 45): el naming NO bloquea la beta.** Se arranca con placeholder. Registro de marca/dominio en paralelo, sin frenar.

---

## D) GATES PRE-PRODUCCIÓN PÚBLICA (Fase 6) — auditorías obligatorias

> 🆕 **Decisión del founder (sesión 45): antes de lanzar a producción pública hay que auditar formalmente dos áreas.** No bloquean la beta privada, pero SÍ el lanzamiento público.

### D1 · Auditoría de seguridad
- **Autenticación**: password + métodos alternativos (TOTP, email, etc.) — revisar flujo completo, fuerza, almacenamiento.
- **Cifrado**: AES-GCM 256 + PBKDF2 + KEK/VMK — verificar implementación, parámetros (iteraciones), gestión de claves.
- **Recuperación**: frase de recuperación BIP39-style — flujo de recuperación robusto y probado.
  - ⚠️ **El archivo `Recuperación Pasword.txt` en la raíz del repo se trata aquí**: sacarlo del repo (no debe estar versionado) y revisarlo en el contexto de esta auditoría de recuperación.
- Superficie de ataque, whitelist de cifrado (el bug `fh_start_tab` mostró fragilidad), persistencia.

### D2 · Auditoría de licencias
- Sistema de licencias (Mensual/Anual/Lifetime) — robustez, validación, anti-pirateo razonable.
- Integración de pagos (Stripe/Paddle) cuando llegue Fase 6.

---

## C) MEJORA CONTINUA — durante o después de la beta (NO bloquea)

- Reemplazar los **2.655 `style={{}}` inline** por tokens del sistema de diseño → deuda técnica **invisible al usuario**. No es blocker de beta.
- Búsqueda avanzada (M1), borrado masivo (M2), deshacer descarte (M5) — comodidad, no esencial.
- **Notificaciones push/email (A2 de mejoras)** — ya diferido conscientemente (riesgo de "modal blindness").
- Migración a IndexedDB (backlog) — solo si aparece límite real de localStorage con datos grandes.
- Métricas de uso respetando privacidad — definir en Fase 5, no antes.

---

## Corte beta recomendado (actualizado sesión 45)

> **Mínimo viable para una beta de la que sentirse orgulloso = A1 + A2 + A3 + A4 + A5 + A6.**
> B y C se trabajan **durante** la beta con feedback real guiando el orden.
> Naming (E3): ✅ NO bloquea (decidido). Auditorías D1/D2: gate de **producción pública**, no de beta.

**Orden sugerido de ataque (sesiones 46+):**
1. **A6 — SESIÓN DE DISEÑO del sync asíncrono** (elegir opción a/b/c). Decisión arquitectónica primero, antes de codificar. Bloquea el alcance real de la beta.
2. A2 — modales de fecha/formato (rápido, alto impacto, founder ya lo pidió)
3. A1 — service worker update + auditoría backup/restore + whitelist cifrado
4. A3 — verificación de onboarding en dispositivo real
5. A4 — canal de feedback (rápido, Web3Forms ya integrado)
6. A5 — pase de robustez en Safari iOS

**Decisiones del founder ya tomadas (sesión 45):**
- ✅ Naming NO bloquea la beta (placeholder OK).
- ✅ Sync asíncrono multi-dispositivo = CRÍTICO para la beta. **Enfoque DECIDIDO (sesión 46): Opción (b) vault cifrado en la nube del usuario, Google Drive primario, opt-in vía Ajustes (mono/multi-dispositivo). Ver `10_SYNC_ARCHITECTURE.md`.**
- ✅ Auditorías de seguridad (D1) y licencias (D2) obligatorias antes de producción pública.
