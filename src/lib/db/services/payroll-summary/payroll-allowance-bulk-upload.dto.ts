/**
 * Payroll Allowance Bulk Upload DTOs
 * Type definitions for bulk uploading trip and overtime allowances
 */

export interface BulkUploadPayrollAllowanceRow {
  employeeCode: number;
  tripAllowance?: number;
  overtimeAllowance?: number;
}

export interface BulkUploadPayrollAllowanceData {
  payrollId: number;
  rows: BulkUploadPayrollAllowanceRow[];
}

export interface BulkUploadPayrollAllowanceResult {
  success: number;
  failed: number;
  skipped: number;
  details: Array<{
    row: number;
    employeeCode: number;
    status: "success" | "failed" | "skipped";
    message: string;
  }>;
}
