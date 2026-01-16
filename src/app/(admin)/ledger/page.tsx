"use client";
import { useRef, useState } from "react";
import {
  Table,
  Button,
  TableRef,
  TableColumn,
  NumberInput,
  TitleHeader,
  CustomHeaderProps,
} from "@/components";
import { LedgerEntry, initialLedgerData } from "@/utils/dummy";

const LedgerPage = () => {
  const [ledgerData] = useState<LedgerEntry[]>(initialLedgerData);
  const [employeeCode, setEmployeeCode] = useState<string>("20002");
  const [employeeName, setEmployeeName] = useState<string>(
    "MAHMOOD NASR ABDUL SALAM"
  );
  const [employeeDesignation, setEmployeeDesignation] =
    useState<string>("Engineer");
  const [idCardNumber, setIdCardNumber] = useState<string>("2526262361");
  const tableRef = useRef<TableRef>(null);

  // Calculate totals
  const totals = ledgerData.reduce(
    (acc, entry) => {
      acc.salary += entry.salary || 0;
      acc.loan += entry.loan || 0;
      acc.challan += entry.challan || 0;
      acc.deduction += entry.deduction || 0;
      return acc;
    },
    { salary: 0, loan: 0, challan: 0, deduction: 0 }
  );

  const tableCommonProps = {
    sortable: false,
    filterable: false,
    style: { minWidth: 120 },
  };

  const columns = (): TableColumn<LedgerEntry>[] => [
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
          {rowData.deduction !== null ? rowData.deduction.toLocaleString() : ""}
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
  ];

  const renderHeader = ({ exportCSV, exportExcel }: CustomHeaderProps) => {
    return (
      <div className="flex flex-col lg:flex-row justify-between bg-[#F5E6E8] items-center gap-3 flex-1 w-full">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="w-full lg:w-auto">
            <NumberInput
              useGrouping={false}
              placeholder="Employee Code"
              value={parseInt(employeeCode) || undefined}
              onValueChange={(e) => setEmployeeCode(e.value?.toString() || "")}
              className="w-full lg:w-60 h-10.5!"
            />
          </div>
          <div className="w-full lg:w-28 hidden lg:block">
            <Button
              size="small"
              className="w-full xl:w-28 2xl:w-32 h-10!"
              label="Search"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="block lg:hidden w-full lg:w-auto">
            <Button
              size="small"
              className="w-full lg:w-28 h-10!"
              label="Search"
            />
          </div>
          <div className="w-full lg:w-auto">
            <Button
              size="small"
              label="Print"
              icon="pi pi-print"
              variant="outlined"
              className="w-full lg:w-28 h-10! bg-white!"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <TitleHeader
        title="EMPLOYEE LEDGER"
        icon={<i className="fa-light fa-book-open-lines text-xl!" />}
        hideInput={true}
      />
      <div className="bg-[#F5E6E8] px-6 py-4">
        {renderHeader({
          exportCSV: () => tableRef.current?.exportCSV(),
          exportExcel: () => tableRef.current?.exportExcel(),
        })}
      </div>
      <div className="flex flex-1 flex-col gap-4 px-6 pt-4 pb-6 bg-theme-primary-light min-h-0">
        {/* Employee Info Section */}
        <div className="bg-white rounded-xl py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold ">{employeeCode}</span>
              <span className="text-gray-400">-</span>
              <span className="font-semibold ">{employeeName}</span>
              <span className="text-gray-400">|</span>
              <span className="text-xs text-gray-600">ID Card:</span>
              <span className="text-xs font-medium ">{idCardNumber}</span>
            </div>
            <div>
              <span className="font-semibold ">{employeeDesignation}</span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white h-full rounded-xl overflow-hidden min-h-0">
          <Table
            ref={tableRef}
            dataKey="id"
            data={ledgerData}
            columns={columns()}
            pagination={false}
            globalSearch={false}
            emptyMessage="No ledger data found."
            scrollable
            scrollHeight="80vh"
            showGridlines
          />
        </div>
      </div>
    </div>
  );
};

export default LedgerPage;
