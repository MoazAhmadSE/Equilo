import { createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth, db } from "../../firebase/firebaseConfig";
import createUserProfile from "../utils/userHandlers";
import SendVerificationMail from "../../firebase/SendVerificationMail";

const useSignup = (setUser, setLoading) => {
    const navigate = useNavigate();

    return async ({ userName, userMail, userPassword }) => {
        setLoading(true);
        try {
            const result = await createUserWithEmailAndPassword(auth, userMail, userPassword);
            const currentUser = result.user;

            await updateProfile(currentUser, { displayName: userName });

            const userDoc = await getDoc(doc(db, "users", currentUser.uid));

            if (!userDoc.exists()) {
                await createUserProfile({ ...currentUser });
                await SendVerificationMail(currentUser);
                toast.info("Verification email sent. Please check your inbox.");
            } else {
                toast.info("Account already exists. Please log in.");
            }

            await signOut(auth);
            navigate("/verifyemail");

        } catch (error) {
            console.error("Signup Error:", error);
            if (error.code === "auth/email-already-in-use") {
                toast.error("This email is already registered.");
            } else if (error.code === "auth/account-exists-with-different-credential") {
                toast.error("This email is already registered with another provider.");
            } else {
                toast.error("Signup failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };
};

export default useSignup;