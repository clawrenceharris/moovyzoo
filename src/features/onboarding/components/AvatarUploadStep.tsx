"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "../OnboardingContext";

export default function AvatarUploadStep() {
  const {
    data: { avatarUrl },
    updateData,
  } = useOnboarding();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Create preview URL
      const preview = URL.createObjectURL(file);

      // In a real app, you would upload to Supabase Storage here
      // For now, we'll just use the preview URL
      updateData({ avatarUrl: preview });
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    updateData({ avatarUrl: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Add a profile picture</h2>
        <p className="text-muted-foreground">
          Help others recognize you (this step is optional)
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        {/* Avatar preview */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden bg-muted/20">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile preview"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <div className="text-2xl text-muted-foreground">📷</div>
                <div className="text-xs text-muted-foreground mt-1">
                  No image
                </div>
              </div>
            )}
          </div>

          {avatarUrl && (
            <button
              onClick={handleRemoveImage}
              className="absolute -top-1 -right-1 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center text-xs hover:bg-destructive/90 transition-colors"
            >
              ×
            </button>
          )}
        </div>

        {/* Upload controls */}
        <div className="flex flex-col items-center space-y-3">
          <Button
            variant="outline"
            onClick={triggerFileSelect}
            disabled={isUploading}
            className="min-w-[140px]"
          >
            {isUploading
              ? "Uploading..."
              : avatarUrl
              ? "Change Image"
              : "Upload Image"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            JPG, PNG or WebP • Max 5MB
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
