// import { useState } from "react";
// import { saveOffline, sendToServer } from "../sync";

// function Settings() {
//   const [formData, setFormData] = useState({
//     Name: "",
//     "Team #": "",
//     "Competition Key": "",
//     Alliance: "",
//   });

//   const [validated, setValidated] = useState(false);
//   const [showAlert, setShowAlert] = useState(false);

//   // Handle input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const isFieldValid = (value) => value.trim() !== "";

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     const allValid =
//       isFieldValid(formData.Name) &&
//       isFieldValid(formData["Team #"]) &&
//       isFieldValid(formData["Competition Key"]) &&
//       isFieldValid(formData.Alliance);

//     if (!allValid) {
//       setValidated(true);
//       return;
//     }

//     const submission = {
//       ...formData,
//       submissionId: crypto.randomUUID(),
//       sheet_name: "Settings",
//     };

//     try {
//       if (navigator.onLine) {
//         await sendToServer(submission);
//       } else {
//         await saveOffline(submission);
//       }

//       setShowAlert(true);

//       // Reset form
//       setFormData({
//         Name: "",
//         "Team #": "",
//         "Competition Key": "",
//         Alliance: "",
//       });

//       setValidated(false);

//     } catch (error) {
//       await saveOffline(submission);
//       setShowAlert(true);
//     }
//   };

//   return (
//     <div>
//       <h1>Settings Page</h1>

//       {showAlert && (
//         <div className="alert alert-success alert-dismissible" role="alert">
//           Settings saved successfully!
//           <button
//             type="button"
//             className="btn-close"
//             onClick={() => setShowAlert(false)}
//           ></button>
//         </div>
//       )}

//       <form onSubmit={handleSubmit}>

//         {/* Name */}
//         <div className="col-md-6 mb-3">
//           <label className="form-label">Name</label>
//           <input
//             type="text"
//             name="Name"
//             value={formData.Name}
//             onChange={handleChange}
//             className={`form-control ${
//               validated
//                 ? isFieldValid(formData.Name)
//                   ? "is-valid"
//                   : "is-invalid"
//                 : ""
//             }`}
//           />
//           <div className="invalid-feedback">Required</div>
//         </div>

//         {/* Team Number */}
//         <div className="col-md-6 mb-3">
//           <label className="form-label">Team Number</label>
//           <input
//             type="text"
//             name="Team #"
//             value={formData["Team #"]}
//             onChange={handleChange}
//             className={`form-control ${
//               validated
//                 ? isFieldValid(formData["Team #"])
//                   ? "is-valid"
//                   : "is-invalid"
//                 : ""
//             }`}
//           />
//           <div className="invalid-feedback">Required</div>
//         </div>

//         {/* Competition Key */}
//         <div className="mb-3">
//           <label className="form-label">Competition Key</label>
//           <textarea
//             name="Competition Key"
//             value={formData["Competition Key"]}
//             onChange={handleChange}
//             className={`form-control ${
//               validated
//                 ? isFieldValid(formData["Competition Key"])
//                   ? "is-valid"
//                   : "is-invalid"
//                 : ""
//             }`}
//           />
//           <div className="invalid-feedback">Required</div>
//         </div>

//         {/* Alliance */}
//         <div className="mb-3">
//           <label className="form-label">Alliance</label>
//           <select
//             name="Alliance"
//             value={formData.Alliance}
//             onChange={handleChange}
//             className={`form-select ${
//               validated
//                 ? isFieldValid(formData.Alliance)
//                   ? "is-valid"
//                   : "is-invalid"
//                 : ""
//             }`}
//           >
//             <option value="">Select an alliance</option>
//             <option value="Red Alliance 1">Red Alliance 1</option>
//             <option value="Red Alliance 2">Red Alliance 2</option>
//             <option value="Red Alliance 3">Red Alliance 3</option>
//             <option value="Blue Alliance 1">Blue Alliance 1</option>
//             <option value="Blue Alliance 2">Blue Alliance 2</option>
//             <option value="Blue Alliance 3">Blue Alliance 3</option>
//             <option value="None">None</option>
//           </select>
//           <div className="invalid-feedback">Required</div>
//         </div>

//         <button type="submit" className="btn btn-primary">
//           Save Settings
//         </button>

//       </form>
//     </div>
//   );
// }

// export default Settings;






import useForm from "../hooks/useForm";
import { saveOffline, sendToServer } from "../sync";
import { useState } from "react";

const initialValues = {
  Name: "",
  "Team #": "",
  "Competition Key": "",
  Alliance: "",
};

function validate(values) {
  const errors = {};

  if (!values.Name.trim()) errors.Name = "Required";
  if (!values["Team #"].trim()) errors["Team #"] = "Required";
  if (!values["Competition Key"].trim()) errors["Competition Key"] = "Required";
  if (!values.Alliance) errors.Alliance = "Required";

  return errors;
}

function Settings() {
  const [showSuccess, setShowSuccess] = useState(false);

  const onSubmit = async (values) => {
    const submission = {
      ...values,
      submissionId: crypto.randomUUID(),
      sheet_name: "Settings",
    };

    try {
      if (navigator.onLine) {
        await sendToServer(submission);
      } else {
        await saveOffline(submission);
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
      <h1 className="mb-4 text-center">Settings</h1>

      {showSuccess && (
        <div className="row justify-content-center mb-3">
          <div className="col-lg-8">
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>
              Settings saved successfully!
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
    </div>
  );
}

export default Settings;
