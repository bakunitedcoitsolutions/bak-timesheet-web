/**
 * File Upload Utilities
 * Helper functions for uploading files to Supabase Storage
 */

import { supabase } from "@/lib/db/supabase";

export interface UploadFileOptions {
  /**
   * The Supabase Storage bucket name
   */
  bucket: string;
  /**
   * Optional folder path within the bucket (e.g., "avatars", "documents/2024")
   */
  folder?: string;
  /**
   * Optional custom file name. If not provided, a unique name will be generated
   */
  fileName?: string;
  /**
   * Whether to make the file public (default: true)
   */
  isPublic?: boolean;
  /**
   * Optional cache control header (default: "3600")
   */
  cacheControl?: string;
  /**
   * Whether to overwrite existing file with same name (default: false)
   */
  upsert?: boolean;
}

export interface UploadFileResult {
  /**
   * The public URL of the uploaded file
   */
  url: string;
  /**
   * The file path in the storage bucket
   */
  path: string;
  /**
   * The original file name
   */
  originalFileName: string;
}

/**
 * Validates file type
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Validates file size
 */
export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * Generates a unique file name
 */
const generateUniqueFileName = (originalFileName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalFileName.split(".").pop();
  const nameWithoutExtension = originalFileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9]/g, "_");
  return `${nameWithoutExtension}_${timestamp}_${randomString}.${extension}`;
};

/**
 * Uploads a file to Supabase Storage
 *
 * @param file - The file to upload
 * @param options - Upload options
 * @returns Promise with the upload result containing URL and path
 *
 * @example
 * ```ts
 * const result = await uploadFile(file, {
 *   bucket: "avatars",
 *   folder: "users",
 *   isPublic: true
 * });
 * // result.url - Use this to save in database
 * ```
 */
export const uploadFile = async (
  file: File,
  options: UploadFileOptions
): Promise<UploadFileResult> => {
  const {
    bucket,
    folder = "",
    fileName,
    isPublic = true,
    cacheControl = "3600",
    upsert = false,
  } = options;

  // Generate file path
  const finalFileName = fileName || generateUniqueFileName(file.name);
  const filePath = folder ? `${folder}/${finalFileName}` : finalFileName;

  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl,
      upsert,
    });

  if (error) {
    // Provide more helpful error messages for common issues
    if (
      error.message.includes("Bucket not found") ||
      error.message.includes("not found")
    ) {
      throw new Error(
        `Bucket "${bucket}" does not exist in Supabase Storage. Please create it in Supabase Dashboard > Storage.`
      );
    }
    if (
      error.message.includes("row-level security policy") ||
      error.message.includes("RLS")
    ) {
      throw new Error(
        `Row Level Security (RLS) policy violation. Please configure Storage policies in Supabase Dashboard > Storage > Policies for bucket "${bucket}". Either disable RLS or create a policy that allows uploads.`
      );
    }
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get URL for database storage
  // For public files, return public URL (can be saved directly to DB)
  // For private files, return the file path (save this to DB, use getSignedUrl() when displaying)
  let url: string;
  if (isPublic) {
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    url = urlData.publicUrl;
  } else {
    // For private files, return the file path to save in DB
    // Use getSignedUrl() helper to generate signed URLs when displaying
    url = filePath;
  }

  return {
    url,
    path: filePath,
    originalFileName: file.name,
  };
};

/**
 * Uploads multiple files to Supabase Storage
 *
 * @param files - Array of files to upload
 * @param options - Upload options (applied to all files)
 * @returns Promise with array of upload results
 *
 * @example
 * ```ts
 * const results = await uploadMultipleFiles([file1, file2], {
 *   bucket: "documents",
 *   folder: "2024"
 * });
 * ```
 */
export const uploadMultipleFiles = async (
  files: File[],
  options: UploadFileOptions
): Promise<UploadFileResult[]> => {
  const uploadPromises = files.map((file) => uploadFile(file, options));
  return Promise.all(uploadPromises);
};

/**
 * Generates a signed URL for a private file
 * Use this when you need to display a private file that was saved as a path in the database
 *
 * @param bucket - The Supabase Storage bucket name
 * @param filePath - The file path (saved in database)
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Promise with the signed URL
 *
 * @example
 * ```ts
 * // File path saved in DB: "users/avatar.jpg"
 * const signedUrl = await getSignedUrl("avatars", "users/avatar.jpg", 3600);
 * // Use signedUrl to display the image
 * ```
 */
export const getSignedUrl = async (
  bucket: string,
  filePath: string,
  expiresIn: number = 3600
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }

  return data.signedUrl;
};

/**
 * Deletes a file from Supabase Storage
 *
 * @param bucket - The Supabase Storage bucket name
 * @param filePath - The path of the file to delete
 *
 * @example
 * ```ts
 * await deleteFile("avatars", "users/user123.jpg");
 * ```
 */
export const deleteFile = async (
  bucket: string,
  filePath: string
): Promise<void> => {
  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

/**
 * Deletes multiple files from Supabase Storage
 *
 * @param bucket - The Supabase Storage bucket name
 * @param filePaths - Array of file paths to delete
 *
 * @example
 * ```ts
 * await deleteMultipleFiles("avatars", ["users/user1.jpg", "users/user2.jpg"]);
 * ```
 */
export const deleteMultipleFiles = async (
  bucket: string,
  filePaths: string[]
): Promise<void> => {
  const { error } = await supabase.storage.from(bucket).remove(filePaths);

  if (error) {
    throw new Error(`Failed to delete files: ${error.message}`);
  }
};

/**
 * Common file type constants for validation
 */
export const FILE_TYPES = {
  IMAGES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/heic", // iPhone HEIC format
    "image/heif", // iPhone HEIF format
  ],
  DOCUMENTS: [
    "application/pdf",
    // "application/msword",
    // "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    // "application/vnd.ms-excel",
    // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  ALL: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/heic", // iPhone HEIC format
    "image/heif", // iPhone HEIF format
    "application/pdf",
    // "application/msword",
    // "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    // "application/vnd.ms-excel",
    // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
} as const;

/**
 * Common file size limits (in MB)
 */
export const FILE_SIZE_LIMITS = {
  IMAGE: 5, // 5MB
  DOCUMENT: 10, // 10MB
  LARGE_DOCUMENT: 50, // 50MB
} as const;
