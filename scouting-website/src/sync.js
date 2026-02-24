import { openDB } from "idb";

const scriptURL = import.meta.env.VITE_SCRIPT_URL;


const dbPromise = openDB("scouting-db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("offline-data")) {
      db.createObjectStore("offline-data", {
        keyPath: "submissionId",
      });
    }
  },
});

export async function saveOffline(data) {
  const db = await dbPromise;
  await db.put("offline-data", data);
  console.log("Saved offline:", data);

  // Register for background sync if supported
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('background-sync');
      console.log("Background sync registered");
    } catch (error) {
      console.log("Background sync not supported or failed to register:", error);
    }
  }
}

export async function sendToServer(data) {
  const response = await fetch(scriptURL, {
    method: "POST",
    body: new URLSearchParams(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error("Network error");
  }

  return result;
}

export async function syncOfflineData() {
  const db = await dbPromise;
  const allData = await db.getAll("offline-data");

  if (allData.length === 0) {
    console.log("No offline data to sync");
    return;
  }

  console.log(`Syncing ${allData.length} offline items...`);

  let syncedCount = 0;
  let failedCount = 0;

  for (const item of allData) {
    try {
      await sendToServer(item);
      await db.delete("offline-data", item.submissionId);
      syncedCount++;
      console.log(`Synced: ${item.submissionId} (${item.sheet_name})`);
    } catch (error) {
      failedCount++;
      console.log(`Failed to sync: ${item.submissionId} - ${error.message}`);
    }
  }

  console.log(`Sync complete: ${syncedCount} synced, ${failedCount} failed`);
  return { syncedCount, failedCount, totalCount: allData.length };
}

export async function getPendingSyncCount() {
  const db = await dbPromise;
  const allData = await db.getAll("offline-data");
  return allData.length;
}

export async function getLastSettings() {
  const db = await dbPromise;
  const allData = await db.getAll("offline-data");
  const settingsData = allData.filter(item => item.sheet_name === "Settings");
  if (settingsData.length === 0) return null;
  // Return the most recent one (assuming submissionId is UUID, sort by some timestamp if available)
  // For now, return the last one in the array
  return settingsData[settingsData.length - 1];
}
