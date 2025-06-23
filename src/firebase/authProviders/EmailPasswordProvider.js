import { toast } from "react-toastify";
import {
    createUserWithEmailAndPassword,
    updateProfile,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import createUserProfile from "../utils/userHandlers";
import SendVerificationMail from "../SendVerificationMail";

const signupWithEmailPassword = async ({ userName, userMail, userPassword }) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, userMail, userPassword);
        const user = result.user;

        // Set display name in Firebase Auth profile
        await updateProfile(user, { displayName: userName });

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        // If this is a new user
        if (!userDoc.exists()) {
            await createUserProfile({ userId: user.uid }); // create user and tasks doc
            await SendVerificationMail(user);
            toast.info("Verification email sent. Please check your inbox.");
        }

        return user;
    } catch (error) {
        console.error("Signup Error:", error);

        if (error.code === "auth/email-already-in-use") {
            toast.error("This email is already registered.");
        } else if (error.code === "auth/account-exists-with-different-credential") {
            toast.error("This email is already registered with another provider.");
        } else {
            toast.error("Signup failed. Please try again.");
        }

        throw error;
    }
};

export default signupWithEmailPassword;