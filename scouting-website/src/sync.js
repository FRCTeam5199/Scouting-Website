import { dbPromise } from "./db";

const SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_URL_HERE";

export async function sendToServer(data) {
  const response = await fetch(SCRIPT_URL, {
    method: "POST",
    body: new URLSearchParams(data),
  });

  return response.json();
}

export async function saveOffline(data) {
  const db = await dbPromise;
  await db.add("matchQueue", data);
}

export async function syncSettings() {
  if (!navigator.onLine) return;

  const db = await dbPromise;
  const allData = await db.getAll("matchQueue");

  for (const item of allData) {
    try {
      await sendToServer(item);
      await db.delete("matchQueue", item.localId);
    } catch (err) {
      console.log("Still offline or failed");
    }
  }
}

