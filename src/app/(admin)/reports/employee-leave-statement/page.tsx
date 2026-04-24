"use client";
import { useState, useCallback, useEffect } from "react";

import { toastService } from "@/lib/toast";
import { useGetLeaveEligibilityReport } from "@/lib/db/services/leave-eligibility/requests";

// Components
import { LedgerSearch } from "./components/LedgerSearch";
import { LedgerHeader } from "./components/LedgerHeader";
import { LeaveEligibilityTable } from "./components/LeaveEligibilityTable";

const EmployeeLeaveEligibilityPage = () => {
  const [employeeCode, setEmployeeCode] = useState<string>("");
  const [searchEmployeeCode, setSearchEmployeeCode] = useState<number | null>(
    null
  );

  // Fetch leave eligibility data
  const {
    data: report,
    isLoading,
    refetch,
    error,
  } = useGetLeaveEligibilityReport(searchEmployeeCode || 0);

  // Handle errors from the server
  useEffect(() => {
    if (error) {
      toastService.showError(
        "Error",
        (error as any) || "An error occurred while fetching the report."
      );
      setSearchEmployeeCode(null);
      setEmployeeCode("");
    }
  }, [error]);

  // Handle search
  const handleSearch = useCallback(() => {
    const code = parseInt(employeeCode, 10);
    if (isNaN(code) || code <= 0) {
      toastService.showError("Error", "Please enter a valid employee code");
      return;
    }
    if (code === searchEmployeeCode) {
      refetch();
    } else {
      setSearchEmployeeCode(code);
    }
  }, [employeeCode, searchEmployeeCode, refetch]);

  // Print handler
  const handlePrint = useCallback(() => {
    if (!report) return;
    import("@/utils/helpers/print-leave-eligibility-report").then((module) => {
      module.printLeaveEligibilityReport(report);
    });
  }, [report]);

  return (
    <div className="flex h-full flex-col">
      <LedgerHeader
        onPrint={handlePrint}
        isPrintDisabled={!report}
        title="Employee Leave Statement"
      />

      <div className="bg-[#F5E6E8] px-6 py-4">
        <LedgerSearch
          employeeCode={employeeCode}
          setEmployeeCode={setEmployeeCode}
          onSearch={handleSearch}
          isLoading={isLoading}
        />
      </div>

      <div className="flex flex-1 flex-col gap-6 px-6 pt-4 pb-6 bg-theme-primary-light overflow-y-auto">
        <LeaveEligibilityTable
          report={report || null}
          isLoading={isLoading}
          searchEmployeeCode={searchEmployeeCode}
        />
      </div>
    </div>
  );
};

export default EmployeeLeaveEligibilityPage;
