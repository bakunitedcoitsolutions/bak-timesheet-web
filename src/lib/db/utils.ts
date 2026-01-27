/**
 * Database Utility Functions
 * Shared utility functions for database operations
 */

/**
 * Convert Prisma Decimal to number for client serialization
 */
export const convertDecimalToNumber = (value: any): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "number") {
    return value;
  }
  // Prisma Decimal has a toNumber() method
  if (value && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  // Fallback: try to parse as number
  const num = Number(value);
  return isNaN(num) ? null : num;
};
