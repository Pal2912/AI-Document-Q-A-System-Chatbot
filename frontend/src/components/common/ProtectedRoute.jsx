/**
 * Wraps any route that requires authentication. While the auth check is
 * still in flight (isLoading), we render nothing meaningful yet to avoid a
 * flash of redirect; once resolved, unauthenticated users are sent to
 * /login, with the originally-requested location preserved so we could
 * redirect back after login if desired in the future.
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Loader from "./Loader";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper dark:bg-ink-bg">
        <Loader size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
