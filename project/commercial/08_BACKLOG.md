# 08 — BACKLOG (Comercial)

> Lista de pendientes comerciales: tareas, validaciones, decisiones diferidas, ideas.
> Mover items a `02_DECISIONS_LOG.md` cuando se conviertan en decisión formal cerrada.
> Mover acciones operativas a `07_SESSION_LOG.md` cuando se ejecuten.
> Última actualización: 24/06/2026 (sesión 11 — Bloque 2 cerrado + §7 follow-up de marca)

---

## 1. Validaciones pendientes (founder)

### 🔴 Prioridad ALTA

- [ ] **Revisar intranet de Ford** por si existe Code of Conduct / Outside Activities Policy actualizada que afecte a actividades secundarias (no bloqueante pero recomendado, ver Bloque 0).

### 🟡 Prioridad MEDIA

- [ ] Investigar gestoría que entienda de SaaS internacional (recomendaciones: Quaderno, TaxScouts, Declarando, o gestoría local). Para tener identificada **antes** de necesitar Fase A (autónomo).
- [ ] Investigar seguro de Responsabilidad Civil profesional para autónomos en fintech B2C (~200€/año esperado).

### 🟢 Prioridad BAJA / informativa

- [ ] Revisar políticas de Ford sobre conflicto de intereses cada año (por si cambian).

---

## 2. Decisiones diferidas (a tomar con datos reales)

### 🔄 Cuando lleguemos a Fase 2 (primeros pagos)
- [ ] **Decisión A vs B** (autónomo vs SL): reevaluar con facturación esperada, número de usuarios, riesgo percibido, patrimonio.

### ✅ Bloque 2 (Naming) — CERRADO (s.11, FinNort)
- [x] Reserva del dominio elegido → **`finnort.com` + `.eu` + `.app` + `.io` registrados (23/06/2026).**
- [x] Consulta de marca → **TMview clases 9+36 = limpio** (consulta hecha; ver `03_NAMING.md` §Sesión 11).
- [ ] **Registro formal de marca (~1.000€ EUIPO, clases 9+36)** → diferido a antes de invertir en lanzamiento (ver §7).

### 🔄 Cuando cerremos Bloque 3 (Monetización)
- [ ] Benchmarking real de competidores (YNAB, Monarch, Copilot, Lunchmoney, Wallet by BudgetBakers, etc.) — recoger precios actuales, planes, trials.
- [ ] Decisión Merchant of Record: Stripe (puro) vs Paddle vs Lemon Squeezy (MoR completo).
- [ ] Política de reembolsos (¿14 días sin preguntas? ¿30 días?).

---

## 3. Ideas / hipótesis a validar

### 💡 Sin priorizar — capturar para no perder

- [ ] **Programa de referidos**: ¿descuento al referidor + descuento al referido? Validar en beta.
- [ ] **Plan familiar**: tu propio caso de uso (hijas en Canadá/Bélgica). ¿1 lifetime cubre 2 dispositivos del mismo usuario? ¿3?
- [ ] **Early adopter pricing**: ¿descuento Lifetime para primeros 100 usuarios? (típico en indie SaaS).
- [ ] **Newsletter previa al lanzamiento**: capturar emails desde landing pre-beta para tener lista de "waiting list".
- [ ] **Blog/contenido sobre privacidad financiera**: contenido SEO de largo plazo (no urgente, pero pensarlo para Bloque 5).
- [ ] **Partnership con asesores fiscales / EAFs** que recomienden la app a sus clientes (canal B2B2C, alineado con perfil "Jesús").

---

## 4. Proveedores y herramientas a investigar

### Pagos
- [ ] Stripe (puro, gestionar IVA EU es responsabilidad nuestra)
- [ ] Paddle (MoR — ellos gestionan IVA global)
- [ ] Lemon Squeezy (MoR, popular en indie SaaS)

### Email marketing
- [ ] Resend (técnico, transaccional)
- [ ] ConvertKit / MailerLite (newsletter)
- [ ] Loops (moderno, alternativa premium)

### Analytics respetuoso con privacidad
- [ ] Plausible
- [ ] Fathom
- [ ] Simple Analytics

### Soporte
- [ ] Email directo (más simple, MVP)
- [ ] Crisp (chat ligero)
- [ ] Intercom (caro, probablemente overkill para v1)

### Landing page
- [ ] Astro + hosting en Vercel/Netlify
- [ ] Framer (no-code premium)
- [ ] Webflow

---

## 5. Aprendizajes operativos del sistema (meta)

### ✅ Reglas operativas confirmadas
- **Bloques pequeños cerrados antes de avanzar** (vs monólogos de 20.000 palabras)
- **Decisiones encadenadas** (no "te suelto 5 decisiones de golpe")
- **Argumento contrario obligatorio** en cada recomendación importante
- **"No lo sé" es respuesta válida** — especialmente en legal/fiscal

### 📌 Reglas operativas añadidas en esta sesión
- **`SESSION_LOG.md` se escribe al CERRAR la sesión, no durante** (lección aprendida 22/05/2026 — ya cometimos este error en la conversación técnica).
- **Esqueletos de archivos secundarios se crean upfront** para fijar la estructura del sistema, aunque estén vacíos.
- **Mover archivos del repo con `git mv`** (no `mv` del sistema) para preservar historial.

---

## 7. Marca / Brand — follow-up tras cerrar Bloque 2 (FinNort)

> Desbloqueado al tener nombre + dominios. **Ninguno bloquea la beta** (el bloqueante es el producto).
> Se abordan poco a poco, en paralelo al desarrollo.

### Identidad
- [ ] **Logo profesional** + identidad visual (logotipo, paleta, tipografía) — tono premium/serio/confiable (perfil "Jesús").
- [ ] **Renombrar la app a FinNort** en todo el producto: i18n (6 idiomas), `manifest`/PWA, `<title>`, favicon, textos de onboarding. *(tarea de dev → `project/development/`)*

### Presencia
- [ ] **Rematar handles `@finnortapp`:** YouTube · X · TikTok · Facebook (Página). ⏳ LinkedIn (Página de empresa requiere perfil con contactos).
- [ ] **Email de marca** `@finnort.com` (buzón + alias).
- [ ] **Rellenar perfiles sociales** (logo + bio + enlace a `finnort.com`).
- [ ] **Auto-renovación de dominios ON** + recordatorio anual (no perder `finnort.*`).

### Legal
- [ ] **Registro formal de marca** clases 9 (software) + 36 (finanzas) vía agente — antes de invertir en lanzamiento. (No es clearance hecho: el cribado TMview no sustituye al registro firmado.)

### Web (más adelante, no urgente)
- [ ] **Landing** en `finnort.com` (Bloque 6 / GTM).
- [ ] **Apuntar dominio → app** desplegada (hoy `finanzas-hogar-eta.vercel.app`).

---

## 6. Cómo se usa este backlog

- **Al iniciar trabajo en un item:** se mueve a la sección correspondiente del archivo de bloque (`03_NAMING.md`, `04_LEGAL_FISCAL.md`, etc.) o al `07_SESSION_LOG.md`.
- **Al cerrar una decisión:** se mueve a `02_DECISIONS_LOG.md`.
- **Al descubrir nuevos pendientes:** se añaden aquí en la sección correspondiente.
- **Revisión periódica:** al inicio de cada sesión grande, revisar prioridades.
