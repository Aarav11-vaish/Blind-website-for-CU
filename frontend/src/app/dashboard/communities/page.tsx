"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { CommunityList } from "@/components/communities";
import { ErrorBoundary, ErrorDisplay } from "@/components/error";
import { LoadingOverlay } from "@/components/loading";
import {
  Community,
  getCommunities,
  joinCommunity,
  leaveCommunity,
  JoinCommunityData
} from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { toast } from "@/components/ui/use-toast";

// Helper function to get initial joined communities
const getInitialJoinedCommunities = (): string[] => {
  try {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.joinedCommunities && Array.isArray(parsedUser.joinedCommunities)) {
        return parsedUser.joinedCommunities;
      }
    }
  } catch (err) {
    console.error("Failed to load user communities:", err);
  }
  return [];
};

const CommunitiesPage = () => {
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>(() => getInitialJoinedCommunities());
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { redirectToSignin } = useAuth();

  const { handleError } = useErrorHandler({
    onAuthError: () => redirectToSignin(true),
  });

  const fetchCommunities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check authentication before making API call
      const token = localStorage.getItem("token");
      if (!token) {
        redirectToSignin(true);
        return;
      }

      const response = await getCommunities();
      setCommunities(response.communities);
    } catch (err) {
      console.error("Failed to load communities:", err);

      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase();

        if (errorMessage.includes("unauthorized") || errorMessage.includes("token")) {
          redirectToSignin(true);
          return;
        }

        setError(err.message);
      } else {
        setError("An unexpected error occurred while loading communities.");
      }
    } finally {
      setLoading(false);
    }
  }, [redirectToSignin]);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);



  const handleJoinCommunity = useCallback(async (communityId: string) => {
    try {
      // Check authentication before making API call
      const token = localStorage.getItem("token");
      if (!token) {
        redirectToSignin(true);
        return;
      }

      const joinData: JoinCommunityData = { community_id: communityId };
      await joinCommunity(joinData);

      // Update local state
      setJoinedCommunities(prev => [...prev, communityId]);

      // Update user data in localStorage
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        parsedUser.joinedCommunities = [...(parsedUser.joinedCommunities || []), communityId];
        localStorage.setItem("user", JSON.stringify(parsedUser));
      }

      // Update member count in communities list
      setCommunities(prevCommunities =>
        prevCommunities.map(community =>
          community.community_id === communityId
            ? { ...community, memberCount: community.memberCount + 1 }
            : community
        )
      );

      // Show success toast
      const communityName = communities.find(c => c.community_id === communityId)?.name || "Community";
      toast({
        title: "Joined Community",
        description: `You have successfully joined ${communityName}`,
        variant: "success",
      });
    } catch (err) {
      const parsedError = handleError(err, "joinCommunity");
      if (parsedError.shouldRedirectToAuth) {
        return;
      }
      throw err; // Re-throw to let CommunityCard handle the error
    }
  }, [redirectToSignin, handleError]);

  const handleLeaveCommunity = useCallback(async (communityId: string) => {
    try {
      // Check authentication before making API call
      const token = localStorage.getItem("token");
      if (!token) {
        redirectToSignin(true);
        return;
      }

      const leaveData: JoinCommunityData = { community_id: communityId };
      await leaveCommunity(leaveData);

      // Update local state
      setJoinedCommunities(prev => prev.filter(id => id !== communityId));

      // Update user data in localStorage
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        parsedUser.joinedCommunities = (parsedUser.joinedCommunities || []).filter(
          (id: string) => id !== communityId
        );
        localStorage.setItem("user", JSON.stringify(parsedUser));
      }

      // Update member count in communities list
      setCommunities(prevCommunities =>
        prevCommunities.map(community =>
          community.community_id === communityId
            ? { ...community, memberCount: Math.max(0, community.memberCount - 1) }
            : community
        )
      );

      // Show success toast
      const communityName = communities.find(c => c.community_id === communityId)?.name || "Community";
      toast({
        title: "Left Community",
        description: `You have left ${communityName}`,
        variant: "info",
      });
    } catch (err) {
      const parsedError = handleError(err, "leaveCommunity");
      if (parsedError.shouldRedirectToAuth) {
        return;
      }
      throw err; // Re-throw to let CommunityCard handle the error
    }
  }, [communities, redirectToSignin, handleError]);

  const handleCommunityClick = useCallback((communityId: string) => {
    // Navigate to community feed (this will be implemented in a future task)
    router.push(`/dashboard/community/${communityId}`);
  }, [router]);

  const handleRetry = useCallback(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <LoadingOverlay isLoading={loading && !communities?.length}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">Communities</h1>
              <p className="text-muted-foreground">
                Discover and join communities that interest you
              </p>
            </div>

            {error ? (
              <ErrorDisplay
                error={error}
                onRetry={handleRetry}
                retryLabel="Reload Communities"
              />
            ) : (
              <CommunityList
                communities={communities || []}
                joinedCommunities={joinedCommunities}
                loading={loading}
                error={null}
                onJoin={handleJoinCommunity}
                onLeave={handleLeaveCommunity}
                onCommunityClick={handleCommunityClick}
              />
            )}
          </div>
        </LoadingOverlay>
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default CommunitiesPage;