"use client";

import {
  Button,
  BulkUploadDialog,
  BulkUploadOptions,
  BulkUploadReportDialog,
} from "@/components";
import {
  parseCSVFile,
  parseExcelFile,
  downloadSampleTemplate,
} from "@/lib/db/services/payroll-summary/payroll-allowance-bulk-upload-utils";
import { toastService } from "@/lib/toast";
import { useState, useCallback } from "react";
import { getErrorMessage } from "@/utils/helpers";
import GroupDropdown from "@/components/common/group-dropdown";
import { useBulkUploadPayrollAllowances } from "@/lib/db/services/payroll-summary/requests";
import { BulkUploadPayrollAllowanceResult } from "@/lib/db/services/payroll-summary/payroll-allowance-bulk-upload.dto";

interface PayrollHeaderProps {
  isLoading: boolean;
  isPosted?: boolean;
  isSavingAll: boolean;
  handleSave: () => void;
  isRefreshingAll: boolean;
  handleRefreshAll: () => void;
  selectedFilter: string | number | null;
  setSelectedFilter: (value: string | number | null) => void;
  payrollId: number;
  onBulkUploadComplete?: () => void;
}

export const PayrollHeader = ({
  isLoading,
  payrollId,
  handleSave,
  isSavingAll,
  selectedFilter,
  isRefreshingAll,
  isPosted = false,
  handleRefreshAll,
  setSelectedFilter,
  onBulkUploadComplete,
}: PayrollHeaderProps) => {
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [uploadResult, setUploadResult] =
    useState<BulkUploadPayrollAllowanceResult | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const { mutateAsync: bulkUploadAllowances } =
    useBulkUploadPayrollAllowances();

  const handleUpload = useCallback(
    async (file: File) => {
      try {
        const fileName = file.name.toLowerCase();
        setUploadedFileName(file.name);
        const isCSV = fileName.endsWith(".csv") || file.type === "text/csv";

        let parseResult;
        if (isCSV) {
          parseResult = await parseCSVFile(file);
        } else {
          parseResult = await parseExcelFile(file);
        }

        if (parseResult.errors.length > 0) {
          toastService.showWarn(
            "Parse Warnings",
            `${parseResult.errors.length} row(s) had errors. Check console for details.`
          );
        }

        if (parseResult.data.length === 0) {
          toastService.showError("Error", "No valid data found in file");
          throw new Error("No valid data found in file");
        }

        await bulkUploadAllowances(
          { payrollId, rows: parseResult.data },
          {
            onSuccess: (result: BulkUploadPayrollAllowanceResult) => {
              setUploadResult(result);
              setShowReportDialog(true);
              setShowFilePicker(false);

              if (
                result.success === 0 &&
                result.failed > 0 &&
                result.skipped === 0
              ) {
                toastService.showError(
                  "Upload Failed",
                  "All rows failed. See report for details."
                );
              } else {
                toastService.showSuccess(
                  "Upload Processed",
                  "Check report for details."
                );
              }

              onBulkUploadComplete?.();
            },
            onError: (error: any) => {
              const errorMessage = getErrorMessage(
                error,
                "Failed to upload allowances"
              );
              toastService.showError("Error", errorMessage);
              throw error;
            },
          }
        );
      } catch (error: any) {
        const errorMessage = getErrorMessage(error, "Failed to parse file");
        toastService.showError("Error", errorMessage);
        throw error;
      }
    },
    [bulkUploadAllowances, payrollId, onBulkUploadComplete]
  );

  return (
    <>
      <div className="flex flex-col lg:flex-row justify-between bg-theme-primary-light items-center gap-3 flex-1 w-full">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="w-full lg:w-auto">
            <GroupDropdown
              hideAllOption
              value={selectedFilter}
              onChange={setSelectedFilter}
              className="w-full lg:w-64 h-10.5!"
            />
          </div>
          {!isPosted && (
            <div className="w-full lg:w-auto hidden lg:block">
              <Button
                size="small"
                label="Refresh"
                className="w-full xl:w-32 2xl:w-36 h-10!"
                {...(isRefreshingAll
                  ? { loading: true }
                  : { icon: "pi pi-refresh" })}
                onClick={handleRefreshAll}
                disabled={isLoading || isSavingAll || isRefreshingAll}
              />
            </div>
          )}
        </div>
        {!isPosted && (
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <div className="flex-1 lg:hidden">
              <Button
                size="small"
                label="Refresh"
                className="w-full lg:hidden h-10!"
                {...(isRefreshingAll
                  ? { loading: true }
                  : { icon: "pi pi-refresh" })}
                onClick={handleRefreshAll}
                disabled={isLoading || isSavingAll || isRefreshingAll}
              />
            </div>
            <Button
              size="small"
              label="Save"
              onClick={handleSave}
              loading={isSavingAll}
              disabled={isLoading || isSavingAll || isRefreshingAll}
              className="flex-1 lg:flex-none lg:w-28 h-10! bg-primary-light! text-primary! border-primary-light!"
            />
            <div className="flex-1 lg:flex-none">
              <BulkUploadOptions
                uploadCSV={() => setShowFilePicker(true)}
                uploadExcel={() => setShowFilePicker(true)}
                downloadTemplate={downloadSampleTemplate}
                buttonClassName="w-full lg:w-auto h-10!"
              />
            </div>
          </div>
        )}
      </div>

      <BulkUploadDialog
        title="Upload Truck House Allowances"
        onUpload={handleUpload}
        visible={showFilePicker}
        onHide={() => setShowFilePicker(false)}
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
        onHide={() => {
          setShowReportDialog(false);
          setUploadResult(null);
          setUploadedFileName("");
        }}
        result={uploadResult}
        fileName={uploadedFileName}
      />
    </>
  );
};
