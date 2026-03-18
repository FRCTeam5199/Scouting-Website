import useForm from "../hooks/useForm";
import useNetworkStatus from "../hooks/useNetworkStatus";
import { saveOffline, sendToServer } from "../sync";
import { useState } from "react";

function validate(values) {
  const errors = {};
  if (!values.scouter_name?.trim()) errors.scouter_name = "Required";
  if (!values.scouter_team?.trim()) errors.scouter_team = "Required";
  if (!values.team_number?.trim()) errors.team_number = "Required";
  if (!values.length?.trim()) errors.length = "Required";
  if (!values.width?.trim()) errors.width = "Required";
  if (!values.starting_height?.trim()) errors.starting_height = "Required";
  if (!values.weight?.trim()) errors.weight = "Required";
  if (!values.batteries?.trim()) errors.batteries = "Required";
  if (!values.drive_motors) errors.drive_motors = "Required";
  if (values.drive_motors === "Other" && !values.drive_motors_other?.trim()) errors.drive_motors_other = "Required";
  if (!values.vision_system) errors.vision_system = "Required";
  if (values.vision_system === "Other" && !values.vision_system_other?.trim()) errors.vision_system_other = "Required";
  if (!values.hopper_capacity?.trim()) errors.hopper_capacity = "Required";
  if (!values.shooter_type) errors.shooter_type = "Required";
  if (values.shooter_type === "Other" && !values.shooter_type_other?.trim()) errors.shooter_type_other = "Required";
  if (!values.l1_climb_auto) errors.l1_climb_auto = "Required";
  if (!values.l1_climb_endgame) errors.l1_climb_endgame = "Required";
  return errors;
}

function ButtonGroupField({ label, name, options, value, onChange, required, error, touched }) {
  return (
    <div className="mb-3">
      <label className="form-label">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div className="d-flex flex-wrap gap-2">
        {options.map((opt) => (
          <div key={opt}>
            <input
              type="radio"
              className="btn-check"
              name={name}
              id={`${name}_${opt}`}
              value={opt}
              checked={value === opt}
              onChange={onChange}
              autoComplete="off"
            />
            <label className="btn btn-outline-primary" htmlFor={`${name}_${opt}`}>
              {opt}
            </label>
          </div>
        ))}
      </div>
      {touched && error && (
        <div className="text-danger mt-1" style={{ fontSize: "0.875rem" }}>{error}</div>
      )}
    </div>
  );
}

function PitScouting() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const isOnline = useNetworkStatus();

  // async function uploadImage(event) {
  //   const file = event.target.files[0];
  //   const teamNumber = formData.team_number;
  //   const reader = new FileReader();
  //   reader.onload = async () => {
  //     const base64 = reader.result.split(",")[1];
  //     await fetch("https://abc123.execute-api.us-west-2.amazonaws.com/upload", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ teamNumber, image: base64 }),
  //     });
  //     alert("Robot image uploaded!");
  //   };
  //   reader.readAsDataURL(file);
  // }

  async function uploadImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const teamNumber = formData.team_number;

  if (!teamNumber) {
    alert("⚠️ Please enter a team number before uploading an image.");
    return;
  }

  // If offline, don't even try
  if (!isOnline) {
    alert("⚠️ You are offline. Image upload requires internet.");
    return;
  }

  const reader = new FileReader();

  reader.onload = async () => {
    try {
      const base64 = reader.result.split(",")[1];

      const response = await fetch(
        "https://abc123.execute-api.us-west-2.amazonaws.com/prod/upload", // ✅ FIXED URL (stage added)
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teamNumber,
            image: base64,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setSuccessMessage(`📸 Image uploaded for Team ${teamNumber}!`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);

    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Image upload failed. Check connection or API.");
    }
  };

  reader.readAsDataURL(file);
}

  const onSubmit = async (values) => {
    const driveMotors = values.drive_motors === "Other"
      ? values.drive_motors_other || "Other"
      : values.drive_motors;

    const visionSystem = values.vision_system === "Other"
      ? values.vision_system_other || "Other"
      : values.vision_system;

    const shooterType = values.shooter_type === "Other"
      ? values.shooter_type_other || "Other"
      : values.shooter_type;

    const submission = {
      "Scouter's Name":             values.scouter_name || "",
      "Scouter's Team #":           values.scouter_team || "",
      "Scouted Team #":              values.team_number || "",
      "Length (w/ bumpers)":      values.length || "",
      "Width (w/ bumpers)":       values.width || "",
      "Starting Height":          values.starting_height || "",
      "Weight":                   values.weight || "",
      "Drive Motors":             driveMotors,
      "# of Batteries in Pit":   values.batteries || "",
      "Vision System":            visionSystem,
      "Hopper Max Capacity":      values.hopper_capacity || "",
      "Can L1 Climb in Auto?":    values.l1_climb_auto || "No",
      "Can L1 Climb in Endgame?": values.l1_climb_endgame || "No",
      "Shooter Type":             shooterType,
      "Robot's Favorite Food":    values.favorite_food || "",
      submissionId: crypto.randomUUID(),
      sheet_name: "Pit Scouting",
    };

    try {
      if (isOnline) {
        await sendToServer(submission);
        setSuccessMessage("Pit scouting data sent to server!");
      } else {
        await saveOffline(submission);
        setSuccessMessage("Saved locally. Will sync when online.");
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      throw error;
    }
  };

  const initialValues = {
    scouter_name: "",
    scouter_team: "",
    team_number: "",
    length: "",
    width: "",
    starting_height: "",
    weight: "",
    drive_motors: "",
    drive_motors_other: "",
    batteries: "",
    vision_system: "",
    vision_system_other: "",
    hopper_capacity: "",
    l1_climb_auto: "",
    l1_climb_endgame: "",
    shooter_type: "",
    shooter_type_other: "",
    favorite_food: "",
  };

  const { formData, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } = useForm({
    initialValues,
    validate,
    onSubmit,
  });

  const numericOnly = (e) => {
    if (
      !/[\d.]/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Tab" &&
      e.key !== "Delete" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight"
    ) {
      e.preventDefault();
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4 text-center">Pit Scouting</h1>

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
        <div className="row justify-content-center mb-3">
          <div className="col-lg-8">
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>
              {successMessage}
              <button type="button" className="btn-close" onClick={() => setShowSuccess(false)} aria-label="Close" />
            </div>
          </div>
        </div>
      )}

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <form onSubmit={handleSubmit} className="card p-4 shadow-sm">

            {/* ── Scouter & Team ── */}
            <div className="row">
              <div className="col-md-4 mb-3">
                <label htmlFor="scouter_name" className="form-label">
                  Your Name <span className="text-danger">*</span>
                </label>
                <input
                  id="scouter_name" type="text" name="scouter_name"
                  value={formData.scouter_name} onChange={handleChange} onBlur={handleBlur}
                  className={`form-control ${touched.scouter_name ? (errors.scouter_name ? "is-invalid" : "is-valid") : ""}`}
                  placeholder="Enter your name"
                />
                <div className="invalid-feedback">{errors.scouter_name}</div>
              </div>

              <div className="col-md-4 mb-3">
                <label htmlFor="scouter_team" className="form-label">
                  Your Team # <span className="text-danger">*</span>
                </label>
                <input
                  id="scouter_team" type="text" name="scouter_team" inputMode="numeric"
                  value={formData.scouter_team} onChange={handleChange} onBlur={handleBlur}
                  onKeyDown={numericOnly}
                  className={`form-control ${touched.scouter_team ? (errors.scouter_team ? "is-invalid" : "is-valid") : ""}`}
                  placeholder="Enter your team number"
                />
                <div className="invalid-feedback">{errors.scouter_team}</div>
              </div>

              <div className="col-md-4 mb-3">
                <label htmlFor="team_number" className="form-label">
                  Team Being Scouted <span className="text-danger">*</span>
                </label>
                <input
                  id="team_number" type="text" name="team_number" inputMode="numeric"
                  value={formData.team_number} onChange={handleChange} onBlur={handleBlur}
                  onKeyDown={numericOnly}
                  className={`form-control ${touched.team_number ? (errors.team_number ? "is-invalid" : "is-valid") : ""}`}
                  placeholder="Enter scouted team number"
                />
                <div className="invalid-feedback">{errors.team_number}</div>
              </div>
            </div>

            {/* ── Robot Dimensions ── */}
            <div className="row">
              <div className="col-md-4 mb-3">
                <label htmlFor="length" className="form-label">
                  Length (w/ bumpers) <span className="text-danger">*</span>
                </label>
                <input
                  id="length" type="text" name="length" inputMode="decimal"
                  value={formData.length} onChange={handleChange} onBlur={handleBlur}
                  onKeyDown={numericOnly}
                  className={`form-control ${touched.length ? (errors.length ? "is-invalid" : "is-valid") : ""}`}
                  placeholder='e.g. 32'
                />
                <div className="invalid-feedback">{errors.length}</div>
              </div>
              <div className="col-md-4 mb-3">
                <label htmlFor="width" className="form-label">
                  Width (w/ bumpers) <span className="text-danger">*</span>
                </label>
                <input
                  id="width" type="text" name="width" inputMode="decimal"
                  value={formData.width} onChange={handleChange} onBlur={handleBlur}
                  onKeyDown={numericOnly}
                  className={`form-control ${touched.width ? (errors.width ? "is-invalid" : "is-valid") : ""}`}
                  placeholder='e.g. 28'
                />
                <div className="invalid-feedback">{errors.width}</div>
              </div>
              <div className="col-md-4 mb-3">
                <label htmlFor="starting_height" className="form-label">
                  Starting Height <span className="text-danger">*</span>
                </label>
                <input
                  id="starting_height" type="text" name="starting_height" inputMode="decimal"
                  value={formData.starting_height} onChange={handleChange} onBlur={handleBlur}
                  onKeyDown={numericOnly}
                  className={`form-control ${touched.starting_height ? (errors.starting_height ? "is-invalid" : "is-valid") : ""}`}
                  placeholder='e.g. 30'
                />
                <div className="invalid-feedback">{errors.starting_height}</div>
              </div>
            </div>

            {/* ── Weight & Batteries ── */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="weight" className="form-label">
                  Weight (lbs) <span className="text-danger">*</span>
                </label>
                <input
                  id="weight" type="text" name="weight" inputMode="decimal"
                  value={formData.weight} onChange={handleChange} onBlur={handleBlur}
                  onKeyDown={numericOnly}
                  className={`form-control ${touched.weight ? (errors.weight ? "is-invalid" : "is-valid") : ""}`}
                  placeholder="e.g. 115"
                />
                <div className="invalid-feedback">{errors.weight}</div>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="batteries" className="form-label">
                  # of Batteries in Pit <span className="text-danger">*</span>
                </label>
                <input
                  id="batteries" type="text" name="batteries" inputMode="numeric"
                  value={formData.batteries} onChange={handleChange} onBlur={handleBlur}
                  onKeyDown={numericOnly}
                  className={`form-control ${touched.batteries ? (errors.batteries ? "is-invalid" : "is-valid") : ""}`}
                  placeholder="e.g. 2"
                />
                <div className="invalid-feedback">{errors.batteries}</div>
              </div>
            </div>

            {/* ── Drive Motors ── */}
            <ButtonGroupField
              label="Drive Motors"
              name="drive_motors"
              options={["Kraken", "Neo", "Vortex", "CIM", "Other"]}
              value={formData.drive_motors}
              onChange={handleChange}
              required
              error={errors.drive_motors}
              touched={touched.drive_motors}
            />
            {formData.drive_motors === "Other" && (
              <div className="mb-3">
                <input
                  type="text" name="drive_motors_other"
                  value={formData.drive_motors_other} onChange={handleChange} onBlur={handleBlur}
                  className={`form-control ${touched.drive_motors_other ? (errors.drive_motors_other ? "is-invalid" : "is-valid") : ""}`}
                  placeholder="Specify drive motor..."
                />
                <div className="invalid-feedback">{errors.drive_motors_other}</div>
              </div>
            )}

            {/* ── Vision System ── */}
            <ButtonGroupField
              label="Vision System"
              name="vision_system"
              options={["PhotonVision", "Limelight", "None", "Other"]}
              value={formData.vision_system}
              onChange={handleChange}
              required
              error={errors.vision_system}
              touched={touched.vision_system}
            />
            {formData.vision_system === "Other" && (
              <div className="mb-3">
                <input
                  type="text" name="vision_system_other"
                  value={formData.vision_system_other} onChange={handleChange} onBlur={handleBlur}
                  className={`form-control ${touched.vision_system_other ? (errors.vision_system_other ? "is-invalid" : "is-valid") : ""}`}
                  placeholder="Specify vision system..."
                />
                <div className="invalid-feedback">{errors.vision_system_other}</div>
              </div>
            )}

            {/* ── Hopper Capacity ── */}
            <div className="mb-3">
              <label htmlFor="hopper_capacity" className="form-label">
                Hopper Max Capacity <span className="text-danger">*</span>
              </label>
              <input
                id="hopper_capacity" type="text" name="hopper_capacity" inputMode="numeric"
                value={formData.hopper_capacity} onChange={handleChange} onBlur={handleBlur}
                onKeyDown={numericOnly}
                className={`form-control ${touched.hopper_capacity ? (errors.hopper_capacity ? "is-invalid" : "is-valid") : ""}`}
                placeholder="e.g. 5"
              />
              <div className="invalid-feedback">{errors.hopper_capacity}</div>
            </div>

            {/* ── Shooter Type ── */}
            <ButtonGroupField
              label="Shooter Type"
              name="shooter_type"
              options={["Drum", "Double Shooter", "Turret", "Single Shooter", "Other"]}
              value={formData.shooter_type}
              onChange={handleChange}
              required
              error={errors.shooter_type}
              touched={touched.shooter_type}
            />
            {formData.shooter_type === "Other" && (
              <div className="mb-3">
                <input
                  type="text" name="shooter_type_other"
                  value={formData.shooter_type_other} onChange={handleChange} onBlur={handleBlur}
                  className={`form-control ${touched.shooter_type_other ? (errors.shooter_type_other ? "is-invalid" : "is-valid") : ""}`}
                  placeholder="Specify shooter type..."
                />
                <div className="invalid-feedback">{errors.shooter_type_other}</div>
              </div>
            )}

            {/* ── Climb Capabilities ── */}
            <div className="row">
              <div className="col-md-6">
                <ButtonGroupField
                  label="Can L1 Climb in Auto?"
                  name="l1_climb_auto"
                  options={["Yes", "No"]}
                  value={formData.l1_climb_auto}
                  onChange={handleChange}
                  required
                  error={errors.l1_climb_auto}
                  touched={touched.l1_climb_auto}
                />
              </div>
              <div className="col-md-6">
                <ButtonGroupField
                  label="Can L1 Climb in Endgame?"
                  name="l1_climb_endgame"
                  options={["Yes", "No"]}
                  value={formData.l1_climb_endgame}
                  onChange={handleChange}
                  required
                  error={errors.l1_climb_endgame}
                  touched={touched.l1_climb_endgame}
                />
              </div>
            </div>

            {/* ── Fun Question ── */}
            <div className="mb-4">
              <label htmlFor="favorite_food" className="form-label">
                What is your robot's favorite food? 🍕
              </label>
              <input
                id="favorite_food" type="text" name="favorite_food"
                value={formData.favorite_food} onChange={handleChange} onBlur={handleBlur}
                className="form-control" placeholder="e.g. Lithium grease sandwiches"
              />
            </div>

            {/* ── Robot Image ── */}
            <div className="mb-4">
              <label htmlFor="robotImage" className="form-label fw-bold fs-5">
                Upload Robot Picture
              </label>
              <input
                id="robotImage" type="file" accept="image/*"
                onChange={uploadImage}
                className="form-control form-control-lg"
                style={{ padding: "1rem", fontSize: "1.1rem" }}
              />
            </div>

            {/* ── Submit ── */}
            <div className="d-grid">
              <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg">
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : "Submit Pit Scouting"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default PitScouting;