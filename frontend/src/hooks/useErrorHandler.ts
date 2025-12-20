"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { parseError, ParsedError } from "@/lib/errorHandler";

interface UseErrorHandlerOptions {
  onAuthError?: () => void;
  onNetworkError?: (error: ParsedError) => void;
  onServerError?: (error: ParsedError) => void;
  onValidationError?: (error: ParsedError) => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const router = useRouter();

  const handleError = useCallback(
    (error: unknown, context?: string): ParsedError => {
      const parsed = parseError(error);

      // Log error for debugging
      console.error(
        `[${context || "Error"}] ${parsed.type}:`,
        parsed.originalError
      );

      // Handle different error types
      switch (parsed.type) {
        case "auth":
          if (options.onAuthError) {
            options.onAuthError();
          } else {
            // Default auth error handling - redirect to signin
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/signin");
          }
          break;

        case "network":
          if (options.onNetworkError) {
            options.onNetworkError(parsed);
          }
          break;

        case "server":
          if (options.onServerError) {
            options.onServerError(parsed);
          }
          break;

        case "validation":
          if (options.onValidationError) {
            options.onValidationError(parsed);
          }
          break;

        default:
          // Handle unknown errors
          break;
      }

      return parsed;
    },
    [router, options]
  );

  const withErrorHandling = useCallback(
    async <T>(
      operation: () => Promise<T>,
      context?: string
    ): Promise<{ data?: T; error?: ParsedError }> => {
      try {
        const data = await operation();
        return { data };
      } catch (error) {
        const parsedError = handleError(error, context);
        return { error: parsedError };
      }
    },
    [handleError]
  );

  return {
    handleError,
    withErrorHandling,
  };
}

export default useErrorHandler;
