"use client";

import { useState, useEffect } from "react";
import { profilesRepository } from "../data/profiles.repository";
import type { UserProfile, UpdateProfileData } from "../domain/profiles.types";

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const profileData = await profilesRepository.getByUserId(userId);
        setProfile(profileData);
      } catch (err) {
        // Treat Supabase "no rows" as no profile instead of an error
        const code = (err as any)?.code || (err as any)?.status;
        if (code === "PGRST116" || code === 406) {
          setProfile(null);
          setError(null);
        } else {
          console.error("Error fetching profile:", err);
          setError("Failed to load profile");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const updateProfile = async (data: UpdateProfileData) => {
    if (!userId) return;

    try {
      setError(null);
      const updatedProfile = await profilesRepository.updateByUserId(userId, data);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
      throw err;
    }
  };

  const refetch = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);
      const profileData = await profilesRepository.getByUserId(userId);
      setProfile(profileData);
    } catch (err) {
      console.error("Error refetching profile:", err);
      setError("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refetch,
  };
}