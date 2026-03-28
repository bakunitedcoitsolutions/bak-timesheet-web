"use client";
import React from "react";
import { BulkUploadDialog, BulkUploadReportDialog } from "@/components";
import { BulkUploadTimesheetResult } from "@/lib/db/services/timesheet/timesheet.dto";

interface TimesheetDialogsProps {
  showFilePicker: boolean;
  onHideFilePicker: () => void;
  onUpload: (file: File) => Promise<void>;
  showReportDialog: boolean;
  onHideReportDialog: () => void;
  uploadResult: BulkUploadTimesheetResult | null;
  uploadedFileName: string;
}

export const TimesheetDialogs = ({
  showFilePicker,
  onHideFilePicker,
  onUpload,
  showReportDialog,
  onHideReportDialog,
  uploadResult,
  uploadedFileName,
}: TimesheetDialogsProps) => {
  return (
    <>
      <BulkUploadDialog
        visible={showFilePicker}
        title="Upload Timesheets"
        onHide={onHideFilePicker}
        onUpload={onUpload}
        accept={{
          "text/csv": [".csv"],
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
            ".xlsx",
          ],
          "application/vnd.ms-excel": [".xls"],
        }}
      />

      <BulkUploadReportDialog
        visible={showReportDialog}
        onHide={onHideReportDialog}
        result={uploadResult}
        fileName={uploadedFileName}
      />
    </>
  );
};
