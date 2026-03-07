// import { openDB } from "idb";

// const scriptURL = import.meta.env.VITE_SCRIPT_URL;

// const dbPromise = openDB("scouting-db", 2, {
//   upgrade(db) {

//     if (!db.objectStoreNames.contains("offline-data")) {
//       db.createObjectStore("offline-data", {
//         keyPath: "submissionId",
//       });
//     }

//     if (!db.objectStoreNames.contains("drafts")) {
//       db.createObjectStore("drafts", {
//         keyPath: "sheetName",
//       });
//     }

//   },
// });

// export async function saveOffline(data) {
//   const db = await dbPromise;
//   await db.put("offline-data", data);
//   console.log("Saved offline:", data);

//   // Register for background sync if supported
//   if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
//     try {
//       const registration = await navigator.serviceWorker.ready;
//       await registration.sync.register('background-sync');
//       console.log("Background sync registered");
//     } catch (error) {
//       console.log("Background sync not supported or failed to register:", error);
//     }
//   }
// }

// export async function sendToServer(data) {
//   const response = await fetch(scriptURL, {
//     method: "POST",
//     body: new URLSearchParams(data),
//   });

//   const result = await response.json();

//   if (!response.ok) {
//     throw new Error("Network error");
//   }

//   return result;
// }

// export async function syncOfflineData() {
//   const db = await dbPromise;
//   const allData = await db.getAll("offline-data");

//   if (allData.length === 0) {
//     console.log("No offline data to sync");
//     return;
//   }

//   console.log(`Syncing ${allData.length} offline items...`);

//   let syncedCount = 0;
//   let failedCount = 0;

//   for (const item of allData) {
//     try {
//       await sendToServer(item);
//       await db.delete("offline-data", item.submissionId);
//       syncedCount++;
//       console.log(`Synced: ${item.submissionId} (${item.sheet_name})`);
//     } catch (error) {
//       failedCount++;
//       console.log(`Failed to sync: ${item.submissionId} - ${error.message}`);
//     }
//   }

//   console.log(`Sync complete: ${syncedCount} synced, ${failedCount} failed`);
//   return { syncedCount, failedCount, totalCount: allData.length };
// }

// export async function getPendingSyncCount() {
//   const db = await dbPromise;
//   const allData = await db.getAll("offline-data");
//   return allData.length;
// }

// export async function getLastSettings() {
//   const db = await dbPromise;
//   const allData = await db.getAll("offline-data");
//   const settingsData = allData.filter(item => item.sheet_name === "Settings");
//   if (settingsData.length === 0) return null;
//   // Return the most recent one (assuming submissionId is UUID, sort by some timestamp if available)
//   // For now, return the last one in the array
//   return settingsData[settingsData.length - 1];
// }

// // Auto-save form drafts to IndexedDB
// export async function saveDraft(formData, sheetName = "Stand Scouting") {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open("scouting-db", 1);
//     request.onsuccess = (e) => {
//       const db = e.target.result;
//       if (!db.objectStoreNames.contains("drafts")) {
//         db.close();
//         return reject(new Error("Drafts store not available"));
//       }
//       const tx = db.transaction("drafts", "readwrite");
//       const store = tx.objectStore("drafts");
//       store.put({ sheetName, data: formData, timestamp: Date.now() });
//       tx.oncomplete = () => {
//         db.close();
//         resolve();
//       };
//       tx.onerror = () => reject(tx.error);
//     };
//     request.onerror = () => reject(request.error);
//   });
// }

// // Load draft from IndexedDB
// export async function loadDraft(sheetName = "Stand Scouting") {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open("scouting-db", 1);
//     request.onsuccess = (e) => {
//       const db = e.target.result;
//       if (!db.objectStoreNames.contains("drafts")) {
//         db.close();
//         return resolve(null);
//       }
//       const tx = db.transaction("drafts", "readonly");
//       const store = tx.objectStore("drafts");
//       const getRequest = store.get(sheetName);
//       getRequest.onsuccess = () => {
//         db.close();
//         resolve(getRequest.result?.data || null);
//       };
//       getRequest.onerror = () => reject(getRequest.error);
//     };
//     request.onerror = () => reject(request.error);
//   });
// }

// // Clear draft
// export async function clearDraft(sheetName = "Stand Scouting") {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open("scouting-db", 1);
//     request.onsuccess = (e) => {
//       const db = e.target.result;
//       if (!db.objectStoreNames.contains("drafts")) {
//         db.close();
//         return resolve();
//       }
//       const tx = db.transaction("drafts", "readwrite");
//       const store = tx.objectStore("drafts");
//       store.delete(sheetName);
//       tx.oncomplete = () => {
//         db.close();
//         resolve();
//       };
//       tx.onerror = () => reject(tx.error);
//     };
//     request.onerror = () => reject(request.error);
//   });
// }



import { openDB } from "idb";

const scriptURL = import.meta.env.VITE_SCRIPT_URL;

const DB_NAME = "scouting-db";
const DB_VERSION = 2;
const STORE_NAME = "offline-data";
const DRAFT_STORE_NAME = "drafts";

function createDbPromise() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "submissionId",
        });
      }

      if (!db.objectStoreNames.contains(DRAFT_STORE_NAME)) {
        db.createObjectStore(DRAFT_STORE_NAME, {
          keyPath: "sheetName",
        });
      }
    },
  }).catch(async (error) => {
    if (error?.name !== "VersionError") {
      throw error;
    }

    // Existing DB is newer than this client expects; open current DB version safely.
    const db = await openDB(DB_NAME);
    return db;
  });
}

const dbPromise = createDbPromise();

export async function getLastSettings() {
  const db = await dbPromise;
  const all = await db.getAll(STORE_NAME);

  if (!all || all.length === 0) return null;

  return all[all.length - 1]; // return most recent settings
}


// SAVE MATCH OFFLINE
export async function saveOffline(data) {

  const db = await dbPromise;

  await db.put(STORE_NAME, data);

  console.log("Saved offline:", data);

  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;

      if ("sync" in registration) {
        await registration.sync.register("background-sync");
      }

    } catch (err) {
      console.log("Background sync registration failed");
    }
  }
}


// SEND MATCH TO SERVER
export async function sendToServer(data) {

  const response = await fetch(scriptURL, {
    method: "POST",
    body: new URLSearchParams(data)
  });

  if (!response.ok) {
    throw new Error("Network error");
  }

  return response.json();
}


// SYNC OFFLINE DATA
export async function syncOfflineData() {

  const db = await dbPromise;

  const allData = await db.getAll(STORE_NAME);

  if (allData.length === 0) {
    return;
  }

  console.log(`Syncing ${allData.length} items`);

  for (const item of allData) {

    try {

      await sendToServer(item);

      await db.delete(STORE_NAME, item.submissionId);

      console.log("Synced:", item.submissionId);

    } catch (error) {

      console.log("Sync failed:", item.submissionId);

    }
  }

}


// DRAFT SAVE
export async function saveDraft(formData, sheetName = "Stand Scouting") {

  const db = await dbPromise;

  await db.put(DRAFT_STORE_NAME, {
    sheetName,
    data: formData,
    timestamp: Date.now()
  });

}


// LOAD DRAFT
export async function loadDraft(sheetName = "Stand Scouting") {

  const db = await dbPromise;

  const draft = await db.get(DRAFT_STORE_NAME, sheetName);

  return draft?.data || null;

}


// CLEAR DRAFT
export async function clearDraft(sheetName = "Stand Scouting") {

  const db = await dbPromise;

  await db.delete(DRAFT_STORE_NAME, sheetName);

}
