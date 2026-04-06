import { useState, useEffect, useMemo } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Publish each sheet to CSV via: Google Sheets → File → Share → Publish to web
// Choose the sheet tab, select "Comma-separated values (.csv)", copy the URL.
const STAND_CSV_URL = import.meta.env.VITE_STAND_CSV_URL || "";
const PIT_CSV_URL   = import.meta.env.VITE_PIT_CSV_URL   || "";

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
  const n = parseFloat(String(v).replace("%", ""));
  return isNaN(n) ? 0 : n;
}
export function pct(v) { return num(String(v).replace("%", "")); }

export function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
export function average(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}
export function maximum(arr) { return arr.length ? Math.max(...arr) : 0; }

// ─── TEAM STATS COMPUTATION ───────────────────────────────────────────────────
const CLIMB_MAP = { L1: 1, L2: 2, L3: 3, "Failed Climb": 0, "": 0, None: 0 };
const CLIMB_LABELS = ["None", "L1", "L2", "L3"];

export function computeTeamStats(rows) {
  // Group rows by team
  const groups = {};
  rows.forEach(r => {
    const t = r["Scouted Team #"]?.toString().trim();
    if (!t || t === "0") return;
    if (!groups[t]) groups[t] = [];
    groups[t].push(r);
  });

  const stats = {};
  Object.entries(groups).forEach(([team, rs]) => {
    const n = rs.length;

    const fuelTeleop   = rs.map(r => num(r["Fuel Scored (Teleop)"]));
    const autoFuel     = rs.map(r => num(r["Auto Fuel Scored"]));
    const totalFuel    = rs.map((r, i) => fuelTeleop[i] + autoFuel[i]);
    const shuttles     = rs.map(r => num(r["Shuttles (Teleop)"]));
    const autoAcc      = rs.map(r => pct(r["Shot Accuracy (Auton)"]));
    const teleAcc      = rs.map(r => pct(r["Shot Accuracy (Teleop)"]));
    const defRating    = rs.map(r => num(r["Defense Rating"]));
    const robotSpeed   = rs.map(r => num(r["Robot Speed"]));
    const intakeSpeed  = rs.map(r => num(r["Intake-to-Shooter Speed"]));
    const driverSkill  = rs.map(r => num(r["Driver Skill"]));
    const climbLevels  = rs.map(r => CLIMB_MAP[r["Climb (Teleop)"]] ?? 0);
    const defPenalties = rs.map(r => num(r["Penalties (Defense)"]));

    const medClimbIdx  = Math.round(median(climbLevels));

    // Boolean counters: count "Yes" occurrences
    const yesCount = (key) => rs.filter(r => r[key] === "Yes").length;

    stats[team] = {
      team,
      matchCount: n,
      rows: rs,

      // Fuel
      medFuelTeleop:  median(fuelTeleop),
      avgFuelTeleop:  average(fuelTeleop),
      maxFuelTeleop:  maximum(fuelTeleop),
      medAutoFuel:    median(autoFuel),
      avgAutoFuel:    average(autoFuel),
      maxAutoFuel:    maximum(autoFuel),
      medTotalFuel:   median(totalFuel),
      avgTotalFuel:   average(totalFuel),
      maxTotalFuel:   maximum(totalFuel),

      // Shuttles
      medShuttles:    median(shuttles),
      avgShuttles:    average(shuttles),

      // Accuracy
      medAutoAcc:     median(autoAcc),
      avgAutoAcc:     average(autoAcc),
      medTeleAcc:     median(teleAcc),
      avgTeleAcc:     average(teleAcc),

      // Climb
      medClimb:       median(climbLevels),
      avgClimb:       average(climbLevels),
      medClimbStr:    CLIMB_LABELS[medClimbIdx] ?? "None",
      deepClimbs:     rs.filter(r => r["Climb (Teleop)"] === "L3").length,
      l2Climbs:       rs.filter(r => r["Climb (Teleop)"] === "L2").length,
      l1Climbs:       rs.filter(r => r["Climb (Teleop)"] === "L1").length,
      failedClimbs:   rs.filter(r => r["Climb (Teleop)"] === "Failed Climb").length,

      // Drive / Extra
      avgDefRating:   average(defRating),
      avgRobotSpeed:  average(robotSpeed),
      avgIntakeSpeed: average(intakeSpeed),
      avgDriverSkill: average(driverSkill),
      avgDefPenalties:average(defPenalties),

      // Auton flags
      hasAuton:         yesCount("Has Auton?"),
      autonShuttled:    yesCount("Has Shuttling Auton?"),
      autonShootPre:    yesCount("Can shoot preload?"),
      autonShootOther:  yesCount("Can shoot Fuel outside of preloaded Fuel?"),
      autonClimbSide:   yesCount("Auton Climb Side"),
      autonClimbCenter: yesCount("Auton Climb Center"),

      // Teleop flags
      hasTurret:     yesCount("Has Turret?"),
      shootsMoving:  yesCount("Can score while moving?"),
      bulldozing:    yesCount("Bulldozing?"),

      // Endgame flags
      climbedSide:   yesCount("Climbed Side"),
      climbedCenter: yesCount("Climbed Center"),

      // Defense
      defChasing:    yesCount("Chasing"),
      defPinning:    yesCount("Pinning"),
      defBlocking:   yesCount("Blocking Bump/Trench"),

      // Comment flags
      noShow:           yesCount("No show"),
      didntMove:        yesCount("Did not move"),
      broke:            yesCount("Broke"),
      penalties:        yesCount("Penalties"),
      goodVsDefense:    yesCount("Good vs. Defense"),
      badVsDefense:     yesCount("Bad vs. Defense"),
      jitteryDrive:     yesCount("Jittery drive"),
      goodVibes:        yesCount("Good vibes"),
      badVibes:         yesCount("Bad vibes"),
      shootSpecificOnly:yesCount("Can shoot from only specific spots"),
      shootStationaryAny:yesCount("Can shoot while stationary from any part of the field"),
      canShootMoving:   yesCount("Can shoot while moving"),
      longLineup:       yesCount("Long line-up time to shoot Fuel"),
      fuelJammed:       yesCount("Fuel got stuck/jammed inside robot"),
      robotBeached:     yesCount("Robot got beached"),
    };
  });

  return stats;
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
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