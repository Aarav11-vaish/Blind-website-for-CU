"use client";

import React, { ReactNode } from "react";
import { useRouter } from "next/navigation";
import ErrorBoundary from "./ErrorBoundary";
import { logError } from "@/lib/errorHandler";

interface RouteErrorBoundaryProps {
  children: ReactNode;
  routeName?: string;
  enableErrorReporting?: boolean;
}

/**
 * Route-specific error boundary wrapper that provides enhanced error handling
 * for page components with automatic error reporting and navigation recovery
 */
export function RouteErrorBoundary({
  children,
  routeName,
  enableErrorReporting = true,
}: RouteErrorBoundaryProps) {
  const router = useRouter();

  const handleRouteError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Enhanced logging with route context
    logError(error, `Route: ${routeName || 'Unknown'}`);

    // Log additional route context
    console.error("Route Error Context:", {
      route: routeName,
      pathname: window.location.pathname,
      search: window.location.search,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });

    // You could also send this to your analytics/monitoring service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: `Route Error: ${routeName} - ${error.message}`,
        fatal: false,
      });
    }
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  return (
    <ErrorBoundary
      onError={handleRouteError}
      enableErrorReporting={enableErrorReporting}
      resetOnPropsChange={true}
      showErrorDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  );
}

export default RouteErrorBoundary;