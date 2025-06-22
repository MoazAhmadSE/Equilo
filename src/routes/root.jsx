import { useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function FirebaseActionRedirect() {
  const navigate = useNavigate();
  const location = useLocation(); // <-- required!
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (loading) return;

    const mode = searchParams.get("mode");

    if (mode === "resetPassword") {
      navigate("/resetpassword" + location.search, { replace: true });
    } else if (mode === "verifyEmail") {
      navigate("/verifyemail" + location.search, { replace: true });
    } else {
      user
        ? navigate("/equilo/home", { replace: true })
        : navigate("/login", { replace: true });
    }
  }, [searchParams, location, navigate, user, loading]);

  return null;
}
