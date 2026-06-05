import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/i18n' // initialize i18next + react-i18next before render
import App from './App.tsx'
import { LicenseProvider } from './LicenseContext'
import { ErrorBoundary } from './components/ErrorBoundary' // ✅ FIX 14
import { injectGlobalAnimations } from './animations'

injectGlobalAnimations() // ← una sola vez, antes de montar React

// Polyfill: crypto.randomUUID no está disponible en HTTP (no-secure context).
// crypto.getRandomValues sí lo está, lo usamos como fallback.
if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
  (crypto as any).randomUUID = function (): string {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => {
      const n = parseInt(c);
      return (n ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (n / 4)))).toString(16);
    }) as `${string}-${string}-${string}-${string}-${string}`;
  };
}

// ── Registro del Service Worker (PWA) ────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      console.warn('[PWA] Service Worker no registrado');
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary> {/* ✅ FIX 14 — Captura cualquier error de render */}
      <LicenseProvider>
        <App />
      </LicenseProvider>
    </ErrorBoundary>
  </StrictMode>,
)
