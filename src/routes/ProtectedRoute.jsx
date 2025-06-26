import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (
    (location.pathname.includes("equilo/home") && !user) ||
    user?.emailVerified !== true
  ) {
    return <Navigate to="/verifyemail" replace />;
  }

  return children;
};

export default ProtectedRoute;
