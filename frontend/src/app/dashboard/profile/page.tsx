"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import RouteErrorBoundary from "@/components/error/RouteErrorBoundary";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProfileForm } from "@/components/profile";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { profileService, ProfileUpdateResult } from "@/lib/profileService";
import { ProfileFormData } from "@/lib/profileValidation";
import { ArrowLeft, CheckCircle, AlertCircle, Wifi, WifiOff, Clock } from "lucide-react";

const ProfilePage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, redirectToSignin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasPendingUpdates, setHasPendingUpdates] = useState(false);
  const [lastUpdateResult, setLastUpdateResult] = useState<ProfileUpdateResult | null>(null);

  useEffect(() => {
    // Don't redirect while auth is still loading
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      redirectToSignin(true);
      return;
    }

    // Check for pending updates
    if (user) {
      setHasPendingUpdates(profileService.hasUserPendingUpdates(user.user_id));
    }
  }, [user, isAuthenticated, authLoading, redirectToSignin]);

  // Listen for sync completion events
  useEffect(() => {
    const handleSyncComplete = (event: CustomEvent) => {
      const { syncedUsers } = event.detail;
      if (user && syncedUsers.includes(user.user_id)) {
        setHasPendingUpdates(false);
        toast({
          title: "Profile Synced",
          description: "Your profile changes have been synced successfully.",
          variant: "success",
        });
      }
    };

    window.addEventListener("profileSyncComplete", handleSyncComplete as EventListener);
    return () => {
      window.removeEventListener("profileSyncComplete", handleSyncComplete as EventListener);
    };
  }, [user]);

  const handleProfileSubmit = async (formData: ProfileFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "User not found. Please sign in again.",
        variant: "error",
      });
      return;
    }

    setIsLoading(true);
    setLastUpdateResult(null);

    try {
      const result = await profileService.updateProfile(user.user_id, formData);
      setLastUpdateResult(result);

      if (result.success) {
        if (result.wasOffline) {
          setHasPendingUpdates(true);
          toast({
            title: "Saved Locally",
            description: result.message,
            variant: "info",
          });
        } else {
          toast({
            title: "Profile Updated",
            description: result.message,
            variant: "success",
          });
        }
      } else {
        toast({
          title: "Update Failed",
          description: result.message,
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleRetrySync = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      await profileService.syncPendingUpdates();
    } catch (error) {
      console.error("Sync retry failed:", error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync changes. Will retry automatically when online.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          </div>
          <div className="max-w-2xl">
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <RouteErrorBoundary routeName="Profile">
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
          </div>

          {/* Pending Updates Alert */}
          {hasPendingUpdates && (
            <Alert className="max-w-2xl border-blue-200 bg-blue-50">
              <Clock className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 flex items-center justify-between">
                <span>You have unsaved changes that will sync when you're back online.</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetrySync}
                  disabled={isLoading}
                  className="ml-4 border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  {isLoading ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    "Retry Sync"
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Success/Error Feedback */}
          {lastUpdateResult && (
            <Alert className={`max-w-2xl ${lastUpdateResult.success
              ? lastUpdateResult.wasOffline
                ? "border-blue-200 bg-blue-50"
                : "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
              }`}>
              {lastUpdateResult.success ? (
                lastUpdateResult.wasOffline ? (
                  <WifiOff className="h-4 w-4 text-blue-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={
                lastUpdateResult.success
                  ? lastUpdateResult.wasOffline
                    ? "text-blue-800"
                    : "text-green-800"
                  : "text-red-800"
              }>
                {lastUpdateResult.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Profile Form */}
          <ProfileForm
            user={user}
            onSubmit={handleProfileSubmit}
            isLoading={isLoading}
          />
        </div>
      </DashboardLayout>
    </RouteErrorBoundary>
  );
};

export default ProfilePage;