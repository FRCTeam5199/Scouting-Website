import { useState } from "react";
import { sendData } from "../api/sheets";
import { saveOffline, sendToServer } from "../sync";



// Handles form submission and saving data offline if the user is not connected to the internet
async function handleSubmitData(formData) {
  if (navigator.onLine) {
    try {
      await sendToServer(formData, "match");
    } catch (error) {
      await saveOffline(formData, "match");
    }
  } else {
    await saveOffline(formData, "match");
  }
}



function Settings() {
  const [validated, setValidated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Shows validator when the form is submitted successfully.
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      await sendData(form);
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
        id = "settings-form"
      >
        {/* Name */}
        <div className="col-md-4">
          <label className="form-label">Name</label>
          <input
            type="text"
            name = "Name"
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
            name = "Team #"
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
            name = "Competition Key"
            placeholder="competition key"
            required
          ></textarea>
          <div className="invalid-feedback">Required</div>
        </div>

        {/* Alliance */}
        <div>
          <p>
            What alliance are you scouting? (Click none if you are pit scouting)
          </p>
          <select className="form-select" name = "Alliance" required>
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

        {/* Submit */}
        <div>
          <button type="submit" name = "submit button" className="btn btn-primary">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;
