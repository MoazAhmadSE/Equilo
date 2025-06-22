import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth, db } from "../../firebase/firebaseConfig";
import NewUser from "../../firebase/utils/NewUser";

const useGoogleLogin = (setUser, setLoading) => {
    const navigate = useNavigate();

    return async () => {
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const currentUser = result.user;

            const userRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                await NewUser(currentUser);
                toast.success("Google account created!");
            } else {
                await updateDoc(userRef, { isOnline: true });
                toast.success("Welcome back!");
            }

            setUser(currentUser);
            navigate("/equilo/home");
        } catch (error) {
            console.error("Google Login Error:", error);
            toast.error("Google login failed.");
        } finally {
            setLoading(false);
        }
    };
};
export default useGoogleLogin;