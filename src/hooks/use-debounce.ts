import { useEffect, useState } from "react";

/**
 * Custom hook for debouncing values
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for debounced search functionality
 * @param searchTerm - The search term to debounce
 * @param delay - The delay in milliseconds (default: 300ms)
 * @param minLength - Minimum length before triggering search (default: 3)
 * @returns Object with debouncedTerm and shouldSearch flag
 */
export function useDebouncedSearch(
  searchTerm: string,
  delay: number = 300,
  minLength: number = 3
): { debouncedTerm: string; shouldSearch: boolean } {
  const debouncedTerm = useDebounce(searchTerm, delay);
  const shouldSearch = debouncedTerm.length >= minLength;

  return { debouncedTerm, shouldSearch };
}
