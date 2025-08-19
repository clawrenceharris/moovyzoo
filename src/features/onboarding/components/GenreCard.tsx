"use client";

import { Genre } from "@/types/movie";

interface GenreCardData extends Genre {
  emoji: string;
}

interface GenreCardProps {
  genre: GenreCardData;
  isSelected: boolean;
  onToggle: (genreId: string) => void;
}

export default function GenreCard({
  genre,
  isSelected,
  onToggle,
}: GenreCardProps) {
  return (
    <button
      onClick={() => onToggle(genre.id)}
      className={`genre-card ${isSelected ? "selected" : ""}`}
    >
      <div className="text-center space-y-2">
        <div className="text-2xl">{genre.emoji}</div>
        <div className="text-sm font-medium">{genre.name}</div>
      </div>

      {isSelected && (
        <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
          <svg
            className="w-2.5 h-2.5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </button>
  );
}
