"use client";

import React from "react";
import { SearchResponse } from "@/lib/api";
import { PostList } from "@/components/posts";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { SearchEmptyState } from "./SearchEmptyState";
import { cn } from "@/lib/utils";

interface SearchResultsProps {
  results: SearchResponse | null;
  loading: boolean;
  error: string | null;
  query: string;
  onPostLike: (postId: string) => Promise<void>;
  onPostComment: (postId: string) => void;
  onPostShare: (postId: string) => void;
  onPostClick: (postId: string) => void;
  onLoadMore?: () => void;
  onRetry?: () => void;
  onClearError?: () => void;
  onBrowseCommunities?: () => void;
  onBrowseTrending?: () => void;
  className?: string;
}

export function SearchResults({
  results,
  loading,
  error,
  query,
  onPostLike,
  onPostComment,
  onPostShare,
  onPostClick,
  onLoadMore,
  onRetry,
  onClearError,
  onBrowseCommunities,
  onBrowseTrending,
  className,
}: SearchResultsProps) {
  // Show loading state for initial search
  if (loading && !results) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Searching for "{query}"...</p>
      </div>
    );
  }

  // Show error state
  if (error && !results) {
    // Determine if this is a network/offline error
    const isOfflineError = error.toLowerCase().includes("network") ||
      error.toLowerCase().includes("fetch") ||
      error.toLowerCase().includes("connection");

    return (
      <SearchEmptyState
        type={isOfflineError ? "offline" : "error"}
        query={query}
        onRetry={onRetry}
        onBrowseCommunities={onBrowseCommunities}
        onBrowseTrending={onBrowseTrending}
        className={className}
      />
    );
  }

  // Show empty state when no query
  if (!query.trim() && !results) {
    return (
      <SearchEmptyState
        type="initial"
        onBrowseCommunities={onBrowseCommunities}
        onBrowseTrending={onBrowseTrending}
        className={className}
      />
    );
  }

  // Show no results state
  if (results && results.posts.length === 0 && !loading) {
    return (
      <SearchEmptyState
        type="no-results"
        query={query}
        onBrowseCommunities={onBrowseCommunities}
        onBrowseTrending={onBrowseTrending}
        className={className}
      />
    );
  }

  // Show results
  if (results) {
    return (
      <div className={className}>
        {/* Results header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">
              Search Results
            </h2>
            <span className="text-sm text-muted-foreground">
              {results.totalCount} result{results.totalCount !== 1 ? 's' : ''} found
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing results for "{query}"
            {results.appliedFilters?.communityId && " in selected community"}
            {results.appliedFilters?.dateRange && " within date range"}
          </p>
        </div>

        {/* Error banner if there's an error but we still have results */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-destructive mr-2" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
              {onClearError && (
                <Button onClick={onClearError} variant="ghost" size="sm">
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Post results */}
        <PostList
          posts={results.posts}
          loading={false}
          error={null}
          onPostLike={onPostLike}
          onPostComment={onPostComment}
          onPostShare={onPostShare}
          onPostClick={onPostClick}
        />

        {/* Load more button */}
        {results.hasMore && (
          <div className="mt-6 text-center">
            <Button
              onClick={onLoadMore}
              disabled={loading}
              variant="outline"
              className="min-w-32"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}

        {/* Loading indicator for load more */}
        {loading && results.posts.length > 0 && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading more results...
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}