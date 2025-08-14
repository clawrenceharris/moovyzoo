import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Genre } from '../types/onboarding'
import { AppErrorCode } from './error-codes'

// Collection reference
const GENRES_COLLECTION = 'genres'

/**
 * Fetch all active genres from Firestore
 */
export async function fetchGenres(): Promise<Genre[]> {
  try {
    const genresRef = collection(db, GENRES_COLLECTION)
    const q = query(
      genresRef,
      where('isActive', '==', true),
      orderBy('name', 'asc')
    )

    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Genre[]
  } catch (error) {
    console.error('Error fetching genres:', error)
    throw new Error(AppErrorCode.FIRESTORE_READ_ERROR)
  }
}

/**
 * Search genres by name
 */
export async function searchGenres(searchTerm: string): Promise<Genre[]> {
  try {
    const genresRef = collection(db, GENRES_COLLECTION)
    const q = query(
      genresRef,
      where('isActive', '==', true),
      orderBy('name', 'asc'),
      limit(20)
    )

    const snapshot = await getDocs(q)
    const allGenres = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Genre[]

    // Client-side filtering for search
    const searchLower = searchTerm.toLowerCase()
    return allGenres.filter(
      (genre) =>
        genre.name.toLowerCase().includes(searchLower) ||
        genre.description.toLowerCase().includes(searchLower)
    )
  } catch (error) {
    console.error('Error searching genres:', error)
    throw new Error(AppErrorCode.FIRESTORE_READ_ERROR)
  }
}

/**
 * Get genre by ID
 */
export async function getGenreById(genreId: string): Promise<Genre | null> {
  try {
    const genreRef = doc(db, GENRES_COLLECTION, genreId)
    const snapshot = await getDoc(genreRef)

    if (!snapshot.exists()) {
      return null
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Genre
  } catch (error) {
    console.error('Error fetching genre by ID:', error)
    throw new Error(AppErrorCode.FIRESTORE_READ_ERROR)
  }
}

/**
 * Get multiple genres by IDs
 */
export async function getGenresByIds(genreIds: string[]): Promise<Genre[]> {
  try {
    const genres: Genre[] = []

    // Fetch genres in batches to avoid Firestore limitations
    for (const genreId of genreIds) {
      const genre = await getGenreById(genreId)
      if (genre) {
        genres.push(genre)
      }
    }

    return genres
  } catch (error) {
    console.error('Error fetching genres by IDs:', error)
    throw new Error(AppErrorCode.FIRESTORE_READ_ERROR)
  }
}

/**
 * Initialize default genres (for development/seeding)
 * This would typically be called from an admin function
 */
export async function initializeDefaultGenres(): Promise<void> {
  const defaultGenres: Omit<Genre, 'id'>[] = [
    {
      name: 'Action',
      tmdbId: 28,
      description: 'High-energy films with exciting sequences',
      isActive: true,
    },
    {
      name: 'Adventure',
      tmdbId: 12,
      description: 'Exciting journeys and quests',
      isActive: true,
    },
    {
      name: 'Animation',
      tmdbId: 16,
      description: 'Animated films and cartoons',
      isActive: true,
    },
    {
      name: 'Comedy',
      tmdbId: 35,
      description: 'Humorous and entertaining films',
      isActive: true,
    },
    {
      name: 'Crime',
      tmdbId: 80,
      description: 'Stories involving criminal activities',
      isActive: true,
    },
    {
      name: 'Documentary',
      tmdbId: 99,
      description: 'Non-fiction films about real subjects',
      isActive: true,
    },
    {
      name: 'Drama',
      tmdbId: 18,
      description: 'Serious, plot-driven films',
      isActive: true,
    },
    {
      name: 'Family',
      tmdbId: 10751,
      description: 'Films suitable for all ages',
      isActive: true,
    },
    {
      name: 'Fantasy',
      tmdbId: 14,
      description: 'Magical and supernatural stories',
      isActive: true,
    },
    {
      name: 'History',
      tmdbId: 36,
      description: 'Films set in historical periods',
      isActive: true,
    },
    {
      name: 'Horror',
      tmdbId: 27,
      description: 'Scary and suspenseful films',
      isActive: true,
    },
    {
      name: 'Music',
      tmdbId: 10402,
      description: 'Films centered around music',
      isActive: true,
    },
    {
      name: 'Mystery',
      tmdbId: 9648,
      description: 'Puzzling and suspenseful stories',
      isActive: true,
    },
    {
      name: 'Romance',
      tmdbId: 10749,
      description: 'Love stories and romantic films',
      isActive: true,
    },
    {
      name: 'Science Fiction',
      tmdbId: 878,
      description: 'Futuristic and technological stories',
      isActive: true,
    },
    {
      name: 'Thriller',
      tmdbId: 53,
      description: 'Intense and suspenseful films',
      isActive: true,
    },
    {
      name: 'War',
      tmdbId: 10752,
      description: 'Films about warfare and conflict',
      isActive: true,
    },
    {
      name: 'Western',
      tmdbId: 37,
      description: 'Films set in the American Old West',
      isActive: true,
    },
  ]

  try {
    for (const genre of defaultGenres) {
      const genreRef = doc(collection(db, GENRES_COLLECTION))
      await setDoc(genreRef, {
        ...genre,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
    }
  } catch (error) {
    console.error('Error initializing default genres:', error)
    throw new Error(AppErrorCode.FIRESTORE_WRITE_ERROR)
  }
}
