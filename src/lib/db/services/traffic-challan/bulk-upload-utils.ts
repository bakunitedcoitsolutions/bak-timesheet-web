/**
 * Bulk Upload Utilities for Traffic Challans
 * Functions to parse CSV and Excel files for traffic challan bulk upload
 */

import * as XLSX from "xlsx";
import type { BulkUploadTrafficChallanRow } from "./traffic-challan.dto";

export interface ParseFileResult {
  data: BulkUploadTrafficChallanRow[];
  errors: string[];
}

/**
 * Expected column headers for bulk upload
 * Supports multiple variations for flexibility
 */
const COLUMN_MAPPINGS = {
  employeeCode: ["Employee Code", "EmployeeCode", "Code", "Emp Code", "emp_code"],
  date: ["Date", "Challan Date", "Transaction Date", "date"],
  type: ["Type", "Challan Type", "Transaction Type", "type"],
  amount: ["Amount", "Challan Amount", "Transaction Amount", "amount"],
  description: ["Description", "Remarks", "Note", "Notes", "description", "remarks"],
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
function parseCellValue(
  value: any,
  field: keyof BulkUploadTrafficChallanRow
): any {
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
      if (upperType !== "CHALLAN" && upperType !== "RETURN") {
        throw new Error('Invalid type: must be "CHALLAN" or "RETURN"');
      }
      return upperType;

    case "date":
      // Try parsing as date
      const date = new Date(stringValue);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${stringValue}`);
      }
      return date;

    case "description":
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
        const data = e.target?.result;
        if (!data) {
          reject(new Error("Failed to read file"));
          return;
        }

        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        }) as any[][];

        if (jsonData.length < 2) {
          reject(new Error("File must contain at least a header row and one data row"));
          return;
        }

        // First row is headers
        const headers = jsonData[0].map((h) => String(h));

        // Find column indices
        const employeeCodeIndex = findColumnIndex(headers, "employeeCode");
        const dateIndex = findColumnIndex(headers, "date");
        const typeIndex = findColumnIndex(headers, "type");
        const amountIndex = findColumnIndex(headers, "amount");
        const descriptionIndex = findColumnIndex(headers, "description");

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
        const rows: BulkUploadTrafficChallanRow[] = [];
        const errors: string[] = [];

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const rowNumber = i + 1;

          // Skip empty rows
          if (row.every((cell) => !cell || String(cell).trim() === "")) {
            continue;
          }

          try {
            const challanRow: BulkUploadTrafficChallanRow = {
              employeeCode: parseCellValue(
                row[employeeCodeIndex],
                "employeeCode"
              ) as number,
              date: parseCellValue(row[dateIndex], "date"),
              type: parseCellValue(row[typeIndex], "type") as "CHALLAN" | "RETURN",
              amount: parseCellValue(row[amountIndex], "amount"),
            };

            // Add optional description
            if (descriptionIndex !== -1 && row[descriptionIndex]) {
              challanRow.description = parseCellValue(row[descriptionIndex], "description");
            }

            rows.push(challanRow);
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

    reader.readAsBinaryString(file);
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
        const lines = text.split("\n").map((line) => line.trim()).filter((line) => line);

        if (lines.length < 2) {
          reject(new Error("File must contain at least a header row and one data row"));
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
        const descriptionIndex = findColumnIndex(headers, "description");

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
        const rows: BulkUploadTrafficChallanRow[] = [];
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

            const challanRow: BulkUploadTrafficChallanRow = {
              employeeCode: parseCellValue(
                row[employeeCodeIndex],
                "employeeCode"
              ) as number,
              date: parseCellValue(row[dateIndex], "date"),
              type: parseCellValue(row[typeIndex], "type") as "CHALLAN" | "RETURN",
              amount: parseCellValue(row[amountIndex], "amount"),
            };

            // Add optional description
            if (descriptionIndex !== -1 && row[descriptionIndex]) {
              challanRow.description = parseCellValue(row[descriptionIndex], "description");
            }

            rows.push(challanRow);
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
      "Date": "2024-01-15",
      "Type": "CHALLAN",
      "Amount": 150,
      "Description": "Sample challan entry",
    },
    {
      "Employee Code": 1002,
      "Date": "2024-01-20",
      "Type": "RETURN",
      "Amount": 100,
      "Description": "Sample return entry",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Traffic Challans");

  XLSX.writeFile(workbook, "traffic_challan_bulk_upload_template.xlsx");
}
