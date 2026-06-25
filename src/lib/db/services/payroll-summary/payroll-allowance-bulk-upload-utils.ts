/**
 * Bulk Upload Utilities for Payroll Allowances
 * Functions to parse CSV and Excel files for trip/overtime allowance bulk upload
 */

import * as XLSX from "xlsx";
import type { BulkUploadPayrollAllowanceRow } from "./payroll-allowance-bulk-upload.dto";

export interface ParsePayrollAllowanceFileResult {
  data: BulkUploadPayrollAllowanceRow[];
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
  tripAllowance: ["Trip Allowance", "TripAllowance", "Trip", "trip_allowance"],
  overtimeAllowance: [
    "Overtime Allowance",
    "OvertimeAllowance",
    "Overtime",
    "overtime_allowance",
    "OT Allowance",
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
 * Parses a cell value as a number (employee code or allowance amount)
 */
function parseNumberValue(
  value: any,
  fieldName: string,
  isRequired: boolean
): number | undefined {
  if (value === null || value === undefined || value === "") {
    if (isRequired) {
      throw new Error(`${fieldName} is required`);
    }
    return undefined;
  }

  const stringValue = String(value).trim();
  if (stringValue === "") {
    if (isRequired) {
      throw new Error(`${fieldName} is required`);
    }
    return undefined;
  }

  const num = Number(stringValue);
  if (isNaN(num)) {
    throw new Error(`Invalid ${fieldName}: must be a number`);
  }

  if (isRequired && num <= 0) {
    throw new Error(`Invalid ${fieldName}: must be a positive number`);
  }

  if (num < 0) {
    throw new Error(`Invalid ${fieldName}: must be a non-negative number`);
  }

  return isRequired ? Math.floor(num) : num;
}

/**
 * Parses an Excel file (XLSX, XLS)
 */
export function parseExcelFile(
  file: File
): Promise<ParsePayrollAllowanceFileResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = reader.result;
        if (!data) {
          reject(new Error("Failed to read file"));
          return;
        }

        const workbook = XLSX.read(data, {
          type: "array",
          cellDates: false,
        });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
          raw: false,
        }) as any[][];

        if (jsonData.length < 2) {
          reject(
            new Error(
              "File must contain at least a header row and one data row"
            )
          );
          return;
        }

        const headers = jsonData[0].map((h) => String(h));

        const employeeCodeIndex = findColumnIndex(headers, "employeeCode");
        const tripAllowanceIndex = findColumnIndex(headers, "tripAllowance");
        const overtimeAllowanceIndex = findColumnIndex(
          headers,
          "overtimeAllowance"
        );

        if (employeeCodeIndex === -1) {
          reject(new Error("Missing required column: Employee Code"));
          return;
        }

        if (tripAllowanceIndex === -1 && overtimeAllowanceIndex === -1) {
          reject(
            new Error(
              "At least one of Trip Allowance or Overtime Allowance column is required"
            )
          );
          return;
        }

        const rows: BulkUploadPayrollAllowanceRow[] = [];
        const errors: string[] = [];

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const rowNumber = i + 1;

          // Skip empty rows
          if (row.every((cell) => !cell || String(cell).trim() === "")) {
            continue;
          }

          try {
            const allowanceRow: BulkUploadPayrollAllowanceRow = {
              employeeCode: parseNumberValue(
                row[employeeCodeIndex],
                "Employee Code",
                true
              ) as number,
            };

            if (tripAllowanceIndex !== -1) {
              const tripVal = parseNumberValue(
                row[tripAllowanceIndex],
                "Trip Allowance",
                false
              );
              if (tripVal !== undefined) {
                allowanceRow.tripAllowance = tripVal;
              }
            }

            if (overtimeAllowanceIndex !== -1) {
              const overtimeVal = parseNumberValue(
                row[overtimeAllowanceIndex],
                "Overtime Allowance",
                false
              );
              if (overtimeVal !== undefined) {
                allowanceRow.overtimeAllowance = overtimeVal;
              }
            }

            rows.push(allowanceRow);
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

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parses a CSV file
 */
export function parseCSVFile(
  file: File
): Promise<ParsePayrollAllowanceFileResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          reject(new Error("Failed to read file"));
          return;
        }

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

        const parseCSVLine = (line: string): string[] => {
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

        const headers = parseCSVLine(lines[0]);

        const employeeCodeIndex = findColumnIndex(headers, "employeeCode");
        const tripAllowanceIndex = findColumnIndex(headers, "tripAllowance");
        const overtimeAllowanceIndex = findColumnIndex(
          headers,
          "overtimeAllowance"
        );

        if (employeeCodeIndex === -1) {
          reject(new Error("Missing required column: Employee Code"));
          return;
        }

        if (tripAllowanceIndex === -1 && overtimeAllowanceIndex === -1) {
          reject(
            new Error(
              "At least one of Trip Allowance or Overtime Allowance column is required"
            )
          );
          return;
        }

        const rows: BulkUploadPayrollAllowanceRow[] = [];
        const errors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const rowNumber = i + 1;

          if (!line || line.trim() === "") {
            continue;
          }

          try {
            const row = parseCSVLine(line);

            if (row.every((cell) => !cell || cell.trim() === "")) {
              continue;
            }

            const allowanceRow: BulkUploadPayrollAllowanceRow = {
              employeeCode: parseNumberValue(
                row[employeeCodeIndex],
                "Employee Code",
                true
              ) as number,
            };

            if (tripAllowanceIndex !== -1) {
              const tripVal = parseNumberValue(
                row[tripAllowanceIndex],
                "Trip Allowance",
                false
              );
              if (tripVal !== undefined) {
                allowanceRow.tripAllowance = tripVal;
              }
            }

            if (overtimeAllowanceIndex !== -1) {
              const overtimeVal = parseNumberValue(
                row[overtimeAllowanceIndex],
                "Overtime Allowance",
                false
              );
              if (overtimeVal !== undefined) {
                allowanceRow.overtimeAllowance = overtimeVal;
              }
            }

            rows.push(allowanceRow);
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
 * Downloads a sample Excel template for payroll allowance bulk upload
 */
export function downloadSampleTemplate(): void {
  const sampleData = [
    {
      "Employee Code": 1001,
      "Trip Allowance": 150,
      "Overtime Allowance": 200,
    },
    {
      "Employee Code": 1002,
      "Trip Allowance": 100,
      "Overtime Allowance": 0,
    },
    {
      "Employee Code": 1003,
      "Trip Allowance": 0,
      "Overtime Allowance": 300,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Allowances");

  XLSX.writeFile(workbook, "payroll_allowance_bulk_upload_template.xlsx");
}
