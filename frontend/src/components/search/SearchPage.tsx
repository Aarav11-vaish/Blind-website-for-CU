"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchInput } from "./SearchInput";
import { SearchFilters } from "./SearchFilters";
import { SearchResults } from "./SearchResults";
import { useSearch } from "@/hooks/useSearch";
import { useAuth } from "@/hooks/useAuth";
import { Community, getCommunities, likeGlobalPost } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SearchPageProps {
  initialQuery?: string;
  className?: string;
}

export function SearchPage({ initialQuery = "", className }: SearchPageProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, redirectToSignin } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(false);

  const {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    loading,
    error,
    suggestions,
    suggestionsLoading,
    showSuggestions,
    search,
    clearSearch,
    clearError,
    loadMore,
    hideSuggestions,
    selectSuggestion,
  } = useSearch({
    debounceMs: 300,
    enableSuggestions: true,
    fallbackToClientSearch: true,
  });

  // Set initial query if provided
  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery, query, setQuery]);

  // Load communities for filter
  useEffect(() => {
    const loadCommunities = async () => {
      if (!isAuthenticated) return;

      try {
        setCommunitiesLoading(true);
        const response = await getCommunities();
        setCommunities(response.communities);
      } catch (err) {
        console.error("Failed to load communities:", err);
        // Don't show error for communities, just continue without them
      } finally {
        setCommunitiesLoading(false);
      }
    };

    if (!authLoading && isAuthenticated) {
      loadCommunities();
    }
  }, [authLoading, isAuthenticated]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      redirectToSignin(true);
    }
  }, [authLoading, isAuthenticated, redirectToSignin]);

  const handlePostLike = async (postId: string) => {
    try {
      // Check authentication before making API call
      const token = localStorage.getItem("token");
      if (!token) {
        redirectToSignin(true);
        return;
      }

      await likeGlobalPost(postId);

      // Update the local results state with new like data
      // Note: This is a simplified update - in a real app you might want to refetch
      // or implement more sophisticated state management
    } catch (err) {
      console.error("Failed to like post:", err);

      // Handle authentication errors
      if (err instanceof Error &&
        (err.message.toLowerCase().includes("unauthorized") ||
          err.message.toLowerCase().includes("token"))) {
        redirectToSignin(true);
        return;
      }

      throw err; // Re-throw to let PostCard handle the error
    }
  };

  const handlePostComment = (postId: string) => {
    // Navigate to post detail page for comments
    router.push(`/dashboard/post/${postId}`);
  };

  const handlePostShare = (postId: string) => {
    const post = results?.posts.find(p => p._id === postId);
    if (!post) return;

    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.randomName}`,
        text: post.content,
        url: `${window.location.origin}/dashboard/post/${postId}`,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/dashboard/post/${postId}`);
    }
  };

  const handlePostClick = (postId: string) => {
    router.push(`/dashboard/post/${postId}`);
  };

  const handleBrowseCommunities = () => {
    router.push("/dashboard/communities");
  };

  const handleBrowseTrending = () => {
    router.push("/dashboard");
  };

  const handleRetry = () => {
    if (query.trim()) {
      search();
    } else {
      clearError();
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded-md mb-4"></div>
          <div className="h-8 bg-muted rounded-md mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-md"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search input */}
      <SearchInput
        value={query}
        onChange={setQuery}
        onSearch={() => search()}
        onClear={clearSearch}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        suggestionsLoading={suggestionsLoading}
        onSuggestionSelect={selectSuggestion}
        onSuggestionsHide={hideSuggestions}
        disabled={loading}
      />

      {/* Search filters */}
      <SearchFilters
        filters={filters}
        onFiltersChange={setFilters}
        communities={communities}
        disabled={loading || communitiesLoading}
      />

      {/* Search results */}
      <SearchResults
        results={results}
        loading={loading}
        error={error}
        query={query}
        onPostLike={handlePostLike}
        onPostComment={handlePostComment}
        onPostShare={handlePostShare}
        onPostClick={handlePostClick}
        onLoadMore={loadMore}
        onRetry={handleRetry}
        onClearError={clearError}
        onBrowseCommunities={handleBrowseCommunities}
        onBrowseTrending={handleBrowseTrending}
      />
    </div>
  );
}