// firebase-messaging-sw.js
// Service Worker للـ Push Notifications

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAwmXIlpdKXE_GTQMoQCFZJXIIVRTEcMhk",
  authDomain: "codeacademy-fdea6.firebaseapp.com",
  databaseURL: "https://codeacademy-fdea6-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "codeacademy-fdea6",
  storageBucket: "codeacademy-fdea6.firebasestorage.app",
  messagingSenderId: "499595636893",
  appId: "1:499595636893:web:4bb3e5da21a4c73679a474",
});

const messaging = firebase.messaging();

// استقبال الإشعار لما التطبيق مش مفتوح
messaging.onBackgroundMessage((payload) => {
  console.log("Background message:", payload);

  const { title, body, icon } = payload.notification || {};

  self.registration.showNotification(title || "المبرمج الصغير 📚", {
    body: body || "في جديد على المنصة!",
    icon: icon || "/icon-192.png",
    badge: "/icon-96.png",
    vibrate: [200, 100, 200],
    data: payload.fcmOptions || {},
    actions: [
      { action: "open", title: "افتح المنصة 🚀" },
      { action: "close", title: "إغلاق" },
    ],
    requireInteraction: false,
    dir: "rtl",
    lang: "ar",
  });
});

// لما الطالب يضغط على الإشعار
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.link || "https://littelprogrammer.netlify.app/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // لو التطبيق مفتوح بالفعل، افتح نافذته
      for (const client of clientList) {
        if (client.url.includes("littelprogrammer") && "focus" in client) {
          return client.focus();
        }
      }
      // لو مش مفتوح، افتح نافذة جديدة
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
