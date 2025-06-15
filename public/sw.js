
const CACHE_NAME = 'fortem-dashboard-v1';
const urlsToCache = [
  '/',
  '/dashboard-executiv',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Instalarea service worker-ului
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activarea service worker-ului
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptarea request-urilor
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Offline fallback
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      }
    )
  );
});

// Background sync pentru date critice
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-dashboard') {
    event.waitUntil(syncDashboardData());
  }
});

async function syncDashboardData() {
  try {
    // Încearcă să sincronizeze datele critice
    const response = await fetch('/api/sync-dashboard');
    if (response.ok) {
      console.log('📊 Background sync successful');
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notifications pentru alerte critice
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Alertă nouă în dashboard',
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'Vezi Dashboard',
        icon: '/placeholder.svg'
      },
      {
        action: 'close',
        title: 'Închide',
        icon: '/placeholder.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Fortem Dashboard', options)
  );
});

// Handling notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard-executiv')
    );
  }
});
