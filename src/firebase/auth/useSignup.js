import { createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth, db } from "../../firebase/firebaseConfig";
import createUserProfile from "../utils/userHandlers";
import SendVerificationMail from "../../firebase/SendVerificationMail";
import updateNotificationsWithUid from "../../utils/updateNotificationsWithUid";

const useSignup = (setUser, setLoading) => {
    const navigate = useNavigate();

    const assignInvitesToUser = async (user) => {
        const q = query(
            collection(db, "invites"),
            where("toEmail", "==", user.email),
            where("toUserId", "==", null)
        );
        const snap = await getDocs(q);
        for (const inviteDoc of snap.docs) {
            await updateDoc(inviteDoc.ref, {
                toUserId: user.uid,
            });
        }
    };

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

                // Assign invites to this user (after signup)
                await assignInvitesToUser(currentUser);
                await updateNotificationsWithUid(currentUser.email, currentUser.uid);

                // Navigate before sign out to avoid redirect issues
                navigate("/verifyemail");
                await signOut(auth);
            } else {
                toast.info("Account already exists. Please log in.");
                await signOut(auth);
                navigate("/login");
            }
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