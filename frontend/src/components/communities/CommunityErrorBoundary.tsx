"use client";

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";

interface CommunityErrorBoundaryProps {
  error: string;
  errorType?: "network" | "auth" | "server" | "not-found" | "unknown";
  onRetry?: () => void;
  onGoBack?: () => void;
  retryCount?: number;
  maxRetries?: number;
}

const CommunityErrorBoundary: React.FC<CommunityErrorBoundaryProps> = ({
  error,
  errorType = "unknown",
  onRetry,
  onGoBack,
  retryCount = 0,
  maxRetries = 3,
}) => {
  const getErrorConfig = () => {
    switch (errorType) {
      case "network":
        return {
          icon: <WifiOff className="h-4 w-4" />,
          title: "Connection Problem",
          description: "Unable to connect to the server. Please check your internet connection.",
          variant: "destructive" as const,
          showRetry: true,
          retryText: "Retry Connection",
        };

      case "auth":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          title: "Authentication Required",
          description: "Your session has expired. Please sign in again to continue.",
          variant: "destructive" as const,
          showRetry: false,
          retryText: "Sign In",
        };

      case "server":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          title: "Server Error",
          description: "The server is experiencing issues. Please try again in a moment.",
          variant: "destructive" as const,
          showRetry: true,
          retryText: "Try Again",
        };

      case "not-found":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          title: "Community Not Found",
          description: "The community you're looking for doesn't exist or has been removed.",
          variant: "destructive" as const,
          showRetry: false,
          retryText: "Browse Communities",
        };

      default:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          title: "Something Went Wrong",
          description: error || "An unexpected error occurred. Please try again.",
          variant: "destructive" as const,
          showRetry: true,
          retryText: "Try Again",
        };
    }
  };

  const config = getErrorConfig();
  const canRetry = config.showRetry && retryCount < maxRetries;

  return (
    <Alert variant={config.variant} className="my-6">
      {config.icon}
      <AlertDescription>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="font-medium mb-1">{config.title}</div>
            <div className="text-sm">{config.description}</div>
            {retryCount > 0 && (
              <div className="text-xs mt-2 opacity-75">
                Retry attempt {retryCount} of {maxRetries}
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {canRetry && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-3 w-3" />
                <span>{config.retryText}</span>
              </Button>
            )}

            {!canRetry && retryCount >= maxRetries && (
              <div className="text-xs text-muted-foreground">
                Maximum retry attempts reached
              </div>
            )}

            {onGoBack && (
              <Button variant="outline" size="sm" onClick={onGoBack}>
                Go Back
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default CommunityErrorBoundary;