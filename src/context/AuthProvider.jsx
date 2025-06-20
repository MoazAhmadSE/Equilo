import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  updateProfile,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import NewUser from "../firebase/utils/NewUser";
import SendVerificationMail from "../firebase/SendVerificationMail";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Signup with Email/Password
  const signupWithEmailPassword = async ({
    userName,
    userMail,
    userPassword,
  }) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        userMail,
        userPassword
      );
      const currentUser = result.user;

      await updateProfile(currentUser, { displayName: userName });

      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await NewUser(currentUser);
        await SendVerificationMail(currentUser);
        toast.info("Verification email sent. Please check your inbox.");
      } else {
        toast.info("Account already exists. Please log in.");
      }

      navigate("/verifyemail");
    } catch (error) {
      console.error("Signup Error:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("This email is already registered.");
      } else if (
        error.code === "auth/account-exists-with-different-credential"
      ) {
        toast.error("This email is already registered with another provider.");
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Login with Email/Password
  const loginWithEmailPassword = async (email, password) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = result.user;

      if (!currentUser.emailVerified) {
        await SendVerificationMail(currentUser);
        await signOut(auth);
        toast.warn("Your email is not verified. Verification email sent.");
        navigate("/verifyemail");
        return;
      }

      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await NewUser(currentUser);
      } else {
        await updateDoc(userRef, { isOnline: true });
      }

      setUser(currentUser);
      toast.success("Logged in successfully!");
      navigate("/equilo/home");
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Login with Google
  const loginWithGoogle = async () => {
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

  // ✅ Logout
  const logoutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast.info("Logged out.");
    } catch (error) {
      toast.error("Logout failed.");
      console.log("Logout Error:", error);
    }
  };

  // ✅ Observe auth state and enable persistence
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          setUser(firebaseUser || null);
          setLoading(false);
        });
        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Auth persistence error:", error);
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signupWithEmailPassword,
        loginWithEmailPassword,
        loginWithGoogle,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
