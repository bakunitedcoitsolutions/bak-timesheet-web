"use client";
import React from "react";
import { Input, ExportOptions, BulkUploadOptions } from "@/components";

interface ViolationsFiltersProps {
  selectedDate: string;
  onDateChange: (value: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onExportCSV: () => void;
  onExportExcel: () => void;
  canAdd: boolean;
  onUploadCSV: () => void;
  onUploadExcel: () => void;
  onDownloadTemplate: () => void;
}

export const ViolationsFilters = ({
  selectedDate,
  onDateChange,
  searchValue,
  onSearchChange,
  onExportCSV,
  onExportExcel,
  canAdd,
  onUploadCSV,
  onUploadExcel,
  onDownloadTemplate,
}: ViolationsFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-3 flex-1 w-full">
      <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
        <div className="w-full md:w-auto">
          <Input
            small
            type="month"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full md:w-44"
            placeholder="Select Date"
          />
        </div>
        <div className="w-full md:w-auto">
          <Input
            small
            value={searchValue}
            className="w-full md:w-64"
            icon="pi pi-search"
            iconPosition="left"
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
          />
        </div>
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="w-full md:w-auto">
          <ExportOptions
            exportCSV={onExportCSV}
            exportExcel={onExportExcel}
            buttonClassName="w-full md:w-auto h-9!"
          />
        </div>
        {canAdd && (
          <div className="w-full lg:w-auto">
            <BulkUploadOptions
              uploadCSV={onUploadCSV}
              uploadExcel={onUploadExcel}
              downloadTemplate={onDownloadTemplate}
              buttonClassName="w-full md:w-auto h-9!"
            />
          </div>
        )}
      </div>
    </div>
  );
};
