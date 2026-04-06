import { useState, useMemo } from "react";

// ─── COLOR PALETTE FOR TEAMS ─────────────────────────────────────────────────
const TEAM_COLORS  = ["#d63384", "#198754", "#0d6efd", "#fd7e14", "#6f42c1", "#20c997"];
const TEAM_CLASSES = ["danger",  "success", "primary",  "warning",  "secondary", "info"];

// ─── COMPARISON METRIC GROUPS ────────────────────────────────────────────────
const COMPARE_GROUPS = [
  {
    label: "Fuel Scoring",
    rows: [
      { key: "medTotalFuel",   label: "Median Total Fuel",   fmt: v => v.toFixed(1), higherBetter: true },
      { key: "avgTotalFuel",   label: "Avg Total Fuel",      fmt: v => v.toFixed(1), higherBetter: true },
      { key: "maxTotalFuel",   label: "Max Total Fuel",      fmt: v => Math.round(v), higherBetter: true },
      { key: "medFuelTeleop",  label: "Median Teleop Fuel",  fmt: v => v.toFixed(1), higherBetter: true },
      { key: "avgFuelTeleop",  label: "Avg Teleop Fuel",     fmt: v => v.toFixed(1), higherBetter: true },
      { key: "medAutoFuel",    label: "Median Auto Fuel",    fmt: v => v.toFixed(1), higherBetter: true },
      { key: "avgAutoFuel",    label: "Avg Auto Fuel",       fmt: v => v.toFixed(1), higherBetter: true },
      { key: "avgShuttles",    label: "Avg Shuttles",        fmt: v => v.toFixed(1), higherBetter: true },
    ],
  },
  {
    label: "Accuracy",
    rows: [
      { key: "avgTeleAcc", label: "Avg Teleop Accuracy",  fmt: v => `${v.toFixed(0)}%`, higherBetter: true },
      { key: "medTeleAcc", label: "Med Teleop Accuracy",  fmt: v => `${v.toFixed(0)}%`, higherBetter: true },
      { key: "avgAutoAcc", label: "Avg Auto Accuracy",  fmt: v => `${v.toFixed(0)}%`, higherBetter: true },
      { key: "medAutoAcc", label: "Med Auto Accuracy",  fmt: v => `${v.toFixed(0)}%`, higherBetter: true },
    ],
  },
  {
    label: "Climbing",
    rows: [
      { key: "medClimbStr",  label: "Median Climb",     fmt: v => v,                 higherBetter: false },
      { key: "medClimb",     label: "Median Climb Lvl", fmt: v => v.toFixed(1),      higherBetter: true },
      { key: "deepClimbs",   label: "Deep (L3) Climbs", fmt: (v, s) => `${v}/${s.matchCount}`, higherBetter: true },
      { key: "l2Climbs",     label: "L2 Climbs",        fmt: (v, s) => `${v}/${s.matchCount}`, higherBetter: true },
      { key: "l1Climbs",     label: "L1 Climbs",        fmt: (v, s) => `${v}/${s.matchCount}`, higherBetter: true },
      { key: "failedClimbs", label: "Failed Climbs",    fmt: (v, s) => `${v}/${s.matchCount}`, higherBetter: false },
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
      { key: "hasAuton",         label: "Has Auton",           fmt: (v, s) => `${v}/${s.matchCount}`, higherBetter: true },
      { key: "autonShuttled",    label: "Auton Shuttled",      fmt: (v, s) => `${v}/${s.matchCount}`, higherBetter: true },
      { key: "autonShootPre",    label: "Shoots Preload",      fmt: (v, s) => `${v}/${s.matchCount}`, higherBetter: true },
      { key: "autonShootOther",  label: "Shoots Other Fuel",   fmt: (v, s) => `${v}/${s.matchCount}`, higherBetter: true },
    ],
  },
  {
    label: "Issues",
    rows: [
      { key: "noShow",       label: "No Show",      fmt: v => v, higherBetter: false },
      { key: "didntMove",    label: "Didn't Move",  fmt: v => v, higherBetter: false },
      { key: "broke",        label: "Broke",        fmt: v => v, higherBetter: false },
      { key: "penalties",    label: "Penalties",    fmt: v => v, higherBetter: false },
      { key: "jitteryDrive", label: "Jittery Drive",fmt: v => v, higherBetter: false },
      { key: "fuelJammed",   label: "Fuel Jammed",  fmt: v => v, higherBetter: false },
      { key: "robotBeached", label: "Robot Beached",fmt: v => v, higherBetter: false },
      { key: "goodVibes",    label: "Good Vibes",   fmt: v => v, higherBetter: true  },
      { key: "badVibes",     label: "Bad Vibes",    fmt: v => v, higherBetter: false },
    ],
  },
];

// ─── RADAR / MINI BAR FOR ONE METRIC ACROSS TEAMS ────────────────────────────
function MiniProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="progress" style={{ height: 6, borderRadius: 3, background: "#e9ecef" }}>
      <div
        className="progress-bar"
        style={{ width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.3s" }}
      />
    </div>
  );
}

// ─── TEAM CARD ────────────────────────────────────────────────────────────────
function TeamCard({ team, stats, pit, color, colorClass }) {
  const s = stats;
  return (
    <div className="card h-100" style={{ borderTop: `4px solid ${color}` }}>
      <div className="card-body pb-2">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h5 className="card-title mb-0" style={{ color }}>Team {team}</h5>
            {s && <div className="text-muted small">{s.matchCount} matches</div>}
          </div>
          <span className={`badge bg-${colorClass}`}>
            {s ? `Med: ${s.medTotalFuel.toFixed(1)} fuel` : "No data"}
          </span>
        </div>

        {pit && (
          <div className="small text-muted" style={{ lineHeight: 1.6 }}>
            {pit["Weight"] && <span>{pit["Weight"]} lbs · </span>}
            {pit["Drive Motors"] && <span>{pit["Drive Motors"]} · </span>}
            {pit["Shooter Type"] && <span>{pit["Shooter Type"]}</span>}
            {(pit["Length (w/ bumpers)"] || pit["Vision System"]) && (
              <><br />
                {pit["Vision System"] && <span>{pit["Vision System"]}</span>}
                {pit["Length (w/ bumpers)"] && <span> · L{pit["Length (w/ bumpers)"]} × W{pit["Width (w/ bumpers)"]}</span>}
              </>
            )}
          </div>
        )}

        {s && (
          <div className="mt-2">
            <div className="d-flex flex-wrap gap-1">
              {s.deepClimbs > 0    && <span className="badge bg-success" style={{ fontSize: "0.7rem" }}>L3: {s.deepClimbs}×</span>}
              {s.hasTurret > 0     && <span className="badge bg-primary" style={{ fontSize: "0.7rem" }}>Turret</span>}
              {s.shootsMoving > 0  && <span className="badge bg-info text-dark" style={{ fontSize: "0.7rem" }}>Shoots Moving</span>}
              {s.broke > 0         && <span className="badge bg-danger" style={{ fontSize: "0.7rem" }}>Broke {s.broke}×</span>}
              {s.noShow > 0        && <span className="badge bg-warning text-dark" style={{ fontSize: "0.7rem" }}>No Show {s.noShow}×</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── COMPARISON TABLE ────────────────────────────────────────────────────────
function CompareTable({ teams, teamStats, colors, colorClasses }) {
  const [openGroups, setOpenGroups] = useState(() => new Set(COMPARE_GROUPS.map(g => g.label)));

  const toggleGroup = (label) => {
    setOpenGroups(prev => {
      const n = new Set(prev);
      n.has(label) ? n.delete(label) : n.add(label);
      return n;
    });
  };

  return (
    <div>
      {COMPARE_GROUPS.map(group => (
        <div key={group.label} className="card mb-3">
          <div
            className="card-header fw-semibold d-flex justify-content-between align-items-center py-2"
            style={{ cursor: "pointer" }}
            onClick={() => toggleGroup(group.label)}
          >
            <span>{group.label}</span>
            <span>{openGroups.has(group.label) ? "▲" : "▼"}</span>
          </div>

          {openGroups.has(group.label) && (
            <div className="card-body p-0">
              <div style={{ overflowX: "auto" }}>
                <table className="table table-sm table-bordered mb-0" style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ minWidth: 160 }}>Metric</th>
                      {teams.map((t, i) => (
                        <th key={t} className="text-center" style={{ color: colors[i], minWidth: 90 }}>
                          Team {t}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map(row => {
                      const vals = teams.map(t => {
                        const s = teamStats[t];
                        if (!s) return null;
                        return typeof s[row.key] === "number" ? s[row.key] : null;
                      });
                      const numericVals = vals.filter(v => v !== null);
                      const bestVal = numericVals.length
                        ? (row.higherBetter ? Math.max(...numericVals) : Math.min(...numericVals))
                        : null;
                      const worstVal = numericVals.length
                        ? (row.higherBetter ? Math.min(...numericVals) : Math.max(...numericVals))
                        : null;
                      // Only highlight if there's a meaningful spread
                      const hasSpread = numericVals.length > 1 && bestVal !== worstVal;

                      return (
                        <tr key={row.key}>
                          <td className="text-muted">{row.label}</td>
                          {teams.map((t, i) => {
                            const s = teamStats[t];
                            if (!s) return <td key={t} className="text-center text-muted">—</td>;
                            const raw = s[row.key];
                            const numVal = typeof raw === "number" ? raw : null;
                            const display = typeof raw === "number"
                              ? row.fmt(raw, s)
                              : (raw ?? "—");
                            const isBest  = hasSpread && numVal === bestVal;
                            const isWorst = hasSpread && numVal === worstVal;
                            return (
                              <td
                                key={t}
                                className={`text-center fw-semibold ${isBest ? "table-success" : isWorst ? "table-danger" : ""}`}
                                style={isBest ? { color: colors[i] } : isWorst ? { color: "#dc3545" } : {}}
                              >
                                {display}
                                {/* Mini bar for numeric values */}
                                {numVal !== null && numericVals.length > 1 && Math.max(...numericVals) > 0 && (
                                  <MiniProgressBar
                                    value={numVal}
                                    max={Math.max(...numericVals)}
                                    color={colors[i]}
                                  />
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

// ─── MAIN HEAD-TO-HEAD PAGE ───────────────────────────────────────────────────
export default function HeadToHead({ teamStats, pitByTeam }) {
  const allTeams = useMemo(
    () => Object.keys(teamStats).sort((a, b) => parseInt(a) - parseInt(b)),
    [teamStats]
  );

  const [numTeams, setNumTeams]   = useState(2);
  const [selTeams, setSelTeams]   = useState(() => allTeams.slice(0, 2));

  // Expand/shrink selection array when numTeams changes
  const handleNumTeams = (n) => {
    setNumTeams(n);
    setSelTeams(prev => {
      const next = [...prev];
      while (next.length < n) next.push(allTeams[next.length] ?? allTeams[0] ?? "");
      return next.slice(0, n);
    });
  };

  const setTeamAt = (idx, val) => {
    setSelTeams(prev => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const colors       = selTeams.map((_, i) => TEAM_COLORS[i]  ?? "#888");
  const colorClasses = selTeams.map((_, i) => TEAM_CLASSES[i] ?? "secondary");

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Head-to-Head</h1>

      {/* ── Selectors ── */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-auto">
              <label className="form-label fw-semibold">Number of Teams</label>
              <select
                className="form-select"
                style={{ width: 90 }}
                value={numTeams}
                onChange={e => handleNumTeams(parseInt(e.target.value))}
              >
                {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {selTeams.map((t, i) => (
              <div key={i} className="col-auto">
                <label className="form-label fw-semibold" style={{ color: colors[i] }}>
                  Team {i + 1}
                </label>
                <select
                  className="form-select"
                  style={{ width: 120, borderColor: colors[i] }}
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
        className="row g-3 mb-4"
        style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(numTeams, 3)}, minmax(0, 1fr))` }}
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

      {/* ── Per-match fuel chart side by side ── */}
      <div className="card mt-4">
        <div className="card-header fw-semibold">Match-by-Match Total Fuel</div>
        <div className="card-body">
          <div
            className="row g-3"
            style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(numTeams, 2)}, minmax(0, 1fr))` }}
          >
            {selTeams.map((t, i) => {
              const s = teamStats[t];
              if (!s) return <div key={i}><p className="text-muted small">No data for team {t}</p></div>;
              const rows = s.rows;
              const vals = rows.map(r => ({
                label: `M${r["Match #"]}`,
                value: (parseFloat(r["Fuel Scored (Teleop)"]) || 0) + (parseFloat(r["Auto Fuel Scored"]) || 0),
              }));
              const maxVal = Math.max(...vals.map(v => v.value), 1);
              const barW = 28, gap = 8, padL = 8, padR = 8, padT = 10, padB = 24;
              const svgW = vals.length * (barW + gap) + padL + padR;
              const chartH = 100;

              return (
                <div key={i}>
                  <div className="small fw-semibold mb-1" style={{ color: colors[i] }}>Team {t}</div>
                  <div style={{ overflowX: "auto" }}>
                    <svg width={Math.max(svgW, 200)} height={chartH + padT + padB} style={{ display: "block" }}>
                      {vals.map(({ label, value }, j) => {
                        const bh = (value / maxVal) * chartH;
                        const x  = padL + j * (barW + gap);
                        const y  = padT + chartH - bh;
                        return (
                          <g key={j}>
                            <rect x={x} y={y} width={barW} height={bh} rx={2} fill={colors[i]} opacity={0.85} />
                            <text x={x + barW / 2} y={padT + chartH + 14} textAnchor="middle" fontSize={9} fill="#6c757d">{label}</text>
                            {bh > 12 && (
                              <text x={x + barW / 2} y={y + 11} textAnchor="middle" fontSize={9} fill="#fff" fontWeight={600}>{Math.round(value)}</text>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}