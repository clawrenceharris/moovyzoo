import { Genre } from '../types/onboarding'

// Mock genre data for demo purposes
export const mockGenres: Genre[] = [
  {
    id: 'action',
    name: 'Action',
    tmdbId: 28,
    description:
      'High-energy films with exciting sequences and thrilling adventures',
    isActive: true,
  },
  {
    id: 'adventure',
    name: 'Adventure',
    tmdbId: 12,
    description: 'Exciting journeys and quests in exotic locations',
    isActive: true,
  },
  {
    id: 'animation',
    name: 'Animation',
    tmdbId: 16,
    description: 'Animated films and cartoons for all ages',
    isActive: true,
  },
  {
    id: 'comedy',
    name: 'Comedy',
    tmdbId: 35,
    description: 'Humorous and entertaining films that make you laugh',
    isActive: true,
  },
  {
    id: 'crime',
    name: 'Crime',
    tmdbId: 80,
    description: 'Stories involving criminal activities and investigations',
    isActive: true,
  },
  {
    id: 'documentary',
    name: 'Documentary',
    tmdbId: 99,
    description: 'Non-fiction films about real subjects and events',
    isActive: true,
  },
  {
    id: 'drama',
    name: 'Drama',
    tmdbId: 18,
    description: 'Serious, plot-driven films with emotional depth',
    isActive: true,
  },
  {
    id: 'family',
    name: 'Family',
    tmdbId: 10751,
    description: 'Films suitable for all ages and family viewing',
    isActive: true,
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    tmdbId: 14,
    description: 'Magical and supernatural stories with mythical elements',
    isActive: true,
  },
  {
    id: 'history',
    name: 'History',
    tmdbId: 36,
    description: 'Films set in historical periods and based on real events',
    isActive: true,
  },
  {
    id: 'horror',
    name: 'Horror',
    tmdbId: 27,
    description: 'Scary and suspenseful films designed to frighten',
    isActive: true,
  },
  {
    id: 'music',
    name: 'Music',
    tmdbId: 10402,
    description:
      'Films centered around music, musicians, and musical performances',
    isActive: true,
  },
  {
    id: 'mystery',
    name: 'Mystery',
    tmdbId: 9648,
    description: 'Puzzling and suspenseful stories with secrets to uncover',
    isActive: true,
  },
  {
    id: 'romance',
    name: 'Romance',
    tmdbId: 10749,
    description: 'Love stories and romantic films about relationships',
    isActive: true,
  },
  {
    id: 'sci-fi',
    name: 'Science Fiction',
    tmdbId: 878,
    description: 'Futuristic and technological stories exploring what could be',
    isActive: true,
  },
  {
    id: 'thriller',
    name: 'Thriller',
    tmdbId: 53,
    description: 'Intense and suspenseful films that keep you on edge',
    isActive: true,
  },
  {
    id: 'war',
    name: 'War',
    tmdbId: 10752,
    description: 'Films about warfare, conflict, and military operations',
    isActive: true,
  },
  {
    id: 'western',
    name: 'Western',
    tmdbId: 37,
    description: 'Films set in the American Old West with cowboys and outlaws',
    isActive: true,
  },
]

// Mock functions that simulate API calls
export const mockFetchGenres = async (): Promise<Genre[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockGenres
}

export const mockSearchGenres = async (
  searchTerm: string
): Promise<Genre[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const searchLower = searchTerm.toLowerCase()
  return mockGenres.filter(
    (genre) =>
      genre.name.toLowerCase().includes(searchLower) ||
      genre.description.toLowerCase().includes(searchLower)
  )
}

export const mockGetGenresByIds = async (
  genreIds: string[]
): Promise<Genre[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  return mockGenres.filter((genre) => genreIds.includes(genre.id))
}
