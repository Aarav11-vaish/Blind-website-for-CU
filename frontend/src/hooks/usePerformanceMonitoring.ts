/**
 * Performance Monitoring Hook
 * Provides React-specific performance monitoring capabilities
 */

import { useEffect, useRef, useCallback } from "react";
import { analytics } from "@/lib/analytics";

interface PerformanceMonitoringOptions {
  trackRenders?: boolean;
  trackEffects?: boolean;
  trackAsyncOperations?: boolean;
  componentName?: string;
}

export function usePerformanceMonitoring(
  options: PerformanceMonitoringOptions = {}
) {
  const {
    trackRenders = false,
    trackEffects = false,
    trackAsyncOperations = true,
    componentName = "UnknownComponent",
  } = options;

  const renderCount = useRef(0);
  const mountTime = useRef<number>(0);
  const lastRenderTime = useRef<number>(0);

  // Initialize times in useEffect to avoid calling impure function during render
  useEffect(() => {
    const now = Date.now();
    if (mountTime.current === 0) {
      mountTime.current = now;
      lastRenderTime.current = now;
    }
  }, []);

  // Track component renders
  useEffect(() => {
    renderCount.current += 1;
    const currentTime = Date.now();
    const renderDuration = currentTime - lastRenderTime.current;
    lastRenderTime.current = currentTime;

    if (trackRenders) {
      analytics.trackPerformance(`${componentName}_render`, renderDuration, {
        renderCount: renderCount.current,
        componentName,
      });

      // Warn about excessive renders
      if (renderCount.current > 10) {
        console.warn(
          `Component ${componentName} has rendered ${renderCount.current} times`
        );
        analytics.trackError(
          `Excessive renders detected in ${componentName} (${renderCount.current} renders)`,
          "performance_warning"
        );
      }
    }
  });

  // Track component mount/unmount
  useEffect(() => {
    const mountDuration = Date.now() - mountTime.current;

    analytics.trackPerformance(`${componentName}_mount`, mountDuration, {
      componentName,
    });

    return () => {
      const totalLifetime = Date.now() - mountTime.current;
      analytics.trackPerformance(`${componentName}_unmount`, totalLifetime, {
        componentName,
        totalRenders: renderCount.current,
      });
    };
  }, [componentName]);

  // Track effect performance
  const trackEffect = useCallback(
    (effectName: string, duration: number) => {
      if (trackEffects) {
        analytics.trackPerformance(
          `${componentName}_effect_${effectName}`,
          duration,
          {
            componentName,
            effectName,
          }
        );
      }
    },
    [componentName, trackEffects]
  );

  // Track async operation performance
  const trackAsyncOperation = useCallback(
    async <T>(
      operationName: string,
      operation: () => Promise<T>
    ): Promise<T> => {
      if (!trackAsyncOperations) {
        return operation();
      }

      const startTime = Date.now();

      try {
        const result = await operation();
        const duration = Date.now() - startTime;

        analytics.trackPerformance(
          `${componentName}_async_${operationName}`,
          duration,
          {
            componentName,
            operationName,
            success: true,
          }
        );

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        analytics.trackPerformance(
          `${componentName}_async_${operationName}`,
          duration,
          {
            componentName,
            operationName,
            success: false,
          }
        );

        analytics.trackError(
          error as Error,
          `${componentName}_async_${operationName}`
        );
        throw error;
      }
    },
    [componentName, trackAsyncOperations]
  );

  // Measure function execution time
  const measureFunction = useCallback(
    <T extends any[], R>(functionName: string, fn: (...args: T) => R) => {
      return (...args: T): R => {
        const startTime = performance.now();
        const result = fn(...args);
        const duration = performance.now() - startTime;

        analytics.trackPerformance(
          `${componentName}_function_${functionName}`,
          duration,
          {
            componentName,
            functionName,
          }
        );

        return result;
      };
    },
    [componentName]
  );

  return {
    trackEffect,
    trackAsyncOperation,
    measureFunction,
    renderCount: renderCount.current,
    componentLifetime:
      mountTime.current > 0 ? Date.now() - mountTime.current : 0,
  };
}

/**
 * Hook for tracking API call performance
 */
export function useApiPerformanceTracking() {
  const trackApiCall = useCallback(
    async <T>(
      endpoint: string,
      apiCall: () => Promise<T>,
      metadata?: Record<string, any>
    ): Promise<T> => {
      const startTime = Date.now();

      try {
        const result = await apiCall();
        const duration = Date.now() - startTime;

        analytics.trackPerformance("api_call", duration, {
          endpoint,
          success: true,
          ...metadata,
        });

        analytics.track("api_call_success", {
          endpoint,
          duration,
          ...metadata,
        });

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        analytics.trackPerformance("api_call", duration, {
          endpoint,
          success: false,
          ...metadata,
        });

        analytics.track("api_call_error", {
          endpoint,
          duration,
          error: error instanceof Error ? error.message : String(error),
          ...metadata,
        });

        throw error;
      }
    },
    []
  );

  return { trackApiCall };
}

/**
 * Hook for tracking user interaction performance
 */
export function useInteractionTracking() {
  const trackInteraction = useCallback(
    (
      interactionType: string,
      element: string,
      metadata?: Record<string, any>
    ) => {
      analytics.trackInteraction(element, interactionType, {
        timestamp: Date.now(),
        ...metadata,
      });
    },
    []
  );

  const trackClick = useCallback(
    (element: string, metadata?: Record<string, any>) => {
      trackInteraction("click", element, metadata);
    },
    [trackInteraction]
  );

  const trackHover = useCallback(
    (element: string, metadata?: Record<string, any>) => {
      trackInteraction("hover", element, metadata);
    },
    [trackInteraction]
  );

  const trackFocus = useCallback(
    (element: string, metadata?: Record<string, any>) => {
      trackInteraction("focus", element, metadata);
    },
    [trackInteraction]
  );

  return {
    trackInteraction,
    trackClick,
    trackHover,
    trackFocus,
  };
}

/**
 * Hook for tracking form performance and validation
 */
export function useFormTracking(formName: string) {
  const startTime = useRef<number>(0);
  const fieldInteractions = useRef<Record<string, number>>({});

  // Initialize start time in useEffect to avoid calling impure function during render
  useEffect(() => {
    if (startTime.current === 0) {
      startTime.current = Date.now();
    }
  }, []);

  const trackFieldInteraction = useCallback(
    (fieldName: string) => {
      fieldInteractions.current[fieldName] =
        (fieldInteractions.current[fieldName] || 0) + 1;

      analytics.track("form_field_interaction", {
        formName,
        fieldName,
        interactionCount: fieldInteractions.current[fieldName],
      });
    },
    [formName]
  );

  const trackValidationError = useCallback(
    (fieldName: string, errorMessage: string) => {
      analytics.track("form_validation_error", {
        formName,
        fieldName,
        errorMessage,
      });
    },
    [formName]
  );

  const trackFormSubmit = useCallback(
    (success: boolean, errors?: string[]) => {
      const duration = Date.now() - startTime.current;

      analytics.trackPerformance("form_completion", duration, {
        formName,
        success,
        fieldInteractions: Object.keys(fieldInteractions.current).length,
        totalInteractions: Object.values(fieldInteractions.current).reduce(
          (a, b) => a + b,
          0
        ),
      });

      analytics.track("form_submit", {
        formName,
        success,
        duration,
        errors: errors?.length || 0,
        errorMessages: errors,
      });
    },
    [formName]
  );

  const trackFormAbandon = useCallback(() => {
    const duration = Date.now() - startTime.current;

    analytics.track("form_abandon", {
      formName,
      duration,
      fieldInteractions: Object.keys(fieldInteractions.current).length,
      totalInteractions: Object.values(fieldInteractions.current).reduce(
        (a, b) => a + b,
        0
      ),
    });
  }, [formName]);

  // Track form abandon on unmount if form wasn't submitted
  useEffect(() => {
    return () => {
      // This would be called if component unmounts without explicit submit tracking
      // You might want to add logic to determine if this was an abandon vs successful submit
    };
  }, []);

  return {
    trackFieldInteraction,
    trackValidationError,
    trackFormSubmit,
    trackFormAbandon,
  };
}
