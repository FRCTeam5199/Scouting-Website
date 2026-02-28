import { useState, useEffect } from "react";

export default function useNetworkStatus() {
  const isNavigatorAvailable = typeof navigator !== "undefined" && typeof window !== "undefined";
  const [isOnline, setIsOnline] = useState(isNavigatorAvailable ? navigator.onLine : true);

  useEffect(() => {
    if (!isNavigatorAvailable) return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isNavigatorAvailable]);

  return isOnline;
}
