"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PostDetail from "@/components/posts/PostDetail";
import { GlobalPost, getGlobalPosts } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PostDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<GlobalPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { redirectToSignin } = useAuth();

  const loadPost = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        redirectToSignin(true);
        return;
      }

      // For now, we'll fetch all posts and find the specific one
      // In a real implementation, there would be a getPostById endpoint
      const response = await getGlobalPosts();
      const foundPost = response.posts.find(p => p._id === postId);

      if (!foundPost) {
        setError("Post not found");
        return;
      }

      setPost(foundPost);
    } catch (err) {
      console.error("Failed to load post:", err);

      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase();

        if (errorMessage.includes("unauthorized") || errorMessage.includes("token")) {
          redirectToSignin(true);
          return;
        }

        if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
          setError("Connection error. Please check your internet connection and try again.");
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred while loading the post.");
      }
    } finally {
      setLoading(false);
    }
  }, [postId, redirectToSignin]);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId, loadPost]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleRetry = useCallback(() => {
    loadPost();
  }, [loadPost]);



  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={handleBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Feed</span>
        </Button>

        {loading && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 space-y-4">
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
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {post && !loading && !error && (
          <PostDetail
            post={post}
            onPostUpdate={setPost}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default PostDetailPage;