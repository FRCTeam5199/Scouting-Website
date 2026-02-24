// Service Worker for background sync
const CACHE_NAME = 'scouting-cache-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  // Add other assets you want to cache
];

let scriptURL = '';

// Listen for messages from the main thread to get the script URL
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_SCRIPT_URL') {
    scriptURL = event.data.url;
  }
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Function to sync offline data
async function syncOfflineData() {
  if (!scriptURL) {
    console.log('Script URL not set, skipping background sync');
    return;
  }

  try {
    // We'll use a simple approach since we can't import idb in service worker
    // This is a simplified version - in production you'd want more robust error handling
    const request = indexedDB.open("scouting-db", 1);
    
    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(["offline-data"], "readonly");
      const store = transaction.objectStore("offline-data");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = function() {
        const allData = getAllRequest.result;
        
        if (allData.length === 0) {
          return;
        }

        console.log(`Background sync: ${allData.length} items`);

        // Process each item
        allData.forEach(async (item) => {
          try {
            const response = await fetch(scriptURL, {
              method: "POST",
              body: new URLSearchParams(item),
            });

            if (response.ok) {
              // Delete from IndexedDB
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