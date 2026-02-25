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
import { useGetSalarySlipData } from "@/lib/db/services/payroll-summary";
import { PayrollDetailEntry } from "@/lib/db/services/payroll-summary/mappers";
import { toastService } from "@/lib/toast";

// ── Salary slip grid (memoised for print performance) ─────────────────────────
const SalarySlipGrid = memo(
  ({
    entries,
    monthYear,
  }: {
    entries: PayrollDetailEntry[];
    monthYear: string;
  }) => {
    const slipsPerPage = 3;
    const chunks: PayrollDetailEntry[][] = [];
    for (let i = 0; i < entries.length; i += slipsPerPage) {
      chunks.push(entries.slice(i, i + slipsPerPage));
    }

    return (
      <div className="flex flex-col gap-5">
        {chunks.map((chunk, chunkIndex) => (
          <div
            key={chunkIndex}
            className={`flex flex-col gap-6 print:gap-4 ${
              chunkIndex < chunks.length - 1 ? "print:break-after-page" : ""
            }`}
          >
            {chunk.map((entry) => (
              <div
                key={`${entry.id}-${entry.empCode}`}
                className="print:break-inside-avoid"
              >
                <SalarySlip entry={entry} monthYear={monthYear} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
);
SalarySlipGrid.displayName = "SalarySlipGrid";

// ── Filter section ─────────────────────────────────────────────────────────────
const FilterSection = memo(
  ({
    onSearch,
    selectedDate,
    onDateChange,
    isLoading,
  }: {
    onSearch: (
      employeeCodes: number[] | null,
      filter: string | number | null
    ) => void;
    selectedDate: Date | null;
    onDateChange: (date: Date) => void;
    isLoading: boolean;
  }) => {
    const [employeeCodes, setEmployeeCodes] = useState<string[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<
      string | number | null
    >("all");

    const handleSearch = () => {
      const codes =
        employeeCodes.length > 0
          ? employeeCodes.map((c) => parseInt(c, 10)).filter((n) => !isNaN(n))
          : null;
      onSearch(codes, selectedFilter);
    };

    const monthValue = selectedDate
      ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}`
      : "";

    return (
      <div className="bg-[#F5E6E8] w-full flex flex-col xl:flex-row justify-between gap-x-10 gap-y-4 px-6 py-6 print:hidden">
        <div className="grid flex-1 grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3 items-center">
          {/* Month — required */}
          <div className="w-full">
            <Input
              type="month"
              value={monthValue}
              onChange={(e) => {
                if (e.target.value) {
                  const [y, m] = e.target.value.split("-").map(Number);
                  onDateChange(new Date(y, m - 1));
                }
              }}
              className="w-full h-10!"
              placeholder="Select Month *"
            />
          </div>

          {/* Employee codes */}
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

          {/* Designation / Section */}
          <div className="w-full">
            <GroupDropdown
              value={selectedFilter}
              className="w-full h-10.5!"
              onChange={setSelectedFilter}
              placeholder="Select Section / Designation"
            />
          </div>

          {/* Search button — disabled until month is selected */}
          <div className="w-full col-span-1 lg:col-span-2 md:flex md:justify-end">
            <Button
              size="small"
              label="Search"
              onClick={handleSearch}
              className="w-full md:w-32 h-10!"
              disabled={!selectedDate || isLoading}
              loading={isLoading}
              tooltip={
                !selectedDate ? "Please select a month first" : undefined
              }
              tooltipOptions={{ position: "top" }}
            />
          </div>
        </div>
      </div>
    );
  }
);
FilterSection.displayName = "FilterSection";

// ── Page ───────────────────────────────────────────────────────────────────────
const SalarySlipsPage = () => {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [slipEntries, setSlipEntries] = useState<PayrollDetailEntry[]>([]);
  const [monthYearLabel, setMonthYearLabel] = useState<string>("");

  const { mutateAsync: fetchSlipData, isPending: isLoading } =
    useGetSalarySlipData();

  const handleSearch = async (
    employeeCodes: number[] | null,
    filter: string | number | null
  ) => {
    if (!selectedDate) return;

    const filterParams = parseGroupDropdownFilter(filter);
    const payrollYear = selectedDate.getFullYear();
    const payrollMonth = selectedDate.getMonth() + 1;

    try {
      const result = await fetchSlipData({
        payrollYear,
        payrollMonth,
        designationId: filterParams.designationId ?? undefined,
        payrollSectionId: filterParams.payrollSectionId ?? undefined,
        employeeCodes: employeeCodes ?? undefined,
      });

      const entries = (result ?? []) as PayrollDetailEntry[];
      setSlipEntries(entries);
      setMonthYearLabel(
        new Date(payrollYear, payrollMonth - 1).toLocaleString("default", {
          month: "long",
          year: "numeric",
        })
      );
      if (entries.length === 0) {
        toastService.showInfo(
          "No Results",
          "No employee data found for the selected filters."
        );
      }
    } catch (error: any) {
      toastService.showError(
        "Error",
        error.message || "Failed to load salary slips."
      );
    }
  };

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
                onClick={() => reactToPrintFn()}
                disabled={slipEntries.length === 0}
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
        className={`flex-1 overflow-y-auto p-6 bg-gray-50 print:p-0 print:bg-white print:overflow-visible ${centuryGothic.variable} ${tanseekArabic.variable}`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          </div>
        ) : slipEntries.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            {selectedDate
              ? "No employees found for the selected filters."
              : "Select a month and click Search to generate salary slips."}
          </div>
        ) : (
          <SalarySlipGrid entries={slipEntries} monthYear={monthYearLabel} />
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
