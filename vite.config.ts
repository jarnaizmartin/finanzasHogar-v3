/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt' = mostramos banner "Nueva versión disponible → Actualizar".
      // El SW nuevo ESPERA (no skipWaiting/clientsClaim) hasta que el usuario
      // acepta; updateSW() en main.tsx dispara la activación + recarga.
      registerType: 'prompt',
      // Registramos a mano en main.tsx con `virtual:pwa-register` → que el
      // plugin no inyecte su propio registro (evita doble registro).
      injectRegister: false,
      // Mismo nombre que el SW manual anterior → los PWA ya instalados en
      // dispositivos transicionan al nuevo SW sin reinstalar.
      filename: 'sw.js',
      // Conservamos el public/manifest.json afinado + su <link> en index.html.
      // El plugin solo gestiona el Service Worker, no el manifest.
      manifest: false,
      workbox: {
        // SPA routing: cualquier navegación cae a index.html (precacheado y
        // revisionado por Workbox → el aviso de versión se dispara solo).
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        cleanupOutdatedCaches: true,
        // Algún chunk (recharts, i18n) puede pasar de 2 MiB; subimos el límite
        // para que NO se quede fuera del precache y rompa el offline.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      // SW desactivado en dev para no interferir con HMR.
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    hmr: {
      overlay: false,
    },
  },
  build: {
    target: 'esnext',
  },
  test: {
    globals: true,
    environment: 'jsdom',  // antes: 'node'
    setupFiles: ['./src/test-setup.ts'],    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.git'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/**/__tests__/**',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
      // Umbrales realistas para Fase 0.5 (solo utils testeado)
      // Subiremos estos números en fases futuras
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
      },
    },
  },
})
