"use client";

import React from "react";
import { AlertCircle, Loader2, Users } from "lucide-react";
import { Community } from "@/lib/api";
import CommunityCard from "./CommunityCard";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CommunityListProps {
  communities: Community[];
  joinedCommunities: string[];
  loading: boolean;
  error: string | null;
  onJoin: (communityId: string) => Promise<void>;
  onLeave: (communityId: string) => Promise<void>;
  onCommunityClick?: (communityId: string) => void;
}

const CommunityList: React.FC<CommunityListProps> = ({
  communities,
  joinedCommunities,
  loading,
  error,
  onJoin,
  onLeave,
  onCommunityClick,
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {/* Loading skeleton */}
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-xl p-6 animate-pulse"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-muted rounded-lg" />
                <div>
                  <div className="h-5 bg-muted rounded w-32 mb-2" />
                  <div className="h-4 bg-muted rounded w-24" />
                </div>
              </div>
            </div>
            <div className="mb-4">
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-3 bg-muted rounded w-20" />
              <div className="h-8 bg-muted rounded w-16" />
            </div>
          </div>
        ))}
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading communities...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (communities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No communities found
        </h3>
        <p className="text-muted-foreground">
          There are no communities available at the moment. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {communities.map((community) => (
        <CommunityCard
          key={community.community_id}
          community={community}
          isJoined={joinedCommunities.includes(community.community_id)}
          onJoin={onJoin}
          onLeave={onLeave}
          onClick={onCommunityClick}
        />
      ))}
    </div>
  );
};

export default CommunityList;