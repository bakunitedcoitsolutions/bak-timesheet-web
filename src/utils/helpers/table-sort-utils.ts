/**
 * Table sorting utilities
 * Helper functions for managing server-side table sorting
 */

export type SortOrder = "asc" | "desc" | undefined;

/**
 * PrimeReact sort event type (DataTableStateEvent)
 */
export interface PrimeReactSortEvent {
  sortField?: string | null;
  sortOrder?: number | null; // 1 = asc, -1 = desc, 0 = no sort, null = no sort
}

/**
 * Sort handler options
 */
export interface SortHandlerOptions<T extends string> {
  /**
   * Map of table field names to API sortable field names
   */
  fieldMap: Record<string, T>;
  /**
   * Current page number (to reset when sorting changes)
   */
  currentPage?: number;
  /**
   * Callback to set the sort field
   */
  onSortByChange: (field: T | undefined) => void;
  /**
   * Callback to set the sort order
   */
  onSortOrderChange: (order: SortOrder) => void;
  /**
   * Optional callback to reset page to 1 when sorting changes
   */
  onPageReset?: () => void;
}

/**
 * Creates a sort handler function for PrimeReact DataTable
 *
 * @param options - Sort handler configuration
 * @returns A function that can be used as the `onSort` prop for PrimeReact DataTable
 *
 * @example
 * ```ts
 * const handleSort = createSortHandler({
 *   fieldMap: {
 *     nameEn: "nameEn",
 *     email: "email",
 *     isActive: "isActive",
 *   },
 *   currentPage: page,
 *   onSortByChange: setSortBy,
 *   onSortOrderChange: setSortOrder,
 *   onPageReset: () => setPage(1),
 * });
 *
 * <Table onSort={handleSort} ... />
 * ```
 */
export const createSortHandler = <T extends string>(
  options: SortHandlerOptions<T>
) => {
  const {
    fieldMap,
    currentPage,
    onSortByChange,
    onSortOrderChange,
    onPageReset,
  } = options;

  return (e: PrimeReactSortEvent) => {
    const field = e.sortField;
    const order = e.sortOrder;

    // Handle null, undefined, or 0 as "no sort"
    if (!field || order === null || order === undefined || order === 0) {
      // Remove sort
      onSortByChange(undefined);
      onSortOrderChange(undefined);
    } else if (field && fieldMap[field]) {
      // Set sort field and order
      onSortByChange(fieldMap[field]);
      onSortOrderChange(order === 1 ? "asc" : "desc");

      // Reset to first page when sorting changes (if not already on page 1)
      if (currentPage !== undefined && currentPage !== 1 && onPageReset) {
        onPageReset();
      }
    }
  };
};

/**
 * Converts API sort order to PrimeReact sort order
 *
 * @param sortOrder - API sort order ("asc" | "desc" | undefined)
 * @returns PrimeReact sort order (1 = asc, -1 = desc, 0 = no sort)
 */
export const toPrimeReactSortOrder = (sortOrder: SortOrder): number => {
  if (sortOrder === "asc") return 1;
  if (sortOrder === "desc") return -1;
  return 0;
};
