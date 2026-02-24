import { Link, Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"

import { useEffect } from "react";
import { syncOfflineData } from "./sync";

import Home from "./pages/Home"
import Settings from "./pages/Settings"
import Review from "./pages/Review"
import PitScouting from "./pages/Pit-Scouting"
import StandScouting from "./pages/Stand-Scouting"


function App() {
  
  // Register service worker for background sync
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          
          // Send the script URL to the service worker
          const scriptURL = import.meta.env.VITE_SCRIPT_URL;
          if (scriptURL) {
            navigator.serviceWorker.controller?.postMessage({
              type: 'SET_SCRIPT_URL',
              url: scriptURL
            });
          }
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Automatically sync data from IndexedDB to the server when back online
  useEffect(() => {
    const syncData = async () => {
      if (navigator.onLine) {
        try {
          await syncOfflineData();
        } catch (error) {
          console.log("Sync failed:", error);
        }
      }
    };

    // Sync on app load
    syncData();

    // Set up online/offline event listeners for automatic syncing
    const handleOnline = () => {
      console.log("Back online - syncing data...");
      syncData();
    };

    const handleOffline = () => {
      console.log("Gone offline - data will be saved locally");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pit-scouting" element={<PitScouting />} />
        <Route path="/stand-scouting" element={<StandScouting />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/review" element={<Review />} />
      </Routes>
    </>
  )
}

export default App;