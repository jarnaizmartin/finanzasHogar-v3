# 02 — DECISIONS LOG (Comercial)

> Bitácora de decisiones comerciales/de negocio. Una entrada por decisión cerrada.
> **Cuándo añadir:** al cerrar formalmente un bloque o tomar una decisión importante.
> **Cuándo modificar:** solo si la decisión se revierte (registrar reversión, no borrar).
> Última actualización: 22/05/2026

---

## 📊 Vista general — Bloques de decisión

| Bloque | Tema | Estado |
|---|---|---|
| **0** | Validación legal con Ford | ✅ CERRADO |
| **1** | Estructura jurídica (fase inicial) | ✅ CERRADO |
| **2** | Naming + marca + dominios | 🔄 EN CURSO |
| **3** | Modelo de monetización (precios, planes, MoR) | ⏳ Pendiente |
| **4** | Plan de negocio (3 años) | ⏳ Pendiente |
| **5** | Estrategia comercial (segmentos, canales, mensaje) | ⏳ Pendiente |
| **6** | Stack técnico-comercial (web, pagos, email, soporte) | ⏳ Pendiente |
| **7** | Estructura operativa (mantenimiento, soporte, escalado) | ⏳ Pendiente |
| **8** | Plan de lanzamiento (beta privada → público → escala) | ⏳ Pendiente |

---

## ✅ BLOQUE 0 — Validación legal con Ford

**Fecha de decisión:** 22/05/2026
**Estado:** CERRADO

### Contexto
El founder trabaja por cuenta ajena en Ford Credit desde 1991. Antes de avanzar con cualquier decisión comercial, se valida que no existan restricciones contractuales que impidan desarrollar y comercializar FinanzasHogar.

### Análisis
- **Contrato laboral:** firmado en 1991, en puesto no directivo
- **Cláusulas IP modernas:** no aplicables (no eran comunes en 1991 para ese tipo de puestos)
- **Sin firmas adicionales:** el founder no ha firmado contratos posteriores con cláusulas restrictivas
- **Sector:** Ford Credit es servicios financieros B2B/auto, FinanzasHogar es B2C planificación personal → no competencia directa

### Decisión
✅ **Camino libre para desarrollar y comercializar FinanzasHogar como actividad personal del founder.**

### Argumento contrario considerado (regla 2)
Se identificaron 3 matices que no invalidan la decisión pero conviene tener presentes:

1. **Políticas corporativas vigentes ≠ contrato firmado**: Ford puede tener Code of Conduct o políticas internas (Conflict of Interest, Outside Activities) que apliquen a todos los empleados. Recomendación: revisar la intranet por si acaso. **No bloqueante**.
2. **Misma industria**: cuando la app tenga tracción mediática, podría generar incomodidad interna. Mitigación futura: considerar mover la propiedad a una sociedad que no figure a nombre del founder directamente.
3. **Recursos de Ford**: NO usar jamás equipo, email, red o tiempo laboral de Ford para FinanzasHogar.

### Compromisos derivados
- 🛡️ Todo desarrollo desde equipo personal, conexión personal, tiempo personal
- 🛡️ Cero referencias a Ford en marketing, comunicación o documentación de FinanzasHogar
- 🛡️ Si en el futuro Ford publica una política interna que afecte, reevaluar

---

## ✅ BLOQUE 1 — Estructura jurídica (fase inicial)

**Fecha de decisión:** 22/05/2026
**Estado:** CERRADO (para fase actual D)

### Contexto
Antes de cobrar a un solo usuario, se debe decidir bajo qué estructura jurídica operará el negocio. Opciones analizadas:
- **A)** Autónomo España
- **B)** SL en España
- **C)** Estonia e-Residency
- **D)** Esperar y validar primero (beta gratis sin estructura)

### Variables consideradas

| Variable | Respuesta del founder |
|---|---|
| Ingresos esperados año 1 | Imposible estimar honestamente — rechazó inventar números |
| Patrimonio personal a proteger | Sí, existe |
| Dependencia familiar del salario Ford | Sí, pero seguirá trabajando en Ford |
| Necesidad de facturación profesional desde día 1 | No — válido validar con amigos primero |
| Apetito de papeleo | Bien con apoyo de gestoría |

### Decisión
✅ **Camino acordado: D → A → B** (escalado por fases con datos reales)

#### Fase actual: D — Beta gratis sin estructura jurídica
- Sin alta de autónomo ni SL
- Sin cobros, sin facturación
- Validación con red personal (~15 usuarios iniciales del Excel histórico + nuevos)
- Duración estimada: 3-6 meses (alineada con timeline técnico)

#### Fase 2 (futura): A — Autónomo (cuando 20-30 usuarios digan "lo pagaría")
- Tarifa plana primer año (~80€/mes)
- Gestoría externa (~50-80€/mes)
- Cobros vía Stripe / Paddle (decisión pendiente Bloque 6)
- Seguro de RC profesional (~200€/año recomendado)

#### Fase 3 (futura): B — SL (cuando facturación >30-40K€/año o >200 clientes)
- Decisión basada en datos reales, no planificación teórica
- Reevaluar A vs B con números en la mano (founder explícitamente rechazó decidir entre A y B sin datos)

### Argumento contrario considerado (regla 2)
**¿Por qué no SL desde Fase 2 directamente, dado que existe patrimonio personal?**

Razones para NO ir directamente a SL:
1. La app no maneja dinero de usuarios (local-first) → riesgo de demanda muy bajo
2. T&C con cláusula de limitación de responsabilidad cubren el 90% del riesgo real
3. Autónomo con seguro RC profesional está prácticamente igual de protegido para este caso de uso
4. SL desde el día 1 cuesta ~3.000€/año adicionales por una protección probablemente innecesaria

**Si el founder priorizara "dormir tranquilo" sobre eficiencia económica**, SL desde Fase 2 sería válida. Decisión postpuesta conscientemente hasta tener datos.

### Aprendizaje del founder destacado
El founder rechazó explícitamente decidir A vs B sin datos reales, demostrando criterio maduro: *"Decidir hoy entre A y B es planificar en el vacío."* Esto se registra como **principio operativo**: no tomar decisiones sin datos cuando se puede esperar.

### Compromisos derivados
- 📌 Cuando se llegue a Fase 2 (primeros pagos), revisar A vs B con datos reales
- 📌 Antes de cualquier alta formal: validar con gestor profesional
- 📌 Antes de cobrar el primer euro: Términos y Condiciones + Política de Privacidad + Aviso Legal redactados y publicados

---

## 🔄 BLOQUE 2 — Naming + marca + dominios

**Fecha de inicio:** 22/05/2026
**Estado:** EN CURSO — Fase A (criterios y restricciones) iniciada, pendiente respuestas del founder

### Contexto
"FinanzasHogar" no es viable para ambición global por razones documentadas en el análisis técnico:
- 100% español, no traducible
- "BANCA PERSONAL" como bajada: riesgo regulatorio real (no se puede usar "banca" sin licencia)
- SEO horrible (genérico)
- Sin disponibilidad probable de dominio internacional

### Método acordado (5 fases)

| Fase | Descripción | Duración estimada | Estado |
|---|---|---|---|
| **A** | Criterios y restricciones | 20 min | 🔄 En curso |
| **B** | Generación de candidatos | 30 min | ⏳ Pendiente |
| **C** | Filtro técnico (dominios + marca EUIPO/USPTO) | 1-2 horas tarea founder | ⏳ Pendiente |
| **D** | Filtro humano (validación con 5-10 personas) | 3-5 días | ⏳ Pendiente |
| **E** | Decisión final + reserva de dominio/marca | 1 día | ⏳ Pendiente |

**Tiempo total estimado:** 1-2 semanas. **No acelerable** sin meter la pata.

### Criterios obligatorios del nuevo nombre
1. Funciona en inglés (idioma principal de visión global)
2. Una sola palabra o máximo dos cortas
3. Dominio `.com` disponible (o `.app`/`.io` como mínimo aceptable)
4. Sin conflicto de marca en EUIPO/USPTO
5. Pronunciable en 5+ idiomas
6. Memorable en 3 segundos
7. **Sin riesgo regulatorio** (evitar "bank", "banca", "wallet" sin más, "invest", etc.)

### Restricciones de tono (alineadas con perfil "Jesús")
- ❌ NO cute/gamificado (estilo Cleo, Pinkie, Albert)
- ❌ NO infantil/desenfadado
- ✅ Premium, serio, confiable (estilo Wealthsimple, Vanguard, Ledger, Compass)
- ✅ Sugiere control, anticipación, claridad financiera, soberanía

### Estado actual (al cierre de la sesión 2, 25/05/2026)
✅ **Fase A COMPLETADA.** Las 5 preguntas de criterios + pre-pregunta de tono han sido cerradas. Brief de naming consolidado y listo para Fase B.

**Resumen del brief consolidado (detalle completo en `03_NAMING.md`):**

| # | Pregunta | Decisión |
|---|---|---|
| Pre- | Tono general | Premium/serio (no cute) |
| P1 | Alma del nombre | Claridad + Privacidad/Seguridad |
| P2 | Idioma | Latín / raíz neutra |
| P3 | Longitud | Media (8-10 letras, 1 palabra) |
| P4 | Norte estético | Monarch + Readwise + 1Password / calibración 80/20 |
| P5 | Anti-criterios | 6 bloqueantes (A,B,C,D,E,G) + 1 flexible (F) |

**Próximo paso en Sesión 3:** Fase B — Generación de 15-20 candidatos latinos según brief.

**Detalles registrados para retomar:**
- Pre-pregunta de tono confirmada (lapsus "cute/familiar" resuelto: familia = beta testers iniciales ≠ target final Jesús).
- Concepto clave aprendido: el nombre EVOCA, no EXPLICA.
- Concepto clave aprendido: las capas de marca son independientes (nombre clásico + visual moderno = calibración 80/20).
- Recordatorio: ningún candidato se genera antes de cerrar Fase A. Cero improvisación. **Fase A ya cerrada → luz verde para Fase B.**

### Detalles registrados para retomar
- **Pre-pregunta clave:** ¿Enfoque premium/serio confirmado? (consistente con descarte previo de perfil "Marco")
- **Recordatorio:** ningún candidato se genera antes de cerrar Fase A. Cero improvisación.

---

## ⏳ BLOQUES PENDIENTES (resumen para futuras sesiones)

### BLOQUE 3 — Modelo de monetización (precios, planes, MoR)
- Validar precios actuales (€9,99 / €79 / €299) con benchmarking competitivo real
- Decidir Merchant of Record (Paddle, Lemon Squeezy) vs procesador puro (Stripe)
- Política de reembolsos
- Trials / pruebas gratuitas
- Descuentos / cupones / códigos

### BLOQUE 4 — Plan de negocio (3 años)
- Proyección de ingresos con 3 escenarios (conservador / esperado / optimista)
- Estructura de costes recurrentes
- Punto de equilibrio (break-even)
- Inversión inicial necesaria
- ROI esperado

### BLOQUE 5 — Estrategia comercial (segmentos, canales, mensaje)
- Segmentación detallada del usuario "Jesús"
- Canales de adquisición priorizados
- Mensaje de marca (positioning statement)
- Plan de contenido (blog, newsletter, redes)
- Estrategia de boca-a-boca / referidos

### BLOQUE 6 — Stack técnico-comercial
- Hosting de landing page
- Sistema de pagos (Stripe / Paddle / Lemon Squeezy)
- Email marketing (Mailchimp, ConvertKit, Resend)
- Soporte al cliente (Crisp, Intercom, email directo)
- Analytics respetuoso con privacidad (Plausible, Fathom)
- CRM mínimo viable

### BLOQUE 7 — Estructura operativa
- SLA de soporte (cuándo responder, en qué idiomas)
- Documentación pública (FAQ, base de conocimiento)
- Gestión de incidencias
- Plan de continuidad (¿qué pasa si el founder se enferma?)

### BLOQUE 8 — Plan de lanzamiento
- Beta privada: lista de invitados, mecánica, KPIs
- Onboarding de beta testers
- Recopilación estructurada de feedback
- Iteración rápida
- Transición beta → público
- Estrategia de lanzamiento público (Product Hunt, prensa, etc.)

---

## 📌 Cómo se usa este documento

- **Al inicio de cada sesión comercial:** se lee la última decisión cerrada y el estado del bloque en curso
- **Al cerrar un bloque:** se actualiza el estado en la vista general + se añade la entrada completa
- **Al revertir una decisión:** se registra la reversión con fecha y razón, NO se borra la decisión original
- **Al descubrir nuevos sub-bloques:** se añaden al pending list correspondiente
