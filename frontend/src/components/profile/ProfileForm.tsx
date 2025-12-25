"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Save, AlertCircle, CheckCircle, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ProfileFormData,
  validateField,
  validateProfileForm,
  hasFormChanged,
  sanitizeProfileData,
  getCharacterCount,
} from "@/lib/profileValidation";
import { OfflineDetector } from "@/lib/errorHandler";

interface User {
  user_id: string;
  email: string;
  user_name?: string;
  graduation_year?: number;
  bio?: string;
  isverified: boolean;
}

interface ProfileFormProps {
  user: User;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isLoading: boolean;
  className?: string;
}

interface FieldState {
  value: string;
  error: string;
  touched: boolean;
  validating: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  user,
  onSubmit,
  isLoading,
  className,
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form field states with validation
  const [fields, setFields] = useState<Record<keyof ProfileFormData, FieldState>>({
    userName: {
      value: user.user_name || "",
      error: "",
      touched: false,
      validating: false,
    },
    graduationYear: {
      value: user.graduation_year?.toString() || "",
      error: "",
      touched: false,
      validating: false,
    },
    bio: {
      value: user.bio || "",
      error: "",
      touched: false,
      validating: false,
    },
  });

  // Original form data for change detection
  const originalData: ProfileFormData = {
    userName: user.user_name || "",
    graduationYear: user.graduation_year?.toString() || "",
    bio: user.bio || "",
  };

  // Setup offline detection
  useEffect(() => {
    // Simple online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize state
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check for unsaved changes
  const currentData: ProfileFormData = useMemo(() => ({
    userName: fields.userName.value,
    graduationYear: fields.graduationYear.value,
    bio: fields.bio.value,
  }), [fields]);

  useEffect(() => {
    setHasUnsavedChanges(hasFormChanged(currentData, originalData));
  }, [currentData, originalData]);

  // Real-time field validation with debouncing
  const validateFieldWithDelay = useCallback(
    (field: keyof ProfileFormData, value: string) => {
      // Set validating state
      setFields(prev => ({
        ...prev,
        [field]: { ...prev[field], validating: true },
      }));

      // Debounce validation
      const timeoutId = setTimeout(() => {
        const error = validateField(field, value) || "";
        setFields(prev => ({
          ...prev,
          [field]: { ...prev[field], error, validating: false },
        }));
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    []
  );

  // Handle field changes
  const handleFieldChange = (field: keyof ProfileFormData, value: string) => {
    setFields(prev => ({
      ...prev,
      [field]: { ...prev[field], value, touched: true },
    }));

    // Trigger validation if field has been touched
    if (fields[field].touched) {
      validateFieldWithDelay(field, value);
    }
  };

  // Handle field blur (when user leaves the field)
  const handleFieldBlur = (field: keyof ProfileFormData) => {
    const value = fields[field].value;
    setFields(prev => ({
      ...prev,
      [field]: { ...prev[field], touched: true },
    }));

    // Validate immediately on blur
    const error = validateField(field, value) || "";
    setFields(prev => ({
      ...prev,
      [field]: { ...prev[field], error },
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData: ProfileFormData = {
      userName: fields.userName.value,
      graduationYear: fields.graduationYear.value,
      bio: fields.bio.value,
    };

    // Validate entire form
    const validation = validateProfileForm(formData);

    if (!validation.isValid) {
      // Update field errors
      setFields(prev => {
        const updated = { ...prev };
        Object.keys(validation.fieldErrors).forEach(key => {
          const field = key as keyof ProfileFormData;
          updated[field] = {
            ...updated[field],
            error: validation.fieldErrors[field],
            touched: true,
          };
        });
        return updated;
      });
      return;
    }

    // Check for changes
    if (!hasUnsavedChanges) {
      return;
    }

    // Sanitize and submit
    const sanitizedData = sanitizeProfileData(formData);
    await onSubmit(sanitizedData);
  };

  // Get field validation state
  const getFieldState = (field: keyof ProfileFormData) => {
    const fieldState = fields[field];
    const hasError = fieldState.touched && fieldState.error;
    const isValid = fieldState.touched && !fieldState.error && fieldState.value.trim();

    return {
      hasError: !!hasError,
      isValid: !!isValid,
      isValidating: fieldState.validating,
      error: fieldState.error,
    };
  };

  // Check if form is valid
  const isFormValid = Object.values(fields).every(field => !field.error) && hasUnsavedChanges;

  return (
    <Card className={cn("max-w-2xl", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Personal Information</span>
          </div>
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                Unsaved Changes
              </Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Update your profile information and preferences.
          {!isOnline && " Changes will be saved when you're back online."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display Name Field */}
          <div className="space-y-2">
            <Label htmlFor="userName" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Display Name *</span>
            </Label>
            <div className="relative">
              <Input
                id="userName"
                type="text"
                value={fields.userName.value}
                onChange={(e) => handleFieldChange("userName", e.target.value)}
                onBlur={() => handleFieldBlur("userName")}
                placeholder="Enter your display name"
                className={cn(
                  "w-full pr-10",
                  getFieldState("userName").hasError && "border-red-500 focus:border-red-500",
                  getFieldState("userName").isValid && "border-green-500 focus:border-green-500"
                )}
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {getFieldState("userName").isValidating && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {getFieldState("userName").isValid && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {getFieldState("userName").hasError && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            {getFieldState("userName").hasError && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>{getFieldState("userName").error}</span>
              </p>
            )}
            {(() => {
              const charCount = getCharacterCount(fields.userName.value);
              return charCount > 0 ? (
                <p className="text-xs text-muted-foreground text-right">
                  {charCount}/50 characters
                </p>
              ) : null;
            })()}
            <p className="text-sm text-muted-foreground">
              This is how your name will appear to other users.
            </p>
          </div>

          {/* Email Field (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Email Address</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="w-full bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Email address cannot be changed for security reasons.
            </p>
          </div>

          {/* Graduation Year Field */}
          <div className="space-y-2">
            <Label htmlFor="graduationYear" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Graduation Year</span>
            </Label>
            <div className="relative">
              <Input
                id="graduationYear"
                type="number"
                value={fields.graduationYear.value}
                onChange={(e) => handleFieldChange("graduationYear", e.target.value)}
                onBlur={() => handleFieldBlur("graduationYear")}
                placeholder="e.g., 2025"
                min="2020"
                max="2035"
                className={cn(
                  "w-full pr-10",
                  getFieldState("graduationYear").hasError && "border-red-500 focus:border-red-500",
                  getFieldState("graduationYear").isValid && "border-green-500 focus:border-green-500"
                )}
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {getFieldState("graduationYear").isValidating && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {getFieldState("graduationYear").isValid && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {getFieldState("graduationYear").hasError && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            {getFieldState("graduationYear").hasError && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>{getFieldState("graduationYear").error}</span>
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Your expected graduation year (optional).
            </p>
          </div>

          {/* Bio Field */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Bio</span>
            </Label>
            <div className="relative">
              <Textarea
                id="bio"
                value={fields.bio.value}
                onChange={(e) => handleFieldChange("bio", e.target.value)}
                onBlur={() => handleFieldBlur("bio")}
                placeholder="Tell us about yourself (optional)"
                rows={4}
                className={cn(
                  "w-full resize-none",
                  getFieldState("bio").hasError && "border-red-500 focus:border-red-500",
                  getFieldState("bio").isValid && "border-green-500 focus:border-green-500"
                )}
                disabled={isLoading}
              />
            </div>
            {getFieldState("bio").hasError && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>{getFieldState("bio").error}</span>
              </p>
            )}
            {(() => {
              const charCount = getCharacterCount(fields.bio.value);
              return charCount > 0 ? (
                <p className={cn(
                  "text-xs text-right",
                  charCount > 450 ? "text-orange-600" : "text-muted-foreground"
                )}>
                  {charCount}/500 characters
                </p>
              ) : null;
            })()}
            <p className="text-sm text-muted-foreground">
              Share a bit about yourself with the community (optional).
            </p>
          </div>

          {/* Offline Warning */}
          {!isOnline && (
            <Alert className="border-orange-200 bg-orange-50">
              <WifiOff className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                You're currently offline. Your changes will be saved locally and synced when you're back online.
              </AlertDescription>
            </Alert>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !isFormValid}
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
  );
};

export default ProfileForm;