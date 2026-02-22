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

  for (const item of allData) {
    try {
      await sendToServer(item);
      await db.delete("offline-data", item.submissionId);
      console.log("Synced:", item.submissionId);
    } catch (error) {
      console.log("Still offline:", item.submissionId);
    }
  }
}
