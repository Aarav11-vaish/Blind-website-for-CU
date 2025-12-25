"use client";

import React from "react";
import { GlobalPost } from "@/lib/api";
import PostCard from "./PostCard";
import PostActions from "./PostActions";
import { cn } from "@/lib/utils";

interface UserPostCardProps {
  post: GlobalPost;
  onView?: (postId: string) => void;
  onDelete?: (postId: string) => Promise<void>;
  onLike?: (postId: string) => Promise<void>;
  className?: string;
}

const UserPostCard: React.FC<UserPostCardProps> = ({
  post,
  onView,
  onDelete,
  onLike,
  className,
}) => {
  return (
    <div className={cn("relative", className)}>
      <PostCard
        post={post}
        onLike={onLike}
        onClick={onView}
      />

      {/* Post actions positioned in top-right corner */}
      <div className="absolute top-4 right-4">
        <PostActions
          postId={post._id}
          onView={onView}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default UserPostCard;