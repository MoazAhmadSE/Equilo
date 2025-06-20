import { useEffect, useState } from "react";
import { auth } from "../firebase/firebaseConfig";
import { toast } from "react-toastify";
import { applyActionCode, signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import SendVerificationMail from "../firebase/SendVerificationMail";

const useEmailVerification = () => {
    const [checking, setChecking] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const oobCode = searchParams.get("oobCode");
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            if (oobCode) {
                setLoading(true);

                setTimeout(async () => {
                    try {
                        await applyActionCode(auth, oobCode);
                        toast.success("Email verified successfully!");
                        await signOut(auth); // log out after verification
                    } catch (err) {
                        console.error("Verification failed:", err);
                        toast.error("Invalid or expired verification link.");
                    } finally {
                        setLoading(false);
                        navigate("/");
                    }
                }, 5000);
            }
        };

        verifyEmail();
    }, [oobCode, navigate]);

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
                        toast.error("No user is logged in to resend verification.");
                    }
                    setChecking(false);
                });
            } else {
                await SendVerificationMail(user);
                toast.info("Verification email resent.");
                setChecking(false);
            }

        } catch (err) {
            console.error("Resend Error:", err);
            toast.error(`Error resending email: ${err.message}`);
            setChecking(false);
        }
    };

    return { checking, resendVerification, loading };
};

export default useEmailVerification;