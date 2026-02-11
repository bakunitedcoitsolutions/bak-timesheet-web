/**
 * Bulk Upload Utilities for Timesheets
 * Functions to parse CSV and Excel files for timesheet bulk upload
 */

import dayjs from "dayjs";
import * as XLSX from "xlsx";
import type { BulkUploadTimesheetRow } from "./timesheet.dto";

export interface ParseFileResult {
  data: BulkUploadTimesheetRow[];
  errors: string[];
}

const COLUMN_MAPPINGS = {
  date: ["Date", "Timesheet Date", "date"],
  employeeCode: [
    "Employee Code",
    "EmployeeCode",
    "Code",
    "Emp Code",
    "emp_code",
  ],
  project1Id: ["Project 1 ID", "Project1Id", "Project 1", "project1Id"],
  project1Hours: ["Project 1 Hours", "Project1Hours", "Hrs 1", "project1Hours"],
  project1Overtime: [
    "Project 1 Overtime",
    "Project1Overtime",
    "OT 1",
    "project1Overtime",
  ],
  project2Id: ["Project 2 ID", "Project2Id", "Project 2", "project2Id"],
  project2Hours: ["Project 2 Hours", "Project2Hours", "Hrs 2", "project2Hours"],
  project2Overtime: [
    "Project 2 Overtime",
    "Project2Overtime",
    "OT 2",
    "project2Overtime",
  ],
  description: [
    "Description",
    "Remarks",
    "Note",
    "Notes",
    "description",
    "remarks",
  ],
};

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

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

function parseCellValue(value: any, field: keyof BulkUploadTimesheetRow): any {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const stringValue = String(value).trim();

  if (stringValue === "") {
    return undefined;
  }

  switch (field) {
    case "employeeCode": {
      const num = Number(stringValue);
      if (isNaN(num) || num <= 0) {
        throw new Error("Invalid employeeCode: must be a positive number");
      }
      return Math.floor(num);
    }

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

    case "project1Id":
    case "project2Id": {
      const id = Number(stringValue);
      if (isNaN(id) || id <= 0) return null;
      return Math.floor(id);
    }

    case "project1Hours":
    case "project1Overtime":
    case "project2Hours":
    case "project2Overtime": {
      const n = Number(stringValue);
      if (isNaN(n) || n < 0) return null;
      return Math.floor(n);
    }

    case "description":
      return stringValue || undefined;

    default:
      return stringValue;
  }
}

function parseDataRows(
  rows: any[][],
  headers: string[],
  getRow: (i: number) => any[]
): { data: BulkUploadTimesheetRow[]; errors: string[] } {
  const dateIndex = findColumnIndex(headers, "date");
  const employeeCodeIndex = findColumnIndex(headers, "employeeCode");
  const project1IdIndex = findColumnIndex(headers, "project1Id");
  const project1HoursIndex = findColumnIndex(headers, "project1Hours");
  const project1OTIndex = findColumnIndex(headers, "project1Overtime");
  const project2IdIndex = findColumnIndex(headers, "project2Id");
  const project2HoursIndex = findColumnIndex(headers, "project2Hours");
  const project2OTIndex = findColumnIndex(headers, "project2Overtime");
  const descriptionIndex = findColumnIndex(headers, "description");

  if (dateIndex === -1) {
    throw new Error("Missing required column: Date");
  }
  if (employeeCodeIndex === -1) {
    throw new Error("Missing required column: Employee Code");
  }

  const data: BulkUploadTimesheetRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = getRow(i);
    const rowNumber = i + 1;

    if (row.every((cell) => cell == null || String(cell).trim() === "")) {
      continue;
    }

    try {
      const entry: BulkUploadTimesheetRow = {
        date: parseCellValue(row[dateIndex], "date"),
        employeeCode: parseCellValue(
          row[employeeCodeIndex],
          "employeeCode"
        ) as number,
      };

      if (project1IdIndex !== -1 && row[project1IdIndex] != null)
        entry.project1Id = parseCellValue(row[project1IdIndex], "project1Id");
      if (project1HoursIndex !== -1 && row[project1HoursIndex] != null)
        entry.project1Hours = parseCellValue(
          row[project1HoursIndex],
          "project1Hours"
        );
      if (project1OTIndex !== -1 && row[project1OTIndex] != null)
        entry.project1Overtime = parseCellValue(
          row[project1OTIndex],
          "project1Overtime"
        );
      if (project2IdIndex !== -1 && row[project2IdIndex] != null)
        entry.project2Id = parseCellValue(row[project2IdIndex], "project2Id");
      if (project2HoursIndex !== -1 && row[project2HoursIndex] != null)
        entry.project2Hours = parseCellValue(
          row[project2HoursIndex],
          "project2Hours"
        );
      if (project2OTIndex !== -1 && row[project2OTIndex] != null)
        entry.project2Overtime = parseCellValue(
          row[project2OTIndex],
          "project2Overtime"
        );
      if (descriptionIndex !== -1 && row[descriptionIndex] != null)
        entry.description = parseCellValue(
          row[descriptionIndex],
          "description"
        ) as string | undefined;

      data.push(entry);
    } catch (error: any) {
      errors.push(`Row ${rowNumber}: ${error.message}`);
    }
  }

  return { data, errors };
}

export function parseExcelFile(file: File): Promise<ParseFileResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = reader.result;
        if (!data) {
          reject(new Error("Failed to read file"));
          return;
        }

        // ✅ Better than readAsBinaryString (avoids encoding issues)
        const workbook = XLSX.read(data, {
          type: "array",
          cellDates: false, // ✅ keep dates OUT of JS Date objects
        });

        const firstSheetName = workbook.SheetNames[0];
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

        const headers = jsonData[0].map((h) => String(h).trim());
        const result = parseDataRows(
          jsonData,
          headers,
          (i) => jsonData[i] ?? []
        );
        resolve(result);
      } catch (error: any) {
        reject(new Error(`Failed to parse Excel file: ${error.message}`));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file); // ✅ changed
  });
}

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

        const headers = parseCSVLine(lines[0]);
        const rows: any[][] = [];
        for (let i = 1; i < lines.length; i++) {
          rows.push(parseCSVLine(lines[i]));
        }
        rows.unshift(headers);

        const result = parseDataRows(rows, headers, (i) => rows[i] ?? []);
        resolve(result);
      } catch (error: any) {
        reject(new Error(`Failed to parse CSV file: ${error.message}`));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

export function downloadSampleTemplate(): void {
  const sampleData = [
    {
      Date: "2024-01-15",
      "Employee Code": 1001,
      "Project 1 ID": 1,
      "Project 1 Hours": 8,
      "Project 1 Overtime": 0,
      "Project 2 ID": "",
      "Project 2 Hours": 0,
      "Project 2 Overtime": 0,
      Description: "Sample entry",
    },
    {
      Date: "2024-01-15",
      "Employee Code": 1002,
      "Project 1 ID": 2,
      "Project 1 Hours": 6,
      "Project 1 Overtime": 2,
      "Project 2 ID": "",
      "Project 2 Hours": 0,
      "Project 2 Overtime": 0,
      Description: "",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Timesheets");
  XLSX.writeFile(workbook, "timesheet_bulk_upload_template.xlsx");
}
