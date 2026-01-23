import { useState, useEffect } from "react";

/**
 * Custom hook for debouncing a value
 * 
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 500)
 * @returns The debounced value
 * 
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState("");
 * const debouncedSearch = useDebounce(searchTerm, 500);
 * 
 * // Use debouncedSearch in API calls
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     fetchData(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 * ```
 */
export const useDebounce = <T,>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if value changes before the delay completes
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};
