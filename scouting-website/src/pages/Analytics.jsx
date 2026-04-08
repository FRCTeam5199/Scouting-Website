import { useState } from "react";
import { useScoutingData } from "../hooks/useScoutingData";
import Statsheet   from "./Statsheet";
import Graphs      from "./Graphs";
import HeadToHead  from "./Head-to-Head";
import Data_Sheet    from "./Data_Sheet";

const CORRECT_PASSWORD = import.meta.env.VITE_ANALYTICS_PASSWORD || "";

const TABS = ["Statsheet", "Graphs", "Head to Head"];

// ─── PASSWORD GATE ────────────────────────────────────────────────────────────
function PasswordGate({ onSuccess }) {
  const [input,  setInput]  = useState("");
  const [error,  setError]  = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === CORRECT_PASSWORD) {
      onSuccess();
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-sm-8 col-md-5 col-lg-4">
          <div className={`card shadow-sm ${shaking ? "border-danger" : ""}`}
            style={{ animation: shaking ? "shake 0.4s ease" : "none" }}>
            <div className="card-body p-4">
              <h4 className="card-title text-center mb-1">Analytics</h4>
              <p className="text-muted text-center small mb-4">Enter the password to continue</p>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input
                    type="password"
                    className={`form-control form-control-lg ${error ? "is-invalid" : ""}`}
                    placeholder="Password"
                    value={input}
                    autoFocus
                    onChange={e => { setInput(e.target.value); setError(false); }}
                  />
                  {error && (
                    <div className="invalid-feedback">Incorrect password. Try again.</div>
                  )}
                </div>
                <button type="submit" className="btn btn-primary btn-lg w-100">
                  Enter
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-6px); }
          80%      { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}

// ─── MAIN ANALYTICS COMPONENT ────────────────────────────────────────────────
export default function Analytics() {
  const [unlocked,  setUnlocked]  = useState(false);
  const [activeTab, setActiveTab] = useState("Statsheet");

  const { teamStats, pitByTeam, loading, error } = useScoutingData();

  // Show password gate first
  if (!unlocked) {
    return <PasswordGate onSuccess={() => setUnlocked(true)} />;
  }

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
      <div className="border-bottom mt-5">
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