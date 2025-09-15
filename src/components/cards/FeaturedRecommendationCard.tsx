"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Play, Film, Heart, Music, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { 
  getMovieDetails, 
  getTVShowDetails,
  type TMDBMovieDetails,
  type TMDBTVShowDetails 
} from "@/features/ai-chat/data/tmdb.repository";
import type { ContentRecommendation } from "@/features/ai-recommendations/types/recommendations";
import { cn } from "@/lib/utils";

/**
 * Props for the FeaturedRecommendationCard component
 */
export interface FeaturedRecommendationCardProps {
  /** The content recommendation data to display */
  recommendation: ContentRecommendation;
  /** Callback when the card is clicked */
  onCardClick?: (recommendation: ContentRecommendation) => void;
  /** Additional CSS classes to apply */
  className?: string;
}

/**
 * FeaturedRecommendationCard component displays the highest match score recommendation
 * in a hero-style horizontal layout matching the Figma design.
 */
export function FeaturedRecommendationCard({
  recommendation,
  onCardClick,
  className,
}: FeaturedRecommendationCardProps) {
  const [details, setDetails] = useState<TMDBMovieDetails | TMDBTVShowDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        let detailsData;
        
        if (recommendation.media_type === 'movie') {
          detailsData = await getMovieDetails(recommendation.tmdb_id);
        } else {
          detailsData = await getTVShowDetails(recommendation.tmdb_id);
        }
        
        setDetails(detailsData);
      } catch (err) {
        console.error('Failed to fetch content details for featured card:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [recommendation.tmdb_id, recommendation.media_type]);

  const handleCardClick = () => {
    onCardClick?.(recommendation);
  };

  const handleViewMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCardClick?.(recommendation);
  };

  const getMediaTypeLabel = () => {
    return recommendation.media_type === 'movie' ? 'Movie' : 'TV Show';
  };

  // Get real genres from the fetched details
  const genres = details?.genres?.slice(0, 2) || []; // Show max 2 genres

  const getGenreIcon = (genreName: string) => {
    const lowerName = genreName.toLowerCase();
    if (lowerName.includes('romance') || lowerName.includes('love')) {
      return <Heart className="w-[18px] h-[18px] text-white" />;
    } else if (lowerName.includes('music') || lowerName.includes('musical')) {
      return <Music className="w-[18px] h-[18px] text-white" />;
    } else {
      return <Film className="w-[18px] h-[18px] text-white" />;
    }
  };

  return (
    <div
      className={cn(
        "backdrop-blur-[4px] bg-[rgba(51,51,51,0.15)] relative rounded-[24px] cursor-pointer",
        "border border-gray-500 transition-all duration-300 hover:scale-[1.01] lg:hover:scale-[1.02]",
        "w-full min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]",
        className
      )}
      onClick={handleCardClick}
      data-testid="featured-recommendation-card"
    >
      {/* Radial spotlight background overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none"
      >
        <div
          className="absolute left-0 right-0 top-0 h-1/2"
          style={{
            background:
              "radial-gradient(54.67% 54.67% at 50.03% -4.6%, rgba(37, 148, 244, 0.70) 0%, rgba(61, 160, 245, 0.40) 27.2%, rgba(49, 49, 49, 0.00) 100%)",
          }}
        />
      </div>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-center justify-center overflow-hidden px-4 sm:px-8 lg:px-12 py-6 lg:py-10 w-full h-full">
        {/* Left Content Section */}
        <div className="flex flex-col gap-6 lg:gap-12 items-start justify-center flex-1 lg:shrink-0 w-full lg:max-w-[677px]">
          {/* Title and Match Score Section */}
          <div className="flex flex-col gap-2 items-start justify-start w-full">
            {/* Match Score Badge */}
            <div className="bg-neutral-700 flex gap-2 items-center justify-center px-4 py-2 rounded-[8px] shrink-0">
              <p className="font-medium text-[16px] text-[#f1f1f3] whitespace-pre leading-[1.5]">
                Match Score: {recommendation.match_score}%
              </p>
            </div>

            {/* Title */}
            <h2 className="font-bold text-2xl sm:text-3xl lg:text-[40px] text-white leading-[1.5] w-full">
              Recommended: {recommendation.title}
            </h2>

            {/* Description */}
            <p className="font-normal text-base sm:text-lg lg:text-[20px] text-zinc-200 leading-[1.5] w-full lg:max-w-[389px]">
              {recommendation.short_explanation}
            </p>

            {/* Genre Tags */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 items-start justify-start">
                {genres.map((genre) => (
                  <div
                    key={genre.id}
                    className="bg-[#075292] flex gap-1 items-center justify-start px-2 sm:px-3 py-1 rounded-[16px] shrink-0"
                  >
                    {getGenreIcon(genre.name)}
                    <span className="font-semibold text-[10px] text-white whitespace-pre leading-[1.5]">
                      {genre.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Button Section */}
          <div className="flex gap-6 items-start justify-start w-full">
            {/* View More Button */}
            <Button
              onClick={handleViewMore}
              variant={"primary"}
              className="px-4 sm:px-6"
            >
              <span className="whitespace-pre leading-[1.5]">View More</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Right Poster Section */}
        <div className="flex items-center justify-center lg:justify-start overflow-hidden rounded-[16px] shadow-[-16px_12px_52px_0px_rgba(0,0,0,0.25)] shrink-0 w-full lg:w-auto">
          <div className="h-64 w-44 sm:h-80 sm:w-56 lg:h-[535.868px] lg:w-[371.104px] bg-center bg-cover bg-no-repeat rounded-[16px] overflow-hidden">
            {recommendation.poster_url ? (
              <Image
                src={recommendation.poster_url}
                alt={`${recommendation.title} poster`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 640px) 176px, (max-width: 1024px) 224px, 371px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/30 flex items-center justify-center">
                <Film className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-white/50" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
