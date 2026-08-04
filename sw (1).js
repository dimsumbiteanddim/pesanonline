// Gantilah nama/versi cache setiap kali ada perubahan ikon, gambar, atau file web
const CACHE_NAME = 'bite-and-dim-v2';

// Daftar file yang akan disimpan dalam cache offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './Favicon.png',
];

// 1. EVENT INSTALL: Simpan file ke cache dan paksa Service Worker baru langsung aktif
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Memasang cache baru:', CACHE_NAME);
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting()) // Mengabaikan masa tunggu, langsung timpa SW lama
  );
});

// 2. EVENT ACTIVATE: Hapus semua cache versi lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Menghapus cache lama:', cache);
            return caches.delete(cache); // Menghapus versi cache sebelumnya (misal: v1)
          }
        })
      );
    }).then(() => self.clients.claim()) // Langsung mengendalikan semua tab yang sedang terbuka
  );
});

// 3. EVENT FETCH: Ambil dari jaringan dulu (Network First). Jika offline, ambil dari cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Jika berhasil mengambil dari internet, update isi cache secara dinamis
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Jika koneksi internet terputus / offline, gunakan file yang ada di cache
        return caches.match(event.request);
      })
  );
});
