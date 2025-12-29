"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Users, Plus, MessageCircle, Search } from "lucide-react";

interface CommunityEmptyStateProps {
  communityName?: string;
  type: "no-posts" | "no-community" | "loading-error" | "network-error";
  onCreatePost?: () => void;
  onRetry?: () => void;
  onBrowseCommunities?: () => void;
}

const CommunityEmptyState: React.FC<CommunityEmptyStateProps> = ({
  communityName,
  type,
  onCreatePost,
  onRetry,
  onBrowseCommunities,
}) => {
  const getEmptyStateContent = () => {
    switch (type) {
      case "no-posts":
        return {
          icon: <MessageCircle className="h-12 w-12 text-muted-foreground" />,
          title: `No posts in ${communityName || "this community"} yet`,
          description: `Be the first to share something with the ${communityName || "community"}! Start a conversation, ask a question, or share something interesting.`,
          primaryAction: onCreatePost && (
            <Button onClick={onCreatePost} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create First Post</span>
            </Button>
          ),
          secondaryAction: onBrowseCommunities && (
            <Button variant="outline" onClick={onBrowseCommunities}>
              Browse Other Communities
            </Button>
          ),
        };

      case "no-community":
        return {
          icon: <Search className="h-12 w-12 text-muted-foreground" />,
          title: "Community not found",
          description: "The community you're looking for doesn't exist or may have been removed. Try browsing other communities or check the URL.",
          primaryAction: onBrowseCommunities && (
            <Button onClick={onBrowseCommunities}>
              Browse Communities
            </Button>
          ),
          secondaryAction: onRetry && (
            <Button variant="outline" onClick={onRetry}>
              Try Again
            </Button>
          ),
        };

      case "loading-error":
        return {
          icon: <Users className="h-12 w-12 text-muted-foreground" />,
          title: "Failed to load community posts",
          description: "We couldn't load the posts for this community. This might be a temporary issue with the server or your connection.",
          primaryAction: onRetry && (
            <Button onClick={onRetry}>
              Try Again
            </Button>
          ),
          secondaryAction: onBrowseCommunities && (
            <Button variant="outline" onClick={onBrowseCommunities}>
              Browse Other Communities
            </Button>
          ),
        };

      case "network-error":
        return {
          icon: <Users className="h-12 w-12 text-muted-foreground" />,
          title: "Connection problem",
          description: "We're having trouble connecting to the server. Please check your internet connection and try again.",
          primaryAction: onRetry && (
            <Button onClick={onRetry}>
              Retry Connection
            </Button>
          ),
          secondaryAction: (
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          ),
        };

      default:
        return {
          icon: <Users className="h-12 w-12 text-muted-foreground" />,
          title: "Something went wrong",
          description: "An unexpected error occurred. Please try again.",
          primaryAction: onRetry && (
            <Button onClick={onRetry}>
              Try Again
            </Button>
          ),
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <div className="text-center py-12 px-6">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
        {content.icon}
      </div>

      <h3 className="text-xl font-semibold text-foreground mb-3">
        {content.title}
      </h3>

      <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
        {content.description}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        {content.primaryAction}
        {content.secondaryAction}
      </div>
    </div>
  );
};

export default CommunityEmptyState;