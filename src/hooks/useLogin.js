import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const useLogin = () => {
    const navigate = useNavigate();
    const { loginWithEmailPasswordForm, loginWithGoogle } = useAuth();

    const [values, setValues] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const focusRef = useRef({ email: null, password: null });

    const setField = (field, value) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        if (submitted) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const focusInput = (field) => focusRef.current[field]?.focus();

    const validators = {
        email: (email) => {
            if (!email.trim()) return "Email is required";
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";
            return "";
        },
        password: (password) => {
            if (!password.trim()) return "Password is required";
            if (password.length < 6) return "Password must be at least 6 characters";
            return "";
        },
    };

    const validateFields = () => {
        for (const field in validators) {
            const error = validators[field](values[field]);
            if (error) {
                setErrors({ [field]: error });
                focusInput(field);
                return false;
            }
        }
        setErrors({});
        return true;
    };

    const handleLogin = async (isCaptchaValid, getToken, resetCaptcha) => {
        if (!submitted) setSubmitted(true);
        if (!validateFields()) return;

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
        try {
            await loginWithEmailPasswordForm(values.email, values.password);
            navigate("/equilo/home");
        } catch (err) {
            console.error(err);
            toast.error("Login failed. Please try again.");
            resetCaptcha?.();
        } finally {
            setLoading(false);
        }
    };

    const handleForgetPassword = (resetPassword) => () => {
        setSubmitted(true);
        const emailError = validators.email(values.email);
        if (emailError) {
            setErrors({ email: emailError });
            focusInput("email");
            return;
        }
        resetPassword(values.email);
    };

    return {
        email: values.email,
        password: values.password,
        loading,
        errors: {
            email: submitted ? errors.email || "" : "",
            password: submitted ? errors.password || "" : "",
        },
        setEmail: (email) => setField("email", email),
        setPassword: (password) => setField("password", password),
        handleLogin,
        focusRef,
        handleGoogleLogin: loginWithGoogle,
        handleForgetPassword,
    };
};

export default useLogin;
