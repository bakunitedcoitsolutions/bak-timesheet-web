"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { ProgressSpinner } from "primereact/progressspinner";
import { centuryGothic, tanseekArabic } from "@/app/fonts";

import { Button, TitleHeader } from "@/components";
import { useGlobalData, GlobalDataDesignation } from "@/context/GlobalDataContext";
import { parseGroupDropdownFilter } from "@/utils/helpers";
import { useGetEmployees } from "@/lib/db/services/employee";
import { ListedEmployee } from "@/lib/db/services/employee/employee.dto";

// Extracted Components
import { FilterSection } from "./components/filter-section";
import { EmployeeGrid } from "./components/employee-grid";

const EmployeesCardReportPage = () => {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  // Query states
  const [queryEmployeeCodes, setQueryEmployeeCodes] = useState<string[] | null>(null);
  const [queryFilter, setQueryFilter] = useState<string | number | null>("all");
  const [hasSearched, setHasSearched] = useState(false);

  const filterParams = parseGroupDropdownFilter(queryFilter);

  // Data Fetching
  const { data: employeesResponse, isLoading } = useGetEmployees(
    {
      page: 1,
      limit: 1000,
      employeeCodes: queryEmployeeCodes || undefined,
      designationId: filterParams.designationId,
      payrollSectionId: filterParams.payrollSectionId,
      sortBy: "employeeCode",
      sortOrder: "asc",
    },
    { enabled: hasSearched }
  );

  const employees: ListedEmployee[] = employeesResponse?.employees ?? [];
  const { data: globalData } = useGlobalData();
  const designations: GlobalDataDesignation[] = globalData.designations || [];

  // Helper to get designation name
  const getDesignationName = (id: number | null) => {
    if (!id) return undefined;
    const designation = designations.find((d) => d.id === id);
    return designation?.nameEn;
  };

  const handlePrint = () => {
    reactToPrintFn();
  };

  const handleSearch = (
    employeeCodes: string[] | null,
    filter: string | number | null
  ) => {
    setQueryEmployeeCodes(employeeCodes);
    setQueryFilter(filter);
    setHasSearched(true);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="print:hidden">
        <TitleHeader
          title="EMPLOYEES CARDS REPORT"
          onBack={() => router.replace("/reports")}
          icon={<i className="fa-light fa-address-card text-xl!" />}
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
          <FilterSection onSearch={handleSearch} />
        </div>
      </div>

      <div
        ref={contentRef}
        className={`flex-1 overflow-y-auto p-6 bg-gray-50 print:p-0 print:bg-white print:overflow-visible ${centuryGothic.variable} ${tanseekArabic.variable}`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          </div>
        ) : !hasSearched ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-4">
            <i className="fa-light fa-magnifying-glass text-4xl text-gray-300" />
            <p className="text-lg font-medium">Ready to search</p>
            <p className="text-sm">
              Use the filters above to search for employees and view their cards.
            </p>
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-2">
            <p>No employees found matching your criteria.</p>
          </div>
        ) : (
          <EmployeeGrid
            employees={employees}
            getDesignationName={getDesignationName}
          />
        )}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 5mm;
          }
          body {
            background: white;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-gray-200 {
            border-color: #e5e7eb !important;
          }
          .print\\:overflow-visible {
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeesCardReportPage;
