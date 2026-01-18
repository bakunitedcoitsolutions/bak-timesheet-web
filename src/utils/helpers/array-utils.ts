/**
 * Sort an array by the order items first appear in the original array based on a key
 * @param data - The original array to reference for order
 * @param key - The key to group by (e.g., 'section', 'category')
 * @returns A new sorted array
 */
export const sortByOriginalOrder = <T extends Record<string, any>>(
  data: T[],
  key: keyof T
): T[] => {
  return [...data].sort((a, b) => {
    // Find the first occurrence index of each key value in the original data
    const valueAIndex = data.findIndex((item) => item[key] === a[key]);
    const valueBIndex = data.findIndex((item) => item[key] === b[key]);

    // Sort by the order values first appear in the original data
    if (valueAIndex !== valueBIndex) {
      return valueAIndex - valueBIndex;
    }

    // If same key value, maintain original order
    return 0;
  });
};
