"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: React.ReactNode;
  variant?: "cards" | "posts" | "images" | "sidebar";
  className?: string;
  gap?: "sm" | "md" | "lg";
  role?: string;
  ariaLabel?: string;
}

const gapClasses = {
  sm: "gap-2 sm:gap-3",
  md: "gap-4 sm:gap-6",
  lg: "gap-6 sm:gap-8",
};

const gridVariants = {
  cards: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  posts: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  images: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
  sidebar: "grid grid-cols-1 lg:grid-cols-4",
};

export function ResponsiveGrid({
  children,
  variant = "cards",
  className,
  gap = "md",
  role = "grid",
  ariaLabel,
}: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        gridVariants[variant],
        gapClasses[gap],
        className
      )}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}

export default ResponsiveGrid;