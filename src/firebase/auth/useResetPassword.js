import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";

export const useResetPassword = () => {
    const [error, setError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const resetPassword = async (email) => {
        const resetPage = "reset-password";
        const actionCodeSettings = {
            url: `http://localhost:5173/${resetPage}`,
            handleCodeInApp: true,
        };

        try {
            await sendPasswordResetEmail(auth, email, actionCodeSettings);
            setIsSuccess(true);
            setError(null);
        } catch (error) {
            setError(error.code);
            setIsSuccess(false);
        }
    };

    return { resetPassword, error, isSuccess };
};
