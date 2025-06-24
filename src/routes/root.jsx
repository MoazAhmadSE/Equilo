import { useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function FirebaseActionRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (loading) return;

    const mode = searchParams.get("mode");

    if (mode === "resetPassword") {
      navigate("/resetpassword" + location.search, { replace: true });
    } else if (mode === "verifyEmail") {
      navigate("/verifyemail" + location.search, { replace: true });
    } else if (user && user.emailVerified) {
      if (location.pathname !== "/equilo/home") {
        navigate("/equilo/home", { replace: true });
      }
    } else {
      // Only redirect to login if NOT already on login or signup or resetpassword or verifyemail
      const publicPaths = ["/login", "/signup", "/resetpassword", "/verifyemail"];
      if (!publicPaths.includes(location.pathname)) {
        navigate("/login", { replace: true });
      }
    }
  }, [searchParams, location, navigate, user, loading]);

  if (loading) {
    // ✅ Return nothing while waiting — avoids flicker
    return null;
  }

  return null; // This component is redirect-only
}
export default FirebaseActionRedirect;