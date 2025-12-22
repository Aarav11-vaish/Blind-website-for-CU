/**
 * Enhanced error handling utilities for the BlindCU dashboard
 * Provides consistent error parsing, categorization, and user-friendly messaging
 */

export interface ParsedError {
  message: string;
  type: "network" | "auth" | "validation" | "server" | "unknown";
  originalError: Error | string;
  shouldRetry: boolean;
  shouldRedirectToAuth: boolean;
}

/**
 * Parse and categorize errors for consistent handling
 */
export function parseError(error: unknown): ParsedError {
  let message: string;
  let originalError: Error | string;

  if (error instanceof Error) {
    message = error.message;
    originalError = error;
  } else if (typeof error === "string") {
    message = error;
    originalError = error;
  } else {
    message = "An unexpected error occurred";
    originalError = new Error(message);
  }

  const lowerMessage = message.toLowerCase();

  // Network/Connection errors
  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("fetch") ||
    lowerMessage.includes("connection") ||
    lowerMessage.includes("could not connect")
  ) {
    return {
      message:
        "Connection error. Please check your internet connection and try again.",
      type: "network",
      originalError,
      shouldRetry: true,
      shouldRedirectToAuth: false,
    };
  }

  // Authentication errors
  if (
    lowerMessage.includes("unauthorized") ||
    lowerMessage.includes("token") ||
    lowerMessage.includes("authentication") ||
    lowerMessage.includes("expired") ||
    lowerMessage.includes("invalid token")
  ) {
    return {
      message: "Your session has expired. Please sign in again.",
      type: "auth",
      originalError,
      shouldRetry: false,
      shouldRedirectToAuth: true,
    };
  }

  // Validation errors
  if (
    lowerMessage.includes("validation") ||
    lowerMessage.includes("invalid") ||
    lowerMessage.includes("required") ||
    lowerMessage.includes("must be")
  ) {
    return {
      message,
      type: "validation",
      originalError,
      shouldRetry: false,
      shouldRedirectToAuth: false,
    };
  }

  // Server errors
  if (
    lowerMessage.includes("server") ||
    lowerMessage.includes("internal") ||
    lowerMessage.includes("500") ||
    lowerMessage.includes("503")
  ) {
    return {
      message: "Server error. Please try again in a moment.",
      type: "server",
      originalError,
      shouldRetry: true,
      shouldRedirectToAuth: false,
    };
  }

  // Default case
  return {
    message,
    type: "unknown",
    originalError,
    shouldRetry: true,
    shouldRedirectToAuth: false,
  };
}

/**
 * Get user-friendly error message based on error type
 */
export function getErrorMessage(error: unknown): string {
  return parseError(error).message;
}

/**
 * Check if error should trigger authentication redirect
 */
export function shouldRedirectToAuth(error: unknown): boolean {
  return parseError(error).shouldRedirectToAuth;
}

/**
 * Check if error allows retry
 */
export function canRetry(error: unknown): boolean {
  return parseError(error).shouldRetry;
}

/**
 * Log error with context for debugging
 */
export function logError(error: unknown, context?: string) {
  const parsed = parseError(error);
  console.error(
    `[${context || "Error"}] ${parsed.type}:`,
    parsed.originalError
  );
}

/**
 * Enhanced error handler for API calls
 */
export class ApiErrorHandler {
  private onAuthError?: () => void;

  constructor(onAuthError?: () => void) {
    this.onAuthError = onAuthError;
  }

  /**
   * Handle API errors with automatic auth redirect if needed
   */
  handleError(error: unknown, context?: string): ParsedError {
    const parsed = parseError(error);

    // Log error for debugging
    logError(error, context);

    // Handle auth errors
    if (parsed.shouldRedirectToAuth && this.onAuthError) {
      this.onAuthError();
    }

    return parsed;
  }

  /**
   * Wrap async operations with error handling
   */
  async withErrorHandling<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<{ data?: T; error?: ParsedError }> {
    try {
      const data = await operation();
      return { data };
    } catch (error) {
      const parsedError = this.handleError(error, context);
      return { error: parsedError };
    }
  }
}

export default ApiErrorHandler;
