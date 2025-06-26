import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const validators = {
  userName: (val) => (!val.trim() ? "Full name is required" : ""),
  userMail: (val) => {
    if (!val.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Invalid email address";
    return "";
  },
  userPassword: (val) =>
    val.length < 6 ? "Password must be at least 6 characters" : "",
  confirmUserPassword: (val, allValues) =>
    val !== allValues.userPassword ? "Passwords do not match" : "",
};


const useSignup = () => {
  const { signupWithEmailPasswordForm, loginWithGoogle } = useAuth();

  const [value, setValue] = useState({
    userName: "",
    userMail: "",
    userPassword: "",
    confirmUserPassword: "",
    loading: false,
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const focusRef = useRef({
    userName: null,
    userMail: null,
    userPassword: null,
    confirmUserPassword: null,
  });

  const focusInput = (field) => {
    focusRef.current[field]?.focus();
  };

  const fieldToErrorKey = {
    userName: "name",
    userMail: "email",
    userPassword: "password",
    confirmUserPassword: "confirmPassword",
  };

  const handleSignup = async (isCaptchaValid, getToken) => {
    setSubmitted(true);

    for (const field in validators) {
      const error = validators[field](
        value[field],
        value
      );

      if (error) {
        setErrors({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          [fieldToErrorKey[field]]: error,
        });
        focusInput(field);
        return;
      }
    }

    if (!isCaptchaValid) {
      toast.warn("Please complete the CAPTCHA");
      return;
    }

    const token = await getToken();
    if (!token) {
      toast.warn("CAPTCHA validation failed.");
      return;
    }

    setErrors({ name: "", email: "", password: "", confirmPassword: "" });
    setValue((prev) => ({ ...prev, loading: true }));

    await signupWithEmailPasswordForm({
      userName: value.userName,
      userMail: value.userMail,
      userPassword: value.userPassword,
    });

    setValue((prev) => ({ ...prev, loading: false }));
  };

  return {
    name: value.userName,
    email: value.userMail,
    password: value.userPassword,
    confirmPassword: value.confirmUserPassword,
    errors: {
      name: submitted ? errors.name : "",
      email: submitted ? errors.email : "",
      password: submitted ? errors.password : "",
      confirmPassword: submitted ? errors.confirmPassword : "",
    },
    loading: value.loading,
    setName: (val) => {
      setValue((prev) => ({ ...prev, userName: val }));
      if (submitted) setErrors((prev) => ({ ...prev, name: "" }));
    },
    setEmail: (val) => {
      setValue((prev) => ({ ...prev, userMail: val }));
      if (submitted) setErrors((prev) => ({ ...prev, email: "" }));
    },
    setPassword: (val) => {
      setValue((prev) => ({ ...prev, userPassword: val }));
      if (submitted) setErrors((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    },
    setConfirmPassword: (val) => {
      setValue((prev) => ({ ...prev, confirmUserPassword: val }));
      if (submitted) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    },
    handleSignup,
    focusRef,
    handleGoogleSignup: loginWithGoogle,
  };
};

export default useSignup;
