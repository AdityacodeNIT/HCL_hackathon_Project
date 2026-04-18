import { Navigate, useLocation } from "react-router-dom";
import PageLoader from "@/components/page-loader.jsx";
import { useAuth } from "@/context/auth-context.jsx";
import { getDefaultPathForRole } from "@/lib/utils.js";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const { isBootstrapping, user } = useAuth();

  if (isBootstrapping) {
    return <PageLoader message="Checking your session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultPathForRole(user.role)} replace />;
  }

  return children;
}
