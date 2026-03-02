// Service Worker: cache-first app shell with scope-aware paths.

const CACHE_VERSION = 'v1.1';
const CACHE_NAME = `pomodorogambler-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '.',
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'js/main.js',
  'js/core/database.js',
  'js/core/storage.js',
  'js/core/state.js',
  'js/core/eventbus.js',
  'js/services/TimerService.js',
  'js/services/BettingService.js',
  'js/services/HistoryService.js',
  'js/services/AnalyticsService.js',
  'js/components/PomodoroTimer.js',
  'js/components/Dashboard.js',
  'js/components/EventCard.js',
  'js/components/History.js',
  'js/components/TabNavigator.js',
  'js/components/BalanceDisplay.js',
  'js/components/ThemeSwitcher.js',
  'js/models/User.js',
  'js/models/WorkSession.js',
  'js/models/BettingEvent.js',
  'js/models/Transaction.js',
  'js/models/CoinBalance.js',
  'js/utils/constants.js',
  'js/utils/validators.js',
  'js/utils/formatters.js',
  'js/utils/keyboard.js',
  'js/data/initial-events.json',
  'styles/reset.css',
  'styles/variables.css',
  'styles/layout.css',
  'styles/components.css',
  'styles/polymarket-theme.css',
  'lib/sql-wasm.js',
  'lib/sql-wasm.wasm'
];

const scopeBase = self.registration?.scope || self.location.origin + '/';
const toScopedUrl = (path) => new URL(path, scopeBase).toString();
const STATIC_URLS = STATIC_ASSETS.map(toScopedUrl);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_URLS))
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames
        .filter((name) => name !== CACHE_NAME)
        .map((name) => caches.delete(name))
    ))
  );

  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  if (request.method !== 'GET') return;
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, cloned);
          });

          return response;
        })
        .catch(() => {
          if (request.mode === 'navigate') {
            return caches.match(toScopedUrl('index.html'));
          }

          return new Response('Offline - please check your connection', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        });
    })
  );
});
