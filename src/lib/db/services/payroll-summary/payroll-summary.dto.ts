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
  totalBreakfastAllowance: number;
  totalOtherAllowances: number;
  totalPreviousAdvance: number;
  totalCurrentAdvance: number;
  totalDeduction: number;
  totalNetLoan: number;
  totalPreviousChallan: number;
  totalCurrentChallan: number;
  totalChallanDeduction: number;
  totalNetChallan: number;
  totalNetSalaryPayable: number;
  totalCardSalary: number;
  totalCashSalary: number;
  payrollStatusId: number | null;
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
}

export interface GetPayrollDetailsParams {
  year: number;
  month: number;
  branchId?: number;
  payrollSectionId?: number;
  designationId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

// Minimal interface for what we need in the UI
export interface PayrollDetailWithRelations {
  id: number;
  employeeId: number;
  payrollMonth: number;
  payrollYear: number;
  workDays: number;
  totalHours: number; // Decimal to number
  hourlyRate: number; // Decimal to number
  allowance: number; // Decimal to number
  salary: number; // Total Salary (Decimal to number)
  previousLoan: number;
  currentLoan: number;
  deductionLoan: number;
  // netLoan: number; // Not strictly needed for display if we calculate or just show ded
  previousTrafficChallan: number;
  currentTrafficChallan: number;
  deductionTrafficChallan: number;
  // netTrafficChallan: number;
  netSalaryPayable: number;
  cardSalary: number;
  cashSalary: number;
  overTime: number;

  employee: {
    id: number;
    employeeCode: number;
    nameEn: string;
    nameAr?: string | null;
    designationId: number | null;
    idCardNo?: string | null;
    designation?: {
      id: number;
      nameEn: string;
      nameAr?: string | null;
    } | null;
  };
}
