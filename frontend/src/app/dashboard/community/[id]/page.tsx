"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { GlobalPost, getGlobalPosts, Community, getCommunities, likeGlobalPost } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/posts/PostCard";

const CommunityFeedPage = () => {
  const params = useParams();
  const router = useRouter();
  const communityId = params.id as string;

  const [posts, setPosts] = useState<GlobalPost[]>([]);
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { redirectToSignin } = useAuth();

  useEffect(() => {
    if (communityId) {
      loadCommunityData();
    }
  }, [communityId]);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        redirectToSignin(true);
        return;
      }

      // Load community info and posts
      const [communitiesResponse, postsResponse] = await Promise.all([
        getCommunities(),
        getGlobalPosts()
      ]);

      // Find the specific community
      const foundCommunity = communitiesResponse.communities.find(
        c => c.community_id === communityId
      );

      if (!foundCommunity) {
        setError("Community not found");
        return;
      }

      setCommunity(foundCommunity);

      // Filter posts for this community (if community posts are available)
      // For now, show all posts as the backend doesn't have community-specific endpoints
      setPosts(postsResponse.posts);

    } catch (err) {
      console.error("Failed to load community data:", err);

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
        setError("An unexpected error occurred while loading the community.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard/communities");
  };

  const handleRetry = () => {
    loadCommunityData();
  };

  const handleLike = async (postId: string) => {
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

  const handleComment = (postId: string) => {
    router.push(`/dashboard/post/${postId}`);
  };

  const handleShare = (postId: string) => {
    // Implement share functionality
    console.log("Share post:", postId);
  };

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
          <span>Back to Communities</span>
        </Button>

        {/* Community Header */}
        {community && !loading && (
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{community.name}</h1>
                <p className="text-muted-foreground">{community.description}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {community.memberCount} members
                </p>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
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

        {/* Posts Feed */}
        {posts.length > 0 && !loading && !error && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Community Posts</h2>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
              />
            ))}
          </div>
        )}

        {posts.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts in this community yet.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CommunityFeedPage;