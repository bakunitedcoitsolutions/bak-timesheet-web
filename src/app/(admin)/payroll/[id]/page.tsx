"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  Input,
  Table,
  Badge,
  Button,
  Dropdown,
  TableRef,
  TitleHeader,
  TableColumn,
  NumberInput,
  ExportOptions,
  CustomHeaderProps,
} from "@/components";
import { PayrollDetailEntry } from "@/lib/db/services/payroll-summary/mappers";
import {
  useGetPayrollDetails,
  useGetPayrollDate,
} from "@/lib/db/services/payroll-summary";
import { useDebounce } from "@/hooks";
import GroupDropdown from "@/components/common/group-dropdown";
import { parseGroupDropdownFilter, formatPayrollPeriod } from "@/utils/helpers";
import { useGlobalData } from "@/context/GlobalDataContext";

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
  const payrollId = Number(periodParam);

  const [selectedFilter, setSelectedFilter] = useState<string | number | null>(
    "all"
  );
  const [payrollData, setPayrollData] = useState<PayrollDetailEntry[]>([]); // Start empty
  const [searchValue, setSearchValue] = useState<string>("");

  // Parse filter parameters from GroupDropdown selection
  const filterParams = parseGroupDropdownFilter(selectedFilter);
  const debouncedSearch = useDebounce(searchValue, 500);

  const { data: globalData } = useGlobalData();

  const statusOptions = globalData.payrollStatuses.map((s) => ({
    label: s.nameEn,
    value: s.id,
  }));

  // Payment Method options
  const paymentMethodOptions = globalData.paymentMethods.map((p) => ({
    label: p.nameEn,
    value: p.id.toString(),
  }));

  const { data, isLoading } = useGetPayrollDetails({
    payrollId: isNaN(payrollId) ? 0 : payrollId,
    search: debouncedSearch || undefined,
    designationId: filterParams.designationId,
    payrollSectionId: filterParams.payrollSectionId,
  });

  // Map backend data to table format
  useEffect(() => {
    if (data?.details) {
      setPayrollData(data.details);
    }
  }, [data]);

  const tableRef = useRef<TableRef>(null);

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
      style: { minWidth: 120 },
      frozen: true,
      body: (rowData: PayrollDetailEntry) => (
        <span className="text-sm font-semibold!">{rowData.empCode}</span>
      ),
    },
    {
      field: "name",
      header: "Name",
      ...tableCommonProps,
      style: { minWidth: 300 },
      frozen: true,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex items-start gap-2 min-w-0">
          <div className="flex flex-1 flex-col gap-1 min-w-0">
            <span className="text-sm font-medium leading-tight wrap-break-word">
              {rowData.name}
            </span>
          </div>
          <div className="flex items-center justify-center gap-x-1 shrink-0">
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
          <span className="text-xl! text-right font-medium! font-arabic">
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
        <div className="flex justify-center">
          <span className="text-sm font-medium!">{rowData.designation}</span>
        </div>
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
        <div className="flex justify-center">
          <span className="text-sm font-medium!">{rowData.nationality}</span>
        </div>
      ),
    },
    {
      field: "professionInId",
      header: "Profession",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="w-full flex justify-end">
          <span className="text-xl! text-right font-medium! font-arabic">
            {rowData.professionInId}
          </span>
        </div>
      ),
    },
    {
      field: "passportNumber",
      header: "Passport No.",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <span className="text-sm font-medium!">{rowData.passportNumber}</span>
        </div>
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
      field: "workDays",
      header: "Work Days",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <span className="text-[15px] font-semibold!">
            {rowData.workDays.toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      field: "overTime",
      header: "Over Time",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <span className="text-[15px] font-semibold!">
            {rowData.overTime.toString()}
          </span>
        </div>
      ),
    },
    {
      field: "totalHours",
      header: "Total Hours",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <span className="text-[15px] font-semibold!">
            {rowData.totalHours.toString()}
          </span>
        </div>
      ),
    },
    {
      field: "hourlyRate",
      header: "Hourly Rate",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <span className="text-[15px] font-semibold!">
            {rowData.hourlyRate.toString()}
          </span>
        </div>
      ),
    },
    {
      field: "allowance",
      header: "Allowance",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <span className="text-[15px] font-semibold!">
            {rowData.allowance.toString()}
          </span>
        </div>
      ),
    },
    {
      field: "totalSalary",
      header: "Total Salary",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <span className="text-[15px] font-semibold!">
            {rowData.totalSalary.toString()}
          </span>
        </div>
      ),
    },
    {
      field: "previousAdvance",
      header: "Prev. Adv.",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <span className="text-[15px] font-semibold!">
            {rowData.previousAdvance.toString()}
          </span>
        </div>
      ),
    },
    {
      field: "currentAdvance",
      header: "Curr. Adv.",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <span className="text-[15px] font-semibold!">
            {rowData.currentAdvance.toString()}
          </span>
        </div>
      ),
    },
    {
      field: "deduction",
      header: "Loan Ded.",
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
            className="timesheet-number-input payroll-input"
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
          <span className="text-[15px] font-semibold!">
            {rowData.netLoan.toString()}
          </span>
        </div>
      ),
    },
    {
      field: "previousTraffic",
      header: "Prev. Traff.",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <span className="text-[15px] font-semibold!">
            {rowData.previousTraffic.toString()}
          </span>
        </div>
      ),
    },
    {
      field: "currentTraffic",
      header: "Curr. Traff.",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <span className="text-[15px] font-semibold!">
            {rowData.currentTraffic.toString()}
          </span>
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
            className="timesheet-number-input payroll-input"
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
          <span className="text-[15px] font-semibold!">
            {rowData.netTraffic.toString()}
          </span>
        </div>
      ),
    },
    {
      field: "netSalaryPayable",
      header: "Net Salary",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <span className="text-[15px] font-semibold!">
            {rowData.netSalaryPayable.toString()}
          </span>
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
            className="timesheet-number-input payroll-input"
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
            className="timesheet-number-input payroll-input"
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
          className="w-full h-10! payroll-input"
        />
      ),
    },
    {
      field: "paymentMethod",
      header: "Salary Method",
      ...tableCommonProps,
      style: { minWidth: 200, width: 200 },
      body: (rowData: PayrollDetailEntry) => (
        <Dropdown
          small
          filter
          options={paymentMethodOptions}
          disabled={rowData.isLocked}
          className="w-[200px]! h-10!"
          placeholder="Choose Method"
          value={rowData.paymentMethod}
          onChange={(e) =>
            updatePayrollEntry(rowData.id, "paymentMethod", e.value)
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
          value={rowData.status}
          onChange={(e) => updatePayrollEntry(rowData.id, "status", e.value)}
        />
      ),
    },
  ];

  const renderHeader = ({ exportCSV, exportExcel }: CustomHeaderProps) => {
    return (
      <div className="flex flex-col lg:flex-row justify-between bg-theme-primary-light items-center gap-3 flex-1 w-full">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="w-full lg:w-auto">
            <GroupDropdown
              hideAllOption
              value={selectedFilter}
              onChange={setSelectedFilter}
              className="w-full lg:w-64 h-10.5!"
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

  // Fetch payroll date info
  const { data: dateData } = useGetPayrollDate({
    id: isNaN(payrollId) ? 0 : payrollId,
  });

  const payrollTitle = dateData
    ? `PAYROLL DETAILS OF ${formatPayrollPeriod(
        dateData.payrollMonth,
        dateData.payrollYear
      )}`
    : `PAYROLL DETAILS #${periodParam}`;

  return (
    <div className="flex h-full flex-col">
      <TitleHeader
        title={payrollTitle}
        icon={<i className="fa-light fa-calendar text-xl!" />}
        value={searchValue}
        onChange={(e) => {
          const value = e.target.value;
          setSearchValue(value);
        }}
        onBack={() => router.replace("/payroll")}
      />
      <div className="flex flex-1 flex-col gap-4 px-6 py-6 bg-theme-primary-light">
        {renderHeader({
          exportCSV,
          exportExcel,
        })}
        <div className="bg-white h-full rounded-xl overflow-hidden">
          <Table
            ref={tableRef}
            dataKey="id"
            extraSmall
            data={payrollData}
            columns={columns()}
            pagination={true}
            rowsPerPageOptions={[50, 100]}
            rows={100}
            globalSearch={false}
            emptyMessage={
              !filterParams.designationId && !filterParams.payrollSectionId
                ? "No Payroll Section or Designation is Selected"
                : "No Payroll Data Found"
            }
            scrollable
            scrollHeight="65vh"
            stripedRows
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default PayrollDetailPage;
