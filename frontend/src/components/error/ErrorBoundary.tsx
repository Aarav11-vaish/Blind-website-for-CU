"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Bug, Home } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { logError, parseError } from "@/lib/errorHandler";
import { reportError } from "@/lib/errorReporting";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  enableErrorReporting?: boolean;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Enhanced error logging
    logError(error, "ErrorBoundary");

    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error if enabled
    if (this.props.enableErrorReporting) {
      this.reportError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, children } = this.props;
    const { hasError } = this.state;

    // Reset error state if props change and resetOnPropsChange is enabled
    if (hasError && resetOnPropsChange && prevProps.children !== children) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Use the error reporting service
      reportError(
        error,
        `ErrorBoundary: ${errorInfo.componentStack || 'Unknown component'}`
      );

      // Update state with a simple error ID
      const errorId = `error_${Date.now()}`;
      this.setState(prevState => ({
        ...prevState,
        errorId,
      }));
    } catch (reportingError) {
      console.error("Failed to report error:", reportingError);
    }
  };

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleGoHome = () => {
    this.resetErrorBoundary();
    window.location.href = "/dashboard";
  };

  private handleReportBug = () => {
    const { error, errorInfo, errorId } = this.state;

    if (error && errorInfo) {
      // Create a bug report template
      const bugReport = `
Error ID: ${errorId}
Error: ${error.message}
Stack: ${error.stack}
Component Stack: ${errorInfo.componentStack}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
      `.trim();

      // Copy to clipboard or open email client
      if (navigator.clipboard) {
        navigator.clipboard.writeText(bugReport).then(() => {
          alert("Bug report copied to clipboard!");
        });
      } else {
        // Fallback: show in alert
        alert(`Bug Report:\n\n${bugReport}`);
      }
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, errorId } = this.state;
      const { showErrorDetails = process.env.NODE_ENV === "development" } = this.props;
      const parsedError = error ? parseError(error) : null;

      // Default error UI with enhanced features
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-lg w-full space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription className="mt-2">
                {parsedError?.message || "An unexpected error occurred while rendering this component."}

                {errorId && (
                  <div className="mt-2 text-xs opacity-75">
                    Error ID: {errorId}
                  </div>
                )}

                {showErrorDetails && error && (
                  <details className="mt-3 text-xs">
                    <summary className="cursor-pointer hover:text-foreground/80">
                      Technical Details
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div>
                        <strong>Error:</strong>
                        <pre className="mt-1 whitespace-pre-wrap break-words bg-muted p-2 rounded text-xs">
                          {error.toString()}
                        </pre>
                      </div>
                      {error.stack && (
                        <div>
                          <strong>Stack Trace:</strong>
                          <pre className="mt-1 whitespace-pre-wrap break-words bg-muted p-2 rounded text-xs max-h-32 overflow-y-auto">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                      {errorInfo?.componentStack && (
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="mt-1 whitespace-pre-wrap break-words bg-muted p-2 rounded text-xs max-h-32 overflow-y-auto">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </AlertDescription>
            </Alert>

            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                onClick={this.handleRetry}
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>

              <Button
                onClick={this.handleGoHome}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>

              {this.props.enableErrorReporting && (
                <Button
                  onClick={this.handleReportBug}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Bug className="h-4 w-4" />
                  Report Bug
                </Button>
              )}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              If this problem persists, please contact support with the error ID above.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;