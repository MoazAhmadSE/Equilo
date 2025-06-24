import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { auth } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

const useLogout = (setUser) => {
    const navigate = useNavigate();
    return async () => {
        try {
            await signOut(auth);
            setUser(null);
            navigate("/login");
            toast.info("Logged out.");
        } catch (error) {
            console.log("Logout Error:", error);
            toast.error("Logout failed.");
        }
    };
};
export default useLogout;