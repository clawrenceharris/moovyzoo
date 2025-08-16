"use client";

interface GenreSelectionProps {
  selectedGenres: string[];
  onSelectionChange: (genreIds: string[]) => void;
  className?: string;
}
//TODO: Implement the genre selection component so user can search and select genres
export default function GenreSelection({}: GenreSelectionProps) {
  return <div></div>;
}
