import React, { useState } from "react";
import useForm from "../hooks/useForm";
import useNetworkStatus from "../hooks/useNetworkStatus";
import { saveOffline, sendToServer } from "../sync";
import "../styles/StandScouting.css";

// Page-level validation for Stand Scouting form
function validate(values) {
  const errors = {};
  if (!values.scouter_name?.toString().trim()) errors.scouter_name = "Required";
  if (!values.driver_station?.toString().trim()) errors.driver_station = "Required";
  if (!values.team_number?.toString().trim()) errors.team_number = "Required";
  if (!values.match_number?.toString().trim()) errors.match_number = "Required";
  if (!values.starting_location?.toString().trim()) errors.starting_location = "Required";
  return errors;
}

function PreGameTab({ formData, errors, touched, handleChange, handleBlur }) {
  // Determine which field image to display based on driver station
  const isBlueAlliance = formData.driver_station?.startsWith("Blue");
  const fieldImage = isBlueAlliance
    ? "/images/blueAllianceField-2026.png"
    : "/images/redAllianceField-2026.png";

  // Handle starting location button click
  const handleStartingLocationClick = (location) => {
    const changeEvent = {
      target: {
        name: "starting_location",
        value: location,
        type: "text",
      },
    };
    handleChange(changeEvent);
  };

  return (
    <div className="pre-game-tab">
      {/* Form Fields Section */}
      <div className="form-section mb-4">
        <div className="row">
          {/* Scouter Name */}
          <div className="col-md-6 mb-3">
            <label htmlFor="scouter_name" className="form-label">
              Scouter Name <span className="text-danger">*</span>
            </label>
            <input
              id="scouter_name"
              type="text"
              name="scouter_name"
              value={formData.scouter_name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-control ${
                touched.scouter_name
                  ? errors.scouter_name
                    ? "is-invalid"
                    : "is-valid"
                  : ""
              }`}
              placeholder="Enter your name"
            />
            <div className="invalid-feedback">{errors.scouter_name}</div>
          </div>

          {/* Driver Station */}
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
              className={`form-select ${
                touched.driver_station
                  ? errors.driver_station
                    ? "is-invalid"
                    : "is-valid"
                  : ""
              }`}
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
          {/* Team Number */}
          <div className="col-md-6 mb-3">
            <label htmlFor="team_number" className="form-label">
              Team # <span className="text-danger">*</span>
            </label>
            <input
              id="team_number"
              type="text"
              name="team_number"
              value={formData.team_number}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-control ${
                touched.team_number
                  ? errors.team_number
                    ? "is-invalid"
                    : "is-valid"
                  : ""
              }`}
              placeholder="Enter team number"
            />
            <div className="invalid-feedback">{errors.team_number}</div>
          </div>

          {/* Match Number */}
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
              className={`form-control ${
                touched.match_number
                  ? errors.match_number
                    ? "is-invalid"
                    : "is-valid"
                  : ""
              }`}
              placeholder="Enter match number"
            />
            <div className="invalid-feedback">{errors.match_number}</div>
          </div>
        </div>
      </div>

      {/* Field Image with Overlay Buttons Section */}
      <div className="field-section">
        <label className="form-label d-block mb-3">
          Starting Location <span className="text-danger">*</span>
        </label>

        <div className="field-image-container">
          <img src={fieldImage} alt="Field" className="field-image" />

          {/* Overlay starting location buttons */}
          <div className="starting-location-overlay">
            {/* Left side button */}
            <button
              type="button"
              className={`starting-location-btn ${
                formData.starting_location === "Left" ? "active" : ""
              }`}
              style={{ left: "15%", top: "40%" }}
              onClick={() => handleStartingLocationClick("Left")}
              title="Left starting location"
            >
              L
            </button>

            {/* Right side button */}
            <button
              type="button"
              className={`starting-location-btn ${
                formData.starting_location === "Right" ? "active" : ""
              }`}
              style={{ right: "15%", top: "40%" }}
              onClick={() => handleStartingLocationClick("Right")}
              title="Right starting location"
            >
              R
            </button>
          </div>
        </div>

        {errors.starting_location && touched.starting_location && (
          <div className="invalid-feedback d-block mt-2">{errors.starting_location}</div>
        )}
      </div>
    </div>
  );
}

function StandScouting() {
  const isOnline = useNetworkStatus();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const initialValues = {
    scouter_name: "",
    driver_station: "",
    team_number: "",
    match_number: "",
    starting_location: "",
  };

  const onSubmit = async (values) => {
    const submission = {
      ...values,
      submissionId: crypto.randomUUID(),
      sheet_name: "StandScouting",
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

  const {
    formData,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useForm({ initialValues, validate, onSubmit });

  return (
    <div className="container mt-4">
      <h1 className="mb-4 text-center">Stand Scouting</h1>

      {/* Online/Offline Status */}
      <div className={`alert ${isOnline ? "alert-success" : "alert-warning"} d-flex align-items-center mb-4`} role="alert">
        <i className={`bi ${isOnline ? "bi-wifi" : "bi-wifi-off"} me-2`}></i>
        <small className="mb-0">
          {isOnline ? "Online - submissions go to server" : "Offline - submissions stored locally"}
        </small>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {successMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowSuccess(false)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Form and Tabs Container */}
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Pre-Game Tab (only tab for now) */}
            <PreGameTab
              formData={formData}
              errors={errors}
              touched={touched}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />

            {/* Submit Button */}
            <div className="d-grid mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary btn-lg"
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving...
                  </>
                ) : (
                  "Submit Pre-Game"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StandScouting;