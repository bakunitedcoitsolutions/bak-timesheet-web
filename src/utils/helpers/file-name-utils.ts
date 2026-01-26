/**
 * File Name Utilities
 * Helper functions for formatting and displaying file names
 */

/**
 * Formats a file name to show extension and truncate long names with ellipsis in the middle
 * 
 * @param fileName - The full file name
 * @param maxNameLength - Maximum length before truncation (default: 15)
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 6)
 * @returns Formatted file name with extension always visible
 * 
 * @example
 * formatFileName("very-long-filename.jpg") // "very-l...ename.jpg"
 * formatFileName("short.jpg") // "short.jpg"
 * formatFileName("document.pdf") // "docume...ment.pdf"
 */
export const formatFileName = (
  fileName: string,
  maxNameLength: number = 15,
  startChars: number = 6,
  endChars: number = 6
): string => {
  const lastDotIndex = fileName.lastIndexOf(".");
  
  // If no extension, return as is
  if (lastDotIndex === -1) {
    return fileName.length > maxNameLength
      ? `${fileName.substring(0, startChars)}...${fileName.substring(fileName.length - endChars)}`
      : fileName;
  }
  
  const nameWithoutExt = fileName.substring(0, lastDotIndex);
  const extension = fileName.substring(lastDotIndex + 1);
  
  // If name is short enough, return as is
  if (nameWithoutExt.length <= maxNameLength) {
    return `${nameWithoutExt}.${extension}`;
  }
  
  // Truncate with ellipsis in the middle
  const start = nameWithoutExt.substring(0, startChars);
  const end = nameWithoutExt.substring(nameWithoutExt.length - endChars);
  
  return `${start}...${end}.${extension}`;
};
