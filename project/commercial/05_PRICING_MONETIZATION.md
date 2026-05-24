# 05 — PRICING & MONETIZATION

> Documento de trabajo del modelo de monetización.
> Recoge decisiones cerradas y abre el trabajo del Bloque 3.
> Última actualización: 22/05/2026

---

## 🎯 Filosofía de monetización

Heredada del `00_FOUNDATION_COMMERCIAL.md` §3:

- ❌ NO vendemos datos
- ❌ NO añadimos publicidad
- ❌ NO oscurecemos precios con dark patterns
- ❌ NO cobramos por features que ya prometimos gratis
- ✅ El usuario paga por valor real, lo entiende, y puede cancelar/exportar cuando quiera
- ✅ Pricing transparente en la web desde el día 1 (sin "contacta con ventas")

---

## 1. Estructura de planes — ESTABLECIDA (precios a validar en Bloque 3)

| Plan | Precio | Descripción |
|---|---|---|
| **Mensual** | €9,99 / mes | Flexibilidad máxima, sin compromiso |
| **Anual** | €79 / año | ~34% descuento vs mensual, equivale a €6,58/mes |
| **Lifetime** | €299 (pago único) | Sin suscripción para siempre. Diferenciador "anti-subscription fatigue" |

### ✅ Decisiones estructurales cerradas

- **3 planes, no más** — simplicidad de elección (paradox of choice)
- **Lifetime es no negociable** — diferenciador clave en mercado saturado de suscripciones
- **No freemium permanente** — riesgo de canibalización + soporte gratis insostenible
- **Sí beta gratis temporal** — validación, no monetización

### 🔄 PENDIENTE — Bloque 3

- [ ] **Validar los 3 precios** con benchmarking real de competidores (YNAB, Monarch, Copilot, Lunchmoney, Wallet by BudgetBakers, etc.)
- [ ] Decidir si Lifetime tiene **cupo limitado** (ej: primeros 500, o solo año 1) o es permanente
- [ ] Decidir si existe **early-adopter discount** para beta testers que conviertan a pago

---

## 2. Lo que cubre cada plan

### ⏳ A definir en Bloque 3

Por ahora hipótesis de trabajo:

- **Todos los planes incluyen la misma funcionalidad** (no se diferencian por features)
- Lo que cambia es **modelo de pago**, no producto
- **Razón:** mantener producto simple. No queremos tabla de features tipo "Plan Basic / Pro / Enterprise" — eso es para SaaS B2B, no para nuestro perfil "Jesús"

### ⚠️ Decisión pendiente sobre dispositivos

- [ ] ¿1 licencia = 1 dispositivo? ¿2? ¿3?
- [ ] Caso de uso real del founder: hijas en Canadá/Bélgica que querrán acceso → considerar "plan familiar" o licencias multi-dispositivo
- [ ] Si multi-dispositivo: ¿sincronización entre dispositivos del mismo usuario? (decisión técnica + comercial conjunta)

---

## 3. Trials y pruebas gratuitas

### ⏳ A definir en Bloque 3

Opciones a considerar:

| Opción | Pro | Contra |
|---|---|---|
| **Sin trial** (compra directa con reembolso 14d) | Simple, alinea incentivos | Fricción de entrada |
| **Trial 14 días sin tarjeta** | Conversión fácil de probar | Conversión baja típica |
| **Trial 30 días con tarjeta** | Conversión más alta (compromiso) | Más fricción inicial |
| **Demo limitada para siempre** (ej: 1 escenario) | Bajo riesgo para usuario | Canibalización |

**Hipótesis actual:** reembolso 14 días sin preguntas, sin trial. Pero validar.

---

## 4. Política de reembolsos

### ⏳ A definir en Bloque 3

- [ ] ¿14 días sin preguntas? ¿30 días?
- [ ] ¿Reembolso completo siempre o prorrateado en anual?
- [ ] ¿Lifetime tiene política especial? (riesgo de abuso)
- [ ] Compatibilidad con derecho de desistimiento consumidor UE (14 días obligatorios)

---

## 5. Merchant of Record vs Procesador puro

### 🔄 Decisión clave del Bloque 3

| Opción | Fee típico | Ventaja | Desventaja |
|---|---|---|---|
| **Stripe puro** | ~2.9% + €0.25 | Más barato, control total | TÚ gestionas IVA EU, sales tax US, facturas, fraude |
| **Paddle** (MoR) | ~5% + $0.50 | Ellos gestionan IVA global, facturas, fraude | Más caro |
| **Lemon Squeezy** (MoR) | ~5% + $0.50 | Como Paddle, UX más moderna, popular en indie | Empresa joven (riesgo de continuidad) |

### Recomendación tentativa (a confirmar en Bloque 3)

**Paddle o Lemon Squeezy** (MoR completo) → ahorra meses de complejidad fiscal global. El 2% extra de fee es trivial frente al coste de contratar fiscalista internacional + gestión propia de IVA OSS.

**Argumento contrario:** si en Fase D solo cobramos en EU y volumen es bajo, Stripe + OSS puede ser suficiente. Decisión real depende de geografía de usuarios beta.

---

## 6. Estrategia de cupones / descuentos

### ⏳ A definir en Bloque 3

- [ ] **Cupón de referido**: ¿descuento al referidor + descuento al referido?
- [ ] **Black Friday / Cyber Monday**: ¿participamos o cero descuentos como diferenciación?
- [ ] **Cupones a partners** (asesores fiscales, EAFs): ¿programa de afiliados?
- [ ] **Early-adopter código** para primeros 100 (típico en indie SaaS)

**Filosofía a debatir:** ¿somos premium-sin-descuentos (estilo Apple) o usamos descuentos puntuales como herramienta de marketing?

---

## 7. Métricas a vigilar post-lanzamiento

Heredadas del `00_FOUNDATION_COMMERCIAL.md` §6:

- **MRR** (Monthly Recurring Revenue): objetivo €9-27K en 12 meses post-lanzamiento
- **Churn mensual:** <5%
- **CAC** (coste de adquisición): <€20/usuario
- **LTV** (lifetime value): >€150
- **% de mix por plan:** ¿qué % elige mensual / anual / lifetime?
- **Conversión beta → pago:** ≥30% (señal de PMF)
- **Refund rate:** vigilar para detectar promesas exageradas

---

## 8. Hipótesis de proyección preliminar (sujeta a Bloque 4)

> **DISCLAIMER:** números orientativos. Se trabajan en serio en Bloque 4 (Plan de negocio 3 años) con 3 escenarios.

### Mix asumido (hipótesis): 60% anual / 25% mensual / 15% lifetime

Para llegar al objetivo de **€9.000-27.000 MRR** a 12 meses post-lanzamiento:

- 1.000 usuarios → mix 600 anual + 250 mensual + 150 lifetime ≈ **~€7K MRR + €45K Lifetime acumulado**
- 3.000 usuarios → mix 1.800 anual + 750 mensual + 450 lifetime ≈ **~€20K MRR + €135K Lifetime acumulado**

⚠️ Hipótesis sin validar. **Se trabajan a fondo en Bloque 4.**

---

## 9. Recordatorio de filosofía premium

El usuario "Jesús" **NO compite por precio**. Si dudamos entre €79 y €99 anual, **probablemente €99 es mejor** porque:

1. Filtra usuarios de bajo compromiso (menos soporte, menos churn)
2. Comunica seriedad (un buen producto premium NO cuesta €4,99)
3. Permite economía sostenible con menos usuarios

**Argumento contrario:** precio alto = mercado más pequeño. Validar con benchmarking real, no con intuición.
