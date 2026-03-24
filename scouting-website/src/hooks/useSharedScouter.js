import { useState, useEffect, useRef } from "react";

const KEY      = "standScoutingPreserved";
const CHANNEL  = "sharedScouter";

let channel = null;
try {
  channel = new BroadcastChannel(CHANNEL);
} catch {}

export function getPreservedScouter() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { scouter_name: "", scouter_team: "", alliance: "Red", match_number: "" };
    const parsed = JSON.parse(raw);
    return {
      scouter_name:  parsed.scouter_name  || "",
      scouter_team:  parsed.scouter_team  || "",
      alliance:      parsed.alliance      || "Red",
      match_number:  parsed.match_number  || "",
    };
  } catch {
    return { scouter_name: "", scouter_team: "", alliance: "Red", match_number: "" };
  }
}

function writePreserved(updates) {
  try {
    const existing = getPreservedScouter();
    const next = { ...existing, ...updates };
    localStorage.setItem(KEY, JSON.stringify(next));
    // Broadcast to all other instances of useSharedScouter on this page
    channel?.postMessage({ type: "update", payload: next });
  } catch {}
}

export function useSharedScouter() {
  const [shared, setShared] = useState(() => {
    const p = getPreservedScouter();
    return { scouter_name: p.scouter_name, scouter_team: p.scouter_team };
  });

  useEffect(() => {
    // BroadcastChannel — fires in the same tab across components
    const onMessage = (e) => {
      if (e.data?.type === "update") {
        setShared({
          scouter_name: e.data.payload.scouter_name || "",
          scouter_team: e.data.payload.scouter_team || "",
        });
      }
    };
    channel?.addEventListener("message", onMessage);

    // storage event — fires in other tabs
    const onStorage = (e) => {
      if (e.key !== KEY) return;
      try {
        const parsed = JSON.parse(e.newValue || "{}");
        setShared({
          scouter_name: parsed.scouter_name || "",
          scouter_team: parsed.scouter_team || "",
        });
      } catch {}
    };
    window.addEventListener("storage", onStorage);

    return () => {
      channel?.removeEventListener("message", onMessage);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const updateShared = (name, value) => {
    setShared((prev) => {
      const next = { ...prev, [name]: value };
      writePreserved(next);
      return next;
    });
  };

  return [shared, updateShared];
}