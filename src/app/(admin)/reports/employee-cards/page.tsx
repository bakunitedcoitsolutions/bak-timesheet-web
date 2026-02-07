"use client";
import { useRouter } from "next/navigation";
import { memo, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { centuryGothic, tanseekArabic } from "@/app/fonts";
import { ProgressSpinner } from "primereact/progressspinner";
import { InputNumberChangeEvent } from "primereact/inputnumber";

import {
  Button,
  TitleHeader,
  NumberInput,
  EmployeeCard,
  GroupDropdown,
} from "@/components";
import { COMMON_QUERY_INPUT } from "@/utils/constants";
import { parseGroupDropdownFilter } from "@/utils/helpers";
import { useGetEmployees } from "@/lib/db/services/employee";
import { ListedDesignation } from "@/lib/db/services/designation";
import { ListedEmployee } from "@/lib/db/services/employee/employee.dto";
import { useGetDesignations } from "@/lib/db/services/designation/requests";

const EmployeeGrid = memo(
  ({
    employees,
    getDesignationName,
  }: {
    employees: ListedEmployee[];
    getDesignationName: (id: number | null) => string | undefined;
  }) => {
    // Chunk employees into groups of 9
    const chunkSize = 9;
    const chunks = [];
    for (let i = 0; i < employees.length; i += chunkSize) {
      chunks.push(employees.slice(i, i + chunkSize));
    }

    return (
      <div className="flex flex-row flex-wrap gap-5 print:block">
        {chunks.map((chunk, chunkIndex) => (
          <div
            key={chunkIndex}
            className={`contents print:grid print:grid-cols-3 print:gap-x-4 print:gap-y-4 ${
              chunkIndex < chunks.length - 1 ? "print:break-after-page" : ""
            }`}
          >
            {chunk.map((employee) => (
              <div key={employee.id} className="print:break-inside-avoid">
                <EmployeeCard
                  employee={employee}
                  designationName={getDesignationName(employee.designationId)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
);

// Filter Component
const FilterSection = memo(
  ({
    onSearch,
  }: {
    onSearch: (search: string, filter: string | number | null) => void;
  }) => {
    const [searchValue, setSearchValue] = useState<string>("");
    const [selectedFilter, setSelectedFilter] = useState<
      string | number | null
    >("all");

    const handleSearch = () => {
      onSearch(searchValue, selectedFilter);
    };

    return (
      <div className="bg-[#F5E6E8] w-full flex flex-col xl:flex-row justify-between gap-x-10 gap-y-4 px-6 py-6 print:hidden">
        <div className="grid flex-1 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 items-center">
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
                  handleSearch();
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
          <div className="w-full col-span-1 lg:col-span-2 md:flex md:justify-end">
            <Button
              size="small"
              label="Search"
              onClick={handleSearch}
              className="w-full md:w-32 h-10!"
            />
          </div>
        </div>
      </div>
    );
  }
);

const EmployeesCardReportPage = () => {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  // Query states (what is actually used for fetching)
  const [querySearch, setQuerySearch] = useState<string>("");
  const [queryFilter, setQueryFilter] = useState<string | number | null>("all");

  const filterParams = parseGroupDropdownFilter(queryFilter);

  // Data Fetching
  const { data: employeesResponse, isLoading } = useGetEmployees({
    page: 1,
    limit: 1000, // Fetch all for report (or a large number)
    search: querySearch || undefined,
    designationId: filterParams.designationId,
    payrollSectionId: filterParams.payrollSectionId,
    sortBy: "employeeCode",
    sortOrder: "asc",
  });

  const employees: ListedEmployee[] = employeesResponse?.employees ?? [];
  const { data: designationsResponse } = useGetDesignations(COMMON_QUERY_INPUT);
  const designations: ListedDesignation[] =
    designationsResponse?.designations ?? [];

  // Helper to get designation name
  const getDesignationName = (id: number | null) => {
    if (!id) return undefined;
    const designation = designations.find((d) => d.id === id);
    return designation?.nameEn;
  };

  const handlePrint = () => {
    reactToPrintFn();
  };

  const handleSearch = (search: string, filter: string | number | null) => {
    setQuerySearch(search);
    setQueryFilter(filter);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="print:hidden">
        <TitleHeader
          title="EMPLOYEES CARDS REPORT"
          onBack={() => router.replace("/reports")}
          icon={<i className="fa-light fa-id-card text-xl!" />}
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
        ) : employees.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No employees found.
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
