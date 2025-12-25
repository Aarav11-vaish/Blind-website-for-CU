"use client";

import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PostSkeletonProps {
  count?: number;
  className?: string;
}

const PostSkeleton: React.FC<PostSkeletonProps> = ({
  count = 3,
  className
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardContent className="p-6">
            {/* Author and timestamp skeleton */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="h-4 bg-muted rounded w-24" />
              </div>
              <div className="h-4 bg-muted rounded w-16" />
            </div>

            {/* Content skeleton */}
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>

            {/* Image skeleton (show for every other item) */}
            {index % 2 === 0 && (
              <div className="mb-4">
                <div className="h-48 bg-muted rounded-lg" />
              </div>
            )}
          </CardContent>

          <CardFooter className="px-6 py-4 pt-0">
            <div className="flex items-center space-x-2">
              <div className="h-8 bg-muted rounded w-16" />
              <div className="h-8 bg-muted rounded w-16" />
              <div className="h-8 bg-muted rounded w-16" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default PostSkeleton;