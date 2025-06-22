import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { auth } from "../../firebase/firebaseConfig";

const useLogout = (setUser) => {
    return async () => {
        try {
            await signOut(auth);
            setUser(null);
            toast.info("Logged out.");
        } catch (error) {
            console.log("Logout Error:", error);
            toast.error("Logout failed.");
        }
    };
};
export default useLogout;