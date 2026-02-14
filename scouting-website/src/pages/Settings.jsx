import { useState } from "react";

function Settings() {
  const [validated, setValidated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      setShowAlert(true);
    }

    setValidated(true);
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

      <form
        className={`row g-3 needs-validation ${
          validated ? "was-validated" : ""
        }`}
        noValidate
        onSubmit={handleSubmit}
      >
        {/* Name */}
        <div className="col-md-4">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Name"
            required
          />
          <div className="invalid-feedback">Required</div>
        </div>

        {/* Team Number */}
        <div className="col-md-4">
          <label className="form-label">Team Number</label>
          <input
            type="text"
            className="form-control"
            placeholder="Team Number"
            required
          />
          <div className="invalid-feedback">Required</div>
        </div>

        {/* Competition Key */}
        <div className="mb-3">
          <label className="form-label">Competition Key</label>
          <textarea
            className="form-control"
            placeholder="Competition key"
            required
          ></textarea>
          <div className="invalid-feedback">Required</div>
        </div>

        {/* Alliance */}
        <div>
          <p>
            What alliance are you scouting? (Click none if you are pit scouting)
          </p>
          <select className="form-select" required>
            <option value="">Select an alliance</option>
            <option value="1">Red Alliance 1</option>
            <option value="2">Red Alliance 2</option>
            <option value="3">Red Alliance 3</option>
            <option value="4">Blue Alliance 1</option>
            <option value="5">Blue Alliance 2</option>
            <option value="6">Blue Alliance 3</option>
            <option value="7">None</option>
          </select>
          <div className="invalid-feedback">Required</div>
        </div>

        {/* Submit */}
        <div>
          <button type="submit" className="btn btn-primary">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;
