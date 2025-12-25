"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ErrorRetryProps {
  error: string;
  onRetry: () => void;
  isRetrying?: boolean;
  title?: string;
  description?: string;
  showNetworkStatus?: boolean;
  className?: string;
}

const ErrorRetry: React.FC<ErrorRetryProps> = ({
  error,
  onRetry,
  isRetrying = false,
  title = "Something went wrong",
  description,
  showNetworkStatus = true,
  className,
}) => {
  const isNetworkError = error.toLowerCase().includes("network") ||
    error.toLowerCase().includes("fetch") ||
    error.toLowerCase().includes("connection");

  const getErrorIcon = () => {
    if (isNetworkError) {
      return <WifiOff className="h-8 w-8 text-destructive" />;
    }
    return <AlertTriangle className="h-8 w-8 text-destructive" />;
  };

  const getErrorTitle = () => {
    if (isNetworkError) {
      return "Connection Problem";
    }
    return title;
  };

  const getErrorDescription = () => {
    if (description) return description;

    if (isNetworkError) {
      return "Unable to connect to the server. Please check your internet connection and try again.";
    }

    return "An unexpected error occurred. Please try again or contact support if the problem persists.";
  };

  return (
    <Card className={cn("border-destructive/20", className)}>
      <CardContent className="p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {getErrorIcon()}
          </div>

          <h3 className="text-lg font-medium text-foreground mb-2">
            {getErrorTitle()}
          </h3>

          <p className="text-muted-foreground max-w-md mx-auto mb-2">
            {getErrorDescription()}
          </p>

          {/* Show the actual error message in smaller text */}
          <p className="text-sm text-muted-foreground/70 max-w-md mx-auto mb-6 font-mono bg-muted/50 p-2 rounded">
            {error}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={onRetry}
              disabled={isRetrying}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isRetrying && "animate-spin")} />
              {isRetrying ? "Retrying..." : "Try Again"}
            </Button>

            {showNetworkStatus && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {navigator.onLine ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-destructive" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorRetry;