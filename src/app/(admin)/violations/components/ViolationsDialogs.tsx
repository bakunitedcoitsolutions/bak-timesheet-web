"use client";
import React from "react";
import { BulkUploadDialog } from "@/components";

interface ViolationsDialogsProps {
  showFilePicker: boolean;
  onHide: () => void;
  onUpload: (file: File) => Promise<void>;
}

export const ViolationsDialogs = ({
  showFilePicker,
  onHide,
  onUpload,
}: ViolationsDialogsProps) => {
  return (
    <BulkUploadDialog
      visible={showFilePicker}
      title="Upload Violations"
      onHide={onHide}
      onUpload={onUpload}
      accept={{
        "text/csv": [".csv"],
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
          ".xlsx",
        ],
        "application/vnd.ms-excel": [".xls"],
      }}
    />
  );
};
