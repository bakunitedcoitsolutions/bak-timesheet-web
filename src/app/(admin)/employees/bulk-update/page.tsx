"use client";
import * as XLSX from "xlsx";
import { Dialog } from "primereact/dialog";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect, useRef } from "react";
import { Checkbox } from "primereact/checkbox";

import {
  exportBulkUpdateTemplate,
  EMPLOYEE_COLUMNS_FOR_BULK_UPDATE,
} from "@/utils/helpers/export-employees-report";
import { toastService } from "@/lib/toast";
import { Button, FilePicker, Input, useAccess } from "@/components";
import { useGlobalData } from "@/context/GlobalDataContext";
import { useBulkUpdateEmployees } from "@/lib/db/services/employee";
import { validateBulkEmployeeData, mapBulkEmployeeDataToIds } from "./helpers";
import { BulkUploadReportDialog } from "@/components/common/bulk-upload-report-dialog";
import type { BulkUpdateEmployeeResult } from "@/lib/db/services/employee/employee.dto";

const EmployeeBulkUpdatePage = () => {
  const router = useRouter();
  const { isAdmin, userId, isLoading: isAccessLoading } = useAccess();
  const toastShownRef = useRef(false);

  // Redirect if insufficient permissions
  useEffect(() => {
    if (isAccessLoading || toastShownRef.current) return;

    if (!(isAdmin || userId?.toString() === "24")) {
      toastShownRef.current = true;
      toastService.showError(
        "Access Denied",
        "You do not have permission to bulk update employees."
      );
      router.replace("/employees");
    }
  }, [isAdmin, userId, isAccessLoading]);

  const { data: globalData } = useGlobalData();
  const { mutateAsync: bulkUpdateEmployees } = useBulkUpdateEmployees();

  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [reportResult, setReportResult] = useState<any>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [reportType, setReportType] = useState<"before" | "after">("before");
  const [selectedCols, setSelectedCols] = useState<number[]>(
    EMPLOYEE_COLUMNS_FOR_BULK_UPDATE.map((c) => c.id as number)
  );

  const accept = {
    "text/csv": [".csv"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
      ".xlsx",
    ],
    "application/vnd.ms-excel": [".xls"],
  };

  const handleFileSelect = useCallback((files: File[]) => {
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    } else {
      setSelectedFile(null);
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);

    try {
      let rawData: any[] = [];

      if (selectedFile.name.toLowerCase().endsWith(".csv")) {
        const text = await selectedFile.text();
        const workbook = XLSX.read(text, { type: "string" });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        rawData = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
          raw: false,
          dateNF: "dd-mmm-yyyy",
        }) as any[];
      } else {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        rawData = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
          raw: false,
          dateNF: "dd-mmm-yyyy",
        }) as any[];
      }

      const linkedColumns = EMPLOYEE_COLUMNS_FOR_BULK_UPDATE.filter(
        (col) => col.type === "linked"
      );

      const { beforeReportDetails, successCount, failedCount } =
        validateBulkEmployeeData(
          rawData,
          linkedColumns,
          globalData,
          EMPLOYEE_COLUMNS_FOR_BULK_UPDATE
        );

      if (beforeReportDetails.length > 0) {
        // Validation failed, show Before Upload Report
        setIsUploading(false);
        setReportType("before");
        setReportResult({
          success: 0,
          skipped: successCount,
          failed: failedCount,
          details: beforeReportDetails,
        });
        setShowReportDialog(true);
        return;
      }

      // If no validation errors, map names to IDs
      const mappedData = mapBulkEmployeeDataToIds(
        rawData,
        linkedColumns,
        globalData,
        EMPLOYEE_COLUMNS_FOR_BULK_UPDATE
      );

      // Call the actual bulk update action
      await bulkUpdateEmployees(
        { employees: mappedData },
        {
          onSuccess: (result: BulkUpdateEmployeeResult) => {
            setIsUploading(false);
            setReportType("after");
            setReportResult(result);
            setShowReportDialog(true);

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
          },
          onError: (error: any) => {
            setIsUploading(false);
            toastService.showError("Error", "Failed to bulk update employees.");
          },
        }
      );
    } catch (error) {
      setIsUploading(false);
      toastService.showError("Error", "Failed to process the file.");
    }
  };

  const handleColToggle = (colId: number) => {
    if (colId === 1) return; // Prevent unselecting Employee Code
    setSelectedCols((prev) =>
      prev.includes(colId)
        ? prev.filter((id) => id !== colId)
        : [...prev, colId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCols.length === EMPLOYEE_COLUMNS_FOR_BULK_UPDATE.length) {
      setSelectedCols([1]); // Only keep Employee Code
    } else {
      setSelectedCols(
        EMPLOYEE_COLUMNS_FOR_BULK_UPDATE.map((c) => c.id as number)
      );
    }
  };

  const handleDownloadTemplate = () => {
    exportBulkUpdateTemplate(selectedCols);

    setTimeout(
      () =>
        toastService.showSuccess(
          "Downloaded",
          "Template downloaded successfully."
        ),
      200
    );
    setShowDownloadDialog(false);
  };

  return (
    <div className="flex h-full flex-col gap-6 px-6 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 shrink-0">
        <div className="w-full md:w-auto flex flex-1 flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Bulk Update Employees
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Upload a file containing multiple employee records.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <Button
            size="small"
            variant="solid"
            severity="success"
            icon="pi pi-download"
            label="Download Template"
            onClick={() => setShowDownloadDialog(true)}
          />
        </div>
      </div>
      <div className="bg-white flex-1 rounded-xl overflow-hidden min-h-0 px-6 py-6">
        <div className="w-full flex flex-col mx-auto justify-center h-full flex-1 max-w-4xl">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Upload Data File
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Select a CSV or Excel file to bulk update employee information.
            </p>
          </div>
          <FilePicker
            className="h-48!"
            accept={accept}
            multiple={false}
            disabled={isUploading}
            onFileSelect={handleFileSelect}
            value={selectedFile ? [selectedFile] : []}
          />

          <div className="flex items-center justify-end gap-3 pt-2 mt-5">
            <Button
              size="small"
              variant="solid"
              loading={isUploading}
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-28 justify-center! gap-1"
            >
              Upload
            </Button>
          </div>
        </div>
      </div>
      <Dialog
        style={{
          width: "90vw",
          height: "80vh",
          maxWidth: "700px",
          background: "white",
        }}
        draggable={true}
        resizable={false}
        header="Download Template"
        visible={showDownloadDialog}
        onHide={() => setShowDownloadDialog(false)}
        footer={
          <div className="flex justify-end gap-3">
            <Button
              size="small"
              variant="text"
              onClick={() => setShowDownloadDialog(false)}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="solid"
              label="Download"
              icon="pi pi-download"
              onClick={handleDownloadTemplate}
              disabled={selectedCols.length === 0}
            />
          </div>
        }
      >
        <div className="flex flex-col h-full">
          <div className="flex flex-col gap-4 mb-4 shrink-0">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Select the columns you want to include in the template.
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <Checkbox
                  inputId="selectAll"
                  checked={
                    selectedCols.length ===
                    EMPLOYEE_COLUMNS_FOR_BULK_UPDATE.length
                  }
                  onChange={handleSelectAll}
                />
                <label
                  htmlFor="selectAll"
                  className="text-sm font-semibold cursor-pointer select-none"
                >
                  Select All
                </label>
              </div>
            </div>
            <Input
              small
              icon="pi pi-search"
              iconPosition="left"
              placeholder="Search columns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2 p-1 flex-1 overflow-y-auto content-start">
            {EMPLOYEE_COLUMNS_FOR_BULK_UPDATE.filter((col) =>
              col.label.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((col) => (
              <div key={col.id} className="flex items-center gap-2">
                <Checkbox
                  inputId={col.id.toString()}
                  checked={selectedCols.includes(col.id as number)}
                  onChange={() => handleColToggle(col.id as number)}
                  disabled={col.id === 1}
                />
                <label
                  htmlFor={col.id.toString()}
                  className={`text-sm cursor-pointer select-none ${col.id === 1 ? "text-gray-500" : ""}`}
                >
                  {col.label}{" "}
                  {col.id === 1 && <span className="text-red-500">*</span>}
                </label>
              </div>
            ))}
          </div>
        </div>
      </Dialog>
      <BulkUploadReportDialog
        result={reportResult}
        visible={showReportDialog}
        fileName={selectedFile?.name}
        reportTitlePrefix="Employee Bulk Update Report"
        onHide={() => {
          setShowReportDialog(false);
          if (reportType === "after") {
            setSelectedFile(null);
          }
        }}
      />
    </div>
  );
};

export default EmployeeBulkUpdatePage;
