"use client";
import React from "react";
import {
  Input,
  Button,
  GroupDropdown,
  BulkUploadOptions,
  CustomHeaderProps,
} from "@/components";

interface TimesheetActionsProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedFilter: string | number | null;
  onFilterChange: (filter: string | number | null) => void;
  onRefresh: () => void;
  onUploadCSV: () => void;
  onUploadExcel: () => void;
  onUpdate: () => void;
  isLoading: boolean;
  isLoadingTimesheet: boolean;
  canAdd: boolean;
  canEdit: boolean;
  downloadSampleTemplate: () => void;
}

export const TimesheetActions = ({
  selectedDate,
  onDateChange,
  selectedFilter,
  onFilterChange,
  onRefresh,
  onUploadCSV,
  onUploadExcel,
  onUpdate,
  isLoading,
  isLoadingTimesheet,
  canAdd,
  canEdit,
  downloadSampleTemplate,
}: TimesheetActionsProps) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between bg-theme-primary-light items-center gap-3 flex-1 w-full">
      <div className="flex flex-1 items-center gap-3 w-full">
        <div className="w-full lg:w-auto">
          <Input
            type="date"
            placeholder="Select Date"
            className="w-full lg:w-40 h-10.5!"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
        <div className="w-full lg:w-auto">
          <GroupDropdown
            value={selectedFilter}
            onChange={onFilterChange}
            className="w-full lg:w-48"
          />
        </div>
        <div className="w-full lg:w-auto hidden xl:block">
          <Button
            size="small"
            label="Refresh"
            className="w-full xl:w-28 2xl:w-32 h-10!"
            onClick={onRefresh}
          />
        </div>
      </div>
      <div className="flex items-center gap-3 w-full lg:w-auto">
        {canAdd && (
          <div className="w-full lg:w-auto">
            <BulkUploadOptions
              uploadCSV={onUploadCSV}
              uploadExcel={onUploadExcel}
              downloadTemplate={downloadSampleTemplate}
              buttonClassName="w-full lg:w-auto h-9!"
            />
          </div>
        )}
        {(canAdd || canEdit) && (
          <div className=" w-full lg:w-auto">
            <Button
              size="small"
              label="Update"
              loading={isLoading}
              disabled={isLoadingTimesheet}
              onClick={onUpdate}
              className="w-full xl:w-28 2xl:w-32 h-10!"
            />
          </div>
        )}
      </div>
    </div>
  );
};
