"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PostList } from "@/components/posts";
import { GlobalPost, getGlobalPosts, likeGlobalPost } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const Posts = () => {
  const [posts, setPosts] = useState<GlobalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, redirectToSignin } = useAuth();

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check authentication before making API call
      const token = localStorage.getItem("token");
      if (!token) {
        redirectToSignin(true);
        return;
      }

      const response = await getGlobalPosts();
      setPosts(response.posts);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error("Failed to load posts:", err);

      // Handle different types of errors
      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase();

        // Handle authentication errors
        if (errorMessage.includes("unauthorized") || errorMessage.includes("token")) {
          redirectToSignin(true);
          return;
        }

        // Handle network errors
        if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
          setError("Connection error. Please check your internet connection and try again.");
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred while loading posts.");
      }
    } finally {
      setLoading(false);
    }
  }, [redirectToSignin]);

  useEffect(() => {
    // Only load posts if user is authenticated
    if (!authLoading && isAuthenticated) {
      loadPosts();
    } else if (!authLoading && !isAuthenticated) {
      // Redirect to signin if not authenticated
      redirectToSignin(true);
    }
  }, [authLoading, isAuthenticated, loadPosts, redirectToSignin]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    loadPosts();
  };

  const handlePostLike = async (postId: string) => {
    try {
      // Check authentication before making API call
      const token = localStorage.getItem("token");
      if (!token) {
        redirectToSignin(true);
        return;
      }

      const response = await likeGlobalPost(postId);

      // Update the local post state with new like data
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post._id === postId) {
            // Get current user ID to update likedBy array
            const token = localStorage.getItem("token");
            let currentUserId = null;
            try {
              if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                currentUserId = payload.user_id || payload.id;
              }
            } catch (e) {
              console.error("Error parsing token:", e);
            }

            // Update likedBy array locally since backend doesn't return it
            let updatedLikedBy = [...post.likedBy];
            if (currentUserId) {
              const isCurrentlyLiked = post.likedBy.includes(currentUserId);
              if (isCurrentlyLiked) {
                updatedLikedBy = updatedLikedBy.filter(id => id !== currentUserId);
              } else {
                updatedLikedBy = [...updatedLikedBy, currentUserId];
              }
            }

            return { ...post, likes: response.likes, likedBy: updatedLikedBy };
          }
          return post;
        })
      );
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
    const post = posts.find(p => p._id === postId);
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

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <section>
        <PostList
          posts={[]}
          loading={true}
          error={null}
          onPostLike={handlePostLike}
          onPostComment={handlePostComment}
          onPostShare={handlePostShare}
          onPostClick={handlePostClick}
        />
      </section>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <section>
      <PostList
        posts={posts}
        loading={loading}
        error={error}
        onPostLike={handlePostLike}
        onPostComment={handlePostComment}
        onPostShare={handlePostShare}
        onPostClick={handlePostClick}
      />
      {error && (
        <div className="mt-4 text-center">
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </section>
  );
};

export default Posts;
