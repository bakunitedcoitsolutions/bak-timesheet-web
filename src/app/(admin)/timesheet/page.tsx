"use client";
import { useState } from "react";
import {
  Button,
  Dropdown,
  TitleHeader,
  ExportOptions,
  BulkUploadOptions,
  CustomHeaderProps,
  Input,
} from "@/components";
import { designationOptions } from "@/utils/dummy";

const TimesheetPage = () => {
  const [selectedDesignation, setSelectedDesignation] = useState<any>("0");

  const renderHeader = ({
    value,
    onChange,
    exportCSV,
    exportExcel,
  }: CustomHeaderProps) => {
    return (
      <div className="flex flex-col lg:flex-row justify-between items-center gap-3 flex-1 w-full">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="w-full lg:w-auto">
            <Input
              type="date"
              placeholder="Select Date"
              className="w-full lg:w-40 h-10.5!"
            />
          </div>
          <div className="w-full lg:w-auto">
            <Dropdown
              small
              filter
              options={designationOptions}
              className="w-full lg:w-48 h-10.5!"
              placeholder="Select Designation"
              selectedItem={selectedDesignation}
              setSelectedItem={setSelectedDesignation}
            />
          </div>
          <div className="w-full lg:w-auto hidden lg:block">
            <Button
              size="small"
              className="w-full xl:w-28 2xl:w-32 h-10!"
              label="Search"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="block lg:hidden w-full lg:w-auto">
            <Button
              size="small"
              className="w-full lg:w-auto h-10!"
              label="Search"
            />
          </div>
          <div className="w-full lg:w-auto">
            <ExportOptions
              exportCSV={exportCSV}
              exportExcel={exportExcel}
              buttonClassName="w-full lg:w-auto h-9!"
            />
          </div>
          <div className="w-full lg:w-auto">
            <BulkUploadOptions
              uploadCSV={() => {}}
              uploadExcel={() => {}}
              buttonClassName="w-full lg:w-auto h-9!"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      <TitleHeader
        title="ATTENDANCE SHEET"
        icon={<i className="fa-light fa-calendar text-xl!" />}
      />
      <div className="flex flex-col gap-6 px-6 py-6 bg-theme-primary-light">
        {renderHeader({
          value: "",
          onChange: () => {},
          exportCSV: () => {},
          exportExcel: () => {},
          exportPdf: () => {},
        })}
      </div>
    </div>
  );
};

export default TimesheetPage;
