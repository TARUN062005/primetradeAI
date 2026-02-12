export const registerFCMServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    console.log("✅ FCM Service Worker registered:", reg);
  } catch (err) {
    console.error("❌ Service Worker registration failed:", err);
  }
};
