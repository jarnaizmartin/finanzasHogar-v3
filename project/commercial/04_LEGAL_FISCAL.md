# 04 — LEGAL & FISCAL

> Documento de trabajo de todos los aspectos legales, fiscales y regulatorios del negocio.
> Recoge decisiones cerradas y pendientes. Las decisiones formales se registran en `02_DECISIONS_LOG.md`.
> Última actualización: 22/05/2026

---

## ⚠️ DISCLAIMER

Este documento es un **registro de trabajo entre el founder y el asistente IA**. NO sustituye asesoramiento legal/fiscal profesional. Antes de cualquier acto formal (alta, contrato, registro de marca, T&C públicos) **validar con gestor/abogado**.

---

## 1. Situación laboral del founder (Ford)

### ✅ CERRADO — Bloque 0 (22/05/2026)

**Conclusión:** sin restricciones contractuales bloqueantes para desarrollar y comercializar FinanzasHogar.

**Compromisos derivados:**
- 🛡️ Desarrollo desde equipo personal, conexión personal, tiempo personal
- 🛡️ Cero referencias a Ford en marketing o documentación
- 🛡️ Cero uso de recursos de Ford (email, red, software corporativo)

### 🔄 Vigilancia continua
- [ ] Revisar intranet Ford por si publican Code of Conduct / Outside Activities Policy
- [ ] Reevaluar si la app gana visibilidad pública relevante (considerar mover propiedad a sociedad)

---

## 2. Estructura jurídica

### ✅ CERRADO (fase actual) — Bloque 1 (22/05/2026)

**Camino acordado:** D → A → B

#### Fase actual: D — Beta gratis sin estructura jurídica
- Sin alta de autónomo ni SL
- Sin cobros, sin facturación
- Validación con red personal
- Duración estimada: 3-6 meses

#### Fase 2 (futura): A — Autónomo
- Disparador: ≥20-30 usuarios diciendo "lo pagaría"
- Setup necesario:
  - [ ] Alta en RETA (Seguridad Social autónomos)
  - [ ] Alta en Hacienda (modelo 037 o 036)
  - [ ] Contratación de gestoría (~50-80€/mes)
  - [ ] Apertura de cuenta bancaria de negocio separada
  - [ ] Seguro de RC profesional (~200€/año)
  - [ ] Modelo de facturación / IVA correcto para SaaS internacional

#### Fase 3 (futura): B — SL
- Disparador: facturación >30-40K€/año O >200 clientes
- Decisión basada en datos reales (rechazado planificar A vs B sin datos)

---

## 3. Documentos legales obligatorios antes de cobrar

### 🔴 Pendientes — bloqueantes antes del primer cobro

- [ ] **Términos y Condiciones** adaptados a SaaS fintech B2C internacional
  - Cláusula de limitación de responsabilidad (la app NO da consejo financiero)
  - Política de cancelación y reembolsos
  - Jurisdicción aplicable
  - Compatibilidad con consumidores EU (Directiva 2011/83/EU)
- [ ] **Política de Privacidad** RGPD-compliant (aunque seamos local-first, hay datos de cuenta/pago)
  - Responsable del tratamiento
  - Datos recogidos (email, datos de pago — gestionados por procesador)
  - Derechos del usuario (ARCO + portabilidad + olvido)
  - Procesadores subcontratados (Stripe/Paddle, email, hosting)
- [ ] **Aviso Legal** (LSSI España)
  - Datos identificativos del titular
  - Información sobre cookies (si las hay)
- [ ] **Política de Cookies** (si la landing las usa)

### 🟡 Recomendables

- [ ] Política de seguridad pública (transparencia sobre el cifrado usado)
- [ ] Página de transparencia: arquitectura local-first explicada para usuarios técnicos
- [ ] DPA (Data Processing Agreement) plantilla por si usuarios corporativos lo piden

---

## 4. Aspectos regulatorios fintech

### 🚨 Términos prohibidos / sensibles en marketing

| Término | Riesgo | Alternativa segura |
|---|---|---|
| "Banca" / "Bank" | Reservado a entidades con licencia bancaria | "Finanzas personales", "Personal finance" |
| "Inversión" / "Invest" | Puede activar regulación CNMV/SEC | "Planificación", "Patrimonio" |
| "Consejo financiero" / "Financial advice" | Requiere licencia de asesor financiero | "Información", "Visualización" |
| "Garantizado" / "Guaranteed returns" | Prohibido sin respaldo regulatorio | Evitar cualquier promesa numérica |

**Regla general:** la app es **herramienta de planificación**, no de asesoramiento. Esta distinción debe quedar clara en T&C, marketing y dentro del producto.

### 📋 Regulaciones a considerar (sin ser bloqueantes en v1)

- **PSD2 / Open Banking EU:** solo aplica si integramos conexión directa con bancos (no es nuestro caso en v1)
- **MiCA (Crypto):** solo si en el futuro añadimos crypto (no es nuestro caso)
- **DORA (Digital Operational Resilience Act):** aplica a entidades financieras reguladas (no a nosotros en v1)

---

## 5. Fiscalidad internacional SaaS

### 🌍 Cuestiones críticas cuando empecemos a cobrar

- [ ] **IVA / VAT EU:** B2C dentro de UE requiere aplicar IVA del país del comprador (régimen OSS — Ventanilla Única)
- [ ] **Sales tax US:** si tenemos usuarios US, depende del estado (nexus económico)
- [ ] **Withholding tax (impuesto en fuente):** depende del país del usuario y del MoR
- [ ] **Facturación electrónica España** (Verifactu / Antifraude): obligatorio progresivamente

### 💡 Por qué Merchant of Record (MoR) simplifica todo

Un MoR como **Paddle** o **Lemon Squeezy** se encarga de:
- Calcular y remitir IVA/sales tax de cada jurisdicción
- Emitir facturas válidas en cada país
- Gestionar fraud / chargebacks
- Ser el "vendedor legal" frente al cliente

**Coste:** ~5% de fee vs ~2.9% de Stripe puro. Pero ahorra **enormemente** en complejidad fiscal global.

**Decisión Stripe vs MoR:** se cierra en Bloque 3 (Modelo de monetización).

---

## 6. Marca y propiedad intelectual

### 🔄 Pendiente al cerrar Bloque 2 (Naming)

- [ ] Decisión: ¿registro formal de marca en EUIPO (~1.000€) o solo reserva de dominio?
- [ ] Si registro: clases Niza relevantes (clase 9 software, clase 42 servicios SaaS, clase 36 servicios financieros — esta última con cuidado)
- [ ] Decisión sobre alcance: UE solo, UE + US, o Madrid System (global)
- [ ] Logo registrable como marca figurativa (cuando esté diseñado, Fase 2 técnica)

### 📝 Sobre el código

- El código del founder es propiedad del founder (validado en Bloque 0)
- Decisión pendiente: ¿código abierto en algún momento? (relevante por el argumento de privacidad — auditable = más creíble)

---

## 7. Plantilla de checklist pre-lanzamiento legal

Al cerrar Fase Comercial 3 (infraestructura), antes de abrir cobros:

- [ ] Estructura jurídica activa (autónomo dado de alta)
- [ ] Cuenta bancaria de negocio operativa
- [ ] T&C publicados en la web
- [ ] Política de Privacidad publicada
- [ ] Aviso Legal publicado
- [ ] Procesador de pagos configurado (Stripe/Paddle/Lemon)
- [ ] Sistema de facturación que cumpla Verifactu
- [ ] Gestoría con acceso a la información necesaria
- [ ] Seguro de RC profesional contratado
- [ ] Email de soporte legal/privacidad publicado (privacy@... legal@...)
- [ ] Procedimiento documentado para ejercer derechos RGPD
