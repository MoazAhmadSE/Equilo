import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const validate = {
  userName: (v) => (!v.trim() ? "Full name is required" : ""),
  userMail: (v) => !v.trim() ? "Email is required" :
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Invalid email address" : "",
  userPassword: (v) => v.length < 6 ? "Password must be at least 6 characters" : "",
  confirmUserPassword: (v, all) => v !== all.userPassword ? "Passwords do not match" : "",
};

const useSignup = () => {
  const { signupWithEmailPasswordForm, loginWithGoogle } = useAuth();

  const [values, setValues] = useState({
    userName: "", userMail: "", userPassword: "", confirmUserPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const focusRef = useRef({});

  const setField = (field, val) => {
    setValues((prev) => ({ ...prev, [field]: val }));
    if (submitted) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const focusField = (field) => {
    focusRef.current[field]?.focus();
  };

  const handleSignup = async (isCaptchaValid, getToken, resetCaptcha) => {
    setSubmitted(true);
    const newErrors = {};

    for (const field in validate) {
      const error = validate[field](values[field], values);
      if (error) {
        newErrors[field] = error;
        setErrors(newErrors);
        focusField(field);
        return;
      }
    }

    if (!isCaptchaValid) {
      toast.warn("Please complete the CAPTCHA");
      return;
    }

    const token = await getToken();
    if (!token) {
      toast.warn("CAPTCHA validation failed");
      return;
    }

    setLoading(true);
    await signupWithEmailPasswordForm({
      userName: values.userName,
      userMail: values.userMail,
      userPassword: values.userPassword,
    });
    setLoading(false);
    // resetCaptcha();
  };

  return {
    values,
    setField,
    errors: submitted ? errors : {},
    loading,
    focusRef,
    handleSignup,
    handleGoogleSignup: loginWithGoogle,
  };
};

export default useSignup;
