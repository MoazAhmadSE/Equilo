import { toast } from "react-toastify";
import { useState } from "react";
import { useAuth } from "../context/AuthProvider";

const useLogin = () => {
    const {
        loginWithEmailPassword,
        loginWithGoogle,
        loading,
        // logoutUser,
    } = useAuth();

    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [isEmpty, setIsEmpty] = useState(false);
    const [isPasswordEmpty, setIsPasswordEmpty] = useState(false);
    const [signinError, setSignInError] = useState(false);
    // const [loading, setLoading] = useState(false);

    const handleForgetPassword = async (resetPassword) => {
        const email = userEmail.trim();

        if (!email) {
            toast.error("Please enter your email address.");
            setIsEmpty(true);
            return;
        }

        try {
            await resetPassword(email);
            toast.success("Password reset link sent.");
        } catch (error) {
            toast.error("Failed to send reset link.");
        }
    };

    const handleLogin = async (isCaptchaValid, getToken) => {
        const email = userEmail.trim();
        const password = userPassword;

        setIsEmpty(false);
        setIsPasswordEmpty(false);
        setSignInError(false);

        if (!email) {
            setIsEmpty(true);
            return;
        }
        if (!password) {
            setIsPasswordEmpty(true);
            return;
        }

        const captchaToken = await getToken?.();
        if (!isCaptchaValid || !captchaToken) {
            toast.error("Please verify you're not a robot.");
            return;
        }

        // setLoading(true);
        try {
            await loginWithEmailPassword(email, password);
        } catch (error) {
            console.error("Login Error:", error);

            if (error.code === "auth/too-many-requests") {
                toast.error("Too many login attempts. Try again later.");
            } else if (error.code === "auth/invalid-credential") {
                setSignInError(true);
            } else {
                toast.error("Login failed. Please try again.");
            }
        } finally {
            // setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        // setLoading(true);
        try {
            await loginWithGoogle();
        } catch (error) {
            toast.error("Google login failed.");
        } finally {
            // setLoading(false);
        }
    };

    return {
        userEmail,
        userPassword,
        isEmpty,
        isPasswordEmpty,
        signinError,
        loading,
        setUserEmail,
        setUserPassword,
        setIsEmpty,
        setIsPasswordEmpty,
        setSignInError,
        // setLoading,
        handleForgetPassword,
        handleLogin,
        handleGoogleLogin,
    };
};

export default useLogin;
