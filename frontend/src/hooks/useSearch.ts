"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  SearchQuery,
  SearchResponse,
  SearchSuggestion,
  searchPosts,
  getSearchSuggestions,
  fallbackSearchPosts,
} from "@/lib/api";

interface UseSearchOptions {
  debounceMs?: number;
  enableSuggestions?: boolean;
  fallbackToClientSearch?: boolean;
}

interface UseSearchReturn {
  // Search state
  query: string;
  setQuery: (query: string) => void;
  filters: Omit<SearchQuery, "text">;
  setFilters: (filters: Omit<SearchQuery, "text">) => void;

  // Results state
  results: SearchResponse | null;
  loading: boolean;
  error: string | null;

  // Suggestions state
  suggestions: SearchSuggestion[];
  suggestionsLoading: boolean;
  showSuggestions: boolean;

  // Actions
  search: (customQuery?: SearchQuery) => Promise<void>;
  clearSearch: () => void;
  clearError: () => void;
  loadMore: () => Promise<void>;

  // Suggestion actions
  hideSuggestions: () => void;
  selectSuggestion: (suggestion: SearchSuggestion) => void;
}

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const {
    debounceMs = 300,
    enableSuggestions = true,
    fallbackToClientSearch = true,
  } = options;

  // Search state
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Omit<SearchQuery, "text">>({
    sortBy: "date",
    page: 1,
    limit: 10,
  });

  // Results state
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Refs for debouncing
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Debounced search function
  const performSearch = useCallback(
    async (searchQuery: SearchQuery) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);

        let response: SearchResponse;

        try {
          // Try backend search first
          response = await searchPosts(searchQuery);
        } catch (backendError) {
          if (fallbackToClientSearch) {
            console.warn(
              "Backend search failed, falling back to client-side search:",
              backendError
            );
            response = await fallbackSearchPosts(searchQuery);
          } else {
            throw backendError;
          }
        }

        // Only update if this request wasn't aborted
        if (!abortControllerRef.current?.signal.aborted) {
          if (searchQuery.page === 1) {
            setResults(response);
          } else {
            // Append results for pagination
            setResults((prev) =>
              prev
                ? {
                    ...response,
                    posts: [...prev.posts, ...response.posts],
                  }
                : response
            );
          }
        }
      } catch (err) {
        if (!abortControllerRef.current?.signal.aborted) {
          console.error("Search failed:", err);
          setError(err instanceof Error ? err.message : "Search failed");
        }
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [fallbackToClientSearch]
  );

  // Debounced suggestions function
  const fetchSuggestions = useCallback(
    async (searchText: string) => {
      if (!enableSuggestions || !searchText.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        setSuggestionsLoading(true);
        const response = await getSearchSuggestions(searchText);
        setSuggestions(response.suggestions);
        setShowSuggestions(true);
      } catch (err) {
        console.warn("Failed to fetch suggestions:", err);
        // Don't show error for suggestions, just hide them
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSuggestionsLoading(false);
      }
    },
    [enableSuggestions]
  );

  // Effect for debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        const searchQuery: SearchQuery = {
          text: query,
          ...filters,
          page: 1, // Reset to first page for new search
        };
        performSearch(searchQuery);
      }, debounceMs);
    } else {
      // Clear results when query is empty
      setResults(null);
      setError(null);
    }
  }, [query, filters, performSearch, debounceMs]);

  // Effect for debounced suggestions
  useEffect(() => {
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    if (query.trim() && enableSuggestions) {
      suggestionsTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(query);
      }, debounceMs / 2); // Suggestions should be faster
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, fetchSuggestions, enableSuggestions, debounceMs]);

  // Manual search function
  const search = useCallback(
    async (customQuery?: SearchQuery) => {
      const searchQuery: SearchQuery = customQuery || {
        text: query,
        ...filters,
        page: 1,
      };

      await performSearch(searchQuery);
      setShowSuggestions(false);
    },
    [query, filters, performSearch]
  );

  // Clear search function
  const clearSearch = useCallback(() => {
    setQuery("");
    setResults(null);
    setError(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load more function for pagination
  const loadMore = useCallback(async () => {
    if (!results || loading || !results.hasMore) return;

    const nextPage = results.page + 1;
    const searchQuery: SearchQuery = {
      text: query,
      ...filters,
      page: nextPage,
    };

    await performSearch(searchQuery);
  }, [results, loading, query, filters, performSearch]);

  // Hide suggestions function
  const hideSuggestions = useCallback(() => {
    setShowSuggestions(false);
  }, []);

  // Select suggestion function
  const selectSuggestion = useCallback(
    (suggestion: SearchSuggestion) => {
      setQuery(suggestion.text);
      setShowSuggestions(false);

      // Trigger immediate search with the selected suggestion
      const searchQuery: SearchQuery = {
        text: suggestion.text,
        ...filters,
        page: 1,
      };
      performSearch(searchQuery);
    },
    [filters, performSearch]
  );

  return {
    // Search state
    query,
    setQuery,
    filters,
    setFilters,

    // Results state
    results,
    loading,
    error,

    // Suggestions state
    suggestions,
    suggestionsLoading,
    showSuggestions,

    // Actions
    search,
    clearSearch,
    clearError,
    loadMore,

    // Suggestion actions
    hideSuggestions,
    selectSuggestion,
  };
}
