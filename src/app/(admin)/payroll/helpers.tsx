import Link from "next/link";
import { classNames } from "primereact/utils";
import { TypeBadge, TableColumn } from "@/components";
import { PayrollEntry } from "@/utils/types";
import { PayrollSummaryWithRelations } from "@/lib/db/services/payroll-summary";
import { PayrollActions } from "./components/PayrollActions";

export const commonColumnProps = {
  sortable: true,
  filterable: true,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
};

export const CUTOFF_YEAR = 2026;
export const CUTOFF_MONTH = 1; // January

export const isBeforeCutoff = (year: number, month: number) =>
  year < CUTOFF_YEAR || (year === CUTOFF_YEAR && month < CUTOFF_MONTH);

export const getYearOptions = () => {
  return Array.from({ length: 20 }, (_, index) => ({
    label: `${new Date().getFullYear() - index}`,
    value: `${new Date().getFullYear() - index}`,
  }));
};

/**
 * Transforms raw payroll summaries into a format suitable for the data table
 */
export const transformPayrollSummaries = (
  summaries: PayrollSummaryWithRelations[]
): PayrollEntry[] => {
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

  return summaries.map((summary) => ({
    id: summary.id,
    period: `${monthNames[summary.payrollMonth - 1]} ${summary.payrollYear}`,
    month: summary.payrollMonth,
    year: summary.payrollYear,
    salary: summary.totalSalary,
    breakfastAllowance: summary.totalBreakfastAllowance,
    otherAllowances: summary.totalOtherAllowances,
    previousAdvance: summary.totalPreviousAdvance,
    currentAdvance: summary.totalCurrentAdvance,
    deduction: summary.totalDeduction,
    netLoan: summary.totalNetLoan,
    previousChallan: summary.totalPreviousChallan,
    currentChallan: summary.totalCurrentChallan,
    challanDeduction: summary.totalChallanDeduction,
    netChallan: summary.totalNetChallan,
    netSalaryPayable: summary.totalNetSalaryPayable,
    cardSalary: summary.totalCardSalary,
    cashSalary: summary.totalCashSalary,
    remarks: null,
    status: (summary.payrollStatus?.nameEn || "Pending") as
      | "Posted"
      | "Pending"
      | "Revision",
  }));
};

/**
 * Defines the columns for the payroll data table
 */
export const getPayrollTableColumns = (
  handleView: (payroll: PayrollEntry) => void,
  handleRecalculate: (payroll: PayrollEntry) => void,
  handlePost: (payroll: PayrollEntry) => void,
  handleRepost: (payroll: PayrollEntry, isRefresh: boolean) => void
): TableColumn<PayrollEntry>[] => [
  {
    field: "period",
    header: "Period",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "150px" },
    body: (rowData: PayrollEntry) => (
      <Link href={`/payroll/${rowData.id}`}>
        <span className="text-sm font-semibold text-primary underline">
          {rowData.period}
        </span>
      </Link>
    ),
  },
  {
    field: "salary",
    header: "Salary",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "150px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">{rowData.salary.toLocaleString()}</span>
    ),
  },
  {
    field: "breakfastAllowance",
    header: "Brkfst. Allow.",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "160px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">
        {rowData.breakfastAllowance.toLocaleString()}
      </span>
    ),
  },
  {
    field: "otherAllowances",
    header: "Other Allow.",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "150px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">
        {rowData.otherAllowances.toLocaleString()}
      </span>
    ),
  },
  {
    field: "previousAdvance",
    header: "Prev. Advance",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "170px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">
        {rowData.previousAdvance.toLocaleString()}
      </span>
    ),
  },
  {
    field: "currentAdvance",
    header: "Curr. Advance",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "170px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">{rowData.currentAdvance.toLocaleString()}</span>
    ),
  },
  {
    field: "deduction",
    header: "Loan Deduction",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "160px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">{rowData.deduction.toLocaleString()}</span>
    ),
  },
  {
    field: "netLoan",
    header: "Net Loan",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "150px" },
    body: (rowData: PayrollEntry) => (
      <span
        className={classNames("text-sm", {
          "text-red-600": rowData.netLoan < 0,
        })}
      >
        {rowData.netLoan.toLocaleString()}
      </span>
    ),
  },
  {
    field: "previousChallan",
    header: "Prev. Traff.",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "160px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">
        {rowData.previousChallan.toLocaleString()}
      </span>
    ),
  },
  {
    field: "currentChallan",
    header: "Curr. Traff.",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "160px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">{rowData.currentChallan.toLocaleString()}</span>
    ),
  },
  {
    field: "challanDeduction",
    header: "Traffic Ded.",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "155px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">
        {rowData.challanDeduction.toLocaleString()}
      </span>
    ),
  },
  {
    field: "netChallan",
    header: "Net Traffic",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "150px" },
    body: (rowData: PayrollEntry) => (
      <span
        className={classNames("text-sm", {
          "text-red-600": rowData.netChallan < 0,
        })}
      >
        {rowData.netChallan.toLocaleString()}
      </span>
    ),
  },
  {
    field: "netSalaryPayable",
    header: "Net Salary",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "170px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm font-semibold">
        {rowData.netSalaryPayable.toLocaleString()}
      </span>
    ),
  },
  {
    field: "cardSalary",
    header: "Card Sal.",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "150px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">{rowData.cardSalary.toLocaleString()}</span>
    ),
  },
  {
    field: "cashSalary",
    header: "Cash Sal.",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "150px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">{rowData.cashSalary.toLocaleString()}</span>
    ),
  },
  {
    field: "status",
    header: "Status",
    sortable: true,
    filterable: false,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "120px" },
    body: (rowData: PayrollEntry) => (
      <TypeBadge
        text={rowData.status}
        variant={
          rowData.status === "Pending"
            ? "warning"
            : rowData.status === "Revision"
              ? "danger"
              : "success"
        }
      />
    ),
  },
  {
    field: "actions",
    header: "Actions",
    sortable: false,
    filterable: false,
    align: "center",
    style: { minWidth: "150px" },
    body: (rowData: PayrollEntry) => (
      <PayrollActions
        payroll={rowData}
        onView={handleView}
        onRecalculate={handleRecalculate}
        onPost={handlePost}
        onRepost={handleRepost}
      />
    ),
  },
];
