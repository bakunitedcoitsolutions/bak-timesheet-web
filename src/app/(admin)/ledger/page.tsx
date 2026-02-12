"use client";
import { useRef, useState, useMemo, useCallback } from "react";
import { classNames } from "primereact/utils";
import { ProgressSpinner } from "primereact/progressspinner";
import { InputNumberChangeEvent } from "primereact/inputnumber";

import {
  Table,
  Button,
  TableRef,
  TableColumn,
  NumberInput,
  TitleHeader,
} from "@/components";
import { toastService } from "@/lib/toast";
import { LedgerEntryInterface } from "@/lib/db/services/ledger/ledger.dto";
import {
  useGlobalData,
  GlobalDataDesignation,
} from "@/context/GlobalDataContext";
import { useGetLedgerByEmployeeCode } from "@/lib/db/services/ledger/requests";

// Transformed ledger entry for table display
interface LedgerEntry {
  id: number;
  date: string;
  description: string;
  salary: number | null;
  loan: number | null;
  challan: number | null;
  deduction: number | null;
  balance: number;
}

const LedgerPage = () => {
  const [employeeCode, setEmployeeCode] = useState<string>("");
  const [searchEmployeeCode, setSearchEmployeeCode] = useState<number | null>(
    null
  );
  const tableRef = useRef<TableRef>(null);

  // Fetch ledger data
  const { data: ledgerResponse, isLoading } = useGetLedgerByEmployeeCode({
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
    if (!ledgerResponse?.ledgerEntries) {
      return [];
    }

    return ledgerResponse.ledgerEntries.map((entry: LedgerEntryInterface) => {
      // Format date
      const date = entry.date
        ? new Date(entry.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "";

      // Initialize columns
      let salary: number | null = null;
      let loan: number | null = null;
      let challan: number | null = null;
      let deduction: number | null = null;

      // Map ledger entry to table columns based on type and amountType
      if (entry.type === "SALARY" && entry.amountType === "CREDIT") {
        salary = entry.amount;
      } else if (entry.type === "LOAN") {
        if (entry.amountType === "DEBIT") {
          // Loan taken
          loan = entry.amount;
        } else if (entry.amountType === "CREDIT") {
          // Loan return
          deduction = entry.amount;
        }
      } else if (entry.type === "CHALLAN") {
        if (entry.amountType === "CREDIT") {
          // Challan
          challan = entry.amount;
        } else if (entry.amountType === "DEBIT") {
          // Challan return
          deduction = entry.amount;
        }
      }

      return {
        id: entry.id,
        date,
        description: entry.description,
        salary,
        loan,
        challan,
        deduction,
        balance: entry.balance,
      } as LedgerEntry;
    });
  }, [ledgerResponse?.ledgerEntries]);

  // Get employee info
  const employee = ledgerResponse?.employee;
  const employeeName = employee?.nameEn || "";
  const employeeDesignation =
    employee?.designationId && designationsMap.has(employee.designationId)
      ? designationsMap.get(employee.designationId)!.nameEn
      : "";
  const idCardNumber = employee?.idCardNo || "";

  // Handle search
  const handleSearch = useCallback(() => {
    const code = parseInt(employeeCode, 10);
    if (isNaN(code) || code <= 0) {
      toastService.showError("Error", "Please enter a valid employee code");
      return;
    }
    setSearchEmployeeCode(code);
  }, [employeeCode]);

  // Print handler
  const handlePrint = useCallback(() => {
    tableRef.current?.print();
  }, []);

  // Calculate totals
  const totals = useMemo(() => {
    return ledgerData.reduce(
      (
        acc: {
          salary: number;
          loan: number;
          challan: number;
          deduction: number;
        },
        entry: LedgerEntry
      ) => {
        acc.salary += entry.salary || 0;
        acc.loan += entry.loan || 0;
        acc.challan += entry.challan || 0;
        acc.deduction += entry.deduction || 0;
        return acc;
      },
      { salary: 0, loan: 0, challan: 0, deduction: 0 }
    );
  }, [ledgerData]);

  const tableCommonProps = {
    sortable: false,
    filterable: false,
    style: { minWidth: 120 },
  };

  const columns = useMemo(
    (): TableColumn<LedgerEntry>[] => [
      {
        field: "id",
        header: "#",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 50, width: 50 },
        body: (rowData: LedgerEntry) => (
          <span className="text-sm font-medium">{rowData.id}</span>
        ),
        footer: () => <span></span>,
      },
      {
        field: "date",
        header: "Date",
        ...tableCommonProps,
        style: { minWidth: 140 },
        body: (rowData: LedgerEntry) => (
          <span className="text-sm">{rowData.date || ""}</span>
        ),
        footer: () => <span></span>,
      },
      {
        field: "description",
        header: "Description",
        ...tableCommonProps,
        style: { minWidth: 200, width: "100%" },
        body: (rowData: LedgerEntry) => (
          <span className="text-sm">{rowData.description}</span>
        ),
        footer: () => <span className="text-sm font-semibold">Total:</span>,
      },
      {
        field: "salary",
        header: "Salary",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 130 },
        body: (rowData: LedgerEntry) => (
          <span className="text-sm font-semibold">
            {rowData.salary !== null ? rowData.salary.toLocaleString() : ""}
          </span>
        ),
        footer: () => (
          <span className="text-sm font-semibold">
            {totals.salary > 0 ? totals.salary.toLocaleString() : ""}
          </span>
        ),
      },
      {
        field: "loan",
        header: "Loan",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 130 },
        body: (rowData: LedgerEntry) => (
          <span className="text-sm font-semibold">
            {rowData.loan !== null ? rowData.loan.toLocaleString() : ""}
          </span>
        ),
        footer: () => (
          <span className="text-sm font-semibold">
            {totals.loan > 0 ? totals.loan.toLocaleString() : "0"}
          </span>
        ),
      },
      {
        field: "challan",
        header: "Challan",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 130 },
        body: (rowData: LedgerEntry) => (
          <span className="text-sm font-semibold">
            {rowData.challan !== null ? rowData.challan.toLocaleString() : ""}
          </span>
        ),
        footer: () => (
          <span className="text-sm font-semibold">
            {totals.challan > 0 ? totals.challan.toLocaleString() : "0"}
          </span>
        ),
      },
      {
        field: "deduction",
        header: "Deduction",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 130 },
        body: (rowData: LedgerEntry) => (
          <span className="text-sm font-semibold">
            {rowData.deduction !== null
              ? rowData.deduction.toLocaleString()
              : ""}
          </span>
        ),
        footer: () => (
          <span className="text-sm font-semibold">
            {totals.deduction > 0 ? totals.deduction.toLocaleString() : "0"}
          </span>
        ),
      },
      {
        field: "balance",
        header: "Balance",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 130 },
        body: (rowData: LedgerEntry) => (
          <span className="text-sm font-semibold">
            {rowData.balance.toLocaleString()}
          </span>
        ),
        footer: () => <span></span>,
      },
    ],
    [totals]
  );

  const renderHeader = useCallback(() => {
    return (
      <div className="flex flex-col lg:flex-row justify-between bg-[#F5E6E8] items-center gap-3 flex-1 w-full">
        <div className="flex flex-1 flex-col lg:flex-row items-center gap-3 w-full">
          <div className="w-full lg:w-auto">
            <NumberInput
              useGrouping={false}
              disabled={isLoading}
              placeholder="Employee Code"
              className="w-full lg:w-60 h-10.5!"
              onChange={(e: InputNumberChangeEvent) =>
                setEmployeeCode(e.value?.toString() || "")
              }
              value={employeeCode ? parseInt(employeeCode) : undefined}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  e?.preventDefault?.();
                  handleSearch();
                }
              }}
            />
          </div>
          <div className="w-full lg:w-28">
            <Button
              size="small"
              className="w-full xl:w-28 2xl:w-32 h-10!"
              label="Search"
              onClick={handleSearch}
              loading={isLoading}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    );
  }, [employeeCode, isLoading, handleSearch]);

  const renderEmployeeInfo = useCallback(
    (isPrinting: boolean) => {
      if (!employee) {
        return (
          <div className="text-sm text-gray-500">
            {searchEmployeeCode
              ? "Employee not found"
              : "Enter employee code and click Search"}
          </div>
        );
      }

      return (
        <div
          className={classNames("flex flex-1 gap-3 justify-between", {
            "flex-row items-center": isPrinting,
            "flex-col sm:flex-row items-start sm:items-center": !isPrinting,
          })}
        >
          <div
            className={classNames("flex flex-1 gap-x-2 gap-y-1", {
              "flex-row items-center": isPrinting,
              "flex-col lg:flex-row items-start lg:items-center": !isPrinting,
            })}
          >
            <div className="flex gap-x-2">
              <span className="font-semibold">{employee.employeeCode}</span>
              <span className="text-gray-400 font-semibold">-</span>
              <span className="font-semibold">{employeeName}</span>
            </div>
            {idCardNumber && (
              <div className="flex gap-x-2 items-center">
                <span
                  className={classNames("text-gray-400", {
                    "hidden lg:block": !isPrinting,
                    inline: isPrinting,
                  })}
                >
                  |
                </span>
                <div className="flex gap-x-2">
                  <span className="text-xs text-gray-600">ID Card:</span>
                  <span className="text-xs font-medium ">{idCardNumber}</span>
                </div>
              </div>
            )}
          </div>
          {employeeDesignation && (
            <div
              className={classNames("flex justify-end", {
                "w-auto": isPrinting,
                "w-full sm:w-auto": !isPrinting,
              })}
            >
              <span className="font-bold text-right">
                {employeeDesignation}
              </span>
            </div>
          )}
        </div>
      );
    },
    [
      employee,
      employeeName,
      employeeDesignation,
      idCardNumber,
      searchEmployeeCode,
    ]
  );

  return (
    <div className="flex h-full flex-col">
      <TitleHeader
        showBack={false}
        title="EMPLOYEE LEDGER"
        icon={<i className="fa-light fa-book-open-lines text-xl!" />}
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
      <div className="bg-[#F5E6E8] px-6 py-4">{renderHeader()}</div>
      <div className="flex flex-1 flex-col gap-4 px-6 pt-4 pb-6 bg-theme-primary-light min-h-0">
        {/* Employee Info Section */}
        <div className="bg-white rounded-xl py-4 px-4">
          {renderEmployeeInfo(false)}
        </div>

        {/* Table Section */}
        <div className="bg-white h-full rounded-xl overflow-hidden min-h-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-full min-h-[400px]">
              <ProgressSpinner style={{ width: "50px", height: "50px" }} />
            </div>
          ) : (
            <Table
              ref={tableRef}
              dataKey="id"
              data={ledgerData}
              columns={columns}
              pagination={false}
              globalSearch={false}
              emptyMessage={
                searchEmployeeCode
                  ? "No ledger data found for this employee."
                  : "Enter employee code and click Search to view ledger."
              }
              scrollable
              scrollHeight="80vh"
              showGridlines
              printTitle="EMPLOYEE LEDGER"
              tableClassName="report-table"
              printHeaderContent={renderEmployeeInfo(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LedgerPage;
