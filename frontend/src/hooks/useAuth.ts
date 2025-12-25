"use client";

import { useState, useEffect, useCallback } from "react";

interface User {
  email: string;
  user_id: string;
  isverified: boolean;
  user_name?: string;
  graduation_year?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const checkAuthStatus = useCallback(() => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        // Check if token is expired
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const currentTime = Date.now() / 1000;

          // If token has expired, logout
          if (payload.exp && payload.exp < currentTime) {
            logout();
            return;
          }
        } catch (tokenError) {
          console.error("Error parsing token:", tokenError);
          // If we can't parse the token, treat it as invalid
          logout();
          return;
        }

        const parsedUser = JSON.parse(userData);

        setAuthState({
          user: parsedUser,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, [logout]);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuthStatus();
    }, 0);
    return () => clearTimeout(timer);
  }, [checkAuthStatus]);

  const login = useCallback((user: User, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const redirectToSignin = useCallback((preserveDestination = true) => {
    if (preserveDestination) {
      const currentPath = window.location.pathname;
      localStorage.setItem("redirectAfterLogin", currentPath);
    }
    window.location.href = "/signin";
  }, []);

  return {
    ...authState,
    login,
    logout,
    redirectToSignin,
    checkAuthStatus,
  };
}
