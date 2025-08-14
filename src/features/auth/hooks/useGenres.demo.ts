import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import {
  mockFetchGenres,
  mockSearchGenres,
  mockGetGenresByIds,
} from '../utils/mock-genres'
import { Genre } from '../types/onboarding'

// Query keys
export const genreQueryKeys = {
  all: ['genres'] as const,
  list: () => [...genreQueryKeys.all, 'list'] as const,
  search: (term: string) => [...genreQueryKeys.all, 'search', term] as const,
  byIds: (ids: string[]) => [...genreQueryKeys.all, 'byIds', ids] as const,
}

/**
 * Hook for fetching all genres (demo version)
 */
export function useGenres() {
  return useQuery({
    queryKey: genreQueryKeys.list(),
    queryFn: mockFetchGenres,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook for searching genres with debouncing (demo version)
 */
export function useGenreSearch(searchTerm: string, enabled = true) {
  return useQuery({
    queryKey: genreQueryKeys.search(searchTerm),
    queryFn: () => mockSearchGenres(searchTerm),
    enabled: enabled && searchTerm.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook for fetching genres by IDs (demo version)
 */
export function useGenresByIds(genreIds: string[]) {
  return useQuery({
    queryKey: genreQueryKeys.byIds(genreIds),
    queryFn: () => mockGetGenresByIds(genreIds),
    enabled: genreIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for genre selection with search and filtering (demo version)
 */
export function useGenreSelection() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])

  // Fetch all genres
  const { data: allGenres = [], isLoading: isLoadingAll } = useGenres()

  // Search genres when search term is provided
  const { data: searchResults = [], isLoading: isSearching } = useGenreSearch(
    searchTerm,
    searchTerm.length > 0
  )

  // Determine which genres to display
  const displayedGenres = useMemo(() => {
    if (searchTerm.length > 0) {
      return searchResults
    }
    return allGenres
  }, [searchTerm, searchResults, allGenres])

  // Get selected genre objects
  const { data: selectedGenreObjects = [] } = useGenresByIds(selectedGenres)

  // Selection handlers
  const toggleGenre = (genreId: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genreId)) {
        return prev.filter((id) => id !== genreId)
      }
      return [...prev, genreId]
    })
  }

  const selectGenre = (genreId: string) => {
    setSelectedGenres((prev) => {
      if (!prev.includes(genreId)) {
        return [...prev, genreId]
      }
      return prev
    })
  }

  const deselectGenre = (genreId: string) => {
    setSelectedGenres((prev) => prev.filter((id) => id !== genreId))
  }

  const clearSelection = () => {
    setSelectedGenres([])
  }

  const setSelection = (genreIds: string[]) => {
    setSelectedGenres(genreIds)
  }

  // Validation
  const isValidSelection =
    selectedGenres.length >= 1 && selectedGenres.length <= 10
  const selectionError =
    selectedGenres.length === 0
      ? 'Please select at least one genre'
      : selectedGenres.length > 10
        ? 'You can select up to 10 genres'
        : null

  return {
    // Data
    genres: displayedGenres,
    selectedGenres,
    selectedGenreObjects,

    // Search
    searchTerm,
    setSearchTerm,

    // Loading states
    isLoading: isLoadingAll || isSearching,

    // Selection actions
    toggleGenre,
    selectGenre,
    deselectGenre,
    clearSelection,
    setSelection,

    // Validation
    isValidSelection,
    selectionError,

    // Computed values
    selectedCount: selectedGenres.length,
    maxSelections: 10,
    canSelectMore: selectedGenres.length < 10,
  }
}
