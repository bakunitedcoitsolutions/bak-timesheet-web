import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { formatPayrollPeriod } from "@/utils/helpers";
import { PayrollDetailEntry } from "@/lib/db/services/payroll-summary/mappers";

export type PayrollReportRow = PayrollDetailEntry & {
  sectionName: string;
  sectionOrder: number;
  displayIndex: number;
  paymentMethodName?: string;
};

// ─── column definitions ───────────────────────────────────────────────────────

const HEADERS = [
  "#",
  "Employee Code",
  "Full Name",
  "ID Number",
  "Designation",
  "Work Days",
  "Over Time",
  "Total Hours",
  "Hourly Rate",
  "Breakfast Allowance",
  "Other Allowances",
  "Total Allowances",
  "Total Salary",
  "Previous Advance",
  "Current Advance",
  "Loan Deduction",
  "Net Loan",
  "Previous Traffic",
  "Current Traffic",
  "Traffic Deduction",
  "Net Traffic",
  "Net Salary Payable",
  "Card Salary",
  "Cash Salary",
  "Remarks",
];

const fmtHR = (v?: number | null) => Number(v || 0).toFixed(2);

// ─── row builder ──────────────────────────────────────────────────────────────

function buildRow(r: PayrollReportRow, index: number): (string | number)[] {
  return [
    index,
    r.empCode ?? "",
    r.name ?? "",
    r.idNumber ?? "",
    r.designation ?? "",
    r.workDays ?? 0,
    r.overTime ?? 0,
    r.totalHours ?? 0,
    Number(fmtHR(r.hourlyRate)),
    r.breakfastAllowance ?? 0,
    r.otherAllowances ?? 0,
    r.totalAllowances ?? 0,
    r.totalSalary ?? 0,
    r.previousAdvance ?? 0,
    r.currentAdvance ?? 0,
    r.loanDeduction ?? 0,
    r.netLoan ?? 0,
    r.previousChallan ?? 0,
    r.currentChallan ?? 0,
    r.challanDeduction ?? 0,
    r.netChallan ?? 0,
    r.netSalaryPayable ?? 0,
    r.cardSalary ?? 0,
    r.cashSalary ?? 0,
    r.remarks
      ? `${r.remarks} (${r.paymentMethodName ?? ""})`
      : (r.paymentMethodName ?? ""),
  ];
}

function sumKey(rows: PayrollReportRow[], key: keyof PayrollDetailEntry) {
  return rows.reduce((s, r) => s + (((r as any)[key] as number) || 0), 0);
}

function buildSubtotalRow(
  label: string,
  rows: PayrollReportRow[]
): (string | number)[] {
  return [
    "",
    "",
    label,
    "",
    "",
    sumKey(rows, "workDays"),
    sumKey(rows, "overTime"),
    sumKey(rows, "totalHours"),
    "-",
    sumKey(rows, "breakfastAllowance"),
    sumKey(rows, "otherAllowances"),
    sumKey(rows, "totalAllowances"),
    sumKey(rows, "totalSalary"),
    sumKey(rows, "previousAdvance"),
    sumKey(rows, "currentAdvance"),
    sumKey(rows, "loanDeduction"),
    sumKey(rows, "netLoan"),
    sumKey(rows, "previousChallan"),
    sumKey(rows, "currentChallan"),
    sumKey(rows, "challanDeduction"),
    sumKey(rows, "netChallan"),
    sumKey(rows, "netSalaryPayable"),
    sumKey(rows, "cardSalary"),
    sumKey(rows, "cashSalary"),
    "",
  ];
}

// ─── build worksheet data ─────────────────────────────────────────────────────

function buildSheetData(
  data: PayrollReportRow[],
  month: number,
  year: number
): {
  rows: (string | number)[][];
  subtotalRowIndexes: number[];
  grandTotalRowIndex: number;
} {
  const period = formatPayrollPeriod(month, year).toUpperCase();

  // Group by section, sorted by sectionOrder
  const sections = new Map<
    string,
    { rows: PayrollReportRow[]; order: number }
  >();
  data.forEach((r) => {
    const key = r.sectionName ?? "Unassigned";
    if (!sections.has(key))
      sections.set(key, { rows: [], order: r.sectionOrder ?? 9999 });
    sections.get(key)!.rows.push(r);
  });
  const sorted = [...sections.entries()].sort(
    (a, b) => a[1].order - b[1].order
  );

  const rows: (string | number)[][] = [
    // Title row
    [`PAYROLL REPORT — ${period}`],
    [],
    // Header row
    HEADERS,
  ];

  const subtotalRowIndexes: number[] = [];

  sorted.forEach(([sectionName, { rows: sRows }]) => {
    // Section label
    rows.push([sectionName.toUpperCase()]);

    // Data rows
    sRows.forEach((r, i) => {
      rows.push(buildRow(r, i + 1));
    });

    // Subtotal (only if >1 row)
    if (sRows.length > 1) {
      subtotalRowIndexes.push(rows.length); // 0-indexed
      rows.push(buildSubtotalRow(`${sectionName} — TOTAL`, sRows));
    }

    rows.push([]); // blank spacer between sections
  });

  // Grand total
  const grandTotalRowIndex = rows.length;
  subtotalRowIndexes.push(grandTotalRowIndex);
  rows.push(buildSubtotalRow(`GRAND TOTAL  (${data.length} employees)`, data));

  return { rows, subtotalRowIndexes, grandTotalRowIndex };
}

// ─── Excel export ─────────────────────────────────────────────────────────────

export function exportPayrollExcel(
  data: PayrollReportRow[],
  month: number,
  year: number
) {
  const { rows, subtotalRowIndexes } = buildSheetData(data, month, year);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Column widths
  ws["!cols"] = [
    { wch: 5 }, // #
    { wch: 14 }, // Employee Code
    { wch: 35 }, // Full Name
    { wch: 18 }, // ID Number
    { wch: 26 }, // Designation
    { wch: 12 }, // Work Days
    { wch: 12 }, // Over Time
    { wch: 13 }, // Total Hours
    { wch: 13 }, // Hourly Rate
    { wch: 20 }, // Breakfast Allowance
    { wch: 18 }, // Other Allowances
    { wch: 18 }, // Total Allowances
    { wch: 16 }, // Total Salary
    { wch: 18 }, // Previous Advance
    { wch: 18 }, // Current Advance
    { wch: 16 }, // Loan Deduction
    { wch: 14 }, // Net Loan
    { wch: 18 }, // Previous Traffic
    { wch: 18 }, // Current Traffic
    { wch: 18 }, // Traffic Deduction
    { wch: 14 }, // Net Traffic
    { wch: 20 }, // Net Salary Payable
    { wch: 16 }, // Card Salary
    { wch: 16 }, // Cash Salary
    { wch: 30 }, // Remarks
  ];

  // Style: bold + background for title (row 0), header (row 2), subtotals
  // xlsx community edition doesn't support cell styles — use SheetJS Pro for that.
  // We still merge the title cell across all columns.
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: HEADERS.length - 1 } }, // title
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Payroll Report");

  const period = formatPayrollPeriod(month, year).replace(/\s/g, "_");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([buf], { type: "application/octet-stream" }),
    `Payroll_Report_${period}.xlsx`
  );
}

// ─── CSV export ───────────────────────────────────────────────────────────────

export function exportPayrollCSV(
  data: PayrollReportRow[],
  month: number,
  year: number
) {
  const { rows } = buildSheetData(data, month, year);

  const escape = (v: string | number) => {
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const csv = rows.map((row) => row.map(escape).join(",")).join("\n");
  const period = formatPayrollPeriod(month, year).replace(/\s/g, "_");
  saveAs(
    new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }),
    `Payroll_Report_${period}.csv`
  );
}
