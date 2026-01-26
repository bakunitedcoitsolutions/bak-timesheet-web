"use client";

import { useState, useCallback, useEffect } from "react";
import { toastService } from "@/lib/toast";
import {
  FILE_TYPES,
  uploadFile,
  getSignedUrl,
  validateFileType,
  validateFileSize,
  FILE_SIZE_LIMITS,
} from "@/utils/helpers";
import { STORAGE_CONFIG } from "@/utils/constants";

export interface UseFileUploadOptions {
  /**
   * Existing file path from database (for edit mode)
   */
  existingFilePath?: string | null;
  /**
   * Bucket name for storage
   */
  bucket?: string;
  /**
   * Folder path within bucket
   */
  folder?: string;
  /**
   * File types to accept
   */
  acceptedTypes?: string[];
  /**
   * Maximum file size in MB
   */
  maxSizeMB?: number;
  /**
   * Whether file is public (default: false for private files)
   */
  isPublic?: boolean;
  /**
   * Callback when file is uploaded successfully
   */
  onUploadSuccess?: (filePath: string, signedUrl: string) => void;
  /**
   * Callback when file is deleted
   */
  onDelete?: () => void;
}

export interface UseFileUploadReturn {
  /**
   * Currently selected file (for new uploads)
   */
  selectedFile: File | null;
  /**
   * Signed URL for displaying existing or uploaded file
   */
  displayUrl: string | null;
  /**
   * Whether file is currently being uploaded
   */
  isUploading: boolean;
  /**
   * Whether file should be deleted on save
   */
  shouldDelete: boolean;
  /**
   * Handle file selection from FilePicker
   */
  handleFileSelect: (files: File[]) => void;
  /**
   * Mark file for deletion
   */
  markForDeletion: () => void;
  /**
   * Clear deletion flag
   */
  clearDeletion: () => void;
  /**
   * Upload file and return file path (call after successful DB save)
   */
  uploadFileAfterSave: (
    entityId: number,
    updateEntity: (data: any) => Promise<any>,
    formData: any,
    fileFieldName?: string
  ) => Promise<string | null>;
  /**
   * Get synthetic File object for FilePicker to display existing file
   */
  getExistingFileObject: () => File | null;
  /**
   * Reset all file state
   */
  reset: () => void;
}

/**
 * Reusable hook for file uploads in forms
 * Handles file selection, validation, upload, and deletion
 */
export const useFileUpload = (
  options: UseFileUploadOptions = {}
): UseFileUploadReturn => {
  const {
    existingFilePath,
    bucket = STORAGE_CONFIG.EMPLOYEES_BUCKET,
    folder = STORAGE_CONFIG.EMPLOYEES_AVATARS_FOLDER,
    acceptedTypes = FILE_TYPES.IMAGES,
    maxSizeMB = FILE_SIZE_LIMITS.IMAGE,
    isPublic = false,
    onUploadSuccess,
    onDelete,
  } = options;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [shouldDelete, setShouldDelete] = useState(false);

  // Generate signed URL for existing file on mount/change
  useEffect(() => {
    if (existingFilePath && !selectedFile && !shouldDelete) {
      const avatarsFolderPrefix = `${folder}/`;
      if (
        existingFilePath.startsWith(avatarsFolderPrefix) ||
        !existingFilePath.startsWith("http")
      ) {
        // It's a file path, generate signed URL
        getSignedUrl(bucket, existingFilePath, 31536000)
          .then((signedUrl) => {
            setDisplayUrl(signedUrl);
          })
          .catch((error) => {
            console.error("Failed to get signed URL:", error);
            setDisplayUrl(existingFilePath);
          });
      } else {
        // It's already a URL
        setDisplayUrl(existingFilePath);
      }
    } else if (!existingFilePath || shouldDelete) {
      setDisplayUrl(null);
    }
  }, [existingFilePath, selectedFile, shouldDelete, bucket, folder]);

  const handleFileSelect = useCallback(
    (files: File[]) => {
      if (!files || files.length === 0) {
        // File removed
        if (existingFilePath && !selectedFile) {
          // Existing file was deleted - mark for deletion
          setShouldDelete(true);
          setDisplayUrl(null);
        } else {
          // New file was removed
          setSelectedFile(null);
          setDisplayUrl(null);
          setShouldDelete(false);
        }
        return;
      }

      const file = files[0];

      // Validate file type (convert to mutable array)
      if (!validateFileType(file, [...acceptedTypes])) {
        toastService.showError(
          "Invalid File Type",
          `Please select a valid file type`
        );
        return;
      }

      // Validate file size
      if (!validateFileSize(file, maxSizeMB)) {
        toastService.showError(
          "File Too Large",
          `File size must be less than ${maxSizeMB}MB`
        );
        return;
      }

      // Store file for upload on save
      setSelectedFile(file);
      setDisplayUrl(null);
      setShouldDelete(false); // Clear delete flag when new file selected
    },
    [existingFilePath, selectedFile, acceptedTypes, maxSizeMB]
  );

  const markForDeletion = useCallback(() => {
    setShouldDelete(true);
    setDisplayUrl(null);
  }, []);

  const clearDeletion = useCallback(() => {
    setShouldDelete(false);
  }, []);

  const uploadFileAfterSave = useCallback(
    async (
      entityId: number,
      updateEntity: (data: any) => Promise<any>,
      formData: any,
      fileFieldName: string = "profilePicture"
    ): Promise<string | null> => {
      if (!selectedFile) {
        return null;
      }

      setIsUploading(true);
      try {
        // Upload file
        const uploadResult = await uploadFile(selectedFile, {
          bucket,
          folder,
          isPublic,
        });

        // Get signed URL for viewing
        const signedUrl = await getSignedUrl(
          bucket,
          uploadResult.path,
          31536000 // 1 year
        );

        // Update entity with file path
        const updateData = {
          id: entityId,
          ...formData,
          [fileFieldName]: uploadResult.path,
        };

        await updateEntity(updateData);

        // Update UI state
        setDisplayUrl(signedUrl);
        onUploadSuccess?.(uploadResult.path, signedUrl);

        return uploadResult.path;
      } catch (error: any) {
        console.error("Upload error:", error);
        toastService.showError(
          "Upload Failed",
          error?.message || "Failed to upload file"
        );
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [selectedFile, bucket, folder, isPublic, onUploadSuccess]
  );

  const getExistingFileObject = useCallback((): File | null => {
    if (existingFilePath && !selectedFile && !shouldDelete) {
      const fileName = existingFilePath.split("/").pop() || existingFilePath;

      // Determine file type from extension
      const extension = fileName.split(".").pop()?.toLowerCase() || "";
      let mimeType = "application/octet-stream";
      if (["jpg", "jpeg"].includes(extension)) mimeType = "image/jpeg";
      else if (extension === "png") mimeType = "image/png";
      else if (extension === "gif") mimeType = "image/gif";
      else if (extension === "webp") mimeType = "image/webp";
      else if (["heic", "heif"].includes(extension)) mimeType = "image/heic";
      else if (extension === "pdf") mimeType = "application/pdf";

      const file = new File([""], fileName, {
        type: mimeType,
      });

      // Add custom properties
      (file as any).isExisting = true;
      (file as any).filePath = existingFilePath;
      (file as any).externalUrl = displayUrl;

      return file;
    }
    return null;
  }, [existingFilePath, selectedFile, shouldDelete, displayUrl]);

  const reset = useCallback(() => {
    setSelectedFile(null);
    setDisplayUrl(null);
    setIsUploading(false);
    setShouldDelete(false);
  }, []);

  return {
    selectedFile,
    displayUrl,
    isUploading,
    shouldDelete,
    handleFileSelect,
    markForDeletion,
    clearDeletion,
    uploadFileAfterSave,
    getExistingFileObject,
    reset,
  };
};
