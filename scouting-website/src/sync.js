import { openDB } from "idb";

const scriptURL = import.meta.env.VITE_SCRIPT_URL;

const DB_NAME = "scouting-db";
const DB_VERSION = 2;
const STORE_NAME = "offline-data";
const DRAFT_STORE_NAME = "drafts";

// ─── Database ────────────────────────────────────────────────────────────────

function createDbPromise() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "submissionId" });
      }
      if (!db.objectStoreNames.contains(DRAFT_STORE_NAME)) {
        db.createObjectStore(DRAFT_STORE_NAME, { keyPath: "sheetName" });
      }
    },
  }).catch(async (error) => {
    if (error?.name !== "VersionError") throw error;
    // Existing DB is newer than this client expects; open current version safely
    return openDB(DB_NAME);
  });
}

const dbPromise = createDbPromise();

// ─── Settings ────────────────────────────────────────────────────────────────

export async function getLastSettings() {
  const db = await dbPromise;
  const all = await db.getAll(STORE_NAME);
  if (!all || all.length === 0) return null;
  return all[all.length - 1];
}

// ─── Offline Save ─────────────────────────────────────────────────────────────

export async function saveOffline(data) {
  const db = await dbPromise;
  await db.put(STORE_NAME, data);
  console.log("[sync] Saved offline:", data.submissionId);

  // Register Background Sync so the SW sends it when connectivity returns,
  // even if the app is fully closed
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if ("sync" in registration) {
        await registration.sync.register("sync-scouting-data");
        console.log("[sync] Background sync registered");
      }
    } catch (err) {
      console.warn("[sync] Background sync registration failed:", err);
    }
  }
}

// ─── Send to Server ───────────────────────────────────────────────────────────

export async function sendToServer(data) {
  const response = await fetch(scriptURL, {
    method: "POST",
    body: new URLSearchParams(data),
  });
  if (!response.ok) throw new Error(`Network error: ${response.status}`);
  return response.json();
}

// ─── Sync Offline Queue ───────────────────────────────────────────────────────
// Drains IndexedDB and sends every pending submission to the server.
// Called by the service worker on the "sync" event (Background Sync API) and
// also by flushOfflineQueue() in the app as a fallback for browsers that don't
// support Background Sync (e.g. older iOS Safari).

export async function syncOfflineData() {
  const db = await dbPromise;
  const allData = await db.getAll(STORE_NAME);

  if (allData.length === 0) return;

  console.log(`[sync] Syncing ${allData.length} pending item(s)`);

  for (const item of allData) {
    try {
      await sendToServer(item);
      await db.delete(STORE_NAME, item.submissionId);
      console.log("[sync] Synced:", item.submissionId);
    } catch (err) {
      // Still offline or server error — leave in DB, retry on next sync
      console.warn("[sync] Sync failed, will retry:", item.submissionId, err);
    }
  }
}

// ─── Flush on App Load ────────────────────────────────────────────────────────
// Call this from App.jsx / main.jsx so any submissions missed by the SW
// (e.g. Background Sync not supported) are sent as soon as the user opens
// the app while online.
//
//   import { flushOfflineQueue } from "./sync";
//   window.addEventListener("online", flushOfflineQueue);
//   flushOfflineQueue();

export async function flushOfflineQueue() {
  if (!navigator.onLine) return;
  console.log("[sync] Flushing offline queue");
  await syncOfflineData();
}

// ─── Drafts ───────────────────────────────────────────────────────────────────

export async function saveDraft(formData, sheetName = "Stand Scouting") {
  const db = await dbPromise;
  await db.put(DRAFT_STORE_NAME, {
    sheetName,
    data: formData,
    timestamp: Date.now(),
  });
}

export async function loadDraft(sheetName = "Stand Scouting") {
  const db = await dbPromise;
  const draft = await db.get(DRAFT_STORE_NAME, sheetName);
  return draft?.data || null;
}

export async function clearDraft(sheetName = "Stand Scouting") {
  const db = await dbPromise;
  await db.delete(DRAFT_STORE_NAME, sheetName);
}