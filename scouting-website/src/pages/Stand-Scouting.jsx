import React, { useState } from "react";
import useForm from "../hooks/useForm";
import useNetworkStatus from "../hooks/useNetworkStatus";
import { saveOffline, sendToServer } from "../sync";
import "../styles/StandScouting.css";

// Validation function
function validate(values) {
  const errors = {};
  if (!values.scouter_name?.toString().trim()) errors.scouter_name = "Required";
  if (!values.scouter_team?.toString().trim()) errors.scouter_team = "Required";
  if (!values.scouted_team?.toString().trim()) errors.scouted_team = "Required";
  if (!values.driver_station?.toString().trim()) errors.driver_station = "Required";
  if (!values.match_number?.toString().trim()) errors.match_number = "Required";
  if (!values.starting_location?.toString().trim()) errors.starting_location = "Required";
  return errors;
}

function PreGameTab({ formData, errors, touched, handleChange, handleBlur, rotated, setRotated }) {
  const isBlueAlliance = formData.driver_station?.startsWith("Blue");
  const fieldImage = isBlueAlliance
    ? "/icons/blueAllianceField-2026.png"
    : "/icons/redAllianceField-2026.png";

  const handleStartingLocationClick = (index) => {
    const value = String(index + 1);
    handleChange({ target: { name: "starting_location", value, type: "text" } });
  };

  return (
    <div className="pre-game-tab">
      <div className="form-section mb-4">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="scouter_name" className="form-label">
              Scouter's Name <span className="text-danger">*</span>
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
              Scouter's Team # <span className="text-danger">*</span>
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

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="scouted_team" className="form-label">
              Scouted Team <span className="text-danger">*</span>
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
            <label htmlFor="driver_station" className="form-label">
              Driver Station <span className="text-danger">*</span>
            </label>
            <select
              id="driver_station"
              name="driver_station"
              value={formData.driver_station}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-select ${touched.driver_station && errors.driver_station ? "is-invalid" : ""}`}
            >
              <option value="">Select a driver station</option>
              <option value="Red Alliance 1">Red Alliance 1</option>
              <option value="Red Alliance 2">Red Alliance 2</option>
              <option value="Red Alliance 3">Red Alliance 3</option>
              <option value="Blue Alliance 1">Blue Alliance 1</option>
              <option value="Blue Alliance 2">Blue Alliance 2</option>
              <option value="Blue Alliance 3">Blue Alliance 3</option>
            </select>
            <div className="invalid-feedback">{errors.driver_station}</div>
          </div>
        </div>

        <div className="row">
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
      </div>

      <div className="field-section text-center">
        <label className="form-label d-block mb-2 title-with-image">Starting Location <span className="text-danger">*</span></label>

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
                const style = { left: `${left}%`, top: `${computedTop}%` };
                return (
                  <button
                    key={i}
                    type="button"
                    className={`starting-location-btn ${formData.starting_location === String(i + 1) ? "active" : ""}`}
                    style={style}
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
    </div>
  );
}

function AutonTab() {
  return <div className="p-3">Auton fields go here.</div>;
}

function TeleopTab() {
  return <div className="p-3">Teleop fields go here.</div>;
}

function EndgameTab() {
  return <div className="p-3">Endgame fields go here.</div>;
}

function ExtraTab() {
  return <div className="p-3">Extra activities or notes.</div>;
}

function CommentsTab({ formData, handleChange, handleBlur, isSubmitting }) {
  return (
    <div className="p-3">
      <div className="mb-3">
        <label htmlFor="comments" className="form-label">
          Comments
        </label>
        <textarea id="comments" name="comments" value={formData.comments} onChange={handleChange} onBlur={handleBlur} className="form-control" rows={3}></textarea>
      </div>

      <div className="d-grid mt-4">
        <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg">
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            "Submit Scouting Data"
          )}
        </button>
      </div>
    </div>
  );
}

export default function StandScoutingFixed() {
  const isOnline = useNetworkStatus();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [rotated, setRotated] = useState(false);

  const [initialValues, setInitialValues] = useState({
    scouter_name: "",
    scouter_team: "",
    scouted_team: "",
    driver_station: "",
    match_number: "",
    starting_location: "",
    comments: "",
  });

  const onSubmit = async (values) => {
    const submission = {
      ...values,
      submissionId: crypto.randomUUID(),
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

  // wrapper submit that checks validation synchronously via validate(formData)
  const onFormSubmit = async (e) => {
    e.preventDefault();
    await handleSubmit(e);

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setShowValidationAlert(true);
      return;
    }

    setShowValidationAlert(false);

    // Preserve scouter fields and driver station, increment match if numeric
    const preservedName = formData.scouter_name || initialValues.scouter_name;
    const preservedScouterTeam = formData.scouter_team || initialValues.scouter_team;
    const preservedDriverStation = formData.driver_station || initialValues.driver_station;

    let nextMatch = "";
    const rawMatch = String(formData.match_number || initialValues.match_number || "").trim();
    if (rawMatch !== "" && !Number.isNaN(Number(rawMatch))) {
      nextMatch = String(Number(rawMatch) + 1);
    } else {
      nextMatch = rawMatch;
    }

    const newInitial = {
      scouter_name: preservedName,
      scouter_team: preservedScouterTeam,
      scouted_team: "",
      driver_station: preservedDriverStation,
      match_number: nextMatch,
      starting_location: "",
      comments: "",
    };

    setInitialValues(newInitial);
  };

  return (
    <div className="container mt-4">
      {/* inline CSS to force nowrap tabs and ensure immediate rotation */}
      <style>{`
        .nav-tabs{display:flex !important; flex-wrap:nowrap !important; overflow-x:auto; -webkit-overflow-scrolling:touch}
        .nav-tabs .nav-link{white-space:nowrap}
        .field-image-container.rotated{transform:rotate(180deg)}
      `}</style>

      <h1 className="mb-4 text-center">Stand Scouting</h1>

      <div className={`alert ${isOnline ? "alert-success" : "alert-warning"} d-flex align-items-center mb-4`} role="alert">
        <i className={`bi ${isOnline ? "bi-wifi" : "bi-wifi-off"} me-2`}></i>
        <small className="mb-0">{isOnline ? "Online - submissions go to server" : "Offline - submissions stored locally"}</small>
      </div>

      {showSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setShowSuccess(false)} aria-label="Close"></button>
        </div>
      )}

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <form onSubmit={onFormSubmit}>
                <ul className="nav nav-tabs" id="scoutingTab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button className="nav-link active" id="pre-game-tab" data-bs-toggle="tab" data-bs-target="#pre-game-pane" type="button" role="tab" aria-controls="pre-game-pane" aria-selected="true">Pre-Game</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="auton-tab" data-bs-toggle="tab" data-bs-target="#auton-pane" type="button" role="tab" aria-controls="auton-pane" aria-selected="false">Auton</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="teleop-tab" data-bs-toggle="tab" data-bs-target="#teleop-pane" type="button" role="tab" aria-controls="teleop-pane" aria-selected="false">Teleop</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="endgame-tab" data-bs-toggle="tab" data-bs-target="#endgame-pane" type="button" role="tab" aria-controls="endgame-pane" aria-selected="false">Endgame</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="extra-tab" data-bs-toggle="tab" data-bs-target="#extra-pane" type="button" role="tab" aria-controls="extra-pane" aria-selected="false">Extra</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="comments-tab" data-bs-toggle="tab" data-bs-target="#comments-pane" type="button" role="tab" aria-controls="comments-pane" aria-selected="false">Comments</button>
                  </li>
                </ul>

                {showValidationAlert && (
                  <div className="mt-3">
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <svg class="bi flex-shrink-0 me-2" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg>
                      <div>Not all required information has been filled out yet!</div>
                    </div>
                  </div>
                )}

                <div className="tab-content" id="scoutingTabContent">
                  <div className="tab-pane fade show active" id="pre-game-pane" role="tabpanel" aria-labelledby="pre-game-tab" tabIndex="0">
                    <PreGameTab formData={formData} errors={errors} touched={touched} handleChange={handleChange} handleBlur={handleBlur} rotated={rotated} setRotated={setRotated} />
                  </div>
                  <div className="tab-pane fade" id="auton-pane" role="tabpanel" aria-labelledby="auton-tab" tabIndex="0"><AutonTab /></div>
                  <div className="tab-pane fade" id="teleop-pane" role="tabpanel" aria-labelledby="teleop-tab" tabIndex="0"><TeleopTab /></div>
                  <div className="tab-pane fade" id="endgame-pane" role="tabpanel" aria-labelledby="endgame-tab" tabIndex="0"><EndgameTab /></div>
                  <div className="tab-pane fade" id="extra-pane" role="tabpanel" aria-labelledby="extra-tab" tabIndex="0"><ExtraTab /></div>
                  <div className="tab-pane fade" id="comments-pane" role="tabpanel" aria-labelledby="comments-tab" tabIndex="0">
                    <CommentsTab formData={formData} handleChange={handleChange} handleBlur={handleBlur} isSubmitting={isSubmitting} />
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
