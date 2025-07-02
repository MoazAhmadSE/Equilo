// RedirectGate.jsx
import { useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { u } from "framer-motion/client";
import { auth } from "../firebase/firebaseConfig";

const publicPaths = [
  "/",
  "/login",
  "/signup",
  "/resetpassword",
  "/verifyemail",
];

const RedirectGate = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();

  const mode = searchParams.get("mode");
  const isPublicPage = publicPaths.includes(location.pathname);
  const isProtectedPage = location.pathname.startsWith("/equilo");
  console.log(auth);

  useEffect(() => {
    if (loading) return;

    const rules = {
      resetPassword: () => {
        mode === "resetPassword"
          ? navigate("/resetpassword" + location.search, { replace: true })
          : null;
      },
      verifyEmailMode: () => {
        mode === "verifyEmail"
          ? navigate("/verifyemail" + location.search, { replace: true })
          : null;
      },
      verifiedUserOnPublicPage: () => {
        user && user.emailVerified && isPublicPage
          ? navigate("/equilo/home", { replace: true })
          : null;
      },
      unverifiedUserOnProtectedPage: () => {
        user && !user.emailVerified && isProtectedPage
          ? navigate("/verifyemail", { replace: true })
          : null;
      },
      noUserOnProtectedPage: () => {
        !user && isProtectedPage ? navigate("/login", { replace: true }) : null;
      },
    };

    for (const rule in rules) {
      rules[rule]();
    }
  }, [mode, location, searchParams, user, loading, navigate]);

  return loading ? null : children;
};

export default RedirectGate;
