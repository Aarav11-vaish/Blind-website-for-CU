"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AuthGuard = ({ children, fallback }: AuthGuardProps) => {
  const { isAuthenticated, isLoading, redirectToSignin } = useAuth();

  useEffect(() => {
    // Check for authentication expiry
    const checkAuthExpiry = () => {
      const token = localStorage.getItem("token");
      if (!token && !isLoading) {
        // Preserve current route for redirect after login
        const currentPath = window.location.pathname;
        if (currentPath !== "/signin") {
          localStorage.setItem("redirectAfterLogin", currentPath);
        }
        redirectToSignin(true);
      }
    };

    // Check immediately
    checkAuthExpiry();

    // Set up periodic check for token expiry
    const interval = setInterval(checkAuthExpiry, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, isLoading, redirectToSignin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  return <>{children}</>;
};

export default AuthGuard;