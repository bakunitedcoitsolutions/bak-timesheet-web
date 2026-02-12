"use client";
import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { classNames } from "primereact/utils";
import { ProgressSpinner } from "primereact/progressspinner";

import {
  Input,
  Badge,
  Table,
  Button,
  TableRef,
  Dropdown,
  NumberInput,
  TitleHeader,
  TableColumn,
  ExportOptions,
  GroupDropdown,
  BulkUploadOptions,
  BulkUploadDialog,
  CustomHeaderProps,
} from "@/components";
import { useDebounce } from "@/hooks";
import { toastService } from "@/lib/toast";
import { useGlobalData, GlobalDataGeneral } from "@/context/GlobalDataContext";
import { parseGroupDropdownFilter, getErrorMessage } from "@/utils/helpers";
import {
  useGetTimesheetPageData,
  useSaveTimesheetEntries,
  useBulkUploadTimesheets,
} from "@/lib/db/services/timesheet/requests";
import type {
  TimesheetPageRow,
  SaveTimesheetEntryItem,
} from "@/lib/db/services/timesheet/timesheet.dto";
import type { BulkUploadTimesheetResult } from "@/lib/db/services/timesheet/timesheet.dto";
import {
  parseCSVFile,
  parseExcelFile,
  downloadSampleTemplate,
} from "@/lib/db/services/timesheet/bulk-upload-utils";
import type { ListedPayrollSection } from "@/lib/db/services/payroll-section/payroll-section.dto";
import { validateProjectId } from "@/utils/helpers/main-utils";

/** Stable empty array so useMemo/useEffect deps don't change every render when no data */
const EMPTY_ROWS: TimesheetPageRow[] = [];

/** Today's date in YYYY-MM-DD */
const getTodayDateString = () => new Date().toISOString().slice(0, 10);

const TimesheetPage = () => {
  const [selectedDate, setSelectedDate] =
    useState<string>(getTodayDateString());
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(50);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string | number | null>(
    "all"
  );
  const [timesheetData, setTimesheetData] = useState<TimesheetPageRow[]>([]);
  const tableRef = useRef<TableRef>(null);

  useEffect(() => {
    setPage(1);
  }, [selectedFilter, selectedDate]);

  const filterParams = parseGroupDropdownFilter(selectedFilter);

  // Debounce search input
  const debouncedSearch = useDebounce(searchValue, 500);

  // Reset to first page when search value changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const timesheetQueryInput = useMemo(
    () => ({
      date: new Date(selectedDate),
      designationId: filterParams.designationId,
      payrollSectionId: filterParams.payrollSectionId,
      page,
      limit,
      search: debouncedSearch,
    }),
    [
      selectedDate,
      filterParams.designationId,
      filterParams.payrollSectionId,
      page,
      limit,
      debouncedSearch,
    ]
  );

  // Timesheet page data: employees in selected payroll section merged with timesheet records for selected date
  const {
    refetch: refetchTimesheet,
    isLoading: isLoadingTimesheet,
    data: timesheetPageResponse,
  } = useGetTimesheetPageData(timesheetQueryInput);

  const { mutateAsync: saveTimesheetEntries } = useSaveTimesheetEntries();
  const { mutateAsync: bulkUploadTimesheets } = useBulkUploadTimesheets();

  // Projects for Project 1 / Project 2 dropdowns
  const { data: globalData } = useGlobalData();
  const projectsList = globalData.projects || [];
  const projectOptions = useMemo(
    () => [
      {
        label: "Select Project",
        value: null,
      },
      ...projectsList.map((p: GlobalDataGeneral) => ({
        label: p.nameEn,
        value: String(p.id),
      })),
    ],
    [projectsList]
  );

  // Use backend response directly (rows already in table shape)
  const rows = timesheetPageResponse?.rows ?? EMPTY_ROWS;
  const {
    total,
    page: currentPage,
    limit: currentLimit,
  } = timesheetPageResponse?.pagination ?? {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  };

  const mergedTableData = useMemo(() => rows, [rows]);

  // Keep table data in sync with merged data; allow local edits via updateTimesheetEntry
  useEffect(() => {
    setTimesheetData(mergedTableData);
  }, [mergedTableData]);

  const updateTimesheetEntry = (
    id: number,
    field: keyof TimesheetPageRow,
    value: any
  ) => {
    setTimesheetData((prev) =>
      prev.map((entry) => {
        if (entry.id === id) {
          const updated = { ...entry, [field]: value };
          // Auto-calculate total hours when any hour field changes
          if (
            field === "project1Hours" ||
            field === "project1Overtime" ||
            field === "project2Hours" ||
            field === "project2Overtime"
          ) {
            const p1H = updated.project1Hours ?? 0;
            const p1OT = updated.project1Overtime ?? 0;
            const p2H = updated.project2Hours ?? 0;
            const p2OT = updated.project2Overtime ?? 0;
            updated.totalHours = p1H + p1OT + p2H + p2OT;
          }
          return updated;
        }
        return entry;
      })
    );
  };

  const saveSingleRow = async (rowData: TimesheetPageRow) => {
    try {
      const entry: SaveTimesheetEntryItem = {
        employeeId: rowData.employeeId,
        timesheetId: rowData.timesheetId,
        project1Id: validateProjectId(rowData.project1Id),
        project1Hours: rowData.project1Hours,
        project1Overtime: rowData.project1Overtime,
        project2Id: validateProjectId(rowData.project2Id),
        project2Hours: rowData.project2Hours,
        project2Overtime: rowData.project2Overtime,
        totalHours: rowData.totalHours,
        description: rowData.description,
      };

      await saveTimesheetEntries({
        date: new Date(selectedDate),
        entries: [entry],
      });

      toastService.showSuccess(
        "Saved",
        `Row saved successfully for ${rowData.nameEn} (${rowData.employeeCode})`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save row";
      toastService.showError(
        "Error",
        `Failed to save row for ${rowData.nameEn} (${rowData.employeeCode}): ${message}`
      );
    }
  };

  const columns = (): TableColumn<TimesheetPageRow>[] => [
    {
      field: "rowNumber",
      header: "#",
      sortable: false,
      filterable: false,
      align: "center",
      body: (rowData: TimesheetPageRow) => (
        <div
          className={classNames("flex items-center justify-center gap-1.5", {
            "w-[40px]": rowData.isLocked,
            "w-[35px]": !rowData.isLocked,
          })}
        >
          <span className="text-sm font-medium">{rowData.rowNumber}</span>
          {rowData.isLocked && (
            <i className="pi pi-lock text-sm! text-primary"></i>
          )}
        </div>
      ),
    },
    {
      field: "employeeCode",
      header: "Code",
      sortable: false,
      filterable: false,
      align: "left",
      style: { width: "50px" },
      body: (rowData: TimesheetPageRow) => (
        <div className="w-[50px]">
          <span className="text-sm font-medium">{rowData.employeeCode}</span>
        </div>
      ),
    },
    {
      field: "nameEn",
      header: "Emp. Name",
      sortable: false,
      filterable: false,
      style: { minWidth: "280px" },
      body: (rowData: TimesheetPageRow) => (
        <div className="flex items-start gap-2">
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-medium leading-tight">
              {rowData.nameEn}
            </span>
            <span className="text-xs text-theme-text-gray capitalize">
              {rowData.designationNameEn}
            </span>
          </div>
          {rowData.isFixed && <Badge text="F" />}
        </div>
      ),
    },
    {
      field: "designationNameEn",
      header: "Designation",
      sortable: false,
      filterable: false,
      style: { display: "none" },
      body: () => null,
    },
    {
      field: "project1Id",
      header: "Project 1",
      sortable: false,
      filterable: false,
      style: { maxWidth: "200px", width: "200px" },
      body: (rowData: TimesheetPageRow) => (
        <div className="flex items-center">
          <div className="w-[calc(200px-2rem)] h-10!">
            <Dropdown
              small
              filter
              options={projectOptions}
              disabled={rowData.isLocked}
              className="w-full h-10!"
              placeholder="Select Project"
              value={
                rowData.project1Id != null ? String(rowData.project1Id) : null
              }
              onChange={(e) =>
                updateTimesheetEntry(
                  rowData.id,
                  "project1Id",
                  e.value != null ? Number(e.value) : null
                )
              }
            />
          </div>
        </div>
      ),
    },
    {
      field: "project1Hours",
      header: "Hrs.",
      sortable: false,
      filterable: false,
      style: { minWidth: "80px" },
      body: (rowData: TimesheetPageRow) => (
        <div className="flex justify-center py-1">
          <NumberInput
            useGrouping={false}
            disabled={rowData.isLocked}
            value={rowData.project1Hours ?? 0}
            onValueChange={(e) =>
              updateTimesheetEntry(rowData.id, "project1Hours", e.value ?? null)
            }
            className="timesheet-number-input"
            min={0}
            showButtons={false}
          />
        </div>
      ),
    },
    {
      field: "project1Overtime",
      header: "O/T",
      sortable: false,
      filterable: false,
      style: { minWidth: "80px" },
      body: (rowData: TimesheetPageRow) => (
        <div className="flex justify-center">
          <NumberInput
            useGrouping={false}
            disabled={rowData.isLocked}
            value={rowData.project1Overtime ?? 0}
            onValueChange={(e) =>
              updateTimesheetEntry(
                rowData.id,
                "project1Overtime",
                e.value ?? null
              )
            }
            className="timesheet-number-input"
            min={0}
            showButtons={false}
          />
        </div>
      ),
    },
    {
      field: "project2Id",
      header: "Project 2",
      sortable: false,
      filterable: false,
      style: { maxWidth: "200px", width: "200px" },
      body: (rowData: TimesheetPageRow) => (
        <div className="flex items-center">
          <div className="w-[calc(200px-2rem)] h-10!">
            <Dropdown
              small
              filter
              options={projectOptions}
              disabled={rowData.isLocked}
              className="w-full h-10!"
              placeholder="Select Project"
              value={
                rowData.project2Id != null ? String(rowData.project2Id) : null
              }
              onChange={(e) =>
                updateTimesheetEntry(
                  rowData.id,
                  "project2Id",
                  e.value != null ? Number(e.value) : null
                )
              }
            />
          </div>
        </div>
      ),
    },
    {
      field: "project2Hours",
      header: "Hrs.",
      sortable: false,
      filterable: false,
      style: { minWidth: "80px" },
      body: (rowData: TimesheetPageRow) => (
        <div className="flex justify-center">
          <NumberInput
            useGrouping={false}
            disabled={rowData.isLocked}
            value={rowData.project2Hours ?? 0}
            onValueChange={(e) =>
              updateTimesheetEntry(rowData.id, "project2Hours", e.value ?? null)
            }
            className="timesheet-number-input"
            min={0}
            showButtons={false}
          />
        </div>
      ),
    },
    {
      field: "project2Overtime",
      header: "O/T",
      sortable: false,
      filterable: false,
      style: { minWidth: "80px" },
      body: (rowData: TimesheetPageRow) => (
        <div className="flex justify-center">
          <NumberInput
            useGrouping={false}
            disabled={rowData.isLocked}
            value={rowData.project2Overtime ?? 0}
            onValueChange={(e) =>
              updateTimesheetEntry(
                rowData.id,
                "project2Overtime",
                e.value ?? null
              )
            }
            className="timesheet-number-input"
            min={0}
            showButtons={false}
          />
        </div>
      ),
    },
    {
      field: "totalHours",
      header: "Total Hrs.",
      sortable: false,
      filterable: false,
      style: { minWidth: "100px" },
      body: (rowData: TimesheetPageRow) => (
        <div className="flex items-center justify-center border border-primary-light rounded-xl h-10">
          <span className="text-sm">{rowData.totalHours ?? 0}</span>
        </div>
      ),
    },
    {
      field: "description",
      header: "Remarks",
      sortable: false,
      filterable: false,
      style: { minWidth: "300px" },
      body: (rowData: TimesheetPageRow) => (
        <Input
          disabled={rowData.isLocked}
          placeholder="Add remarks..."
          value={rowData.description ?? ""}
          onChange={(e) =>
            updateTimesheetEntry(rowData.id, "description", e.target.value)
          }
          className="w-full h-10!"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              saveSingleRow(rowData);
            }
          }}
        />
      ),
    },
    {
      field: "id", // Using ID as field for Actions, though it's custom body
      header: "Actions",
      sortable: false,
      filterable: false,
      style: { minWidth: "80px", textAlign: "center" },
      body: (rowData: TimesheetPageRow) => (
        <div className="flex justify-center">
          <Button
            rounded
            size="small"
            variant="text"
            aria-label="Save"
            icon="pi pi-save text-lg!"
            tooltipOptions={{ position: "top" }}
            onClick={() => saveSingleRow(rowData)}
            disabled={rowData.isLocked || isLoadingTimesheet}
          />
        </div>
      ),
    },
  ];

  const updateTimesheetEntries = async () => {
    setIsLoading(true);
    const entries: SaveTimesheetEntryItem[] = timesheetData.map((row) => ({
      employeeId: row.employeeId,
      timesheetId: row.timesheetId,
      project1Id: validateProjectId(row.project1Id),
      project1Hours: row.project1Hours,
      project1Overtime: row.project1Overtime,
      project2Id: validateProjectId(row.project2Id),
      project2Hours: row.project2Hours,
      project2Overtime: row.project2Overtime,
      totalHours: row.totalHours,
      description: row.description,
    }));
    try {
      const result = await saveTimesheetEntries({
        date: new Date(selectedDate),
        entries,
      });
      toastService.showSuccess(
        "Done",
        `${result.saved} timesheet entr${result.saved === 1 ? "y" : "ies"} saved successfully`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save";
      toastService.showError("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadCSV = useCallback(() => {
    setShowFilePicker(true);
  }, []);

  const handleUploadExcel = useCallback(() => {
    setShowFilePicker(true);
  }, []);

  const handlePageChange = (event: any) => {
    setPage(event.page + 1);
    setLimit(event.rows);
  };

  const handleUpload = useCallback(
    async (file: File) => {
      console.log("handleUpload started", {
        fileName: file.name,
        type: file.type,
        size: file.size,
      });
      try {
        const fileName = file.name.toLowerCase();
        const isCSV = fileName.endsWith(".csv") || file.type === "text/csv";

        console.log("Parsing file...", { isCSV });
        let parseResult;
        if (isCSV) {
          parseResult = await parseCSVFile(file);
        } else {
          parseResult = await parseExcelFile(file);
        }
        console.log("File parsed", {
          rows: parseResult.data.length,
          errors: parseResult.errors.length,
          firstRow: parseResult.data[0],
        });

        if (parseResult.errors.length > 0) {
          toastService.showWarn(
            "Parse Warnings",
            `${parseResult.errors.length} row(s) had errors. Check console for details.`
          );
          console.error("Parse errors:", parseResult.errors);
        }

        if (parseResult.data.length === 0) {
          console.log("No valid data found in file");
          toastService.showError("Error", "No valid data found in file");
          throw new Error("No valid data found in file");
        }

        console.log("Calling bulkUploadTimesheets mutation...", {
          entriesCount: parseResult.data.length,
        });
        await bulkUploadTimesheets(
          { entries: parseResult.data },
          {
            onSuccess: (result: BulkUploadTimesheetResult) => {
              console.log("bulkUploadTimesheets success", result);
              const message =
                result.success > 0
                  ? `Successfully uploaded ${result.success} timesheet entr${result.success === 1 ? "y" : "ies"}`
                  : "Upload completed";

              if (result.failed > 0) {
                toastService.showWarn(
                  "Upload Complete",
                  `${message}. ${result.failed} failed. Check console for details.`
                );
                console.error("Upload errors:", result.errors);
              } else {
                toastService.showSuccess("Success", message);
              }
            },
            onError: (error: any) => {
              console.log("bulkUploadTimesheets error", error);
              const errorMessage = getErrorMessage(
                error,
                "Failed to upload timesheets"
              );
              toastService.showError("Error", errorMessage);
              throw error;
            },
          }
        );
      } catch (error: any) {
        console.log("handleUpload exception", error);
        const errorMessage = getErrorMessage(error, "Failed to parse file");
        toastService.showError("Error", errorMessage);
        throw error;
      }
    },
    [bulkUploadTimesheets]
  );

  const renderHeader = ({ exportCSV, exportExcel }: CustomHeaderProps) => {
    return (
      <div className="flex flex-col lg:flex-row justify-between bg-theme-primary-light items-center gap-3 flex-1 w-full">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="w-full lg:w-auto">
            <Input
              type="date"
              placeholder="Select Date"
              className="w-full lg:w-40 h-10.5!"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="w-full lg:w-auto">
            <GroupDropdown
              value={selectedFilter}
              onChange={setSelectedFilter}
              className="w-full lg:w-48"
            />
          </div>
          <div className="w-full lg:w-auto hidden xl:block">
            <Button
              size="small"
              label="Refresh"
              className="w-full xl:w-28 2xl:w-32 h-10!"
              onClick={() => refetchTimesheet()}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="w-full lg:w-auto">
            <ExportOptions
              exportCSV={exportCSV || (() => {})}
              exportExcel={exportExcel || (() => {})}
              buttonClassName="w-full lg:w-auto h-9!"
            />
          </div>
          <div className="w-full lg:w-auto">
            <BulkUploadOptions
              uploadCSV={handleUploadCSV}
              uploadExcel={handleUploadExcel}
              downloadTemplate={downloadSampleTemplate}
              buttonClassName="w-full lg:w-auto h-9!"
            />
          </div>
          <div className=" w-full lg:w-auto">
            <Button
              size="small"
              label="Update"
              loading={isLoading}
              disabled={isLoadingTimesheet}
              onClick={updateTimesheetEntries}
              className="w-full xl:w-28 2xl:w-32 h-10!"
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
    <>
      <div className="flex h-full flex-col">
        <TitleHeader
          showBack={false}
          title="ATTENDANCE SHEET"
          icon={<i className="fa-light fa-calendar text-xl!" />}
          value={searchValue}
          onChange={(e) => {
            const value = e.target.value;
            setSearchValue(value);
          }}
        />
        <div className="flex flex-1 flex-col gap-4 px-6 py-6 bg-theme-primary-light min-h-0">
          {renderHeader({
            exportCSV,
            exportExcel,
          })}
          <div className="bg-white h-full rounded-xl overflow-hidden min-h-0 relative">
            {isLoadingTimesheet ? (
              <div className="flex items-center justify-center h-[72vh]">
                <ProgressSpinner style={{ width: "40px", height: "40px" }} />
              </div>
            ) : (
              <Table
                dataKey="id"
                ref={tableRef}
                data={timesheetData}
                columns={columns()}
                pagination={true}
                first={(currentPage - 1) * currentLimit}
                rows={currentLimit}
                totalRecords={total}
                onPage={handlePageChange}
                lazy
                globalSearch={false}
                emptyMessage="No timesheet data found. Select a date and payroll section."
                rowClassName={(rowData: TimesheetPageRow) =>
                  rowData.isLocked ? "locked-row" : ""
                }
                scrollable
                scrollHeight="65vh"
              />
            )}
          </div>
        </div>
      </div>

      <BulkUploadDialog
        visible={showFilePicker}
        title="Upload Timesheets"
        onHide={() => setShowFilePicker(false)}
        onUpload={handleUpload}
        accept={{
          "text/csv": [".csv"],
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
            ".xlsx",
          ],
          "application/vnd.ms-excel": [".xls"],
        }}
      />
    </>
  );
};

export default TimesheetPage;
