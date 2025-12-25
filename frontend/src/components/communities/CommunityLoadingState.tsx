"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CommunityLoadingStateProps {
  showHeader?: boolean;
  postCount?: number;
}

const CommunityLoadingState: React.FC<CommunityLoadingStateProps> = ({
  showHeader = true,
  postCount = 3,
}) => {
  return (
    <div className="space-y-6">
      {/* Community Header Skeleton */}
      {showHeader && (
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      )}

      {/* Posts Loading Skeletons */}
      <div className="space-y-4">
        {showHeader && <Skeleton className="h-6 w-32" />}
        {[...Array(postCount)].map((_, index) => (
          <div key={index} className="bg-card rounded-lg border p-6 space-y-4">
            {/* Post Header */}
            <div className="flex items-center space-x-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>

            {/* Post Content */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Post Image (sometimes) */}
            {index % 2 === 0 && (
              <Skeleton className="h-48 w-full rounded-md" />
            )}

            {/* Post Actions */}
            <div className="flex items-center space-x-6 pt-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button Skeleton */}
      <div className="flex justify-center pt-4">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
};

export default CommunityLoadingState;