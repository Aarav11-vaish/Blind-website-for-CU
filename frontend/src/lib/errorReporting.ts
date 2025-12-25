// Simple error reporting

export function reportError(error: unknown, context?: string) {
  console.error(`Reported error${context ? ` in ${context}` : ""}:`, error);
}

export function getErrorReportingService() {
  return {
    reportError,
    isEnabled: false,
    getErrorStats() {
      return {
        reportCount: 0,
        uniqueErrors: 0,
        environment: "development",
        sessionId: "simple-session",
      };
    },
    clearLocalErrorReports() {
      // Simple implementation - do nothing
    },
  };
}
