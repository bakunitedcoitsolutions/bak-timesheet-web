"use client";
import { memo, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "primereact/checkbox";
import { Paginator } from "primereact/paginator";
import dayjs from "dayjs";

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
import { parseGroupDropdownFilter } from "@/utils/helpers";
import { centuryGothic, tanseekArabic } from "@/app/fonts";
import { printTimesheetReport } from "@/utils/helpers/print-timesheet";
import { useGlobalData, GlobalDataGeneral } from "@/context/GlobalDataContext";
import { EmployeeMonthlyReport } from "@/lib/db/services/timesheet/timesheet.dto";
import { useGetMonthlyTimesheetReport } from "@/lib/db/services/timesheet/requests";

// Date Helpers
const months = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

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
              type="month"
              value={`${selectedDate.getFullYear()}-${String(
                selectedDate.getMonth() + 1
              ).padStart(2, "0")}`}
              onChange={(e) => {
                if (e.target.value) {
                  const [y, m] = e.target.value.split("-").map(Number);
                  onDateChange(new Date(y, m - 1));
                }
              }}
              className="w-full h-10!"
              placeholder="Select Month"
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

// Flattened row type for table rendering
interface FlattenedTimesheetRow {
  _rowKey: string;
  employeeKey: string;
  employeeId: number;
  employeeCode: number;
  nameEn: string;
  nameAr: string | null;
  designationName: string | null;
  idCardNo: string | null;
  sectionName: string | null;
  isFixed: boolean;
  totalHours: number;
  totalOT: number;
  grandTotal: number;
  day: number;
  date: string;
  project1Name: string | null;
  project1Hours: number;
  project1Overtime: number;
  project2Name: string | null;
  project2Hours: number;
  project2Overtime: number;
  isFriday: boolean;
  remarks: string | null;
  dayTotal: number;
}

const MonthlyTimesheetReportPage = () => {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);

  // Filter states
  const [selectedDate, setSelectedDate] = useState<Date>(
    dayjs().startOf("month").toDate()
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
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);

  // Use the monthly report hook
  const { data: reportResponse, isLoading } = useGetMonthlyTimesheetReport({
    month: selectedDate.getMonth() + 1,
    year: selectedDate.getFullYear(),
    employeeCodes: filter.employeeCodes,
    projectId: filter.projectId,
    designationId: filter.designationId,
    payrollSectionId: filter.payrollSectionId,
    showAbsents: filter.showAbsents,
    showFixedSalary: filter.showFixedSalary,
  });

  const reports: EmployeeMonthlyReport[] = reportResponse?.reports || [];
  const monthName =
    months.find((m) => m.value === selectedDate.getMonth() + 1)?.label || "";
  const year = selectedDate.getFullYear();

  // Smart Pagination: Slice reports (employees) FIRST, then flatten
  // This ensures we show X employees per page, not X rows
  const visibleReports = useMemo(
    () => reports.slice(first, first + rows),
    [reports, first, rows]
  );

  // Flatten ONLY the visible reports for the current page
  const flattenedData: FlattenedTimesheetRow[] = useMemo(() => {
    return visibleReports.flatMap((report) =>
      report.dailyRecords.map((record) => ({
        _rowKey: `${report.employeeId}-${record.day}`,
        employeeKey: `${report.employeeCode}-${report.employeeId}`,
        employeeId: report.employeeId,
        employeeCode: report.employeeCode,
        nameEn: report.nameEn,
        nameAr: report.nameAr,
        designationName: report.designationName,
        idCardNo: report.idCardNo,
        sectionName: report.sectionName,
        isFixed: report.isFixed,
        totalHours: report.totalHours,
        totalOT: report.totalOT,
        grandTotal: report.grandTotal,
        day: record.day,
        date: record.date,
        project1Name: record.project1Name,
        project1Hours: record.project1Hours,
        project1Overtime: record.project1Overtime,
        project2Name: record.project2Name,
        project2Hours: record.project2Hours,
        project2Overtime: record.project2Overtime,
        isFriday: record.isFriday,
        remarks: record.remarks,
        dayTotal:
          record.project1Hours +
          record.project1Overtime +
          record.project2Hours +
          record.project2Overtime,
      }))
    );
  }, [visibleReports]);

  const handleSearch = (params: any) => {
    const filterParams = parseGroupDropdownFilter(params.selectedFilter);
    setFilter({
      ...filter,
      ...params,
      ...filterParams,
    });
  };

  const handlePrint = () => {
    if (reports.length === 0) return;
    printTimesheetReport(reports, monthName, year);
  };

  // Table column definitions
  const tableCommonProps = { sortable: false, filterable: false };

  const columns: TableColumn<FlattenedTimesheetRow>[] = useMemo(
    () => [
      {
        field: "day",
        header: "#",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 50, minWidth: 50 },
        body: (row: FlattenedTimesheetRow) => (
          <span className="text-sm font-medium text-gray-500">{row.day}</span>
        ),
      },
      {
        field: "date",
        header: "Date",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 120, minWidth: 120 },
        body: (row: FlattenedTimesheetRow) => (
          <span className="text-sm font-medium">{row.date}</span>
        ),
      },
      {
        field: "project1Name",
        header: "Project 1",
        ...tableCommonProps,
        style: { minWidth: 140 },
        body: (row: FlattenedTimesheetRow) => (
          <span className="text-sm font-medium">{row.project1Name || "-"}</span>
        ),
      },
      {
        field: "project1Hours",
        header: "Hrs",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 60, minWidth: 60 },
        body: (row: FlattenedTimesheetRow) => (
          <span className="text-sm font-medium">{row.project1Hours || 0}</span>
        ),
      },
      {
        field: "project1Overtime",
        header: "OT",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 60, minWidth: 60 },
        body: (row: FlattenedTimesheetRow) => (
          <span className="text-sm font-medium text-blue-600">
            {row.project1Overtime || 0}
          </span>
        ),
      },
      {
        field: "project2Name",
        header: "Project 2",
        ...tableCommonProps,
        style: { minWidth: 140 },
        body: (row: FlattenedTimesheetRow) => (
          <span className="text-sm">{row.project2Name || "-"}</span>
        ),
      },
      {
        field: "project2Hours",
        header: "Hrs",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 60, minWidth: 60 },
        body: (row: FlattenedTimesheetRow) => (
          <span className="text-sm font-medium">{row.project2Hours || 0}</span>
        ),
      },
      {
        field: "project2Overtime",
        header: "OT",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 60, minWidth: 60 },
        body: (row: FlattenedTimesheetRow) => (
          <span className="text-sm font-medium text-blue-600">
            {row.project2Overtime || 0}
          </span>
        ),
      },
      {
        field: "dayTotal",
        header: "Total",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 70, minWidth: 70 },
        body: (row: FlattenedTimesheetRow) => (
          <span className="text-sm font-semibold text-primary">
            {row.dayTotal}
          </span>
        ),
      },
      {
        field: "remarks",
        header: "Remarks",
        ...tableCommonProps,
        style: { minWidth: 100 },
        body: (row: FlattenedTimesheetRow) => (
          <span
            className={`text-sm ${row.isFriday ? `text-primary` : "text-gray-600"}`}
          >
            {row.remarks || ""}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="print:hidden">
        <TitleHeader
          title="MONTHLY TIMESHEET REPORT"
          onBack={() => router.replace("/reports")}
          icon={<i className="fa-light fa-calendar-range text-xl!" />}
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
            Showing <span className="text-primary font-bold">{first + 1}</span>{" "}
            to{" "}
            <span className="text-primary font-bold">
              {Math.min(first + rows, reports.length)}
            </span>{" "}
            of <span className="text-primary font-bold">{reports.length}</span>{" "}
            employees
          </span>
          <Paginator
            rows={rows}
            first={first}
            totalRecords={reports.length}
            rowsPerPageOptions={[10, 20, 50]}
            onPageChange={(e) => {
              setFirst(e.first);
              setRows(e.rows);
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
          dataKey="_rowKey"
          showGridlines
          data={flattenedData}
          columns={columns}
          loading={isLoading}
          pagination={false}
          globalSearch={false}
          rowGroupMode="subheader"
          groupRowsBy="employeeKey"
          rowGroupHeaderTemplate={(rowData: FlattenedTimesheetRow) => (
            <div className="border border-primary/50 py-3 px-4 bg-gray-50 flex justify-between items-center">
              <span className="font-semibold text-primary text-sm uppercase">
                {rowData.employeeCode} - {rowData.nameEn} (
                {rowData.designationName || "-"})
              </span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700 font-semibold whitespace-nowrap">
                  ID# {rowData.idCardNo || "N/A"}
                </span>
                <span className="text-[11px] font-bold text-white bg-primary px-3 py-1 rounded-sm uppercase">
                  {monthName.toUpperCase()} {year}
                </span>
              </div>
            </div>
          )}
          rowGroupFooterTemplate={(rowData: FlattenedTimesheetRow) => {
            const empRows = flattenedData.filter(
              (r) => r.employeeKey === rowData.employeeKey
            );
            const p1Hrs = empRows.reduce((s, r) => s + r.project1Hours, 0);
            const p1OT = empRows.reduce((s, r) => s + r.project1Overtime, 0);
            const p2Hrs = empRows.reduce((s, r) => s + r.project2Hours, 0);
            const p2OT = empRows.reduce((s, r) => s + r.project2Overtime, 0);
            const total = p1Hrs + p1OT + p2Hrs + p2OT;
            return (
              <>
                <td className="text-center bg-table-header-footer font-bold text-base" />
                <td className="text-center! bg-table-header-footer font-bold text-base">
                  Total
                </td>
                <td className="text-center! bg-table-header-footer" />
                <td className="text-center! bg-table-header-footer font-bold text-base">
                  {p1Hrs}
                </td>
                <td className="text-center! bg-table-header-footer font-bold text-base text-blue-600">
                  {p1OT}
                </td>
                <td className="text-center! bg-table-header-footer" />
                <td className="text-center! bg-table-header-footer font-bold text-base">
                  {p2Hrs}
                </td>
                <td className="text-center! bg-table-header-footer font-bold text-base text-blue-600">
                  {p2OT}
                </td>
                <td className="text-center! bg-table-header-footer font-bold text-base text-primary">
                  {total}
                </td>
                <td className="text-center bg-table-header-footer" />
              </>
            );
          }}
          tableClassName="report-table"
          emptyMessage="No records found for the selected criteria."
          scrollable
          scrollHeight="72vh"
        />
      </div>
    </div>
  );
};

export default MonthlyTimesheetReportPage;
