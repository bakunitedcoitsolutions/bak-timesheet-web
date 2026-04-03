/**
 * Traffic Challan Export Utilities
 * Generates Excel (.xlsx) and CSV exports in the Violations report format.
 * - Type "CHALLAN" → positive amount
 * - Type "RETURN"  → negative amount
 */

import dayjs from "dayjs";
import type { ListedTrafficChallan } from "./traffic-challan.dto";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getMonthLabel = (
  challans: ListedTrafficChallan[],
  fallback: string
): string => {
  if (challans.length > 0) {
    return dayjs(challans[0].date).format("MMM-YYYY");
  }
  return fallback;
};

/** Signed amount: positive for CHALLAN, negative for RETURN */
const signedAmount = (challan: ListedTrafficChallan): number => {
  const amt = Number(challan.amount ?? 0);
  return challan.type === "RETURN" ? -amt : amt;
};

// ---------------------------------------------------------------------------
// Excel Export
// ---------------------------------------------------------------------------

export const exportTrafficChallansToExcel = async (
  challans: ListedTrafficChallan[],
  monthLabel?: string
): Promise<void> => {
  const xlsx = await import("xlsx");
  const fileSaver = await import("file-saver");

  const label = monthLabel ?? getMonthLabel(challans, "Export");
  const title = `Traffic Violations (Challans) - ${label}`;

  // Build worksheet rows
  const headers = [
    "Sr. #",
    "Date",
    "Code",
    "Employee",
    "Designation",
    "Amount",
    "Description",
  ];

  const rows: (string | number)[][] = challans.map((challan, index) => [
    index + 1,
    dayjs(challan.date).format("D-MMM-YY"),
    challan.employee?.employeeCode ?? "",
    challan.employee?.nameEn ?? "",
    challan.employee?.designation?.nameEn ?? "",
    signedAmount(challan),
    challan.description ?? "",
  ]);

  // Total row
  const total = challans.reduce((sum, challan) => sum + signedAmount(challan), 0);
  const totalRow: (string | number)[] = ["", "", "", "", "Total:", total, ""];

  // Compose sheet data: title row, headers, data rows, total row
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
    { wch: 6 }, // Sr. #
    { wch: 12 }, // Date
    { wch: 8 }, // Code
    { wch: 35 }, // Employee
    { wch: 25 }, // Designation
    { wch: 13 }, // Amount
    { wch: 45 }, // Description
  ];

  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Violations");

  const excelBuffer = xlsx.write(workbook, { bookType: "xlsx", type: "array" });

  const EXCEL_TYPE =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const blob = new Blob([excelBuffer], { type: EXCEL_TYPE });

  const fileName = `Violations_${label.replace(/\s/g, "_")}_${Date.now()}.xlsx`;
  fileSaver.default.saveAs(blob, fileName);
};

// ---------------------------------------------------------------------------
// CSV Export
// ---------------------------------------------------------------------------

export const exportTrafficChallansToCSV = (
  challans: ListedTrafficChallan[],
  monthLabel?: string
): void => {
  const label = monthLabel ?? getMonthLabel(challans, "Export");
  const title = `Traffic Violations (Challans) - ${label}`;

  const escape = (val: string | number): string => {
    const str = String(val ?? "");
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
    "Amount",
    "Description",
  ];

  const lines: string[] = [];
  // Title row and headers
  lines.push(escape(title));
  lines.push(headers.map(escape).join(","));

  challans.forEach((challan, index) => {
    const row = [
      index + 1,
      dayjs(challan.date).format("D-MMM-YY"),
      challan.employee?.employeeCode ?? "",
      challan.employee?.nameEn ?? "",
      challan.employee?.designation?.nameEn ?? "",
      signedAmount(challan),
      challan.description ?? "",
    ];
    lines.push(row.map(escape).join(","));
  });

  // Total row
  const total = challans.reduce((sum, challan) => sum + signedAmount(challan), 0);
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
    `Violations_${label.replace(/\s/g, "_")}_${Date.now()}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
