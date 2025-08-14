'use client'

import { useState } from 'react'
import { cn } from '@/styles/styles'
import { useGenreSelection } from '../../hooks/useGenres.demo'
import { Genre } from '../../types/onboarding'

interface GenreSelectionProps {
  selectedGenres: string[]
  onSelectionChange: (genreIds: string[]) => void
  className?: string
}

interface GenreCardProps {
  genre: Genre
  isSelected: boolean
  onToggle: () => void
  disabled?: boolean
}

function GenreCard({ genre, isSelected, onToggle, disabled }: GenreCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'relative rounded-xl border-2 p-4 transition-all duration-200',
        'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'flex min-h-[120px] flex-col justify-between text-left',
        isSelected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
        disabled && 'cursor-not-allowed opacity-50 hover:scale-100'
      )}
    >
      {/* Selection indicator */}
      <div className="absolute right-2 top-2">
        <div
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-full border-2',
            isSelected
              ? 'border-primary bg-primary'
              : 'border-gray-300 bg-white'
          )}
        >
          {isSelected && (
            <svg
              className="h-3 w-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Genre icon placeholder */}
      <div className="mb-2">
        {genre.iconUrl ? (
          <img
            src={genre.iconUrl}
            alt={`${genre.name} icon`}
            className="h-8 w-8 object-contain"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200">
            <span className="text-xs font-medium text-gray-500">
              {genre.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Genre info */}
      <div className="flex-1">
        <h3 className="mb-1 font-semibold text-gray-900">{genre.name}</h3>
        <p className="line-clamp-2 text-sm text-gray-600">
          {genre.description}
        </p>
      </div>
    </button>
  )
}

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search genres...'}
        className={cn(
          'w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4',
          'focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary',
          'placeholder-gray-500'
        )}
      />
    </div>
  )
}

export default function GenreSelectionDemo({
  selectedGenres,
  onSelectionChange,
  className,
}: GenreSelectionProps) {
  const {
    genres,
    searchTerm,
    setSearchTerm,
    isLoading,
    isValidSelection,
    selectionError,
    maxSelections,
  } = useGenreSelection()

  const selectedCount = selectedGenres.length
  const canSelectMore = selectedGenres.length < maxSelections

  const handleToggle = (genreId: string) => {
    const isCurrentlySelected = selectedGenres.includes(genreId)
    let newSelection: string[]

    if (isCurrentlySelected) {
      newSelection = selectedGenres.filter((id) => id !== genreId)
    } else {
      if (selectedGenres.length >= maxSelections) {
        return // Don't allow more selections
      }
      newSelection = [...selectedGenres, genreId]
    }

    onSelectionChange(newSelection)
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="animate-pulse">
          <div className="mb-6 h-12 rounded-xl bg-gray-200"></div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with selection count */}
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Choose Your Favorite Genres
        </h2>
        <p className="mb-4 text-gray-600">
          Select the movie genres you love most. This helps us personalize your
          experience.
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm">
          <span
            className={cn(
              'rounded-full px-3 py-1',
              isValidSelection
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
            )}
          >
            {selectedCount} of {maxSelections} selected
          </span>
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={() => onSelectionChange([])}
              className="font-medium text-primary hover:text-primary/80"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Search input */}
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search for genres..."
      />

      {/* Error message */}
      {selectionError && (
        <div className="text-center">
          <p className="text-sm text-red-600">{selectionError}</p>
        </div>
      )}

      {/* Genre grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {genres.map((genre) => (
          <GenreCard
            key={genre.id}
            genre={genre}
            isSelected={selectedGenres.includes(genre.id)}
            onToggle={() => handleToggle(genre.id)}
            disabled={!selectedGenres.includes(genre.id) && !canSelectMore}
          />
        ))}
      </div>

      {/* No results message */}
      {genres.length === 0 && searchTerm && (
        <div className="py-12 text-center">
          <p className="text-gray-500">
            No genres found for "{searchTerm}". Try a different search term.
          </p>
        </div>
      )}

      {/* Selection summary */}
      {selectedCount > 0 && (
        <div className="rounded-xl bg-gray-50 p-4">
          <h3 className="mb-2 font-medium text-gray-900">Selected Genres:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedGenres.map((genreId) => {
              const genre = genres.find((g) => g.id === genreId)
              if (!genre) return null

              return (
                <span
                  key={genreId}
                  className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                >
                  {genre.name}
                  <button
                    type="button"
                    onClick={() => handleToggle(genreId)}
                    className="ml-2 hover:text-primary/80"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
