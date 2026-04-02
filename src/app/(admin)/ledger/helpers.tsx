import { TableColumn } from "@/components";

import { LedgerEntryInterface } from "@/lib/db/services/ledger/ledger.dto";

/**
 * Transformed ledger entry for table display
 */
export interface LedgerEntry {
  id: number;
  date: string;
  description: string;
  netSalary: number | null;
  salary: number | null;
  loan: number | null;
  challan: number | null;
  deduction: number | null;
  balance: number;
}

/**
 * Interface for calculation totals
 */
export interface LedgerTotals {
  netSalary: number;
  salary: number;
  loan: number;
  challan: number;
  deduction: number;
}

/**
 * Transforms raw ledger entries into a format suitable for the data table
 */
export const transformLedgerEntries = (
  entries: LedgerEntryInterface[]
): LedgerEntry[] => {
  return entries.map((entry) => {
    // Format date
    const date = entry.date
      ? new Date(entry.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "";

    // Initialize columns
    let netSalary: number | null = null;
    let salary: number | null = null;
    let loan: number | null = null;
    let challan: number | null = null;
    let deduction: number | null = null;

    // Map ledger entry to table columns based on type and amountType
    if (entry.type === "SALARY" && entry.amountType === "CREDIT") {
      netSalary = entry.amount;
      salary = entry.salary ?? null;
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

    if (entry.description === "Opening Balance") {
      loan = entry.openingLoan ?? null;
      challan = entry.openingChallan ?? null;
    }

    return {
      id: entry.id,
      date,
      description: entry.description,
      netSalary,
      loan,
      salary,
      challan,
      deduction,
      balance: entry.balance,
    } as LedgerEntry;
  });
};

/**
 * Calculates totals for a list of ledger entries
 */
export const calculateLedgerTotals = (data: LedgerEntry[]): LedgerTotals => {
  return data.reduce(
    (acc, entry) => {
      acc.netSalary += entry.netSalary || 0;
      acc.salary += entry.salary || 0;
      acc.loan += entry.loan || 0;
      acc.challan += entry.challan || 0;
      acc.deduction += entry.deduction || 0;
      return acc;
    },
    { netSalary: 0, salary: 0, loan: 0, challan: 0, deduction: 0 }
  );
};

/**
 * Defines the columns for the ledger data table
 */
export const getLedgerTableColumns = (
  totals: LedgerTotals,
  ledgerData: LedgerEntry[]
): TableColumn<LedgerEntry>[] => {
  const tableCommonProps = {
    sortable: false,
    filterable: false,
    style: { minWidth: 120 },
  };

  return [
    {
      field: "id",
      header: "#",
      ...tableCommonProps,
      align: "center",
      style: { minWidth: 50, width: 50 },
      body: (rowData: LedgerEntry) => (
        <span className="text-sm font-medium text-gray-500">{rowData.id}</span>
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
      footer: () => <span className="text-sm font-bold">Total:</span>,
    },
    {
      field: "salary",
      header: "Salary",
      ...tableCommonProps,
      align: "center",
      style: { minWidth: 130 },
      body: (rowData: LedgerEntry) => (
        <span className="text-sm">
          {rowData.salary !== null ? rowData.salary.toLocaleString() : ""}
        </span>
      ),
      footer: () => (
        <span className="text-sm font-bold">
          {totals.salary > 0 ? totals.salary.toLocaleString() : ""}
        </span>
      ),
    },
    {
      field: "netSalary",
      header: "Paid Salary",
      ...tableCommonProps,
      align: "center",
      style: { minWidth: 130 },
      body: (rowData: LedgerEntry) => (
        <span className="text-sm">
          {rowData.netSalary !== null ? rowData.netSalary.toLocaleString() : ""}
        </span>
      ),
      footer: () => (
        <span className="text-sm font-bold">
          {totals.netSalary > 0 ? totals.netSalary.toLocaleString() : ""}
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
        <span className="text-sm">
          {rowData.loan !== null ? rowData.loan.toLocaleString() : ""}
        </span>
      ),
      footer: () => (
        <span className="text-sm font-bold">
          {totals.loan > 0 ? totals.loan.toLocaleString() : "0"}
        </span>
      ),
    },
    {
      field: "challan",
      header: "Traffic",
      ...tableCommonProps,
      align: "center",
      style: { minWidth: 130 },
      body: (rowData: LedgerEntry) => (
        <span className="text-sm">
          {rowData.challan !== null ? rowData.challan.toLocaleString() : ""}
        </span>
      ),
      footer: () => (
        <span className="text-sm font-bold">
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
        <span className="text-sm text-red-600">
          {rowData.deduction !== null ? rowData.deduction.toLocaleString() : ""}
        </span>
      ),
      footer: () => (
        <span className="text-sm font-bold text-red-600">
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
        <span className="text-sm font-medium">
          {rowData.balance.toLocaleString()}
        </span>
      ),
      footer: () => {
        const closingBalance =
          ledgerData.length > 0 ? ledgerData[ledgerData.length - 1].balance : 0;
        return (
          <span className="text-sm font-bold text-primary">
            {closingBalance.toLocaleString()}
          </span>
        );
      },
    },
  ];
};
