/* eslint-disable no-undef */
// Service worker do Firebase Cloud Messaging — tem de ser um ficheiro estático
// servido na raiz (/firebase-messaging-sw.js), sem imports ES module.
// Os valores abaixo são a config pública do Firebase Web (não são secretos)
// e têm de ser preenchidos manualmente aqui, porque o service worker não tem
// acesso às variáveis VITE_* do resto da app.
importScripts("https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCj72iYiOeGFkUPqZZ5VY44h8a1yTWq-G8",
  authDomain: "badges-pint.firebaseapp.com",
  projectId: "badges-pint",
  storageBucket: "badges-pint.firebasestorage.app",
  messagingSenderId: "338436089444",
  appId: "1:338436089444:web:53de8f19a7a9fa22aae171",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  if (!title) return;
  self.registration.showNotification(title, {
    body,
    icon: "/favicon-512.png",
  });
});
