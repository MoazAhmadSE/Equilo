import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset, checkActionCode } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { toast } from "react-toastify";

export const useResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const [isPasswordEmpty, setIsPasswordEmpty] = useState(false);
    const [validPassword, setValidPassword] = useState(true);
    const [isConfirmPasswordEmpty, setIsConfirmPasswordEmpty] = useState(false);
    const [passwordDidMatch, setPasswordDidMatch] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const oobCode = searchParams.get("oobCode");

    useEffect(() => {
        if (oobCode) {
            checkActionCode(auth, oobCode)
                .then((info) => {
                    const emailFromCode = info?.data?.email || info?.email || "";
                    setEmail(emailFromCode);
                })
                .catch(() => setError("Invalid-or-missing-reset-code"));
        } else {
            setError("No reset code found.");
        }
    }, [oobCode]);

    const handleSubmit = async () => {
        setIsPasswordEmpty(false);
        setValidPassword(true);
        setIsConfirmPasswordEmpty(false);
        setPasswordDidMatch(true);

        let hasError = false;

        if (!newPassword) {
            setIsPasswordEmpty(true);
            hasError = true;
        }

        if (newPassword.length < 6) {
            setValidPassword(false);
            hasError = true;
        }

        if (!confirmPassword) {
            setIsConfirmPasswordEmpty(true);
            hasError = true;
        }

        if (newPassword !== confirmPassword) {
            setPasswordDidMatch(false);
            hasError = true;
        }

        if (hasError) return;

        try {
            setIsLoading(true);
            await confirmPasswordReset(auth, oobCode, newPassword);
            toast.success("Password reset successfully!");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        email,
        newPassword,
        confirmPassword,
        error,
        isPasswordEmpty,
        validPassword,
        isConfirmPasswordEmpty,
        passwordDidMatch,
        isLoading,
        setNewPassword,
        setConfirmPassword,
        handleSubmit,
    };
};
