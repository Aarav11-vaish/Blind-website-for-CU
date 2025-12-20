"use client";

import React, { useState } from "react";
import { ArrowUp, MessageCircle, Share2, Clock, Image as ImageIcon, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlobalPost, likeGlobalPost } from "@/lib/api";
import { designTokens, cn, motionSafe, componentPatterns } from "@/lib/design-system";
import { toast } from "@/components/ui/use-toast";

interface PostCardProps {
  post: GlobalPost;
  onLike?: (postId: string) => Promise<void>;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onClick?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onClick,
}) => {
  const [isLiking, setIsLiking] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes);
  const [localLikedBy, setLocalLikedBy] = useState(post.likedBy);

  // Update local state when post prop changes (for parent-managed state)
  React.useEffect(() => {
    setLocalLikes(post.likes);
    setLocalLikedBy(post.likedBy);
  }, [post.likes, post.likedBy]);

  // Get current user ID from localStorage (if available)
  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      // Decode JWT token to get user ID (basic implementation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || payload.id;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();
  // Use post data directly when onLike is provided (parent manages state)
  const displayLikes = onLike ? post.likes : localLikes;
  const displayLikedBy = onLike ? post.likedBy : localLikedBy;
  const isLikedByUser = currentUserId ? displayLikedBy.includes(currentUserId) : false;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when liking

    if (isLiking) return;

    setIsLiking(true);
    const wasLiked = isLikedByUser;

    try {
      if (onLike) {
        // Use the parent's like handler - it will update the parent's state
        await onLike(post._id);

        // Show success toast
        toast({
          title: wasLiked ? "Post Unliked" : "Post Liked",
          description: wasLiked ? "You removed your like from this post" : "You liked this post",
          variant: wasLiked ? "info" : "success",
        });
      } else {
        // Default like functionality using API
        const response = await likeGlobalPost(post._id);
        setLocalLikes(response.likes);

        // Update likedBy array locally since backend doesn't return it
        if (currentUserId) {
          if (isLikedByUser) {
            setLocalLikedBy(prev => prev.filter(id => id !== currentUserId));
          } else {
            setLocalLikedBy(prev => [...prev, currentUserId]);
          }
        }

        // Show success toast
        toast({
          title: wasLiked ? "Post Unliked" : "Post Liked",
          description: wasLiked ? "You removed your like from this post" : "You liked this post",
          variant: wasLiked ? "info" : "success",
        });
      }
    } catch (error) {
      console.error("Failed to like post:", error);

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

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onComment) {
      onComment(post._id);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      if (onShare) {
        onShare(post._id);
      } else {
        // Default share functionality
        if (navigator.share) {
          await navigator.share({
            title: `Post by ${post.randomName}`,
            text: post.content,
            url: window.location.href,
          });

          toast({
            title: "Post Shared",
            description: "Post shared successfully",
            variant: "success",
          });
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(window.location.href);

          toast({
            title: "Link Copied",
            description: "Post link copied to clipboard",
            variant: "success",
          });
        }
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

  const handleCardClick = () => {
    if (onClick) {
      onClick(post._id);
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

  return (
    <Card
      className={cn(
        componentPatterns.card,
        designTokens.focus.visible
      )}
      onClick={handleCardClick}
      role="article"
      aria-label={`Post by ${post.randomName}`}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <CardContent className="p-6">
        {/* Author and timestamp */}
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                "w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center",
                designTokens.transition.default,
                motionSafe("hover:bg-primary/20 hover:scale-110")
              )}
              aria-hidden="true"
            >
              <span className={cn(
                "text-sm font-medium",
                designTokens.text.brand
              )}>
                {post.randomName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className={cn(
              "font-medium",
              designTokens.text.primary
            )}>
              {post.randomName}
            </span>
          </div>
          <div className={cn(
            "flex items-center space-x-1 text-sm",
            designTokens.text.muted
          )}>
            <Clock className="h-4 w-4" aria-hidden="true" />
            <time dateTime={post.createdAt} aria-label={`Posted ${formatTimeAgo(post.createdAt)}`}>
              {formatTimeAgo(post.createdAt)}
            </time>
          </div>
        </header>

        {/* Post content */}
        <div className="mb-4">
          <p className={cn(
            designTokens.text.primary,
            "whitespace-pre-wrap break-words"
          )} role="main">
            {post.content}
          </p>
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4" role="img" aria-label={`${post.images.length} image${post.images.length > 1 ? 's' : ''} attached to post`}>
            {post.images.length === 1 ? (
              <div className={cn(
                "relative rounded-lg overflow-hidden",
                designTokens.background.muted,
                designTokens.transition.default,
                motionSafe("hover:scale-[1.02]")
              )}>
                <img
                  src={post.images[0]}
                  alt="Post attachment"
                  className={cn(
                    "w-full max-h-96 object-cover",
                    designTokens.transition.default
                  )}
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className={cn(
                  "hidden flex items-center justify-center h-32",
                  designTokens.text.muted
                )} role="img" aria-label="Image unavailable">
                  <ImageIcon className="h-8 w-8" aria-hidden="true" />
                  <span className="ml-2">Image unavailable</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Post images">
                {post.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden bg-muted aspect-square">
                    <img
                      src={image}
                      alt={`Post attachment ${index + 1} of ${post.images.length}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden flex items-center justify-center h-full text-muted-foreground" role="img" aria-label="Image unavailable">
                      <ImageIcon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    {index === 3 && post.images.length > 4 && (
                      <div
                        className="absolute inset-0 bg-black/50 flex items-center justify-center"
                        aria-label={`${post.images.length - 4} more images`}
                      >
                        <span className="text-white font-medium">
                          +{post.images.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-6 py-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2" role="group" aria-label="Post actions">
            <Button
              variant={isLikedByUser ? "default" : "outline"}
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={cn(
                "flex items-center space-x-2 button-press transition-all duration-200",
                designTokens.accessibility.touchTarget,
                isLikedByUser
                  ? "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white border-red-500 dark:border-red-600"
                  : "hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400",
                motionSafe("hover:scale-105 active:scale-95"),
                isLiking && "animate-pulse"
              )}
              aria-label={`${isLikedByUser ? 'Unlike' : 'Like'} post. Currently ${displayLikes} likes`}
              aria-pressed={isLikedByUser}
            >
              <ThumbsUp
                className={cn(
                  "h-4 w-4",
                  isLikedByUser ? "fill-white stroke-white text-white" : "",
                  designTokens.transition.transform,
                  motionSafe("hover:scale-110"),
                  isLiking && motionSafe("animate-pulse")
                )}
                aria-hidden="true"
              />
              <span className="font-medium">{displayLikes}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleComment}
              className={cn(
                "flex items-center space-x-1 button-press",
                designTokens.accessibility.touchTarget,
                motionSafe("hover:scale-105 active:scale-95")
              )}
              aria-label={`View comments. ${post.commentsCount || 0} comments`}
            >
              <MessageCircle className={cn(
                "h-4 w-4",
                motionSafe("hover:rotate-12")
              )} aria-hidden="true" />
              <span>{post.commentsCount || 0}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className={cn(
                "flex items-center space-x-1 button-press",
                designTokens.accessibility.touchTarget,
                motionSafe("hover:scale-105 active:scale-95")
              )}
              aria-label="Share post"
            >
              <Share2 className={cn(
                "h-4 w-4",
                motionSafe("hover:rotate-12")
              )} aria-hidden="true" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostCard;