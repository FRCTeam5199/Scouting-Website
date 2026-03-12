import { precacheAndRoute, navigateFallback } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

// Precache all assets injected by Vite PWA (JS, CSS, HTML, images)
precacheAndRoute(self.__WB_MANIFEST);

// Serve index.html for all navigation requests so React Router works offline
navigateFallback("/index.html");

// Cache-first for images
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "image-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  })
);

// StaleWhileRevalidate for scripts and styles
registerRoute(
  ({ request }) =>
    request.destination === "script" || request.destination === "style",
  new StaleWhileRevalidate({ cacheName: "static-cache" })
);

// ─── Background Sync ──────────────────────────────────────────────────────────

const DB_NAME = "scouting-db";
const DB_VERSION = 2;
const STORE_NAME = "offline-data";
const SCRIPT_URL = self.VITE_SCRIPT_URL; // injected below via workbox config

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "submissionId" });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function syncPendingSubmissions() {
  let db;
  try {
    db = await openDB();
  } catch (err) {
    console.warn("[SW] Could not open DB for sync:", err);
    return;
  }

  const allData = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  if (allData.length === 0) return;
  console.log(`[SW] Syncing ${allData.length} pending item(s)`);

  for (const item of allData) {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        body: new URLSearchParams(item),
      });

      if (response.ok) {
        await new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const req = tx.objectStore(STORE_NAME).delete(item.submissionId);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
        console.log("[SW] Synced:", item.submissionId);
      } else {
        console.warn("[SW] Server rejected:", item.submissionId, response.status);
      }
    } catch (err) {
      // Still offline — leave in DB, retry on next sync event
      console.warn("[SW] Still offline, will retry:", item.submissionId);
    }
  }
}

// Fired by the browser when connectivity is restored, even if app is closed
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-scouting-data") {
    event.waitUntil(syncPendingSubmissions());
  }
});

// Fallback: also attempt sync on SW activation (covers browsers without
// Background Sync API support)
self.addEventListener("activate", (event) => {
  event.waitUntil(syncPendingSubmissions());
});