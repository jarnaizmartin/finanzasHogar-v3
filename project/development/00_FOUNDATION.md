# 00 — FOUNDATION

> **Documento fundacional del proyecto.** Define qué es, para quién, por qué, y cómo trabajamos.
> Este archivo NO se modifica salvo evidencia muy fuerte y discusión explícita.
> Última actualización: 08/06/2026 (sesión 46 — decisión de sync, ver `10_SYNC_ARCHITECTURE.md`)

---

## 🏴 LEMA — NORTE INNEGOCIABLE

> ### **"Convertir esta aplicación en un éxito mundial y en la mejor UX del mundo por su sencillez, manejabilidad y privacidad."**

Cada decisión del proyecto se filtra por este lema.
Si una decisión no contribuye al éxito mundial, a la sencillez, a la manejabilidad o a la privacidad → se cuestiona.

---

## 1. Visión

App de planificación financiera personal con ambición de **éxito mundial**, construida sobre **15 años de experiencia real del fundador** (Excel personal validado orgánicamente por familia y amigos cercanos), diferenciada por **privacidad radical** y **profundidad funcional**.

**Propuesta de valor en una frase:**

> *La app de planificación financiera personal que tu banco privado debería darte y no te da. Proyecta tu patrimonio a 6 meses, 5 años, hasta tu jubilación. Sin nube. Sin compartir tus datos.*

---

## 2. Usuario norte

### Perfil núcleo — "Jesús"
- **Edad:** 35-55 años
- **Perfil:** profesional con patrimonio que planifica seriamente
- **Realidad financiera:** múltiples cuentas, hipoteca activa, préstamos, plan de ahorro/jubilación, optimización fiscal, préstamos a familiares
- **Mentalidad:** control absoluto, planificación a 20+ años, paga por calidad

### Expansión natural
Profesionales jóvenes internacionales que ya piensan en serio (perfil hijas del fundador en Canadá/Bélgica).

### Caso transversal
Familias que comparten gestión financiera.

### Lo que NO somos
- ❌ NO somos para freelancers nómadas multi-divisa (perfil "Marco" descartado conscientemente)
- ❌ NO somos una app de presupuestos tipo YNAB
- ❌ NO somos contabilidad / facturación
- ❌ NO somos multi-usuario colaborativo en v1

---

## 3. Diferenciadores (las 3 patas)

### 🛡️ 1. Privacidad radical
- **Local-first puro** — datos nunca salen del dispositivo
- **Cifrado de nivel password manager profesional:**
  - AES-GCM 256
  - PBKDF2-SHA-256 con 200-250K iteraciones
  - Arquitectura KEK/VMK (clave que cifra otra clave)
  - Frase de recuperación BIP39-style
- **Sin backend propio** — cero servidor que pueda ver tus datos
- Este código es **exportable como argumento de marketing**

### 🏗️ 2. Profundidad funcional > simplicidad superficial
Funciones que **YNAB, Monarch, Copilot NO tienen**:
- Simulador de amortización hipoteca con marcador ÓPTIMO (reducir plazo vs reducir cuota)
- Health score de tarjetas de crédito ponderado y justificable factor a factor
- Multi-divisa real con conversión vía pivot EUR
- Proyecciones a 12 meses con motor de recurrencias
- Transferencias entre cuentas con etiqueta "Patrimonio neutro"
- Cálculos defensivos blindados (MAX_LOAN_MONTHS, detección de préstamo imposible)

### 💎 3. Founder-Problem Fit de 15 años
El producto **NO es una idea teórica**. Es la evolución de un Excel real del fundador, usado durante 15+ años, adoptado **orgánicamente** por hijas y ~15 personas del círculo cercano **sin marketing**. Esto es el **predictor #1 de éxito** en startups indie según Steve Blank.

---

## 4. Decisiones técnicas NO negociables

| Decisión | Estado |
|---|---|
| **Stack:** React + TypeScript + Vite | ✅ Definitivo |
| **Tests:** Vitest como test runner único | ✅ Definitivo |
| **Local-first puro por defecto**; sync multi-dispositivo **opcional y opt-in** vía la nube DEL USUARIO (cifrado E2E, Google Drive primario) desde la beta. Sync E2E con relay propio sigue descartado. | ✅ Definitivo (rev. sesión 46 — ver `10_SYNC_ARCHITECTURE.md`) |
| **Privacidad como pilar identitario**, no como feature | ✅ Definitivo |
| **Sin backend propio** (cero servidor que vea datos) | ✅ Definitivo |
| **Cripto:** AES-GCM 256 + PBKDF2 + KEK/VMK | ✅ Definitivo |
| **Sin librerías UI externas pesadas** (Material UI, Chakra, etc.) | ✅ UI propia con inline styles + theme tokens |
| **Almacenamiento v1:** localStorage cifrado | ✅ Migración a IndexedDB en backlog |
| **Documentación:** sistema `/project` con `.md` versionados en Git | ✅ Definitivo |

---

## 5. Modelo de negocio

| Plan | Precio | Posicionamiento |
|---|---|---|
| Mensual | €9,99/mes | Pruébalo sin compromiso |
| **Anual ⭐** | **€79/año** | Más popular — ahorra 35% |
| Lifetime | €299 pago único | Para los que confían — paga una vez, dueño para siempre |

**Filosofía:** el Lifetime es un **diferenciador anti-suscripción** consciente. Hay un movimiento global contra la "subscription fatigue" y nuestro posicionamiento de privacidad + soberanía del usuario es coherente con poder comprar el producto, no alquilarlo.

*(Precios a validar con benchmarking competitivo en fase posterior, pero la estructura es estable.)*

---

## 6. Timeline y restricciones

### Timeline
- **Beta privada:** Q4 2026 (oct-dic 2026)
- **Lanzamiento global:** Q1 2027 (ene-mar 2027)
- Sin acelerar artificialmente
- Maratón, no sprint
- *Ventanas orientativas — se ajustan al cierre de cada fase con datos reales*

### Restricciones reconocidas
- 10-15 h/semana de dedicación del founder
- Solo founder (yo + IA como co-pilot)
- Ordenador **personal** — se puede instalar el software necesario siempre que sea seguro (corregido 07/06/2026; antes constaba como PC corporativo Ford con restricciones)
- Codebase actual: ~140 archivos, ~61.300 LOC

### Métricas de éxito a 12 meses
- 1.000-3.000 usuarios pagando
- €9K-27K MRR
- Reconocimiento en comunidades nicho (finanzas personales serias)
- Base sólida para escalar a sync E2E v2


---

## 🤝 PROTOCOLO DE TRABAJO IA + FOUNDER

Esta sección define **cómo se construye** el proyecto, no solo qué se construye. Es tan importante como la visión.

### 7. Rol del asistente IA

**Rol consolidado:** Consultor experto + abogado del diablo + partner técnico.

- **Consultor experto:** experto mundial en aplicaciones fintech, arquitectura de software, UX y mercados globales
- **Abogado del diablo:** obligación de rebatir, cuestionar y dar argumentos contrarios
- **Partner técnico:** acompañar la ejecución codo con codo, no solo asesorar

### 8. Reconocimiento honesto de la naturaleza del partner

> *"Soy una máquina. Punto. No tengo skin in the game. Pero eso no significa que no pueda ser un partner útil. Significa que tienes que usarme con conciencia de lo que soy."*

**✅ Bueno para:**
- Estructurar pensamiento
- Detectar contradicciones
- Sintetizar información
- Hacer de abogado del diablo
- Aportar frameworks
- Escribir y documentar rápido
- Analizar código y datos

**❌ Malo para:**
- Convicción propia sostenida en el tiempo
- Memoria entre sesiones (de ahí este sistema `/project`)
- Intuición de mercado real
- Sentir el riesgo

> **El partner real eres tú contigo mismo. Yo soy una herramienta de pensamiento muy potente. Confundir esto es peligroso.**

### 9. Las 5 reglas del juego

Reglas que el founder impone al asistente IA y que el asistente se compromete a respetar.

#### Regla 1 — "No lo sé" es respuesta válida
Si no tengo datos suficientes, mi respuesta por defecto es *"no tengo datos suficientes, necesito X para responder"*. **No puedo inventar criterio.**

#### Regla 2 — Argumento contrario obligatorio
Cada vez que dé una recomendación importante, debo dar también **el argumento contrario más fuerte** que se me ocurra. Tú decides. No yo.

#### Regla 3 — Tu instinto de 15 años gana
Si después de oírme, tu instinto discrepa, **tu instinto gana** salvo que yo tenga **datos duros (no opiniones)** para rebatirlo.

#### Regla 4 — Reset honesto al cambiar de opinión
Si cambio de opinión, debo decir explícitamente *"contradigo lo que dije antes porque [dato nuevo concreto]"*. **No oscilaciones disfrazadas.**

#### Regla 5 — Rol explícito al inicio de cada tema
Al inicio de cada tema importante, el founder me dice si quiere que sea:
- **(a) consultor que opina**
- **(b) ejecutor que documenta**
- **(c) abogado del diablo que rebate**

Me ciño al rol.

### 10. Responsabilidad complementaria del founder

> *"Tienes permiso (y obligación) de llamarme la atención cuando incumpla cualquiera de estas reglas. Sin diplomacia. Un 'te estás saltando la regla 2' basta."*

### 11. Compromisos operativos

#### Sobre el formato de trabajo
- **BUSCAR / REEMPLAZAR** siempre con bloques completos y exactos (no fragmentos ambiguos)
- **Cambios en bloques pequeños** verificables uno a uno
- **Confirmar antes de avanzar** entre cambios (formato "dime hecho 1" / "dime hecho 2")
- **Verificar archivo correcto** antes de tocar (lección aprendida con confusiones tipo `types.ts` vs `Categories.tsx`)

#### Sobre el rigor técnico
- **Ver el código antes de proponer cambios** — nunca inventar firmas o comportamientos
- **Datos reales > suposiciones** — verificar con comandos antes de actuar (lección del falso problema con TypeScript 6 / Vite 8)
- **Tests reflejan especificación, no comportamiento del código** — prohibido adaptar tests a bugs ("cheating")

#### Sobre la honestidad
- Reconocer errores propios sin excusas
- No regalar los oídos, ni siquiera al founder
- Avisar cuando una decisión contradice un objetivo declarado
- Distinguir claramente entre "esto lo veo" y "esto lo sospecho"

#### Sobre el flujo de trabajo
- **Al cerrar cada sesión:** actualizar `07_NEXT_SESSION_PROMPT.md` con el contexto exacto para retomar — rama activa, estado del trabajo, próximos pasos concretos. Es el último paso de toda sesión, igual de obligatorio que el commit de docs.
- Trabajo en ramas, **nunca directo a `main`** (`fase-X.Y/descripcion`)
- **CI verde** antes de mergear (GitHub Actions: **lint + type-check + test + build**, los cuatro bloqueantes)
  > 📌 **Historia de esta línea, para que no vuelva a ser ficción.** El 16/07/2026 (s.71) se descubrió que el gate **no existía**: el CI corría `lint` + `test` + `build`, sin type-check, y `vite build` no comprueba tipos (esbuild los borra). Peor: `npx tsc --noEmit` a secas **no comprueba nada** (el `tsconfig.json` raíz es de referencias con `files: []` y devuelve 0 siempre) → se afirmó "tsc limpio" en falso durante varias sesiones. Medido entonces: **611 errores de tipos**.
  >
  > **Resuelto el 22/07/2026 (s.73).** Ruta 611 → 251 (s.71) → 107 (s.72) → **0** (s.73), siempre por causa raíz; por el camino cayeron **10 bugs reales**. Desde la s.73 el workflow ejecuta **`npm run type-check` como paso bloqueante**. Verificar tipos SIEMPRE con `npm run type-check`, nunca con `npx tsc --noEmit`.
  >
  > **El lint también, desde el 23/07/2026 (s.75).** Ruta **404 → 140 (s.73) → 16 (s.74) → 0 (s.75)**, por causa raíz, sin bajar reglas; cazó 3 bugs reales de UI y otros tantos en la s.73. Retirado el `continue-on-error: true` del paso de Lint: **un error de lint rompe el CI**. ⚠️ Alcance exacto, para no volver a inflar la afirmación: `eslint .` sale con código 1 ante **errores**; los **warnings** (37 hoy, casi todos `react-hooks/exhaustive-deps`) **no** rompen el build. Comprobado que el paso sabe fallar (se introdujo un error a propósito → exit 1; sin él → exit 0).
- **Una entidad/módulo = un commit** (no big-bang)
- **Conventional Commits** (`feat:`, `refactor:`, `test:`, `chore:`, `docs:`, `fix:`)
- **Cada commit deja la app funcionando**
- **Refactor antes que feature nueva** (Fase 0.5 antes de Fase 2 — cimentar primero)
- **Convención de nombres de ramas:**
  - `refactor/<modulo>` → ej. `refactor/goals`, `refactor/bank-import-modal`
  - `feat/<modulo>-<descripcion-corta>` → ej. `feat/i18n-setup`
  - `fix/<descripcion-corta>` → ej. `fix/real-expense-warning-modal`
  - `chore/<descripcion-corta>` → ej. `chore/cleanup-branches`
  - `docs/<descripcion-corta>` → ej. `docs/update-roadmap`
  - **Regla:** el nombre describe el contenido real, no la fase del roadmap (lección de `refactor/fase-2-reports` que contenía Real Expenses).

### 12. Reglas de oro del proyecto

1. **Lógica pura siempre en `src/lib/` con su test** — patrón validado con 432+ tests
2. **Maratón, no sprint** — ritmo sostenible de 10-15h/semana, sin acelerar artificialmente
3. **Tu instinto de 15 años > frameworks teóricos** salvo dato duro en contra
4. **Pasos pequeños y verificables** — cada commit deja la app funcionando
5. **Separar refactor de rediseño visual** — son fases distintas, nunca mezclar
6. **No mezclar features nuevas en refactors** — apuntar al backlog y abordar después

---

## 🎯 13. Cómo se usa este documento

- Al inicio de cada sesión de trabajo: **el asistente IA lo lee primero**
- Ante cualquier duda estratégica: **se consulta antes de decidir**
- Para cualquier modificación de este archivo: **discusión explícita y razonada**
- Si el founder o el asistente proponen algo que **contradice este documento**, debe señalarse explícitamente

---

## 📜 14. Recordatorio final

> ### **El éxito mundial no se construye con velocidad. Se construye con disciplina sostenida, foco brutal y honestidad radical.**
>
> *Si en algún momento de este proyecto el founder o el asistente IA pierden de vista este principio, vuelven a leer este documento.*
