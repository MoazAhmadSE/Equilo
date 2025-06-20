import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { toast } from "react-toastify";
import { auth } from "../firebaseConfig";

export const GoogleProvider = async (setLoading) => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    toast.success(`Welcome, ${user.displayName || "User"}!`);
    return user;

  } catch (error) {
    console.error("Google auth error:", error);
    toast.error("Google sign-in failed.");
    return null;

  } finally {
    setLoading(false);
  }
};
