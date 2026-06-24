"use client";
import { BulkUploadDialog, BulkUploadReportDialog } from "@/components";
import { BulkUploadTrafficChallanResult } from "@/lib/db/services/traffic-challan/traffic-challan.dto";

interface ViolationsDialogsProps {
  showFilePicker: boolean;
  onHideFilePicker: () => void;
  onUpload: (file: File) => Promise<void>;
  showReportDialog: boolean;
  onHideReportDialog: () => void;
  uploadResult: BulkUploadTrafficChallanResult | null;
  uploadedFileName: string;
}

export const ViolationsDialogs = ({
  showFilePicker,
  onHideFilePicker,
  onUpload,
  showReportDialog,
  onHideReportDialog,
  uploadResult,
  uploadedFileName,
}: ViolationsDialogsProps) => {
  return (
    <>
      <BulkUploadDialog
        visible={showFilePicker}
        title="Upload Violations"
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
