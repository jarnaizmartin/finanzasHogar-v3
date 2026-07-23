Hola. Retomamos proyecto finanzasHogar-v3 — **Sesión 76**.

Protocolo de arranque:

Lee `00_FOUNDATION.md` (las 5 reglas del juego). **El CI ya es gate real completo: lint + type-check + test + build, los cuatro bloqueantes** (desde la s.75; no queda ningún paso advisory).
Lee `CLAUDE.md` — **REGLA 0 primero** (cómo se informa al founder) y el norte como FILTRO, no como cita.
Lee la última entrada de `05_SESSION_LOG.md` (Sesión 75).
Confirma con "listo" antes de proponer nada.

---

## 📍 DE DÓNDE VENIMOS (s.75)

Sesión corta de cierre: se terminó lo que la s.74 dejó a medias.

- **react-refresh 7 → 0** (5 commits, un fichero cada uno): `views/legalDocs.ts` · `components/tourStorage.ts` · `components/useCoachMark.ts` · `components/TourProvider.tsx` · `LicenseProvider.tsx`. `npm run type-check` (exit 0) + 1174 tests verdes tras cada commit.
- **`f500c3a` — el Lint pasa a gate real**: fuera el `continue-on-error`. Comprobado que **sabe fallar** (error introducido a propósito → exit 1; sin él → exit 0).
- **Hallazgo de proceso:** la s.74 afirmó "todo pusheado" y **3 commits estaban solo en local** (`9e6568e`, `48246eb`, `30bc87b`). Subidos hoy. REGLA 0 §4: el rango de commits se mira, no se recuerda.
- **Estado: 0 tipos · 0 errores de lint (37 warnings) · 1174 tests · build OK. Todo en `origin/main` (`103b31c..f500c3a`).**

**Con esto se cierra el encargo del founder de la s.73** (*"quiero una aplicación limpia de errores y de basura… si requiere varias sesiones, nos tocará trabajar"*): 611 errores de tipos y 404 de lint → **0 y 0**, siempre por causa raíz, sin bajar ni una regla. Por el camino cayeron **13 bugs reales** entre s.73-75, ninguno cazado por un test.

---

## 🎯 FOCO DE ESTA SESIÓN

### 1. 🔴 Pruebas del founder en iPhone — LA RUTA CRÍTICA
Llevan **9 sesiones** pendientes y **no las desbloquea ningún código mío**: A3 (onboarding con testers), A5 (Safari iOS), A6 (sync real). Sin ellas no hay beta (Q4 2026). Ya no hay ninguna excusa técnica: el código está limpio y el CI es un gate honesto.
De paso, validar en dispositivo lo de las s.73-75: borrar regla de auto-categorización · Centro de Ayuda en modo oscuro · Tendencias pintando el icono real de cada categoría (ya no 📦) · el selector `Sel` en sus 3 dispositivos.

### 2. Arrastradas (elegir una si el founder no puede probar en iPhone)
- `src/config/layers.ts` — escala de z-index nombrada (§0.3). Ha mordido en s.56, s.58 y 3 veces en s.71.
- Test de `useLoanAmortization` — mueve dinero real y no tiene test.
- **"Proyecciones con confirmación"** (`11_PROJECTION_CONFIRMATION.md`, diseño cerrado desde la s.59, sin implementar).
- Materiales de beta (`09_BETA_READINESS.md` §E).
- Opcional: los **37 warnings** de lint a 0 (casi todos `react-hooks/exhaustive-deps`) → hay que revisar dependencias de hooks una a una; no es urgente y puede tocar comportamiento.

---

## 🔴 RECORDATORIOS OPERATIVOS

- **REGLA 0 de `CLAUDE.md`**: nada de "verificado/limpio/funciona" sin decir con qué comando y con qué resultado. Antes de fiarse de una comprobación, **comprobar que sabe fallar**. Y **"pusheado" solo con `git push` confirmado y el rango delante** (esto falló en la s.74).
- **Baselines: 0 tipos · 0 errores de lint · 1174 tests.** Cualquier error nuevo es NUEVO — el CI ya lo para.
- **Verificar con `npm run type-check`**, nunca `npx tsc --noEmit` a secas.
- **`encryptedStorage` tiene whitelist**: esas claves van en claro; usar los helpers cifrados con ellas **lanza excepción** en dev/tests.
- **Los modales se portean a `document.body`**: en los tests se consultan con `screen`, nunca con el `container`.
- **El founder no es técnico y factura por token** — no trasladarle decisiones técnicas (delega en el asistente), no verbose, no bucles. Si algo es decisión suya de PRODUCTO, explicárselo en simple.

## ESTADO: lint 0 · tipos 0 · 1174 tests · CI = gate real completo. Todo pusheado. La beta solo espera las pruebas en iPhone.

Cuando hayas leído los .md, dime "listo".
