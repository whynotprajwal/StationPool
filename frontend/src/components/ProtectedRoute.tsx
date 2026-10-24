import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center text-on-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-on-surface-variant">
            Authenticating Pune Metro Commuter Session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to sign up / sign in while remembering intended path
    return <Navigate to="/signup" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
