import { useState, useEffect } from "react";
import { num, pct, AUTON_PATH_LABELS } from "../hooks/useScoutingData";

// ─── CLIMB BADGE ─────────────────────────────────────────────────────────────
const CLIMB_BADGE = {
  L3: "bg-success", L2: "bg-info text-dark", L1: "bg-secondary",
  "Failed Climb": "bg-danger", "": "bg-light text-dark", None: "bg-light text-dark",
};
const CLIMB_LABEL = { "": "None", None: "None", L1: "L1", L2: "L2", L3: "L3", "Failed Climb": "Failed" };

// ─── AUTON PATH MAP (matches image positions from StandScouting form) ─────────
// Checkmark positions as % of image: [x%, y%] for Red alliance
// Blue mirrors these (100-x, 100-y)
const PATH_POSITIONS_RED = [
  { label: "Shuttle-Right", x: 71, y: 20 },
  { label: "Shuttle-Left",  x: 71, y: 80 },
  { label: "Tower",         x: 32, y: 53 },
  { label: "Depot",         x: 28, y: 29 },
  { label: "Chute",         x: 20, y: 87 },
];

function AutonomousPathsMap({ votes, matchCount, alliance }) {
  // votes: { "Tower": 3, "Depot": 2, ... }
  const isBlue = alliance === "Blue";
  const fieldImage = isBlue ? "/icons/blueAllianceField-2026.png" : "/icons/redAllianceField-2026.png";
  const positions = PATH_POSITIONS_RED.map(p =>
    isBlue ? { ...p, x: 100 - p.x, y: 100 - p.y } : p
  );

  return (
    <div>
      <div style={{ position: "relative", display: "inline-block", maxWidth: "100%" }}>
        <img
          src={fieldImage}
          alt="Field"
          style={{ width: "100%", maxWidth: 400, display: "block", borderRadius: 8 }}
        />
        {positions.map(pos => {
          const count = votes?.[pos.label] ?? 0;
          const active = count > 0;
          return (
            <div
              key={pos.label}
              title={`${pos.label}: ${count}/${matchCount} matches`}
              style={{
                position: "absolute",
                left: `${pos.x}%`,
                top:  `${pos.y}%`,
                transform: "translate(-50%, -50%)",
                width: 28, height: 28,
                borderRadius: "50%",
                background: active ? "#198754" : "rgba(255,255,255,0.6)",
                border: `2px solid ${active ? "#146c43" : "#aaa"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700,
                color: active ? "#fff" : "#666",
                cursor: "default",
                boxShadow: active ? "0 0 0 2px rgba(25,135,84,0.3)" : "none",
              }}
            >
              {active ? count : ""}
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="d-flex flex-wrap gap-2 mt-2">
        {AUTON_PATH_LABELS.map(p => {
          const count = votes?.[p] ?? 0;
          return (
            <span key={p} className={`badge ${count > 0 ? "bg-success" : "bg-secondary"}`}
              style={{ fontSize: "0.75rem" }}>
              {p}: {count}/{matchCount}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── MATCH TABS ───────────────────────────────────────────────────────────────
function MatchTabs({ rows, activeMatch, onSelect }) {
  return (
    <div className="d-flex flex-wrap gap-1 mb-3" style={{ borderBottom: "1px solid #dee2e6" }}>
      {rows.map(r => {
        const m = r["Match #"];
        const active = activeMatch === m;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onSelect(active ? null : m)}
            className={`btn btn-sm ${active ? "btn-primary" : "btn-outline-secondary"}`}
            style={{ borderRadius: "4px 4px 0 0", marginBottom: -1 }}
          >
            M{m}
          </button>
        );
      })}
    </div>
  );
}

// ─── MATCH DETAIL ────────────────────────────────────────────────────────────
function MatchDetail({ row }) {
  if (!row) return null;
  const allianceBadge = (row["Alliance"] || "Red") === "Red" ? "danger" : "primary";
  const climbVal = row["Climb (Teleop)"] || "";

  const InfoTable = ({ rows: tableRows }) => (
    <table className="table table-sm table-borderless mb-0">
      <tbody>
        {tableRows.map(([k, v]) => v != null && v !== "" && v !== "—" ? (
          <tr key={k}>
            <td className="text-muted pe-3 py-1" style={{ whiteSpace: "nowrap", fontSize: "0.9rem" }}>{k}</td>
            <td className={`py-1 fw-semibold ${v === "Yes" ? "text-success" : v === "No" ? "text-muted" : ""}`}
              style={{ fontSize: "0.9rem" }}>
              {v}
            </td>
          </tr>
        ) : null)}
      </tbody>
    </table>
  );

  return (
    <div className="row g-3 mb-3">
      <div className="col-md-6">
        <div className="card h-100">
          <div className="card-header fw-semibold py-2">Auton</div>
          <div className="card-body py-2">
            <InfoTable rows={[
              ["Alliance",       <span className={`badge bg-${allianceBadge}`}>{row["Alliance"]}</span>],
              ["Starting Loc",   row["Starting Location"] || "—"],
              ["Has Auton?",     row["Has Auton?"]],
              ["Auto Fuel",      row["Auto Fuel Scored"]],
              ["Accuracy",       row["Can shoot preload?"] === "Yes" ? row["Shot Accuracy (Auton)"] : "N/A (no preload)"],
              ["Auton Paths",    row["Auton Paths"] || "—"],
              ["Shuttled",       row["Has Shuttling Auton?"]],
              ["Shoot Preload?", row["Can shoot preload?"]],
              ["Shoot Other?",   row["Can shoot Fuel outside of preloaded Fuel?"]],
              ["Climb Side",     row["Auton Climb Side"]],
              ["Climb Center",   row["Auton Climb Center"]],
            ]} />
          </div>
        </div>
      </div>

      <div className="col-md-6">
        <div className="card h-100">
          <div className="card-header fw-semibold py-2">Teleop &amp; Endgame</div>
          <div className="card-body py-2">
            <InfoTable rows={[
              ["Fuel Scored",    row["Fuel Scored (Teleop)"]],
              ["Shuttles",       row["Shuttles (Teleop)"]],
              ["Accuracy",       num(row["Fuel Scored (Teleop)"]) > 0 ? row["Shot Accuracy (Teleop)"] : "N/A (0 scored)"],
              ["Turret?",        row["Has Turret?"]],
              ["Shoots Moving?", row["Can score while moving?"]],
              ["Bulldozing?",    row["Bulldozing?"]],
              ["Climb", <span><strong>L1 EG:</strong> {pit["Can L1 Climb in Endgame?"]}</span>
              ],
              ["Climb Side",     row["Climbed Side"]],
              ["Climb Center",   row["Climbed Center"]],
              ["Time to Climb",  row["Time to Climb"] || "—"],
            ]} />
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="card">
          <div className="card-header fw-semibold py-2">Extra &amp; Comments</div>
          <div className="card-body py-2">
            <div className="row">
              <div className="col-md-6">
                <InfoTable rows={[
                  ["Defense Rating",   row["Defense Rating"]],
                  ["Chasing",          row["Chasing"]],
                  ["Pinning",          row["Pinning"]],
                  ["Blocking",         row["Blocking Bump/Trench"]],
                  ["Def. Penalties",   row["Penalties (Defense)"]],
                  ["Robot Speed",      row["Robot Speed"]],
                  ["Intake Speed",     row["Intake-to-Shooter Speed"]],
                  ["Driver Skill",     row["Driver Skill"]],
                ]} />
              </div>
              <div className="col-md-6">
                <div className="d-flex flex-wrap gap-1 mb-2">
                  {[
                    ["No Show",         row["No show"]],
                    ["Didn't Move",     row["Did not move"]],
                    ["Broke",           row["Broke"]],
                    ["Browned Out",     row["Robot browned out"]],
                    ["Penalties",       row["Penalties"]],
                    ["Good vs Defense", row["Good vs. Defense"]],
                    ["Bad vs Defense",  row["Bad vs. Defense"]],
                    ["Jittery Drive",   row["Jittery drive"]],
                    ["Good Vibes",      row["Good vibes"]],
                    ["Bad Vibes",       row["Bad vibes"]],
                    ["Fuel Jammed",     row["Fuel got stuck/jammed inside robot"]],
                    ["Beached",         row["Robot got beached"]],
                  ].filter(([, v]) => v === "Yes").map(([k]) => (
                    <span key={k} className="badge bg-warning text-dark" style={{ fontSize: "0.8rem" }}>{k}</span>
                  ))}
                </div>
                {row["Serious Comments"] && (
                  <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                    <strong>Serious:</strong> {row["Serious Comments"]}
                  </div>
                )}
                {row["Funny Comments"] && (
                  <div className="text-muted mt-1" style={{ fontSize: "0.9rem" }}>
                    <strong>Funny:</strong> {row["Funny Comments"]}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MATCH BAR CHART ─────────────────────────────────────────────────────────
const CHART_METRICS = [
  { key: "teleop",   label: "Teleop Fuel",   color: "#0dcaf0" },
  { key: "auto",     label: "Auto Fuel",     color: "#198754" },
  { key: "shuttles", label: "Shuttles",      color: "#ffc107" },
  { key: "teleAcc",  label: "Tele Accuracy", color: "#6f42c1" },
  { key: "autoAcc",  label: "Auto Accuracy", color: "#fd7e14" },
];

function getChartValue(row, key) {
  if (key === "teleop")   return num(row["Fuel Scored (Teleop)"]);
  if (key === "auto")     return num(row["Auto Fuel Scored"]);
  if (key === "shuttles") return num(row["Shuttles (Teleop)"]);
  if (key === "teleAcc")  return pct(row["Shot Accuracy (Teleop)"]);
  if (key === "autoAcc")  return pct(row["Shot Accuracy (Auton)"]);
  return 0;
}

function MatchBarChart({ rows }) {
  const [activeMetric, setActiveMetric] = useState("teleop");
  const metric = CHART_METRICS.find(m => m.key === activeMetric);
  const data   = rows.map(r => ({ label: `M${r["Match #"]}`, value: getChartValue(r, activeMetric) }));
  const maxVal = Math.max(...data.map(d => d.value), 1);

  const barW = 36, gap = 10, padL = 36, padR = 14, padT = 14, padB = 30;
  const chartH = 160;
  const svgW   = data.length * (barW + gap) + padL + padR;
  const gridY  = [0, 0.5, 1].map(f => ({ v: Math.round(f * maxVal), y: padT + chartH * (1 - f) }));

  return (
    <div>
      <ul className="nav nav-tabs mb-2" style={{ fontSize: "0.85rem" }}>
        {CHART_METRICS.map(m => (
          <li key={m.key} className="nav-item">
            <button
              type="button"
              className={`nav-link py-1 px-2 ${activeMetric === m.key ? "active" : ""}`}
              style={activeMetric === m.key ? { borderBottomColor: m.color, color: m.color } : {}}
              onClick={() => setActiveMetric(m.key)}
            >{m.label}</button>
          </li>
        ))}
      </ul>
      <div style={{ overflowX: "auto" }}>
        <svg width={Math.max(svgW, 280)} height={chartH + padT + padB} style={{ display: "block" }}>
          {gridY.map(({ v, y }) => (
            <g key={v}>
              <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="#e9ecef" strokeWidth={1} />
              <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={11} fill="#6c757d">{v}</text>
            </g>
          ))}
          {data.map(({ label, value }, i) => {
            const bh = (value / maxVal) * chartH;
            const x  = padL + i * (barW + gap);
            const y  = padT + chartH - bh;
            return (
              <g key={i}>
                <rect x={x} y={y} width={barW} height={bh} rx={3} fill={metric.color} opacity={0.9} />
                <text x={x + barW / 2} y={padT + chartH + 18} textAnchor="middle" fontSize={11} fill="#495057">{label}</text>
                {bh > 14 && (
                  <text x={x + barW / 2} y={y + 13} textAnchor="middle" fontSize={11} fill="#fff" fontWeight={700}>
                    {Math.round(value)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─── FLAG ENTRIES ─────────────────────────────────────────────────────────────
const FLAG_ENTRIES = [
  { key: "noShow",             label: "No Show" },
  { key: "didntMove",          label: "Didn't Move" },
  { key: "broke",              label: "Broke" },
  { key: "brownedOut",         label: "Browned Out" },
  { key: "penalties",          label: "Penalties" },
  { key: "goodVsDefense",      label: "Good vs. Defense" },
  { key: "badVsDefense",       label: "Bad vs. Defense" },
  { key: "jitteryDrive",       label: "Jittery Drive" },
  { key: "goodVibes",          label: "Good Vibes" },
  { key: "badVibes",           label: "Bad Vibes" },
  { key: "canShootMoving",     label: "Can Shoot Moving" },
  { key: "shootStationaryAny", label: "Shoot Anywhere Static" },
  { key: "shootSpecificOnly",  label: "Specific Spots Only" },
  { key: "longLineup",         label: "Long Line-up Time" },
  { key: "fuelJammed",         label: "Fuel Jammed" },
  { key: "robotBeached",       label: "Robot Beached" },
];

// ─── MAIN STATSHEET ──────────────────────────────────────────────────────────
export default function Statsheet({ teamStats, pitByTeam }) {
  const teams = Object.keys(teamStats).sort((a, b) => parseInt(a) - parseInt(b));
  const [sel, setSel]             = useState(teams[0] || "");
  const [activeMatch, setActiveMatch] = useState(null);

  useEffect(() => setActiveMatch(null), [sel]);
  useEffect(() => { if (teams.length && !teamStats[sel]) setSel(teams[0]); }, [teams]);

  const s   = teamStats[sel];
  const pit = pitByTeam[sel];
  const activeRow = s?.rows.find(r => r["Match #"] === activeMatch) ?? null;

  const allComments = s?.rows
    .filter(r => r["Serious Comments"]?.trim())
    .map(r => ({ match: r["Match #"], text: r["Serious Comments"] })) ?? [];

  // Determine most common alliance for auton map
  const commonAlliance = s ? (() => {
    const alls = s.rows.map(r => r["Alliance"]).filter(Boolean);
    const rc = alls.filter(a => a === "Red").length;
    return rc >= alls.length / 2 ? "Red" : "Blue";
  })() : "Red";

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Statsheet</h1>

      {/* ── Team selector + Pit info ── */}
      <div className="row mb-4 g-3 align-items-start">
        <div className="col-md-4 col-lg-3">
          <label className="form-label fw-semibold fs-5">Choose a Team</label>
          <select
            className="form-select form-select-lg"
            value={sel}
            onChange={e => setSel(e.target.value)}
          >
            {teams.map(t => <option key={t} value={t}>Team {t}</option>)}
          </select>
        </div>

        {pit && (
          <div className="col-md-8 col-lg-9">
            <div className="card">
              <div className="card-body py-2 px-3">
                <div className="fw-semibold mb-1" style={{ fontSize: "1rem" }}>
                  Robot Info — Team {sel}
                </div>
                <div className="d-flex flex-wrap gap-3" style={{ fontSize: "0.9rem" }}>
                  {pit["Weight"]               && <span><strong>Weight:</strong> {pit["Weight"]} lbs</span>}
                  {pit["Drive Motors"]          && <span><strong>Drive:</strong> {pit["Drive Motors"]}</span>}
                  {pit["Vision System"]         && <span><strong>Vision:</strong> {pit["Vision System"]}</span>}
                  {pit["Shooter Type"]          && <span><strong>Shooter:</strong> {pit["Shooter Type"]}</span>}
                  {pit["Length (w/ bumpers)"]   && <span><strong>L:</strong> {pit["Length (w/ bumpers)"]} in</span>}
                  {pit["Width (w/ bumpers)"]    && <span><strong>W:</strong> {pit["Width (w/ bumpers)"]} in</span>}
                  {pit["Starting Height"]       && <span><strong>H:</strong> {pit["Starting Height"]} in</span>}
                  {pit["Hopper Max Capacity"]   && <span><strong>Hopper:</strong> {pit["Hopper Max Capacity"]}</span>}
                  {pit["Can L1 Climb in Auto?"] && <span><strong>L1 Auto:</strong> {pit["Can L1 Climb in Auto?"]}</span>}
                  {pit["Can L1 Climb in Endgame?"] && <span><strong>L1 EG:</strong> {pit["Can L1 Climb in Endgame?"]}</span>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {s ? (
        <>
          {/* ── Overall Stats ── */}
          <div className="card mb-4">
            <div className="card-header fw-semibold fs-5">Stats</div>
            <div className="card-body">
              <div className="row g-3 mb-3">
                {[
                  { label: "Avg Teleop Fuel",   value: s.avgFuelTeleop.toFixed(1),     variant: "info" },
                  { label: "Max Teleop Fuel",   value: Math.round(s.maxFuelTeleop),     variant: "info" },
                  { label: "Avg Auto Fuel",     value: s.avgAutoFuel.toFixed(1),        variant: "success" },
                  { label: "Max Auto Fuel",     value: Math.round(s.maxAutoFuel),       variant: "success" },
                  { label: "Avg Shuttles",      value: s.avgShuttles.toFixed(1),        variant: "warning" },
                  { label: "Climb",             value: pit["Can L1 Climb in Endgame?"], variant: s.climbYesNo === "Yes" ? "success" : "secondary" },
                  { label: "Has Auton",         value: `${s.hasAuton}/${s.matchCount}`, variant: "primary" },
                  { label: "Avg Auto Acc.",     value: `${s.avgAutoAcc.toFixed(0)}%`,   variant: "info" },
                  { label: "Avg Tele Acc.",     value: `${s.avgTeleAcc.toFixed(0)}%`,   variant: "info" },
                  { label: "Defense Rating",    value: s.avgDefRating.toFixed(1),       variant: "danger" },
                  { label: "Driver Skill",      value: s.avgDriverSkill.toFixed(1),     variant: "secondary" },
                  { label: "Robot Speed",       value: s.avgRobotSpeed.toFixed(1),      variant: "secondary" },
                ].map(({ label, value, variant }) => (
                  <div key={label} className="col-6 col-sm-4 col-lg-3">
                    <div className={`card border-${variant} h-100`}>
                      <div className="card-body py-3 px-3 text-center">
                        <div className="mb-1 text-muted" style={{ fontSize: "0.85rem" }}>{label}</div>
                        <div className={`fw-semibold text-${variant}`} style={{ fontSize: "1.4rem" }}>{value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Capability badges */}
              <div className="d-flex flex-wrap gap-2 mt-2">
                {s.hasTurret      && <span className="badge bg-primary fs-6 px-3 py-2">Turret</span>}
                {s.shootsMoving > 0 && <span className="badge bg-success fs-6 px-3 py-2">Shoots Moving ({s.shootsMoving}×)</span>}
                {s.bulldozing   > 0 && <span className="badge bg-warning text-dark fs-6 px-3 py-2">Bulldozing ({s.bulldozing}×)</span>}
                {s.autonShuttled > 0 && <span className="badge bg-info text-dark fs-6 px-3 py-2">Auton Shuttle ({s.autonShuttled}×)</span>}
                {s.defChasing   > 0 && <span className="badge bg-secondary fs-6 px-3 py-2">Chasing Defense ({s.defChasing}×)</span>}
                {s.defPinning   > 0 && <span className="badge bg-secondary fs-6 px-3 py-2">Pinning Defense ({s.defPinning}×)</span>}
              </div>
            </div>
          </div>

          {/* ── Match Breakdown ── */}
          <div className="card mb-4">
            <div className="card-header fw-semibold fs-5 d-flex justify-content-between align-items-center">
              <span>Match Breakdown</span>
              {activeMatch && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setActiveMatch(null)}
                >
                  Clear selection
                </button>
              )}
            </div>
            <div className="card-body">
              <MatchTabs rows={s.rows} activeMatch={activeMatch} onSelect={setActiveMatch} />
              {activeRow
                ? <MatchDetail row={activeRow} />
                : <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                    Click a match tab above to see per-match detail.
                  </p>
              }
              <MatchBarChart rows={s.rows} />
            </div>
          </div>

          {/* ── Quick Comments + Comments Log ── */}
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header fw-semibold fs-5">Quick Comments</div>
                <div className="card-body">
                  <div className="row g-2">
                    {FLAG_ENTRIES.map(({ key, label }) => {
                      const v = s[key] ?? 0;
                      return (
                        <div key={key} className="col-6">
                          <div className="d-flex justify-content-between align-items-center py-1">
                            <span style={{ fontSize: "0.9rem" }} className="text-muted">{label}:</span>
                            <span className={`badge fs-6 ${v > 0 ? "bg-danger" : "bg-secondary"}`}>{v}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header fw-semibold fs-5">Comments Log</div>
                <div className="card-body" style={{ overflowY: "auto", maxHeight: 320 }}>
                  {allComments.length === 0
                    ? <p className="text-muted mb-0">No serious comments recorded.</p>
                    : allComments.map((c, i) => (
                      <div key={i} className="mb-3 pb-2 border-bottom">
                        <span className="badge bg-primary me-2" style={{ fontSize: "0.85rem" }}>M{c.match}</span>
                        <span style={{ fontSize: "0.9rem" }}>{c.text}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>

          {/* ── Auton Paths ── */}
          <div className="card mb-4">
            <div className="card-header fw-semibold fs-5">Autonomous Paths</div>
            <div className="card-body">
              <AutonomousPathsMap
                votes={s.autonPathVotes}
                matchCount={s.matchCount}
                alliance={commonAlliance}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="alert alert-info">No data found for the selected team.</div>
      )}
    </div>
  );
}