import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";
import { useAuth } from "../context/AuthProvider";

const useSignup = () => {
  const navigate = useNavigate();
  const { signupWithEmailPassword, loginWithGoogle } = useAuth(); // ✅ get from context

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (name.trim() === "") {
      newErrors.name = "Full name is required";
    }
    if (email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (password.trim() === "") {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (confirmPassword.trim() === "") {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };

  const handleSignup = async (isCaptchaValid, getToken, resetCaptcha) => {
    setErrors({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    if (!validate()) return;

    if (!isCaptchaValid) {
      toast.warn("Please complete the CAPTCHA.");
      return;
    }

    const token = await getToken();
    if (!token) {
      toast.warn("CAPTCHA validation failed.");
      return;
    }

    setLoading(true);
    try {
      await signupWithEmailPassword({
        userName: name,
        userMail: email,
        userPassword: password,
      });
      navigate("/verifyemail");
    } catch (err) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
      resetCaptcha?.();
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    const user = await loginWithGoogle();
    if (user) {
      navigate("/home");
    }
  };

  return {
    name,
    email,
    password,
    confirmPassword,
    errors,
    loading,
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleSignup,
    handleGoogleSignup,
  };
};

export default useSignup;
