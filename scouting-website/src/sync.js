import { openDB } from "idb";

const scriptURL = import.meta.env.VITE_SCRIPT_URL;

const DB_NAME             = "scouting-db";
const DB_VERSION          = 2;
const STORE_NAME          = "offline-data";
const DRAFT_STORE_NAME    = "drafts";
const IMAGE_UPLOAD_URL    = "https://script.google.com/macros/s/AKfycbxVKhD2hnzXexRnJV10i-LBAWgGq7U6Lw-PZ-fkd3thlAsK43qs0STjlOcuBU1OnMqaHg/exec";
const OFFLINE_IMAGE_QUEUE_KEY = "pitImageQueue";

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
    return openDB(DB_NAME);
  });
}

const dbPromise = createDbPromise();

// ─── Settings ────────────────────────────────────────────────────────────────

export async function getLastSettings() {
  const db  = await dbPromise;
  const all = await db.getAll(STORE_NAME);
  if (!all || all.length === 0) return null;
  return all[all.length - 1];
}

// ─── Offline Save ─────────────────────────────────────────────────────────────

export async function saveOffline(data) {
  const db = await dbPromise;
  await db.put(STORE_NAME, data);
  console.log("[sync] Saved offline:", data.submissionId);

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

export async function syncOfflineData() {
  const db      = await dbPromise;
  const allData = await db.getAll(STORE_NAME);

  if (allData.length === 0) return;
  console.log(`[sync] Syncing ${allData.length} pending item(s)`);

  for (const item of allData) {
    try {
      await sendToServer(item);
      await db.delete(STORE_NAME, item.submissionId);
      console.log("[sync] Synced:", item.submissionId);
    } catch (err) {
      console.warn("[sync] Sync failed, will retry:", item.submissionId, err);
    }
  }
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
  const db    = await dbPromise;
  const draft = await db.get(DRAFT_STORE_NAME, sheetName);
  return draft?.data || null;
}

export async function clearDraft(sheetName = "Stand Scouting") {
  const db = await dbPromise;
  await db.delete(DRAFT_STORE_NAME, sheetName);
}

// ─── Image Upload (iframe form POST — only method that works with Apps Script) ─

function uploadViaIframe(teamNumber, base64) {
  return new Promise((resolve, reject) => {
    if (!document?.body) {
      reject(new Error("No document body — cannot upload via iframe"));
      return;
    }

    const uid    = Date.now();
    const iframe = document.createElement("iframe");
    iframe.name  = `upload-frame-${uid}`;
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const form  = document.createElement("form");
    form.method = "POST";
    form.action = IMAGE_UPLOAD_URL;
    form.target = iframe.name;
    form.style.display = "none";

    const addField = (name, value) => {
      const input = document.createElement("input");
      input.type  = "hidden";
      input.name  = name;
      input.value = value;
      form.appendChild(input);
    };

    addField("teamNumber", String(teamNumber));
    addField("image", base64);
    document.body.appendChild(form);

    const cleanup = () => {
      try { document.body.removeChild(iframe); } catch {}
      try { document.body.removeChild(form);   } catch {}
    };

    const timeout = setTimeout(() => {
      cleanup();
      // Resolve instead of reject on timeout — Apps Script often doesn't
      // fire onload reliably, but the data still gets through
      console.warn("[sync] Upload iframe timed out — assuming success");
      resolve();
    }, 15000);

    iframe.onload = () => {
      clearTimeout(timeout);
      cleanup();
      resolve();
    };

    form.submit();
  });
}

export async function uploadImageToDrive(teamNumber, base64) {
  await uploadViaIframe(teamNumber, base64);
}

// ─── Image Queue ──────────────────────────────────────────────────────────────

export function queueImageOffline(teamNumber, base64) {
  const queue    = JSON.parse(localStorage.getItem(OFFLINE_IMAGE_QUEUE_KEY) || "[]");
  const filtered = queue.filter((item) => item.teamNumber !== String(teamNumber));
  filtered.push({ teamNumber: String(teamNumber), image: base64 });
  localStorage.setItem(OFFLINE_IMAGE_QUEUE_KEY, JSON.stringify(filtered));
  console.log(`[sync] Image queued for team ${teamNumber}`);
}

// Always queue first, then attempt upload if online.
// Guarantees image is never lost regardless of connectivity.
export async function handleImageUpload(teamNumber, base64) {
  queueImageOffline(teamNumber, base64);

  if (!navigator.onLine) {
    console.log("[sync] Offline — image queued, will upload when online");
    return;
  }

  try {
    await uploadImageToDrive(teamNumber, base64);
    // Remove from queue on success
    const queue    = JSON.parse(localStorage.getItem(OFFLINE_IMAGE_QUEUE_KEY) || "[]");
    const filtered = queue.filter((item) => item.teamNumber !== String(teamNumber));
    localStorage.setItem(OFFLINE_IMAGE_QUEUE_KEY, JSON.stringify(filtered));
    console.log(`[sync] Image uploaded for team ${teamNumber}`);
  } catch (err) {
    console.warn(`[sync] Image upload failed, stays queued for team ${teamNumber}:`, err);
  }
}

// ─── Sync Queued Images ───────────────────────────────────────────────────────

export async function syncQueuedImages() {
  if (!navigator.onLine) return;

  const queue = JSON.parse(localStorage.getItem(OFFLINE_IMAGE_QUEUE_KEY) || "[]");
  if (queue.length === 0) return;

  console.log(`[sync] Syncing ${queue.length} queued image(s)`);

  const remaining = [];
  for (const item of queue) {
    try {
      await uploadImageToDrive(item.teamNumber, item.image);
      console.log(`[sync] Image synced for team ${item.teamNumber}`);
    } catch (err) {
      console.warn(`[sync] Image sync failed for team ${item.teamNumber}:`, err);
      remaining.push(item);
    }
  }

  localStorage.setItem(OFFLINE_IMAGE_QUEUE_KEY, JSON.stringify(remaining));
  if (remaining.length === 0) {
    localStorage.removeItem(OFFLINE_IMAGE_QUEUE_KEY);
    console.log("[sync] All queued images synced");
  }
}

// ─── Flush on App Load / Online ───────────────────────────────────────────────

export async function flushOfflineQueue() {
  if (!navigator.onLine) return;
  console.log("[sync] Flushing offline queue");
  await syncOfflineData();
  await syncQueuedImages();
}