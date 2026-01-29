"use client";

import { useState, useCallback } from "react";
import { Dialog } from "primereact/dialog";
import { FilePicker, Button } from "@/components";

export interface BulkUploadDialogProps {
  visible: boolean;
  onHide: () => void;
  onUpload: (file: File) => Promise<void>;
  accept: Record<string, string[]>;
  title?: string;
}

const BulkUploadDialog = ({
  visible,
  onHide,
  onUpload,
  accept,
  title,
}: BulkUploadDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback((files: File[]) => {
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    } else {
      setSelectedFile(null);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      return;
    }

    try {
      setIsUploading(true);
      await onUpload(selectedFile);
      // Reset state and close dialog after successful upload
      setSelectedFile(null);
      setIsUploading(false);
      onHide();
    } catch (error) {
      setIsUploading(false);
      // Error handling is done in the parent component
    }
  }, [selectedFile, onUpload, onHide]);

  const handleClose = useCallback(() => {
    if (!isUploading) {
      setSelectedFile(null);
      onHide();
    }
  }, [isUploading, onHide]);

  return (
    <Dialog
      header={title}
      visible={visible}
      style={{ width: "50vw", maxWidth: "600px" }}
      onHide={handleClose}
      draggable={false}
      resizable={false}
      closable={!isUploading}
      closeOnEscape={!isUploading}
    >
      <div className="p-4 space-y-4">
        <FilePicker
          className="h-[90px]"
          accept={accept}
          multiple={false}
          disabled={isUploading}
          onFileSelect={handleFileSelect}
          value={selectedFile ? [selectedFile] : []}
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            size="small"
            variant="text"
            disabled={isUploading}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="solid"
            disabled={!selectedFile || isUploading}
            loading={isUploading}
            onClick={handleUpload}
            className="w-28 justify-center! gap-1"
          >
            Upload
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default BulkUploadDialog;
