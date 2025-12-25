"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import RouteErrorBoundary from "@/components/error/RouteErrorBoundary";
import { EmptyState } from "@/components/empty";
import { PostSkeleton } from "@/components/loading";
import { ErrorRetry } from "@/components/error";
import UserPostCard from "@/components/posts/UserPostCard";
import { Button } from "@/components/ui/button";
import { useUserPosts } from "@/hooks/useUserPosts";
import { useAuth } from "@/hooks/useAuth";
import { PlusCircle, RefreshCw, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const MyPostsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const {
    posts,
    loading,
    error,
    hasMore,
    totalCount,
    loadMore,
    deletePosts,
    retry,
    refresh,
  } = useUserPosts(user?.user_id || null);

  const handleViewPost = (postId: string) => {
    router.push(`/dashboard/post/${postId}`);
  };

  const handleCreatePost = () => {
    router.push("/dashboard/create-post");
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadMore();
    }
  };

  // Error state
  if (error && posts.length === 0) {
    return (
      <RouteErrorBoundary routeName="My Posts">
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">My Posts</h1>
                <p className="text-muted-foreground">
                  Manage and view all your posts
                </p>
              </div>
              <Button onClick={handleCreatePost} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Create Post
              </Button>
            </div>

            <ErrorRetry
              error={error}
              onRetry={retry}
              isRetrying={loading}
              title="Failed to Load Posts"
              description="We couldn't load your posts right now. Please try again."
            />
          </div>
        </DashboardLayout>
      </RouteErrorBoundary>
    );
  }

  return (
    <RouteErrorBoundary routeName="My Posts">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Posts</h1>
              <p className="text-muted-foreground">
                {totalCount > 0
                  ? `You have ${totalCount} post${totalCount === 1 ? '' : 's'}`
                  : "Manage and view all your posts"
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={refresh}
                variant="outline"
                size="sm"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Refresh
              </Button>
              <Button onClick={handleCreatePost} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Create Post
              </Button>
            </div>
          </div>

          {/* Content */}
          {loading && posts.length === 0 ? (
            <PostSkeleton count={3} />
          ) : posts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Posts Yet"
              description="You haven't created any posts yet. Share your thoughts, experiences, or questions with the community!"
              actionLabel="Create Your First Post"
              onAction={handleCreatePost}
            />
          ) : (
            <div className="space-y-6">
              {/* Posts list */}
              <div className="space-y-6">
                {posts.map((post) => (
                  <UserPostCard
                    key={post._id}
                    post={post}
                    onView={handleViewPost}
                    onDelete={deletePosts}
                  />
                ))}
              </div>

              {/* Load more button */}
              {hasMore && (
                <div className="flex justify-center pt-6">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More Posts"
                    )}
                  </Button>
                </div>
              )}

              {/* Loading indicator for pagination */}
              {loading && posts.length > 0 && (
                <div className="flex justify-center py-4">
                  <PostSkeleton count={2} />
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </RouteErrorBoundary>
  );
};

export default MyPostsPage;