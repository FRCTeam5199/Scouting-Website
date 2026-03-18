import React, { useEffect, useRef, useState } from "react";
import useForm from "../hooks/useForm";
import useNetworkStatus from "../hooks/useNetworkStatus";
import useTimer from "../hooks/useTimer";
import { saveDraft, loadDraft, saveOffline, sendToServer, clearDraft } from "../sync";
import "../styles/StandScouting.css";

function validate(values) {
  const errors = {};
  if (!values.scouter_name?.toString().trim()) errors.scouter_name = "Required";
  if (!values.scouter_team?.toString().trim()) errors.scouter_team = "Required";
  if (!values.scouted_team?.toString().trim()) errors.scouted_team = "Required";
  if (!values.alliance) errors.alliance = "Required";
  if (!values.match_number?.toString().trim()) errors.match_number = "Required";
  if (!values.starting_location?.toString().trim()) errors.starting_location = "Required";
  return errors;
}

function formatTimerCentiseconds(value) {
  const totalCentiseconds = Math.max(0, Number(value) || 0);
  const totalSeconds = Math.floor(totalCentiseconds / 100);
  const centiseconds = totalCentiseconds % 100;
  const mins = Math.floor(totalSeconds / 60);
  const secsRemainder = totalSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secsRemainder.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
}

function normalizeAlliance(alliance) {
  if (alliance === "Red Alliance") return "Red";
  if (alliance === "Blue Alliance") return "Blue";
  if (alliance === "Red" || alliance === "Blue") return alliance;
  return "Red";
}

const TAB_ORDER = ["pre-game", "auton", "teleop", "endgame", "extra", "comments"];
const TAB_LABELS = {
  "pre-game": "Pre-Game",
  auton: "Auton",
  teleop: "Teleop",
  endgame: "Endgame",
  extra: "Extra",
  comments: "Comments",
};

function TabNavButtons({ currentTab, onNavigate }) {
  const currentIndex = TAB_ORDER.indexOf(currentTab);
  const prevTab = currentIndex > 0 ? TAB_ORDER[currentIndex - 1] : null;
  const nextTab = currentIndex < TAB_ORDER.length - 1 ? TAB_ORDER[currentIndex + 1] : null;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === TAB_ORDER.length - 1;

  // First tab: align Next to the right
  // Last tab: align Back to the left
  // Middle tabs: space between
  const justifyClass = isFirst
    ? "justify-content-end"
    : isLast
    ? "justify-content-start"
    : "justify-content-between";

  return (
    <div className={`d-flex ${justifyClass} mt-4 mb-2`}>
      {!isFirst && (
        <button
          type="button"
          className="btn btn-secondary btn-lg"
          style={{ minWidth: "110px" }}
          onClick={() => onNavigate(prevTab)}
        >
          ← {TAB_LABELS[prevTab]}
        </button>
      )}
      {!isLast && (
        <button
          type="button"
          className="btn btn-primary btn-lg"
          style={{ minWidth: "110px" }}
          onClick={() => onNavigate(nextTab)}
        >
          {TAB_LABELS[nextTab]} →
        </button>
      )}
    </div>
  );
}

function PreGameTab({ formData, errors, touched, handleChange, handleBlur, rotated, setRotated, onNavigate }) {
  const isBlueAlliance = formData.alliance === "Blue";
  const fieldImage = isBlueAlliance
    ? "/icons/blueAllianceField-2026.png"
    : "/icons/redAllianceField-2026.png";

  const handleStartingLocationClick = (index) => {
    handleChange({ target: { name: "starting_location", value: String(index + 1), type: "text" } });
  };

  return (
    <div className="pre-game-tab">
      <div className="form-section mb-4">

        {/* Row 1: Scouter Name + Scouter Team */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="scouter_name" className="form-label">
              Your Name <span className="text-danger">*</span>
            </label>
            <input
              id="scouter_name"
              type="text"
              name="scouter_name"
              value={formData.scouter_name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-control ${touched.scouter_name && errors.scouter_name ? "is-invalid" : ""}`}
              placeholder="Enter your name"
            />
            <div className="invalid-feedback">{errors.scouter_name}</div>
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="scouter_team" className="form-label">
              Your Team # <span className="text-danger">*</span>
            </label>
            <input
              id="scouter_team"
              type="text"
              name="scouter_team"
              value={formData.scouter_team}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-control ${touched.scouter_team && errors.scouter_team ? "is-invalid" : ""}`}
              placeholder="Enter your team number"
            />
            <div className="invalid-feedback">{errors.scouter_team}</div>
          </div>
        </div>

        {/* Row 2: Scouted Team + Match # */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="scouted_team" className="form-label">
              Team being scouted <span className="text-danger">*</span>
            </label>
            <input
              id="scouted_team"
              type="text"
              name="scouted_team"
              value={formData.scouted_team}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-control ${touched.scouted_team && errors.scouted_team ? "is-invalid" : ""}`}
              placeholder="Enter scouted team number"
            />
            <div className="invalid-feedback">{errors.scouted_team}</div>
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="match_number" className="form-label">
              Match # <span className="text-danger">*</span>
            </label>
            <input
              id="match_number"
              type="text"
              name="match_number"
              value={formData.match_number}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-control ${touched.match_number && errors.match_number ? "is-invalid" : ""}`}
              placeholder="Enter match number"
            />
            <div className="invalid-feedback">{errors.match_number}</div>
          </div>
        </div>

        {/* Row 3: Alliance — centered below Match # */}
        <div className="row">
          <div className="col-12">
            <div className="alliance-section">
              <label className="form-label mb-2">
                Alliance <span className="text-danger">*</span>
              </label>
              <div className="btn-group" role="group" aria-label="Alliance selection">
                <button
                  type="button"
                  className={`btn btn-lg ${formData.alliance === "Red" ? "btn-danger text-white" : "btn-outline-danger"}`}
                  onClick={() => handleChange({ target: { name: "alliance", value: "Red", type: "text" } })}
                >
                  Red Alliance
                </button>
                <button
                  type="button"
                  className={`btn btn-lg ${formData.alliance === "Blue" ? "btn-primary text-white" : "btn-outline-primary"}`}
                  onClick={() => handleChange({ target: { name: "alliance", value: "Blue", type: "text" } })}
                >
                  Blue Alliance
                </button>
              </div>
              {errors.alliance && <div className="text-danger mt-1">{errors.alliance}</div>}
            </div>
          </div>
        </div>

      </div>

      {/* Starting Location field image */}
      <div className="field-section text-center">
        <label className="form-label d-block mb-2 title-with-image">
          Starting Location <span className="text-danger">*</span>
        </label>
        <div className={`field-image-container ${rotated ? "rotated" : ""}`}>
          <img src={fieldImage} alt="Field" className="field-image" />
          <div className="starting-location-overlay">
            {(() => {
              const baseLeft = 55;
              const baseTops = [12, 30, 48, 66, 84];
              return baseTops.map((top, i) => {
                const isMirrored = isBlueAlliance;
                let left = baseLeft;
                let computedTop = top;
                if (isMirrored) {
                  left = 100 - left;
                  computedTop = 100 - computedTop;
                }
                return (
                  <button
                    key={i}
                    type="button"
                    className={`starting-location-btn ${formData.starting_location === String(i + 1) ? "active" : ""}`}
                    style={{ left: `${left}%`, top: `${computedTop}%` }}
                    onClick={() => handleStartingLocationClick(i)}
                    title={`Starting location ${i + 1}`}
                    aria-label={`Starting location ${i + 1}`}
                  />
                );
              });
            })()}
          </div>
        </div>
        <div className="mt-2 d-flex justify-content-center">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRotated((r) => !r)}>
            Switch Sides
          </button>
        </div>
        {errors.starting_location && touched.starting_location && (
          <div className="invalid-feedback d-block mt-2">{errors.starting_location}</div>
        )}
      </div>

      <TabNavButtons currentTab="pre-game" onNavigate={onNavigate} />
    </div>
  );
}

function AutonTab({ formData, handleChange, rotated, setRotated, onNavigate }) {
  const isBlueAlliance = formData.alliance === "Blue";
  const fieldImage = isBlueAlliance
    ? "/icons/blueAllianceField-2026.png"
    : "/icons/redAllianceField-2026.png";

  const hasAuton = formData.has_robot_auton === "Yes";

  const baseCheckmarkPositions = [
    { x: 71, y: 20 },
    { x: 71, y: 80 },
    { x: 32, y: 53 },
    { x: 28, y: 29 },
    { x: 20, y: 87 },
  ];

  const checkmarkPositions = baseCheckmarkPositions.map((p) =>
    isBlueAlliance ? { x: 100 - p.x, y: 100 - p.y } : p
  );

  const handleCheckmarkToggle = (index) => {
    const selected = formData.autonomous_paths_selected || [];
    const newSelected = selected.includes(index)
      ? selected.filter((i) => i !== index)
      : [...selected, index];
    handleChange({ target: { name: "autonomous_paths_selected", value: newSelected, type: "text" } });
  };

  const updateAutoFuel = (delta) => {
    const next = Math.max(0, Number(formData.auto_fuel_scored || 0) + delta);
    handleChange({ target: { name: "auto_fuel_scored", value: next, type: "text" } });
  };

  return (
    <div className="auton-tab">
      <div className="form-section mb-4">

        {/* Has Auton */}
        <div className="row mb-4">
        <div className="has-auton-button-group">
          <div className="col-12">
            <label className="form-label mb-2">Does the robot have an Auton?</label>
            <div className="btn-group w-100" role="group" aria-label="Auton yes/no">
              <input type="radio" className="btn-check" name="has_robot_auton" id="auton_no" value="No"
                checked={formData.has_robot_auton === "No"} onChange={handleChange} autoComplete="off" />
              <label className="btn btn-outline-primary flex-grow-1" htmlFor="auton_no">No</label>

              <input type="radio" className="btn-check" name="has_robot_auton" id="auton_yes" value="Yes"
                checked={formData.has_robot_auton === "Yes"} onChange={handleChange} autoComplete="off" />
              <label className="btn btn-outline-primary flex-grow-1" htmlFor="auton_yes">Yes</label>
            </div>
          </div>
        </div>
        </div>

        {/* Auton checkboxes — only shown when Has Auton = Yes */}
        {hasAuton && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="auton-checkboxes">
                {[
                  { name: "auton_shuttled", id: "auton_shuttled", label: "Shuttled during Auton" },
                  { name: "auton_shoot_preloaded", id: "auton_shoot_preloaded", label: "Can shoot preloaded Fuel" },
                  { name: "auton_shoot_other_fuel", id: "auton_shoot_other_fuel", label: "Can shoot Fuel other than preloaded Fuel" },
                  { name: "auton_climbed_side", id: "auton_climb_side", label: "Climbed on side of Tower" },
                  { name: "auton_climbed_center", id: "auton_climb_center", label: "Climbed on center of Tower" },
                ].map(({ name, id, label }) => (
                  <div key={id} className="form-check form-check-lg mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={id}
                      name={name}
                      checked={formData[name] || false}
                      onChange={(e) => handleChange(e)}
                    />
                    <label className="form-check-label" htmlFor={id}>{label}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Auto Fuel Scored counter */}
        <div className="form-section text-center mb-4 score-counter">
          <h2 className="mb-3">Auto Fuel Scored</h2>
          <div className="display-1 mb-3" style={{ fontSize: "3rem" }}>
            {formData.auto_fuel_scored || 0}
          </div>
          {[1, 5, 10].map((step) => (
            <div key={`auton-fuel-${step}`} className="btn-group mb-3" role="group">
              <button type="button" className="btn btn-danger btn-lg" onClick={() => updateAutoFuel(-step)}>-</button>
              <button type="button" className="btn btn-light btn-lg" disabled>+{step}</button>
              <button type="button" className="btn btn-success btn-lg" onClick={() => updateAutoFuel(step)}>+</button>
            </div>
          ))}
        </div>

        {/* Shot Accuracy */}
        <div className="row mb-4">
          <div className="col-12">
            <label htmlFor="shot_accuracy" className="form-label">Shot Accuracy</label>
            <input
              type="range" className="form-range" min="0" max="100"
              value={formData.shot_accuracy || 0} id="shot_accuracy" name="shot_accuracy"
              onChange={(e) => handleChange(e)}
            />
            <div className="accuracy-display mt-2">
              <span className="badge bg-primary fs-6">{formData.shot_accuracy || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Autonomous Paths */}
      <div className="field-section text-center">
        <label className="form-label d-block mb-2 title-with-image">Autonomous Paths</label>
        <div className={`field-image-container ${rotated ? "rotated" : ""}`}>
          <img src={fieldImage} alt="Field" className="field-image" />
          <div className="autonomous-paths-overlay">
            {checkmarkPositions.map((pos, index) => (
              <button
                key={index}
                type="button"
                className={`checkmark-btn ${(formData.autonomous_paths_selected || []).includes(index) ? "active" : ""}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => handleCheckmarkToggle(index)}
                title={`Autonomous Path ${index + 1}`}
                aria-label={`Autonomous Path ${index + 1}`}
              >
                {(formData.autonomous_paths_selected || []).includes(index) && "✓"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <TabNavButtons currentTab="auton" onNavigate={onNavigate} />
    </div>
  );
}

function TeleopTab({ formData, handleChange, onNavigate }) {
  const updateFuel = (delta) => {
    const next = Math.max(0, Number(formData.fuel_scored || 0) + delta);
    handleChange({ target: { name: "fuel_scored", value: next, type: "text" } });
  };

  const updateShuttles = (delta) => {
    const next = Math.max(0, Number(formData.teleop_shuttled || 0) + delta);
    handleChange({ target: { name: "teleop_shuttled", value: next, type: "text" } });
  };

  return (
    <div className="teleop-tab">

      {/* Fuel Scored */}
      <div className="form-section text-center mb-4 score-counter">
        <h2 className="mb-3">Fuel Scored</h2>
        <div className="display-1 mb-3" style={{ fontSize: "3rem" }}>{formData.fuel_scored || 0}</div>
        {[1, 5, 10].map((step) => (
          <div key={`fuel-${step}`} className="btn-group mb-3" role="group">
            <button type="button" className="btn btn-danger btn-lg" onClick={() => updateFuel(-step)}>-</button>
            <button type="button" className="btn btn-light btn-lg" disabled>+{step}</button>
            <button type="button" className="btn btn-success btn-lg" onClick={() => updateFuel(step)}>+</button>
          </div>
        ))}
      </div>

      {/* Fuel Shuttled */}
      <div className="form-section text-center mb-4 score-counter">
        <h2 className="mb-1">Fuel Shuttled</h2>
        <p className="text-white mb-3" style={{ fontSize: "1.5rem", opacity: 0.85 }}>
          (Intentionally shooting Fuel into their own Alliance Zone)
        </p>
        <div className="display-1 mb-3" style={{ fontSize: "3rem" }}>{formData.teleop_shuttled || 0}</div>
        {[1, 5, 10].map((step) => (
          <div key={`shuttle-${step}`} className="btn-group mb-3" role="group">
            <button type="button" className="btn btn-danger btn-lg" onClick={() => updateShuttles(-step)}>-</button>
            <button type="button" className="btn btn-light btn-lg" disabled>+{step}</button>
            <button type="button" className="btn btn-success btn-lg" onClick={() => updateShuttles(step)}>+</button>
          </div>
        ))}
      </div>

      {/* Shot Accuracy */}
      <div className="form-section mb-4">
        <label htmlFor="teleop_shot_accuracy" className="form-label">Shot Accuracy</label>
        <input
          type="range" className="form-range" min="0" max="100"
          value={formData.teleop_shot_accuracy || 0} id="teleop_shot_accuracy" name="teleop_shot_accuracy"
          onChange={(e) => handleChange(e)}
        />
        <div className="accuracy-display mt-2">
          <span className="badge bg-primary fs-6">{formData.teleop_shot_accuracy || 0}%</span>
        </div>
      </div>

      {/* Turret + Scores while moving */}
      <div className="form-section mb-4">
        <div className="d-flex flex-wrap gap-4 justify-content-center">
          <div className="form-check form-check-lg">
            <input className="form-check-input" type="checkbox" id="teleop_turret" name="teleop_turret"
              checked={formData.teleop_turret || false} onChange={(e) => handleChange(e)} />
            <label className="form-check-label" htmlFor="teleop_turret">Turret</label>
          </div>
          <div className="form-check form-check-lg">
            <input className="form-check-input" type="checkbox" id="teleop_shoot_on_fly" name="teleop_shoot_on_fly"
              checked={formData.teleop_shoot_on_fly || false} onChange={(e) => handleChange(e)} />
            <label className="form-check-label" htmlFor="teleop_shoot_on_fly">Scores while moving</label>
          </div>
        </div>
      </div>

      <TabNavButtons currentTab="teleop" onNavigate={onNavigate} />
    </div>
  );
}

function EndgameTab({ formData, handleChange, onNavigate }) {
  const timer = useTimer(Number(formData.endgame_time_to_climb) || 0);

  const handleTimerChange = (newCentiseconds) => {
    handleChange({ target: { name: "endgame_time_to_climb", value: newCentiseconds, type: "text" } });
  };

  useEffect(() => {
    if (!timer.isRunning) return;
    if ((Number(formData.endgame_time_to_climb) || 0) !== timer.time) {
      handleTimerChange(timer.time);
    }
  }, [timer.time, timer.isRunning, formData.endgame_time_to_climb]);

  return (
    <div className="endgame-tab">
      <div className="row">

        {/* Climb button group */}
        <div className="col-md-6 mb-4">
          <label className="form-label d-block mb-3">Climb</label>
          <div className="climb-button-group">
            {[
              { value: "", label: "None" },
              { value: "L1", label: "L1" },
              { value: "L2", label: "L2" },
              { value: "L3", label: "L3" },
              { value: "Failed Climb", label: "Failed" },
            ].map(({ value, label }) => (
              <div key={value || "none"} style={{ flex: "1 1 0", minWidth: 0 }}>
                <input
                  type="radio" className="btn-check" name="endgame_climb"
                  id={`climb_${value || "none"}`} value={value}
                  checked={formData.endgame_climb === value}
                  onChange={(e) => handleChange(e)} autoComplete="off"
                />
                <label className="btn btn-outline-primary w-100" htmlFor={`climb_${value || "none"}`}>
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Climb Location checkboxes */}
      <div className="col-md-6 mb-4 order-2 order-md-1 climb-location-col">
        <label className="form-label d-block mb-3">Climb Location</label>
        <div className="form-check justify-content-md-end mb-2">
          <input className="form-check-input" type="checkbox" id="climb_side" name="endgame_climbed_side"
            checked={formData.endgame_climbed_side || false} onChange={(e) => handleChange(e)} />
          <label className="form-check-label" htmlFor="climb_side">Climbed on side of Tower</label>
        </div>
        <div className="form-check justify-content-md-end">
          <input className="form-check-input" type="checkbox" id="climb_center" name="endgame_climbed_center"
            checked={formData.endgame_climbed_center || false} onChange={(e) => handleChange(e)} />
          <label className="form-check-label" htmlFor="climb_center">Climbed on center of Tower</label>
        </div>
      </div>
      </div>

      {/* Timer */}
      <div className="form-section mb-4 text-center">
        <label className="form-label d-block mb-3">Time to climb from Tower Base</label>
        <div className="display-1 mb-3" style={{ fontSize: "2.5rem", fontFamily: "monospace" }}>
          {timer.formatTime()}
        </div>
        <div className="d-flex gap-2 justify-content-center mb-3">
          <button type="button" className="btn btn-danger"
            onClick={() => { timer.reset(); handleTimerChange(0); }}
            style={{ fontSize: "1.5rem", padding: "0.75rem 1.5rem" }}>
            Reset
          </button>
          <button type="button" className="btn btn-primary"
            onClick={() => timer.toggle()}
            style={{ fontSize: "1.5rem", padding: "0.75rem 1.5rem" }}>
            {timer.isRunning ? "Stop Timer" : "Toggle Timer"}
          </button>
        </div>
      </div>

      <TabNavButtons currentTab="endgame" onNavigate={onNavigate} />
    </div>
  );
}

function ExtraTab({ formData, handleChange, onNavigate }) {
  const updatePenalties = (delta) => {
    const next = Math.max(0, Number(formData.defense_penalties || 0) + delta);
    handleChange({ target: { name: "defense_penalties", value: next, type: "text" } });
  };

  return (
    <div className="extra-tab">
      <div className="form-section mb-5">
        <h3 className="mb-3">Defense</h3>

        {/* Row 1: Defense Rating slider */}
        <div className="row mb-4">
          <div className="col-12">
            <label htmlFor="defense_rating" className="form-label">Rating</label>
            <input
              type="range" className="form-range" min="1" max="5"
              value={formData.defense_rating || 1} id="defense_rating" name="defense_rating"
              onChange={handleChange}
            />
            <div className="text-center mt-1">
              <span className="badge bg-secondary fs-6">{formData.defense_rating || 1}</span>
            </div>
          </div>
        </div>

        {/* Row 2: Chasing, Pinning, Blocking — each on its own line */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="form-check form-check-lg mb-3">
              <input className="form-check-input" type="checkbox" id="defense_chasing" name="defense_chasing"
                checked={formData.defense_chasing || false} onChange={(e) => handleChange(e)} />
              <label className="form-check-label" htmlFor="defense_chasing">Chasing</label>
            </div>
            <div className="form-check form-check-lg mb-3">
              <input className="form-check-input" type="checkbox" id="defense_pinning" name="defense_pinning"
                checked={formData.defense_pinning || false} onChange={(e) => handleChange(e)} />
              <label className="form-check-label" htmlFor="defense_pinning">Pinning</label>
            </div>
            <div className="form-check form-check-lg">
              <input className="form-check-input" type="checkbox" id="defense_blocking" name="defense_blocking"
                checked={formData.defense_blocking || false} onChange={(e) => handleChange(e)} />
              <label className="form-check-label" htmlFor="defense_blocking">Blocking Bump/Trench</label>
            </div>
          </div>
        </div>

        {/* Row 3: Penalties counter */}
        <div className="row mb-5">
          <div className="col-12">
            <label className="form-label d-block mb-2">Penalties</label>
            <div className="btn-group" role="group">
              <button type="button" className="btn btn-danger btn-lg" onClick={() => updatePenalties(-1)}>-</button>
              <button type="button" className="btn btn-light btn-lg" disabled style={{ minWidth: "3rem" }}>
                {formData.defense_penalties || 0}
              </button>
              <button type="button" className="btn btn-success btn-lg" onClick={() => updatePenalties(1)}>+</button>
            </div>
          </div>
        </div>

      </div>

      {/* Drive */}
      <div className="form-section">
        <h3 className="mb-3">Drive</h3>
        {[
          { label: "Robot Speed", name: "drive_robot_speed" },
          { label: "Intake-to-Shooter Speed", name: "drive_intake_shooter_speed" },
          { label: "Driver Skill", name: "drive_driver_skill" },
        ].map(({ label, name }) => (
          <div key={name} className="mb-3">
            <label htmlFor={name} className="form-label">{label}</label>
            <input
              type="range" className="form-range" min="1" max="5"
              value={formData[name] || 1} id={name} name={name}
              onChange={handleChange}
            />
            <div className="text-center mt-1">
              <span className="badge bg-secondary fs-6">{formData[name] || 1}</span>
            </div>
          </div>
        ))}
      </div>

      <TabNavButtons currentTab="extra" onNavigate={onNavigate} />
    </div>
  );
}

function CommentsTab({ formData, handleChange, handleBlur, isSubmitting, onClearForm, onNavigate }) {
  const [showClearModal, setShowClearModal] = useState(false);

  const checkboxes = [
    { name: "no_show", label: "No show" },
    { name: "didnt_move", label: "Didn't move" },
    { name: "broke", label: "Broke" },
    { name: "penalties", label: "Penalties" },
    { name: "good_vs_defense", label: "Good vs. Defense" },
    { name: "bad_vs_defense", label: "Bad vs. Defense" },
    { name: "jittery_drive", label: "Jittery drive" },
    { name: "good_vibes", label: "Good vibes" },
    { name: "bad_vibes", label: "Bad vibes" },
    { name: "can_only_shoot_specific_spots", label: "Can only shoot from specific spots" },
    { name: "can_shoot_stationary_anywhere", label: "Can shoot while stationary from any part of the field" },
    { name: "can_shoot_moving", label: "Can shoot while moving" },
    { name: "long_lineup_time", label: "Long line-up time to shoot Fuel" },
  ];

  return (
    <div className="p-3 comments-tab">

      <div className="row g-3 mb-4">
        {checkboxes.map((cb) => (
          <div key={cb.name} className="col-6">
            <div className="form-check form-check-lg">
              <input
                className="form-check-input" type="checkbox"
                id={cb.name} name={cb.name}
                checked={formData[cb.name] || false}
                onChange={(e) => handleChange(e)}
              />
              <label className="form-check-label" htmlFor={cb.name}>{cb.label}</label>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-3">
        <label htmlFor="serious_comments" className="form-label">Serious Comments</label>
        <textarea id="serious_comments" name="serious_comments" value={formData.serious_comments}
          onChange={handleChange} onBlur={handleBlur} className="form-control" rows={3} />
      </div>

      <div className="mb-3">
        <label htmlFor="funny_comments" className="form-label">Funny Comments</label>
        <textarea id="funny_comments" name="funny_comments" value={formData.funny_comments}
          onChange={handleChange} onBlur={handleBlur} className="form-control" rows={3} />
      </div>

      {/* Rescout + Clear + Submit */}
      <div className="row g-3 align-items-end mt-4">
        <div className="col-md-2">
          <label className="form-label d-block mb-2">Rescout Request</label>
          <div className="btn-group w-100 rescout-button-group" role="group" aria-label="Rescout request">
            <input type="radio" className="btn-check" name="rescout_request" id="rescout_no" value="No"
              checked={formData.rescout_request === "No"} onChange={handleChange} autoComplete="off" />
            <label className="btn btn-outline-primary" htmlFor="rescout_no">No</label>

            <input type="radio" className="btn-check" name="rescout_request" id="rescout_yes" value="Yes"
              checked={formData.rescout_request === "Yes"} onChange={handleChange} autoComplete="off" />
            <label className="btn btn-outline-primary" htmlFor="rescout_yes">Yes</label>
          </div>
        </div>
        <div className="col-md-2">
          <button type="button" className="btn btn-danger btn-lg w-100" onClick={() => setShowClearModal(true)}>
            Clear Form
          </button>
        </div>
        <div className="col-md-6 col-lg-5"></div>
        <div className="col-md-4">
          <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg w-100">
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : "Submit Scouting Data"}
          </button>
        </div>
      </div>

      <TabNavButtons currentTab="comments" onNavigate={onNavigate} />

      {showClearModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: "white", padding: "2rem",
            borderRadius: "0.5rem", textAlign: "center", minWidth: "300px",
          }}>
            <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem", color: "#000" }}>
              Are you sure you want to clear this form?
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button type="button" className="btn btn-primary" onClick={() => setShowClearModal(false)}>No</button>
              <button type="button" className="btn btn-secondary"
                onClick={() => { onClearForm(); setShowClearModal(false); }}>Yes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StandScouting() {
  const EMERGENCY_DRAFT_KEY = "standScoutingEmergencyDraft";
  const isOnline = useNetworkStatus();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [rotated, setRotated] = useState(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("pre-game");

  const [initialValues, setInitialValues] = useState(() => {
    const defaultValues = {
      scouter_name: "",
      scouter_team: "",
      scouted_team: "",
      alliance: "Red",
      match_number: "",
      starting_location: "",
      has_robot_auton: "No",
      auton_shuttled: false,
      auton_climbed_side: false,
      auton_climbed_center: false,
      auton_shoot_preloaded: false,
      auton_shoot_other_fuel: false,
      auto_fuel_scored: 0,
      shot_accuracy: 0,
      autonomous_paths_selected: [],
      fuel_scored: 0,
      teleop_shuttled: 0,
      teleop_shot_accuracy: 0,
      teleop_turret: false,
      teleop_shoot_on_fly: false,
      endgame_climb: "",
      endgame_climbed_side: false,
      endgame_climbed_center: false,
      endgame_time_to_climb: 0,
      defense_rating: 3,
      defense_chasing: false,
      defense_pinning: false,
      defense_blocking: false,
      defense_penalties: 0,
      drive_robot_speed: 3,
      drive_intake_shooter_speed: 3,
      drive_driver_skill: 3,
      no_show: false,
      didnt_move: false,
      broke: false,
      penalties: false,
      good_vs_defense: false,
      bad_vs_defense: false,
      jittery_drive: false,
      good_vibes: false,
      bad_vibes: false,
      can_only_shoot_specific_spots: false,
      can_shoot_stationary_anywhere: false,
      can_shoot_moving: false,
      long_lineup_time: false,
      serious_comments: "",
      funny_comments: "",
      rescout_request: "No",
      comments: "",
    };

    const preserved = localStorage.getItem("standScoutingPreserved");
    if (preserved) {
      try {
        const parsed = JSON.parse(preserved);
        return {
          ...defaultValues,
          scouter_name: parsed.scouter_name || defaultValues.scouter_name,
          scouter_team: parsed.scouter_team || defaultValues.scouter_team,
          alliance: normalizeAlliance(parsed.alliance),
          match_number: parsed.match_number || defaultValues.match_number,
        };
      } catch (e) {
        return defaultValues;
      }
    }
    return defaultValues;
  });

  const navigateToTab = (tabId) => {
    setActiveTab(tabId);
    const tabEl = document.getElementById(`${tabId}-tab`);
    if (tabEl) {
      const bsTab = window.bootstrap?.Tab?.getOrCreateInstance(tabEl);
      bsTab?.show();
    }
  };

  const onSubmit = async (values) => {
    const pathLabelMap = ["Shuttle-Right", "Shuttle-Left", "Tower", "Depot", "Chute"];
    const selectedPaths = (values.autonomous_paths_selected || []).map((i) => pathLabelMap[i]).filter(Boolean);

    function generateId() {
      if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
      return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }

    const submission = {
      "Scouter's Name": values.scouter_name || "",
      "Scouter's Team #": values.scouter_team || "",
      "Scouted Team #": values.scouted_team || "",
      "Match #": values.match_number || "",
      "Starting Location": values.starting_location || "",
      "Has Auton?": values.has_robot_auton === "Yes" ? "Yes" : "No",
      "Has Shuttling Auton?": values.auton_shuttled ? "Yes" : "No",
      "Can shoot preload?": values.auton_shoot_preloaded ? "Yes" : "No",
      "Can shoot Fuel outside of preloaded Fuel?": values.auton_shoot_other_fuel ? "Yes" : "No",
      "Auto Fuel Scored": values.auto_fuel_scored || 0,
      "Shot Accuracy (Auton)": `${values.shot_accuracy || 0}%`,
      "Auton Paths": selectedPaths.join(", "),
      "Auton Climb Side": values.auton_climbed_side ? "Yes" : "No",
      "Auton Climb Center": values.auton_climbed_center ? "Yes" : "No",
      "Fuel Scored (Teleop)": values.fuel_scored || 0,
      "Shuttles (Teleop)": values.teleop_shuttled || 0,
      "Shot Accuracy (Teleop)": `${values.teleop_shot_accuracy || 0}%`,
      "Alliance": values.alliance || "",
      "Has Turret?": values.teleop_turret ? "Yes" : "No",
      "Can score while moving?": values.teleop_shoot_on_fly ? "Yes" : "No",
      "Climb (Teleop)": values.endgame_climb || "None",
      "Climbed Side": values.endgame_climbed_side ? "Yes" : "No",
      "Climbed Center": values.endgame_climbed_center ? "Yes" : "No",
      "Time to Climb": formatTimerCentiseconds(values.endgame_time_to_climb),
      "Defense Rating": values.defense_rating || 0,
      "Chasing": values.defense_chasing ? "Yes" : "No",
      "Pinning": values.defense_pinning ? "Yes" : "No",
      "Blocking Bump/Trench": values.defense_blocking ? "Yes" : "No",
      "Penalties (Defense)": values.defense_penalties || 0,
      "Robot Speed": values.drive_robot_speed || 0,
      "Intake-to-Shooter Speed": values.drive_intake_shooter_speed || 0,
      "Driver Skill": values.drive_driver_skill || 0,
      "No show": values.no_show ? "Yes" : "No",
      "Did not move": values.didnt_move ? "Yes" : "No",
      "Broke": values.broke ? "Yes" : "No",
      "Penalties": values.penalties ? "Yes" : "No",
      "Good vs. Defense": values.good_vs_defense ? "Yes" : "No",
      "Bad vs. Defense": values.bad_vs_defense ? "Yes" : "No",
      "Jittery drive": values.jittery_drive ? "Yes" : "No",
      "Good vibes": values.good_vibes ? "Yes" : "No",
      "Bad vibes": values.bad_vibes ? "Yes" : "No",
      "Can shoot from only specific spots": values.can_only_shoot_specific_spots ? "Yes" : "No",
      "Can shoot while stationary from any part of the field": values.can_shoot_stationary_anywhere ? "Yes" : "No",
      "Can shoot while moving": values.can_shoot_moving ? "Yes" : "No",
      "Long line-up time to shoot Fuel": values.long_lineup_time ? "Yes" : "No",
      "Serious Comments": values.serious_comments || "",
      "Funny Comments": values.funny_comments || "",
      "Rescout Request": values.rescout_request === "Yes" ? "Yes" : "No",
      submissionId: generateId(),
      sheet_name: "Stand Scouting",
    };

    if (isOnline) {
      await sendToServer(submission);
      setSuccessMessage("Stand scouting data sent to server.");
    } else {
      await saveOffline(submission);
      setSuccessMessage("Stand scouting data saved locally and will sync when online.");
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const { formData, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, resetForm } = useForm({
    initialValues,
    validate,
    onSubmit,
  });

  const latestDraftPayloadRef = useRef({ ...formData, field_image_rotated: rotated });
  const isDraftLoadedRef = useRef(isDraftLoaded);

  useEffect(() => {
    latestDraftPayloadRef.current = { ...formData, field_image_rotated: rotated };
  }, [formData, rotated]);

  useEffect(() => {
    isDraftLoadedRef.current = isDraftLoaded;
  }, [isDraftLoaded]);

  useEffect(() => {
    let isMounted = true;
    const loadExistingDraft = async () => {
      try {
        let emergencyDraft = null;
        try {
          const raw = localStorage.getItem(EMERGENCY_DRAFT_KEY);
          emergencyDraft = raw ? JSON.parse(raw)?.data || null : null;
        } catch (parseError) {
          console.error("Failed to parse emergency draft:", parseError);
        }
        const draft = await loadDraft("Stand Scouting");
        if (isMounted && (draft || emergencyDraft)) {
          const combinedDraft = { ...(draft || {}), ...(emergencyDraft || {}) };
          const { field_image_rotated: savedRotated, ...draftFormValues } = combinedDraft;
          if (typeof savedRotated === "boolean") setRotated(savedRotated);
          setInitialValues((prev) => ({
            ...prev,
            ...draftFormValues,
            alliance: normalizeAlliance(draftFormValues.alliance ?? prev.alliance),
          }));
        }
      } catch (error) {
        console.error("Failed to load draft:", error);
      } finally {
        if (isMounted) setIsDraftLoaded(true);
      }
    };
    loadExistingDraft();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!isDraftLoaded) return;
    const draftPayload = { ...formData, field_image_rotated: rotated };
    localStorage.setItem(EMERGENCY_DRAFT_KEY, JSON.stringify({ timestamp: Date.now(), data: draftPayload }));
    const timeout = setTimeout(() => {
      saveDraft(draftPayload, "Stand Scouting").catch((e) => console.error("Failed to save draft:", e));
    }, 300);
    return () => clearTimeout(timeout);
  }, [formData, rotated, isDraftLoaded]);

  useEffect(() => {
    const persistImmediately = () => {
      if (!isDraftLoadedRef.current) return;
      const latest = latestDraftPayloadRef.current;
      localStorage.setItem(EMERGENCY_DRAFT_KEY, JSON.stringify({ timestamp: Date.now(), data: latest }));
      saveDraft(latest, "Stand Scouting").catch((e) => console.error("Failed to persist draft:", e));
    };
    const handleVisibility = () => { if (document.visibilityState === "hidden") persistImmediately(); };
    window.addEventListener("beforeunload", persistImmediately);
    window.addEventListener("pagehide", persistImmediately);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("beforeunload", persistImmediately);
      window.removeEventListener("pagehide", persistImmediately);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const clearForm = () => resetForm();

  const onFormSubmit = async (e) => {
    e.preventDefault();
    await handleSubmit(e);

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setShowValidationAlert(true);
      return;
    }

    setShowValidationAlert(false);

    const preservedName = formData.scouter_name || initialValues.scouter_name;
    const preservedScouterTeam = formData.scouter_team || initialValues.scouter_team;
    const preservedAlliance = normalizeAlliance(formData.alliance || initialValues.alliance);
    const rawMatch = String(formData.match_number || initialValues.match_number || "").trim();
    const nextMatch = rawMatch !== "" && !Number.isNaN(Number(rawMatch))
      ? String(Number(rawMatch) + 1) : rawMatch;

    const newInitial = {
      scouter_name: preservedName,
      scouter_team: preservedScouterTeam,
      scouted_team: "",
      alliance: preservedAlliance,
      match_number: nextMatch,
      starting_location: "",
      has_robot_auton: "No",
      auton_shuttled: false,
      auton_climbed_side: false,
      auton_climbed_center: false,
      auton_shoot_preloaded: false,
      auton_shoot_other_fuel: false,
      auto_fuel_scored: 0,
      shot_accuracy: 0,
      autonomous_paths_selected: [],
      fuel_scored: 0,
      teleop_shuttled: 0,
      teleop_shot_accuracy: 0,
      teleop_turret: false,
      teleop_shoot_on_fly: false,
      endgame_climb: "",
      endgame_climbed_side: false,
      endgame_climbed_center: false,
      endgame_time_to_climb: 0,
      defense_rating: 3,
      defense_chasing: false,
      defense_pinning: false,
      defense_blocking: false,
      defense_penalties: 0,
      drive_robot_speed: 3,
      drive_intake_shooter_speed: 3,
      drive_driver_skill: 3,
      no_show: false,
      didnt_move: false,
      broke: false,
      penalties: false,
      good_vs_defense: false,
      bad_vs_defense: false,
      jittery_drive: false,
      good_vibes: false,
      bad_vibes: false,
      can_only_shoot_specific_spots: false,
      can_shoot_stationary_anywhere: false,
      can_shoot_moving: false,
      long_lineup_time: false,
      serious_comments: "",
      funny_comments: "",
      rescout_request: "No",
      comments: "",
    };

    setInitialValues(newInitial);
    localStorage.setItem("standScoutingPreserved", JSON.stringify({
      scouter_name: preservedName,
      scouter_team: preservedScouterTeam,
      alliance: preservedAlliance,
      match_number: nextMatch,
    }));
    localStorage.removeItem(EMERGENCY_DRAFT_KEY);
    clearDraft("Stand Scouting");
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4 text-center">Stand Scouting</h1>

      {/* Online/Offline status */}
      <div className="row justify-content-center mb-3">
        <div className="col-lg-8">
          <div className={`alert ${isOnline ? "alert-success" : "alert-warning"} d-flex align-items-center`} role="alert">
            <i className={`bi ${isOnline ? "bi-wifi" : "bi-wifi-off"} me-2`}></i>
            <small className="mb-0">
              {isOnline
                ? "Online - Data will be sent to server"
                : "Offline - Data will be saved locally and synced when online"}
            </small>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setShowSuccess(false)} aria-label="Close" />
        </div>
      )}

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <form onSubmit={onFormSubmit}>
                <ul className="nav nav-tabs" id="scoutingTab" role="tablist">
                  {TAB_ORDER.map((tabId) => (
                    <li key={tabId} className="nav-item" role="presentation">
                      <button
                        className={`nav-link ${activeTab === tabId ? "active" : ""}`}
                        id={`${tabId}-tab`}
                        data-bs-toggle="tab"
                        data-bs-target={`#${tabId}-pane`}
                        type="button"
                        role="tab"
                        aria-controls={`${tabId}-pane`}
                        aria-selected={activeTab === tabId}
                        onClick={() => setActiveTab(tabId)}
                      >
                        {TAB_LABELS[tabId]}
                      </button>
                    </li>
                  ))}
                </ul>

                {showValidationAlert && (
                  <div className="mt-3">
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <div>Not all required information has been filled out yet!</div>
                    </div>
                  </div>
                )}

                <div className="tab-content" id="scoutingTabContent">
                  <div className={`tab-pane fade ${activeTab === "pre-game" ? "show active" : ""}`} id="pre-game-pane" role="tabpanel" tabIndex="0">
                    <PreGameTab formData={formData} errors={errors} touched={touched} handleChange={handleChange} handleBlur={handleBlur} rotated={rotated} setRotated={setRotated} onNavigate={navigateToTab} />
                  </div>
                  <div className={`tab-pane fade ${activeTab === "auton" ? "show active" : ""}`} id="auton-pane" role="tabpanel" tabIndex="0">
                    <AutonTab formData={formData} handleChange={handleChange} rotated={rotated} setRotated={setRotated} onNavigate={navigateToTab} />
                  </div>
                  <div className={`tab-pane fade ${activeTab === "teleop" ? "show active" : ""}`} id="teleop-pane" role="tabpanel" tabIndex="0">
                    <TeleopTab formData={formData} handleChange={handleChange} onNavigate={navigateToTab} />
                  </div>
                  <div className={`tab-pane fade ${activeTab === "endgame" ? "show active" : ""}`} id="endgame-pane" role="tabpanel" tabIndex="0">
                    <EndgameTab formData={formData} handleChange={handleChange} onNavigate={navigateToTab} />
                  </div>
                  <div className={`tab-pane fade ${activeTab === "extra" ? "show active" : ""}`} id="extra-pane" role="tabpanel" tabIndex="0">
                    <ExtraTab formData={formData} handleChange={handleChange} onNavigate={navigateToTab} />
                  </div>
                  <div className={`tab-pane fade ${activeTab === "comments" ? "show active" : ""}`} id="comments-pane" role="tabpanel" tabIndex="0">
                    <CommentsTab formData={formData} handleChange={handleChange} handleBlur={handleBlur} isSubmitting={isSubmitting} onClearForm={clearForm} onNavigate={navigateToTab} />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}