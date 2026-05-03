"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Paginator } from "primereact/paginator";

import dayjs from "@/lib/dayjs";
import { TitleHeader, Button } from "@/components";
import { parseGroupDropdownFilter } from "@/utils/helpers";
import { centuryGothic, tanseekArabic } from "@/app/fonts";
import { printTimesheetReport } from "@/utils/helpers/print-timesheet";
import { EmployeeMonthlyReport } from "@/lib/db/services/timesheet/timesheet.dto";
import { useGetMonthlyTimesheetReport } from "@/lib/db/services/timesheet/requests";

// Extracted Components & Utils
import { FilterSection } from "./components/filter-section";
import { ReportTable } from "./components/report-table";
import {
  months,
  flattenMonthlyReportData,
} from "./utils/monthly-timesheet.utils";
import { PrintViewModal } from "./components/print-view-modal";

const MonthlyTimesheetReportPage = () => {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);

  // Filter states
  const [selectedDate, setSelectedDate] = useState<Date>(
    dayjs().startOf("month").toDate()
  );
  const [queryDate, setQueryDate] = useState<Date>(
    dayjs().startOf("month").toDate()
  );
  const [isFirstLoad, setIsFirstLoad] = useState(true);
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
  const [isPrintModalVisible, setIsPrintModalVisible] = useState(false);

  // Data fetching
  const { data: reportResponse, isLoading } = useGetMonthlyTimesheetReport(
    {
      month: queryDate.getMonth() + 1,
      year: queryDate.getFullYear(),
      employeeCodes: filter.employeeCodes,
      projectId: filter.projectId,
      designationId: filter.designationId,
      payrollSectionId: filter.payrollSectionId,
      showAbsents: filter.showAbsents,
      showFixedSalary: filter.showFixedSalary,
    },
    !isFirstLoad
  );

  const reports: EmployeeMonthlyReport[] = reportResponse?.reports || [];
  const monthName =
    months.find((m) => m.value === selectedDate.getMonth() + 1)?.label || "";
  const year = selectedDate.getFullYear();

  // Smart Pagination: Slice reports (employees) FIRST
  const visibleReports = useMemo(
    () => reports.slice(first, first + rows),
    [reports, first, rows]
  );

  // Flatten ONLY the visible reports
  const flattenedData = useMemo(
    () => flattenMonthlyReportData(visibleReports),
    [visibleReports]
  );

  const handleSearch = (params: any) => {
    const filterParams = parseGroupDropdownFilter(params.selectedFilter);
    setFilter({
      ...filter,
      ...params,
      ...filterParams,
    });
    setQueryDate(selectedDate);
    setFirst(0);
    setIsFirstLoad(false);
  };

  const handlePrint = () => {
    if (reports.length === 0) return;
    printTimesheetReport(reports, monthName, year);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="print:hidden">
        <TitleHeader
          title="MONTHLY TIMESHEET REPORT"
          onBack={() => router.replace("/reports")}
          icon={<i className="fa-light fa-calendar-check text-xl!" />}
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
            isLoading={isLoading}
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
          <span className="text-sm text-gray-600 font-medium ">
            Showing <span className="text-primary font-bold">{first + 1}</span>{" "}
            to{" "}
            <span className="text-primary font-bold">
              {Math.min(first + rows, reports.length)}
            </span>{" "}
            of <span className="text-primary font-bold">{reports.length}</span>{" "}
            employees
          </span>
          <div className="flex items-center flex-col-reverse gap-4 md:flex-row">
            <Button
              size="small"
              variant="text"
              label="See Print View"
              onClick={() => setIsPrintModalVisible(true)}
              disabled={reports.length === 0}
              className="py-0! h-10!"
            />

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
        </div>

        <ReportTable
          data={flattenedData}
          isLoading={isLoading}
          monthName={monthName}
          year={year}
        />
      </div>

      <PrintViewModal
        visible={isPrintModalVisible}
        onHide={() => setIsPrintModalVisible(false)}
        reports={reports}
        monthName={monthName}
        year={year}
      />
    </div>
  );
};

export default MonthlyTimesheetReportPage;
