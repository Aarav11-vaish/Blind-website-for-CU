"use client";

import React from "react";
import PostCard from "./PostCard";
import { GlobalPost } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, MessageCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PostListProps {
  posts: GlobalPost[];
  loading?: boolean;
  error?: string | null;
  onPostLike?: (postId: string) => Promise<void>;
  onPostComment?: (postId: string) => void;
  onPostShare?: (postId: string) => void;
  onPostClick?: (postId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

const PostListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-6">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState: React.FC<{ message?: string }> = ({
  message = "No posts available. Be the first to share something!"
}) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
      <MessageCircle className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-medium text-foreground mb-2">No Posts Yet</h3>
    <p className="text-muted-foreground max-w-md mx-auto">
      {message}
    </p>
  </div>
);

const PostList: React.FC<PostListProps> = ({
  posts,
  loading = false,
  error = null,
  onPostLike,
  onPostComment,
  onPostShare,
  onPostClick,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
}) => {
  if (loading && posts.length === 0) {
    return <PostListSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!loading && posts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onLike={onPostLike}
          onComment={onPostComment}
          onShare={onPostShare}
          onClick={onPostClick}
        />
      ))}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadingMore ? "Loading..." : "Load More Posts"}
          </button>
        </div>
      )}

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="py-4">
          <PostListSkeleton count={2} />
        </div>
      )}
    </div>
  );
};

export default PostList;