"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  InputHTMLAttributes,
} from "react";
import { Search, X, Film, Tv, AlertCircle, Loader2 } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useMediaSearch } from "@/hooks/use-media-search";
import { cn } from "@/lib/utils";
import { TMDBSearchResult } from "@/features/ai-chat/data/tmdb.repository";
import { SelectedMedia } from "@/features/streaming";

export interface MediaSearchFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  onMediaSelect: (media: SelectedMedia | null) => void;
  selectedMedia?: SelectedMedia | null;
}

export function MediaSearchField({
  onMediaSelect,
  selectedMedia,
  className,
  ...props
}: MediaSearchFieldProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const resultRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const {
    results,
    isLoading,
    error,
    hasSearched,
    search,
    clearResults,
    retry,
  } = useMediaSearch();

  // Handle input changes and trigger search
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      search(value);
      setIsOpen(true);
      setFocusedIndex(-1);
    },
    [search]
  );

  // Handle media selection
  const handleMediaSelect = useCallback(
    (result: TMDBSearchResult) => {
      const selectedMedia: SelectedMedia = {
        tmdb_id: result.id,
        media_type: result.media_type,
        media_title: result.media_type === "movie" ? result.title : result.name,
        poster_path: result.poster_path,
        release_date:
          result.media_type === "movie"
            ? result.release_date
            : result.first_air_date,
      };

      onMediaSelect(selectedMedia);
      setQuery(selectedMedia.media_title);
      setIsOpen(false);
      setFocusedIndex(-1);
    },
    [onMediaSelect]
  );

  // Handle clearing selection
  const handleClear = useCallback(() => {
    onMediaSelect(null);
    setQuery("");
    clearResults();
    setIsOpen(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  }, [onMediaSelect, clearResults]);

  // Focus management for keyboard navigation
  useEffect(() => {
    if (focusedIndex >= 0 && resultRefs.current[focusedIndex]) {
      resultRefs.current[focusedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [focusedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set initial query from selected media
  useEffect(() => {
    if (selectedMedia && !query) {
      setQuery(selectedMedia.media_title);
    }
  }, [selectedMedia, query]);

  const showDropdown =
    isOpen &&
    (results.length > 0 ||
      isLoading ||
      error ||
      (hasSearched && query.length >= 3));

  return (
    <div className={cn("relative w-full", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>

        <Input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search for movies and TV shows..."
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0 || error) {
              setIsOpen(true);
            }
          }}
          className={cn(
            "pl-10 pr-10",
            selectedMedia && "border-accent/50 bg-accent/5"
          )}
          aria-expanded={showDropdown ? "true" : "false"}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
          {...props}
        />

        {/* Clear Button */}
        {(query || selectedMedia) && !props.disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
            aria-label="Clear selection"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showDropdown && (
        <div ref={dropdownRef} className="media-search-dropdown" role="listbox">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-destructive mb-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={retry}
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* No Results */}
          {!isLoading &&
            !error &&
            hasSearched &&
            results.length === 0 &&
            query.length >= 3 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No movies or TV shows found for "{query}"
              </div>
            )}

          {/* Search Results */}
          {!isLoading && !error && results.length > 0 && (
            <div className="py-1">
              {results.map((result, index) => (
                <SearchResultItem
                  key={`${result.media_type}-${result.id}`}
                  ref={(el) => {
                    resultRefs.current[index] = el;
                  }}
                  result={result}
                  isSelected={selectedMedia?.tmdb_id === result.id}
                  isFocused={focusedIndex === index}
                  onClick={() => handleMediaSelect(result)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Search Result Item Component
interface SearchResultItemProps {
  result: TMDBSearchResult;
  isSelected: boolean;
  isFocused: boolean;
  onClick: () => void;
}

const SearchResultItem = React.forwardRef<
  HTMLButtonElement,
  SearchResultItemProps
>(({ result, isSelected, isFocused, onClick }, ref) => {
  const title = result.media_type === "movie" ? result.title : result.name;
  const releaseDate =
    result.media_type === "movie" ? result.release_date : result.first_air_date;
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : null;

  const posterUrl = result.poster_path
    ? `https://image.tmdb.org/t/p/w92${result.poster_path}`
    : null;

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={cn(
        "media-search-result",
        isFocused && "focused",
        isSelected && "selected"
      )}
      role="option"
      aria-selected={isSelected}
    >
      {/* Poster Image */}
      <div className="media-search-poster">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={`${title} poster`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="media-search-poster-placeholder">
            {result.media_type === "movie" ? (
              <Film className="h-6 w-6 text-muted-foreground" />
            ) : (
              <Tv className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-sm truncate">{title}</h4>
          {releaseYear && (
            <span className="text-xs text-muted-foreground">
              ({releaseYear})
            </span>
          )}
        </div>

        {/* Media Type Badge */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "media-type-badge",
              result.media_type === "movie" ? "movie" : "tv"
            )}
          >
            {result.media_type === "movie" ? (
              <>
                <Film className="h-3 w-3" />
                Movie
              </>
            ) : (
              <>
                <Tv className="h-3 w-3" />
                TV Show
              </>
            )}
          </span>
        </div>
      </div>
    </button>
  );
});

SearchResultItem.displayName = "SearchResultItem";
