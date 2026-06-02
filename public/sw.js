// ─── Cache version — bump on every production deploy to clear stale caches ──
// v1 → v2: fix navigation requests + proper SPA routing support
const CACHE_NAME = 'finanzashogar-v2';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
];

// Al instalar: guardar archivos base
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Al activar: eliminar TODAS las cachés antiguas (incluyendo versiones anteriores)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Al recibir peticiones
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;

  // Navigation requests (HTML pages): network-first, fallback to /index.html.
  // Garantiza SPA routing correcto: cualquier ruta (incluido /#admin)
  // siempre recibe index.html fresco si hay red.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/index.html')
      )
    );
    return;
  }

  // Resto de recursos (JS, CSS, imágenes): network-first, fallback a caché
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
