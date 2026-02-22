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
  
  // Automatically sync data from IndexedDB to the server when back online
  useEffect(() => {
    if (navigator.onLine) {
      syncOfflineData();
    }
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