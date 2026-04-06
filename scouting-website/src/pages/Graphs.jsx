import { useState, useMemo } from "react";

// ─── METRIC DEFINITIONS ───────────────────────────────────────────────────────
const METRICS = [
  { key: "avgTotalFuel",   label: "Total Fuel - Avg",      fmt: v => v.toFixed(1) },
  { key: "medTotalFuel",   label: "Total Fuel - Median",   fmt: v => v.toFixed(1) },
  { key: "maxTotalFuel",   label: "Total Fuel - Max",      fmt: v => Math.round(v) },
  { key: "avgFuelTeleop",  label: "Teleop Fuel - Avg",     fmt: v => v.toFixed(1) },
  { key: "medFuelTeleop",  label: "Teleop Fuel - Median",  fmt: v => v.toFixed(1) },
  { key: "maxFuelTeleop",  label: "Teleop Fuel - Max",     fmt: v => Math.round(v) },
  { key: "avgAutoFuel",    label: "Auto Fuel - Avg",       fmt: v => v.toFixed(1) },
  { key: "medAutoFuel",    label: "Auto Fuel - Median",    fmt: v => v.toFixed(1) },
  { key: "avgShuttles",    label: "Shuttles - Avg",        fmt: v => v.toFixed(1) },
  { key: "avgTeleAcc",     label: "Teleop Accuracy % - Avg", fmt: v => `${v.toFixed(0)}%` },
  { key: "avgAutoAcc",     label: "Auto Accuracy % - Avg", fmt: v => `${v.toFixed(0)}%` },
  { key: "avgDefRating",   label: "Defense Rating",        fmt: v => v.toFixed(1) },
  { key: "avgRobotSpeed",  label: "Robot Speed",           fmt: v => v.toFixed(1) },
  { key: "avgDriverSkill", label: "Driver Skill",          fmt: v => v.toFixed(1) },
];

// Table columns (always shown)
const TABLE_COLS = [
  { key: "matchCount",    label: "Matches",       fmt: v => v },
  { key: "avgTotalFuel",  label: "Total-Avg",     fmt: v => v.toFixed(1) },
  { key: "medTotalFuel",  label: "Total-Med",     fmt: v => v.toFixed(1) },
  { key: "maxTotalFuel",  label: "Total-Max",     fmt: v => Math.round(v) },
  { key: "avgFuelTeleop", label: "Tele-Avg",      fmt: v => v.toFixed(1) },
  { key: "medFuelTeleop", label: "Tele-Med",      fmt: v => v.toFixed(1) },
  { key: "avgAutoFuel",   label: "Auto-Avg",      fmt: v => v.toFixed(1) },
  { key: "medAutoFuel",   label: "Auto-Med",      fmt: v => v.toFixed(1) },
  { key: "avgShuttles",   label: "Shuttles",      fmt: v => v.toFixed(1) },
  { key: "avgTeleAcc",    label: "Teleop Accuracy %",     fmt: v => `${v.toFixed(0)}%` },
  { key: "avgAutoAcc",    label: "Auto Accuracy %",     fmt: v => `${v.toFixed(0)}%` },
  { key: "deepClimbs",    label: "Deep Climbs",   fmt: (v, s) => `${v}/${s.matchCount}` },
  { key: "medClimbStr",   label: "Med Climb",     fmt: v => v },
  { key: "avgDefRating",  label: "Def. Rating",   fmt: v => v.toFixed(1) },
  { key: "avgDriverSkill",label: "Driver Skill",  fmt: v => v.toFixed(1) },
];

// ─── HORIZONTAL BAR CHART ────────────────────────────────────────────────────
function HorizBarChart({ data, metricLabel }) {
  if (!data.length) return null;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barH   = 28;
  const gap    = 5;
  const padL   = 56;
  const padR   = 60;
  const padT   = 8;
  const padB   = 28;
  const svgW   = 700;
  const chartW = svgW - padL - padR;
  const svgH   = data.length * (barH + gap) + padT + padB;

  const gridXs = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    x: padL + f * chartW,
    v: (f * maxVal),
  }));

  return (
    <div style={{ overflowX: "auto" }}>
      <svg
        width={svgW}
        height={svgH}
        style={{ display: "block", maxWidth: "100%", fontFamily: "inherit" }}
      >
        {/* Grid verticals */}
        {gridXs.map(({ x, v }) => (
          <g key={v}>
            <line x1={x} y1={padT} x2={x} y2={svgH - padB} stroke="#dee2e6" strokeWidth={0.8} />
            <text
              x={x}
              y={svgH - padB + 16}
              textAnchor="middle"
              fontSize={10}
              fill="#6c757d"
            >
              {Number.isInteger(v) ? v : v.toFixed(1)}
            </text>
          </g>
        ))}

        {/* X-axis label */}
        <text
          x={padL + chartW / 2}
          y={svgH}
          textAnchor="middle"
          fontSize={11}
          fill="#6c757d"
        >
          {metricLabel}
        </text>

        {/* Bars */}
        {data.map(({ team, value, highlighted }, i) => {
          const bw = (value / maxVal) * chartW;
          const y  = padT + i * (barH + gap);
          const barColor = highlighted ? "#dc3545" : "#0d6efd";
          return (
            <g key={team}>
              <rect
                x={padL}
                y={y}
                width={bw}
                height={barH}
                rx={3}
                fill={barColor}
                opacity={0.85}
              />
              {/* Team label */}
              <text
                x={padL - 5}
                y={y + barH / 2 + 4}
                textAnchor="end"
                fontSize={11}
                fill={highlighted ? "#dc3545" : "#212529"}
                fontWeight={highlighted ? "600" : "400"}
              >
                {team}
              </text>
              {/* Value label */}
              <text
                x={padL + bw + 5}
                y={y + barH / 2 + 4}
                fontSize={11}
                fill={barColor}
                fontWeight="500"
              >
                {Number.isInteger(value) ? value : value.toFixed(1)}
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

  const [selected, setSelected]     = useState(() => new Set(allTeams));
  const [chartMetric, setChartMetric] = useState("avgTotalFuel");
  const [sortCol, setSortCol]         = useState("avgTotalFuel");
  const [sortAsc, setSortAsc]         = useState(false);
  const [highlightTeam, setHighlightTeam] = useState(null);

  // Keep selected in sync when allTeams loads
  useMemo(() => {
    setSelected(new Set(allTeams));
  }, [allTeams.join(",")]);

  const toggleTeam = (t) => setSelected(prev => {
    const n = new Set(prev);
    n.has(t) ? n.delete(t) : n.add(t);
    return n;
  });
  const selectAll   = () => setSelected(new Set(allTeams));
  const deselectAll = () => setSelected(new Set());

  const filteredTeams = allTeams.filter(t => selected.has(t));

  // Chart data sorted low → high
  const chartMetricDef = METRICS.find(m => m.key === chartMetric);
  const chartData = filteredTeams
    .map(t => ({ team: t, value: teamStats[t][chartMetric] ?? 0, highlighted: t === highlightTeam }))
    .sort((a, b) => a.value - b.value);

  // Global column maxes for cell highlighting
  const colMaxes = useMemo(() => {
    const m = {};
    TABLE_COLS.forEach(c => {
      if (c.key === "medClimbStr" || c.key === "matchCount") return;
      m[c.key] = Math.max(...allTeams.map(t => {
        const v = teamStats[t][c.key];
        return typeof v === "number" ? v : 0;
      }));
    });
    return m;
  }, [allTeams, teamStats]);

  // Table data with sort
  const tableData = useMemo(() => {
    const rows = allTeams.map(t => teamStats[t]);
    return [...rows].sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol];
      if (typeof av === "number" && typeof bv === "number") return sortAsc ? av - bv : bv - av;
      return sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [allTeams, teamStats, sortCol, sortAsc]);

  const handleSort = (key) => {
    if (sortCol === key) setSortAsc(a => !a);
    else { setSortCol(key); setSortAsc(false); }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Graphs</h1>

      <div className="row g-4">
        {/* ── Team filter ── */}
        <div className="col-md-3 col-lg-2">
          <div className="card">
            <div className="card-header fw-semibold d-flex justify-content-between align-items-center py-2">
              <span>Filter Teams</span>
            </div>
            <div className="card-body py-2 px-3">
              <div className="d-flex gap-2 mb-2">
                <button type="button" className="btn btn-sm btn-outline-primary flex-fill" onClick={selectAll}>All</button>
                <button type="button" className="btn btn-sm btn-outline-secondary flex-fill" onClick={deselectAll}>None</button>
              </div>
              <div style={{ maxHeight: 400, overflowY: "auto" }}>
                {allTeams.map(t => (
                  <div key={t} className="form-check mb-1">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`filter-${t}`}
                      checked={selected.has(t)}
                      onChange={() => toggleTeam(t)}
                      style={{ accentColor: "#dc3545" }}
                    />
                    <label
                      className={`form-check-label small ${t === highlightTeam ? "fw-bold text-danger" : ""}`}
                      htmlFor={`filter-${t}`}
                      onClick={(e) => { e.preventDefault(); setHighlightTeam(prev => prev === t ? null : t); }}
                      style={{ cursor: "pointer" }}
                    >
                      {t}
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-muted" style={{ fontSize: "0.75rem" }}>
                Click a label to highlight in chart
              </div>
            </div>
          </div>
        </div>

        {/* ── Bar chart ── */}
        <div className="col-md-9 col-lg-10">
          <div className="card mb-4">
            <div className="card-header fw-semibold d-flex align-items-center gap-3 flex-wrap py-2">
              <span>Choose Metric</span>
              <select
                className="form-select form-select-sm"
                style={{ maxWidth: 260 }}
                value={chartMetric}
                onChange={e => setChartMetric(e.target.value)}
              >
                {METRICS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
            </div>
            <div className="card-body">
              {chartData.length === 0
                ? <p className="text-muted">No teams selected.</p>
                : <HorizBarChart data={chartData} metricLabel={chartMetricDef?.label ?? ""} />
              }
            </div>
          </div>

          {/* ── Stats table ── */}
          <div className="card">
            <div className="card-header fw-semibold py-2">
              All Teams — Summary Stats
              <span className="text-muted small ms-2 fw-normal">(click column headers to sort · top value per column highlighted in green)</span>
            </div>
            <div className="card-body p-0">
              <div style={{ overflowX: "auto" }}>
                <table className="table table-sm table-hover table-bordered mb-0" style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}>
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
                    {tableData.map((s, rowIdx) => (
                      <tr
                        key={s.team}
                        className={s.team === highlightTeam ? "table-danger" : ""}
                        style={{ cursor: "pointer" }}
                        onClick={() => setHighlightTeam(prev => prev === s.team ? null : s.team)}
                      >
                        <td className="text-center fw-semibold">{s.team}</td>
                        {TABLE_COLS.map(c => {
                          const raw = s[c.key];
                          const numVal = typeof raw === "number" ? raw : null;
                          const isMax = numVal !== null && colMaxes[c.key] !== undefined && numVal === colMaxes[c.key] && numVal > 0;
                          const display = typeof raw === "number"
                            ? c.fmt(raw, s)
                            : (raw ?? "—");
                          return (
                            <td
                              key={c.key}
                              className={`text-center ${isMax ? "table-success fw-semibold" : ""}`}
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