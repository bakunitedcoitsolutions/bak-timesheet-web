"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Paginator } from "primereact/paginator";

import dayjs from "@/lib/dayjs";
import { TitleHeader, Button } from "@/components";
import { parseGroupDropdownFilter } from "@/utils/helpers";
import { centuryGothic, tanseekArabic } from "@/app/fonts";
import { useGlobalData } from "@/context/GlobalDataContext";
import { TimesheetPageRow } from "@/lib/db/services/timesheet/timesheet.dto";
import { useGetDailyTimesheetReport } from "@/lib/db/services/timesheet/requests";
import { printDailyTimesheetReport } from "@/utils/helpers/print-daily-timesheet";

// Extracted Components
import { ReportTable } from "./components/report-table";
import { FilterSection } from "./components/filter-section";
import { groupDataBySection } from "./utils/daily-timesheet.utils";

const DailyTimesheetReportPage = () => {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const { data: globalData } = useGlobalData();

  // Filter states
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );
  const [queryDate, setQueryDate] = useState<string>(
    dayjs().format("YYYY-MM-DD")
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
  const [firstSection, setFirstSection] = useState(0);
  const [sectionsPerPage, setSectionsPerPage] = useState(3);

  // Data fetching
  const { data: reportResponse, isLoading } = useGetDailyTimesheetReport(
    {
      date: new Date(queryDate),
      employeeCodes: filter.employeeCodes,
      projectId: filter.projectId,
      designationId: filter.designationId,
      payrollSectionId: filter.payrollSectionId,
      showAbsents: filter.showAbsents,
      showFixedSalary: filter.showFixedSalary,
    },
    !isFirstLoad
  );

  const reportData = (reportResponse?.rows as any as TimesheetPageRow[]) || [];

  const sections = useMemo(
    () => groupDataBySection(reportData, globalData.payrollSections),
    [reportData, globalData.payrollSections]
  );

  const visibleSections = useMemo(
    () => sections.slice(firstSection, firstSection + sectionsPerPage),
    [sections, firstSection, sectionsPerPage]
  );

  const visibleData = useMemo(
    () => visibleSections.flatMap((section) => section.rows),
    [visibleSections]
  );

  const selectedProject = useMemo(
    () =>
      filter.projectId
        ? globalData.projects.find((p) => p.id == filter.projectId)
        : null,
    [filter.projectId, globalData.projects]
  );

  const handleSearch = (params: any) => {
    const filterParams = parseGroupDropdownFilter(params.selectedFilter);
    setFilter({
      ...filter,
      ...params,
      ...filterParams,
    });
    setQueryDate(selectedDate);
    setFirstSection(0);
    setIsFirstLoad(false);
  };

  const handlePrint = () => {
    if (reportData.length === 0) return;
    printDailyTimesheetReport(
      reportData,
      new Date(selectedDate),
      selectedProject?.nameEn,
      globalData.payrollSections
    );
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="print:hidden">
        <TitleHeader
          title="DAILY TIMESHEET REPORT"
          onBack={() => router.replace("/reports")}
          icon={<i className="fa-light fa-calendar-circle-plus text-xl!" />}
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
            isLoading={isLoading}
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

        <ReportTable
          data={visibleData}
          isLoading={isLoading}
          selectedDate={selectedDate}
          selectedProject={selectedProject}
        />
      </div>
    </div>
  );
};

export default DailyTimesheetReportPage;
