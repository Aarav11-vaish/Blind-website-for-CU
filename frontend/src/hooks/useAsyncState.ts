"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ParsedError, parseError } from "@/lib/errorHandler";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ParsedError | null;
  lastUpdated: Date | null;
}

interface UseAsyncStateOptions {
  initialData?: any;
  onError?: (error: ParsedError) => void;
  onSuccess?: (data: any) => void;
}

export function useAsyncState<T>(options: UseAsyncStateOptions = {}) {
  const { initialData = null, onError, onSuccess } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(
    async (
      asyncFunction: (signal?: AbortSignal) => Promise<T>,
      context?: string
    ): Promise<T | null> => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const result = await asyncFunction(signal);

        // Check if request was aborted
        if (signal.aborted) {
          return null;
        }

        setState({
          data: result,
          loading: false,
          error: null,
          lastUpdated: new Date(),
        });

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error) {
        // Don't update state if request was aborted
        if (signal.aborted) {
          return null;
        }

        const parsedError = parseError(error);

        setState((prev) => ({
          ...prev,
          loading: false,
          error: parsedError,
        }));

        if (onError) {
          onError(parsedError);
        }

        console.error(`[${context || "AsyncState"}] Error:`, error);
        return null;
      }
    },
    [onError, onSuccess]
  );

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState({
      data: initialData,
      loading: false,
      error: null,
      lastUpdated: null,
    });
  }, [initialData]);

  const setData = useCallback((data: T) => {
    setState((prev) => ({
      ...prev,
      data,
      lastUpdated: new Date(),
    }));
  }, []);

  const setError = useCallback((error: string | Error | ParsedError) => {
    const parsedError =
      error instanceof Error || typeof error === "string"
        ? parseError(error)
        : error;

    setState((prev) => ({
      ...prev,
      error: parsedError,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
    clearError,
  };
}

export default useAsyncState;
