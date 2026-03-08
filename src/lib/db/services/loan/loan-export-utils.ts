/**
 * Loan Export Utilities
 * Generates Excel (.xlsx) and CSV exports in the Labour Advance report format.
 * - Type "LOAN"   → positive amount
 * - Type "RETURN" → negative amount
 */

import dayjs from "dayjs";
import type { ListedLoan } from "./loan.dto";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getMonthLabel = (loans: ListedLoan[], fallback: string): string => {
  if (loans.length > 0) {
    return dayjs(loans[0].date).format("MMM-YYYY");
  }
  return fallback;
};

/** Signed amount: positive for LOAN, negative for RETURN */
const signedAmount = (loan: ListedLoan): number => {
  const amt = Number(loan.amount ?? 0);
  return loan.type === "RETURN" ? -amt : amt;
};

// ---------------------------------------------------------------------------
// Excel Export
// ---------------------------------------------------------------------------

export const exportLoansToExcel = async (
  loans: ListedLoan[],
  monthLabel?: string
): Promise<void> => {
  const xlsx = await import("xlsx");
  const fileSaver = await import("file-saver");

  const label = monthLabel ?? getMonthLabel(loans, "Export");
  const title = `Advances (Loans) - ${label}`;

  // Build worksheet rows
  const headers = [
    "Sr. #",
    "Date",
    "Code",
    "Employee",
    "Designation",
    "Loan Amount",
    "Remarks",
  ];

  const rows: (string | number)[][] = loans.map((loan, index) => [
    index + 1,
    dayjs(loan.date).format("D-MMM-YY"),
    loan.employee?.employeeCode ?? "",
    loan.employee?.nameEn ?? "",
    loan.employee?.designation?.nameEn ?? "",
    signedAmount(loan),
    loan.remarks ?? "",
  ]);

  // Total row
  const total = loans.reduce((sum, loan) => sum + signedAmount(loan), 0);
  const totalRow: (string | number)[] = ["", "", "", "", "Total:", total, ""];

  // Compose sheet data: title row, blank row, headers, data rows, blank row, total
  const sheetData: (string | number)[][] = [
    [title],
    headers,
    ...rows,
    totalRow,
  ];

  const worksheet = xlsx.utils.aoa_to_sheet(sheetData);

  // Merge title across all columns (A1:G1)
  worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];

  // Set column widths
  worksheet["!cols"] = [
    { wch: 6 }, // Si #
    { wch: 12 }, // Date
    { wch: 8 }, // Code
    { wch: 35 }, // Employee
    { wch: 20 }, // Designation
    { wch: 13 }, // Loan Amount
    { wch: 45 }, // Remarks
  ];

  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Labour Advance");

  const excelBuffer = xlsx.write(workbook, { bookType: "xlsx", type: "array" });

  const EXCEL_TYPE =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const blob = new Blob([excelBuffer], { type: EXCEL_TYPE });

  const fileName = `Advances_${label.replace(/\s/g, "_")}_${Date.now()}.xlsx`;
  fileSaver.default.saveAs(blob, fileName);
};

// ---------------------------------------------------------------------------
// CSV Export
// ---------------------------------------------------------------------------

export const exportLoansToCSV = (
  loans: ListedLoan[],
  monthLabel?: string
): void => {
  const label = monthLabel ?? getMonthLabel(loans, "Export");
  const title = `Advances (Loans) - ${label}`;

  const escape = (val: string | number): string => {
    const str = String(val ?? "");
    // Wrap in quotes if contains comma, quote, or newline
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = [
    "Sr. #",
    "Date",
    "Code",
    "Employee",
    "Designation",
    "Loan Amount",
    "Remarks",
  ];

  const lines: string[] = [];
  // Title row (escaped, then blank row before headers)
  lines.push(escape(title));
  lines.push(headers.map(escape).join(","));

  loans.forEach((loan, index) => {
    const row = [
      index + 1,
      dayjs(loan.date).format("D-MMM-YY"),
      loan.employee?.employeeCode ?? "",
      loan.employee?.nameEn ?? "",
      loan.employee?.designation?.nameEn ?? "",
      signedAmount(loan),
      loan.remarks ?? "",
    ];
    lines.push(row.map(escape).join(","));
  });

  // Total row
  const total = loans.reduce((sum, loan) => sum + signedAmount(loan), 0);
  lines.push(["", "", "", "", "Total:", total, ""].map(escape).join(","));

  const csvContent = lines.join("\r\n");
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `Advances_${label.replace(/\s/g, "_")}_${Date.now()}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
