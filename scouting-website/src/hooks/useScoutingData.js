import { useState, useEffect, useMemo } from "react";

// ─── CSV PARSER ───────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map(line => {
    const vals = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ = !inQ; continue; }
      if (c === "," && !inQ) { vals.push(cur.trim()); cur = ""; continue; }
      cur += c;
    }
    vals.push(cur.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] ?? "").replace(/^"|"$/g, ""); });
    return obj;
  });
}

// ─── MATH HELPERS ─────────────────────────────────────────────────────────────
export function num(v) {
  const n = parseFloat(String(v ?? "").replace("%", ""));
  return isNaN(n) ? 0 : n;
}
export function pct(v) { return num(String(v ?? "").replace("%", "")); }
export function average(arr) {
  const valid = arr.filter(v => typeof v === "number" && isFinite(v));
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
}
export function maximum(arr) {
  const valid = arr.filter(v => typeof v === "number" && isFinite(v));
  return valid.length ? Math.max(...valid) : 0;
}

// ─── OUTLIER REMOVAL (IQR method) ────────────────────────────────────────────
// Only applied when n >= 4 — leaves small samples untouched
export function removeOutliers(arr) {
  if (arr.length < 4) return arr;
  const s = [...arr].sort((a, b) => a - b);
  const q1 = s[Math.floor(s.length * 0.25)];
  const q3 = s[Math.floor(s.length * 0.75)];
  const iqr = q3 - q1;
  if (iqr === 0) return arr;
  const lo = q1 - 1.5 * iqr;
  const hi = q3 + 1.5 * iqr;
  const filtered = arr.filter(v => v >= lo && v <= hi);
  return filtered.length >= 2 ? filtered : arr;
}

// ─── MAJORITY VOTE ────────────────────────────────────────────────────────────
export function majorityYes(values) {
  const nonEmpty = values.filter(v => v === "Yes" || v === "No");
  if (!nonEmpty.length) return "No";
  const yesCount = nonEmpty.filter(v => v === "Yes").length;
  return yesCount > nonEmpty.length / 2 ? "Yes" : "No";
}
export function mostCommon(values) {
  if (!values.length) return "";
  const counts = {};
  values.forEach(v => { counts[v] = (counts[v] ?? 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

// ─── MERGE MULTI-SCOUTED ROWS FOR ONE MATCH ──────────────────────────────────
function mergeMatchRows(rows) {
  // Exclude rescout-flagged rows
  const valid = rows.filter(r => r["Rescout Request"] !== "Yes");
  if (!valid.length) return null;
  if (valid.length === 1) return valid[0];

  const merged = { ...valid[0] };

  // Numeric: average
  const numericFields = [
    "Auto Fuel Scored", "Fuel Scored (Teleop)", "Shuttles (Teleop)",
    "Defense Rating", "Penalties (Defense)", "Robot Speed",
    "Intake-to-Shooter Speed", "Driver Skill",
  ];
  numericFields.forEach(f => {
    merged[f] = String(Math.round(average(valid.map(r => num(r[f]))) * 10) / 10);
  });

  // Auto accuracy — only rows where "Can shoot preload?" === "Yes"
  const autoAccRows = valid.filter(r => r["Can shoot preload?"] === "Yes");
  merged["Shot Accuracy (Auton)"] = autoAccRows.length
    ? String(Math.round(average(autoAccRows.map(r => pct(r["Shot Accuracy (Auton)"]))))) + "%"
    : "0%";

  // Teleop accuracy — only rows where teleop fuel > 0
  const teleAccRows = valid.filter(r => num(r["Fuel Scored (Teleop)"]) > 0);
  merged["Shot Accuracy (Teleop)"] = teleAccRows.length
    ? String(Math.round(average(teleAccRows.map(r => pct(r["Shot Accuracy (Teleop)"]))))) + "%"
    : "0%";

  // Boolean: majority vote
  [
    "Has Auton?", "Has Shuttling Auton?", "Can shoot preload?",
    "Can shoot Fuel outside of preloaded Fuel?", "Auton Climb Side", "Auton Climb Center",
    "Has Turret?", "Can score while moving?", "Bulldozing?",
    "Climbed Side", "Climbed Center", "Chasing", "Pinning", "Blocking Bump/Trench",
    "No show", "Did not move", "Broke", "Penalties", "Good vs. Defense",
    "Bad vs. Defense", "Jittery drive", "Good vibes", "Bad vibes",
    "Can shoot from only specific spots", "Can shoot while stationary from any part of the field",
    "Can shoot while moving", "Long line-up time to shoot Fuel",
    "Fuel got stuck/jammed inside robot", "Robot got beached", "Robot browned out",
  ].forEach(f => { merged[f] = majorityYes(valid.map(r => r[f])); });

  // Categorical: most common
  merged["Climb (Teleop)"]     = mostCommon(valid.map(r => r["Climb (Teleop)"]).filter(Boolean)) || "";
  merged["Starting Location"]  = mostCommon(valid.map(r => r["Starting Location"]).filter(Boolean)) || "";
  merged["Auton Paths"]        = mostCommon(valid.map(r => r["Auton Paths"]).filter(Boolean)) || "";
  merged["Alliance"]           = mostCommon(valid.map(r => r["Alliance"]).filter(Boolean)) || "Red";
  merged["Time to Climb"]      = mostCommon(valid.map(r => r["Time to Climb"]).filter(Boolean)) || "";

  // Comments: join unique non-empty
  merged["Serious Comments"] = [...new Set(valid.map(r => r["Serious Comments"]).filter(Boolean))].join(" | ");
  merged["Funny Comments"]   = [...new Set(valid.map(r => r["Funny Comments"]).filter(Boolean))].join(" | ");

  return merged;
}

// ─── AUTON PATH VOTES ─────────────────────────────────────────────────────────
export const AUTON_PATH_LABELS = ["Shuttle-Right", "Shuttle-Left", "Tower", "Depot", "Chute"];
export function computeAutonPathVotes(rows) {
  const counts = {};
  AUTON_PATH_LABELS.forEach(p => { counts[p] = 0; });
  rows.forEach(r => {
    const paths = (r["Auton Paths"] || "").split(",").map(s => s.trim()).filter(Boolean);
    paths.forEach(p => { if (counts[p] !== undefined) counts[p]++; });
  });
  return counts;
}

// ─── TEAM STATS COMPUTATION ───────────────────────────────────────────────────
const CLIMB_MAP = { L1: 1, L2: 2, L3: 3, "Failed Climb": 0, "": 0, None: 0 };

export function computeTeamStats(rawRows) {
  // Group by team → by match
  const byTeam = {};
  rawRows.forEach(r => {
    const t = r["Scouted Team #"]?.toString().trim();
    if (!t || t === "0") return;
    const m = r["Match #"]?.toString().trim() || "0";
    if (!byTeam[t]) byTeam[t] = {};
    if (!byTeam[t][m]) byTeam[t][m] = [];
    byTeam[t][m].push(r);
  });

  const stats = {};

  Object.entries(byTeam).forEach(([team, byMatch]) => {
    // One merged row per unique match
    const mergedRows = Object.entries(byMatch)
      .map(([, rows]) => mergeMatchRows(rows))
      .filter(Boolean)
      .sort((a, b) => parseInt(a["Match #"] || 0) - parseInt(b["Match #"] || 0));

    if (!mergedRows.length) return;
    const n = mergedRows.length;

    const fuelTeleop   = mergedRows.map(r => num(r["Fuel Scored (Teleop)"]));
    const autoFuel     = mergedRows.map(r => num(r["Auto Fuel Scored"]));
    const shuttles     = mergedRows.map(r => num(r["Shuttles (Teleop)"]));
    const defRating    = mergedRows.map(r => num(r["Defense Rating"]));
    const robotSpeed   = mergedRows.map(r => num(r["Robot Speed"]));
    const intakeSpeed  = mergedRows.map(r => num(r["Intake-to-Shooter Speed"]));
    const driverSkill  = mergedRows.map(r => num(r["Driver Skill"]));
    const defPenalties = mergedRows.map(r => num(r["Penalties (Defense)"]));
    const climbLevels  = mergedRows.map(r => CLIMB_MAP[r["Climb (Teleop)"]] ?? 0);

    // Filtered accuracy arrays
    const autoAccVals = mergedRows
      .filter(r => r["Can shoot preload?"] === "Yes")
      .map(r => pct(r["Shot Accuracy (Auton)"]));
    const teleAccVals = mergedRows
      .filter(r => num(r["Fuel Scored (Teleop)"]) > 0)
      .map(r => pct(r["Shot Accuracy (Teleop)"]));

    const yesCount = (key) => mergedRows.filter(r => r[key] === "Yes").length;

    const climbedMatches = mergedRows.filter(r =>
      ["L1","L2","L3"].includes(r["Climb (Teleop)"])
    ).length;

    stats[team] = {
      team,
      matchCount: n,
      rows: mergedRows,

      // Fuel (no totals)
      avgFuelTeleop:  average(removeOutliers(fuelTeleop)),
      maxFuelTeleop:  maximum(fuelTeleop),
      avgAutoFuel:    average(removeOutliers(autoFuel)),
      maxAutoFuel:    maximum(autoFuel),

      // Shuttles
      avgShuttles:    average(removeOutliers(shuttles)),

      // Accuracy
      avgAutoAcc:     average(removeOutliers(autoAccVals)),
      avgTeleAcc:     average(removeOutliers(teleAccVals)),

      // Climb
      avgClimb:       average(climbLevels),
      climbedMatches,
      climbYesNo:     climbedMatches > n / 2 ? "Yes" : "No",
      deepClimbs:     mergedRows.filter(r => r["Climb (Teleop)"] === "L3").length,
      l2Climbs:       mergedRows.filter(r => r["Climb (Teleop)"] === "L2").length,
      l1Climbs:       mergedRows.filter(r => r["Climb (Teleop)"] === "L1").length,
      failedClimbs:   mergedRows.filter(r => r["Climb (Teleop)"] === "Failed Climb").length,

      // Drive
      avgDefRating:    average(removeOutliers(defRating)),
      avgRobotSpeed:   average(removeOutliers(robotSpeed)),
      avgIntakeSpeed:  average(removeOutliers(intakeSpeed)),
      avgDriverSkill:  average(removeOutliers(driverSkill)),
      avgDefPenalties: average(removeOutliers(defPenalties)),

      // Auton
      hasAuton:         yesCount("Has Auton?"),
      autonShuttled:    yesCount("Has Shuttling Auton?"),
      autonShootPre:    yesCount("Can shoot preload?"),
      autonShootOther:  yesCount("Can shoot Fuel outside of preloaded Fuel?"),
      autonClimbSide:   yesCount("Auton Climb Side"),
      autonClimbCenter: yesCount("Auton Climb Center"),

      // Teleop
      hasTurret:     yesCount("Has Turret?") > n / 2, // majority vote
      shootsMoving:  yesCount("Can score while moving?"),
      bulldozing:    yesCount("Bulldozing?"),

      // Endgame
      climbedSide:   yesCount("Climbed Side"),
      climbedCenter: yesCount("Climbed Center"),

      // Defense
      defChasing:   yesCount("Chasing"),
      defPinning:   yesCount("Pinning"),
      defBlocking:  yesCount("Blocking Bump/Trench"),

      // Flags
      noShow:             yesCount("No show"),
      didntMove:          yesCount("Did not move"),
      broke:              yesCount("Broke"),
      penalties:          yesCount("Penalties"),
      brownedOut:         yesCount("Robot browned out"),
      goodVsDefense:      yesCount("Good vs. Defense"),
      badVsDefense:       yesCount("Bad vs. Defense"),
      jitteryDrive:       yesCount("Jittery drive"),
      goodVibes:          yesCount("Good vibes"),
      badVibes:           yesCount("Bad vibes"),
      shootSpecificOnly:  yesCount("Can shoot from only specific spots"),
      shootStationaryAny: yesCount("Can shoot while stationary from any part of the field"),
      canShootMoving:     yesCount("Can shoot while moving"),
      longLineup:         yesCount("Long line-up time to shoot Fuel"),
      fuelJammed:         yesCount("Fuel got stuck/jammed inside robot"),
      robotBeached:       yesCount("Robot got beached"),

      // Auton path votes across all matches
      autonPathVotes: computeAutonPathVotes(mergedRows),
    };
  });

  return stats;
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
const STAND_CSV_URL = import.meta.env.VITE_STAND_CSV_URL || "";
const PIT_CSV_URL   = import.meta.env.VITE_PIT_CSV_URL   || "";

export function useScoutingData() {
  const [standRows, setStandRows] = useState([]);
  const [pitRows,   setPitRows]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const fetchCSV = async (url) => {
          if (!url) return [];
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status} fetching sheet`);
          return parseCSV(await res.text());
        };
        const [stand, pit] = await Promise.all([
          fetchCSV(STAND_CSV_URL),
          fetchCSV(PIT_CSV_URL),
        ]);
        setStandRows(stand);
        setPitRows(pit);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const teamStats = useMemo(() => computeTeamStats(standRows), [standRows]);

  const pitByTeam = useMemo(() => {
    const map = {};
    pitRows.forEach(r => {
      const t = r["Scouted Team #"]?.toString().trim();
      if (t) map[t] = r;
    });
    return map;
  }, [pitRows]);

  const teams = useMemo(
    () => Object.keys(teamStats).sort((a, b) => parseInt(a) - parseInt(b)),
    [teamStats]
  );

  return { standRows, pitRows, teamStats, pitByTeam, teams, loading, error };
}