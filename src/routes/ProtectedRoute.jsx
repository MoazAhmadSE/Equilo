import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // or a loader

  // Only protect /equilo/home and its subroutes
  if (
    (location.pathname.startsWith("/equilo/home") && !user) ||
    user?.emailVerified !== true
  ) {
    return <Navigate to="/verifyemail" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
