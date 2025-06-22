import { createContext, useContext, useState } from "react";
import useSignup from "../firebase/auth/useSignup";
import useLogin from "../firebase/auth/useLogin";
import useGoogleLogin from "../firebase/auth/useGoogleLogin";
import useLogout from "../firebase/auth/useLogout";
import useAuthObserver from "../firebase/auth/useAuthObserver";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signupWithEmailPasswordForm = useSignup(setUser, setLoading);
  const loginWithEmailPasswordForm = useLogin(setUser, setLoading);
  const loginWithGoogle = useGoogleLogin(setUser, setLoading);
  const logoutUser = useLogout(setUser);

  useAuthObserver(setUser, setLoading);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signupWithEmailPasswordForm,
        loginWithEmailPasswordForm,
        loginWithGoogle,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
