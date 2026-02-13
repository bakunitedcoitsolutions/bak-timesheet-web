/**
 * Bulk Upload Utilities for Loans
 * Functions to parse CSV and Excel files for loan bulk upload
 */

import dayjs from "dayjs";
import * as XLSX from "xlsx";
import type { BulkUploadLoanRow } from "./loan.dto";

export interface ParseFileResult {
  data: BulkUploadLoanRow[];
  errors: string[];
}

/**
 * Expected column headers for bulk upload
 * Supports multiple variations for flexibility
 */
const COLUMN_MAPPINGS = {
  employeeCode: [
    "Employee Code",
    "EmployeeCode",
    "Code",
    "Emp Code",
    "emp_code",
  ],
  date: ["Date", "Loan Date", "Transaction Date", "date"],
  type: ["Type", "Loan Type", "Transaction Type", "type"],
  amount: ["Amount", "Loan Amount", "Transaction Amount", "amount"],
  remarks: [
    "Remarks",
    "Description",
    "Note",
    "Notes",
    "remarks",
    "description",
  ],
};

/**
 * Normalizes column headers to lowercase and removes extra spaces
 */
function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

/**
 * Finds the column index for a given field
 */
function findColumnIndex(
  headers: string[],
  field: keyof typeof COLUMN_MAPPINGS
): number {
  const normalizedHeaders = headers.map(normalizeHeader);
  const possibleHeaders = COLUMN_MAPPINGS[field].map(normalizeHeader);

  for (let i = 0; i < normalizedHeaders.length; i++) {
    if (possibleHeaders.includes(normalizedHeaders[i])) {
      return i;
    }
  }

  return -1;
}

/**
 * Parses a cell value to the appropriate type
 */
function parseCellValue(value: any, field: keyof BulkUploadLoanRow): any {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const stringValue = String(value).trim();

  if (stringValue === "") {
    return undefined;
  }

  switch (field) {
    case "employeeCode":
      const num = Number(stringValue);
      if (isNaN(num) || num <= 0) {
        throw new Error("Invalid employeeCode: must be a positive number");
      }
      return Math.floor(num);

    case "amount":
      const amount = Number(stringValue);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid amount: must be a positive number");
      }
      return amount;

    case "type":
      const upperType = stringValue.toUpperCase();
      if (upperType !== "LOAN" && upperType !== "RETURN") {
        throw new Error('Invalid type: must be "LOAN" or "RETURN"');
      }
      return upperType;

    case "date": {
      if (value instanceof Date) {
        return value;
      }

      const parsedDate = dayjs(stringValue, "YYYY-MM-DD");
      if (!parsedDate.isValid()) {
        throw new Error(`Invalid date: ${stringValue}`);
      }

      // Sanity check: if year is > 2100, assume it might be invalid parsing
      if (parsedDate.year() > 2100) {
        throw new Error(
          `Invalid date (year ${parsedDate.year()}): ${stringValue}. Ensure standard date format (YYYY-MM-DD).`
        );
      }

      const toDate = parsedDate.toDate();

      return toDate;
    }

    case "remarks":
      return stringValue || undefined;

    default:
      return stringValue;
  }
}

/**
 * Parses an Excel file (XLSX, XLS)
 */
export function parseExcelFile(file: File): Promise<ParseFileResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = reader.result;
        if (!data) {
          reject(new Error("Failed to read file"));
          return;
        }

        console.log(
          "parseExcelFile: File read successfully, bytes:",
          (data as ArrayBuffer).byteLength
        );

        // ✅ Better than readAsBinaryString (avoids encoding issues)
        const workbook = XLSX.read(data, {
          type: "array",
          cellDates: false, // ✅ keep dates OUT of JS Date objects
        });

        const firstSheetName = workbook.SheetNames[0];
        console.log("parseExcelFile: Sheet names", workbook.SheetNames);
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
          raw: false, // ✅ IMPORTANT: applies Excel formatting => dates become strings
          dateNF: "yyyy-mm-dd", // or "dd/mm/yyyy" if you prefer
        }) as any[][];

        if (jsonData.length < 2) {
          reject(
            new Error(
              "File must contain at least a header row and one data row"
            )
          );
          return;
        }

        // First row is headers
        const headers = jsonData[0].map((h) => String(h));

        // Find column indices
        const employeeCodeIndex = findColumnIndex(headers, "employeeCode");
        const dateIndex = findColumnIndex(headers, "date");
        const typeIndex = findColumnIndex(headers, "type");
        const amountIndex = findColumnIndex(headers, "amount");
        const remarksIndex = findColumnIndex(headers, "remarks");

        // Validate required columns
        if (employeeCodeIndex === -1) {
          reject(new Error("Missing required column: Employee Code"));
          return;
        }

        if (dateIndex === -1) {
          reject(new Error("Missing required column: Date"));
          return;
        }

        if (typeIndex === -1) {
          reject(new Error("Missing required column: Type"));
          return;
        }

        if (amountIndex === -1) {
          reject(new Error("Missing required column: Amount"));
          return;
        }

        // Parse data rows
        const rows: BulkUploadLoanRow[] = [];
        const errors: string[] = [];

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const rowNumber = i + 1;

          // Skip empty rows
          if (row.every((cell) => !cell || String(cell).trim() === "")) {
            continue;
          }

          try {
            const loanRow: BulkUploadLoanRow = {
              employeeCode: parseCellValue(
                row[employeeCodeIndex],
                "employeeCode"
              ) as number,
              date: parseCellValue(row[dateIndex], "date"),
              type: parseCellValue(row[typeIndex], "type") as "LOAN" | "RETURN",
              amount: parseCellValue(row[amountIndex], "amount"),
            };

            // Add optional remarks
            if (remarksIndex !== -1 && row[remarksIndex]) {
              loanRow.remarks = parseCellValue(row[remarksIndex], "remarks");
            }

            rows.push(loanRow);
          } catch (error: any) {
            errors.push(`Row ${rowNumber}: ${error.message}`);
          }
        }

        resolve({ data: rows, errors });
      } catch (error: any) {
        reject(new Error(`Failed to parse Excel file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file); // ✅ changed
  });
}

/**
 * Parses a CSV file
 */
export function parseCSVFile(file: File): Promise<ParseFileResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          reject(new Error("Failed to read file"));
          return;
        }

        // Split into lines
        const lines = text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line);

        if (lines.length < 2) {
          reject(
            new Error(
              "File must contain at least a header row and one data row"
            )
          );
          return;
        }

        // Parse CSV (handling quoted values)
        function parseCSVLine(line: string): string[] {
          const result: string[] = [];
          let current = "";
          let inQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              result.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }

          result.push(current.trim());
          return result;
        }

        // First line is headers
        const headers = parseCSVLine(lines[0]);

        // Find column indices
        const employeeCodeIndex = findColumnIndex(headers, "employeeCode");
        const dateIndex = findColumnIndex(headers, "date");
        const typeIndex = findColumnIndex(headers, "type");
        const amountIndex = findColumnIndex(headers, "amount");
        const remarksIndex = findColumnIndex(headers, "remarks");

        // Validate required columns
        if (employeeCodeIndex === -1) {
          reject(new Error("Missing required column: Employee Code"));
          return;
        }

        if (dateIndex === -1) {
          reject(new Error("Missing required column: Date"));
          return;
        }

        if (typeIndex === -1) {
          reject(new Error("Missing required column: Type"));
          return;
        }

        if (amountIndex === -1) {
          reject(new Error("Missing required column: Amount"));
          return;
        }

        // Parse data rows
        const rows: BulkUploadLoanRow[] = [];
        const errors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const rowNumber = i + 1;

          // Skip empty lines
          if (!line || line.trim() === "") {
            continue;
          }

          try {
            const row = parseCSVLine(line);

            // Skip empty rows
            if (row.every((cell) => !cell || cell.trim() === "")) {
              continue;
            }

            const loanRow: BulkUploadLoanRow = {
              employeeCode: parseCellValue(
                row[employeeCodeIndex],
                "employeeCode"
              ) as number,
              date: parseCellValue(row[dateIndex], "date"),
              type: parseCellValue(row[typeIndex], "type") as "LOAN" | "RETURN",
              amount: parseCellValue(row[amountIndex], "amount"),
            };

            // Add optional remarks
            if (remarksIndex !== -1 && row[remarksIndex]) {
              loanRow.remarks = parseCellValue(row[remarksIndex], "remarks");
            }

            rows.push(loanRow);
          } catch (error: any) {
            errors.push(`Row ${rowNumber}: ${error.message}`);
          }
        }

        resolve({ data: rows, errors });
      } catch (error: any) {
        reject(new Error(`Failed to parse CSV file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}

/**
 * Downloads a sample Excel template for bulk upload
 */
export function downloadSampleTemplate(): void {
  const sampleData = [
    {
      "Employee Code": 1001,
      Date: "2024-01-15",
      Type: "LOAN",
      Amount: 1000,
      Remarks: "Sample loan entry",
    },
    {
      "Employee Code": 1002,
      Date: "2024-01-20",
      Type: "RETURN",
      Amount: 500,
      Remarks: "Sample return entry",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Loans");

  XLSX.writeFile(workbook, "loan_bulk_upload_template.xlsx");
}
