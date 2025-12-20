"use client";

import { useState, useCallback } from "react";

interface UseRetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
}

interface RetryState {
  isRetrying: boolean;
  attempts: number;
  canRetry: boolean;
}

export function useRetry(options: UseRetryOptions = {}) {
  const { maxAttempts = 3, delay = 1000, backoff = true } = options;

  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    attempts: 0,
    canRetry: true,
  });

  const retry = useCallback(
    async <T>(operation: () => Promise<T>): Promise<T> => {
      if (retryState.attempts >= maxAttempts) {
        throw new Error("Maximum retry attempts exceeded");
      }

      setRetryState((prev) => ({
        ...prev,
        isRetrying: true,
        attempts: prev.attempts + 1,
      }));

      try {
        // Add delay before retry (except for first attempt)
        if (retryState.attempts > 0) {
          const retryDelay = backoff
            ? delay * Math.pow(2, retryState.attempts - 1)
            : delay;
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }

        const result = await operation();

        // Reset on success
        setRetryState({
          isRetrying: false,
          attempts: 0,
          canRetry: true,
        });

        return result;
      } catch (error) {
        const canRetryAgain = retryState.attempts + 1 < maxAttempts;

        setRetryState((prev) => ({
          ...prev,
          isRetrying: false,
          canRetry: canRetryAgain,
        }));

        if (!canRetryAgain) {
          throw error;
        }

        throw error;
      }
    },
    [retryState.attempts, maxAttempts, delay, backoff]
  );

  const reset = useCallback(() => {
    setRetryState({
      isRetrying: false,
      attempts: 0,
      canRetry: true,
    });
  }, []);

  return {
    retry,
    reset,
    ...retryState,
  };
}

export default useRetry;
