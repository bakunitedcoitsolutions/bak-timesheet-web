/**
 * Payroll Summary Service DTOs
 * Type definitions for payroll summary service operations
 */

export interface GetPayrollSummaryByYearParams {
  year: number;
  branchId?: number;
}

export interface PayrollSummaryInterface {
  id: number;
  payrollMonth: number;
  payrollYear: number;
  totalSalary: number; // Converted from Decimal
  totalPreviousAdvance: number;
  totalCurrentAdvance: number;
  totalDeduction: number;
  totalNetLoan: number;
  totalNetSalaryPayable: number;
  totalCardSalary: number;
  totalCashSalary: number;
  remarks: string | null;
  payrollStatusId: number | null;
  branchId: number | null;
  createdDate: Date;
  createdBy: number | null;
  modifiedDate: Date;
  modifiedBy: number | null;
}

export interface PayrollSummaryWithRelations extends PayrollSummaryInterface {
  payrollStatus?: {
    id: number;
    nameEn: string;
    nameAr?: string | null;
  } | null;
  branch?: {
    id: number;
    nameEn: string;
    nameAr?: string | null;
  } | null;
}
