"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Paginator } from "primereact/paginator";

import {
  exportPayrollCSV,
  exportPayrollExcel,
  PayrollReportRow as ExportPayrollReportRow,
} from "@/utils/helpers/export-payroll-report";
import dayjs from "@/lib/dayjs";
import { useGlobalData } from "@/context/GlobalDataContext";
import { TitleHeader, Button, ExportOptions } from "@/components";
import { printPayrollReport } from "@/utils/helpers/print-payroll-report";
import { useGetPayrollReport } from "@/lib/db/services/payroll-summary/requests";

// Extracted Components & Utilities
import { ReportTable } from "./components/report-table";
import { FilterSection } from "./components/filter-section";
import { PayrollReportRow, groupBySection } from "./utils/payroll-report.utils";

const PayrollReportPage = () => {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const { data: globalData } = useGlobalData();

  // applied query (only updated on Refresh)
  const [appliedQuery, setAppliedQuery] = useState({
    month: dayjs().month() + 1,
    year: dayjs().year(),
    payrollSectionIds: null as number[] | null,
    employeeCodes: null as number[] | null,
    paymentMethodId: null as number | null,
    designationId: null as number | null,
  });

  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // section pagination
  const [firstSection, setFirstSection] = useState(0);
  const [sectionsPerPage, setSectionsPerPage] = useState(3);

  // fetch
  const { data: reportResponse, isLoading } = useGetPayrollReport(
    appliedQuery,
    !isFirstLoad
  );

  const allRows = useMemo(
    () => (reportResponse?.details ?? []) as PayrollReportRow[],
    [reportResponse]
  );

  // group by section
  const sections = useMemo(() => groupBySection(allRows), [allRows]);

  // visible sections (paginated)
  const visibleSections = useMemo(
    () => sections.slice(firstSection, firstSection + sectionsPerPage),
    [sections, firstSection, sectionsPerPage]
  );

  const visibleData = useMemo(
    () => visibleSections.flatMap((s) => s.rows),
    [visibleSections]
  );

  // handlers
  const handleSearch = (params: any) => {
    setAppliedQuery({
      ...appliedQuery,
      ...params,
      designationId: null, // Always null for this report currently
    });
    setFirstSection(0);
    setIsFirstLoad(false);
  };

  const handlePrint = () => {
    if (allRows.length === 0) return;

    const paymentMethodOptions = [
      { label: "All Methods", value: 0 },
      ...(globalData?.paymentMethods || []).map((p) => ({
        label: p.nameEn,
        value: p.id,
      })),
    ];

    const appliedPaymentMethodName = appliedQuery.paymentMethodId
      ? paymentMethodOptions.find(
          (p) => p.value === appliedQuery.paymentMethodId
        )?.label || null
      : null;

    let sectionOrDesignationName = null;
    if (
      appliedQuery.payrollSectionIds &&
      appliedQuery.payrollSectionIds.length > 0
    ) {
      const sectionNames = (globalData?.payrollSections || [])
        .filter((s) => appliedQuery.payrollSectionIds!.includes(s.id))
        .map((s) => s.nameEn)
        .join(", ");
      sectionOrDesignationName = sectionNames || null;
    } else if (appliedQuery.designationId) {
      sectionOrDesignationName = (globalData?.designations || []).find(
        (d) => d.id === appliedQuery.designationId
      )?.nameEn;
    }

    printPayrollReport(allRows, appliedQuery.month, appliedQuery.year, {
      paymentMethodName: appliedPaymentMethodName,
      sectionOrDesignationName,
      employeeCodes: appliedQuery.employeeCodes?.map(String) || null,
    });
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="print:hidden">
        <TitleHeader
          title="PAYROLL REPORT"
          onBack={() => router.replace("/reports")}
          icon={<i className="fa-light fa-file-contract text-xl!" />}
          renderInput={() => (
            <div className="flex items-center gap-5">
              <ExportOptions
                exportCSV={() => {
                  if (allRows.length === 0) return;
                  exportPayrollCSV(
                    allRows as ExportPayrollReportRow[],
                    appliedQuery.month,
                    appliedQuery.year
                  );
                }}
                exportExcel={() => {
                  if (allRows.length === 0) return;
                  exportPayrollExcel(
                    allRows as ExportPayrollReportRow[],
                    appliedQuery.month,
                    appliedQuery.year
                  );
                }}
                buttonClassName="w-full lg:w-28 h-10! border-2 border-white! text-white!"
              />
              <Button
                size="small"
                label="Print"
                icon="pi pi-print"
                variant="outlined"
                onClick={handlePrint}
                disabled={allRows.length === 0}
                className="w-full lg:w-28 h-10! bg-white!"
              />
            </div>
          )}
        />
        <div className="bg-theme-primary-light">
          <FilterSection onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </div>

      <div ref={contentRef} className="flex-1 bg-white mt-4 overflow-hidden">
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
          month={appliedQuery.month}
          year={appliedQuery.year}
          allSectionsCount={sections.length}
        />
      </div>
    </div>
  );
};

export default PayrollReportPage;
