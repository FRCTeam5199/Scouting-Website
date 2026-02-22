import { useState, useEffect } from "react";



export default function useForm({
  initialValues,
  validate,
  onSubmit,
}) {

    // Keep track of what is typed in the form
    const [formData, setFormData] = useState(initialValues);

    // Track which fields have been touched and any errors (used for error validators)
    const [errors, setErrors] = useState({});

    // Track whether the user has interacted with the form
    const [touched, setTouched] = useState({});

    // Indicate if the form is currently being submitted
    const [isSubmitting, setIsSubmitting] = useState(false);



  // Update formData when the user types in the form
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const newValue = type === "checkbox" ? checked : value;

    const updated = {
      ...formData,
      [name]: newValue,
    };

    setFormData(updated);

    // Validate field live if already touched
    if (touched[name]) {
      const validationErrors = validate(updated);
      setErrors(validationErrors);
    }
  };


  // Mark a field as "touched" when the user interacts with it
  const handleBlur = (e) => {
    const { name } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const validationErrors = validate(formData);
    setErrors(validationErrors);
  };


  // Handle form submission, including validation and calling the onSubmit callback
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    // Mark all fields as touched
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
    } catch (error) {
      console.error("Submit failed:", error);
    }

    setIsSubmitting(false);
  };


  // You know what this does I hope
  const resetForm = () => {
    setFormData(initialValues);
    setErrors({});
    setTouched({});
  };



  // Autofill detection
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
