/**
 * Error handling utilities
 * Safely extract error messages from various error formats
 */

/**
 * Safely extracts an error message from various error formats
 * Prevents crashes when error is an object or complex structure
 *
 * @param error - The error object (can be Error, string, object, or any)
 * @param fallback - Fallback message if error cannot be extracted (default: "An error occurred")
 * @returns A safe string message
 *
 * @example
 * ```ts
 * getErrorMessage(error) // "Email already exists"
 * getErrorMessage({ message: "Error" }) // "Error"
 * getErrorMessage("Simple string") // "Simple string"
 * getErrorMessage(null, "Default") // "Default"
 * ```
 */
export const getErrorMessage = (
  error: unknown,
  fallback: string = "An error occurred"
): string => {
  // Handle null or undefined
  if (error == null) {
    return fallback;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error || fallback;
  }

  // Handle Error instances
  if (error instanceof Error) {
    return error.message || fallback;
  }

  // Handle objects with message property
  if (typeof error === "object") {
    // Check for common error message locations
    const errorObj: any = error as Record<string, unknown>;

    if (typeof errorObj.message === "string" && errorObj.message) {
      return errorObj.message;
    }

    if (typeof errorObj.err?.message === "string" && errorObj.err.message) {
      return (errorObj.err as { message: string }).message;
    }

    if (typeof errorObj.error?.message === "string" && errorObj.error.message) {
      return (errorObj.error as { message: string }).message;
    }

    // Handle Prisma errors (they have code and message)
    if (
      typeof errorObj.code === "string" &&
      typeof errorObj.message === "string"
    ) {
      return errorObj.message;
    }

    // Try to stringify if it's a plain object (but avoid circular references)
    try {
      const stringified = JSON.stringify(error);
      // Only return if it's a reasonable length and not just "{}"
      if (stringified && stringified !== "{}" && stringified.length < 500) {
        return stringified;
      }
    } catch {
      // Ignore JSON stringify errors (circular references, etc.)
    }
  }

  // Fallback: try to convert to string
  try {
    const stringValue = String(error);
    if (stringValue && stringValue !== "[object Object]") {
      return stringValue;
    }
  } catch {
    // Ignore conversion errors
  }

  return fallback;
};
