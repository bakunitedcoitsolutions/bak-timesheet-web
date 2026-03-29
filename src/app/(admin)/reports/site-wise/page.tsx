"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button, TitleHeader, ExportOptions } from "@/components";
import { useGlobalData } from "@/context/GlobalDataContext";
import { useGetSiteWiseReport } from "@/lib/db/services/site-wise";
import {
  exportSiteWiseExcel,
  exportSiteWiseCSV,
} from "@/utils/helpers/export-site-wise-report";
import { printSiteWiseReport } from "@/utils/helpers/print-site-wise-report";

import { SummarizedTable } from "./components/summarized-table";
import { DetailedTable } from "./components/detailed-table";
import { FilterSection } from "./components/filter-section";

const getMonthYear = () => {
  const d = new Date();
  return { month: d.getMonth() + 1, year: d.getFullYear() };
};

export default function SiteWiseReportPage() {
  const router = useRouter();
  const { data: globalData } = useGlobalData();

  // Filters
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Applied Query (only updated on Refresh)
  const [appliedQuery, setAppliedQuery] = useState({
    ...getMonthYear(),
    employeeCodes: null as number[] | null,
    projectIds: null as number[] | null,
    summarize: true,
  });

  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch Data
  const { data: reportResponse, isLoading } = useGetSiteWiseReport(
    appliedQuery,
    !isFirstLoad
  );

  const reportData = useMemo(
    () => reportResponse?.data || [],
    [reportResponse]
  );

  // Options
  const projectOptions = useMemo(
    () =>
      globalData.projects.map((p) => ({
        label: p.nameEn,
        value: p.id,
      })),
    [globalData.projects]
  );

  const handleRefresh = (filters: typeof appliedQuery) => {
    setIsFirstLoad(false);
    setAppliedQuery(filters);
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      const projectNames =
        appliedQuery.projectIds && appliedQuery.projectIds.length > 0
          ? globalData.projects
              .filter((p) => appliedQuery.projectIds!.includes(p.id))
              .map((p) => p.nameEn)
              .join(", ")
          : "All";

      printSiteWiseReport(
        reportData,
        appliedQuery.month,
        appliedQuery.year,
        appliedQuery.summarize,
        {
          employeeCodes: appliedQuery.employeeCodes?.map(String) || null,
          projectNames: projectNames,
        }
      );
    } finally {
      setIsPrinting(false);
    }
  };

  const filterSummary = useMemo(() => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const mStr = monthNames[appliedQuery.month - 1];
    const codesStr = appliedQuery.employeeCodes?.length
      ? appliedQuery.employeeCodes.join(", ")
      : "All";

    const pNames =
      appliedQuery.projectIds && appliedQuery.projectIds.length > 0
        ? globalData.projects
            .filter((p) => appliedQuery.projectIds!.includes(p.id))
            .map((p) => p.nameEn)
            .join(", ")
        : "All";

    return `(Month: ${mStr}-${appliedQuery.year} | Emp Code: ${codesStr} | Project: ${pNames})`;
  }, [appliedQuery, globalData.projects]);

  return (
    <div className="h-full bg-white flex flex-col">
      <TitleHeader
        title="Site Wise Report"
        onBack={() => router.replace("/reports")}
        icon={<i className="fa-light fa-city text-xl!" />}
        renderInput={() => (
          <div className="w-full lg:w-auto">
            <div className="flex items-center gap-5">
              <ExportOptions
                loading={isExporting}
                disabled={
                  isLoading ||
                  isPrinting ||
                  isExporting ||
                  reportData.length === 0
                }
                exportCSV={() => {
                  exportSiteWiseCSV(
                    reportData,
                    appliedQuery.month,
                    appliedQuery.year,
                    appliedQuery.summarize
                  );
                }}
                exportExcel={async () => {
                  try {
                    setIsExporting(true);
                    exportSiteWiseExcel(
                      reportData,
                      appliedQuery.month,
                      appliedQuery.year,
                      appliedQuery.summarize
                    );
                  } finally {
                    setIsExporting(false);
                  }
                }}
                buttonClassName="w-full lg:w-28 h-10! border-2 border-white! text-white!"
              />
              <Button
                size="small"
                label="Print"
                icon="pi pi-print"
                variant="outlined"
                loading={isPrinting}
                disabled={
                  isLoading ||
                  isPrinting ||
                  isExporting ||
                  reportData.length === 0
                }
                className="w-full lg:w-28 h-10! bg-white!"
                onClick={handlePrint}
              />
            </div>
          </div>
        )}
      />

      <FilterSection
        onRefresh={handleRefresh}
        isLoading={isLoading}
        projectOptions={projectOptions}
        initialMonthYear={getMonthYear()}
        initialEmployeeCodes={[]}
        initialSelectedProjects={[]}
        initialSummarize={true}
      />

      <div ref={contentRef} className="flex-1 min-h-0 bg-white flex flex-col">
        {reportResponse?.message && reportData.length === 0 && (
          <div className="flex items-center justify-center h-40 text-primary font-semibold">
            {reportResponse.message}
          </div>
        )}

        <div className="flex-1 min-h-0">
          {reportData.length > 0 &&
            (appliedQuery.summarize ? (
              <SummarizedTable data={reportData} isLoading={isLoading} />
            ) : (
              <DetailedTable
                data={reportData}
                isLoading={isLoading}
                filterSummary={filterSummary}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
