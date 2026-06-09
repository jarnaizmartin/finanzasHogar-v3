// ─── Carga del script de Google Identity Services (GIS) ──────────────────────
//
// ADR: project/development/10_SYNC_ARCHITECTURE.md §4 (GIS token model).
//
// GIS se sirve desde un script alojado por Google. Lo cargamos bajo demanda (solo
// si el usuario activa el sync), no en el arranque — así un usuario mono-dispositivo
// nunca descarga nada de Google. Es el ÚNICO punto donde tocamos infraestructura de
// Google a nivel de script; queda aislado aquí a propósito (preocupación del founder:
// si Google cambia el SDK, se toca este fichero, no el resto de la app).
// ─────────────────────────────────────────────────────────────────────────────

export const GIS_SRC = 'https://accounts.google.com/gsi/client';

let loadPromise: Promise<void> | null = null;

/**
 * Carga GIS de forma idempotente. Resuelve cuando `window.google.accounts.oauth2`
 * está disponible. Llamadas concurrentes comparten la misma promesa.
 */
export function loadGoogleIdentityServices(): Promise<void> {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return Promise.reject(new Error('GIS solo está disponible en el navegador'));
  }
  // Ya disponible (script cargado en una sesión previa de la página).
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SRC}"]`
    );
    const onReady = () =>
      window.google?.accounts?.oauth2
        ? resolve()
        : reject(new Error('GIS_LOADED_BUT_OAUTH2_MISSING'));

    if (existing) {
      existing.addEventListener('load', onReady, { once: true });
      existing.addEventListener(
        'error',
        () => {
          loadPromise = null;
          reject(new Error('GIS_LOAD_FAILED'));
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', onReady, { once: true });
    script.addEventListener(
      'error',
      () => {
        // Permite reintentar en una activación posterior.
        loadPromise = null;
        reject(new Error('GIS_LOAD_FAILED'));
      },
      { once: true }
    );
    document.head.appendChild(script);
  });
  return loadPromise;
}
