import { useState, useMemo, useEffect } from "react";

// ─── METRIC DEFINITIONS (no total fuel) ──────────────────────────────────────
const METRICS = [
  { key: "avgFuelTeleop",  label: "Teleop Fuel - Avg",     fmt: v => v.toFixed(1) },
  { key: "maxFuelTeleop",  label: "Teleop Fuel - Max",     fmt: v => Math.round(v) },
  { key: "avgAutoFuel",    label: "Auto Fuel - Avg",       fmt: v => v.toFixed(1) },
  { key: "maxAutoFuel",    label: "Auto Fuel - Max",       fmt: v => Math.round(v) },
  { key: "avgShuttles",    label: "Shuttles - Avg",        fmt: v => v.toFixed(1) },
  { key: "avgTeleAcc",     label: "Tele Accuracy % - Avg", fmt: v => `${v.toFixed(0)}%` },
  { key: "avgAutoAcc",     label: "Auto Accuracy % - Avg", fmt: v => `${v.toFixed(0)}%` },
  { key: "avgDefRating",   label: "Defense Rating",        fmt: v => v.toFixed(1) },
  { key: "avgRobotSpeed",  label: "Robot Speed",           fmt: v => v.toFixed(1) },
  { key: "avgDriverSkill", label: "Driver Skill",          fmt: v => v.toFixed(1) },
];

// ─── TABLE COLUMNS (no "Matches", no total fuel, climb → Yes/No) ──────────────
const TABLE_COLS = [
  { key: "avgFuelTeleop",  label: "Tele Fuel Avg",  fmt: v => v.toFixed(1),          numericSort: true },
  { key: "maxFuelTeleop",  label: "Tele Fuel Max",  fmt: v => Math.round(v),          numericSort: true },
  { key: "avgAutoFuel",    label: "Auto Fuel Avg",  fmt: v => v.toFixed(1),           numericSort: true },
  { key: "maxAutoFuel",    label: "Auto Fuel Max",  fmt: v => Math.round(v),          numericSort: true },
  { key: "avgShuttles",    label: "Shuttles Avg",   fmt: v => v.toFixed(1),           numericSort: true },
  { key: "avgTeleAcc",     label: "Tele Acc%",      fmt: v => `${v.toFixed(0)}%`,     numericSort: true },
  { key: "avgAutoAcc",     label: "Auto Acc%",      fmt: v => `${v.toFixed(0)}%`,     numericSort: true },
  { key: "climbYesNo",     label: "Climbs",         fmt: v => v,                      numericSort: false },
  { key: "avgDefRating",   label: "Defense Rtg",    fmt: v => v.toFixed(1),           numericSort: true },
  { key: "avgDriverSkill", label: "Driver Skill",   fmt: v => v.toFixed(1),           numericSort: true },
];

// ─── HEAT-MAP COLOR: green above avg, red below avg, shade by deviation ───────
function heatColor(value, colAvg, colStdDev, higherBetter = true) {
  if (colStdDev === 0) return {};
  const z = (value - colAvg) / colStdDev; // how many std-devs from mean
  if (Math.abs(z) < 0.15) return {}; // essentially at average — no colour

  const intensity = Math.min(Math.abs(z) / 2, 1); // 0→1, capped at 2 std-devs
  const isGood    = higherBetter ? z > 0 : z < 0;

  if (isGood) {
    // Green shades: light → dark
    const g = Math.round(200 - intensity * 120); // 200 → 80
    const r = Math.round(220 - intensity * 180); // 220 → 40
    return { background: `rgb(${r},${g},${Math.round(r * 0.4)})`, color: intensity > 0.5 ? "#fff" : "#000" };
  } else {
    // Red shades
    const r = Math.round(220 - intensity * 60);  // 220 → 160
    const g = Math.round(180 - intensity * 140); // 180 → 40
    return { background: `rgb(${r},${g},${g})`, color: intensity > 0.5 ? "#fff" : "#000" };
  }
}

// ─── VERTICAL BAR CHART (teams on X axis) ────────────────────────────────────
function VertBarChart({ data, metricLabel }) {
  if (!data.length) return null;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barW   = 36, gap = 10, padL = 40, padR = 12, padT = 14, padB = 44;
  const chartH = 200;
  const svgW   = data.length * (barW + gap) + padL + padR;

  const gridY = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    v: f * maxVal,
    y: padT + chartH * (1 - f),
  }));

  return (
    <div style={{ overflowX: "auto" }}>
      <svg
        width={Math.max(svgW, 320)}
        height={chartH + padT + padB}
        style={{ display: "block", fontFamily: "inherit" }}
      >
        {/* Grid lines */}
        {gridY.map(({ v, y }) => (
          <g key={v}>
            <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="#dee2e6" strokeWidth={0.8} />
            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={11} fill="#6c757d">
              {Number.isInteger(v) ? v : v.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Y-axis label */}
        <text
          x={12} y={padT + chartH / 2}
          textAnchor="middle" fontSize={11} fill="#6c757d"
          transform={`rotate(-90, 12, ${padT + chartH / 2})`}
        >
          {metricLabel}
        </text>

        {/* Bars */}
        {data.map(({ team, value, highlighted }, i) => {
          const bh    = (value / maxVal) * chartH;
          const x     = padL + i * (barW + gap);
          const y     = padT + chartH - bh;
          const color = highlighted ? "#dc3545" : "#0d6efd";
          return (
            <g key={team}>
              <rect x={x} y={y} width={barW} height={bh} rx={3} fill={color} opacity={0.85} />
              {/* Value above bar */}
              <text x={x + barW / 2} y={Math.max(y - 3, padT + 12)} textAnchor="middle"
                fontSize={10} fill={color} fontWeight={600}>
                {Number.isInteger(value) ? value : value.toFixed(1)}
              </text>
              {/* Team label below */}
              <text x={x + barW / 2} y={padT + chartH + 16} textAnchor="middle"
                fontSize={11} fill={highlighted ? "#dc3545" : "#212529"}
                fontWeight={highlighted ? "700" : "400"}>
                {team}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── MAIN GRAPHS PAGE ─────────────────────────────────────────────────────────
export default function Graphs({ teamStats }) {
  const allTeams = useMemo(
    () => Object.keys(teamStats).sort((a, b) => parseInt(a) - parseInt(b)),
    [teamStats]
  );

  const [selected,       setSelected]       = useState(() => new Set(allTeams));
  const [chartMetric,    setChartMetric]    = useState("avgFuelTeleop");
  const [sortCol,        setSortCol]        = useState("avgFuelTeleop");
  const [sortAsc,        setSortAsc]        = useState(false);
  const [highlightTeam,  setHighlightTeam]  = useState(null);

  // Sync when data loads
  useEffect(() => { setSelected(new Set(allTeams)); }, [allTeams.join(",")]);

  const toggleTeam  = (t) => setSelected(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; });
  const selectAll   = () => setSelected(new Set(allTeams));
  const deselectAll = () => setSelected(new Set());

  // Chart: sorted low → high by selected metric, only selected teams
  const chartMetricDef = METRICS.find(m => m.key === chartMetric);
  const chartData = allTeams
    .filter(t => selected.has(t))
    .map(t => ({ team: t, value: teamStats[t][chartMetric] ?? 0, highlighted: t === highlightTeam }))
    .sort((a, b) => a.value - b.value);

  // Per-column stats for heat-map (computed over ALL teams, not just selected)
  const colStats = useMemo(() => {
    const s = {};
    TABLE_COLS.forEach(c => {
      if (!c.numericSort) return;
      const vals = allTeams.map(t => {
        const v = teamStats[t][c.key];
        return typeof v === "number" ? v : 0;
      });
      const avg = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
      const variance = vals.reduce((a, b) => a + (b - avg) ** 2, 0) / (vals.length || 1);
      s[c.key] = { avg, stdDev: Math.sqrt(variance) };
    });
    return s;
  }, [allTeams, teamStats]);

  // Table sort
  const tableData = useMemo(() => {
    const rows = allTeams.map(t => teamStats[t]);
    return [...rows].sort((a, b) => {
      if (sortCol === "team") {
        return sortAsc ? parseInt(a.team) - parseInt(b.team) : parseInt(b.team) - parseInt(a.team);
      }
      const col = TABLE_COLS.find(c => c.key === sortCol);
      if (col?.numericSort) {
        const av = a[sortCol] ?? 0, bv = b[sortCol] ?? 0;
        return sortAsc ? av - bv : bv - av;
      }
      return sortAsc
        ? String(a[sortCol]).localeCompare(String(b[sortCol]))
        : String(b[sortCol]).localeCompare(String(a[sortCol]));
    });
  }, [allTeams, teamStats, sortCol, sortAsc]);

  const handleSort = (key) => {
    if (sortCol === key) setSortAsc(a => !a);
    else { setSortCol(key); setSortAsc(false); }
  };

  // higher-better map
  const higherBetterMap = {
    avgFuelTeleop: true, maxFuelTeleop: true, avgAutoFuel: true, maxAutoFuel: true,
    avgShuttles: true, avgTeleAcc: true, avgAutoAcc: true,
    avgDefRating: true, avgDriverSkill: true,
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Graphs</h1>

      <div className="row g-4">
        {/* ── Team filter ── */}
        <div className="col-md-3 col-lg-2">
          <div className="card">
            <div className="card-header fw-semibold py-2">Filter Teams</div>
            <div className="card-body py-2 px-3">
              <div className="d-flex gap-2 mb-2">
                <button type="button" className="btn btn-sm btn-outline-primary flex-fill" onClick={selectAll}>All</button>
                <button type="button" className="btn btn-sm btn-outline-secondary flex-fill" onClick={deselectAll}>None</button>
              </div>
              <div style={{ maxHeight: 420, overflowY: "auto" }}>
                {allTeams.map(t => (
                  <div key={t} className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`filter-${t}`}
                      checked={selected.has(t)}
                      onChange={() => toggleTeam(t)}
                      style={{ accentColor: "#dc3545" }}
                    />
                    <label
                      className={`form-check-label ${t === highlightTeam ? "fw-bold text-danger" : "text-dark"}`}
                      htmlFor={`filter-${t}`}
                      onClick={e => { e.preventDefault(); setHighlightTeam(prev => prev === t ? null : t); }}
                      style={{ cursor: "pointer", fontSize: "0.95rem" }}
                    >
                      {t}
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-muted" style={{ fontSize: "0.78rem" }}>
                Click label to highlight
              </div>
            </div>
          </div>
        </div>

        {/* ── Bar chart + table ── */}
        <div className="col-md-9 col-lg-10">
          {/* Chart card */}
          <div className="card mb-4">
            <div className="card-header fw-semibold d-flex align-items-center gap-3 flex-wrap py-2">
              <span>Choose Metric</span>
              <select
                className="form-select form-select-sm"
                style={{ maxWidth: 280 }}
                value={chartMetric}
                onChange={e => setChartMetric(e.target.value)}
              >
                {METRICS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
            </div>
            <div className="card-body">
              {chartData.length === 0
                ? <p className="text-muted">No teams selected.</p>
                : <VertBarChart data={chartData} metricLabel={chartMetricDef?.label ?? ""} />
              }
            </div>
          </div>

          {/* Summary stats table */}
          <div className="card">
            <div className="card-header fw-semibold py-2">
              All Teams — Summary Stats
              <span className="text-muted ms-2 fw-normal" style={{ fontSize: "0.8rem" }}>
                (click headers to sort · heat-map shading: green = above avg, red = below avg)
              </span>
            </div>
            <div className="card-body p-0">
              <div style={{ overflowX: "auto" }}>
                <table
                  className="table table-sm table-hover table-bordered mb-0"
                  style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}
                >
                  <thead className="table-dark">
                    <tr>
                      <th
                        className="text-center"
                        style={{ cursor: "pointer", userSelect: "none" }}
                        onClick={() => handleSort("team")}
                      >
                        Team {sortCol === "team" ? (sortAsc ? "↑" : "↓") : ""}
                      </th>
                      {TABLE_COLS.map(c => (
                        <th
                          key={c.key}
                          className="text-center"
                          style={{ cursor: "pointer", userSelect: "none" }}
                          onClick={() => handleSort(c.key)}
                        >
                          {c.label} {sortCol === c.key ? (sortAsc ? "↑" : "↓") : ""}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map(s => (
                      <tr
                        key={s.team}
                        className={s.team === highlightTeam ? "table-danger" : ""}
                        style={{ cursor: "pointer" }}
                        onClick={() => setHighlightTeam(prev => prev === s.team ? null : s.team)}
                      >
                        <td className="text-center fw-semibold" style={{ fontSize: "0.9rem" }}>
                          {s.team}
                        </td>
                        {TABLE_COLS.map(c => {
                          const raw    = s[c.key];
                          const numVal = typeof raw === "number" ? raw : null;
                          const cs     = colStats[c.key];
                          const cellStyle = (numVal !== null && cs)
                            ? heatColor(numVal, cs.avg, cs.stdDev, higherBetterMap[c.key] ?? true)
                            : {};
                          const display = typeof raw === "number"
                            ? c.fmt(raw, s)
                            : (raw ?? "—");
                          return (
                            <td
                              key={c.key}
                              className="text-center"
                              style={{ ...cellStyle, fontSize: "0.9rem", fontWeight: cellStyle.background ? 600 : 400 }}
                            >
                              {display}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}