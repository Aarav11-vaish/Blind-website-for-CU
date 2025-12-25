/**
 * Basic Analytics - Simple tracking only
 */

// Simple analytics for basic tracking
class SimpleAnalytics {
  private isEnabled: boolean = true;

  constructor() {
    // Check if we're in browser and analytics is enabled
    if (typeof window === "undefined") {
      this.isEnabled = false;
      return;
    }

    const analyticsDisabled = localStorage.getItem("analytics-disabled");
    this.isEnabled = !analyticsDisabled;
  }

  track(eventName: string, properties?: Record<string, any>) {
    if (!this.isEnabled || typeof window === "undefined") return;

    // Simple console logging for development
    // In production, you would send to your analytics service
    console.log(`Analytics: ${eventName}`, properties);
  }

  trackPageView(path?: string) {
    if (typeof window === "undefined") return;

    this.track("page_view", {
      path: path || window.location.pathname,
      title: document.title,
    });
  }

  trackError(error: Error | string, context?: string) {
    this.track("error", {
      message: typeof error === "string" ? error : error.message,
      context,
    });
  }

  trackPerformance(
    metricName: string,
    value: number,
    properties?: Record<string, any>
  ) {
    this.track("performance", {
      metricName,
      value,
      ...properties,
    });
  }

  trackInteraction(
    element: string,
    action: string,
    properties?: Record<string, any>
  ) {
    this.track("interaction", {
      element,
      action,
      ...properties,
    });
  }

  setEnabled(enabled: boolean) {
    if (typeof window === "undefined") return;

    this.isEnabled = enabled;
    if (enabled) {
      localStorage.removeItem("analytics-disabled");
    } else {
      localStorage.setItem("analytics-disabled", "true");
    }
  }

  getStats() {
    return {
      isEnabled: this.isEnabled,
      sessionId: "simple-session",
      userId: null,
      queuedEvents: 0,
      queuedPerformance: 0,
    };
  }
}

// Create singleton instance
export const analytics = new SimpleAnalytics();

// Convenience functions
export const trackPageView = (path?: string) => analytics.trackPageView(path);
export const trackError = (error: Error | string, context?: string) =>
  analytics.trackError(error, context);

export default analytics;
