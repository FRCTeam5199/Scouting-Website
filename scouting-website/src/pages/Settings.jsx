import useForm from "../hooks/useForm";
import useNetworkStatus from "../hooks/useNetworkStatus";
import { saveOffline, sendToServer, getLastSettings } from "../sync";
import { useState, useEffect } from "react";

// Show checkmark/error icons on the form
function validate(values) {
  const errors = {};

  if (!values.Name.trim()) errors.Name = "Required";
  if (!values["Team #"].trim()) errors["Team #"] = "Required";
  if (!values["Competition Key"].trim()) errors["Competition Key"] = "Required";
  if (!values.Alliance) errors.Alliance = "Required";

  return errors;
}

function Settings() {
  const [initialValues, setInitialValues] = useState({
    Name: "",
    "Team #": "",
    "Competition Key": "",
    Alliance: "",
  });
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const isOnline = useNetworkStatus();
  const [successMessage, setSuccessMessage] = useState("");

  // Load saved settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await getLastSettings();
        if (savedSettings) {
          setInitialValues({
            Name: savedSettings.Name || "",
            "Team #": savedSettings["Team #"] || "",
            "Competition Key": savedSettings["Competition Key"] || "",
            Alliance: savedSettings.Alliance || "",
          });
        }
      } catch (error) {
        console.error("Failed to load saved settings:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  // network status handled by `useNetworkStatus`

  const onSubmit = async (values) => {
    const submission = {
      ...values,
      submissionId: crypto.randomUUID(),
      sheet_name: "Settings",
    };

    try {
      if (isOnline) {
        await sendToServer(submission);
        setSuccessMessage("Settings saved and sent to server!");
      } else {
        await saveOffline(submission);
        setSuccessMessage("Settings saved locally. Will sync when online.");
      }
      setShowSuccess(true);
      // Auto-hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      // Handle error - could add error state here too
      throw error;
    }
  };

  const {
    formData,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm({
    initialValues,
    validate,
    onSubmit,
  });

  return (
    <div className="container mt-4">
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <h1 className="mb-4 text-center">Settings</h1>
          
          {/* Online/Offline Status Indicator */}
          <div className="row justify-content-center mb-3">
            <div className="col-lg-8">
          <div className={`alert ${isOnline ? 'alert-success' : 'alert-warning'} d-flex align-items-center`} role="alert">
            <i className={`bi ${isOnline ? 'bi-wifi' : 'bi-wifi-off'} me-2`}></i>
            <small className="mb-0">
              {isOnline ? 'Online - Data will be sent to server' : 'Offline - Data will be saved locally and synced when online'}
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
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowSuccess(false)}
                aria-label="Close"
              ></button>
            </div>
          </div>
        </div>
      )}

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
            <div className="row">
              {/* Name */}
              <div className="col-md-6 mb-3">
                <label htmlFor="name" className="form-label">
                  Name <span className="text-danger">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="Name"
                  value={formData.Name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-control ${
                    touched.Name
                      ? errors.Name
                        ? "is-invalid"
                        : "is-valid"
                      : ""
                  }`}
                  placeholder="Enter your name"
                />
                <div className="invalid-feedback">{errors.Name}</div>
              </div>

              {/* Team Number */}
              <div className="col-md-6 mb-3">
                <label htmlFor="teamNumber" className="form-label">
                  Team Number <span className="text-danger">*</span>
                </label>
                <input
                  id="teamNumber"
                  type="text"
                  name="Team #"
                  value={formData["Team #"]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-control ${
                    touched["Team #"]
                      ? errors["Team #"]
                        ? "is-invalid"
                        : "is-valid"
                      : ""
                  }`}
                  placeholder="Enter team number"
                />
                <div className="invalid-feedback">{errors["Team #"]}</div>
              </div>
            </div>

            {/* Competition Key */}
            <div className="mb-3">
              <label htmlFor="competitionKey" className="form-label">
                Competition Key <span className="text-danger">*</span>
              </label>
              <textarea
                id="competitionKey"
                name="Competition Key"
                value={formData["Competition Key"]}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-control ${
                  touched["Competition Key"]
                    ? errors["Competition Key"]
                      ? "is-invalid"
                      : "is-valid"
                    : ""
                }`}
                rows="3"
                placeholder="Enter competition key"
              />
              <div className="invalid-feedback">{errors["Competition Key"]}</div>
            </div>

            {/* Alliance */}
            <div className="mb-4">
              <label htmlFor="alliance" className="form-label">
                Alliance <span className="text-danger">*</span>
              </label>
              <select
                id="alliance"
                name="Alliance"
                value={formData.Alliance}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-select ${
                  touched.Alliance
                    ? errors.Alliance
                      ? "is-invalid"
                      : "is-valid"
                    : ""
                }`}
              >
                <option value="">Select an alliance</option>
                <option value="Red Alliance 1">Red Alliance 1</option>
                <option value="Red Alliance 2">Red Alliance 2</option>
                <option value="Red Alliance 3">Red Alliance 3</option>
                <option value="Blue Alliance 1">Blue Alliance 1</option>
                <option value="Blue Alliance 2">Blue Alliance 2</option>
                <option value="Blue Alliance 3">Blue Alliance 3</option>
                <option value="None">None</option>
              </select>
              <div className="invalid-feedback">{errors.Alliance}</div>
            </div>

            {/* Submit button */}
            <div className="d-grid">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary btn-lg"
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving Settings...
                  </>
                ) : (
                  "Save Settings"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

export default Settings;
