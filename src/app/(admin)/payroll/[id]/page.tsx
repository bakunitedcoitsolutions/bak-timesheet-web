"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  Button,
  Dropdown,
  TitleHeader,
  ExportOptions,
  CustomHeaderProps,
  Input,
  NumberInput,
  Table,
  TableColumn,
  TableRef,
  Badge,
} from "@/components";
import {
  designationOptions,
  projects,
  initialPayrollDetailData,
  PayrollDetailEntry,
} from "@/utils/dummy";

const statusOptions = [
  { label: "Pending", value: "Pending" },
  { label: "Posted", value: "Posted" },
];

const tableCommonProps = {
  sortable: false,
  filterable: true,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
  style: { minWidth: 120 },
  headerClassName: "text-sm! font-semibold",
};

const PayrollDetailPage = () => {
  const router = useRouter();
  const { id: periodParam } = useParams();
  const [selectedDesignation, setSelectedDesignation] = useState<any>("0");
  const [payrollData, setPayrollData] = useState<PayrollDetailEntry[]>(
    initialPayrollDetailData
  );
  const [searchValue, setSearchValue] = useState<string>("");
  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
    return "";
  };

  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const tableRef = useRef<TableRef>(null);

  // Project options (excluding "All Projects")
  const projectOptions = projects.filter((p) => p.value !== "0");

  const updatePayrollEntry = (
    id: number,
    field: keyof PayrollDetailEntry,
    value: any
  ) => {
    setPayrollData((prev) =>
      prev.map((entry) => {
        if (entry.id === id) {
          return { ...entry, [field]: value };
        }
        return entry;
      })
    );
  };

  const columns = (): TableColumn<PayrollDetailEntry>[] => [
    {
      field: "empCode",
      header: "Emp. Code",
      ...tableCommonProps,
      style: { minWidth: 120, zIndex: 10 },
      frozen: true,
      body: (rowData: PayrollDetailEntry) => (
        <span className="text-sm font-semibold!">{rowData.empCode}</span>
      ),
    },
    {
      field: "name",
      header: "Name",
      ...tableCommonProps,
      style: { minWidth: 300, zIndex: 10 },
      frozen: true,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex items-start gap-2">
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-medium leading-tight">
              {rowData.name}
            </span>
          </div>
          <div className="flex items-center justify-center gap-x-1">
            <Badge text="C" />
            <Badge text="F" />
          </div>
        </div>
      ),
    },
    {
      field: "arabicName",
      header: "Name (Ar)",
      ...tableCommonProps,
      style: { minWidth: 150 },
      body: (rowData: PayrollDetailEntry) => (
        <div className="w-full flex justify-end">
          <span className="text-[10px]! text-right font-semibold!">
            {rowData.arabicName}
          </span>
        </div>
      ),
    },
    {
      field: "designation",
      header: "Designation",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <span className="text-sm font-medium!">{rowData.designation}</span>
      ),
    },
    {
      field: "idNumber",
      header: "ID Number",
      ...tableCommonProps,
      style: { minWidth: 150 },
      body: (rowData: PayrollDetailEntry) => (
        <span className="text-sm font-medium!">{rowData.idNumber}</span>
      ),
    },
    {
      field: "nationality",
      header: "Nationality",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <span className="text-sm font-medium!">{rowData.nationality}</span>
      ),
    },
    {
      field: "professionInId",
      header: "Profession",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="w-full flex justify-end">
          <span className="text-[10px]! text-right font-semibold!">
            {rowData.professionInId}
          </span>
        </div>
      ),
    },
    {
      field: "gosiCity",
      header: "GOSI City",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <span className="text-sm font-medium!">{rowData.gosiCity}</span>
      ),
    },
    {
      field: "passportNumber",
      header: "Passport No.",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <span className="text-sm font-medium!">{rowData.passportNumber}</span>
      ),
    },
    {
      field: "passportExpiryDate",
      header: "Passport Exp.",
      ...tableCommonProps,
      style: { minWidth: 130 },
      body: (rowData: PayrollDetailEntry) => (
        <span className="text-sm font-medium!">
          {rowData.passportExpiryDate}
        </span>
      ),
    },
    {
      field: "joiningDate",
      header: "Joining",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <span className="text-sm font-medium!">
          {rowData.joiningDate || "-"}
        </span>
      ),
    },
    {
      field: "iban",
      header: "IBAN",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <span className="text-sm font-medium!">{rowData.iban}</span>
      ),
    },
    {
      field: "bankCode",
      header: "Bank Code",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <span className="text-sm font-medium!">{rowData.bankCode}</span>
      ),
    },
    {
      field: "gosiSalary",
      header: "GOSI Salary",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <span className="text-sm font-medium!">
          {rowData.gosiSalary.toLocaleString()}
        </span>
      ),
    },
    {
      field: "workDays",
      header: "Work Days",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <span className="text-sm font-medium!">
          {rowData.workDays.toLocaleString()}
        </span>
      ),
    },
    {
      field: "overTime",
      header: "Over Time",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <NumberInput
            useGrouping={false}
            disabled={rowData.isLocked}
            value={rowData.overTime}
            onValueChange={(e) =>
              updatePayrollEntry(rowData.id, "overTime", e.value || 0)
            }
            className="timesheet-number-input"
            min={0}
            showButtons={false}
          />
        </div>
      ),
    },
    {
      field: "totalHours",
      header: "Total Hours",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <NumberInput
            useGrouping={false}
            disabled={rowData.isLocked}
            value={rowData.totalHours}
            onValueChange={(e) =>
              updatePayrollEntry(rowData.id, "totalHours", e.value || 0)
            }
            className="timesheet-number-input"
            min={0}
            showButtons={false}
          />
        </div>
      ),
    },
    {
      field: "hourlyRate",
      header: "Hourly Rate",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <NumberInput
            useGrouping={false}
            disabled={rowData.isLocked}
            value={rowData.hourlyRate}
            onValueChange={(e) =>
              updatePayrollEntry(rowData.id, "hourlyRate", e.value || 0)
            }
            className="timesheet-number-input"
            min={0}
            showButtons={false}
          />
        </div>
      ),
    },
    {
      field: "allowance",
      header: "Allowance",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <NumberInput
            useGrouping={false}
            disabled={rowData.isLocked}
            value={rowData.allowance}
            onValueChange={(e) =>
              updatePayrollEntry(rowData.id, "allowance", e.value || 0)
            }
            className="timesheet-number-input"
            min={0}
            showButtons={false}
          />
        </div>
      ),
    },
    {
      field: "totalSalary",
      header: "Total Salary",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <NumberInput
            useGrouping={false}
            disabled={rowData.isLocked}
            value={rowData.totalSalary}
            onValueChange={(e) =>
              updatePayrollEntry(rowData.id, "totalSalary", e.value || 0)
            }
            className="timesheet-number-input"
            min={0}
            showButtons={false}
          />
        </div>
      ),
    },
    {
      field: "previousAdvance",
      header: "Prev. Adv.",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <NumberInput
            useGrouping={false}
            disabled={rowData.isLocked}
            value={rowData.previousAdvance}
            onValueChange={(e) =>
              updatePayrollEntry(rowData.id, "previousAdvance", e.value || 0)
            }
            className="timesheet-number-input"
            min={0}
            showButtons={false}
          />
        </div>
      ),
    },
    {
      field: "currentAdvance",
      header: "Curr. Adv.",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <NumberInput
            useGrouping={false}
            disabled={rowData.isLocked}
            value={rowData.currentAdvance}
            onValueChange={(e) =>
              updatePayrollEntry(rowData.id, "currentAdvance", e.value || 0)
            }
            className="timesheet-number-input"
            min={0}
            showButtons={false}
          />
        </div>
      ),
    },
    {
      field: "deduction",
      header: "Deduction",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <NumberInput
            useGrouping={false}
            disabled={rowData.isLocked}
            value={rowData.deduction}
            onValueChange={(e) =>
              updatePayrollEntry(rowData.id, "deduction", e.value || 0)
            }
            className="timesheet-number-input"
            min={0}
            showButtons={false}
          />
        </div>
      ),
    },
    {
      field: "netLoan",
      header: "Net Loan",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <NumberInput
            useGrouping={false}
            disabled={rowData.isLocked}
            value={rowData.netLoan}
            onValueChange={(e) =>
              updatePayrollEntry(rowData.id, "netLoan", e.value || 0)
            }
            className="timesheet-number-input"
            showButtons={false}
          />
        </div>
      ),
    },
    {
      field: "previousTraffic",
      header: "Prev. Traff.",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <NumberInput
            useGrouping={false}
            disabled={rowData.isLocked}
            value={rowData.previousTraffic}
            onValueChange={(e) =>
              updatePayrollEntry(rowData.id, "previousTraffic", e.value || 0)
            }
            className="timesheet-number-input"
            min={0}
            showButtons={false}
          />
        </div>
      ),
    },
    {
      field: "currentTraffic",
      header: "Curr. Traff.",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <NumberInput
            useGrouping={false}
            disabled={rowData.isLocked}
            value={rowData.currentTraffic}
            onValueChange={(e) =>
              updatePayrollEntry(rowData.id, "currentTraffic", e.value || 0)
            }
            className="timesheet-number-input"
            min={0}
            showButtons={false}
          />
        </div>
      ),
    },
    {
      field: "trafficDeduction",
      header: "Traff. Ded.",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <NumberInput
            useGrouping={false}
            disabled={rowData.isLocked}
            value={rowData.trafficDeduction}
            onValueChange={(e) =>
              updatePayrollEntry(rowData.id, "trafficDeduction", e.value || 0)
            }
            className="timesheet-number-input"
            min={0}
            showButtons={false}
          />
        </div>
      ),
    },
    {
      field: "netTraffic",
      header: "Net Traff.",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <NumberInput
            useGrouping={false}
            disabled={rowData.isLocked}
            value={rowData.netTraffic}
            onValueChange={(e) =>
              updatePayrollEntry(rowData.id, "netTraffic", e.value || 0)
            }
            className="timesheet-number-input"
            showButtons={false}
          />
        </div>
      ),
    },
    {
      field: "netSalaryPayable",
      header: "Net Salary",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <NumberInput
            useGrouping={false}
            disabled={rowData.isLocked}
            value={rowData.netSalaryPayable}
            onValueChange={(e) =>
              updatePayrollEntry(rowData.id, "netSalaryPayable", e.value || 0)
            }
            className="timesheet-number-input"
            min={0}
            showButtons={false}
          />
        </div>
      ),
    },
    {
      field: "cardSalary",
      header: "Card Salary",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <NumberInput
            useGrouping={false}
            disabled={rowData.isLocked}
            value={rowData.cardSalary}
            onValueChange={(e) =>
              updatePayrollEntry(rowData.id, "cardSalary", e.value || 0)
            }
            className="timesheet-number-input"
            min={0}
            showButtons={false}
          />
        </div>
      ),
    },
    {
      field: "cashSalary",
      header: "Cash Salary",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <NumberInput
            useGrouping={false}
            disabled={rowData.isLocked}
            value={rowData.cashSalary}
            onValueChange={(e) =>
              updatePayrollEntry(rowData.id, "cashSalary", e.value || 0)
            }
            className="timesheet-number-input"
            min={0}
            showButtons={false}
          />
        </div>
      ),
    },
    {
      field: "remarks",
      header: "Remarks",
      ...tableCommonProps,
      style: { minWidth: 200 },
      body: (rowData: PayrollDetailEntry) => (
        <Input
          small
          disabled={rowData.isLocked}
          placeholder="Add remarks"
          value={rowData.remarks}
          onChange={(e) =>
            updatePayrollEntry(rowData.id, "remarks", e.target.value)
          }
          className="w-full h-10!"
        />
      ),
    },
    {
      field: "project",
      header: "Salary Method",
      ...tableCommonProps,
      style: { minWidth: 200, width: 200 },
      body: (rowData: PayrollDetailEntry) => (
        <Dropdown
          small
          filter
          options={projectOptions}
          disabled={rowData.isLocked}
          className="w-[200px]! h-10!"
          placeholder="Choose Method"
          selectedItem={rowData.project}
          setSelectedItem={(value) =>
            updatePayrollEntry(rowData.id, "project", value)
          }
        />
      ),
    },
    {
      field: "status",
      header: "Status",
      ...tableCommonProps,
      style: { minWidth: 150, width: 150 },
      body: (rowData: PayrollDetailEntry) => (
        <Dropdown
          small
          options={statusOptions}
          disabled={rowData.isLocked}
          className="w-[150px]! h-10!"
          placeholder="Pending"
          selectedItem={rowData.status}
          setSelectedItem={(value) =>
            updatePayrollEntry(rowData.id, "status", value)
          }
        />
      ),
    },
  ];

  const renderHeader = ({ exportCSV, exportExcel }: CustomHeaderProps) => {
    return (
      <div className="flex flex-col lg:flex-row justify-between bg-theme-primary-light items-center gap-3 flex-1 w-full">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="w-full lg:w-auto">
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full lg:w-40 h-10.5! date-input"
              aria-label="Select month & year"
            />
          </div>
          <div className="w-full lg:w-auto">
            <Dropdown
              small
              filter
              options={designationOptions}
              className="w-full lg:w-48 h-10.5!"
              placeholder="Select Designation"
              selectedItem={selectedDesignation}
              setSelectedItem={setSelectedDesignation}
            />
          </div>
          <div className="w-full lg:w-auto hidden lg:block">
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
              className="w-full lg:w-auto h-10!"
              label="Search"
            />
          </div>
          <div className="w-full lg:w-auto">
            <ExportOptions
              exportCSV={exportCSV || (() => {})}
              exportExcel={exportExcel || (() => {})}
              buttonClassName="w-full lg:w-auto h-9!"
            />
          </div>
          <div className="w-full lg:w-auto">
            <Button
              size="small"
              className="w-full bg-primary-light! text-primary! border-primary-light! lg:w-28 h-10!"
              label="Save"
            />
          </div>
        </div>
      </div>
    );
  };

  const exportCSV = () => {
    tableRef.current?.exportCSV();
  };

  const exportExcel = () => {
    tableRef.current?.exportExcel();
  };

  // Format period from URL param (e.g., "12-2025" -> "DEC 2025")
  const formatPeriod = (period: string | string[] | undefined) => {
    if (!period || typeof period !== "string") return "PAYROLL";
    const [month, year] = period.split("-");
    const monthNames = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    const monthName = monthNames[parseInt(month) - 1] || month;
    return `${monthName} ${year}`;
  };

  return (
    <div className="flex flex-col">
      <TitleHeader
        title={`PAYROLL DETAILS OF ${formatPeriod(periodParam)}`}
        icon={<i className="fa-light fa-calendar text-xl!" />}
        value={searchValue}
        onChange={(e) => {
          const value = e.target.value;
          setSearchValue(value);
        }}
      />
      <div className="flex flex-col gap-4 px-6 py-6 bg-theme-primary-light">
        {renderHeader({
          exportCSV,
          exportExcel,
        })}
        <div className="bg-white rounded-xl overflow-hidden">
          <Table
            ref={tableRef}
            dataKey="id"
            extraSmall
            data={payrollData}
            columns={columns()}
            pagination={true}
            rowsPerPageOptions={[10, 25, 50, 100]}
            rows={10}
            globalSearch={false}
            emptyMessage="No payroll data found."
            scrollable
            scrollHeight="flex"
            stripedRows
          />
        </div>
      </div>
    </div>
  );
};

export default PayrollDetailPage;
