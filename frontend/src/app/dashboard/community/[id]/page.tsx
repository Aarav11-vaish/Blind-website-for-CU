"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  GlobalPost,
  Community,
  getCommunityPosts,
  getFilteredCommunityPosts,
  likeGlobalPost
} from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Users, Plus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/posts/PostCard";
import CreatePost from "@/components/posts/CreatePost";
import CommunityEmptyState from "@/components/communities/CommunityEmptyState";
import CommunityLoadingState from "@/components/communities/CommunityLoadingState";
import CommunityErrorBoundary from "@/components/communities/CommunityErrorBoundary";
import { CommunityChat } from "@/components/messaging";

const CommunityFeedPage = () => {
  const params = useParams();
  const router = useRouter();
  const communityId = params.id as string;

  const [posts, setPosts] = useState<GlobalPost[]>([]);
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"network" | "auth" | "server" | "not-found" | "unknown">("unknown");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [activeTab, setActiveTab] = useState("posts");
  const [userInfo, setUserInfo] = useState<{ userId: string; randomName: string } | null>(null);
  const maxRetries = 3;

  const { redirectToSignin } = useAuth();

  useEffect(() => {
    if (communityId) {
      loadCommunityData();
    }

    // Extract user info from token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserInfo({
          userId: payload.user_id || payload.id,
          randomName: payload.user_name || payload.randomName || 'Anonymous'
        });
      } catch (e) {
        console.error("Error parsing token:", e);
      }
    }
  }, [communityId]);

  const loadCommunityData = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const token = localStorage.getItem("token");
      if (!token) {
        redirectToSignin(true);
        return;
      }

      let communityData: Community | null = null;
      let communityPosts: GlobalPost[] = [];

      try {
        // Try to use the dedicated community posts API first
        const response = await getCommunityPosts(communityId, pageNum);
        communityPosts = response.posts;
        communityData = response.community;
        setHasMore(response.posts.length === 10); // Assuming 10 is the default limit
      } catch (apiError) {
        console.log("Community posts API not available, using fallback filtering");

        // Fallback to filtering global posts
        const fallbackData = await getFilteredCommunityPosts(communityId);
        communityPosts = fallbackData.posts;
        communityData = fallbackData.community;
        setHasMore(false); // No pagination for fallback
      }

      if (!communityData) {
        setError("Community not found");
        setErrorType("not-found");
        return;
      }

      setCommunity(communityData);

      if (append) {
        setPosts(prevPosts => [...prevPosts, ...communityPosts]);
      } else {
        setPosts(communityPosts);
      }

      // Reset retry count on successful load
      setRetryCount(0);

    } catch (err) {
      console.error("Failed to load community data:", err);

      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase();

        if (errorMessage.includes("unauthorized") || errorMessage.includes("token")) {
          setErrorType("auth");
          redirectToSignin(true);
          return;
        }

        if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
          setError("Connection error. Please check your internet connection and try again.");
          setErrorType("network");
        } else if (errorMessage.includes("server") || errorMessage.includes("500")) {
          setError("Server error. Please try again in a moment.");
          setErrorType("server");
        } else {
          setError(err.message);
          setErrorType("unknown");
        }
      } else {
        setError("An unexpected error occurred while loading the community.");
        setErrorType("unknown");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadCommunityData(nextPage, true);
    }
  };

  const handleBack = () => {
    router.push("/dashboard/communities");
  };

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setPage(1);
      loadCommunityData();
    }
  };

  const handleCreatePost = () => {
    setShowCreatePost(true);
  };

  const handlePostCreated = (newPost: GlobalPost) => {
    // Add the new post to the beginning of the list
    setPosts(prevPosts => [newPost, ...prevPosts]);
    setShowCreatePost(false);
  };

  const handleCancelPost = () => {
    setShowCreatePost(false);
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
            <div className="flex items-center justify-between">
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
              <Button
                onClick={handleCreatePost}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Post</span>
              </Button>
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

        {/* Create Post Form */}
        {showCreatePost && (
          <CreatePost
            communityId={communityId}
            onPostCreated={handlePostCreated}
            onCancel={handleCancelPost}
          />
        )}

        {/* Main Content Tabs */}
        {!loading && !error && community && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="posts" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Posts</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Chat</span>
              </TabsTrigger>
            </TabsList>

            {/* Posts Tab */}
            <TabsContent value="posts" className="space-y-4">
              {posts.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">
                      {community.name} Posts
                    </h2>
                    <Button
                      onClick={handleCreatePost}
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>New Post</span>
                    </Button>
                  </div>

                  {posts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onLike={handleLike}
                      onComment={handleComment}
                      onShare={handleShare}
                    />
                  ))}

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="flex justify-center pt-4">
                      <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="flex items-center space-x-2"
                      >
                        {loadingMore && <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                        <span>{loadingMore ? "Loading..." : "Load More Posts"}</span>
                      </Button>
                    </div>
                  )}
                </div>
              ) : !showCreatePost ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No posts in this community yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to share something with the {community.name} community!
                  </p>
                  <Button onClick={handleCreatePost} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Create First Post</span>
                  </Button>
                </div>
              ) : null}
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat" className="space-y-4">
              {userInfo ? (
                <div className="h-[600px]">
                  <CommunityChat
                    communityId={communityId}
                    communityName={community.name}
                    userId={userInfo.userId}
                    randomName={userInfo.randomName}
                    className="h-full"
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Unable to load chat
                  </h3>
                  <p className="text-muted-foreground">
                    Please refresh the page to access the community chat.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CommunityFeedPage;