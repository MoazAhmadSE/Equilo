import { useEffect, useState } from "react";
import { auth } from "../firebase/firebaseConfig";
import { toast } from "react-toastify";
import { applyActionCode, onAuthStateChanged } from "firebase/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import SendVerificationMail from "../firebase/SendVerificationMail";

const useEmailVerification = () => {
    const [checking, setChecking] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const oobCode = searchParams.get("oobCode");
    const mode = searchParams.get("mode");

    useEffect(() => {
        const verifyEmail = async () => {
            console.log("Verifying email with mode:", mode, "and oobCode:", oobCode);
            if (mode === "verifyEmail" && oobCode) {
                setLoading(true);
                try {
                    await applyActionCode(auth, oobCode);
                    console.log("Email verification successful.");
                    toast.success("Email verified successfully!");
                    // Wait for Firebase to sync currentUser
                    onAuthStateChanged(auth, (user) => {
                        console.log("Auth state changed, current user:", auth, user);
                        if (user) {
                            console.log("Verified user:", user.email);
                            navigate("/equilo/home");
                        } else {
                            navigate("/login");
                        }
                    });
                } catch (err) {
                    console.error("Verification failed:", err);
                    toast.error("Invalid or expired verification link.");
                    navigate("/");
                } finally {
                    setLoading(false);
                }
            }
        };

        verifyEmail();
    }, [mode, oobCode, navigate]);

    const resendVerification = async () => {
        setChecking(true);
        try {
            const user = auth.currentUser;
            if (!user) {
                onAuthStateChanged(auth, async (user) => {
                    if (user) {
                        await SendVerificationMail(user);
                        toast.info("Verification email resent.");
                    } else {
                        toast.error("No user is logged in.");
                    }
                    setChecking(false);
                });
            } else {
                await SendVerificationMail(user);
                toast.info("Verification email resent.");
            }
        } catch (err) {
            console.error("Resend Error:", err);
            toast.error(`Error resending email: ${err.message}`);
        } finally {
            setChecking(false);
        }
    };

    return { checking, resendVerification, loading };
};

export default useEmailVerification;
