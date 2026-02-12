"use client";
import { useRouter } from "next/navigation";
import { memo, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { centuryGothic, tanseekArabic } from "@/app/fonts";
import { ProgressSpinner } from "primereact/progressspinner";

import {
  Input,
  Button,
  SalarySlip,
  TitleHeader,
  GroupDropdown,
  AutoScrollChips,
} from "@/components";
import { parseGroupDropdownFilter } from "@/utils/helpers";
import { useGetEmployees } from "@/lib/db/services/employee";
import { ListedEmployee } from "@/lib/db/services/employee/employee.dto";
import {
  useGlobalData,
  GlobalDataDesignation,
} from "@/context/GlobalDataContext";

const SalarySlipGrid = memo(
  ({
    employees,
    getDesignationName,
    monthYear,
  }: {
    employees: ListedEmployee[];
    getDesignationName: (id: number | null) => string | undefined;
    monthYear: string;
  }) => {
    // Determine how many slips per page.
    // Adjusted to 2 slips per page as requested
    const slipsPerPage = 2;
    const chunks = [];
    for (let i = 0; i < employees.length; i += slipsPerPage) {
      chunks.push(employees.slice(i, i + slipsPerPage));
    }

    return (
      <div className="flex flex-col gap-5">
        {chunks.map((chunk, chunkIndex) => (
          <div
            key={chunkIndex}
            className={`flex flex-col gap-6 ${
              chunkIndex < chunks.length - 1 ? "print:break-after-page" : ""
            }`}
          >
            {chunk.map((employee) => (
              <div key={employee.id} className="print:break-inside-avoid">
                <SalarySlip
                  employee={employee}
                  designationName={getDesignationName(employee.designationId)}
                  monthYear={monthYear}
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
    selectedDate,
    onDateChange,
  }: {
    onSearch: (
      employeeCodes: string[] | null,
      filter: string | number | null
    ) => void;
    selectedDate: Date;
    onDateChange: (date: Date) => void;
  }) => {
    const [employeeCodes, setEmployeeCodes] = useState<string[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<
      string | number | null
    >("all");

    const handleSearch = () => {
      onSearch(employeeCodes.length > 0 ? employeeCodes : null, selectedFilter);
    };

    return (
      <div className="bg-[#F5E6E8] w-full flex flex-col xl:flex-row justify-between gap-x-10 gap-y-4 px-6 py-6 print:hidden">
        <div className="grid flex-1 grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3 items-center">
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
              value={employeeCodes}
              onChange={(e) => setEmployeeCodes(e.value ?? [])}
              keyfilter="int"
              allowDuplicate={false}
              placeholder="Employee Codes"
              className="w-full h-10!"
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

const SalarySlipsPage = () => {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  // Query states
  const [queryEmployeeCodes, setQueryEmployeeCodes] = useState<string[] | null>(
    null
  );
  const [queryFilter, setQueryFilter] = useState<string | number | null>("all");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const filterParams = parseGroupDropdownFilter(queryFilter);

  // Data Fetching
  const { data: employeesResponse, isLoading } = useGetEmployees({
    page: 1,
    limit: 1000,
    employeeCodes: queryEmployeeCodes || undefined,
    designationId: filterParams.designationId,
    payrollSectionId: filterParams.payrollSectionId,
    sortBy: "employeeCode",
    sortOrder: "asc",
  });

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
  };

  const monthYearString = selectedDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="print:hidden">
        <TitleHeader
          title="SALARY SLIPS"
          onBack={() => router.replace("/reports")}
          icon={<i className="fa-light fa-file-invoice-dollar text-xl!" />}
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
          <div className="flex items-center justify-center h-64">
            <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          </div>
        ) : employees.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No employees found.
          </div>
        ) : (
          <SalarySlipGrid
            employees={employees}
            getDesignationName={getDesignationName}
            monthYear={monthYearString}
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
          .print\\:break-after-page {
            break-after: page;
            page-break-after: always;
          }
          .print\\:block {
            display: block !important;
          }
          /* Ensure backgrounds print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SalarySlipsPage;
