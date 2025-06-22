import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const useSignup = () => {
  const { signupWithEmailPasswordForm, loginWithGoogle } = useAuth();

  const [value, setValue] = useState({
    userName: "Moaz 00",
    userMail: "",
    userPassword: "123456",
    confirmUserPassword: "123456",
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

  const validateName = (name) => {
    if (!name.trim()) return "Full name is required";
    return "";
  };

  const validateEmail = (email) => {
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const validateConfirmPassword = (password, confirm) => {
    if (password !== confirm) return "Passwords do not match";
    return "";
  };

  const handleSignup = async (isCaptchaValid, getToken, resetCaptcha) => {
    setSubmitted(true);

    const nameError = validateName(value.userName);
    if (nameError) {
      setErrors({ name: nameError, email: "", password: "", confirmPassword: "" });
      focusInput("userName");
      return;
    }

    const emailError = validateEmail(value.userMail);
    if (emailError) {
      setErrors({ name: "", email: emailError, password: "", confirmPassword: "" });
      focusInput("userMail");
      return;
    }

    const passwordError = validatePassword(value.userPassword);
    if (passwordError) {
      setErrors({ name: "", email: "", password: passwordError, confirmPassword: "" });
      focusInput("userPassword");
      return;
    }

    const confirmError = validateConfirmPassword(value.userPassword, value.confirmUserPassword);
    if (confirmError) {
      setErrors({ name: "", email: "", password: "", confirmPassword: confirmError });
      focusInput("confirmUserPassword");
      return;
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
    // resetCaptcha?.();
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
      if (submitted) {
        setErrors((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }));
      }
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
