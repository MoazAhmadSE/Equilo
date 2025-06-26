import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const useLogin = () => {
    const navigate = useNavigate();
    const redirect = new URLSearchParams(location.search);

    const { loginWithEmailPasswordForm, loginWithGoogle } = useAuth();

    const [value, setValue] = useState({
        email: "",
        password: "",
        loading: false,
    });

    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const focusRef = useRef({
        email: null,
        password: null,
    });

    const focusInput = (field) => {
        focusRef.current[field]?.focus();
    };

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
            const error = validators[field](value[field], value);
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

        const isValid = validateFields();
        if (!isValid) return;

        if (!isCaptchaValid) {
            toast.warn("Please complete the CAPTCHA");
            return;
        }

        const token = await getToken();
        if (!token) {
            toast.warn("CAPTCHA validation failed");
            return;
        }

        setValue((prev) => ({ ...prev, loading: true }));

        try {
            await loginWithEmailPasswordForm(value.email, value.password);
            navigate("/equilo/home");
        } catch (err) {
            console.error(err);
            toast.error("Login failed. Please try again.");
            resetCaptcha?.();
        } finally {
            setValue((prev) => ({ ...prev, loading: false }));
        }
    };

    const handleForgetPassword = (resetPassword) => () => {
        setSubmitted(true);

        const emailError = validators.email(value.email);
        if (emailError) {
            setErrors({ email: emailError });
            focusInput("email");
            return;
        }

        resetPassword(value.email);
    };

    return {
        email: value.email,
        password: value.password,
        loading: value.loading,
        errors: {
            email: submitted ? errors.email || "" : "",
            password: submitted ? errors.password || "" : "",
        },
        setEmail: (email) => {
            setValue((prev) => ({ ...prev, email }));
            if (submitted) setErrors((prev) => ({ ...prev, email: "" }));
        },
        setPassword: (password) => {
            setValue((prev) => ({ ...prev, password }));
            if (submitted) setErrors((prev) => ({ ...prev, password: "" }));
        },
        handleLogin,
        focusRef,
        handleGoogleLogin: loginWithGoogle,
        handleForgetPassword,
    };
};

export default useLogin;
