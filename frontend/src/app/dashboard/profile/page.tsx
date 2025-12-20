"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { User, Mail, Calendar, Save, ArrowLeft } from "lucide-react";

const ProfilePage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, redirectToSignin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    graduationYear: "",
  });

  useEffect(() => {
    // Don't redirect while auth is still loading
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      redirectToSignin(true);
      return;
    }

    if (user) {
      setFormData({
        userName: user.user_name || "",
        email: user.email || "",
        graduationYear: user.graduation_year?.toString() || "",
      });
    }
  }, [user, isAuthenticated, authLoading, redirectToSignin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if there are any changes
    const hasChanges = user && (
      formData.userName !== (user.user_name || "") ||
      formData.graduationYear !== (user.graduation_year?.toString() || "")
    );

    if (!hasChanges) {
      toast({
        title: "No Changes Made",
        description: "Your profile information is already up to date.",
        variant: "info",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Here you would typically make an API call to update the profile
      // For now, we'll just simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update localStorage with new data
      if (user) {
        const updatedUser = {
          ...user,
          user_name: formData.userName,
          graduation_year: parseInt(formData.graduationYear) || undefined,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
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
  if (!isAuthenticated) {
    return null;
  }

  return (
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

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
            <CardDescription>
              Update your profile information and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="userName" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Display Name</span>
                </Label>
                <Input
                  id="userName"
                  name="userName"
                  type="text"
                  value={formData.userName}
                  onChange={handleInputChange}
                  placeholder="Enter your display name"
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  This is how your name will appear to other users.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email Address</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Email address cannot be changed for security reasons.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="graduationYear" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Graduation Year</span>
                </Label>
                <Input
                  id="graduationYear"
                  name="graduationYear"
                  type="number"
                  value={formData.graduationYear}
                  onChange={handleInputChange}
                  placeholder="e.g., 2025"
                  min="2020"
                  max="2030"
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Your expected graduation year.
                </p>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;