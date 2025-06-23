import { signInWithEmailAndPassword, signOut } from "firebase/auth";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth, db } from "../../firebase/firebaseConfig";
// import NewUser from "../utils/userHandlers";
import SendVerificationMail from "../SendVerificationMail";

const useLogin = (setUser, setLoading) => {
    const navigate = useNavigate();

    return async (email, password) => {
        setLoading(true);
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            const currentUser = result.user;

            await currentUser.reload();

            if (!currentUser.emailVerified) {
                try {
                    await SendVerificationMail(currentUser);
                    toast.warn("Email not verified. Verification mail sent again.");
                } catch (err) {
                    if (err.code === "auth/too-many-requests") {
                        toast.error("Too many attempts. Please try again later.");
                    } else {
                        toast.error("Failed to send verification email.");
                    }
                }

                await signOut(auth);
                navigate("/verifyemail");
                return;
            }

            // const userRef = doc(db, "users", currentUser.uid);
            // const userDoc = await getDoc(userRef);

            // if (!userDoc.exists()) {
            //     await NewUser(currentUser);
            // } else {
            //     await updateDoc(userRef, { isOnline: true });
            // }

            setUser(currentUser);
            toast.success("Logged in successfully!");
            navigate("/equilo/home");
        } catch (error) {
            console.error("Login Error:", error.code, error.message);
            switch (error.code) {
                case "auth/invalid-email":
                    toast.error("Invalid email format.");
                    break;
                case "auth/user-not-found":
                    toast.error("No user found with this email.");
                    break;
                case "auth/wrong-password":
                    toast.error("Incorrect password.");
                    break;
                case "auth/too-many-requests":
                    toast.error("Too many attempts. Try again later.");
                    break;
                case "auth/user-disabled":
                    toast.error("This user account has been disabled.");
                    break;
                default:
                    toast.error("Login failed. " + error.message);
            }
        } finally {
            setLoading(false);
        }
    };
};

export default useLogin;