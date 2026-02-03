/**
 * Timesheet Service DTOs
 * Type definitions for timesheet page data (merged employees + timesheet records)
 */

export interface GetTimesheetPageDataParams {
  date: Date;
  /** Optional: filter employees by payroll section */
  payrollSectionId?: number | null;
  /** Optional: filter employees by designation */
  designationId?: number | null;
}

/** Single row for the timesheet table (keys aligned with DB: Employee + Timesheet) */
export interface TimesheetPageRow {
  id: number;
  employeeId: number;
  timesheetId: number | null;
  rowNumber: number;
  employeeCode: number;
  nameEn: string;
  designationNameEn: string;
  isFixed: boolean;
  isLocked: boolean;
  project1Id: number | null;
  project1Hours: number | null;
  project1Overtime: number | null;
  project2Id: number | null;
  project2Hours: number | null;
  project2Overtime: number | null;
  totalHours: number | null;
  description: string | null;
}

export interface GetTimesheetPageDataResponse {
  rows: TimesheetPageRow[];
}

/** Single entry payload for bulk save (create or update) */
export interface SaveTimesheetEntryItem {
  employeeId: number;
  timesheetId: number | null;
  project1Id: number | null;
  project1Hours: number | null;
  project1Overtime: number | null;
  project2Id: number | null;
  project2Hours: number | null;
  project2Overtime: number | null;
  totalHours: number | null;
  description: string | null;
}

export interface SaveTimesheetEntriesParams {
  date: Date;
  entries: SaveTimesheetEntryItem[];
}

export interface SaveTimesheetEntriesResponse {
  saved: number;
}

// ---------------------------------------------------------------------------
// Bulk Upload (from CSV/Excel file)
// ---------------------------------------------------------------------------

export interface BulkUploadTimesheetRow {
  date: Date | string;
  employeeCode: number;
  project1Id?: number | null;
  project1Hours?: number | null;
  project1Overtime?: number | null;
  project2Id?: number | null;
  project2Hours?: number | null;
  project2Overtime?: number | null;
  description?: string | null;
}

export interface BulkUploadTimesheetData {
  entries: BulkUploadTimesheetRow[];
}

export interface BulkUploadTimesheetResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    data: BulkUploadTimesheetRow;
    error: string;
  }>;
}
