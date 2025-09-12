"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, Badge, Avatar, AvatarFallback, AvatarImage } from "@/components/ui";
import { Save, ArrowLeft, X, Plus } from "lucide-react";
import { profilesRepository } from "../data/profiles.repository";
import type { UserProfile } from "../domain/profiles.types";

interface ProfileEditFormProps {
  profile: UserProfile;
}

const POPULAR_GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Family", "Fantasy", "Horror", "Mystery", "Romance",
  "Sci-Fi", "Thriller", "War", "Western"
];

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [displayName, setDisplayName] = useState(profile.displayName || "");
  const [username, setUsername] = useState(profile.username || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [quote, setQuote] = useState(profile.quote || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || "");
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>(profile.favoriteGenres);
  const [favoriteTitles, setFavoriteTitles] = useState<string[]>(profile.favoriteTitles);
  const [isPublic, setIsPublic] = useState(profile.isPublic);
  const [newTitle, setNewTitle] = useState("");

  const displayNameForAvatar = displayName || username || "User";
  const initials = displayNameForAvatar
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleGenreToggle = (genre: string) => {
    setFavoriteGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleAddTitle = () => {
    if (newTitle.trim() && !favoriteTitles.includes(newTitle.trim())) {
      setFavoriteTitles(prev => [...prev, newTitle.trim()]);
      setNewTitle("");
    }
  };

  const handleRemoveTitle = (title: string) => {
    setFavoriteTitles(prev => prev.filter(t => t !== title));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await profilesRepository.updateByUserId(profile.userId, {
        displayName: displayName.trim() || undefined,
        username: username.trim() || undefined,
        bio: bio.trim() || undefined,
        quote: quote.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        favoriteGenres,
        favoriteTitles,
        isPublic,
      });

      router.push("/profile");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={avatarUrl} alt={displayNameForAvatar} />
              <AvatarFallback className="text-lg font-bold bg-accent/10 text-accent">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
                maxLength={50}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="quote">Quote</Label>
            <Input
              id="quote"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Your favorite quote or motto"
              maxLength={200}
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {bio.length}/500 characters
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded border-input"
            />
            <Label htmlFor="isPublic">Make profile public</Label>
          </div>
        </CardContent>
      </Card>

      {/* Favorite Genres */}
      <Card>
        <CardHeader>
          <CardTitle>Favorite Genres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {POPULAR_GENRES.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => handleGenreToggle(genre)}
                className={`p-2 text-sm rounded-lg border transition-colors ${favoriteGenres.includes(genre)
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-background border-border hover:bg-muted"
                  }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Favorite Titles */}
      <Card>
        <CardHeader>
          <CardTitle>Favorite Titles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a favorite movie or TV show"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTitle();
                }
              }}
            />
            <Button
              type="button"
              onClick={handleAddTitle}
              size="sm"
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>

          {favoriteTitles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {favoriteTitles.map((title) => (
                <Badge key={title} variant="secondary" className="gap-1">
                  {title}
                  <button
                    type="button"
                    onClick={() => handleRemoveTitle(title)}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button variant={"primary"} type="submit" disabled={isLoading} className="gap-2">
          <Save className="w-4 h-4" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}