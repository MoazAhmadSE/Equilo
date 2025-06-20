import { useState } from "react";
import { toast } from "react-toastify";
// import { EmailPasswordProvider } from "../components/firebaseServices/EmailPasswordProvider";

const useSignup = () => {
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

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validate = () => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    // Full Name
    if (name.trim() === "") {
      newErrors.name = "Full name is required";
    }

    // Email
    else if (email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(email)) {
      newErrors.email = "Invalid email format";
    }

    // Password
    else if (password.trim() === "") {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm Password
    else if (confirmPassword.trim() === "") {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    // Check if any error exists
    return Object.values(newErrors).every((err) => err === "");
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
      toast.warn("Please complete the Captcha");
      return;
    }

    const token = await getToken();
    if (!token) {
      toast.warn("Captcha validation failed");
      return;
    }

    setLoading(true);
    try {
      await EmailPasswordProvider({
        userName: name,
        userMail: email,
        userPassword: password,
        setLoading,
      });
    } catch (err) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
      resetCaptcha();
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
  };
};

export default useSignup;
