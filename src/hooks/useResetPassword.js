import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset, checkActionCode } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { toast } from "react-toastify";

export const useResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [state, setState] = useState({
        email: "",
        newPassword: "",
        confirmPassword: "",
        error: "",
        isPasswordEmpty: false,
        validPassword: true,
        isConfirmPasswordEmpty: false,
        passwordDidMatch: true,
        isLoading: false,
    });

    const validations = {
        isPasswordEmpty: !!state.newPassword,
        validPassword: state.newPassword.length >= 6,
        isConfirmPasswordEmpty: !!state.confirmPassword,
        passwordDidMatch: state.newPassword === state.confirmPassword,
    };

    const oobCode = searchParams.get("oobCode");

    useEffect(() => {
        if (oobCode) {
            checkActionCode(auth, oobCode)
                .then((info) => {
                    const emailFromCode = info?.data?.email || info?.email || "";
                    setState((prev) => ({ ...prev, email: emailFromCode }));
                })
                .catch(() =>
                    setState((prev) => ({
                        ...prev,
                        error: "Invalid-or-missing-reset-code",
                    }))
                );
        } else {
            setState((prev) => ({ ...prev, error: "No reset code found." }));
        }
    }, [oobCode]);

    const handleSubmit = async () => {

        setState((prev) => ({ ...prev, ...validations }));

        if (Object.values(validations).includes(false)) return;


        try {
            setState((prev) => ({ ...prev, isLoading: true }));
            await confirmPasswordReset(auth, oobCode, state.newPassword);
            toast.success("Password reset successfully!");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            setState((prev) => ({
                ...prev,
                error: err.message || "Something went wrong.",
            }));
        } finally {
            setState((prev) => ({ ...prev, isLoading: false }));
        }
    };

    return {
        ...state,
        setNewPassword: (value) =>
            setState((prev) => ({ ...prev, newPassword: value })),
        setConfirmPassword: (value) =>
            setState((prev) => ({ ...prev, confirmPassword: value })),
        handleSubmit,
    };
};
