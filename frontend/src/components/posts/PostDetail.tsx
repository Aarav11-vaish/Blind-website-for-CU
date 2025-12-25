"use client";

import React, { useState } from "react";
import { MessageCircle, Share2, Clock, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlobalPost, likeGlobalPost } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ThumbsUp } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface PostDetailProps {
  post: GlobalPost;
  onPostUpdate?: (updatedPost: GlobalPost) => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ post, onPostUpdate }) => {
  const [isLiking, setIsLiking] = useState(false);
  const [localPost, setLocalPost] = useState(post);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageError = (imageUrl: string) => {
    setFailedImages(prev => new Set([...prev, imageUrl]));
  };

  // Filter valid images
  const validImages = React.useMemo(() => {
    if (!localPost.images || !Array.isArray(localPost.images)) return [];

    return localPost.images.filter(img => {
      if (!img || typeof img !== 'string' || !img.trim()) return false;
      if (failedImages.has(img)) return false;
      return true;
    });
  }, [localPost.images, failedImages]);

  // Get current user ID from localStorage
  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || payload.id;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();
  const isLikedByUser = currentUserId ? localPost.likedBy.includes(currentUserId) : false;

  const handleLike = async () => {
    if (isLiking || !currentUserId) return;

    setIsLiking(true);
    const wasLiked = isLikedByUser;

    try {
      const response = await likeGlobalPost(localPost._id);

      // Update likedBy array locally since backend doesn't return it
      let updatedLikedBy = [...localPost.likedBy];
      if (currentUserId) {
        if (isLikedByUser) {
          updatedLikedBy = updatedLikedBy.filter(id => id !== currentUserId);
        } else {
          updatedLikedBy = [...updatedLikedBy, currentUserId];
        }
      }

      const updatedPost = {
        ...localPost,
        likes: response.likes,
        likedBy: updatedLikedBy
      };
      setLocalPost(updatedPost);
      onPostUpdate?.(updatedPost);

      // Show success toast
      toast({
        title: wasLiked ? "Post Unliked" : "Post Liked",
        description: wasLiked ? "You removed your like from this post" : "You liked this post",
        variant: wasLiked ? "info" : "success",
      });
    } catch (error) {
      // Show error toast
      toast({
        title: "Action Failed",
        description: "Failed to update like. Please try again.",
        variant: "error",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${localPost.randomName}`,
          text: localPost.content,
          url: window.location.href,
        });

        toast({
          title: "Post Shared",
          description: "Post shared successfully",
          variant: "success",
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);

        toast({
          title: "Link Copied",
          description: "Post link copied to clipboard",
          variant: "success",
        });
      }
    } catch (error) {
      // User cancelled share or clipboard failed
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          title: "Share Failed",
          description: "Failed to share post. Please try again.",
          variant: "error",
        });
      }
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Main Post Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-primary">
                  {localPost.randomName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {localPost.randomName}
                </h3>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span title={formatFullDate(localPost.createdAt)}>
                    {formatTimeAgo(localPost.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Post content */}
          <div>
            <p className="text-foreground whitespace-pre-wrap break-words text-base leading-relaxed">
              {localPost.content}
            </p>
          </div>

          {/* Images */}
          {validImages.length > 0 && (
            <div>
              {validImages.length === 1 ? (
                <div className="relative rounded-lg overflow-hidden bg-muted">
                  <img
                    src={validImages[0]}
                    alt="Post image"
                    className="w-full max-h-[500px] object-contain"
                    onError={() => handleImageError(validImages[0])}
                  />
                  <div className="hidden flex items-center justify-center h-32 text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                    <span className="ml-2">Image unavailable</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {validImages.map((image, index) => (
                    <div key={`${localPost._id}-detail-img-${index}`} className="relative rounded-lg overflow-hidden bg-muted aspect-square">
                      <img
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onError={() => handleImageError(image)}
                      />
                      <div className="hidden flex items-center justify-center h-full text-muted-foreground">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <Button
                variant={isLikedByUser ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                disabled={isLiking}
                className={cn(
                  "flex items-center space-x-2 transition-all duration-200",
                  isLikedByUser
                    ? "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white border-red-500 dark:border-red-600"
                    : "hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400",
                  isLiking && "animate-pulse"
                )}
              >
                <ThumbsUp
                  className={cn(
                    "h-4 w-4",
                    isLikedByUser ? "fill-white stroke-white text-white" : ""
                  )}
                />
                <span className="font-medium">{localPost.likes}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{localPost.commentsCount || 0}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            Comments ({localPost.commentsCount || 0})
          </h3>
        </CardHeader>

        <CardContent>
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h4 className="text-sm font-medium text-foreground mb-1">
              Comments coming soon
            </h4>
            <p className="text-sm text-muted-foreground">
              We&apos;re working on bringing you the ability to comment and engage with posts. Stay tuned!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostDetail;