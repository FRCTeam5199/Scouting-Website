import { useState } from "react";
import { saveOffline, sendToServer } from "../sync";

function Settings() {
  const [formData, setFormData] = useState({
    Name: "",
    "Team #": "",
    "Competition Key": "",
    Alliance: "",
  });

  const [validated, setValidated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFieldValid = (value) => value.trim() !== "";

  const handleSubmit = async (event) => {
    event.preventDefault();

    const allValid =
      isFieldValid(formData.Name) &&
      isFieldValid(formData["Team #"]) &&
      isFieldValid(formData["Competition Key"]) &&
      isFieldValid(formData.Alliance);

    if (!allValid) {
      setValidated(true);
      return;
    }

    const submission = {
      ...formData,
      submissionId: crypto.randomUUID(),
      sheet_name: "Settings",
    };

    try {
      if (navigator.onLine) {
        await sendToServer(submission);
      } else {
        await saveOffline(submission);
      }

      setShowAlert(true);

      // Reset form
      setFormData({
        Name: "",
        "Team #": "",
        "Competition Key": "",
        Alliance: "",
      });

      setValidated(false);

    } catch (error) {
      await saveOffline(submission);
      setShowAlert(true);
    }
  };

  return (
    <div>
      <h1>Settings Page</h1>

      {showAlert && (
        <div className="alert alert-success alert-dismissible" role="alert">
          Settings saved successfully!
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowAlert(false)}
          ></button>
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* Name */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            name="Name"
            value={formData.Name}
            onChange={handleChange}
            className={`form-control ${
              validated
                ? isFieldValid(formData.Name)
                  ? "is-valid"
                  : "is-invalid"
                : ""
            }`}
          />
          <div className="invalid-feedback">Required</div>
        </div>

        {/* Team Number */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Team Number</label>
          <input
            type="text"
            name="Team #"
            value={formData["Team #"]}
            onChange={handleChange}
            className={`form-control ${
              validated
                ? isFieldValid(formData["Team #"])
                  ? "is-valid"
                  : "is-invalid"
                : ""
            }`}
          />
          <div className="invalid-feedback">Required</div>
        </div>

        {/* Competition Key */}
        <div className="mb-3">
          <label className="form-label">Competition Key</label>
          <textarea
            name="Competition Key"
            value={formData["Competition Key"]}
            onChange={handleChange}
            className={`form-control ${
              validated
                ? isFieldValid(formData["Competition Key"])
                  ? "is-valid"
                  : "is-invalid"
                : ""
            }`}
          />
          <div className="invalid-feedback">Required</div>
        </div>

        {/* Alliance */}
        <div className="mb-3">
          <label className="form-label">Alliance</label>
          <select
            name="Alliance"
            value={formData.Alliance}
            onChange={handleChange}
            className={`form-select ${
              validated
                ? isFieldValid(formData.Alliance)
                  ? "is-valid"
                  : "is-invalid"
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
          <div className="invalid-feedback">Required</div>
        </div>

        <button type="submit" className="btn btn-primary">
          Save Settings
        </button>

      </form>
    </div>
  );
}

export default Settings;
