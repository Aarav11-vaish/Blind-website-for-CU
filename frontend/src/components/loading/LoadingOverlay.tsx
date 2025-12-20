"use client";

import React from "react";
import LoadingSpinner from "./LoadingSpinner";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  className?: string;
  children: React.ReactNode;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text = "Loading...",
  className,
  children,
}) => {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-card border rounded-lg p-6 shadow-lg">
            <LoadingSpinner text={text} />
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingOverlay;