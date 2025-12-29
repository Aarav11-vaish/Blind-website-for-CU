"use client";

import React, { useState } from "react";
import { MessageCircle, Share2, Clock, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlobalPost, likeGlobalPost } from "@/lib/api";
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
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Filter and validate images
  const validImages = React.useMemo(() => {
    if (!post.images || !Array.isArray(post.images)) return [];

    return post.images.filter(img => {
      // Check if image URL is valid
      if (!img || typeof img !== 'string' || !img.trim()) return false;

      // Check if this image has failed to load
      if (failedImages.has(img)) return false;

      // Basic URL validation
      try {
        new URL(img);
        return true;
      } catch {
        // If not a valid URL, check if it's a relative path
        return img.startsWith('/') || img.startsWith('./') || img.startsWith('../');
      }
    });
  }, [post.images, failedImages]);

  const handleImageError = (imageUrl: string) => {
    setFailedImages(prev => new Set([...prev, imageUrl]));
  };

  // Check if current user has liked this post
  const userData = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
  const currentUser = userData ? JSON.parse(userData) : null;
  const isLikedByUser = currentUser && localLikedBy.includes(currentUser.user_id);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isLiking) return;

    setIsLiking(true);

    try {
      if (onLike) {
        await onLike(post._id);
      } else {
        // Default like behavior
        await likeGlobalPost(post._id);
      }

      // Update local state optimistically
      if (isLikedByUser) {
        setLocalLikes(prev => Math.max(0, prev - 1));
        setLocalLikedBy(prev => prev.filter(id => id !== currentUser.user_id));
      } else {
        setLocalLikes(prev => prev + 1);
        setLocalLikedBy(prev => [...prev, currentUser.user_id]);
      }

      toast({
        title: isLikedByUser ? "Post unliked" : "Post liked",
        description: isLikedByUser ? "You removed your like" : "You liked this post",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to like post:", error);
      toast({
        title: "Error",
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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(post._id);
    } else {
      // Default share behavior
      if (navigator.share) {
        navigator.share({
          title: `Post by ${post.randomName}`,
          text: post.content.substring(0, 100) + "...",
          url: window.location.origin + `/dashboard/post/${post._id}`,
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.origin + `/dashboard/post/${post._id}`);
        toast({
          title: "Link copied",
          description: "Post link copied to clipboard",
          variant: "success",
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
      className="cursor-pointer hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
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
        {/* Post header */}
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* User avatar */}
            <div
              className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-primary/20 hover:scale-110"
              aria-hidden="true"
            >
              <span className="text-sm font-medium text-primary">
                {post.randomName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="font-medium text-foreground">
              {post.randomName}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <time dateTime={post.createdAt}>
              {formatTimeAgo(post.createdAt)}
            </time>
          </div>
        </header>

        {/* Post content */}
        <div className="mb-4">
          <p className="text-foreground whitespace-pre-wrap break-words" role="main">
            {post.content}
          </p>
        </div>

        {/* Post images */}
        {validImages.length > 0 && (
          <div className="mb-4 space-y-2">
            {validImages.map((image, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden bg-muted transition-all duration-200 hover:scale-[1.02]">
                <img
                  src={image}
                  alt={`Image ${index + 1} from post by ${post.randomName}`}
                  className="w-full max-h-64 sm:max-h-80 md:max-h-96 object-cover transition-all duration-200"
                  loading="lazy"
                  onError={() => handleImageError(image)}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-6 py-4 pt-0">
        <div className="flex items-center space-x-4">
          {/* Like button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center space-x-1 sm:space-x-2 transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 min-h-[44px] min-w-[44px] ${
              isLikedByUser
                ? "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white border-red-500 dark:border-red-600"
                : "hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400"
            } ${isLiking ? "animate-pulse" : ""}`}
            aria-label={`${isLikedByUser ? 'Unlike' : 'Like'} post by ${post.randomName}`}
            aria-pressed={isLikedByUser}
          >
            <ThumbsUp
              className={`h-3 w-3 sm:h-4 sm:w-4 ${
                isLikedByUser ? "fill-white stroke-white text-white" : ""
              } ${isLiking ? "animate-pulse" : ""}`}
              aria-hidden="true"
            />
            <span>{localLikes}</span>
          </Button>

          {/* Comment button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleComment}
            className={`flex items-center space-x-1 relative text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 min-h-[44px] min-w-[44px] ${
              !onComment ? "opacity-75" : ""
            }`}
            aria-label={`Comment on post by ${post.randomName}`}
          >
            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            <span>{post.commentsCount || 0}</span>
          </Button>

          {/* Share button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-1 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 min-h-[44px] min-w-[44px]"
            aria-label="Share post"
          >
            <Share2 className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            <span className="hidden xs:inline">Share</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostCard;