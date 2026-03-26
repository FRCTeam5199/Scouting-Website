// hooks/useAutosave.js
import { useEffect, useRef } from "react";
import { saveDraft } from "../sync";

const LS_PREFIX = "autosave_";

export function useAutosave(formData, sheetName, isReady = true) {
  const latestRef    = useRef(formData);
  const isReadyRef   = useRef(isReady);

  // Keep refs current — refs never cause re-renders or effect re-runs
  useEffect(() => { latestRef.current  = formData;  }, [formData]);
  useEffect(() => { isReadyRef.current = isReady;   }, [isReady]);

  useEffect(() => {
    if (!isReady) return;

    // Save 2s after mount and never again from this effect —
    // actual saves happen via the flush functions below
    const timeout = setTimeout(() => {
      if (!isReadyRef.current) return;
      try {
        localStorage.setItem(LS_PREFIX + sheetName, JSON.stringify(latestRef.current));
      } catch {}
      saveDraft(latestRef.current, sheetName).catch(() => {});
    }, 2000);

    return () => clearTimeout(timeout);

  // Intentionally empty after isReady/sheetName — we do NOT want formData
  // here. The ref keeps it current without triggering re-runs.
  }, [isReady, sheetName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Flush immediately on any navigation/close event
  useEffect(() => {
    const flush = () => {
      if (!isReadyRef.current) return;
      try {
        localStorage.setItem(LS_PREFIX + sheetName, JSON.stringify(latestRef.current));
      } catch {}
      saveDraft(latestRef.current, sheetName).catch(() => {});
    };
    const onVisibility = () => { if (document.visibilityState === "hidden") flush(); };

    window.addEventListener("beforeunload",       flush);
    window.addEventListener("pagehide",           flush);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("beforeunload",       flush);
      window.removeEventListener("pagehide",           flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [sheetName]);
}

export function getAutosave(sheetName) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + sheetName);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAutosave(sheetName) {
  try {
    localStorage.removeItem(LS_PREFIX + sheetName);
  } catch {}
  saveDraft({}, sheetName).catch(() => {});
}