// FIREBASE CODE//

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Ganti nilai di bawah dengan firebaseConfig milikmu
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

// Menangani notifikasi di background / layar terkunci
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Notifikasi diterima:', payload);
  const title = payload.notification.title || "Bite & Dim Notification";
  const options = {
    body: payload.notification.body || "Ada pembaruan status pesanan!",
    icon: '/icon.png' // Opsional: ganti sesuai file ikon kamu
  };

  self.registration.showNotification(title, options);
});


//SW.JS CODE//
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
