"use client";
import * as XLSX from "xlsx";
import { Dialog } from "primereact/dialog";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { Checkbox } from "primereact/checkbox";

import { toastService } from "@/lib/toast";
import { Button, FilePicker, Input } from "@/components";

import { EMPLOYEE_COLUMNS } from "@/utils/helpers/export-employees-report";

const EmployeeBulkUpdatePage = () => {
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCols, setSelectedCols] = useState<number[]>(
    EMPLOYEE_COLUMNS.map((c) => c.id as number)
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
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      toastService.showSuccess("Success", "File uploaded successfully!");
      router.push("/employees");
    }, 1500);
  };

  const handleClose = () => {
    router.push("/employees");
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
    if (selectedCols.length === EMPLOYEE_COLUMNS.length) {
      setSelectedCols([1]); // Only keep Employee Code
    } else {
      setSelectedCols(EMPLOYEE_COLUMNS.map((c) => c.id as number));
    }
  };

  const handleDownloadTemplate = () => {
    // Filter the actual objects based on selected IDs (preserving order of EMPLOYEE_COLUMNS)
    const activeCols = EMPLOYEE_COLUMNS.filter((c) =>
      selectedCols.includes(c.id as number)
    );

    // Create a single empty/sample row to generate the headers
    const sampleRow: Record<string, string | number> = {};
    activeCols.forEach((col) => {
      // Add some dummy text for Employee Code, empty otherwise
      sampleRow[col.label] = col.id === 1 ? 1001 : "";
    });

    const worksheet = XLSX.utils.json_to_sheet([sampleRow]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    XLSX.writeFile(
      workbook,
      `employee_bulk_upload_template_${new Date().toISOString().split("T")[0]}.xlsx`
    );

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
      </div>
      <Dialog
        draggable={true}
        resizable={false}
        header="Download Template"
        visible={showDownloadDialog}
        style={{
          width: "90vw",
          height: "80vh",
          maxWidth: "700px",
          background: "white",
        }}
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
                  checked={selectedCols.length === EMPLOYEE_COLUMNS.length}
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
            {EMPLOYEE_COLUMNS.filter((col) =>
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
    </div>
  );
};

export default EmployeeBulkUpdatePage;
