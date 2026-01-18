"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { classNames } from "primereact/utils";
import { Checkbox } from "primereact/checkbox";

import {
  Table,
  Input,
  Button,
  Dropdown,
  TableRef,
  TitleHeader,
  TableColumn,
  MultiSelect,
} from "@/components";
import {
  LedgerEntry,
  designationsData,
  initialLedgerData,
  payrollSectionsData,
} from "@/utils/dummy";
import GroupDropdown from "@/components/common/group-dropdown";

const EmployeesReportPage = () => {
  const router = useRouter();
  const [ledgerData] = useState<LedgerEntry[]>(initialLedgerData);
  const [employeeCode, setEmployeeCode] = useState<string>("20002");
  const [employeeName, setEmployeeName] = useState<string>(
    "MAHMOOD NASR ABDUL SALAM"
  );
  const [employeeDesignation, setEmployeeDesignation] =
    useState<string>("Engineer");
  const [idCardNumber, setIdCardNumber] = useState<string>("2526262361");
  const tableRef = useRef<TableRef>(null);

  // Filter states
  const [employeeCodes, setEmployeeCodes] = useState<string>("");
  const [selectedDesignation, setSelectedDesignation] = useState<any>("all");
  const [selectedColumn, setSelectedColumn] = useState<any>([]);
  const [zeroRate, setZeroRate] = useState<boolean>(false);

  // Transform designations data to dropdown options
  const designationOptions = [
    { label: "All Designations", value: null },
    ...designationsData
      .filter((d) => d.isActive)
      .map((d) => ({
        label: d.nameEn,
        value: d.id,
      })),
  ];

  // Transform payroll sections data to dropdown options
  const payrollSectionOptions = [
    { label: "All Payroll Sections", value: null },
    ...payrollSectionsData
      .filter((p) => p.isActive)
      .map((p) => ({
        label: p.nameEn,
        value: p.id,
      })),
  ];

  const columnOptions = [
    { label: "Select Column", value: null },
    { label: "Name", value: "name" },
    { label: "Designation", value: "designation" },
    { label: "Salary", value: "salary" },
  ];

  // Print handler
  const handlePrint = () => {
    tableRef.current?.print();
  };

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

  const renderHeader = () => {
    return (
      <div className="bg-[#F5E6E8] w-full flex flex-col xl:flex-row justify-between gap-x-10 gap-y-4">
        <div className="grid flex-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          <div className="w-full">
            <Input
              small
              placeholder="Employee Codes"
              value={employeeCodes}
              onChange={(e) => setEmployeeCodes(e.target.value)}
              className="w-full h-10!"
            />
          </div>
          <div className="w-full lg:col-span-2">
            <GroupDropdown
              placeholder="Select Section"
              className="w-full h-10.5!"
              selectedItem={selectedDesignation}
              setSelectedItem={setSelectedDesignation}
            />
          </div>
          <div className="w-full lg:col-span-2">
            <MultiSelect
              small
              options={columnOptions}
              className="w-full h-10!"
              placeholder="Select Columns"
              selectedItem={selectedColumn}
              setSelectedItem={setSelectedColumn}
            />
          </div>
        </div>
        <div className="flex items-center gap-5 justify-between xl:justify-end">
          <div className="w-[100px]">
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="zeroRate"
                checked={zeroRate}
                onChange={(e) => setZeroRate(e.checked ?? false)}
              />
              <label htmlFor="zeroRate" className="text-sm cursor-pointer">
                Zero Rate
              </label>
            </div>
          </div>
          <Button size="small" className="w-32 h-10!" label="Search" />
        </div>
      </div>
    );
  };

  const renderEmployeeInfo = (isPrinting: boolean) => {
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
            <span className="font-semibold">{employeeCode}</span>
            <span className="text-gray-400 font-semibold">-</span>
            <span className="font-semibold">{employeeName}</span>
          </div>
          <span
            className={classNames("text-gray-400", {
              "hidden lg:block": !isPrinting,
              block: isPrinting,
            })}
          >
            |
          </span>
          <div className="flex gap-x-2">
            <span className="text-xs text-gray-600">ID Card:</span>
            <span className="text-xs font-medium ">{idCardNumber}</span>
          </div>
        </div>
        <div
          className={classNames("flex justify-end", {
            "w-auto": isPrinting,
            "w-full sm:w-auto": !isPrinting,
          })}
        >
          <span className="font-bold text-right">{employeeDesignation}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <TitleHeader
        title="EMPLOYEES REPORT"
        onBack={() => router.replace("/reports")}
        icon={<i className="fa-light fa-user-group text-xl!" />}
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
      <div className="flex flex-1 flex-col gap-4 px-6 pt-4 pb-6 bg-white min-h-0">
        <div className="flex flex-col gap-2">
          {/* Employee Info Section */}
          <div className="bg-table-header-footer py-4 px-4">
            {renderEmployeeInfo(false)}
          </div>

          {/* Table Section */}
          <div className="bg-white h-full overflow-hidden min-h-0">
            <Table
              ref={tableRef}
              dataKey="id"
              data={ledgerData}
              columns={columns()}
              pagination={false}
              globalSearch={false}
              emptyMessage="No ledger data found."
              showGridlines
              printTitle="EMPLOYEE LEDGER"
              tableClassName="report-table"
              printHeaderContent={renderEmployeeInfo(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeesReportPage;
