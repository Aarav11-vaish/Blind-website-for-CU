"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  focusOnLoad?: boolean;
  ariaLabel?: string;
  role?: string;
}

export function ResponsiveContainer({
  children,
  className,
  loading = false,
  error = null,
  onRetry,
  focusOnLoad = false,
  ariaLabel,
  role = "main",
}: ResponsiveContainerProps) {
  const containerRef = useRef<HTMLElement>(null);

  // Focus management during loading state changes
  useEffect(() => {
    if (focusOnLoad && !loading && containerRef.current) {
      // Focus the container when loading completes
      containerRef.current.focus();
    }
  }, [loading, focusOnLoad]);

  if (loading) {
    return (
      <section
        ref={containerRef}
        className={cn("container mx-auto px-4 py-8", className)}
        role={role}
        aria-label={ariaLabel || "Loading content"}
        aria-busy="true"
        tabIndex={focusOnLoad ? 0 : -1}
      >
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded-md mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-md"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="sr-only" aria-live="polite">
          Loading content, please wait...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        ref={containerRef}
        className={cn("container mx-auto px-4 py-8", className)}
        role={role}
        aria-label={ariaLabel || "Error loading content"}
        tabIndex={focusOnLoad ? 0 : -1}
      >
        <div className="text-center py-8 sm:py-12">
          <div className="max-w-md mx-auto">
            <div className="text-destructive mb-4">
              <svg
                className="mx-auto h-12 w-12 sm:h-16 sm:w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
              Something went wrong
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              {error}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className={cn(
                  "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md",
                  "text-white bg-primary hover:bg-primary/90",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                  "transition-colors duration-200",
                  "min-h-[44px] touch-manipulation"
                )}
                aria-label="Retry loading content"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
        <div className="sr-only" aria-live="assertive">
          Error: {error}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className={cn("container mx-auto px-4 py-8", className)}
      role={role}
      aria-label={ariaLabel}
      tabIndex={focusOnLoad ? 0 : -1}
    >
      {children}
    </section>
  );
}

export default ResponsiveContainer;