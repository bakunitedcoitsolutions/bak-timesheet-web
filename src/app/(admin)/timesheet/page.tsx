"use client";
import { useRef, useState } from "react";
import {
  Button,
  Dropdown,
  TitleHeader,
  ExportOptions,
  BulkUploadOptions,
  CustomHeaderProps,
  Input,
  NumberInput,
  Table,
  TableColumn,
  TableRef,
} from "@/components";
import {
  designationOptions,
  projects,
  initialTimesheetData,
  TimesheetEntry,
} from "@/utils/dummy";
import { Checkbox } from "primereact/checkbox";

const TimesheetPage = () => {
  const [selectedDesignation, setSelectedDesignation] = useState<any>("0");
  const [timesheetData, setTimesheetData] =
    useState<TimesheetEntry[]>(initialTimesheetData);
  const [searchValue, setSearchValue] = useState<string>("");
  const tableRef = useRef<TableRef>(null);

  // Project options (excluding "All Projects")
  const projectOptions = projects.filter((p) => p.value !== "0");

  const updateTimesheetEntry = (
    id: number,
    field: keyof TimesheetEntry,
    value: any
  ) => {
    setTimesheetData((prev) =>
      prev.map((entry) => {
        if (entry.id === id) {
          const updated = { ...entry, [field]: value };
          // Auto-calculate total hours
          if (
            field === "project1Hours" ||
            field === "project1OT" ||
            field === "project2Hours" ||
            field === "project2OT"
          ) {
            updated.totalHours =
              updated.project1Hours +
              updated.project1OT +
              updated.project2Hours +
              updated.project2OT;
          }
          return updated;
        }
        return entry;
      })
    );
  };

  const columns = (): TableColumn<TimesheetEntry>[] => [
    {
      field: "rowNumber",
      header: "#",
      sortable: false,
      filterable: false,
      style: { width: "30px" },
      align: "center",
      body: (rowData: TimesheetEntry) => (
        <div className="flex items-center justify-center w-[30px] gap-1.5">
          <span className="text-sm font-medium">{rowData.rowNumber}</span>
          {rowData.isLocked && (
            <i className="pi pi-lock text-sm! text-primary"></i>
          )}
        </div>
      ),
    },
    {
      field: "code",
      header: "Code",
      sortable: false,
      filterable: false,
      style: { width: "50px" },
      body: (rowData: TimesheetEntry) => (
        <div className="w-[50px]">
          <span className="text-sm font-medium">{rowData.code}</span>
        </div>
      ),
    },
    {
      field: "employeeName",
      header: "Employee",
      sortable: false,
      filterable: false,
      style: { minWidth: "280px" },
      body: (rowData: TimesheetEntry) => (
        <div className="flex items-start gap-2">
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-medium leading-tight">
              {rowData.employeeName}
            </span>
            <span className="text-xs text-theme-text-gray capitalize">
              {rowData.designation}
            </span>
          </div>
          {rowData.hasFlag && (
            <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center shrink-0">
              <span className="text-white text-base font-bold">F</span>
            </div>
          )}
        </div>
      ),
    },
    {
      field: "designation",
      header: "Designation",
      sortable: false,
      filterable: false,
      style: { display: "none" },
      body: () => null,
    },
    {
      field: "project1",
      header: (
        <div className="flex flex-col gap-1 w-64!">
          <span className="font-semibold pl-2!">Project 1</span>
          <div className="flex gap-2 text-xs font-medium text-theme-text-gray mt-1">
            <span className="flex-1 pl-2!">Hours</span>
            <span className="flex-1 pl-2!">O/T</span>
          </div>
        </div>
      ) as any,
      sortable: false,
      filterable: false,
      style: { minWidth: "220px" },
      body: (rowData: TimesheetEntry) => (
        <div className="flex flex-col gap-3.5 py-1">
          <div className="h-9 w-64! flex items-center gap-3.5">
            <div className="w-full h-full!">
              <Dropdown
                small
                filter
                options={projectOptions}
                disabled={rowData.isLocked}
                className="w-full h-10!"
                placeholder="Select Project"
                selectedItem={rowData.project1}
                setSelectedItem={(value) =>
                  updateTimesheetEntry(rowData.id, "project1", value)
                }
              />
            </div>
            {rowData.allowBreakProject1 && (
              <div className="flex flex-col align-items-center">
                <Checkbox
                  disabled={rowData.isLocked}
                  inputId="allowBreakProject1"
                  name="pizza"
                  value="allowBreakProject1Value"
                  onChange={() =>
                    updateTimesheetEntry(
                      rowData.id,
                      "allowBreakProject1Value",
                      !rowData.allowBreakProject1Value || false
                    )
                  }
                  checked={rowData.allowBreakProject1Value || false}
                />
              </div>
            )}
          </div>
          <div className="flex flex-1 gap-1.5 w-64!">
            <div className="flex flex-1 w-6!">
              <NumberInput
                useGrouping={false}
                disabled={rowData.isLocked}
                value={rowData.project1Hours}
                onValueChange={(e) =>
                  updateTimesheetEntry(
                    rowData.id,
                    "project1Hours",
                    e.value || 0
                  )
                }
                className="timesheet-number-input"
                min={0}
                showButtons={false}
              />
            </div>
            <div className="flex flex-1 w-6!">
              <NumberInput
                useGrouping={false}
                disabled={rowData.isLocked}
                value={rowData.project1OT}
                onValueChange={(e) =>
                  updateTimesheetEntry(rowData.id, "project1OT", e.value || 0)
                }
                className="timesheet-number-input"
                min={0}
                showButtons={false}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      field: "project2",
      header: (
        <div className="flex flex-col gap-1 w-64!">
          <span className="font-semibold pl-2!">Project 2</span>
          <div className="flex gap-2 text-xs font-normal text-gray-600 mt-1">
            <span className="flex-1 pl-2!">Hours</span>
            <span className="flex-1 pl-2!">O/T</span>
          </div>
        </div>
      ) as any,
      sortable: false,
      filterable: false,
      style: { minWidth: "220px" },
      body: (rowData: TimesheetEntry) => (
        <div className="flex flex-col gap-3.5 py-1">
          <div className="h-9 w-64! flex items-center gap-3.5">
            <div className="w-full h-full!">
              <Dropdown
                small
                filter
                options={projectOptions}
                disabled={rowData.isLocked}
                className="w-full h-10!"
                placeholder="Select Project"
                selectedItem={rowData.project2}
                setSelectedItem={(value) =>
                  updateTimesheetEntry(rowData.id, "project2", value)
                }
              />
            </div>
            {rowData.allowBreakProject2 && (
              <div className="flex flex-col align-items-center">
                <Checkbox
                  disabled={rowData.isLocked}
                  inputId="allowBreakProject2"
                  name="pizza"
                  value="allowBreakProject2Value"
                  onChange={() =>
                    updateTimesheetEntry(
                      rowData.id,
                      "allowBreakProject2Value",
                      !rowData.allowBreakProject2Value || false
                    )
                  }
                  checked={rowData.allowBreakProject2Value || false}
                />
              </div>
            )}
          </div>
          <div className="flex flex-1 gap-1.5 w-64!">
            <div className="flex flex-1 w-full">
              <NumberInput
                useGrouping={false}
                disabled={rowData.isLocked}
                value={rowData.project2Hours}
                onValueChange={(e) =>
                  updateTimesheetEntry(
                    rowData.id,
                    "project2Hours",
                    e.value || 0
                  )
                }
                className="timesheet-number-input"
                min={0}
                showButtons={false}
              />
            </div>
            <div className="flex flex-1 w-full">
              <NumberInput
                useGrouping={false}
                disabled={rowData.isLocked}
                value={rowData.project2OT}
                onValueChange={(e) =>
                  updateTimesheetEntry(rowData.id, "project2OT", e.value || 0)
                }
                className="timesheet-number-input"
                min={0}
                showButtons={false}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      field: "totalHours",
      header: "Total Hours",
      sortable: false,
      filterable: false,
      style: { width: "150px" },
      body: (rowData: TimesheetEntry) => (
        <div className="py-1 w-[150px]">
          <div className="w-full">
            <NumberInput
              useGrouping={false}
              disabled={rowData.isLocked}
              value={rowData.totalHours}
              onValueChange={(e) =>
                updateTimesheetEntry(rowData.id, "totalHours", e.value || 0)
              }
              className="timesheet-number-input"
              min={0}
              showButtons={false}
            />
          </div>
        </div>
      ),
    },
    {
      field: "remarks",
      header: "Remarks",
      sortable: false,
      filterable: false,
      style: { minWidth: "300px" },
      body: (rowData: TimesheetEntry) => (
        <Input
          disabled={rowData.isLocked}
          placeholder="Add remarks..."
          value={rowData.remarks}
          onChange={(e) =>
            updateTimesheetEntry(rowData.id, "remarks", e.target.value)
          }
          className="w-full h-10!"
        />
      ),
    },
  ];

  const renderHeader = ({ exportCSV, exportExcel }: CustomHeaderProps) => {
    return (
      <div className="flex flex-col lg:flex-row justify-between bg-theme-primary-light items-center gap-3 flex-1 w-full">
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
              exportCSV={exportCSV || (() => {})}
              exportExcel={exportExcel || (() => {})}
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

  const exportCSV = () => {
    tableRef.current?.exportCSV();
  };

  const exportExcel = () => {
    tableRef.current?.exportExcel();
  };

  return (
    <div className="flex flex-col">
      <TitleHeader
        title="ATTENDANCE SHEET"
        icon={<i className="fa-light fa-calendar text-xl!" />}
        value={searchValue}
        onChange={(e) => {
          const value = e.target.value;
          setSearchValue(value);
        }}
      />
      <div className="flex flex-col gap-4 px-6 py-6 bg-theme-primary-light">
        {renderHeader({
          exportCSV,
          exportExcel,
        })}
        <div className="bg-white rounded-xl overflow-hidden">
          <Table
            ref={tableRef}
            dataKey="id"
            data={timesheetData}
            columns={columns()}
            pagination={false}
            globalSearch={false}
            rowClassName={(rowData: TimesheetEntry) =>
              rowData.isLocked ? "locked-row" : ""
            }
            // tableClassName="timesheet-table"
            // showGridlines
          />
        </div>
      </div>
    </div>
  );
};

export default TimesheetPage;
