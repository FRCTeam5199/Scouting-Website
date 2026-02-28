import { Link, Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"

import { useEffect } from "react";
import { syncOfflineData } from "./sync";
import useNetworkStatus from "./hooks/useNetworkStatus";

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
  const isOnline = useNetworkStatus();

  useEffect(() => {
    const syncData = async () => {
      try {
        await syncOfflineData();
      } catch (error) {
        console.log("Sync failed:", error);
      }
    };

    if (isOnline) {
      console.log("Online - attempting to sync offline data");
      syncData();
    }
  }, [isOnline]);

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