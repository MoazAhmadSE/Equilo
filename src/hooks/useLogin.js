import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const useLogin = () => {

    const navigate = useNavigate();
    const redirect = new URLSearchParams(location.search).get("redirect");
    navigate(redirect || "/equilo/home");


    const { loginWithEmailPasswordForm, loginWithGoogle } = useAuth();


    const [value, setValue] = useState({
        userMail: "",
        userPassword: "",
        loading: false,
    });

    const [errors, setErrors] = useState({
        email: "",
        password: "",
    });

    const [submitted, setSubmitted] = useState(false);

    const focusRef = useRef({
        userMail: null,
        userPassword: null,
    });

    const focusInput = (field) => {
        focusRef.current[field]?.focus();
    };

    const validateEmail = (email) => {
        if (!email.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";
        return "";
    };

    const validatePassword = (password) => {
        if (!password.trim()) return "Password is required";
        if (password.length < 6) return "Password must be at least 6 characters";
        return "";
    };

    const handleLogin = async (isCaptchaValid, getToken, resetCaptcha) => {
        if (!submitted) setSubmitted(true); // only once

        const emailError = validateEmail(value.userMail);
        const passwordError = validatePassword(value.userPassword);

        if (emailError || passwordError) {
            setErrors({ email: emailError, password: passwordError });
            focusInput(emailError ? "userMail" : "userPassword");
            return;
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

        setErrors({ email: "", password: "" });
        setValue((prev) => ({ ...prev, loading: true }));

        try {
            await loginWithEmailPasswordForm(value.userMail, value.userPassword);
        } catch (err) {
            console.error(err);
            toast.error("Login failed. Please try again.");
            resetCaptcha?.();
        } finally {
            setValue((prev) => ({ ...prev, loading: false }));
        }
    };


    const handleForgetPassword = (resetPassword) => () => {
        setSubmitted(true); // ✅ This line is needed

        const emailError = validateEmail(value.userMail);

        if (emailError) {
            setErrors({ email: emailError, password: "" });
            focusInput("userMail");
            return;
        }

        resetPassword(value.userMail);
    };


    return {
        email: value.userMail,
        password: value.userPassword,
        loading: value.loading,
        errors: {
            email: submitted ? errors.email : "",
            password: submitted ? errors.password : "",
        },
        setEmail: (val) => {
            setValue((prev) => ({ ...prev, userMail: val }));
            if (submitted) setErrors((prev) => ({ ...prev, email: "" }));
        },
        setPassword: (val) => {
            setValue((prev) => ({ ...prev, userPassword: val }));
            if (submitted) setErrors((prev) => ({ ...prev, password: "" }));
        },
        handleLogin,
        focusRef,
        handleGoogleLogin: loginWithGoogle,
        handleForgetPassword
    };
};

export default useLogin;
