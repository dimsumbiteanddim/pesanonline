// ==========================================
// 1. FIREBASE CLOUD MESSAGING (FCM) HANDLER
// ==========================================
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAn6IvlqZAOXKJtL6mWjfEqO0v4IbAsuXs",
  authDomain: "biteanddim-31ebb.firebaseapp.com",
  projectId: "biteanddim-31ebb",
  storageBucket: "biteanddim-31ebb.firebasestorage.app",
  messagingSenderId: "474295112459",
  appId: "1:474295112459:web:ccc99849940d18f430880e",
  measurementId: "G-LEK7VBYKMF"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Menangani notifikasi saat aplikasi berjalan di background / layar hp terkunci
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Notifikasi FCM diterima di background:', payload);
  
  const title = payload.notification?.title || payload.data?.title || "Bite & Dim Notification";
  const options = {
    body: payload.notification?.body || payload.data?.body || "Ada pembaruan status pesanan!",
    icon: './Favicon.png',
    badge: './Favicon.png',
    vibrate: [200, 100, 200],
    data: {
      url: self.location.origin
    }
  };

  self.registration.showNotification(title, options);
});

// Menangani aksi ketika pengguna mengklik notifikasi
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Jika tab sudah terbuka, fokuskan tab tersebut
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url === '/' || client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Jika tab belum terbuka, buka halaman baru
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// ==========================================
// 2. SERVICE WORKER CACHING & OFFLINE LOGIC
// ==========================================
const CACHE_NAME = 'bite-and-dim-v2';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './Favicon.png',
];

// Event INSTALL: Cache aset utama dan langsung aktifkan SW baru
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Memasang cache baru:', CACHE_NAME);
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Event ACTIVATE: Bersihkan cache versi lama jika ada pembaruan
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Menghapus cache lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Event FETCH: Network First dengan fallback ke Cache saat offline
self.addEventListener('fetch', (event) => {
  const requestUrl = event.request.url;

  // Abaikan caching untuk request POST, Firebase API, atau Google Apps Script
  if (
    event.request.method !== 'GET' || 
    requestUrl.includes('google-analytics') || 
    requestUrl.includes('fcm.googleapis.com') ||
    requestUrl.includes('script.google.com')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
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
