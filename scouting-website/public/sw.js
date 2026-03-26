// Service Worker for background sync
const CACHE_NAME = 'scouting-cache-v1';
const FIELD_IMAGE_CACHE = 'field-images-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
];

// Field images to cache immediately on install
const imagesToCache = [
  '/icons/redAllianceField-2026.png',
  '/icons/blueAllianceField-2026.png',
];

let scriptURL = '';

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_SCRIPT_URL') {
    scriptURL = event.data.url;
  }
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Install — cache app shell AND field images
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
      caches.open(FIELD_IMAGE_CACHE).then((cache) => cache.addAll(imagesToCache)),
    ])
  );
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== FIELD_IMAGE_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch — serve field images from cache, everything else from network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (imagesToCache.includes(url.pathname)) {
    event.respondWith(
      caches.open(FIELD_IMAGE_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  if (!scriptURL) {
    console.log('Script URL not set, skipping background sync');
    return;
  }

  try {
    const request = indexedDB.open("scouting-db", 1);
    
    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(["offline-data"], "readonly");
      const store = transaction.objectStore("offline-data");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = function() {
        const allData = getAllRequest.result;
        if (allData.length === 0) return;
        console.log(`Background sync: ${allData.length} items`);

        allData.forEach(async (item) => {
          try {
            const response = await fetch(scriptURL, {
              method: "POST",
              body: new URLSearchParams(item),
            });
            if (response.ok) {
              const deleteTransaction = db.transaction(["offline-data"], "readwrite");
              const deleteStore = deleteTransaction.objectStore("offline-data");
              deleteStore.delete(item.submissionId);
              console.log(`Background synced: ${item.submissionId}`);
            }
          } catch (error) {
            console.log(`Background sync failed for: ${item.submissionId}`);
          }
        });
      };
    };
  } catch (error) {
    console.error('Background sync error:', error);
  }
}