// import { useState, useEffect, useRef } from "react";



// export default function useForm({
//   initialValues = {},
//   validate = () => ({}),
//   onSubmit = async () => {},
// }) {

//     // Keep track of what is typed in the form
//     const [formData, setFormData] = useState(initialValues);

//     // Track which fields have been touched and any errors (used for error validators)
//     const [errors, setErrors] = useState({});

//     // Track whether the user has interacted with the form
//     const [touched, setTouched] = useState({});

//     // Indicate if the form is currently being submitted
//     const [isSubmitting, setIsSubmitting] = useState(false);



//   // Update formData when the user types in the form
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     const newValue = type === "checkbox" ? checked : value;

//     const updated = {
//       ...formData,
//       [name]: newValue,
//     };

//     setFormData(updated);

//     // Validate field live if already touched
//     if (touched[name]) {
//       const validationErrors = validate(updated);
//       setErrors(validationErrors);
//     }
//   };


//   // Mark a field as "touched" when the user interacts with it
//   const handleBlur = (e) => {
//     const { name } = e.target;

//     setTouched((prev) => ({
//       ...prev,
//       [name]: true,
//     }));

//     const validationErrors = validate(formData);
//     setErrors(validationErrors);
//   };


//   // Handle form submission, including validation and calling the onSubmit callback
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const validationErrors = validate(formData);
//     setErrors(validationErrors);

//     // Mark all fields as touched
//     const allTouched = {};
//     Object.keys(formData).forEach((key) => {
//       allTouched[key] = true;
//     });
//     setTouched(allTouched);

//     if (Object.keys(validationErrors).length > 0) {
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       await onSubmit(formData);
//     } catch (error) {
//       console.error("Submit failed:", error);
//     }

//     setIsSubmitting(false);
//   };


//   // You know what this does I hope
//   const resetForm = () => {
//     setFormData(initialValues);
//     setErrors({});
//     setTouched({});
//   };

//   // Keep formData in sync when initialValues change externally
//   const initialRef = useRef(initialValues);
//   useEffect(() => {
//     const prev = initialRef.current;
//     // shallow compare via JSON stringify (sufficient for plain objects used in forms)
//     try {
//       if (JSON.stringify(prev) !== JSON.stringify(initialValues)) {
//         setFormData(initialValues);
//         setErrors({});
//         setTouched({});
//         initialRef.current = initialValues;
//       }
//     } catch (e) {
//       // fallback: always sync if stringify fails
//       setFormData(initialValues);
//       initialRef.current = initialValues;
//     }
//   }, [initialValues]);



//   // Autofill detection
//   // Try to pick up browser autofill or external changes to inputs
//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       const inputs = document.querySelectorAll(
//         "input[name], textarea[name], select[name]"
//       );

//       inputs.forEach((input) => {
//         const { name, value } = input;

//         if (name && value && formData[name] !== value) {
//           setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//           }));
//         }
//       });
//     }, 300);

//     return () => clearTimeout(timeout);
//   }, [/* intentionally not depending on formData to avoid tight loop */]);

  
//   return {
//     formData,
//     errors,
//     touched,
//     isSubmitting,
//     handleChange,
//     handleBlur,
//     handleSubmit,
//     resetForm,
//   };
// }

import { useState, useEffect, useRef } from "react";

export default function useForm({
  initialValues = {},
  validate = () => ({}),
  onSubmit = async () => {},
  storageKey = null, // set to string to enable per-form localStorage drafts
}) {

  // Safely load saved draft (only if storageKey provided)
  const loadDraft = () => {
    if (!storageKey) return initialValues;
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return initialValues;
      return JSON.parse(saved);
    } catch (err) {
      console.warn("Failed to load saved form draft:", err);
      return initialValues;
    }
  };

  // Form state
  const [formData, setFormData] = useState(loadDraft);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveTimeout = useRef(null);

  /*
  ========================================
  AUTOSAVE FORM DATA (DEBOUNCED)
  ========================================
  */
  useEffect(() => {
    if (!storageKey) return; // no persistence requested
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(formData));
      } catch (err) {
        console.warn("Failed to save form draft:", err);
      }
    }, 500); // save after 500ms of inactivity

    return () => clearTimeout(saveTimeout.current);
  }, [formData, storageKey]);



  /*
  ========================================
  HANDLE FIELD CHANGE
  ========================================
  */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const newValue = type === "checkbox" ? checked : value;

    const updated = {
      ...formData,
      [name]: newValue,
    };

    setFormData(updated);

    if (touched[name]) {
      const validationErrors = validate(updated);
      setErrors(validationErrors);
    }
  };



  /*
  ========================================
  HANDLE FIELD BLUR
  ========================================
  */
  const handleBlur = (e) => {
    const { name } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const validationErrors = validate(formData);
    setErrors(validationErrors);
  };



  /*
  ========================================
  HANDLE FORM SUBMIT
  ========================================
  */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    const allTouched = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);

      // Clear saved draft on successful submit
      if (storageKey) localStorage.removeItem(storageKey);

    } catch (error) {
      console.error("Submit failed:", error);
    }

    setIsSubmitting(false);
  };



  /*
  ========================================
  RESET FORM
  ========================================
  */
  const resetForm = () => {
    setFormData(initialValues);
    setErrors({});
    setTouched({});
    if (storageKey) localStorage.removeItem(storageKey);
  };



  /*
  ========================================
  SYNC FORM WHEN initialValues CHANGE
  ========================================
  */
  const initialRef = useRef(initialValues);

  useEffect(() => {
    const prev = initialRef.current;

    try {
      if (JSON.stringify(prev) !== JSON.stringify(initialValues)) {
        setFormData(initialValues);
        setErrors({});
        setTouched({});
        initialRef.current = initialValues;
      }
    } catch (e) {
      setFormData(initialValues);
      initialRef.current = initialValues;
    }
  }, [initialValues]);



  /*
  ========================================
  AUTOFILL DETECTION
  ========================================
  */
  useEffect(() => {
    const timeout = setTimeout(() => {
      const inputs = document.querySelectorAll(
        "input[name], textarea[name], select[name]"
      );

      inputs.forEach((input) => {
        const { name, value } = input;

        if (name && value && formData[name] !== value) {
          setFormData((prev) => ({
            ...prev,
            [name]: value,
          }));
        }
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, []);



  return {
    formData,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  };
}