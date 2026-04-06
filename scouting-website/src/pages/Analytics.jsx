import { useState } from "react";
import { useScoutingData } from "../hooks/useScoutingData";
import Statsheet   from "./Statsheet";
import Graphs      from "./Graphs";
import HeadToHead  from "./Head-to-Head";

const TABS = ["Statsheet", "Graphs", "Head to Head"];

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
              Make sure you have set <code>VITE_STAND_CSV_URL</code> and{" "}
              <code>VITE_PIT_CSV_URL</code> in your <code>.env</code> file.
              <br />
              To get the URLs: open your Google Sheet → File → Share →
              Publish to web → select the sheet tab → CSV → copy the URL.
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
          No stand scouting data found. Check that{" "}
          <code>VITE_STAND_CSV_URL</code> points to your published sheet CSV
          and that the sheet contains data rows.
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
    </div>
  );
}