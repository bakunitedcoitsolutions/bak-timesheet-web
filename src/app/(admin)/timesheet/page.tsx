"use client";
import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { classNames } from "primereact/utils";

import {
  Input,
  Badge,
  Button,
  TableRef,
  Dropdown,
  useAccess,
  NumberInput,
  TableColumn,
} from "@/components";
import { useDebounce } from "@/hooks";
import { toastService } from "@/lib/toast";
import { parseGroupDropdownFilter, getErrorMessage } from "@/utils/helpers";
import { useGlobalData, GlobalDataGeneral } from "@/context/GlobalDataContext";
import {
  useGetTimesheetPageData,
  useSaveTimesheetEntries,
  useBulkUploadTimesheets,
} from "@/lib/db/services/timesheet/requests";
import { useGetPayrollSummaryStatus } from "@/lib/db/services/payroll-summary/requests";
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
import { validateProjectId } from "@/utils/helpers/main-utils";

// Sub-components and Helpers
import { getTodayDateString, isLocked as checkIsLocked } from "./helpers";
import { TimesheetHeader } from "./components/TimesheetHeader";
import { TimesheetActions } from "./components/TimesheetActions";
import { TimesheetTable } from "./components/TimesheetTable";
import { TimesheetDialogs } from "./components/TimesheetDialogs";

/** Stable empty array so useMemo/useEffect deps don't change every render when no data */
const EMPTY_ROWS: TimesheetPageRow[] = [];

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
  const [uploadResult, setUploadResult] =
    useState<BulkUploadTimesheetResult | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const tableRef = useRef<TableRef>(null);

  const { can, role } = useAccess();
  const hasFull = can("timesheet", "full");
  const canEdit = can("timesheet", "edit");
  const canAdd = can("timesheet", "add");

  // Derive month and year from the selected date for payroll status lookup
  const { month: selectedMonth, year: selectedYear } = useMemo(() => {
    const d = new Date(selectedDate);
    return { month: d.getMonth() + 1, year: d.getFullYear() };
  }, [selectedDate]);

  const { data: payrollSummaryStatus } = useGetPayrollSummaryStatus({
    month: selectedMonth,
    year: selectedYear,
  });

  const isPayrollPosted = payrollSummaryStatus?.payrollStatusId === 3;

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
  const { data: globalData, isLoading: isLoadingGlobalData } = useGlobalData();

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
    [globalData.projects]
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

  const updateTimesheetEntry = useCallback(
    (id: number, field: keyof TimesheetPageRow, value: any) => {
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
    },
    []
  );

  const saveSingleRow = useCallback(
    async (rowData: TimesheetPageRow) => {
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
        const message =
          err instanceof Error ? err.message : "Failed to save row";
        toastService.showError(
          "Error",
          `Failed to save row for ${rowData.nameEn} (${rowData.employeeCode}): ${message}`
        );
      }
    },
    [saveTimesheetEntries, selectedDate]
  );

  const isLocked = useCallback(
    (rowData: TimesheetPageRow) => {
      return checkIsLocked(
        rowData,
        isPayrollPosted,
        role,
        hasFull,
        canEdit,
        canAdd
      );
    },
    [isPayrollPosted, role, hasFull, canEdit, canAdd]
  );

  const columns = useMemo(
    (): TableColumn<TimesheetPageRow>[] => [
      {
        field: "rowNumber",
        header: "#",
        sortable: false,
        filterable: false,
        align: "center",
        body: (rowData: TimesheetPageRow) => (
          <div
            className={classNames("flex items-center justify-center gap-1.5", {
              "w-[40px]": isLocked(rowData),
              "w-[35px]": !isLocked(rowData),
            })}
          >
            <span className="text-sm font-medium">{rowData.rowNumber}</span>
            {isLocked(rowData) && (
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
                disabled={isLocked(rowData)}
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
              disabled={isLocked(rowData)}
              value={rowData.project1Hours ?? 0}
              onValueChange={(e) =>
                updateTimesheetEntry(
                  rowData.id,
                  "project1Hours",
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
        field: "project1Overtime",
        header: "O/T",
        sortable: false,
        filterable: false,
        style: { minWidth: "80px" },
        body: (rowData: TimesheetPageRow) => (
          <div className="flex justify-center">
            <NumberInput
              useGrouping={false}
              disabled={isLocked(rowData)}
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
                disabled={isLocked(rowData)}
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
              disabled={isLocked(rowData)}
              value={rowData.project2Hours ?? 0}
              onValueChange={(e) =>
                updateTimesheetEntry(
                  rowData.id,
                  "project2Hours",
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
        field: "project2Overtime",
        header: "O/T",
        sortable: false,
        filterable: false,
        style: { minWidth: "80px" },
        body: (rowData: TimesheetPageRow) => (
          <div className="flex justify-center">
            <NumberInput
              useGrouping={false}
              disabled={isLocked(rowData)}
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
            disabled={isLocked(rowData)}
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
              disabled={isLocked(rowData) || isLoadingTimesheet}
            />
          </div>
        ),
      },
    ],
    [projectOptions, isLoadingTimesheet, isLocked, saveSingleRow, updateTimesheetEntry]
  );

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

        await bulkUploadTimesheets(
          { entries: parseResult.data },
          {
            onSuccess: (result: BulkUploadTimesheetResult) => {
              setUploadResult(result);
              setShowReportDialog(true);
              setShowFilePicker(false); // Close picker on success

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
        const errorMessage = getErrorMessage(error, "Failed to parse file");
        toastService.showError("Error", errorMessage);
        throw error;
      }
    },
    [bulkUploadTimesheets]
  );

  return (
    <>
      <div className="flex h-full flex-col">
        <TimesheetHeader
          searchValue={searchValue}
          onSearchChange={(e) => setSearchValue(e.target.value)}
        />
        <div className="flex flex-1 flex-col gap-4 px-6 py-6 bg-theme-primary-light min-h-0">
          <TimesheetActions
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            onRefresh={() => refetchTimesheet()}
            onUploadCSV={handleUploadCSV}
            onUploadExcel={handleUploadExcel}
            onUpdate={updateTimesheetEntries}
            isLoading={isLoading}
            isLoadingTimesheet={isLoadingTimesheet}
            canAdd={canAdd}
            canEdit={canEdit}
            downloadSampleTemplate={downloadSampleTemplate}
          />
          <TimesheetTable
            tableRef={tableRef}
            data={timesheetData}
            columns={columns}
            isLoading={isLoadingTimesheet || isLoadingGlobalData}
            onPage={handlePageChange}
            totalRecords={total}
            rows={currentLimit}
            currentPage={currentPage}
            isLocked={isLocked}
          />
        </div>
      </div>

      <TimesheetDialogs
        showFilePicker={showFilePicker}
        onHideFilePicker={() => setShowFilePicker(false)}
        onUpload={handleUpload}
        showReportDialog={showReportDialog}
        onHideReportDialog={() => {
          setShowReportDialog(false);
          setUploadResult(null);
          setUploadedFileName("");
        }}
        uploadResult={uploadResult}
        uploadedFileName={uploadedFileName}
      />
    </>
  );
};

export default TimesheetPage;
