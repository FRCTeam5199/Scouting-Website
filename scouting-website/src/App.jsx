import { Link, Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"

import { Home } from "./pages/Home"
import { Settings } from "./pages/Settings"
import { Review } from "./pages/Review"
import { PitScouting } from "./pages/Pit-Scouting"
import { StandScouting } from "./pages/Stand-Scouting"


export default function App() {
  return (
    <>
	  <h1>Scouting App</h1>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/pit-scouting">Pit Scouting</Link>
          </li>
          <li>
            <Link to="/stand-scouting">Stand Scouting</Link>
          </li>
          <li>
            <Link to="/settings">Settings</Link>
          </li>
          <li>
            <Link to="/review">Review</Link>
          </li>
        </ul>
      </nav>
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
