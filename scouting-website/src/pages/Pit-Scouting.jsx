import { useState, useRef, useCallback, useEffect } from "react";
import useForm from "../hooks/useForm";
import useNetworkStatus from "../hooks/useNetworkStatus";
import { saveOffline, sendToServer, handleImageUpload } from "../sync";
import { useSharedScouter, getPreservedScouter } from "../hooks/useSharedScouter";

function validate(values, imageFile) {
  const errors = {};
  if (!values.scouter_name?.trim())     errors.scouter_name     = "Required";
  if (!values.scouter_team?.trim())     errors.scouter_team     = "Required";
  if (values.scouter_team && !/^\d+$/.test(values.scouter_team.trim())) errors.scouter_team = "Must be a number";
  if (!values.team_number?.trim())      errors.team_number      = "Required";
  if (values.team_number && !/^\d+$/.test(values.team_number.trim())) errors.team_number = "Must be a number";
  if (!values.length?.trim())           errors.length           = "Required";
  if (!values.width?.trim())            errors.width            = "Required";
  if (!values.starting_height?.trim())  errors.starting_height  = "Required";
  if (!values.weight?.trim())           errors.weight           = "Required";
  if (!values.batteries?.trim())        errors.batteries        = "Required";
  if (!values.drive_motors)             errors.drive_motors     = "Required";
  if (values.drive_motors === "Other" && !values.drive_motors_other?.trim()) errors.drive_motors_other = "Required";
  if (!values.vision_system)            errors.vision_system    = "Required";
  if (values.vision_system === "Other" && !values.vision_system_other?.trim()) errors.vision_system_other = "Required";
  if (!values.hopper_capacity?.trim())  errors.hopper_capacity  = "Required";
  if (!values.shooter_type)             errors.shooter_type     = "Required";
  if (values.shooter_type === "Other" && !values.shooter_type_other?.trim()) errors.shooter_type_other = "Required";
  if (!values.l1_climb_auto)            errors.l1_climb_auto    = "Required";
  if (!values.l1_climb_endgame)         errors.l1_climb_endgame = "Required";
  if (!imageFile)                       errors.image            = "A robot photo is required";
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
            <input type="radio" className="btn-check" name={name} id={`${name}_${opt}`}
              value={opt} checked={value === opt} onChange={onChange} autoComplete="off" />
            <label className="btn btn-outline-primary" htmlFor={`${name}_${opt}`}>{opt}</label>
          </div>
        ))}
      </div>
      {touched && error && <div className="text-danger mt-1" style={{ fontSize: "0.875rem" }}>{error}</div>}
    </div>
  );
}

function NumberInput({ id, name, label, value, onChange, onBlur, touched, error, placeholder, required }) {
  const numericOnly = (e) => {
    if (!/[\d.]/.test(e.key) && !["Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
  };
  return (
    <div className="mb-3">
      {label && <label htmlFor={id} className="form-label">{label} {required && <span className="text-danger">*</span>}</label>}
      <input id={id} type="text" name={name} inputMode="decimal"
        value={value} onChange={onChange} onBlur={onBlur} onKeyDown={numericOnly}
        className={`form-control ${touched ? (error ? "is-invalid" : "is-valid") : ""}`}
        placeholder={placeholder} />
      <div className="invalid-feedback">{error}</div>
    </div>
  );
}

function ImageUploadField({ imageFile, imagePreview, onFileChange, error, inputRef }) {
  return (
    <div className="mb-4">
      <label className="form-label fw-bold fs-5">
        Upload Robot Picture <span className="text-danger">*</span>
      </label>
      <input ref={inputRef} id="robotImage" type="file" accept="image/*" onChange={onFileChange}
        className={`form-control form-control-lg ${error ? "is-invalid" : ""}`}
        style={{ padding: "1rem", fontSize: "1.1rem" }} />
      {error && <div className="invalid-feedback d-block">{error}</div>}
      {imagePreview && (
        <div className="mt-3 text-center">
          <img src={imagePreview} alt="Robot preview" style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "0.5rem", border: "2px solid #dee2e6", objectFit: "contain" }} />
          <div className="mt-2 text-muted" style={{ fontSize: "0.875rem" }}>{imageFile?.name}</div>
        </div>
      )}
    </div>
  );
}

function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => { img.src = e.target.result; };
    img.onload = () => {
      const MAX_WIDTH = 800;
      const scale = Math.min(1, MAX_WIDTH / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7).split(",")[1]);
    };
    reader.readAsDataURL(file);
  });
}

function getInitialValues() {
  const preserved = getPreservedScouter();
  return {
    scouter_name:        preserved.scouter_name || "",
    scouter_team:        preserved.scouter_team || "",
    team_number:         "",
    length:              "",
    width:               "",
    starting_height:     "",
    weight:              "",
    drive_motors:        "",
    drive_motors_other:  "",
    batteries:           "",
    vision_system:       "",
    vision_system_other: "",
    hopper_capacity:     "",
    l1_climb_auto:       "",
    l1_climb_endgame:    "",
    shooter_type:        "",
    shooter_type_other:  "",
    favorite_food:       "",
  };
}

function PitScouting() {
  const isOnline = useNetworkStatus();
  const [showSuccess, setShowSuccess]       = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [imageFile, setImageFile]           = useState(null);
  const [imagePreview, setImagePreview]     = useState(null);
  const [imageError, setImageError]         = useState("");
  const [showClearModal, setShowClearModal] = useState(false);
  const fileInputRef = useRef(null);
  const [sharedScouter, updateSharedScouter] = useSharedScouter();

  const handleChangeWithSync = (e) => {
    // Update both useForm state (for validation) and shared localStorage
    handleChange(e);
    if (e.target.name === "scouter_name" || e.target.name === "scouter_team") {
      updateSharedScouter(e.target.name, e.target.value);
    }
  };

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImageError("");
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const onSubmit = async (values) => {
    if (!imageFile) { setImageError("A robot photo is required"); return; }

    const driveMotors  = values.drive_motors  === "Other" ? values.drive_motors_other  || "Other" : values.drive_motors;
    const visionSystem = values.vision_system === "Other" ? values.vision_system_other || "Other" : values.vision_system;
    const shooterType  = values.shooter_type  === "Other" ? values.shooter_type_other  || "Other" : values.shooter_type;

    const submission = {
      "Scouter's Name":           values.scouter_name     || "",
      "Scouter's Team #":         values.scouter_team     || "",
      "Team Number":              values.team_number      || "",
      "Length (w/ bumpers)":              values.length           || "",
      "Width (w/ bumpers)":               values.width            || "",
      "Starting Height":     values.starting_height  || "",
      "Weight":             values.weight           || "",
      "Drive Motors":             driveMotors,
      "# of Batteries in Pit":   values.batteries        || "",
      "Vision System":            visionSystem,
      "Hopper Max Capacity":      values.hopper_capacity  || "",
      "Can L1 Climb in Auto?":    values.l1_climb_auto    || "No",
      "Can L1 Climb in Endgame?": values.l1_climb_endgame || "No",
      "Shooter Type":             shooterType,
      "Robot's Favorite Food":    values.favorite_food    || "",
      submissionId: crypto.randomUUID(),
      sheet_name: "Pit Scouting",
    };

    if (isOnline) {
      await sendToServer(submission);
      setSuccessMessage("Stand scouting data sent to server.");
    } else {
      await saveOffline(submission);
      setSuccessMessage("Stand scouting data saved locally and will sync when online.");
    }

    try {
      const base64 = await compressImage(imageFile);
      await handleImageUpload(values.team_number, base64);
    } catch (err) {
      console.error("[PitScouting] Image processing failed:", err);
    }

    // Save scouter info to shared key
    const existing = getPreservedScouter();
    localStorage.setItem("standScoutingPreserved", JSON.stringify({
      ...existing,
      scouter_name: values.scouter_name || "",
      scouter_team: values.scouter_team || "",
    }));

    // Reset form but keep name/team autofill
    resetForm();
    setImageFile(null);
    setImagePreview(null);
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";

    setSuccessMessage(isOnline ? "Pit scouting data submitted successfully!" : "Saved offline. Will sync when back online.");
    setShowSuccess(true);
    setShowValidationAlert(false);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const validateWithImage = useCallback((values) => validate(values, imageFile), [imageFile]);

  const { formData, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, resetForm } = useForm({
    initialValues: getInitialValues(),
    validate: validateWithImage,
    onSubmit,
  });

  // Sync scouter name/team to shared localStorage on every keystroke
  useSharedScouter(formData.scouter_name, formData.scouter_team);

  // When stand scouting updates the shared key while pit scouting is open,
  // listen for storage events and update the fields live
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== "standScoutingPreserved") return;
      try {
        const parsed = JSON.parse(e.newValue || "{}");
        if (parsed.scouter_name !== undefined && parsed.scouter_name !== formData.scouter_name) {
          handleChange({ target: { name: "scouter_name", value: parsed.scouter_name, type: "text" } });
        }
        if (parsed.scouter_team !== undefined && parsed.scouter_team !== formData.scouter_team) {
          handleChange({ target: { name: "scouter_team", value: parsed.scouter_team, type: "text" } });
        }
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [formData.scouter_name, formData.scouter_team, handleChange]);

  // Autosave - THIS NEEDS TO BE DONE STILL !!!

  const handleClear = () => {
    resetForm();
    setImageFile(null);
    setImagePreview(null);
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowClearModal(false);
  };

 
  const validationAlertRef = useRef(null);
  const successAlertRef    = useRef(null);

  useEffect(() => {
    if (showValidationAlert && validationAlertRef.current) {
      validationAlertRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [showValidationAlert]);

  useEffect(() => {
    if (showSuccess && successAlertRef.current) {
      successAlertRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [showSuccess]);


  const onFormSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(formData, imageFile);
    if (Object.keys(validationErrors).length > 0) {
      setShowValidationAlert(true);
      // Also trigger useForm's own validation to show field-level errors
      await handleSubmit(e);
      return;
    }
    setShowValidationAlert(false);
    await handleSubmit(e);
  };

  const numericOnly = (e) => {
    if (!/[\d.]/.test(e.key) && !["Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4 text-center">Pit Scouting</h1>

      {/* Offline alert — scoped to form width, only when offline */}
      {!isOnline && (
        <div className="row justify-content-center mb-3">
          <div className="col-lg-8">
            <div className="alert alert-warning d-flex align-items-center" role="alert">
              <svg className="bi flex-shrink-0 me-2" width="20" height="20" role="img" aria-label="Warning:">
                <use xlinkHref="#exclamation-triangle-fill" />
              </svg>
              <small className="mb-0">Offline — data will be saved locally and synced when you reconnect.</small>
            </div>
          </div>
        </div>
      )}

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <form onSubmit={onFormSubmit} className="card p-4 shadow-sm">

            {/* ── Scouter & Team ── */}
            <div className="row">
              <div className="col-md-4 mb-3">
                <label htmlFor="scouter_name" className="form-label">Your Name <span className="text-danger">*</span></label>
                <input id="scouter_name" type="text" name="scouter_name"
                  value={sharedScouter.scouter_name} onChange={handleChangeWithSync} onBlur={handleBlur}
                  className={`form-control ${touched.scouter_name ? (errors.scouter_name ? "is-invalid" : "is-valid") : ""}`}
                  placeholder="Enter your name" />
                <div className="invalid-feedback">{errors.scouter_name}</div>
              </div>
              <div className="col-md-4">
                <NumberInput id="scouter_team" name="scouter_team" label="Your Team #" required
                  value={sharedScouter.scouter_team} onChange={handleChangeWithSync} onBlur={handleBlur}
                  touched={touched.scouter_team} error={errors.scouter_team} placeholder="e.g. 5199" />
              </div>
              <div className="col-md-4">
                <NumberInput id="team_number" name="team_number" label="Team Being Scouted" required
                  value={formData.team_number} onChange={handleChange} onBlur={handleBlur}
                  touched={touched.team_number} error={errors.team_number} placeholder="e.g. 254" />
              </div>
            </div>

            {/* ── Robot Dimensions ── */}
            <div className="row">
              <div className="col-md-4">
                <NumberInput id="length" name="length" label="Length (in)" required
                  value={formData.length} onChange={handleChange} onBlur={handleBlur}
                  touched={touched.length} error={errors.length} placeholder="e.g. 32" />
              </div>
              <div className="col-md-4">
                <NumberInput id="width" name="width" label="Width (in)" required
                  value={formData.width} onChange={handleChange} onBlur={handleBlur}
                  touched={touched.width} error={errors.width} placeholder="e.g. 28" />
              </div>
              <div className="col-md-4">
                <NumberInput id="starting_height" name="starting_height" label="Starting Height (in)" required
                  value={formData.starting_height} onChange={handleChange} onBlur={handleBlur}
                  touched={touched.starting_height} error={errors.starting_height} placeholder="e.g. 30" />
              </div>
            </div>

            {/* ── Weight & Batteries ── */}
            <div className="row">
              <div className="col-md-6">
                <NumberInput id="weight" name="weight" label="Weight (lbs)" required
                  value={formData.weight} onChange={handleChange} onBlur={handleBlur}
                  touched={touched.weight} error={errors.weight} placeholder="e.g. 115" />
              </div>
              <div className="col-md-6">
                <NumberInput id="batteries" name="batteries" label="# of Batteries in Pit" required
                  value={formData.batteries} onChange={handleChange} onBlur={handleBlur}
                  touched={touched.batteries} error={errors.batteries} placeholder="e.g. 2" />
              </div>
            </div>

            {/* ── Drive Motors ── */}
            <ButtonGroupField label="Drive Motors" name="drive_motors" required
              options={["Kraken", "Neo", "Vortex", "CIM", "Other"]}
              value={formData.drive_motors} onChange={handleChange}
              error={errors.drive_motors} touched={touched.drive_motors} />
            {formData.drive_motors === "Other" && (
              <div className="mb-3">
                <input type="text" name="drive_motors_other" value={formData.drive_motors_other}
                  onChange={handleChange} onBlur={handleBlur}
                  className={`form-control ${touched.drive_motors_other ? (errors.drive_motors_other ? "is-invalid" : "is-valid") : ""}`}
                  placeholder="Specify drive motor..." />
                <div className="invalid-feedback">{errors.drive_motors_other}</div>
              </div>
            )}

            {/* ── Vision System ── */}
            <ButtonGroupField label="Vision System" name="vision_system" required
              options={["PhotonVision", "Limelight", "None", "Other"]}
              value={formData.vision_system} onChange={handleChange}
              error={errors.vision_system} touched={touched.vision_system} />
            {formData.vision_system === "Other" && (
              <div className="mb-3">
                <input type="text" name="vision_system_other" value={formData.vision_system_other}
                  onChange={handleChange} onBlur={handleBlur}
                  className={`form-control ${touched.vision_system_other ? (errors.vision_system_other ? "is-invalid" : "is-valid") : ""}`}
                  placeholder="Specify vision system..." />
                <div className="invalid-feedback">{errors.vision_system_other}</div>
              </div>
            )}

            {/* ── Hopper Capacity ── */}
            <NumberInput id="hopper_capacity" name="hopper_capacity" label="Hopper Max Capacity" required
              value={formData.hopper_capacity} onChange={handleChange} onBlur={handleBlur}
              touched={touched.hopper_capacity} error={errors.hopper_capacity} placeholder="e.g. 5" />

            {/* ── Shooter Type ── */}
            <ButtonGroupField label="Shooter Type" name="shooter_type" required
              options={["Drum", "Double Shooter", "Turret", "Single Shooter", "Other"]}
              value={formData.shooter_type} onChange={handleChange}
              error={errors.shooter_type} touched={touched.shooter_type} />
            {formData.shooter_type === "Other" && (
              <div className="mb-3">
                <input type="text" name="shooter_type_other" value={formData.shooter_type_other}
                  onChange={handleChange} onBlur={handleBlur}
                  className={`form-control ${touched.shooter_type_other ? (errors.shooter_type_other ? "is-invalid" : "is-valid") : ""}`}
                  placeholder="Specify shooter type..." />
                <div className="invalid-feedback">{errors.shooter_type_other}</div>
              </div>
            )}

            {/* ── Climb Capabilities ── */}
            <div className="row">
              <div className="col-md-6">
                <ButtonGroupField label="Can L1 Climb in Auto?" name="l1_climb_auto" required
                  options={["Yes", "No"]} value={formData.l1_climb_auto} onChange={handleChange}
                  error={errors.l1_climb_auto} touched={touched.l1_climb_auto} />
              </div>
              <div className="col-md-6">
                <ButtonGroupField label="Can L1 Climb in Endgame?" name="l1_climb_endgame" required
                  options={["Yes", "No"]} value={formData.l1_climb_endgame} onChange={handleChange}
                  error={errors.l1_climb_endgame} touched={touched.l1_climb_endgame} />
              </div>
            </div>

            {/* ── Fun Question ── */}
            <div className="mb-4">
              <label htmlFor="favorite_food" className="form-label">What is your robot's favorite food? 🍕</label>
              <input id="favorite_food" type="text" name="favorite_food"
                value={formData.favorite_food} onChange={handleChange} onBlur={handleBlur}
                className="form-control" placeholder="e.g. Lithium grease sandwiches" />
            </div>

            {/* ── Robot Image ── */}
            <ImageUploadField imageFile={imageFile} imagePreview={imagePreview}
              onFileChange={handleFileChange} error={imageError} inputRef={fileInputRef} />

            {/* ── Actions ── */}
            <div className="row g-2 mb-3">
              <div className="col-6">
                <button type="button" className="btn btn-danger btn-lg w-100" onClick={() => setShowClearModal(true)}>Clear Form</button>
              </div>
              <div className="col-6">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg w-100">
                  {isSubmitting ? (<><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Saving...</>) : "Submit Pit Scouting"}
                </button>
              </div>
            </div>

            {/* Validation alert — bottom of form */}
            {showValidationAlert && (
              <div ref={validationAlertRef} className="alert alert-danger d-flex align-items-center mt-2" role="alert">
                <svg className="bi flex-shrink-0 me-2" width="20" height="20" role="img" aria-label="Danger:">
                  <use xlinkHref="#exclamation-triangle-fill" />
                </svg>
                <div>Not all required information has been filled out yet!</div>
              </div>
            )}

            {/* Success alert — bottom of form */}
            {showSuccess && (
              <div ref={successAlertRef} className="alert alert-success d-flex align-items-center alert-dismissible mt-2" role="alert">
                <svg className="bi flex-shrink-0 me-2" width="20" height="20" role="img" aria-label="Success:">
                  <use xlinkHref="#check-circle-fill" />
                </svg>
                <div>{successMessage}</div>
                <button type="button" className="btn-close" onClick={() => setShowSuccess(false)} aria-label="Close" />
              </div>
            )}

          </form>
        </div>
      </div>

      {/* Clear confirmation modal */}
      {showClearModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "0.5rem", textAlign: "center", minWidth: "300px" }}>
            <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem", color: "#000" }}>Are you sure you want to clear this form?</p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button type="button" className="btn btn-primary" onClick={() => setShowClearModal(false)}>No</button>
              <button type="button" className="btn btn-secondary" onClick={handleClear}>Yes</button>
            </div>
          </div>
        </div>
      )}

      {/* Bootstrap SVG sprite */}
      <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }}>
        <symbol id="exclamation-triangle-fill" viewBox="0 0 16 16">
          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
        </symbol>
        <symbol id="check-circle-fill" viewBox="0 0 16 16">
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
        </symbol>
      </svg>
    </div>
  );
}

export default PitScouting;