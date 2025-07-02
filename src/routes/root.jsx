// FirebaseActionRedirect.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function FirebaseActionRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");

  useEffect(() => {
    if (mode === "resetPassword") {
      navigate("/resetpassword" + window.location.search, { replace: true });
    } else if (mode === "verifyEmail") {
      navigate("/verifyemail" + window.location.search, { replace: true });
    }
  }, [mode, navigate]);

  return null;
}

export default FirebaseActionRedirect;
