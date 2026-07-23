import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/i18n' // initialize i18next + react-i18next before render
import App from './App.tsx'
import { LicenseProvider } from './LicenseContext'
import { ErrorBoundary } from './components/ErrorBoundary' // ✅ FIX 14
import { injectGlobalAnimations } from './animations'
import { consumeRedirectResult } from './lib/sync/googleAuth'
import { adoptRedirectTokens } from './lib/sync/googleDriveProvider'

injectGlobalAnimations() // ← una sola vez, antes de montar React

// ── OAuth redirect (ADR §11) ─────────────────────────────────────────────────
// Si volvemos del consentimiento de Google (/oauth-callback?code&state), canjeamos
// el code CUANTO ANTES (limpia la URL y evita que el code expire), guardamos los
// tokens en memoria del proveedor y dejamos una señal para que Ajustes pida la
// contraseña maestra y termine de activar el sync. No bloquea el render.
// Para una carga normal, consumeRedirectResult() devuelve null sin hacer nada.
void consumeRedirectResult()
  .then((result) => {
    if (!result) return
    adoptRedirectTokens(result)
    try { sessionStorage.setItem('fh_sync_oauth_pending', '1') } catch { /* ignore */ }
  })
  .catch(() => {
    try { sessionStorage.setItem('fh_sync_oauth_error', '1') } catch { /* ignore */ }
  })

// Polyfill: crypto.randomUUID no está disponible en HTTP (no-secure context).
// crypto.getRandomValues sí lo está, lo usamos como fallback.
if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
  (crypto as { randomUUID: () => string }).randomUUID = function (): string {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => {
      const n = parseInt(c);
      return (n ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (n / 4)))).toString(16);
    }) as `${string}-${string}-${string}-${string}-${string}`;
  };
}

// ── Service Worker (PWA) ─────────────────────────────────────────────────────
// El registro lo gestiona `useRegisterSW` (virtual:pwa-register/react) dentro
// de <UpdatePrompt/>, que además muestra el aviso de "Nueva versión disponible".
// vite-plugin-pwa genera /sw.js (Workbox) — mismo nombre que el SW manual
// anterior, así los PWA ya instalados transicionan sin reinstalar.

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary> {/* ✅ FIX 14 — Captura cualquier error de render */}
      <LicenseProvider>
        <App />
      </LicenseProvider>
    </ErrorBoundary>
  </StrictMode>,
)
