"use client";

import { useRef, useState, useEffect } from "react";
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
  useSavePayrollDetailsBatch,
} from "@/lib/db/services/payroll-summary";
import { queryClient } from "@/lib/react-query";
import { toastService } from "@/lib/toast";
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

  const { mutateAsync: savePayrollDetails } = useSavePayrollDetailsBatch();
  const [isSaving, setIsSaving] = useState(false);

  const saveSingleRow = async (row: PayrollDetailEntry) => {
    try {
      const entry = {
        id: row.id,
        loanDeduction: row.loanDeduction,
        challanDeduction: row.challanDeduction,
        netSalaryPayable: calculateNetSalaryPayable(row),
        netLoan: calculateNetLoan(row),
        netChallan: calculateNetTrafficChallan(row),
        cardSalary: row.cardSalary,
        cashSalary: row.cashSalary,
        remarks: row.remarks,
        paymentMethodId: row.paymentMethodId,
        payrollStatusId: row.payrollStatusId,
      };

      const result = await savePayrollDetails({ entries: [entry] });
      toastService.showSuccess(
        "Saved",
        `Row saved successfully for ${row.name}`
      );
    } catch (error: any) {
      toastService.showError(
        "Error",
        error.message || "Failed to save payroll details"
      );
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const entries = payrollData.map((row) => ({
        id: row.id,
        loanDeduction: row.loanDeduction,
        challanDeduction: row.challanDeduction,
        netSalaryPayable: calculateNetSalaryPayable(row),
        netLoan: calculateNetLoan(row),
        netChallan: calculateNetTrafficChallan(row),
        cardSalary: row.cardSalary,
        cashSalary: row.cashSalary,
        remarks: row.remarks,
        paymentMethodId: row.paymentMethodId,
        payrollStatusId: row.payrollStatusId,
      }));

      const result = await savePayrollDetails(
        { entries },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payroll-details"] });
            queryClient.invalidateQueries({ queryKey: ["payroll-summaries"] });
          },
        }
      );
      toastService.showSuccess(
        "Saved",
        `${result.saved} payroll entr${result.saved === 1 ? "y" : "ies"} saved successfully`
      );
    } catch (error: any) {
      toastService.showError(
        "Error",
        error.message || "Failed to save payroll details"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const tableRef = useRef<TableRef>(null);

  const updatePayrollEntry = (
    id: number,
    field: keyof PayrollDetailEntry,
    value: any
  ) => {
    setPayrollEntry(id, field, value);
  };

  const setPayrollEntry = (
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

  const scrollToTop = () => {
    // PrimeReact DataTable scrollable body class
    const scrollableBody = document.querySelector(".p-datatable-wrapper");
    if (scrollableBody) {
      scrollableBody.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Scroll to top when filter changes
  useEffect(() => {
    scrollToTop();
  }, [selectedFilter]);

  const onPage = () => {
    scrollToTop();
  };

  const calculateNetSalaryPayable = (entry: PayrollDetailEntry) => {
    return entry.totalSalary - entry.loanDeduction - entry.challanDeduction;
  };

  const calculateNetLoan = (entry: PayrollDetailEntry) => {
    return (
      (entry?.previousAdvance ?? 0) +
      (entry.currentAdvance ?? 0) -
      (entry.loanDeduction ?? 0)
    );
  };

  const calculateNetTrafficChallan = (entry: PayrollDetailEntry) => {
    return (
      (entry?.previousChallan ?? 0) +
      (entry.currentChallan ?? 0) -
      (entry.challanDeduction ?? 0)
    );
  };

  console.log("payrollData", payrollData);

  const columns = (): TableColumn<PayrollDetailEntry>[] => [
    {
      field: "empCode",
      header: "Emp. Code",
      ...tableCommonProps,
      style: { minWidth: 120, zIndex: 1 },
      headerStyle: { zIndex: 10 },
      frozen: true,
      body: (rowData: PayrollDetailEntry) => (
        <span className="text-sm font-semibold!">{rowData.empCode}</span>
      ),
    },
    {
      field: "name",
      header: "Name",
      ...tableCommonProps,
      style: { minWidth: 300, zIndex: 1 },
      headerStyle: { zIndex: 10 },
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
      field: "loanDeduction",
      header: "Loan Ded.",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <NumberInput
            useGrouping={false}
            disabled={rowData.payrollSummaryStatusId === 3}
            value={rowData.loanDeduction}
            onValueChange={(e) =>
              updatePayrollEntry(rowData.id, "loanDeduction", e.value || 0)
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
          <span className="text-[15px] font-semibold! text-primary!">
            {calculateNetLoan(rowData).toString()}
          </span>
        </div>
      ),
    },
    {
      field: "previousChallan",
      header: "Prev. Traff.",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <span className="text-[15px] font-semibold!">
            {rowData.previousChallan.toString()}
          </span>
        </div>
      ),
    },
    {
      field: "currentChallan",
      header: "Curr. Traff.",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <span className="text-[15px] font-semibold!">
            {rowData.currentChallan.toString()}
          </span>
        </div>
      ),
    },
    {
      field: "challanDeduction",
      header: "Traff. Ded.",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <NumberInput
            useGrouping={false}
            disabled={rowData.payrollSummaryStatusId === 3}
            value={rowData.challanDeduction}
            onValueChange={(e) =>
              updatePayrollEntry(rowData.id, "challanDeduction", e.value || 0)
            }
            className="timesheet-number-input payroll-input"
            min={0}
            showButtons={false}
          />
        </div>
      ),
    },
    {
      field: "netChallan",
      header: "Net Traff.",
      ...tableCommonProps,
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <span className="text-[15px] font-semibold! text-primary!">
            {calculateNetTrafficChallan(rowData).toString()}
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
          <span className="text-[15px] font-semibold! text-primary!">
            {calculateNetSalaryPayable(rowData).toString()}
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
            disabled={rowData.payrollSummaryStatusId === 3}
            value={rowData.cardSalary}
            onValueChange={(e) =>
              updatePayrollEntry(rowData.id, "cardSalary", e.value || 0)
            }
            className="timesheet-number-input payroll-input"
            min={0}
            showButtons={false}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                saveSingleRow(rowData);
              }
            }}
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
            disabled={rowData.payrollSummaryStatusId === 3}
            value={rowData.cashSalary}
            onValueChange={(e) =>
              updatePayrollEntry(rowData.id, "cashSalary", e.value || 0)
            }
            className="timesheet-number-input payroll-input"
            min={0}
            showButtons={false}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                saveSingleRow(rowData);
              }
            }}
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
          disabled={rowData.payrollSummaryStatusId === 3}
          placeholder="Add remarks"
          value={rowData.remarks}
          onChange={(e) =>
            updatePayrollEntry(rowData.id, "remarks", e.target.value)
          }
          className="w-full h-10! payroll-input"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              saveSingleRow(rowData);
            }
          }}
        />
      ),
    },
    {
      field: "paymentMethodId",
      header: "Salary Method",
      ...tableCommonProps,
      style: { minWidth: 200, width: 200 },
      body: (rowData: PayrollDetailEntry) => (
        <Dropdown
          small
          filter
          options={paymentMethodOptions}
          disabled={rowData.payrollSummaryStatusId === 3}
          className="w-[200px]! h-10!"
          placeholder="Choose Method"
          value={rowData.paymentMethodId?.toString()}
          onChange={(e) =>
            updatePayrollEntry(
              rowData.id,
              "paymentMethodId",
              e.value ? Number(e.value) : null
            )
          }
        />
      ),
    },
    {
      field: "payrollStatusId",
      header: "Status",
      ...tableCommonProps,
      style: { minWidth: 150, width: 150 },
      body: (rowData: PayrollDetailEntry) => (
        <Dropdown
          small
          options={statusOptions}
          disabled={rowData.payrollSummaryStatusId === 3}
          className="w-[150px]! h-10!"
          placeholder="Pending"
          value={rowData.payrollStatusId}
          onChange={(e) =>
            updatePayrollEntry(rowData.id, "payrollStatusId", e.value)
          }
        />
      ),
    },
    {
      field: "id",
      header: "Actions",
      ...tableCommonProps,
      sortable: false,
      filterable: false,
      style: { minWidth: 80, width: 80, textAlign: "center" },
      body: (rowData: PayrollDetailEntry) => (
        <div className="flex justify-center">
          <Button
            rounded
            size="small"
            variant="text"
            icon="pi pi-save text-lg!"
            tooltipOptions={{ position: "top" }}
            onClick={() => saveSingleRow(rowData)}
            disabled={rowData.isLocked || isSaving}
            className="w-8 h-8!"
            tooltip="Save Row"
          />
        </div>
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
              onClick={handleSave}
              loading={isSaving}
              disabled={isLoading || isSaving}
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
            onPage={onPage}
          />
        </div>
      </div>
    </div>
  );
};

export default PayrollDetailPage;
