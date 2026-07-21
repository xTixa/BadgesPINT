import { initializeApp } from "firebase/app";
import { getMessaging, getToken, deleteToken, isSupported, onMessage } from "firebase/messaging";
import api from "/src/api";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let messagingPromise = null;

async function getMessagingInstance() {
  if (!firebaseConfig.apiKey || !vapidKey) return null;
  if (!(await isSupported().catch(() => false))) return null;

  if (!messagingPromise) {
    const app = initializeApp(firebaseConfig);
    messagingPromise = Promise.resolve(getMessaging(app));
  }
  return messagingPromise;
}

export async function registerFcmToken() {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const registration = await navigator.serviceWorker.ready;
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
    if (!token) return null;

    await api.post("/api/notifications/device-token", { token, platform: "web" });
    return token;
  } catch (err) {
    console.warn("Não foi possível registar o token FCM:", err.message);
    return null;
  }
}

export async function unregisterFcmToken() {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return;

    const token = await getToken(messaging, { vapidKey }).catch(() => null);
    if (!token) return;

    await api.post("/api/notifications/device-token/remove", { token }).catch(() => {});
    await deleteToken(messaging).catch(() => {});
  } catch (err) {
    console.warn("Não foi possível remover o token FCM:", err.message);
  }
}

export async function onForegroundMessage(callback) {
  const messaging = await getMessagingInstance();
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}
