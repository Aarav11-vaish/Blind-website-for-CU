"use client";

import React from "react";
import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export interface ErrorDisplayProps {
  error: string | Error | null;
  onRetry?: () => void;
  retryLabel?: string;
  showRetry?: boolean;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  retryLabel = "Try Again",
  showRetry = true,
  className = "",
}) => {
  if (!error) return null;

  const errorMessage = error instanceof Error ? error.message : error;
  const isNetworkError = errorMessage.toLowerCase().includes("network") ||
    errorMessage.toLowerCase().includes("fetch") ||
    errorMessage.toLowerCase().includes("connection");

  const isAuthError = errorMessage.toLowerCase().includes("unauthorized") ||
    errorMessage.toLowerCase().includes("token") ||
    errorMessage.toLowerCase().includes("authentication");

  return (
    <div className={`space-y-4 ${className}`}>
      <Alert variant="destructive">
        {isNetworkError ? (
          <WifiOff className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <AlertTitle>
          {isNetworkError ? "Connection Error" :
            isAuthError ? "Authentication Error" :
              "Error"}
        </AlertTitle>
        <AlertDescription>
          {isNetworkError ?
            "Unable to connect to the server. Please check your internet connection." :
            isAuthError ?
              "Your session has expired. Please sign in again." :
              errorMessage
          }
        </AlertDescription>
      </Alert>

      {showRetry && onRetry && !isAuthError && (
        <div className="flex justify-center">
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ErrorDisplay;