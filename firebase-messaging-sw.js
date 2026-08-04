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
