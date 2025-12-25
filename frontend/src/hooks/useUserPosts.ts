"use client";

import { useState, useEffect, useCallback } from "react";
import { GlobalPost, getUserPosts, deleteUserPost } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

interface UseUserPostsState {
  posts: GlobalPost[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  totalCount: number;
}

interface UseUserPostsReturn extends UseUserPostsState {
  fetchPosts: () => Promise<void>;
  loadMore: () => Promise<void>;
  deletePosts: (postId: string) => Promise<void>;
  retry: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useUserPosts(userId: string | null): UseUserPostsReturn {
  const [state, setState] = useState<UseUserPostsState>({
    posts: [],
    loading: false,
    error: null,
    hasMore: true,
    page: 1,
    totalCount: 0,
  });

  const fetchPosts = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (!userId) {
        setState((prev) => ({
          ...prev,
          error: "User not authenticated",
          loading: false,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const response = await getUserPosts(userId, page, 10);

        setState((prev) => ({
          ...prev,
          posts: append ? [...prev.posts, ...response.posts] : response.posts,
          loading: false,
          hasMore:
            response.posts.length === 10 && response.totalCount > page * 10,
          page: page,
          totalCount: response.totalCount,
          error: null,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch posts";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      }
    },
    [userId]
  );

  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;

    await fetchPosts(state.page + 1, true);
  }, [fetchPosts, state.loading, state.hasMore, state.page]);

  const deletePosts = useCallback(
    async (postId: string) => {
      if (!userId) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "error",
        });
        return;
      }

      try {
        await deleteUserPost(userId, postId);

        // Remove post from local state
        setState((prev) => ({
          ...prev,
          posts: prev.posts.filter((post) => post._id !== postId),
          totalCount: prev.totalCount - 1,
        }));

        toast({
          title: "Post Deleted",
          description: "Your post has been successfully deleted",
          variant: "success",
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete post";
        toast({
          title: "Delete Failed",
          description: errorMessage,
          variant: "error",
        });
      }
    },
    [userId]
  );

  const retry = useCallback(() => {
    return fetchPosts(1, false);
  }, [fetchPosts]);

  const refresh = useCallback(() => {
    return fetchPosts(1, false);
  }, [fetchPosts]);

  // Initial fetch
  useEffect(() => {
    if (userId) {
      const timer = setTimeout(() => {
        fetchPosts(1, false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [userId, fetchPosts]);

  return {
    ...state,
    fetchPosts: () => fetchPosts(1, false),
    loadMore,
    deletePosts,
    retry,
    refresh,
  };
}
