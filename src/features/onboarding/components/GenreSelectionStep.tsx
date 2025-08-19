"use client";

import { useOnboarding } from "../OnboardingContext";
import GenreCard from "./GenreCard";

// Mock genre data with emoji - in production this would come from an API
const GENRES = [
  {
    id: "action",
    name: "Action",
    tmdbId: 28,
    description: "High-energy films with intense sequences",
    isActive: true,
    emoji: "💥",
  },
  {
    id: "comedy",
    name: "Comedy",
    tmdbId: 35,
    description: "Films designed to make you laugh",
    isActive: true,
    emoji: "😂",
  },
  {
    id: "drama",
    name: "Drama",
    tmdbId: 18,
    description: "Serious, plot-driven films",
    isActive: true,
    emoji: "🎭",
  },
  {
    id: "horror",
    name: "Horror",
    tmdbId: 27,
    description: "Films designed to frighten and create suspense",
    isActive: true,
    emoji: "👻",
  },
  {
    id: "romance",
    name: "Romance",
    tmdbId: 10749,
    description: "Films focused on love stories",
    isActive: true,
    emoji: "💕",
  },
  {
    id: "sci-fi",
    name: "Sci-Fi",
    tmdbId: 878,
    description: "Science fiction and futuristic themes",
    isActive: true,
    emoji: "🚀",
  },
  {
    id: "thriller",
    name: "Thriller",
    tmdbId: 53,
    description: "Suspenseful and exciting films",
    isActive: true,
    emoji: "🔪",
  },
  {
    id: "fantasy",
    name: "Fantasy",
    tmdbId: 14,
    description: "Magical and supernatural themes",
    isActive: true,
    emoji: "🧙‍♂️",
  },
  {
    id: "animation",
    name: "Animation",
    tmdbId: 16,
    description: "Animated films for all ages",
    isActive: true,
    emoji: "🎨",
  },
  {
    id: "documentary",
    name: "Documentary",
    tmdbId: 99,
    description: "Non-fiction films",
    isActive: true,
    emoji: "📹",
  },
  {
    id: "crime",
    name: "Crime",
    tmdbId: 80,
    description: "Films about criminal activities",
    isActive: true,
    emoji: "🕵️",
  },
  {
    id: "adventure",
    name: "Adventure",
    tmdbId: 12,
    description: "Exciting journeys and quests",
    isActive: true,
    emoji: "🗺️",
  },
] as const;

export default function GenreSelectionStep() {
  const {
    data: { favoriteGenres },
    updateData,
  } = useOnboarding();

  const toggleGenre = (genreId: string) => {
    const isSelected = favoriteGenres.includes(genreId);
    let newGenres: string[];

    if (isSelected) {
      newGenres = favoriteGenres.filter((id) => id !== genreId);
    } else {
      newGenres = [...favoriteGenres, genreId];
    }

    updateData({ favoriteGenres: newGenres });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">What do you love watching?</h2>
        <p className="text-muted-foreground">
          Select your favorite genres to get personalized recommendations
        </p>
      </div>

      <div className="genre-grid">
        {GENRES.map((genre) => (
          <GenreCard
            key={genre.id}
            genre={genre}
            isSelected={favoriteGenres.includes(genre.id)}
            onToggle={toggleGenre}
          />
        ))}
      </div>
    </div>
  );
}
