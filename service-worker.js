// Service Worker: Cache-first strategy for offline support
// Caches: app shell (HTML/CSS/JS), library files (WASM)
// Network: Dynamic assets (events, bets) always fetch fresh

const CACHE_VERSION = 'v1.0';
const CACHE_NAME = `pomodorogambler-${CACHE_VERSION}`;

// Files to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/js/main.js',
  '/js/core/database.js',
  '/js/core/storage.js',
  '/js/core/state.js',
  '/js/core/eventbus.js',
  '/js/services/TimerService.js',
  '/js/services/BettingService.js',
  '/js/services/BalanceService.js',
  '/js/services/HistoryService.js',
  '/js/components/PomodoroTimer.js',
  '/js/components/Dashboard.js',
  '/js/components/EventCard.js',
  '/js/components/History.js',
  '/js/components/TabNavigator.js',
  '/js/components/BalanceDisplay.js',
  '/js/models/User.js',
  '/js/models/WorkSession.js',
  '/js/models/BettingEvent.js',
  '/js/models/Transaction.js',
  '/js/models/CoinBalance.js',
  '/js/utils/constants.js',
  '/js/utils/validators.js',
  '/js/utils/formatters.js',
  '/js/utils/keyboard.js',
  '/js/data/initial-events.json',
  '/styles/reset.css',
  '/styles/variables.css',
  '/styles/layout.css',
  '/styles/components.css',
  '/styles/polymarket-theme.css',
  '/lib/sql-wasm.js',
  '/lib/sql-wasm.wasm'
];

// Install: Cache all static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker] Some assets failed to cache:', err);
        // Don't fail install if some assets are missing
        return Promise.resolve();
      });
    })
  );

  // Activate immediately
  self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );

  // Take control immediately
  self.clients.claim();
});

// Fetch: Cache-first strategy
// - If in cache, return from cache
// - If not, fetch from network, cache it, return it
// - If offline, return offline response

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Don't handle non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Don't cache external URLs
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        // Return from cache
        return response;
      }

      // Try to fetch from network
      return fetch(request)
        .then((response) => {
          // Don't cache non-200 responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Cache the response for future use
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch((err) => {
          // Network failed, offline
          console.warn('[Service Worker] Offline:', request.url);

          // Return a generic offline response
          return new Response('Offline - please check your connection', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
    })
  );
});
