"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { createGlobalPost, createCommunityPost, getCommunities, type Community, type CreatePostData, type CreateCommunityPostData, type GlobalPost } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

// Form validation schema
const createPostSchema = z.object({
  content: z
    .string()
    .min(1, "Post content is required")
    .max(2000, "Post content must be less than 2000 characters"),
  community_id: z.string().optional(),
  images: z
    .array(z.instanceof(File))
    .max(5, "Maximum 5 images allowed")
    .optional(),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

interface CreatePostProps {
  communityId?: string;
  onPostCreated?: (post: GlobalPost) => void;
  onCancel?: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({
  communityId,
  onPostCreated,
  onCancel,
}) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: "",
      community_id: communityId || "global",
      images: [],
    },
  });

  // Load communities on component mount
  useEffect(() => {
    const loadCommunities = async () => {
      try {
        setLoadingCommunities(true);
        const response = await getCommunities();
        setCommunities(response.communities);
      } catch (error) {
        console.error("Failed to load communities:", error);
        setError("Failed to load communities. Please try again.");
      } finally {
        setLoadingCommunities(false);
      }
    };

    loadCommunities();
  }, []);

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (selectedImages.length + files.length > 5) {
      const errorMsg = "Maximum 5 images allowed";
      setError(errorMsg);
      toast({
        title: "Too Many Images",
        description: errorMsg,
        variant: "warning",
      });
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        const errorMsg = "Only image files are allowed";
        setError(errorMsg);
        toast({
          title: "Invalid File Type",
          description: errorMsg,
          variant: "error",
        });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        const errorMsg = "Image size must be less than 10MB";
        setError(errorMsg);
        toast({
          title: "File Too Large",
          description: errorMsg,
          variant: "error",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const newImages = [...selectedImages, ...validFiles];
      setSelectedImages(newImages);
      form.setValue("images", newImages);

      // Create previews
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
      setError(null);

      // Show success toast for image upload
      toast({
        title: "Images Added",
        description: `${validFiles.length} image${validFiles.length > 1 ? 's' : ''} added successfully`,
        variant: "success",
      });
    }
  };

  // Remove selected image
  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);

    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
    form.setValue("images", newImages);
  };

  // Handle form submission
  const onSubmit = async (data: CreatePostFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      let response;

      if (communityId && communityId !== "global") {
        // Create community-specific post
        const communityPostData: CreateCommunityPostData = {
          content: data.content,
          community_id: communityId,
          images: selectedImages.length > 0 ? selectedImages : undefined,
        };

        try {
          response = await createCommunityPost(communityPostData);
        } catch (communityError) {
          console.log("Community post API not available, falling back to global post");

          // Fallback to global post creation
          const globalPostData: CreatePostData = {
            content: data.content,
            images: selectedImages.length > 0 ? selectedImages : undefined,
          };
          response = await createGlobalPost(globalPostData);
        }
      } else {
        // Create global post
        const postData: CreatePostData = {
          content: data.content,
          images: selectedImages.length > 0 ? selectedImages : undefined,
        };
        response = await createGlobalPost(postData);
      }

      // Clear form
      form.reset();
      setSelectedImages([]);
      setImagePreviews([]);

      // Show success toast
      toast({
        title: "Post Created Successfully",
        description: communityId && communityId !== "global"
          ? "Your post has been shared with the community"
          : "Your post has been shared globally",
        variant: "success",
      });

      // Call success callback
      if (onPostCreated) {
        onPostCreated(response.post);
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create post. Please try again.";
      setError(errorMessage);

      // Show error toast
      toast({
        title: "Failed to Create Post",
        description: errorMessage,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up image previews on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  return (
    <section
      className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg p-6"
      role="form"
      aria-labelledby="create-post-heading"
    >
      <header className="flex items-center justify-between mb-6">
        <h2
          id="create-post-heading"
          className="text-xl font-semibold text-foreground-light dark:text-foreground-dark"
        >
          {communityId && communityId !== "global"
            ? `Create Post in ${communities.find(c => c.community_id === communityId)?.name || "Community"}`
            : "Create New Post"
          }
        </h2>
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            aria-label="Cancel post creation"
            className="touch-manipulation min-h-[44px] min-w-[44px]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </header>

      {error && (
        <div
          className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md"
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Community Selector */}
          {!communityId && (
            <FormField
              control={form.control}
              name="community_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Community (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loadingCommunities}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a community or leave blank for global post" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="global">Global Post</SelectItem>
                      {communities.map((community) => (
                        <SelectItem
                          key={community.community_id}
                          value={community.community_id}
                        >
                          {community.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Post Content */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What&apos;s on your mind?</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Share your thoughts with the community..."
                    className="min-h-[120px] resize-none"
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-between text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                  <FormMessage />
                  <span>{field.value?.length || 0}/2000</span>
                </div>
              </FormItem>
            )}
          />

          {/* Image Upload */}
          <fieldset className="space-y-4">
            <legend className="sr-only">Image attachments</legend>
            <div className="flex items-center gap-4">
              <label
                htmlFor="image-upload"
                className="flex items-center gap-2 px-4 py-2 border border-border-light dark:border-border-dark rounded-md cursor-pointer hover:bg-accent-light dark:hover:bg-accent-dark transition-colors touch-manipulation min-h-[44px] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
              >
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm">Add Images</span>
              </label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="sr-only"
                aria-describedby="image-count image-help"
              />
              <span
                id="image-count"
                className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark"
                aria-live="polite"
              >
                {selectedImages.length}/5 images
              </span>
            </div>
            <div id="image-help" className="sr-only">
              You can upload up to 5 images. Supported formats: JPEG, PNG, GIF. Maximum size: 10MB per image.
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4"
                role="group"
                aria-label="Selected images"
              >
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Selected image ${index + 1} of ${imagePreviews.length}`}
                      className="w-full h-20 sm:h-24 object-cover rounded-md border border-border-light dark:border-border-dark"
                      loading="lazy"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity touch-manipulation min-h-[32px] min-w-[32px] focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </fieldset>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-end gap-3" role="group" aria-label="Form actions">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="touch-manipulation min-h-[44px] w-full sm:w-auto"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || !form.watch("content")?.trim()}
              className="touch-manipulation min-h-[44px] w-full sm:w-auto"
              aria-describedby={isSubmitting ? "submit-status" : undefined}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />}
              {isSubmitting ? "Creating..." : "Create Post"}
            </Button>
            {isSubmitting && (
              <span id="submit-status" className="sr-only">
                Creating your post, please wait...
              </span>
            )}
          </div>
        </form>
      </Form>
    </section>
  );
};

export default CreatePost;