import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ContentRecommendationCard } from "../ContentRecommendationCard";
import type { ContentRecommendation } from "@/features/ai-recommendations/types/recommendations";

const mockRecommendation: ContentRecommendation = {
  tmdb_id: 12345,
  title: "Inception",
  media_type: "movie",
  poster_url: "https://image.tmdb.org/t/p/w500/poster.jpg",
  match_score: 85,
  short_explanation: "Matches your love for sci-fi thrillers",
  genre_match: 40,
  title_similarity: 20,
  rating_signal: 15,
  friends_boost: 10,
};

describe("ContentRecommendationCard", () => {
  it("should render with recommendation data", () => {
    const onCardClick = vi.fn();
    
    render(
      <ContentRecommendationCard
        recommendation={mockRecommendation}
        onCardClick={onCardClick}
      />
    );

    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.getByText("85% Match")).toBeInTheDocument();
    expect(screen.getByText("Matches your love for sci-fi thrillers")).toBeInTheDocument();
  });

  it("should call onCardClick when clicked", () => {
    const onCardClick = vi.fn();
    
    render(
      <ContentRecommendationCard
        recommendation={mockRecommendation}
        onCardClick={onCardClick}
      />
    );

    fireEvent.click(screen.getByTestId("media-card"));
    expect(onCardClick).toHaveBeenCalledWith(12345, "movie");
  });

  it("should render fallback when no poster_url", () => {
    const recommendationWithoutPoster = {
      ...mockRecommendation,
      poster_url: undefined,
    };
    const onCardClick = vi.fn();
    
    render(
      <ContentRecommendationCard
        recommendation={recommendationWithoutPoster}
        onCardClick={onCardClick}
      />
    );

    expect(screen.getByTestId("content-poster-fallback")).toBeInTheDocument();
  });

  it("should display media type badge", () => {
    const onCardClick = vi.fn();
    
    render(
      <ContentRecommendationCard
        recommendation={mockRecommendation}
        onCardClick={onCardClick}
      />
    );

    expect(screen.getByText("Movie")).toBeInTheDocument();
  });
});