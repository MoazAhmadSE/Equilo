import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { auth } from "../../firebase/firebaseConfig";
import SendVerificationMail from "../SendVerificationMail";

const useLogin = (setUser, setLoading) => {
    const navigate = useNavigate();
    const location = useLocation();

    const errorMessages = {
        "auth/invalid-email": "Invalid email format.",
        "auth/user-not-found": "No user found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/too-many-requests": "Too many attempts. Try again later.",
        "auth/user-disabled": "This user account has been disabled.",
    };

    return async (email, password) => {
        setLoading(true);
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            const currentUser = result.user;

            await currentUser.reload();

            if (!currentUser.emailVerified) {
                try {
                    await SendVerificationMail(currentUser);
                } catch (err) {
                    if (err.code === "auth/too-many-requests") {
                        toast.error("Too many attempts. Please try again later.");
                    } else {
                        toast.error("Failed to send verification email.");
                    }
                    return;
                }

                // await signOut(auth);
                return;
            }

            setUser(currentUser);
            toast.success("Logged in successfully!");
            const redirect = new URLSearchParams(location.search).get("redirect");
            navigate(redirect || "/equilo/home");
        } catch (error) {
            console.error("Login Error:", error.code, error.message);
            const message = errorMessages[error.code] || "Login failed. " + error.message;
            toast.error(message);

        } finally {
            setLoading(false);
        }
    };
};

export default useLogin;