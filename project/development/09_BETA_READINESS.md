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

---

## B) IMPORTANTE — deseable antes, tolerable durante la beta

- **Pase de pulido móvil completo** de los modales restantes (más allá del fix de fecha de A2): safe-area, tap targets, teclado numérico.
- **Coherencia visual de KPIs entre headers** (C1-C3): no rompe nada, pero da sensación de producto cuidado (referencia Monarch/1Password).
- **Mensaje técnico confuso en AmortizationFormModal** (BK3): si un beta-tester tiene hipoteca, lo verá.
- **Naming + dominio (E3)**:
  - *Recomendación:* **no bloquear la beta privada por el naming**. Una beta a red cercana tolera el placeholder (Nortia).
  - *Argumento contrario (Regla 2):* un nombre/dominio real **sí** suma credibilidad incluso en privado, y registrar marca/dominio lleva tiempo → conviene arrancar el trámite **en paralelo**, no como bloqueante.

---

## C) MEJORA CONTINUA — durante o después de la beta (NO bloquea)

- Reemplazar los **2.655 `style={{}}` inline** por tokens del sistema de diseño → deuda técnica **invisible al usuario**. No es blocker de beta.
- Búsqueda avanzada (M1), borrado masivo (M2), deshacer descarte (M5) — comodidad, no esencial.
- **Notificaciones push/email (A2 de mejoras)** — ya diferido conscientemente (riesgo de "modal blindness").
- Migración a IndexedDB (backlog) — solo si aparece límite real de localStorage con datos grandes.
- Métricas de uso respetando privacidad — definir en Fase 5, no antes.

---

## Corte beta recomendado (para discutir mañana)

> **Mínimo viable para una beta de la que sentirse orgulloso = A1 + A2 + A3 + A4 + A5.**
> B y C se trabajan **durante** la beta con feedback real guiando el orden.

**Orden sugerido de ataque (sesiones 46+):**
1. A2 — modales de fecha/formato (rápido, alto impacto, founder ya lo pidió)
2. A1 — service worker update + auditoría backup/restore + whitelist cifrado
3. A3 — verificación de onboarding en dispositivo real
4. A4 — canal de feedback (rápido, Web3Forms ya integrado)
5. A5 — pase de robustez en Safari iOS

**Pregunta abierta para el founder:** ¿la beta es "free, sin nombre definitivo, a 15 personas" (entonces E3 no bloquea) o quieres nombre+dominio antes de enseñarlo? Eso decide si E3 entra en el corte crítico.
