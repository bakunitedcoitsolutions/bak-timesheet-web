"use client";
import { useRef, useState, useMemo, useCallback, useEffect } from "react";

import {
  useGlobalData,
  GlobalDataDesignation,
} from "@/context/GlobalDataContext";
import { TableRef } from "@/components";
import { toastService } from "@/lib/toast";
import { useGetLedgerByEmployeeCode } from "@/lib/db/services/ledger/requests";

// Components
import { LedgerTable } from "./components/LedgerTable";
import { LedgerSearch } from "./components/LedgerSearch";
import { LedgerHeader } from "./components/LedgerHeader";
import { LedgerEmployeeInfo } from "./components/LedgerEmployeeInfo";

// Helpers
import {
  getLedgerTableColumns,
  calculateLedgerTotals,
  transformLedgerEntries,
} from "./helpers";

const LedgerPage = () => {
  const [employeeCode, setEmployeeCode] = useState<string>("");
  const [searchEmployeeCode, setSearchEmployeeCode] = useState<number | null>(
    null
  );
  const tableRef = useRef<TableRef>(null);

  // Fetch ledger data
  const {
    data: ledgerResponse,
    isLoading,
    refetch,
    error,
  } = useGetLedgerByEmployeeCode({
    employeeCode: searchEmployeeCode || 0,
  });

  // Fetch designations for display
  const { data: globalData } = useGlobalData();
  const designations = globalData.designations || [];

  // Create designation map
  const designationsMap = useMemo(() => {
    const map = new Map<number, GlobalDataDesignation>();
    designations.forEach((des: GlobalDataDesignation) => {
      map.set(des.id, des);
    });
    return map;
  }, [designations]);

  // Transform ledger entries to table format
  const ledgerData = useMemo(() => {
    return transformLedgerEntries(ledgerResponse?.ledgerEntries || []);
  }, [ledgerResponse?.ledgerEntries]);

  // Get employee info
  const employee = ledgerResponse?.employee;
  const employeeName = employee?.nameEn || "";
  const employeeDesignation =
    employee?.designationId && designationsMap.has(employee.designationId)
      ? designationsMap.get(employee.designationId)!.nameEn
      : "";
  const idCardNumber = employee?.idCardNo || "";

  // Handle errors from the server (e.g., Access Denied)
  useEffect(() => {
    if (error) {
      toastService.showError(
        "Error",
        (error as any) || "An error occurred while fetching the ledger."
      );
      setSearchEmployeeCode(null);
      setEmployeeCode("");
    }
  }, [error, toastService]);

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

  // Calculate totals
  const totals = useMemo(() => {
    return calculateLedgerTotals(ledgerData);
  }, [ledgerData]);

  // Print handler
  const handlePrint = useCallback(() => {
    if (!employee || ledgerData.length === 0) return;
    import("@/utils/helpers/print-ledger-report").then((module) => {
      module.printLedgerReport(
        ledgerData,
        employee,
        totals,
        employeeDesignation
      );
    });
  }, [employee, ledgerData, totals, employeeDesignation]);

  // Memoized columns
  const tableColumns = useMemo(
    () => getLedgerTableColumns(totals, ledgerData),
    [totals, ledgerData]
  );

  const renderEmployeeInfo = useCallback(
    (isPrinting: boolean) => (
      <LedgerEmployeeInfo
        isLoading={isLoading}
        employee={employee}
        employeeName={employeeName}
        employeeDesignation={employeeDesignation}
        idCardNumber={idCardNumber}
        searchEmployeeCode={searchEmployeeCode}
        isPrinting={isPrinting}
      />
    ),
    [
      isLoading,
      employee,
      employeeName,
      employeeDesignation,
      idCardNumber,
      searchEmployeeCode,
    ]
  );

  return (
    <div className="flex h-full flex-col">
      <LedgerHeader
        onPrint={handlePrint}
        isPrintDisabled={!employee || ledgerData.length === 0}
      />
      <div className="bg-[#F5E6E8] px-6 py-4">
        <LedgerSearch
          employeeCode={employeeCode}
          setEmployeeCode={setEmployeeCode}
          onSearch={handleSearch}
          isLoading={isLoading}
        />
      </div>
      <div className="flex flex-1 flex-col gap-4 px-6 pt-4 pb-6 bg-theme-primary-light min-h-0">
        {/* Employee Info Section */}
        <div className="bg-white rounded-xl py-4 px-4">
          {renderEmployeeInfo(false)}
        </div>

        {/* Table Section */}
        <LedgerTable
          tableRef={tableRef}
          ledgerData={ledgerData}
          columns={tableColumns}
          isLoading={isLoading}
          searchEmployeeCode={searchEmployeeCode}
          renderEmployeeInfo={renderEmployeeInfo}
        />
      </div>
    </div>
  );
};

export default LedgerPage;
