import { useState } from "react";
import { toast } from "react-toastify";

const useSignin = () => {
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [isEmpty, setIsEmpty] = useState(false);
    const [isPasswordEmpty, setIsPasswordEmpty] = useState(false);
    const [signinError, setSignInError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleForgetPassword = (resetPassword) => {
        if (!userEmail.trim()) {
            toast.error("Please enter your email address.");
            setIsEmpty(true);
            return;
        }
        resetPassword(userEmail.trim());
    };

    const handleLogin = async (
        isCaptchaValid,
        getToken,
        loginWithEmailPassword,
        // resetCaptcha
    ) => {
        const email = userEmail.trim();
        const password = userPassword;

        // Validate inputs
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

        setLoading(true);

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
            // Optionally reset captcha here
            // resetCaptcha?.();
            setLoading(false);
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
        setLoading,
        handleForgetPassword,
        handleLogin,
    };
}

export default useSignin;
