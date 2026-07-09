# 13 — PLAN DE PRUEBAS · Rediseño del onboarding (Fases 1-5, s.69)

> Checklist para validar todo lo del rediseño del onboarding.
> Marca cada punto: ⬜ pendiente · ✅ ok · ❌ bug (anótalo).
> Última actualización: 10/07/2026 (cierre s.69).

---

## Cómo probar — dos entornos

### 🖥️ Local (ordenador, navegador) — lo más rápido para casi todo
```
npm install      # si hace falta
npm run dev      # arranca Vite → http://localhost:5173
```
- **Reset del onboarding** (para verlo desde cero): abre la consola del navegador (F12) y ejecuta
  `localStorage.clear()` y recarga. O DevTools → Application → Storage → *Clear site data*.
- **Simular móvil:** DevTools (F12) → icono de móvil (Toggle device toolbar) → elige "iPhone SE" para ver las 5 pestañas y si "Planificación" aprieta.
- **Panel ADMIN:** añade `#admin` a la URL (`localhost:5173/#admin`).
- ⚠️ Lo que **NO** funciona en local: el **sync con Google Drive** (necesita la función serverless de Vercel + OAuth real) y la **instalación como PWA / icono real** (eso es de dispositivo).

### 📱 Producción (iPhone) — para lo de dispositivo real
- URL: **https://finanzas-hogar-eta.vercel.app** (la sirve el proyecto Vercel `finanzas-hogar`).
- Para actualizaciones: cada `git push` → Vercel redeploy → si tienes la PWA instalada, **reinstálala** (borrar y volver a "Añadir a pantalla de inicio") para coger la última versión + el icono.
- **Reset del onboarding en iPhone:** lo más limpio es abrir en **Safari en modo incógnito** (pestaña privada) o desinstalar la PWA y reinstalarla. Dentro de la app, "Restablecer app" en Ajustes también borra todo.

**Regla general:** casi todo el onboarding es local-first y se prueba **igual en local que en producción**. Solo lo marcado como 📱 *dispositivo* o ☁️ *sync* necesita el iPhone/Vercel.

---

## Fase 4 — Modo Prueba  (🖥️ local vale · la pieza más importante a validar)

- ⬜ **Entrar desde el onboarding:** en la pantalla de bienvenida, botón **"🧪 Explorar con datos de ejemplo"**. La app arranca **llena** de datos (Resumen, Planificación, Previsión, Tendencias, Informes lucen). Aparece una **tira morada arriba**: "Modo Prueba · datos de ejemplo".
- ⬜ **Entrar desde Ajustes:** Ajustes → sección **"Modo Prueba"** → "Entrar en Modo Prueba".
- ⬜ **Regenerar:** en Modo Prueba, Ajustes → "Regenerar datos de ejemplo" → vuelven los datos frescos (con confirmación).
- ⬜ **Salir:** botón "Ir a mis datos reales" (en la tira morada o en Ajustes).
- ⬜ **AISLAMIENTO (lo crítico):** mete/borra datos REALES → entra en Prueba → juega/borra → sal a tus datos reales: **tus datos reales están intactos**. Al volver a Prueba, siguen los de ejemplo. **Nunca se mezclan.**
- ⬜ **Reload:** entrar/salir/regenerar **recargan** la app; comprueba que arranca bien en cada modo, **con y sin seguridad (contraseña) activada**.
- ⬜ **Backup en demo:** en Modo Prueba, abrir Copia de seguridad → sale un aviso que te invita a salir a tus datos reales (no deja hacer copia de los datos de ejemplo).
- ⬜ ☁️ **Sync en demo (si tienes sync activo):** el Modo Prueba **no sincroniza** el sandbox con tu Drive.

## Fase 4 — Guía  (🖥️ local vale)
- ⬜ Centro de Ayuda → guía de primeros pasos: dos secciones — **"El bucle · empieza aquí"** (Cuentas → Planificación → Movimientos → **Previsión**, con el paso Previsión nuevo) y **"Profundidad"** (Objetivos ahora está aquí, no en el bucle).

## Fase 5 — Copy honesto del tour  (🖥️ local vale)
- ⬜ WelcomeTour, card de privacidad: ya **NO** dice "0 bytes enviados a la nube"; menciona que si activas el sync, viaja **cifrado por tu propia nube**. Titular: "Nadie puede leer tu dinero. Ni nosotros."
- ⬜ WelcomeTour, card final: mensaje **maratón** ("Empieza en un minuto. Mejora contigo cada mes."), ya no "2 minutos. Eso es todo."

## Fase 5 — O5 (nombre + portada)  (🖥️ local vale)
- ⬜ En el onboarding aparece un campo **"¿Cómo te llamas? (opcional)"** con nota de privacidad.
- ⬜ Al abrir/desbloquear la app: **portada "Bienvenido de nuevo, {tu nombre}. Tu última conexión fue el {fecha}"** que se **auto-desvanece** (~2,5 s). Tócala para saltarla.
- ⬜ Ajustes → **"Portada de bienvenida"**: se puede apagar (desmarca el check → ya no sale).
- ⬜ No aparece en Modo Prueba.

## Fase 5 — O6 (logo)  (🖥️ local; 📱 el icono PWA solo en dispositivo)
- ⬜ Logo real en la cabecera del **onboarding**, en el **set-up de seguridad** y en la pantalla de **"nueva contraseña"** (recuperación).
- ⬜ La pantalla de **desbloqueo** te saluda con tu nombre ("Bienvenido de nuevo, {nombre}").
- ⬜ 📱 *dispositivo:* icono de la PWA (R3) en la pantalla de inicio + logo en la pantalla de bloqueo tras instalar.

## Fases 1-3 (recordatorio — por si no se validaron antes)  (🖥️ local; el ancho de pestañas mejor 📱)
- ⬜ 📱 Nav móvil: **5 pestañas fijas** (Resumen · Cuentas · **Planificación** · Movimientos · **Previsión**). ¿"Planificación" aprieta/se corta en iPhone SE? (si molesta → etiqueta corta "Plan" solo en móvil).
- ⬜ Onboarding: al terminar **ya NO pide seguridad**, entra directo y desbloqueado.
- ⬜ Aviso suave de seguridad: banner ámbar tras crear la 1ª cuenta; "No volver a mostrar" permanente.
- ⬜ Espina (tarjeta de Resumen): Cuenta → Planificación → Movimientos, **sin Objetivo**.
- ⬜ Empty states que enseñan: Planificación (filas de ejemplo), Previsión (mini-gráfico + CTA), Movimientos (CTA "Cargar extracto" primario).
- ⬜ Coachmarks de 1ª visita: el de Movimientos lidera con importar.

## Idiomas  (🖥️ local vale)
- ⬜ Cambiar idioma (es · en · fr · pt-PT · pt-BR · it) y ver traducidos: Modo Prueba, la guía Núcleo/Profundidad, el copy del tour, el nombre/portada.

---

## Arrastradas (siguen sin validar — de sesiones anteriores)
- ⬜ 📱 `Sel` (selector propio) en los 3 dispositivos (iOS categoría ya ✅).
- ⬜ Bug ADMIN `1f9318f` (abrir `#admin` sin que reviente). 🖥️ local o 📱.
- ⬜ ☁️📱 Sync §11 en iPhone: reconexión de 1 toque · auto-finish del redirect en incógnito con la misma contraseña · borrado/tombstones · LWW. (⚠️ refresh tokens caducan a 7 días si el consent de Google sigue en "Testing").
- ⬜ 📱 A5 — robustez en Safari iOS (importar CSV real).
- ⬜ 📱 Limpiar a mano traspasos duplicados ya existentes (si aparecen).

---

## Notas rápidas de bugs (rellena si algo falla)
- …
