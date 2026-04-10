import { useState, useMemo } from "react";
import { AUTON_PATH_LABELS } from "../hooks/useScoutingData";

// ─── TEAM COLOR PALETTE ───────────────────────────────────────────────────────
const TEAM_COLORS  = ["#d63384", "#198754", "#0d6efd", "#fd7e14", "#6f42c1", "#20c997"];
const TEAM_CLASSES = ["danger",  "success", "primary", "warning", "secondary", "info"];

// ─── COMPARISON GROUPS (no total fuel, no medians) ───────────────────────────
const COMPARE_GROUPS = [
  {
    label: "Fuel Scoring",
    rows: [
      { key: "avgFuelTeleop",  label: "Avg Teleop Fuel",    fmt: v => v.toFixed(1), higherBetter: true },
      { key: "maxFuelTeleop",  label: "Max Teleop Fuel",    fmt: v => Math.round(v), higherBetter: true },
      { key: "avgAutoFuel",    label: "Avg Auto Fuel",      fmt: v => v.toFixed(1), higherBetter: true },
      { key: "maxAutoFuel",    label: "Max Auto Fuel",      fmt: v => Math.round(v), higherBetter: true },
      { key: "avgShuttles",    label: "Avg Shuttles",       fmt: v => v.toFixed(1), higherBetter: true },
    ],
  },
  {
    label: "Accuracy",
    rows: [
      { key: "avgTeleAcc", label: "Avg Tele Accuracy",  fmt: v => `${v.toFixed(0)}%`, higherBetter: true },
      { key: "avgAutoAcc", label: "Avg Auto Accuracy",  fmt: v => `${v.toFixed(0)}%`, higherBetter: true },
    ],
  },
  {
    label: "Climbing",
    rows: [
      { key: "climbYesNo",     label: "Climbs",           fmt: v => v,                              higherBetter: false },
      { key: "climbedMatches", label: "Matches Climbed",  fmt: (v, s) => `${v}/${s.matchCount}`,    higherBetter: true },
      { key: "deepClimbs",     label: "Deep (L3) Climbs", fmt: (v, s) => `${v}/${s.matchCount}`,    higherBetter: true },
      { key: "l2Climbs",       label: "L2 Climbs",        fmt: (v, s) => `${v}/${s.matchCount}`,    higherBetter: true },
      { key: "l1Climbs",       label: "L1 Climbs",        fmt: (v, s) => `${v}/${s.matchCount}`,    higherBetter: true },
      { key: "failedClimbs",   label: "Failed Climbs",    fmt: (v, s) => `${v}/${s.matchCount}`,    higherBetter: false },
    ],
  },
  {
    label: "Drive & Defense",
    rows: [
      { key: "avgRobotSpeed",   label: "Avg Robot Speed",    fmt: v => v.toFixed(1), higherBetter: true },
      { key: "avgIntakeSpeed",  label: "Avg Intake Speed",   fmt: v => v.toFixed(1), higherBetter: true },
      { key: "avgDriverSkill",  label: "Avg Driver Skill",   fmt: v => v.toFixed(1), higherBetter: true },
      { key: "avgDefRating",    label: "Avg Defense Rating", fmt: v => v.toFixed(1), higherBetter: true },
      { key: "avgDefPenalties", label: "Avg Def. Penalties", fmt: v => v.toFixed(1), higherBetter: false },
    ],
  },
  {
    label: "Auton",
    rows: [
      { key: "hasAuton",        label: "Has Auton",          fmt: (v, s) => `${v}/${s.matchCount}`, higherBetter: true },
      { key: "autonShuttled",   label: "Auton Shuttled",     fmt: (v, s) => `${v}/${s.matchCount}`, higherBetter: true },
      { key: "autonShootPre",   label: "Shoots Preload",     fmt: (v, s) => `${v}/${s.matchCount}`, higherBetter: true },
      { key: "autonShootOther", label: "Shoots Other Fuel",  fmt: (v, s) => `${v}/${s.matchCount}`, higherBetter: true },
    ],
  },
  {
    label: "Issues",
    rows: [
      { key: "noShow",        label: "No Show",       fmt: v => v, higherBetter: false },
      { key: "didntMove",     label: "Didn't Move",   fmt: v => v, higherBetter: false },
      { key: "broke",         label: "Broke",         fmt: v => v, higherBetter: false },
      { key: "brownedOut",    label: "Browned Out",   fmt: v => v, higherBetter: false },
      { key: "penalties",     label: "Penalties",     fmt: v => v, higherBetter: false },
      { key: "jitteryDrive",  label: "Jittery Drive", fmt: v => v, higherBetter: false },
      { key: "fuelJammed",    label: "Fuel Jammed",   fmt: v => v, higherBetter: false },
      { key: "robotBeached",  label: "Robot Beached", fmt: v => v, higherBetter: false },
      { key: "goodVibes",     label: "Good Vibes",    fmt: v => v, higherBetter: true  },
      { key: "badVibes",      label: "Bad Vibes",     fmt: v => v, higherBetter: false },
    ],
  },
];

// ─── MINI PROGRESS BAR ───────────────────────────────────────────────────────
function MiniBar({ value, max, color }) {
  const w = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="progress mt-1" style={{ height: 5, background: "#e9ecef" }}>
      <div className="progress-bar" style={{ width: `${w}%`, background: color, transition: "width 0.3s" }} />
    </div>
  );
}

// ─── AUTON PATH MAP ───────────────────────────────────────────────────────────
const PATH_POSITIONS_RED = [
  { label: "Shuttle-Right", x: 71, y: 20 },
  { label: "Shuttle-Left",  x: 71, y: 80 },
  { label: "Tower",         x: 32, y: 53 },
  { label: "Depot",         x: 28, y: 29 },
  { label: "Chute",         x: 20, y: 87 },
];

function AutonomousPathsMap({ votes, matchCount, alliance, teamColor }) {
  const isBlue = alliance === "Blue";
  const fieldImage = isBlue ? "/icons/blueAllianceField-2026.png" : "/icons/redAllianceField-2026.png";
  const positions  = PATH_POSITIONS_RED.map(p =>
    isBlue ? { ...p, x: 100 - p.x, y: 100 - p.y } : p
  );

  return (
    <div>
      <div style={{ position: "relative", display: "inline-block", width: "100%", maxWidth: 280 }}>
        <img src={fieldImage} alt="Field" style={{ width: "100%", display: "block", borderRadius: 6 }} />
        {positions.map(pos => {
          const count  = votes?.[pos.label] ?? 0;
          const active = count > 0;
          return (
            <div
              key={pos.label}
              title={`${pos.label}: ${count}/${matchCount}`}
              style={{
                position: "absolute",
                left: `${pos.x}%`, top: `${pos.y}%`,
                transform: "translate(-50%,-50%)",
                width: 24, height: 24, borderRadius: "50%",
                background: active ? teamColor : "rgba(255,255,255,0.65)",
                border: `2px solid ${active ? teamColor : "#bbb"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, color: active ? "#fff" : "#666",
              }}
            >
              {active ? count : ""}
            </div>
          );
        })}
      </div>
      <div className="d-flex flex-wrap gap-1 mt-1">
        {AUTON_PATH_LABELS.map(p => {
          const count = votes?.[p] ?? 0;
          return (
            <span key={p}
              className="badge"
              style={{
                background: count > 0 ? teamColor : "#6c757d",
                fontSize: "0.7rem",
              }}>
              {p.replace("Shuttle-","S-")}: {count}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── TEAM CARD ────────────────────────────────────────────────────────────────
function TeamCard({ team, stats: s, pit, color, colorClass }) {
  return (
    <div className="card h-100" style={{ borderTop: `4px solid ${color}` }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h5 className="mb-0 fw-bold" style={{ color }}>{team}</h5>
            {s && <div className="text-muted" style={{ fontSize: "0.85rem" }}>{s.matchCount} match{s.matchCount !== 1 ? "es" : ""}</div>}
          </div>
          {s && (
            <span className={`badge bg-${colorClass}`} style={{ fontSize: "0.85rem" }}>
              Avg: {s.avgFuelTeleop.toFixed(1)} fuel
            </span>
          )}
        </div>

        {pit && (
          <div className="text-muted mb-2" style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>
            {pit["Weight"]       && <span>{pit["Weight"]} lbs · </span>}
            {pit["Drive Motors"] && <span>{pit["Drive Motors"]} · </span>}
            {pit["Shooter Type"] && <span>{pit["Shooter Type"]}</span>}
            {pit["Vision System"] && <><br />{pit["Vision System"]}</>}
          </div>
        )}

        {s && (
          <div className="d-flex flex-wrap gap-1">
            {s.climbYesNo === "Yes"  && <span className="badge bg-success" style={{ fontSize: "0.75rem" }}>Climbs</span>}
            {s.deepClimbs > 0        && <span className="badge bg-success" style={{ fontSize: "0.75rem" }}>L3: {s.deepClimbs}×</span>}
            {s.hasTurret             && <span className="badge bg-primary" style={{ fontSize: "0.75rem" }}>Turret</span>}
            {s.shootsMoving > 0      && <span className="badge bg-info text-dark" style={{ fontSize: "0.75rem" }}>Shoots Moving</span>}
            {s.broke > 0             && <span className="badge bg-danger" style={{ fontSize: "0.75rem" }}>Broke {s.broke}×</span>}
            {s.brownedOut > 0        && <span className="badge bg-warning text-dark" style={{ fontSize: "0.75rem" }}>Browned Out {s.brownedOut}×</span>}
            {s.noShow > 0            && <span className="badge bg-warning text-dark" style={{ fontSize: "0.75rem" }}>No Show {s.noShow}×</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── COMPARE TABLE ────────────────────────────────────────────────────────────
function CompareTable({ teams, teamStats, colors }) {
  const [open, setOpen] = useState(() => new Set(COMPARE_GROUPS.map(g => g.label)));
  const toggle = (l) => setOpen(prev => { const n = new Set(prev); n.has(l) ? n.delete(l) : n.add(l); return n; });

  return (
    <div>
      {COMPARE_GROUPS.map(group => (
        <div key={group.label} className="card mb-3">
          <div
            className="card-header fw-semibold d-flex justify-content-between align-items-center py-2"
            style={{ cursor: "pointer", fontSize: "1rem" }}
            onClick={() => toggle(group.label)}
          >
            <span>{group.label}</span>
            <span className="text-muted" style={{ fontSize: "0.85rem" }}>{open.has(group.label) ? "▲" : "▼"}</span>
          </div>

          {open.has(group.label) && (
            <div className="card-body p-0">
              <div style={{ overflowX: "auto" }}>
                <table className="table table-sm table-bordered mb-0" style={{ fontSize: "0.9rem", whiteSpace: "nowrap" }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ minWidth: 160 }}>Metric</th>
                      {teams.map((t, i) => (
                        <th key={t} className="text-center" style={{ color: colors[i], minWidth: 100, fontSize: "0.95rem" }}>
                          Team {t}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map(row => {
                      const numVals = teams.map(t => {
                        const s = teamStats[t];
                        if (!s) return null;
                        const v = s[row.key];
                        return typeof v === "number" ? v : null;
                      });
                      const numeric = numVals.filter(v => v !== null);
                      const best  = numeric.length ? (row.higherBetter ? Math.max(...numeric) : Math.min(...numeric)) : null;
                      const worst = numeric.length ? (row.higherBetter ? Math.min(...numeric) : Math.max(...numeric)) : null;
                      const hasSpread = numeric.length > 1 && best !== worst;

                      return (
                        <tr key={row.key}>
                          <td className="text-muted" style={{ fontSize: "0.85rem" }}>{row.label}</td>
                          {teams.map((t, i) => {
                            const s   = teamStats[t];
                            if (!s) return <td key={t} className="text-center text-muted">—</td>;
                            const raw    = s[row.key];
                            const numVal = typeof raw === "number" ? raw : null;
                            const display = typeof raw === "number" ? row.fmt(raw, s) : (raw ?? "—");
                            const isBest  = hasSpread && numVal === best;
                            const isWorst = hasSpread && numVal === worst;
                            return (
                              <td
                                key={t}
                                className={`text-center fw-semibold ${isBest ? "table-success" : isWorst ? "table-danger" : ""}`}
                                style={isBest ? { color: colors[i] } : isWorst ? { color: "#dc3545" } : {}}
                              >
                                {display}
                                {numVal !== null && numeric.length > 1 && Math.max(...numeric) > 0 && (
                                  <MiniBar value={numVal} max={Math.max(...numeric)} color={colors[i]} />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── MATCH FUEL CHARTS ────────────────────────────────────────────────────────
function MatchFuelChart({ rows, color }) {
  if (!rows?.length) return <p className="text-muted small">No data.</p>;
  const vals = rows.map(r => ({
    label: `M${r["Match #"]}`,
    teleop: parseFloat(r["Fuel Scored (Teleop)"]) || 0,
    auto:   parseFloat(r["Auto Fuel Scored"])     || 0,
  }));
  const maxVal = Math.max(...vals.map(v => v.teleop + v.auto), 1);
  const barW = 32, gap = 8, padL = 10, padR = 10, padT = 10, padB = 22;
  const chartH = 100;
  const svgW   = vals.length * (barW + gap) + padL + padR;

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={Math.max(svgW, 200)} height={chartH + padT + padB} style={{ display: "block" }}>
        {vals.map(({ label, teleop, auto }, j) => {
          const totalH  = ((teleop + auto) / maxVal) * chartH;
          const autoH   = (auto   / maxVal) * chartH;
          const teleopH = (teleop / maxVal) * chartH;
          const x = padL + j * (barW + gap);
          return (
            <g key={j}>
              {/* Auto portion (darker) */}
              <rect x={x} y={padT + chartH - totalH} width={barW} height={autoH} rx={0}
                fill={color} opacity={1} />
              {/* Teleop portion (lighter) */}
              <rect x={x} y={padT + chartH - totalH + autoH} width={barW} height={teleopH} rx={0}
                fill={color} opacity={0.45} />
              <text x={x + barW / 2} y={padT + chartH + 14} textAnchor="middle"
                fontSize={9} fill="#495057">{label}</text>
              {totalH > 12 && (
                <text x={x + barW / 2} y={padT + chartH - totalH + 11}
                  textAnchor="middle" fontSize={9} fill="#fff" fontWeight={700}>
                  {Math.round(teleop + auto)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="d-flex gap-3 mt-1" style={{ fontSize: "0.75rem", color: "#6c757d" }}>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: color, opacity: 1, marginRight: 4, borderRadius: 2 }} />Auto</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: color, opacity: 0.45, marginRight: 4, borderRadius: 2 }} />Teleop</span>
      </div>
    </div>
  );
}

// ─── COMMENTS SECTION ────────────────────────────────────────────────────────
function TeamComments({ rows, color }) {
  const comments = rows
    ?.filter(r => r["Serious Comments"]?.trim())
    .map(r => ({ match: r["Match #"], text: r["Serious Comments"] })) ?? [];

  if (!comments.length) return <p className="text-muted small mb-0">No serious comments.</p>;

  return (
    <div style={{ maxHeight: 160, overflowY: "auto" }}>
      {comments.map((c, i) => (
        <div key={i} className="mb-2 pb-1 border-bottom">
          <span className="badge me-2" style={{ background: color, fontSize: "0.75rem" }}>M{c.match}</span>
          <span style={{ fontSize: "0.85rem" }}>{c.text}</span>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN HEAD-TO-HEAD PAGE ───────────────────────────────────────────────────
export default function HeadToHead({ teamStats, pitByTeam }) {
  const allTeams = useMemo(
    () => Object.keys(teamStats).sort((a, b) => parseInt(a) - parseInt(b)),
    [teamStats]
  );

  const [numTeams, setNumTeams] = useState(2);
  const [selTeams, setSelTeams] = useState(() => allTeams.slice(0, 2));

  const handleNumTeams = (n) => {
    setNumTeams(n);
    setSelTeams(prev => {
      const next = [...prev];
      while (next.length < n) next.push(allTeams[next.length] ?? allTeams[0] ?? "");
      return next.slice(0, n);
    });
  };

  const setTeamAt = (idx, val) =>
    setSelTeams(prev => { const n = [...prev]; n[idx] = val; return n; });

  const colors       = selTeams.map((_, i) => TEAM_COLORS[i]  ?? "#888");
  const colorClasses = selTeams.map((_, i) => TEAM_CLASSES[i] ?? "secondary");

  // Most common alliance per team for auton map
  const teamAlliance = (t) => {
    const s = teamStats[t];
    if (!s) return "Red";
    const alls = s.rows.map(r => r["Alliance"]).filter(Boolean);
    const rc = alls.filter(a => a === "Red").length;
    return rc >= alls.length / 2 ? "Red" : "Blue";
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Head to Head</h1>

      {/* ── Selectors ── */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-auto">
              <label className="form-label fw-semibold fs-5">Number of Teams</label>
              <select
                className="form-select form-select-lg"
                style={{ width: 100 }}
                value={numTeams}
                onChange={e => handleNumTeams(parseInt(e.target.value))}
              >
                {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            {selTeams.map((t, i) => (
              <div key={i} className="col-auto">
                <label className="form-label fw-semibold fs-5" style={{ color: colors[i] }}>
                  Team {i + 1}
                </label>
                <select
                  className="form-select form-select-lg"
                  style={{ width: 130, borderColor: colors[i], borderWidth: 2 }}
                  value={t}
                  onChange={e => setTeamAt(i, e.target.value)}
                >
                  {allTeams.map(tm => <option key={tm} value={tm}>{tm}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Team cards ── */}
      <div
        className="mb-4"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(numTeams, 3)}, minmax(0, 1fr))`,
          gap: "1rem",
        }}
      >
        {selTeams.map((t, i) => (
          <TeamCard
            key={i}
            team={t}
            stats={teamStats[t]}
            pit={pitByTeam[t]}
            color={colors[i]}
            colorClass={colorClasses[i]}
          />
        ))}
      </div>

      {/* ── Comparison table ── */}
      <CompareTable
        teams={selTeams}
        teamStats={teamStats}
        colors={colors}
        colorClasses={colorClasses}
      />

      {/* ── Match-by-match total fuel chart ── */}
      <div className="card mt-4 mb-4">
        <div className="card-header fw-semibold fs-5">Match-by-Match Total Fuel</div>
        <div className="card-body">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(numTeams, 2)}, minmax(0, 1fr))`,
              gap: "1.5rem",
            }}
          >
            {selTeams.map((t, i) => (
              <div key={i}>
                <div className="fw-semibold mb-1" style={{ color: colors[i], fontSize: "0.95rem" }}>
                  Team {t}
                </div>
                <MatchFuelChart rows={teamStats[t]?.rows} color={colors[i]} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Autonomous Paths ── */}
      <div className="card mb-4">
        <div className="card-header fw-semibold fs-5">Autonomous Paths</div>
        <div className="card-body">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(numTeams, 3)}, minmax(0, 1fr))`,
              gap: "1.5rem",
            }}
          >
            {selTeams.map((t, i) => {
              const s = teamStats[t];
              return (
                <div key={i}>
                  <div className="fw-semibold mb-2" style={{ color: colors[i], fontSize: "0.95rem" }}>
                    Team {t}
                  </div>
                  {s
                    ? <AutonomousPathsMap
                        votes={s.autonPathVotes}
                        matchCount={s.matchCount}
                        alliance={teamAlliance(t)}
                        teamColor={colors[i]}
                      />
                    : <p className="text-muted small">No data.</p>
                  }
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Comments ── */}
      <div className="card mb-4">
        <div className="card-header fw-semibold fs-5">Comments</div>
        <div className="card-body">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(numTeams, 3)}, minmax(0, 1fr))`,
              gap: "1.5rem",
            }}
          >
            {selTeams.map((t, i) => (
              <div key={i}>
                <div className="fw-semibold mb-2" style={{ color: colors[i], fontSize: "0.95rem" }}>
                  Team {t}
                </div>
                <TeamComments rows={teamStats[t]?.rows} color={colors[i]} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}