"use client";

import React, { useState } from "react";
import { Users, UserPlus, UserMinus } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Community } from "@/lib/api";
import { designTokens, cn, motionSafe, componentPatterns } from "@/lib/design-system";

interface CommunityCardProps {
  community: Community;
  isJoined: boolean;
  onJoin: (communityId: string) => Promise<void>;
  onLeave: (communityId: string) => Promise<void>;
  onClick?: (communityId: string) => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  community,
  isJoined,
  onJoin,
  onLeave,
  onClick,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinLeave = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when joining/leaving

    if (isLoading) return;

    setIsLoading(true);

    try {
      if (isJoined) {
        await onLeave(community.community_id);
      } else {
        await onJoin(community.community_id);
      }
    } catch (error) {
      console.error("Failed to join/leave community:", error);
      // Error handling is done by parent component
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(community.community_id);
    }
  };

  const formatMemberCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <Card
      className={cn(
        componentPatterns.card,
        designTokens.focus.visible
      )}
      onClick={handleCardClick}
      role="article"
      aria-label={`${community.name} community`}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <CardContent className="p-6">
        {/* Community header */}
        <header className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Community icon/avatar */}
            <div
              className={cn(
                "w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center",
                designTokens.transition.default,
                motionSafe("hover:bg-primary/20 hover:scale-110")
              )}
              aria-hidden="true"
            >
              {community.icon ? (
                <img
                  src={community.icon}
                  alt=""
                  className={cn(
                    "w-8 h-8 rounded",
                    designTokens.transition.default
                  )}
                  loading="lazy"
                />
              ) : (
                <span className={cn(
                  "text-lg font-bold",
                  designTokens.text.brand
                )}>
                  {community.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className={cn(
                "font-semibold text-lg",
                designTokens.text.primary
              )}>
                {community.name}
              </h3>
              <div className={cn(
                "flex items-center space-x-1 text-sm",
                designTokens.text.muted
              )}>
                <Users className="h-4 w-4" aria-hidden="true" />
                <span aria-label={`${community.memberCount} members`}>
                  {formatMemberCount(community.memberCount)} members
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Community description */}
        <div className="mb-4">
          <p className={cn(
            designTokens.text.muted,
            "text-sm line-clamp-3"
          )} role="main">
            {community.description}
          </p>
        </div>
      </CardContent>

      <CardFooter className="px-6 py-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <div className={cn(
            "text-xs",
            designTokens.text.muted
          )}>
            <time dateTime={community.createdAt}>
              Created {new Date(community.createdAt).toLocaleDateString()}
            </time>
          </div>

          <Button
            variant={isJoined ? "outline" : "default"}
            size="sm"
            onClick={handleJoinLeave}
            disabled={isLoading}
            className={cn(
              "flex items-center space-x-1 button-press",
              designTokens.accessibility.touchTarget,
              motionSafe("hover:scale-105 active:scale-95")
            )}
            aria-label={`${isJoined ? 'Leave' : 'Join'} ${community.name} community`}
            aria-pressed={isJoined}
          >
            {isLoading ? (
              <div
                className={cn(
                  "h-4 w-4 rounded-full border-2 border-current border-t-transparent",
                  motionSafe(designTokens.animation.spin)
                )}
                aria-hidden="true"
              />
            ) : isJoined ? (
              <UserMinus className={cn(
                "h-4 w-4",
                motionSafe("hover:rotate-12")
              )} aria-hidden="true" />
            ) : (
              <UserPlus className={cn(
                "h-4 w-4",
                motionSafe("hover:rotate-12")
              )} aria-hidden="true" />
            )}
            <span>{isJoined ? "Leave" : "Join"}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CommunityCard;