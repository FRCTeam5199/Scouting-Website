import { useState, useEffect } from "react";
import { num, pct, median, average } from "../hooks/useScoutingData";

// ─── CLIMB MAP ────────────────────────────────────────────────────────────────
const CLIMB_MAP    = { L1: 1, L2: 2, L3: 3, "Failed Climb": 0, "": 0, None: 0 };
const CLIMB_LABELS = { "": "None", None: "None", L1: "L1", L2: "L2", L3: "L3", "Failed Climb": "Failed" };

// ─── MATCH TABS ───────────────────────────────────────────────────────────────
function MatchTabs({ rows, activeMatch, onSelect }) {
  return (
    <div className="d-flex flex-wrap gap-1 mb-3" style={{ borderBottom: "1px solid #dee2e6", paddingBottom: 0 }}>
      {rows.map(r => {
        const m = r["Match #"];
        const active = activeMatch === m;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onSelect(active ? null : m)}
            className={`btn btn-sm ${active ? "btn-primary" : "btn-outline-secondary"}`}
            style={{ borderRadius: "4px 4px 0 0", border: active ? undefined : "1px solid #dee2e6", borderBottom: active ? "2px solid var(--bs-primary)" : "none", marginBottom: -1 }}
          >
            M{m}
          </button>
        );
      })}
    </div>
  );
}

// ─── MATCH DETAIL PANEL ───────────────────────────────────────────────────────
function MatchDetail({ row }) {
  if (!row) return null;
  const alliance = row["Alliance"] || "Red";
  const allianceBadge = alliance === "Red" ? "danger" : "primary";

  return (
    <div className="row g-3 mb-3">
      {/* Auton */}
      <div className="col-md-6">
        <div className="card h-100">
          <div className="card-header py-2 fw-semibold">Auton</div>
          <div className="card-body py-2" style={{ fontSize: "0.875rem" }}>
            <table className="table table-sm table-borderless mb-0">
              <tbody>
                {[
                  ["Alliance",       <span className={`badge bg-${allianceBadge}`}>{row["Alliance"]}</span>],
                  ["Starting Loc",   row["Starting Location"] || "—"],
                  ["Has Auton?",     row["Has Auton?"]],
                  ["Auto Fuel",      row["Auto Fuel Scored"]],
                  ["Accuracy",       row["Shot Accuracy (Auton)"]],
                  ["Auton Paths",    row["Auton Paths"] || "—"],
                  ["Shuttled",       row["Has Shuttling Auton?"]],
                  ["Shoot Preload?", row["Can shoot preload?"]],
                  ["Shoot Other?",   row["Can shoot Fuel outside of preloaded Fuel?"]],
                  ["Climb Side",     row["Auton Climb Side"]],
                  ["Climb Center",   row["Auton Climb Center"]],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td className="text-muted pe-3" style={{ whiteSpace: "nowrap" }}>{k}</td>
                    <td className={typeof v === "string" && v === "Yes" ? "text-success fw-semibold" : typeof v === "string" && v === "No" ? "text-muted" : ""}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Teleop + Endgame */}
      <div className="col-md-6">
        <div className="card h-100">
          <div className="card-header py-2 fw-semibold">Teleop &amp; Endgame</div>
          <div className="card-body py-2" style={{ fontSize: "0.875rem" }}>
            <table className="table table-sm table-borderless mb-0">
              <tbody>
                {[
                  ["Fuel Scored",    row["Fuel Scored (Teleop)"]],
                  ["Shuttles",       row["Shuttles (Teleop)"]],
                  ["Accuracy",       row["Shot Accuracy (Teleop)"]],
                  ["Turret?",        row["Has Turret?"]],
                  ["Shoots Moving?", row["Can score while moving?"]],
                  ["Bulldozing?",    row["Bulldozing?"]],
                  ["Climb",         <span className={`badge ${row["Climb (Teleop)"] === "L3" ? "bg-success" : row["Climb (Teleop)"] === "L2" ? "bg-info text-dark" : row["Climb (Teleop)"] === "L1" ? "bg-secondary" : "bg-danger"}`}>{CLIMB_LABELS[row["Climb (Teleop)"]] || "None"}</span>],
                  ["Climb Side",     row["Climbed Side"]],
                  ["Climb Center",   row["Climbed Center"]],
                  ["Time to Climb",  row["Time to Climb"] || "—"],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td className="text-muted pe-3" style={{ whiteSpace: "nowrap" }}>{k}</td>
                    <td className={typeof v === "string" && v === "Yes" ? "text-success fw-semibold" : typeof v === "string" && v === "No" ? "text-muted" : ""}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Extra */}
      <div className="col-12">
        <div className="card">
          <div className="card-header py-2 fw-semibold">Extra &amp; Comments</div>
          <div className="card-body py-2" style={{ fontSize: "0.875rem" }}>
            <div className="row">
              <div className="col-md-6">
                <table className="table table-sm table-borderless mb-0">
                  <tbody>
                    {[
                      ["Defense Rating",  row["Defense Rating"]],
                      ["Chasing",         row["Chasing"]],
                      ["Pinning",         row["Pinning"]],
                      ["Blocking",        row["Blocking Bump/Trench"]],
                      ["Def. Penalties",  row["Penalties (Defense)"]],
                      ["Robot Speed",     row["Robot Speed"]],
                      ["Intake Speed",    row["Intake-to-Shooter Speed"]],
                      ["Driver Skill",    row["Driver Skill"]],
                    ].map(([k, v]) => (
                      <tr key={k}>
                        <td className="text-muted pe-3" style={{ whiteSpace: "nowrap" }}>{k}</td>
                        <td className={typeof v === "string" && v === "Yes" ? "text-success fw-semibold" : ""}>{v || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <div className="d-flex flex-wrap gap-1 mb-2">
                  {[
                    ["No show",         row["No show"]],
                    ["Didn't move",     row["Did not move"]],
                    ["Broke",           row["Broke"]],
                    ["Penalties",       row["Penalties"]],
                    ["Good vs Defense", row["Good vs. Defense"]],
                    ["Bad vs Defense",  row["Bad vs. Defense"]],
                    ["Jittery Drive",   row["Jittery drive"]],
                    ["Good Vibes",      row["Good vibes"]],
                    ["Bad Vibes",       row["Bad vibes"]],
                    ["Fuel Jammed",     row["Fuel got stuck/jammed inside robot"]],
                    ["Beached",         row["Robot got beached"]],
                    ["Rescout",         row["Rescout Request"]],
                  ].filter(([, v]) => v === "Yes").map(([k]) => (
                    <span key={k} className="badge bg-warning text-dark">{k}</span>
                  ))}
                </div>
                {row["Serious Comments"] && (
                  <div className="text-muted small"><strong>Serious:</strong> {row["Serious Comments"]}</div>
                )}
                {row["Funny Comments"] && (
                  <div className="text-muted small mt-1"><strong>Funny:</strong> {row["Funny Comments"]}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SVG BAR CHART ────────────────────────────────────────────────────────────
const CHART_METRICS = [
  { key: "total",    label: "Total Fuel",    color: "#0d6efd" },
  { key: "teleop",   label: "Teleop Fuel",   color: "#0dcaf0" },
  { key: "auto",     label: "Auto Fuel",     color: "#198754" },
  { key: "shuttles", label: "Shuttles",      color: "#ffc107" },
  { key: "teleAcc",  label: "Teleop Accuracy", color: "#6f42c1" },
];

function getChartValue(row, key) {
  if (key === "total")    return num(row["Fuel Scored (Teleop)"]) + num(row["Auto Fuel Scored"]);
  if (key === "teleop")   return num(row["Fuel Scored (Teleop)"]);
  if (key === "auto")     return num(row["Auto Fuel Scored"]);
  if (key === "shuttles") return num(row["Shuttles (Teleop)"]);
  if (key === "teleAcc")  return pct(row["Shot Accuracy (Teleop)"]);
  return 0;
}

function MatchBarChart({ rows }) {
  const [activeMetric, setActiveMetric] = useState("total");
  const metric = CHART_METRICS.find(m => m.key === activeMetric);

  const data   = rows.map(r => ({ label: `M${r["Match #"]}`, value: getChartValue(r, activeMetric) }));
  const maxVal = Math.max(...data.map(d => d.value), 1);

  const padL = 36, padR = 12, padT = 12, padB = 32;
  const barW  = 32, gap   = 10;
  const chartH = 180;
  const svgW   = data.length * (barW + gap) + padL + padR;

  const gridY = [0, 0.5, 1].map(f => ({ v: Math.round(f * maxVal), y: padT + chartH * (1 - f) }));

  return (
    <div>
      {/* Metric tabs */}
      <ul className="nav nav-tabs mb-2" style={{ fontSize: "0.8rem" }}>
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
        <svg width={Math.max(svgW, 300)} height={chartH + padT + padB} style={{ display: "block" }}>
          {/* Grid lines */}
          {gridY.map(({ v, y }) => (
            <g key={v}>
              <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="#e9ecef" strokeWidth={1} />
              <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={10} fill="#6c757d">{v}</text>
            </g>
          ))}
          {/* Bars */}
          {data.map(({ label, value }, i) => {
            const bh = (value / maxVal) * chartH;
            const x  = padL + i * (barW + gap);
            const y  = padT + chartH - bh;
            return (
              <g key={i}>
                <rect x={x} y={y} width={barW} height={bh} rx={3} fill={metric.color} opacity={0.85} />
                <text x={x + barW / 2} y={padT + chartH + 16} textAnchor="middle" fontSize={10} fill="#6c757d">{label}</text>
                {bh > 14 && (
                  <text x={x + barW / 2} y={y + 12} textAnchor="middle" fontSize={10} fill="#fff" fontWeight={600}>{Math.round(value)}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─── QUICK COMMENTS GRID ─────────────────────────────────────────────────────
const FLAG_ENTRIES = [
  { key: "noShow",            label: "No Show" },
  { key: "didntMove",         label: "Didn't Move" },
  { key: "broke",             label: "Broke" },
  { key: "penalties",         label: "Penalties" },
  { key: "goodVsDefense",     label: "Good vs. Defense" },
  { key: "badVsDefense",      label: "Bad vs. Defense" },
  { key: "jitteryDrive",      label: "Jittery Drive" },
  { key: "goodVibes",         label: "Good Vibes" },
  { key: "badVibes",          label: "Bad Vibes" },
  { key: "canShootMoving",    label: "Can Shoot Moving" },
  { key: "shootStationaryAny",label: "Shoot Anywhere Stationary" },
  { key: "shootSpecificOnly", label: "Specific Spots Only" },
  { key: "longLineup",        label: "Long Line-up Time" },
  { key: "fuelJammed",        label: "Fuel Jammed" },
  { key: "robotBeached",      label: "Robot Beached" },
];

// ─── MAIN STATSHEET PAGE ─────────────────────────────────────────────────────
export default function Statsheet({ teamStats, pitByTeam }) {
  const teams      = Object.keys(teamStats).sort((a, b) => parseInt(a) - parseInt(b));
  const [sel, setSel]         = useState(teams[0] || "");
  const [activeMatch, setActiveMatch] = useState(null);

  // Reset active match when team changes
  useEffect(() => setActiveMatch(null), [sel]);
  useEffect(() => { if (teams.length && !teamStats[sel]) setSel(teams[0]); }, [teams]);

  const s   = teamStats[sel];
  const pit = pitByTeam[sel];

  const activeRow = s?.rows.find(r => r["Match #"] === activeMatch) ?? null;

  const allComments = s?.rows
    .filter(r => r["Serious Comments"]?.trim())
    .map(r => ({ match: r["Match #"], text: r["Serious Comments"] })) ?? [];

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Statsheet</h1>

      {/* Team selector + Robot Info */}
      <div className="row mb-4 align-items-start">
        <div className="col-md-4 mb-3 mb-md-0">
          <label className="form-label fw-semibold">Choose a Team</label>
          <select
            className="form-select"
            value={sel}
            onChange={e => setSel(e.target.value)}
          >
            {teams.map(t => <option key={t} value={t}>Team {t}</option>)}
          </select>
        </div>

        {/* Pit info + robot photo */}
        {pit && (
          <div className="col-md-8">
            <div className="card">
              <div className="card-body py-2">
                <div className="row g-2 align-items-center">
                  {pit[""] /* placeholder for image if you store a URL */ && (
                    <div className="col-auto">
                      <img src={pit[""]} alt={`Team ${sel}`} style={{ width: 80, height: 64, objectFit: "cover", borderRadius: 4 }} />
                    </div>
                  )}
                  <div className="col">
                    <div className="fw-semibold mb-1">Robot Info — Team {sel}</div>
                    <div style={{ fontSize: "0.82rem" }} className="text-muted d-flex flex-wrap gap-2">
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
            </div>
          </div>
        )}
      </div>

      {s ? (
        <>
          {/* ── Overall Stats ── */}
          <div className="card mb-4">
            <div className="card-header fw-semibold">Stats</div>
            <div className="card-body">
              <div className="row g-3 mb-3">
                {[
                  { label: "Median Total Fuel",  value: Math.round(s.medTotalFuel),  variant: "primary" },
                  { label: "Avg Total Fuel",     value: s.avgTotalFuel.toFixed(1),    variant: "primary" },
                  { label: "Max Total Fuel",     value: Math.round(s.maxTotalFuel),   variant: "primary" },
                  { label: "Median Teleop Fuel", value: Math.round(s.medFuelTeleop),  variant: "info" },
                  { label: "Median Auto Fuel",   value: Math.round(s.medAutoFuel),    variant: "success" },
                  { label: "Avg Shuttles",       value: s.avgShuttles.toFixed(1),     variant: "warning" },
                  { label: "Deep Climbs",        value: `${s.deepClimbs}/${s.matchCount}`, variant: "success" },
                  { label: "Med Climb",          value: s.medClimbStr,                variant: "secondary" },
                  { label: "Has Auton",          value: `${s.hasAuton}/${s.matchCount}`, variant: "primary" },
                  { label: "Avg Auto Accuracy",      value: `${s.avgAutoAcc.toFixed(0)}%`, variant: "info" },
                  { label: "Avg Teleop Accuracy",      value: `${s.avgTeleAcc.toFixed(0)}%`, variant: "info" },
                  { label: "Defense Rating",     value: s.avgDefRating.toFixed(1),    variant: "danger" },
                ].map(({ label, value, variant }) => (
                  <div key={label} className="col-6 col-sm-4 col-lg-3">
                    <div className={`card border-${variant} h-100`}>
                      <div className="card-body py-2 px-3 text-center">
                        <div className="small text-muted mb-1">{label}</div>
                        <div className={`fs-5 fw-semibold text-${variant}`}>{value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Capability badges */}
              <div className="d-flex flex-wrap gap-2">
                {s.hasTurret     > 0 && <span className="badge bg-primary">Turret ({s.hasTurret}×)</span>}
                {s.shootsMoving  > 0 && <span className="badge bg-success">Shoots Moving ({s.shootsMoving}×)</span>}
                {s.bulldozing    > 0 && <span className="badge bg-warning text-dark">Bulldozing ({s.bulldozing}×)</span>}
                {s.autonShuttled > 0 && <span className="badge bg-info text-dark">Auton Shuttle ({s.autonShuttled}×)</span>}
                {s.defChasing    > 0 && <span className="badge bg-secondary">Chasing Defense ({s.defChasing}×)</span>}
                {s.defPinning    > 0 && <span className="badge bg-secondary">Pinning Defense ({s.defPinning}×)</span>}
              </div>
            </div>
          </div>

          {/* ── Per-Match section ── */}
          <div className="card mb-4">
            <div className="card-header fw-semibold d-flex justify-content-between align-items-center">
              <span>Match Breakdown</span>
              {activeMatch && (
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setActiveMatch(null)}>
                  Clear selection
                </button>
              )}
            </div>
            <div className="card-body">
              <MatchTabs rows={s.rows} activeMatch={activeMatch} onSelect={setActiveMatch} />
              {activeRow
                ? <MatchDetail row={activeRow} />
                : <p className="text-muted small mb-3">Click a match tab above to see per-match detail.</p>
              }
              <MatchBarChart rows={s.rows} />
            </div>
          </div>

          {/* ── Quick Comments + Comments Log ── */}
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header fw-semibold">Quick Comments</div>
                <div className="card-body">
                  <div className="row g-2">
                    {FLAG_ENTRIES.map(({ key, label }) => {
                      const v = s[key] ?? 0;
                      return (
                        <div key={key} className="col-6">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="small text-muted">{label}:</span>
                            <span className={`badge ${v > 0 ? "bg-danger" : "bg-secondary"}`}>{v}</span>
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
                <div className="card-header fw-semibold">Comments Log</div>
                <div className="card-body" style={{ overflowY: "auto", maxHeight: 280 }}>
                  {allComments.length === 0
                    ? <p className="text-muted small mb-0">No serious comments recorded.</p>
                    : allComments.map((c, i) => (
                      <div key={i} className="mb-2 pb-2 border-bottom">
                        <span className="badge bg-primary me-2">M{c.match}</span>
                        <span className="small">{c.text}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="alert alert-info">No data found for the selected team.</div>
      )}
    </div>
  );
}