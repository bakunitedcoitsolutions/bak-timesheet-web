/**
 * Storage Configuration Constants
 * 
 * These constants are loaded from environment variables.
 * For client-side access, use NEXT_PUBLIC_ prefix.
 */

export const STORAGE_CONFIG = {
  /**
   * Supabase Storage bucket name for employee files
   */
  EMPLOYEES_BUCKET:
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_EMPLOYEES || "employees",

  /**
   * Folder path within the employees bucket for avatar/profile pictures
   */
  EMPLOYEES_AVATARS_FOLDER:
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_FOLDER_AVATARS || "avatars",
} as const;
