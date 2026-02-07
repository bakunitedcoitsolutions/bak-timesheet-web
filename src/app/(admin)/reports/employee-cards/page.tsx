"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Input,
  Button,
  TitleHeader,
  GroupDropdown,
  EmployeeCard,
} from "@/components";
import { useGetEmployees } from "@/lib/db/services/employee";
import { useGetDesignations } from "@/lib/db/services/designation/requests";
import { useDebounce } from "@/hooks";
import { ListedEmployee } from "@/lib/db/services/employee/employee.dto";
import { ListedDesignation } from "@/lib/db/services/designation";
import { COMMON_QUERY_INPUT } from "@/utils/constants";
import { ProgressSpinner } from "primereact/progressspinner";
import { parseGroupDropdownFilter } from "@/utils/helpers";

// Card Component for individual employee

const EmployeesCardReportPage = () => {
  const router = useRouter();

  // Filter states
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string | number | null>(
    "all"
  );

  // Debounce search
  const debouncedSearch = useDebounce(searchValue, 500);

  const filterParams = parseGroupDropdownFilter(selectedFilter);

  // Data Fetching
  const { data: employeesResponse, isLoading } = useGetEmployees({
    page: 1,
    limit: 1000, // Fetch all for report (or a large number)
    search: debouncedSearch || undefined,
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
    window.print();
  };

  const renderHeader = () => {
    return (
      <div className="bg-[#F5E6E8] w-full flex flex-col xl:flex-row justify-between gap-x-10 gap-y-4 px-6 py-6 print:hidden">
        <div className="grid flex-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
          <div className="w-full">
            <Input
              small
              placeholder="Employee Codes / Name"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full h-10!"
            />
          </div>
          <div className="w-full lg:col-span-2">
            <GroupDropdown
              placeholder="Select Section / Designation"
              className="w-full h-10.5!"
              value={selectedFilter}
              onChange={setSelectedFilter}
            />
          </div>
          <div className="w-full">
            <Button
              size="small"
              className="w-32 h-10!"
              label="Search"
              onClick={() => {}}
            />
          </div>
        </div>
      </div>
    );
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
                className="w-full lg:w-28 h-10! bg-white!"
                onClick={handlePrint}
              />
            </div>
          )}
        />
        <div className="bg-theme-primary-light">{renderHeader()}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 print:p-0 print:bg-white print:overflow-visible">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          </div>
        ) : employees.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No employees found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 print:grid-cols-3 print:gap-4">
            {employees.map((employee: ListedEmployee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                designationName={getDesignationName(employee.designationId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
          .print\\:gap-4 {
            gap: 1rem !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-gray-300 {
            border-color: #d1d5db !important;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeesCardReportPage;
