/**
 * Lazy-loaded components for better performance
 */

import { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/loading";

// Lazy load heavy components
export const LazySearchPage = lazy(() =>
  import("@/components/search/SearchPage").then((module) => ({
    default: module.SearchPage,
  }))
);
export const LazyCommunityChat = lazy(
  () => import("@/components/messaging/CommunityChat")
);
export const LazyProfileForm = lazy(
  () => import("@/components/profile/ProfileForm")
);
export const LazyCreatePost = lazy(
  () => import("@/components/posts/CreatePost")
);

// Wrapper component with Suspense
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minHeight?: string;
}

export function LazyWrapper({
  children,
  fallback,
  minHeight = "200px",
}: LazyWrapperProps) {
  const defaultFallback = (
    <div className="flex items-center justify-center" style={{ minHeight }}>
      <LoadingSpinner />
    </div>
  );

  return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>;
}

// Pre-configured lazy components with Suspense
export function LazySearchPageWithSuspense(props: React.ComponentProps<typeof LazySearchPage>) {
  return (
    <LazyWrapper>
      <LazySearchPage {...props} />
    </LazyWrapper>
  );
}

export function LazyCommunityChatsWithSuspense(props: React.ComponentProps<typeof LazyCommunityChat>) {
  return (
    <LazyWrapper>
      <LazyCommunityChat {...props} />
    </LazyWrapper>
  );
}

export function LazyProfileFormWithSuspense(props: React.ComponentProps<typeof LazyProfileForm>) {
  return (
    <LazyWrapper>
      <LazyProfileForm {...props} />
    </LazyWrapper>
  );
}

export function LazyCreatePostWithSuspense(props: React.ComponentProps<typeof LazyCreatePost>) {
  return (
    <LazyWrapper>
      <LazyCreatePost {...props} />
    </LazyWrapper>
  );
}
