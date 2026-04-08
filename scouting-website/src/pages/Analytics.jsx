import { useState } from "react";
import { useScoutingData } from "../hooks/useScoutingData";
import Statsheet   from "./Statsheet";
import Graphs      from "./Graphs";
import HeadToHead  from "./Head-to-Head";
import Data_Sheet    from "./Data_Sheet";

const TABS = ["Statsheet", "Graphs", "Head to Head", "Data Sheet"];

export default function Analytics() {
  const [activeTab, setActiveTab] = useState("Statsheet");
  const { teamStats, pitByTeam, loading, error } = useScoutingData();

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status" aria-hidden="true" />
        <p className="text-muted">Loading scouting data…</p>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger d-flex align-items-start" role="alert">
          <div>
            <strong>Failed to load scouting data</strong>
            <div className="small mt-1">{error}</div>
            <hr />
            <div className="small">
              Make sure you are connected to Wi-Fi!
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── No data ────────────────────────────────────────────────────────────────
  if (!Object.keys(teamStats).length) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          No stand scouting data found.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Sub-nav tabs (same Bootstrap style as the main form tabs) */}
      <div className="border-bottom mb-0">
        <div className="container">
          <ul className="nav nav-tabs border-bottom-0" id="analyticsTab" role="tablist">
            {TABS.map(tab => (
              <li key={tab} className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === tab ? "active" : ""}`}
                  type="button"
                  role="tab"
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Page content */}
      {activeTab === "Statsheet"    && <Statsheet  teamStats={teamStats} pitByTeam={pitByTeam} />}
      {activeTab === "Graphs"       && <Graphs     teamStats={teamStats} />}
      {activeTab === "Head to Head" && <HeadToHead teamStats={teamStats} pitByTeam={pitByTeam} />}
      {activeTab === "Data Sheet"   && <Data_Sheet teamStats={teamStats} pitByTeam={pitByTeam} />}
    </div>
  );
}