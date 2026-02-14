"use client";

import dayjs from "dayjs";
import { memo, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "primereact/checkbox";
import { Paginator } from "primereact/paginator";

import {
  Input,
  Table,
  Button,
  Dropdown,
  TitleHeader,
  TableColumn,
  GroupDropdown,
  AutoScrollChips,
} from "@/components";
import { printDailyTimesheetReport } from "@/utils/helpers/print-daily-timesheet";
import { parseGroupDropdownFilter } from "@/utils/helpers";
import { centuryGothic, tanseekArabic } from "@/app/fonts";
import { TimesheetPageRow } from "@/lib/db/services/timesheet/timesheet.dto";
import { useGlobalData, GlobalDataGeneral } from "@/context/GlobalDataContext";
import { useGetDailyTimesheetReport } from "@/lib/db/services/timesheet/requests";

const FilterSection = memo(
  ({
    onSearch,
    selectedDate,
    onDateChange,
  }: {
    onSearch: (params: any) => void;
    selectedDate: Date;
    onDateChange: (date: Date) => void;
  }) => {
    const [employeeCodes, setEmployeeCodes] = useState<string[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<
      string | number | null
    >("all");
    const [projectId, setProjectId] = useState<number | null>(null);
    const [showAbsents, setShowAbsents] = useState<boolean>(false);
    const [showFixedSalary, setShowFixedSalary] = useState<boolean>(false);

    // Fetch global data
    const { data: globalData } = useGlobalData();
    const projects = globalData.projects || [];

    const projectOptions = useMemo(() => {
      const options = projects.map((p: GlobalDataGeneral) => ({
        label: p.nameEn,
        value: p.id,
      }));
      return [{ label: "All Projects", value: null }, ...options];
    }, [projects]);

    const handleRefresh = () => {
      onSearch({
        employeeCodes: employeeCodes.length > 0 ? employeeCodes : null,
        selectedFilter,
        projectId,
        showAbsents,
        showFixedSalary,
      });
    };

    return (
      <div className="bg-[#F5E6E8] w-full flex flex-col xl:flex-row justify-between gap-x-10 gap-y-4 px-6 py-6 print:hidden">
        <div className="grid flex-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-center">
          <div className="w-full">
            <Input
              type="date"
              value={dayjs(selectedDate).format("YYYY-MM-DD")}
              onChange={(e) => {
                if (e.target.value) {
                  onDateChange(new Date(e.target.value));
                }
              }}
              className="w-full h-10!"
              placeholder="Select Date"
            />
          </div>
          <div className="w-full">
            <AutoScrollChips
              keyfilter="int"
              value={employeeCodes}
              allowDuplicate={false}
              placeholder="Employee Codes"
              className="w-full h-10!"
              onChange={(e) => setEmployeeCodes(e.value ?? [])}
            />
          </div>
          <div className="w-full">
            <GroupDropdown
              value={selectedFilter}
              className="w-full h-10.5!"
              onChange={setSelectedFilter}
              placeholder="Select Section / Designation"
            />
          </div>
          <div className="w-full">
            <Dropdown
              filter
              options={projectOptions}
              value={projectId}
              onChange={(e) => setProjectId(e.value)}
              className="w-full h-10!"
              placeholder="Select Project"
            />
          </div>
          <div className="w-full">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  inputId="absents"
                  checked={showAbsents}
                  onChange={(e) => setShowAbsents(e.checked ?? false)}
                />
                <label
                  htmlFor="absents"
                  className="text-sm cursor-pointer select-none whitespace-nowrap"
                >
                  Absents
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  inputId="fixedSalary"
                  checked={showFixedSalary}
                  onChange={(e) => setShowFixedSalary(e.checked ?? false)}
                />
                <label
                  htmlFor="fixedSalary"
                  className="text-sm cursor-pointer select-none whitespace-nowrap"
                >
                  Fixed Salary
                </label>
              </div>
            </div>
          </div>
          <div className="w-full flex justify-end">
            <Button
              size="small"
              label="Refresh"
              onClick={handleRefresh}
              className="w-full md:w-32 h-10!"
            />
          </div>
        </div>
      </div>
    );
  }
);

const DailyTimesheetReportPage = () => {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);

  // Filter states
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date("2025-12-30")
  );
  const [filter, setFilter] = useState({
    employeeCodes: null as string[] | null,
    projectId: null as number | null,
    designationId: undefined as number | undefined,
    payrollSectionId: undefined as number | undefined,
    showAbsents: false,
    showFixedSalary: false,
  });

  // Pagination states
  const [firstSection, setFirstSection] = useState(0);
  const [sectionsPerPage, setSectionsPerPage] = useState(3);

  // Use the new daily report hook
  const { data: reportResponse, isLoading } = useGetDailyTimesheetReport({
    date: selectedDate,
    employeeCodes: filter.employeeCodes,
    projectId: filter.projectId,
    designationId: filter.designationId,
    payrollSectionId: filter.payrollSectionId,
    showAbsents: filter.showAbsents,
    showFixedSalary: filter.showFixedSalary,
  });

  const reportData = (reportResponse?.rows as any as TimesheetPageRow[]) || [];

  // Group data by section
  const sections = useMemo(() => {
    const groups: { [key: string]: TimesheetPageRow[] } = {};
    reportData.forEach((row) => {
      const section = (row as any).sectionName || "Unassigned";
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(row);
    });
    return Object.keys(groups)
      .sort()
      .map((name) => ({
        name,
        rows: groups[name],
      }));
  }, [reportData]);

  // Pagination: Slice sections
  const visibleSections = useMemo(
    () => sections.slice(firstSection, firstSection + sectionsPerPage),
    [sections, firstSection, sectionsPerPage]
  );

  // Flatten visible sections for table
  const visibleData = useMemo(
    () => visibleSections.flatMap((section) => section.rows),
    [visibleSections]
  );

  const handleSearch = (params: any) => {
    const filterParams = parseGroupDropdownFilter(params.selectedFilter);
    setFilter({
      ...filter,
      ...params,
      ...filterParams,
    });
    setFirstSection(0); // Reset pagination on search
  };

  const handlePrint = () => {
    if (reportData.length === 0) return;
    printDailyTimesheetReport(
      reportData,
      selectedDate,
      selectedProject?.nameEn
    );
  };

  // Table column definitions
  const tableCommonProps = { sortable: false, filterable: false };

  // Note: FlattenedTimesheetRow logic from monthly report is simplified here
  // because we receive flat rows directly from getDailyTimesheetReportData (mocked as TimesheetPageRow for now)

  const columns: TableColumn<TimesheetPageRow>[] = useMemo(
    () => [
      {
        field: "rowNumber",
        header: "#",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 50, minWidth: 50 },
        body: (row: TimesheetPageRow) => (
          <span className="text-sm font-medium text-gray-500">
            {row.rowNumber}
          </span>
        ),
      },
      {
        field: "employeeCode",
        header: "Code",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 80, minWidth: 80 },
        body: (row: TimesheetPageRow) => (
          <span className="text-sm font-medium">{row.employeeCode}</span>
        ),
      },
      {
        field: "nameEn",
        header: "Employee Name",
        ...tableCommonProps,
        style: { minWidth: 200 },
        body: (row: TimesheetPageRow) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{row.nameEn}</span>
            {row.designationNameEn && (
              <span className="text-xs text-gray-500">
                {row.designationNameEn}
              </span>
            )}
          </div>
        ),
      },
      {
        field: "project1Hours", // Using project1Hours to show Project 1 Name if available, consistent with monthly report columns?
        // Wait, monthly report columns show Project Name in one column and Hours in another.
        // Our service returns project1Name but TimesheetPageRow interface doesn't have it explicitly typed in standard interface maybe?
        // Let's check `getDailyTimesheetReportData` return type. It returns `rows` with `project1Name`.
        // So we cast row to `any` to access it or update interface. For now, access as any.
        header: "Project 1",
        ...tableCommonProps,
        style: { minWidth: 140 },
        body: (row: TimesheetPageRow) => (
          <span className="text-sm font-medium">
            {(row as any).project1Name || "-"}
          </span>
        ),
      },
      {
        field: "project1Hours",
        header: "Hrs",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 60, minWidth: 60 },
        body: (row: TimesheetPageRow) => (
          <span className="text-sm font-medium">{row.project1Hours || 0}</span>
        ),
      },
      {
        field: "project1Overtime",
        header: "OT",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 60, minWidth: 60 },
        body: (row: TimesheetPageRow) => (
          <span className="text-sm font-medium text-blue-600">
            {row.project1Overtime || 0}
          </span>
        ),
      },
      {
        field: "project2Hours", // Placeholder for Project 2 Name
        header: "Project 2",
        ...tableCommonProps,
        style: { minWidth: 140 },
        body: (row: TimesheetPageRow) => (
          <span className="text-sm">{(row as any).project2Name || "-"}</span>
        ),
      },
      {
        field: "project2Hours",
        header: "Hrs",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 60, minWidth: 60 },
        body: (row: TimesheetPageRow) => (
          <span className="text-sm font-medium">{row.project2Hours || 0}</span>
        ),
      },
      {
        field: "project2Overtime",
        header: "OT",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 60, minWidth: 60 },
        body: (row: TimesheetPageRow) => (
          <span className="text-sm font-medium text-blue-600">
            {row.project2Overtime || 0}
          </span>
        ),
      },
      {
        field: "totalHours",
        header: "Total",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 70, minWidth: 70 },
        body: (row: TimesheetPageRow) => (
          <span className="text-sm font-semibold text-primary">
            {row.totalHours || 0}
          </span>
        ),
      },
      {
        field: "description",
        header: "Remarks",
        ...tableCommonProps,
        style: { minWidth: 100 },
        body: (row: TimesheetPageRow) => (
          <span className="text-sm text-gray-600">{row.description || ""}</span>
        ),
      },
    ],
    []
  );

  // Fetch global data for project name display
  const { data: globalData } = useGlobalData();
  const selectedProject = useMemo(
    () =>
      filter.projectId
        ? globalData.projects.find((p) => p.id == filter.projectId)
        : null,
    [filter.projectId, globalData.projects]
  );

  const rowGroupHeaderTemplate = (rowData: any) => {
    return (
      <div className="border border-primary/50 py-2 px-4 bg-gray-50 flex justify-between items-center print:break-inside-avoid">
        <span className="font-bold text-primary text-sm uppercase">
          {rowData.sectionName || "Unassigned"}
        </span>
        <div className="flex items-center gap-5">
          {selectedProject && (
            <span className="text-sm font-bold text-primary bg-primary-light px-3 py-1 rounded-sm uppercase">
              {selectedProject?.nameEn}
            </span>
          )}
          <span className="text-[11px] font-bold text-white bg-primary px-3 py-1 rounded-sm uppercase">
            {dayjs(selectedDate).format("DD MMM YYYY")}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="print:hidden">
        <TitleHeader
          title="DAILY TIMESHEET REPORT"
          onBack={() => router.replace("/reports")}
          icon={<i className="fa-light fa-calendar-day text-xl!" />}
          renderInput={() => (
            <div className="w-full lg:w-auto">
              <Button
                size="small"
                label="Print"
                icon="pi pi-print"
                variant="outlined"
                onClick={handlePrint}
                className="w-full lg:w-28 h-10! bg-white!"
              />
            </div>
          )}
        />
        <div className="bg-theme-primary-light">
          <FilterSection
            onSearch={handleSearch}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>
      </div>

      <div
        ref={contentRef}
        className={`bg-white mt-4 overflow-hidden ${centuryGothic.variable} ${tanseekArabic.variable}`}
      >
        <div className="mb-4 px-6 print:hidden flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-sm text-gray-600 font-medium order-2 md:order-1">
            Showing{" "}
            <span className="text-primary font-bold">{firstSection + 1}</span>{" "}
            to{" "}
            <span className="text-primary font-bold">
              {Math.min(firstSection + sectionsPerPage, sections.length)}
            </span>{" "}
            of <span className="text-primary font-bold">{sections.length}</span>{" "}
            sections
          </span>
          <Paginator
            rows={sectionsPerPage}
            first={firstSection}
            totalRecords={sections.length}
            rowsPerPageOptions={[1, 3, 5, 10]}
            onPageChange={(e) => {
              setFirstSection(e.first);
              setSectionsPerPage(e.rows);
              const tableWrapper = contentRef.current?.querySelector(
                ".p-datatable-wrapper"
              );
              tableWrapper?.scrollTo({ top: 0, behavior: "smooth" });
            }}
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            className="paginator-sm border-none! p-0! order-1 md:order-2 bg-transparent!"
          />
        </div>

        <Table
          dataKey="id"
          showGridlines
          data={visibleData}
          columns={columns}
          loading={isLoading}
          pagination={false}
          globalSearch={false}
          rowGroupMode="subheader"
          groupRowsBy="sectionName" // Group by Payroll Section
          rowGroupHeaderTemplate={rowGroupHeaderTemplate}
          rowGroupFooterTemplate={(rowData: any) => {
            // Calculate totals for this section
            const sectionRows = visibleData.filter(
              (r) => (r as any).sectionName === rowData.sectionName
            );
            const p1Hrs = sectionRows.reduce(
              (sum, r) => sum + (r.project1Hours || 0),
              0
            );
            const p1OT = sectionRows.reduce(
              (sum, r) => sum + (r.project1Overtime || 0),
              0
            );
            const p2Hrs = sectionRows.reduce(
              (sum, r) => sum + (r.project2Hours || 0),
              0
            );
            const p2OT = sectionRows.reduce(
              (sum, r) => sum + (r.project2Overtime || 0),
              0
            );
            const total = sectionRows.reduce(
              (sum, r) => sum + (r.totalHours || 0),
              0
            );

            return (
              <>
                <td
                  className="text-center bg-table-header-footer font-bold"
                  colSpan={4}
                >
                  Section Total
                </td>
                <td className="text-center! bg-table-header-footer font-bold">
                  {p1Hrs}
                </td>
                <td className="text-center! bg-table-header-footer font-bold text-blue-600">
                  {p1OT}
                </td>
                <td className="text-center! bg-table-header-footer" />
                <td className="text-center! bg-table-header-footer font-bold">
                  {p2Hrs}
                </td>
                <td className="text-center! bg-table-header-footer font-bold text-blue-600">
                  {p2OT}
                </td>
                <td className="text-center! bg-table-header-footer font-bold text-primary">
                  {total}
                </td>
                <td className="text-center bg-table-header-footer" />
              </>
            );
          }}
          tableClassName="report-table"
          emptyMessage="No records found for the selected date."
          scrollable
          scrollHeight="72vh"
        />
      </div>
    </div>
  );
};

export default DailyTimesheetReportPage;
