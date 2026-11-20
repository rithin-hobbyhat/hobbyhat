const CACHE_NAME = 'mcq-practice-v19';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon.png',
  './industrial_siren.wav',
  './silence.wav',
  './lib/katex/katex.min.css',
  './lib/katex/katex.min.js',
  './data/subjects.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Background Alarm Scheduler in Service Worker
// Operates independently even when user is using Instagram, YouTube, or another app
let bgAlarmTimer = null;

self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.action === 'SCHEDULE_ALARM') {
    if (bgAlarmTimer) clearTimeout(bgAlarmTimer);
    const delayMs = Math.max(0, event.data.targetTime - Date.now());
    const notifData = event.data.notification;

    bgAlarmTimer = setTimeout(() => {
      // 1. Show high-priority Heads-Up Notification over active apps (e.g. Instagram)
      if (notifData) {
        self.registration.showNotification(notifData.title, notifData.options);
      }
      // 2. Wake all client windows and tell them to start industrial siren audio & vibration
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({ action: 'TRIGGER_ALARM' });
        });
      });
    }, delayMs);
  } else if (event.data.action === 'CANCEL_ALARM') {
    if (bgAlarmTimer) {
      clearTimeout(bgAlarmTimer);
      bgAlarmTimer = null;
    }
  }
});

// Handle clicking on notification from lock screen / notification tray
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'silence') {
    // User pressed 'Silence Siren' action button on lock screen notification
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({ action: 'SILENCE_SIREN' });
        });
      })
    );
    return;
  }

  // Open or focus client tab
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('focus' in client) {
          client.postMessage({ action: 'OPEN_MCQ' });
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});
