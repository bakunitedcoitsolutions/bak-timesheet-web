"use client";
import { memo, useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { Checkbox } from "primereact/checkbox";
import { InputNumberChangeEvent } from "primereact/inputnumber";
import { Paginator } from "primereact/paginator";
import { centuryGothic, tanseekArabic } from "@/app/fonts";

import {
  Table,
  Button,
  TitleHeader,
  TableColumn,
  NumberInput,
  Dropdown,
  Input,
  GroupDropdown,
} from "@/components";
import { COMMON_QUERY_INPUT } from "@/utils/constants";
import { parseGroupDropdownFilter } from "@/utils/helpers";
import { useGetProjects } from "@/lib/db/services/project/requests";
import { useGetMonthlyTimesheetReport } from "@/lib/db/services/timesheet/requests";
import {
  EmployeeMonthlyReport,
  DailyTimesheetRecord,
} from "@/lib/db/services/timesheet/timesheet.dto";

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

const currentYear = new Date().getFullYear();

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
    const [searchValue, setSearchValue] = useState<string>("");
    const [selectedFilter, setSelectedFilter] = useState<
      string | number | null
    >("all");
    const [projectId, setProjectId] = useState<number | null>(null);
    const [showAbsents, setShowAbsents] = useState<boolean>(true);
    const [showFixedSalary, setShowFixedSalary] = useState<boolean>(false);

    // Fetch Projects for dropdown
    const { data: projectsResponse } = useGetProjects({
      ...COMMON_QUERY_INPUT,
      limit: 1000,
      sortBy: "nameEn",
      sortOrder: "asc",
    });
    const projectOptions = useMemo(() => {
      const options = (projectsResponse?.projects || []).map((p: any) => ({
        label: p.nameEn,
        value: p.id,
      }));
      return [{ label: "All Projects", value: null }, ...options];
    }, [projectsResponse]);

    const handleRefresh = () => {
      onSearch({
        employeeCode: searchValue || null,
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
            <NumberInput
              small
              useGrouping={false}
              placeholder="Employee Codes / Name"
              value={!!searchValue ? parseInt(searchValue) : undefined}
              onChange={(e: InputNumberChangeEvent) =>
                setSearchValue(e.value?.toString() || "")
              }
              className="w-full h-10!"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRefresh();
                }
              }}
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
                  Fixed Sal.
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

const EmployeeReportTable = ({
  report,
  monthName,
  year,
}: {
  report: EmployeeMonthlyReport;
  monthName: string;
  year: number;
}) => {
  return (
    <div className="mb-10 page-break-inside-avoid">
      <div className="bg-gray-100 p-3 border-x border-t border-gray-300 flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase">
          {report.employeeCode} - {report.nameEn} (
          {report.designationName || "No Designation"})
          <span className="ml-2 text-gray-600">
            ID# {report.idCardNo || "N/A"}
          </span>
        </h3>
        <span className="text-xs font-semibold text-primary">
          ({monthName.toUpperCase()}-{year})
        </span>
      </div>
      <div className="overflow-x-auto border-x border-b border-gray-300">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-2 border-r border-gray-200 text-center w-[50px]">
                #
              </th>
              <th className="p-2 border-r border-gray-200 text-center w-[80px]">
                Date
              </th>
              <th className="p-2 border-r border-gray-200 text-left min-w-[150px]">
                Project 1
              </th>
              <th className="p-2 border-r border-gray-200 text-center w-[60px]">
                Hrs
              </th>
              <th className="p-2 border-r border-gray-200 text-center w-[60px]">
                OT
              </th>
              <th className="p-2 border-r border-gray-200 text-left min-w-[150px]">
                Project 2
              </th>
              <th className="p-2 border-r border-gray-200 text-center w-[60px]">
                Hrs
              </th>
              <th className="p-2 border-r border-gray-200 text-center w-[60px]">
                OT
              </th>
              <th className="p-2 border-r border-gray-200 text-center w-[80px]">
                Total
              </th>
              <th className="p-2 text-left min-w-[120px]">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {report.dailyRecords.map((record) => (
              <tr
                key={record.day}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="p-2 border-r border-gray-100 text-center font-medium">
                  {record.day}
                </td>
                <td className="p-2 border-r border-gray-100 text-center">
                  {record.date}
                </td>
                <td className="p-2 border-r border-gray-100">
                  {record.project1Name || "-"}
                </td>
                <td className="p-2 border-r border-gray-100 text-center">
                  {record.project1Hours || 0}
                </td>
                <td className="p-2 border-r border-gray-100 text-center">
                  {record.project1Overtime || 0}
                </td>
                <td className="p-2 border-r border-gray-100">
                  {record.project2Name || "-"}
                </td>
                <td className="p-2 border-r border-gray-100 text-center">
                  {record.project2Hours || 0}
                </td>
                <td className="p-2 border-r border-gray-100 text-center">
                  {record.project2Overtime || 0}
                </td>
                <td className="p-2 border-r border-gray-100 text-center font-bold">
                  {record.project1Hours +
                    record.project1Overtime +
                    record.project2Hours +
                    record.project2Overtime}
                </td>
                <td
                  className={`p-2 ${record.isFriday ? "text-red-500 font-medium" : ""}`}
                >
                  {record.remarks || ""}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
              <td colSpan={3} className="p-2 text-right">
                TOTALS:
              </td>
              <td className="p-2 text-center text-primary">
                {report.dailyRecords.reduce(
                  (sum, r) => sum + (r.project1Hours || 0),
                  0
                )}
              </td>
              <td className="p-2 text-center text-primary">
                {report.dailyRecords.reduce(
                  (sum, r) => sum + (r.project1Overtime || 0),
                  0
                )}
              </td>
              <td className="p-2"></td>
              <td className="p-2 text-center text-primary">
                {report.dailyRecords.reduce(
                  (sum, r) => sum + (r.project2Hours || 0),
                  0
                )}
              </td>
              <td className="p-2 text-center text-primary">
                {report.dailyRecords.reduce(
                  (sum, r) => sum + (r.project2Overtime || 0),
                  0
                )}
              </td>
              <td className="p-2 text-center bg-yellow-100">
                {report.grandTotal}
              </td>
              <td className="p-2 flex gap-4">
                <div className="flex gap-1">
                  <span className="text-[10px] text-gray-500">Hrs:</span>
                  <span>{report.totalHours}</span>
                </div>
                <div className="flex gap-1">
                  <span className="text-[10px] text-gray-500">OT:</span>
                  <span>{report.totalOT}</span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

const MonthlyTimesheetReportPage = () => {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  // Filter states
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filter, setFilter] = useState({
    employeeCode: null as string | null,
    projectId: null as number | null,
    designationId: undefined as number | undefined,
    payrollSectionId: undefined as number | undefined,
    showAbsents: true,
    showFixedSalary: false,
  });

  // Pagination states
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(20);

  // Reset pagination when filter or date changes
  useEffect(() => {
    setFirst(0);
  }, [filter, selectedDate]);

  // Use the monthly report hook
  const { data: reportResponse, isLoading } = useGetMonthlyTimesheetReport({
    month: selectedDate.getMonth() + 1,
    year: selectedDate.getFullYear(),
    employeeCode: filter.employeeCode,
    projectId: filter.projectId,
    designationId: filter.designationId,
    payrollSectionId: filter.payrollSectionId,
    showAbsents: filter.showAbsents,
    showFixedSalary: filter.showFixedSalary,
  });

  const reports = reportResponse?.reports || [];
  const monthName =
    months.find((m) => m.value === selectedDate.getMonth() + 1)?.label || "";

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
    reactToPrintFn();
  };

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
        className={`flex-1 overflow-y-auto p-6 bg-gray-50 print:p-0 print:bg-white print:overflow-visible ${centuryGothic.variable} ${tanseekArabic.variable}`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <i className="pi pi-spin pi-spinner text-3xl text-primary" />
            <span className="text-gray-500">Generating Report...</span>
          </div>
        ) : reports.length > 0 ? (
          <div className="report-container max-w-5xl mx-auto">
            <div className="mb-4 print:hidden flex justify-between items-center bg-white p-3 rounded border border-gray-200">
              <span className="text-sm text-gray-600">
                Showing <strong>{first + 1}</strong> to{" "}
                <strong>{Math.min(first + rows, reports.length)}</strong> of{" "}
                <strong>{reports.length}</strong> employees
              </span>
              <Paginator
                first={first}
                rows={rows}
                totalRecords={reports.length}
                rowsPerPageOptions={[10, 20, 50, 100]}
                onPageChange={(e) => {
                  setFirst(e.first);
                  setRows(e.rows);
                }}
                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                className="paginator-sm"
              />
            </div>

            {reports
              .slice(first, first + rows)
              .map((report: EmployeeMonthlyReport) => (
                <EmployeeReportTable
                  key={report.employeeId}
                  report={report}
                  monthName={monthName}
                  year={selectedDate.getFullYear()}
                />
              ))}

            <div className="mt-4 print:hidden">
              <Paginator
                first={first}
                rows={rows}
                totalRecords={reports.length}
                rowsPerPageOptions={[10, 20, 50, 100]}
                onPageChange={(e) => {
                  setFirst(e.first);
                  setRows(e.rows);
                }}
                className="paginator-sm"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded border border-dashed border-gray-300">
            <i className="pi pi-info-circle text-3xl text-gray-400 mb-2" />
            <span className="text-gray-500">
              No records found for the selected criteria.
            </span>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 5mm;
          }
          body {
            background: white !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .report-container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          /* Ensure backgrounds print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        .monthly-report-table .p-datatable-header {
          display: none;
        }
        .monthly-report-table .text-xs {
          font-size: 0.75rem;
        }
        .paginator-sm .p-paginator {
          padding: 0;
          background: transparent;
          border: none;
        }
        .paginator-sm .p-paginator-element {
          min-width: 2rem;
          height: 2rem;
        }

        /* Responsive table styles for EmployeeReportTable */
        table {
          width: 100%;
          border-spacing: 0;
        }
        th,
        td {
          border: 1px solid #e5e7eb;
          padding: 8px;
        }
        th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        @media print {
          th,
          td {
            border-color: #d1d5db !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MonthlyTimesheetReportPage;
