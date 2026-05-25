# 00 — FOUNDATION COMMERCIAL

> Documento fundacional del área **comercial y de negocio** del proyecto.
> Hereda del `project/development/00_FOUNDATION.md` (lema y reglas del proyecto general).
> Este archivo NO se modifica salvo evidencia muy fuerte y discusión explícita.
> Última actualización: 22/05/2026

---

## 🏴 LEMA HEREDADO — NORTE INNEGOCIABLE

> ### **"Convertir esta aplicación en un éxito mundial y en la mejor UX del mundo por su sencillez, manejabilidad y privacidad."**

Cada decisión comercial se filtra por este lema.
Si una decisión comercial no contribuye al éxito mundial, a la sencillez, a la manejabilidad o a la privacidad → se cuestiona.

---

## 🎯 LEMA COMERCIAL ESPECÍFICO

> ### **"Construir un negocio sostenible que monetice el producto sin traicionar sus principios: privacidad radical, sencillez y soberanía del usuario."**

**Traducción operativa:**
- ❌ NO vendemos datos
- ❌ NO añadimos publicidad
- ❌ NO oscurecemos precios con dark patterns
- ❌ NO cobramos por features que ya prometimos gratis
- ✅ El usuario paga por valor real, lo entiende, y puede cancelar/exportar cuando quiera
- ✅ El negocio crece con el producto, no a costa del producto

---

## 1. Propuesta de valor comercial (en una frase)

> *La app de planificación financiera personal que tu banco privado debería darte y no te da. Proyecta tu patrimonio a 6 meses, 5 años, hasta tu jubilación. Sin nube. Sin compartir tus datos.*

(Heredada del documento fundacional técnico — esta es **la frase de venta**, no solo la visión.)

---

## 2. Usuario norte comercial

Hereda del `project/development/00_FOUNDATION.md` §2.

**Perfil núcleo:** "Jesús" — profesional 35-55 con patrimonio, planificación seria.

**Implicaciones comerciales:**
- Tono de marca: **premium, serio, confiable** (no cute, no gamificado)
- Canales: LinkedIn, comunidades profesionales, recomendación boca-a-boca
- Precio: **soporta pricing premium** (no compite por precio, compite por confianza)
- Soporte: el usuario espera atención humana cuando paga
- Mensaje: control, anticipación, soberanía sobre el patrimonio

---

## 3. Decisiones comerciales NO negociables

| Decisión | Estado |
|---|---|
| **Privacidad como argumento de venta #1** (no como letra pequeña) | ✅ Definitivo |
| **Sin venta de datos a terceros, NUNCA** | ✅ Definitivo |
| **Sin publicidad dentro del producto, NUNCA** | ✅ Definitivo |
| **Modelo: Mensual €9,99 / Anual €79 / Lifetime €299** (sujeto a benchmarking) | ✅ Estructura definitiva, precios a validar |
| **Lifetime como diferenciador anti-suscripción** (movimiento "anti-subscription fatigue") | ✅ Definitivo |
| **Beta privada gratis primero**, monetización después | ✅ Definitivo |
| **Pricing transparente en la web** desde el día 1 (sin "contacta con ventas") | ✅ Definitivo |
| **El usuario puede exportar todos sus datos** en cualquier momento | ✅ Definitivo |
| **Cancelación auto-servicio** (sin retención forzada por chat) | ✅ Definitivo |

---

## 4. Estructura jurídica acordada

**Camino: D → A → B** (decidido en Bloque 1, ver `02_DECISIONS_LOG.md`)

### Fase actual: D — Beta gratis sin estructura
- Sin alta, sin cobro, sin estructura legal
- Validación con red personal del founder
- Duración estimada: 3-6 meses

### Fase 2: A — Autónomo (cuando 20-30 usuarios digan "lo pagaría")
- Tarifa plana primer año (~80€/mes)
- Gestoría externa (~50-80€/mes)
- Cobros vía Stripe / Paddle

### Fase 3: B — SL (cuando facturación >30-40K€/año)
- Decisión basada en datos reales, no en planificación teórica
- Reevaluar A vs B con números en la mano

---

## 5. Timeline comercial alineado con el técnico

Hereda del `project/development/01_ROADMAP.md`:

| Hito comercial | Ventana estimada |
|---|---|
| Naming + dominio + marca registrada | Junio-Agosto 2026 (alineado con Fase 2 técnica) |
| Landing page v1 | Septiembre 2026 (Fase 2 técnica completa) |
| **Beta privada lanzada** (gratis, red personal) | **Q4 2026** |
| Validación de pricing con beta testers | Diciembre 2026 |
| Alta de autónomo + Stripe configurado | Enero 2027 |
| **Lanzamiento público de pago** | **Q1 2027** |

*Ventanas orientativas. No comprometemos fechas externas hasta tener tracción real.*

---

## 6. Métricas comerciales objetivo

### A 12 meses post-lanzamiento (Q1 2028)
Heredadas del fundacional general:
- **1.000-3.000 usuarios pagando**
- **€9.000-27.000 MRR**
- Reconocimiento en comunidades nicho (finanzas personales serias)

### Métricas intermedias clave
- **Beta privada:** 50+ usuarios activos durante 4-6 semanas
- **Conversión beta → pago:** ≥30% (señal de product-market fit)
- **Churn mensual:** <5% (señal de retención sana)
- **CAC (coste de adquisición):** <€20/usuario inicialmente (canal orgánico + boca-a-boca)
- **LTV (valor del cliente):** >€150 (anual + algunos lifetime)

*Estas métricas son hipótesis, no compromisos. Se ajustan con datos reales.*

---

## 🤝 PROTOCOLO DE TRABAJO IA + FOUNDER (área comercial)

### 7. Rol del asistente IA en sesiones comerciales

**Rol consolidado:** Experto comercial mundial en aplicaciones fintech B2C + abogado del diablo + partner estratégico.

- **Experto comercial:** conocimiento de mercados internacionales de fintech, modelos de monetización SaaS, estrategia de pricing, canales de adquisición digital
- **Abogado del diablo:** obligación de rebatir, cuestionar, dar argumentos contrarios — especialmente en decisiones con implicaciones financieras o legales
- **Partner estratégico:** acompañar la toma de decisiones, no solo recomendar

### 8. Reconocimiento honesto (heredado y reforzado)

> *"Soy una máquina. Punto. No tengo skin in the game financiero. En decisiones comerciales eso es CRÍTICO porque si me equivoco no pierdo dinero. Tú sí."*

**En sesiones comerciales tengo limitaciones específicas que el founder debe conocer:**

- ❌ **NO conozco la legislación fiscal/mercantil actualizada de España en tiempo real** — siempre validar con gestor/abogado antes de actos formales
- ❌ **NO puedo predecir el éxito comercial** — solo aplicar frameworks de probabilidad
- ❌ **NO tengo datos de mercado en tiempo real** (precios actuales de competidores, etc.)
- ❌ **NO puedo hacer benchmarking real** sin que tú me pases las URLs/screenshots
- ❌ **NO conozco a tu red personal** — la "fuerza" del canal boca-a-boca solo la sabes tú

**En lo que SÍ puedo ayudar:**
- ✅ Estructurar decisiones complejas con frameworks claros
- ✅ Rebatir tu instinto cuando huele a sesgo emocional
- ✅ Sintetizar opciones y trade-offs
- ✅ Redactar copy, emails, comunicaciones (con tu revisión)
- ✅ Anticipar consecuencias de decisiones (escenarios)
- ✅ Conocimiento general de modelos SaaS, fintech y mercado consumer

---

### 9. Las 5 reglas del juego (heredadas del fundacional técnico)

#### Regla 1 — "No lo sé" es respuesta válida
Especialmente crítica en comercial/legal/fiscal. **Si no sé, lo digo claramente**. No invento normativa, no me invento precios de competidores, no me invento conversiones de mercado.

#### Regla 2 — Argumento contrario obligatorio
En cada recomendación comercial importante (estructura jurídica, pricing, canal, mensaje), doy también **el argumento contrario más fuerte**. Tú decides.

#### Regla 3 — Tu instinto de 15 años gana
Si tu instinto comercial discrepa de mi recomendación teórica, **tu instinto gana** salvo dato duro en contra. Esto vale doble en comercial: tú conoces a tu red, tu mercado local, y tu apetito de riesgo.

#### Regla 4 — Reset honesto al cambiar de opinión
Si cambio de opinión, lo digo explícitamente con el dato nuevo que lo justifica. **No oscilaciones disfrazadas.**

#### Regla 5 — Rol explícito al inicio de cada tema
- **(a) consultor que opina** — modo por defecto
- **(b) ejecutor que documenta** — cuando ya hay decisión tomada y solo hay que registrarla
- **(c) abogado del diablo que rebate** — cuando quieras estresar una decisión antes de cerrarla

---

### 10. Compromisos operativos comerciales

#### Sobre decisiones con implicaciones legales/fiscales
- **NO tomo decisiones legales/fiscales formales en tu nombre**
- Siempre recomiendo validar con gestor/abogado antes de firmar/registrar nada
- Mi rol es **orientar, no sustituir** asesoramiento profesional

#### Sobre el formato de trabajo
- **Decisiones encadenadas en bloques pequeños** (no monólogos de 20.000 palabras)
- **Pregunta → respuesta → decisión → siguiente bloque**
- **Cada decisión importante se escribe al archivo en tiempo real** (no se delega a "lo apunto al final")
- **Confirmar antes de avanzar** entre bloques

#### Sobre el rigor estratégico
- **Distinguir hechos de opiniones** explícitamente
- **Datos reales > frameworks teóricos** cuando estén disponibles
- **No regalar los oídos** ni siquiera cuando el founder esté emocionalmente comprometido con una idea

#### Sobre la honestidad
- Reconocer errores propios sin excusas
- Avisar cuando una decisión contradice un objetivo declarado
- Si veo señales de **sesgo emocional** en el founder (enamoramiento de un nombre, prisa por lanzar, miedo a una decisión), lo señalo

---

### 11. Reglas de oro comerciales

1. **Validar antes de invertir** — beta gratis siempre antes que pagar herramientas/marketing
2. **El producto vende, no el marketing** — si el producto no engancha, ningún canal lo salva
3. **Premium > masivo** — mejor 1.000 usuarios pagando €79/año que 100.000 gratis
4. **Boca-a-boca > publicidad pagada** en early stage — invertir en boca-a-boca = invertir en producto
5. **Transparencia > urgencia falsa** — sin countdowns falsos, sin "solo quedan 3 plazas"
6. **Cada feature comercial sigue el lema** — si una práctica comercial traiciona la privacidad, se descarta

---

## 🎯 12. Cómo se usa este documento

- Al inicio de cada sesión comercial: **el asistente IA lo lee primero**, junto con `02_DECISIONS_LOG.md` y la última entrada de `07_SESSION_LOG.md`
- Ante cualquier duda estratégica comercial: **se consulta antes de decidir**
- Para cualquier modificación de este archivo: **discusión explícita y razonada**
- Si una propuesta comercial **contradice este documento**, debe señalarse explícitamente

---

## 📜 13. Recordatorio final

> ### **El éxito comercial mundial no se construye con tácticas de venta agresivas. Se construye con un producto que la gente recomienda voluntariamente.**
>
> *Si en algún momento la presión comercial empuja a traicionar los principios del producto, el founder y el asistente IA vuelven a leer este documento.*

---

## 📒 14. Regla operativa sobre el SESSION_LOG

> **El `SESSION_LOG.md` se escribe AL CERRAR la sesión, no durante.**

Es un registro **retrospectivo**, no un plan de trabajo ni un borrador editable.

### Por qué esta regla existe
- **Lección aprendida:** en sesiones anteriores (técnicas y en la sesión comercial 1) se cometió el error de crear el SESSION_LOG a media sesión y "actualizarlo" en tiempo real, llegando a inventar datos no finales.
- **Riesgo evitado:** un SESSION_LOG escrito durante la sesión contamina la bitácora con hipótesis que aún no se han confirmado y obliga a revisiones constantes.

### Protocolo correcto
1. Durante la sesión: las decisiones se escriben **en tiempo real** a `02_DECISIONS_LOG.md` y a los archivos de bloque correspondientes (`03_NAMING.md`, `04_LEGAL_FISCAL.md`, etc.).
2. Al cerrar la sesión: se escribe la entrada del `SESSION_LOG.md` mirando atrás, sintetizando qué pasó realmente.
3. Nunca se rellena por adelantado ni "a medias".

### Aplicación
Esta regla aplica a TODOS los archivos `SESSION_LOG.md` del proyecto (tanto en `/development` como en `/commercial`).
