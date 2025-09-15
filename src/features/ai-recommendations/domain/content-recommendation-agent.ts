import type { WatchHistoryRepository } from '@/features/profile/data/watch-history.repository';
import type { ProfilesRepository } from '@/features/profile/data/profiles.repository';
import type { FriendsRepository } from '@/features/profile/data/friends.repository';
import type { ContentRecommendation, TasteProfile } from '../types/recommendations';
import type { UserProfile, WatchHistoryEntry } from '@/features/profile/domain/profiles.types';

/**
 * Interface for the subset of ProfilesRepository methods needed by ContentRecommendationAgent
 */
interface ProfilesRepositoryForContentAgent {
  getByUserId(userId: string): Promise<UserProfile | null>;
}

/**
 * Interface for the subset of WatchHistoryRepository methods needed by ContentRecommendationAgent
 */
interface WatchHistoryRepositoryForContentAgent {
  getRecentActivity(userId: string, limit?: number): Promise<WatchHistoryEntry[]>;
}

/**
 * Interface for the subset of FriendsRepository methods needed by ContentRecommendationAgent
 */
interface FriendsRepositoryForContentAgent {
  // ContentRecommendationAgent doesn't currently use FriendsRepository methods
  // but keeping it for future expansion
}
import {
    discoverByGenre,
    getTrendingNowOrUpcoming,
    getTrendingOrAiringTV,
} from '@/app/api/tmdb/repository';
import { AppErrorCode } from '@/utils/error-codes';
import { createNormalizedError } from '@/utils/normalize-error';

// TMDB genre mapping for scoring
const GENRE_MAP: Record<number, string> = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Science Fiction',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
};

interface TMDBContent {
    id: number;
    title?: string;
    name?: string;
    genre_ids?: number[];
    vote_average: number;
    poster_path?: string;
    media_type?: 'movie' | 'tv';
}

/**
 * Content Recommendation Agent
 * Generates personalized movie and TV show recommendations using existing TMDB tools
 * and user data from watch history, profiles, and friends repositories
 */
export class ContentRecommendationAgent {
    constructor(
        private watchHistoryRepository: WatchHistoryRepositoryForContentAgent,
        private profilesRepository: ProfilesRepositoryForContentAgent,
        private friendsRepository: FriendsRepositoryForContentAgent
    ) { }

    /**
     * Generate content recommendations for a user
     */
    async generateRecommendations(userId: string): Promise<ContentRecommendation[]> {
        console.log(`[ContentRecommendationAgent] Starting recommendation generation for user: ${userId}`);
        
        try {
            // 1. Build taste profile using existing repositories
            console.log(`[ContentRecommendationAgent] Building taste profile for user: ${userId}`);
            const tasteProfile = await this.buildTasteProfile(userId);

            // Check if user has sufficient data for personalized recommendations
            const hasMinimalData = this.validateUserData(tasteProfile);
            if (!hasMinimalData) {
                console.log(`[ContentRecommendationAgent] Insufficient user data, using cold-start fallback for user: ${userId}`);
                return this.getColdStartRecommendations(tasteProfile);
            }

            // 2. Generate candidates using existing TMDB tools
            console.log(`[ContentRecommendationAgent] Generating candidates for user: ${userId}`);
            const candidates = await this.generateCandidates(tasteProfile);

            if (candidates.length === 0) {
                console.warn(`[ContentRecommendationAgent] No candidates generated, using fallback for user: ${userId}`);
                return this.getFallbackRecommendations(userId);
            }

            // 3. Score and rank candidates
            console.log(`[ContentRecommendationAgent] Scoring ${candidates.length} candidates for user: ${userId}`);
            const scoredRecommendations = await this.scoreRecommendations(candidates, tasteProfile);

            // 4. Apply diversity and filtering
            const finalRecommendations = this.diversifyRecommendations(scoredRecommendations);
            
            console.log(`[ContentRecommendationAgent] Generated ${finalRecommendations.length} recommendations for user: ${userId}`);
            return finalRecommendations;
        } catch (error) {
            console.error(`[ContentRecommendationAgent] Error generating content recommendations for user ${userId}:`, error);
            
            // Try fallback recommendations
            try {
                console.log(`[ContentRecommendationAgent] Attempting fallback recommendations for user: ${userId}`);
                return await this.getFallbackRecommendations(userId);
            } catch (fallbackError) {
                console.error(`[ContentRecommendationAgent] Fallback recommendations also failed for user ${userId}:`, fallbackError);
                throw createNormalizedError(AppErrorCode.RECOMMENDATIONS_GENERATION_FAILED, error);
            }
        }
    }

    /**
     * Build taste profile from user data
     */
    async buildTasteProfile(userId: string): Promise<TasteProfile> {
        try {
            // Get user profile and watch history using existing repositories
            const [profile, recentWatches] = await Promise.allSettled([
                this.profilesRepository.getByUserId(userId),
                this.watchHistoryRepository.getRecentActivity(userId, 50)
            ]);

            // Handle profile result
            const userProfile = profile.status === 'fulfilled' && profile.value ? profile.value : {
                id: 'temp-id',
                userId,
                email: '',
                displayName: 'User',
                username: null,
                avatarUrl: null,
                bio: null,
                quote: null,
                favoriteGenres: [],
                favoriteTitles: [],
                isPublic: true,
                onboardingCompleted: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Handle watch history result
            const watchHistory = recentWatches.status === 'fulfilled' ? recentWatches.value : [];

            if (profile.status === 'rejected') {
                console.warn(`[ContentRecommendationAgent] Failed to load profile for user ${userId}:`, profile.reason);
            }

            if (recentWatches.status === 'rejected') {
                console.warn(`[ContentRecommendationAgent] Failed to load watch history for user ${userId}:`, recentWatches.reason);
            }

            // Calculate genre weights from favorite genres
            const genreWeights: Record<string, number> = {};
            if (userProfile.favoriteGenres.length > 0) {
                const weight = 1.0 / userProfile.favoriteGenres.length;
                userProfile.favoriteGenres.forEach(genre => {
                    genreWeights[genre] = weight;
                });
            }

            // Calculate rating patterns from watch history
            const ratings = watchHistory
                .filter(watch => watch.rating !== undefined && watch.rating !== null)
                .map(watch => watch.rating!);

            const averageRating = ratings.length > 0
                ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
                : 0;

            const ratingDistribution: Record<number, number> = {};
            ratings.forEach(rating => {
                ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
            });

            return {
                user_id: userId,
                favorite_genres: userProfile.favoriteGenres,
                favorite_titles: userProfile.favoriteTitles,
                recent_watches: watchHistory,
                genre_weights: genreWeights,
                rating_patterns: {
                    average_rating: averageRating,
                    rating_distribution: ratingDistribution
                }
            };
        } catch (error) {
            console.error(`[ContentRecommendationAgent] Error building taste profile for user ${userId}:`, error);
            
            // Return minimal profile for cold-start users
            return {
                user_id: userId,
                favorite_genres: [],
                favorite_titles: [],
                recent_watches: [],
                genre_weights: {},
                rating_patterns: {
                    average_rating: 0,
                    rating_distribution: {}
                }
            };
        }
    }

    /**
     * Generate candidate content using existing TMDB repository functions
     */
    private async generateCandidates(profile: TasteProfile): Promise<TMDBContent[]> {
        const candidates: TMDBContent[] = [];

        try {
            // Strategy 1: Discover by favorite genres (if available)
            if (profile.favorite_genres.length > 0) {
                try {
                    const genreIds = this.mapGenresToIds(profile.favorite_genres).join(',');
                    if (genreIds) {
                        console.log(`[ContentRecommendationAgent] Fetching genre-based content for genres: ${profile.favorite_genres.join(', ')}`);
                        const genreMovies = await discoverByGenre(genreIds, undefined, 'popularity.desc');
                        candidates.push(...genreMovies.map(movie => ({
                            ...movie,
                            media_type: 'movie' as const
                        })));
                    }
                } catch (genreError) {
                    console.warn(`[ContentRecommendationAgent] Failed to fetch genre-based content:`, genreError);
                }
            }

            // Strategy 2: Trending content for discovery (with fallback)
            try {
                console.log(`[ContentRecommendationAgent] Fetching trending movies`);
                const trendingMovies = await getTrendingNowOrUpcoming('trending');
                candidates.push(...trendingMovies.map(movie => ({
                    ...movie,
                    media_type: 'movie' as const
                })));
            } catch (trendingError) {
                console.warn(`[ContentRecommendationAgent] Failed to fetch trending movies:`, trendingError);
                
                // Try upcoming as fallback
                try {
                    console.log(`[ContentRecommendationAgent] Trying upcoming movies as fallback`);
                    const upcomingMovies = await getTrendingNowOrUpcoming('upcoming');
                    candidates.push(...upcomingMovies.map(movie => ({
                        ...movie,
                        media_type: 'movie' as const
                    })));
                } catch (upcomingError) {
                    console.warn(`[ContentRecommendationAgent] Failed to fetch upcoming movies:`, upcomingError);
                }
            }

            // Strategy 3: Trending TV shows (with fallback)
            try {
                console.log(`[ContentRecommendationAgent] Fetching trending TV shows`);
                const trendingTVShows = await getTrendingOrAiringTV('trending');
                candidates.push(...trendingTVShows.map(show => ({
                    ...show,
                    media_type: 'tv' as const
                })));
            } catch (tvError) {
                console.warn(`[ContentRecommendationAgent] Failed to fetch trending TV shows:`, tvError);
                
                // Try airing as fallback
                try {
                    console.log(`[ContentRecommendationAgent] Trying airing TV shows as fallback`);
                    const airingTVShows = await getTrendingOrAiringTV('airing_today');
                    candidates.push(...airingTVShows.map(show => ({
                        ...show,
                        media_type: 'tv' as const
                    })));
                } catch (airingError) {
                    console.warn(`[ContentRecommendationAgent] Failed to fetch airing TV shows:`, airingError);
                }
            }

            // Remove duplicates based on ID and media type
            const uniqueCandidates = candidates.filter((candidate, index, self) =>
                index === self.findIndex(c => c.id === candidate.id && c.media_type === candidate.media_type)
            );

            console.log(`[ContentRecommendationAgent] Generated ${uniqueCandidates.length} unique candidates`);
            return uniqueCandidates.slice(0, 50); // Limit to 50 candidates for performance
        } catch (error) {
            console.error(`[ContentRecommendationAgent] Error generating candidates:`, error);
            throw createNormalizedError(AppErrorCode.TMDB_API_ERROR, error);
        }
    }

    /**
     * Score recommendations with explainable algorithm
     */
    async scoreRecommendations(
        candidates: TMDBContent[],
        profile: TasteProfile
    ): Promise<ContentRecommendation[]> {
        const recommendations: ContentRecommendation[] = [];

        for (const candidate of candidates) {
            try {
                const title = candidate.title || candidate.name || 'Unknown Title';
                const mediaType = candidate.media_type || 'movie';

                // Calculate scoring components
                const genreMatch = this.calculateGenreMatch(candidate, profile);
                const titleSimilarity = this.calculateTitleSimilarity(candidate, profile);
                const ratingSignal = this.calculateRatingSignal(candidate, profile);
                const friendsBoost = 0; // Placeholder - would need friends' ratings

                // Total match score (0-100)
                const matchScore = Math.min(100, Math.round(
                    genreMatch + titleSimilarity + ratingSignal + friendsBoost
                ));

                // Generate explanation
                const explanation = this.generateExplanation({
                    genreMatch,
                    titleSimilarity,
                    ratingSignal,
                    friendsBoost,
                    candidate,
                    profile
                });

                recommendations.push({
                    tmdb_id: candidate.id,
                    title,
                    media_type: mediaType,
                    poster_url: candidate.poster_path ? `https://image.tmdb.org/t/p/w300${candidate.poster_path}` : undefined,
                    match_score: matchScore,
                    short_explanation: explanation,
                    genre_match: genreMatch,
                    title_similarity: titleSimilarity,
                    rating_signal: ratingSignal,
                    friends_boost: friendsBoost
                });
            } catch (error) {
                console.warn(`Failed to score candidate ${candidate.id}:`, error);
            }
        }

        return recommendations.sort((a, b) => b.match_score - a.match_score);
    }

    /**
     * Apply diversity filtering to recommendations
     */
    private diversifyRecommendations(recommendations: ContentRecommendation[]): ContentRecommendation[] {
        // Simple diversity: ensure mix of movies and TV shows, different genres
        const diversified: ContentRecommendation[] = [];
        const seenGenres = new Set<string>();
        let movieCount = 0;
        let tvCount = 0;

        for (const rec of recommendations) {
            // Limit to 10 total recommendations
            if (diversified.length >= 10) break;

            // Ensure balance between movies and TV shows
            if (rec.media_type === 'movie' && movieCount >= 6) continue;
            if (rec.media_type === 'tv' && tvCount >= 6) continue;

            diversified.push(rec);

            if (rec.media_type === 'movie') movieCount++;
            if (rec.media_type === 'tv') tvCount++;
        }

        return diversified;
    }

    /**
     * Calculate genre match score (0-50 points)
     */
    private calculateGenreMatch(candidate: TMDBContent, profile: TasteProfile): number {
        if (!candidate.genre_ids || candidate.genre_ids.length === 0) return 0;

        const candidateGenres = candidate.genre_ids
            .map(id => GENRE_MAP[id])
            .filter(Boolean);

        const matchingGenres = candidateGenres.filter(genre =>
            profile.favorite_genres.includes(genre)
        );

        const matchRatio = matchingGenres.length / Math.max(candidateGenres.length, 1);
        return Math.round(matchRatio * 50);
    }

    /**
     * Calculate title similarity score (0-20 points)
     */
    private calculateTitleSimilarity(candidate: TMDBContent, profile: TasteProfile): number {
        const candidateTitle = (candidate.title || candidate.name || '').toLowerCase();

        // Simple similarity check - in production would use more sophisticated matching
        const similarTitles = profile.favorite_titles.filter(title =>
            candidateTitle.includes(title.toLowerCase()) ||
            title.toLowerCase().includes(candidateTitle)
        );

        return similarTitles.length > 0 ? 20 : 0;
    }

    /**
     * Calculate rating signal score (0-20 points)
     */
    private calculateRatingSignal(candidate: TMDBContent, profile: TasteProfile): number {
        const candidateRating = candidate.vote_average || 0;
        const userAverage = profile.rating_patterns.average_rating;

        if (userAverage === 0) {
            // No user rating history, use TMDB rating
            return Math.round((candidateRating / 10) * 20);
        }

        // Score based on how close the TMDB rating is to user's average preference
        const ratingDiff = Math.abs(candidateRating - userAverage);
        const similarity = Math.max(0, 1 - (ratingDiff / 5)); // 5-point tolerance
        return Math.round(similarity * 20);
    }

    /**
     * Generate explanation for recommendation
     */
    private generateExplanation(params: {
        genreMatch: number;
        titleSimilarity: number;
        ratingSignal: number;
        friendsBoost: number;
        candidate: TMDBContent;
        profile: TasteProfile;
    }): string {
        const { genreMatch, titleSimilarity, ratingSignal, candidate, profile } = params;
        const explanations: string[] = [];

        if (genreMatch > 20) {
            const candidateGenres = candidate.genre_ids
                ?.map(id => GENRE_MAP[id])
                .filter(Boolean)
                .filter(genre => profile.favorite_genres.includes(genre));

            if (candidateGenres && candidateGenres.length > 0) {
                explanations.push(`Matches your taste in ${candidateGenres.join(', ')}`);
            }
        }

        if (titleSimilarity > 0) {
            explanations.push('Similar to your favorites');
        }

        if (ratingSignal > 15) {
            const rating = candidate.vote_average?.toFixed(1) || 'N/A';
            explanations.push(`Highly rated (${rating}/10)`);
        }

        if (explanations.length === 0) {
            explanations.push('Popular trending content');
        }

        return explanations.join(' • ');
    }

    /**
     * Validate if user has sufficient data for personalized recommendations
     */
    private validateUserData(profile: TasteProfile): boolean {
        const hasGenres = profile.favorite_genres.length > 0;
        const hasTitles = profile.favorite_titles.length > 0;
        const hasWatchHistory = profile.recent_watches.length > 0;
        
        // User needs at least one of these data points for personalized recommendations
        return hasGenres || hasTitles || hasWatchHistory;
    }

    /**
     * Get cold-start recommendations for users with minimal data
     * Uses favorite genres/titles if available, otherwise popular content
     */
    private async getColdStartRecommendations(profile: TasteProfile): Promise<ContentRecommendation[]> {
        console.log(`[ContentRecommendationAgent] Generating cold-start recommendations for user: ${profile.user_id}`);
        
        try {
            const recommendations: ContentRecommendation[] = [];

            // If user has favorite genres, use those
            if (profile.favorite_genres.length > 0) {
                console.log(`[ContentRecommendationAgent] Using favorite genres for cold-start: ${profile.favorite_genres.join(', ')}`);
                
                try {
                    const genreIds = this.mapGenresToIds(profile.favorite_genres).join(',');
                    if (genreIds) {
                        const genreMovies = await discoverByGenre(genreIds, undefined, 'vote_average.desc');
                        
                        recommendations.push(...genreMovies.slice(0, 8).map(movie => ({
                            tmdb_id: movie.id,
                            title: movie.title || 'Unknown Title',
                            media_type: 'movie' as const,
                            poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : undefined,
                            match_score: 75,
                            short_explanation: `Popular ${profile.favorite_genres.slice(0, 2).join(' & ')} content`
                        })));
                    }
                } catch (genreError) {
                    console.warn(`[ContentRecommendationAgent] Failed to get genre-based cold-start recommendations:`, genreError);
                }
            }

            // Fill remaining slots with popular trending content
            if (recommendations.length < 10) {
                try {
                    const trendingMovies = await getTrendingNowOrUpcoming('trending');
                    const remainingSlots = 10 - recommendations.length;
                    
                    recommendations.push(...trendingMovies.slice(0, remainingSlots).map(movie => ({
                        tmdb_id: movie.id,
                        title: movie.title || 'Unknown Title',
                        media_type: 'movie' as const,
                        poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : undefined,
                        match_score: 60,
                        short_explanation: 'Popular trending content'
                    })));
                } catch (trendingError) {
                    console.warn(`[ContentRecommendationAgent] Failed to get trending content for cold-start:`, trendingError);
                }
            }

            console.log(`[ContentRecommendationAgent] Generated ${recommendations.length} cold-start recommendations`);
            return recommendations;
        } catch (error) {
            console.error(`[ContentRecommendationAgent] Cold-start recommendations failed:`, error);
            return this.getEmergencyFallbackRecommendations();
        }
    }

    /**
     * Get fallback recommendations for error cases
     */
    private async getFallbackRecommendations(userId: string): Promise<ContentRecommendation[]> {
        console.log(`[ContentRecommendationAgent] Generating fallback recommendations for user: ${userId}`);
        
        try {
            const trendingMovies = await getTrendingNowOrUpcoming('trending');

            return trendingMovies.slice(0, 8).map(movie => ({
                tmdb_id: movie.id,
                title: movie.title || 'Unknown Title',
                media_type: 'movie' as const,
                poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : undefined,
                match_score: 50,
                short_explanation: 'Popular trending content'
            }));
        } catch (error) {
            console.error(`[ContentRecommendationAgent] Fallback recommendations failed:`, error);
            return this.getEmergencyFallbackRecommendations();
        }
    }

    /**
     * Emergency fallback when all TMDB calls fail
     * Returns hardcoded popular content
     */
    private getEmergencyFallbackRecommendations(): ContentRecommendation[] {
        console.log(`[ContentRecommendationAgent] Using emergency fallback recommendations`);
        
        // Hardcoded popular movies as last resort
        return [
            {
                tmdb_id: 550,
                title: 'Fight Club',
                media_type: 'movie',
                match_score: 40,
                short_explanation: 'Popular classic film'
            },
            {
                tmdb_id: 238,
                title: 'The Godfather',
                media_type: 'movie',
                match_score: 40,
                short_explanation: 'Highly rated classic'
            },
            {
                tmdb_id: 424,
                title: 'Schindler\'s List',
                media_type: 'movie',
                match_score: 40,
                short_explanation: 'Award-winning drama'
            }
        ];
    }

    /**
     * Map genre names to TMDB genre IDs
     */
    private mapGenresToIds(genres: string[]): number[] {
        const genreNameToId: Record<string, number> = {};
        Object.entries(GENRE_MAP).forEach(([id, name]) => {
            genreNameToId[name] = parseInt(id);
        });

        return genres
            .map(genre => genreNameToId[genre])
            .filter(id => id !== undefined);
    }


}