// Simple error handling utilities

export interface ParsedError {
  message: string;
  type: string;
  shouldRedirectToAuth?: boolean;
}

export type ErrorType =
  | "network"
  | "validation"
  | "auth"
  | "server"
  | "unknown";

export function parseError(error: unknown): ParsedError {
  if (error instanceof Error) {
    return {
      message: error.message,
      type: "unknown",
    };
  }

  if (typeof error === "string") {
    return {
      message: error,
      type: "unknown",
    };
  }

  return {
    message: "An unknown error occurred",
    type: "unknown",
  };
}

export function logError(error: unknown, context?: string) {
  console.error(`Error${context ? ` in ${context}` : ""}:`, error);
}

// Simple offline detector component
export function OfflineDetector() {
  return null; // Simplified - no offline detection
}
