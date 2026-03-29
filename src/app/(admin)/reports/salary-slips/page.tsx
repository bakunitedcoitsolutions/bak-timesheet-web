"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { ProgressSpinner } from "primereact/progressspinner";

import dayjs from "@/lib/dayjs";
import { toastService } from "@/lib/toast";
import { Button, TitleHeader } from "@/components";
import { parseGroupDropdownFilter } from "@/utils/helpers";
import { centuryGothic, tanseekArabic } from "@/app/fonts";
import { useGetSalarySlipData } from "@/lib/db/services/payroll-summary";
import { PayrollDetailEntry } from "@/lib/db/services/payroll-summary/mappers";

// Extracted Components
import { FilterSection } from "./components/filter-section";
import { SalarySlipGrid } from "./components/salary-slip-grid";

const SalarySlipsPage = () => {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef,
    pageStyle: "@page { size: A4; margin: 0 0 1.5cm 0; }",
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    dayjs().toDate()
  );
  const [slipEntries, setSlipEntries] = useState<PayrollDetailEntry[]>([]);
  const [monthYearLabel, setMonthYearLabel] = useState<string>("");

  const { mutateAsync: fetchSlipData, isPending: isLoading } =
    useGetSalarySlipData();

  const handleSearch = async (
    employeeCodes: number[] | null,
    filter: string | number | null,
    paymentMethodId: number | null
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
        paymentMethodId: paymentMethodId ?? undefined,
      });

      const entries = (result ?? []) as PayrollDetailEntry[];
      setSlipEntries(entries);
      setMonthYearLabel(
        dayjs()
          .year(payrollYear)
          .month(payrollMonth - 1)
          .format("MMMM YYYY")
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
            margin: 0.5cm 0.5cm 1.5cm 0.5cm;
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
