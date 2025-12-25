"use client";

import React from "react";
import { Search, TrendingUp, Users, BookOpen, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SearchEmptyStateProps {
  type: "initial" | "no-results" | "error" | "offline";
  query?: string;
  onBrowseCommunities?: () => void;
  onBrowseTrending?: () => void;
  onRetry?: () => void;
  className?: string;
}

export function SearchEmptyState({
  type,
  query,
  onBrowseCommunities,
  onBrowseTrending,
  onRetry,
  className,
}: SearchEmptyStateProps) {
  const renderInitialState = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Discover Content</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Search through posts, find interesting discussions, and connect with your community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={onBrowseTrending}>
          <CardContent className="p-4 text-center space-y-2">
            <TrendingUp className="h-6 w-6 mx-auto text-primary" />
            <div className="space-y-1">
              <h4 className="font-medium">Trending Posts</h4>
              <p className="text-xs text-muted-foreground">See what's popular</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={onBrowseCommunities}>
          <CardContent className="p-4 text-center space-y-2">
            <Users className="h-6 w-6 mx-auto text-primary" />
            <div className="space-y-1">
              <h4 className="font-medium">Communities</h4>
              <p className="text-xs text-muted-foreground">Explore groups</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-sm text-muted-foreground space-y-2">
        <p className="font-medium">Search Tips:</p>
        <ul className="text-xs space-y-1 max-w-sm mx-auto">
          <li>• Use keywords from post content</li>
          <li>• Search by username or community name</li>
          <li>• Use filters to narrow results</li>
          <li>• Try different sorting options</li>
        </ul>
      </div>
    </div>
  );

  const renderNoResultsState = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold">No Results Found</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          We couldn't find any posts matching "{query}". Try adjusting your search or filters.
        </p>
      </div>

      <div className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-2">
          <p className="font-medium">Suggestions:</p>
          <ul className="text-xs space-y-1 max-w-sm mx-auto text-left">
            <li>• Check your spelling</li>
            <li>• Try more general keywords</li>
            <li>• Remove some filters</li>
            <li>• Search in all communities</li>
            <li>• Try different date ranges</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onBrowseTrending && (
            <Button variant="outline" onClick={onBrowseTrending}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Browse Trending
            </Button>
          )}
          {onBrowseCommunities && (
            <Button variant="outline" onClick={onBrowseCommunities}>
              <Users className="h-4 w-4 mr-2" />
              Explore Communities
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Search Unavailable</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          We're having trouble with search right now. You can still browse content using the alternatives below.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button onClick={onRetry}>
              Try Again
            </Button>
          )}
          {onBrowseTrending && (
            <Button variant="outline" onClick={onBrowseTrending}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Browse All Posts
            </Button>
          )}
          {onBrowseCommunities && (
            <Button variant="outline" onClick={onBrowseCommunities}>
              <Users className="h-4 w-4 mr-2" />
              Browse Communities
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Search will be restored automatically when the service is available.</p>
        </div>
      </div>
    </div>
  );

  const renderOfflineState = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
        <AlertTriangle className="h-8 w-8 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold">You're Offline</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Search requires an internet connection. Please check your connection and try again.
        </p>
      </div>

      <div className="space-y-4">
        {onRetry && (
          <Button onClick={onRetry}>
            Try Again
          </Button>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <p>While offline, you can:</p>
          <ul className="text-xs space-y-1 max-w-sm mx-auto">
            <li>• View previously loaded content</li>
            <li>• Browse your saved posts</li>
            <li>• Check your profile</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case "initial":
        return renderInitialState();
      case "no-results":
        return renderNoResultsState();
      case "error":
        return renderErrorState();
      case "offline":
        return renderOfflineState();
      default:
        return renderInitialState();
    }
  };

  return (
    <div className={cn("py-12 px-4", className)}>
      {renderContent()}
    </div>
  );
}