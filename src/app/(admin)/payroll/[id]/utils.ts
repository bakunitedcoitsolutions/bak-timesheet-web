import { PayrollDetailEntry } from "@/lib/db/services/payroll-summary/mappers";

/**
 * Calculates net salary payable by subtracting deductions from total salary.
 */
export const calculateNetSalaryPayable = (entry: PayrollDetailEntry) =>
  entry.totalSalary - entry.loanDeduction - entry.challanDeduction;

/**
 * Calculates net loan balance after deductions.
 */
export const calculateNetLoan = (entry: PayrollDetailEntry) =>
  (entry?.previousAdvance ?? 0) +
  (entry.currentAdvance ?? 0) -
  (entry.loanDeduction ?? 0);

/**
 * Calculates net traffic challan balance after deductions.
 */
export const calculateNetTrafficChallan = (entry: PayrollDetailEntry) =>
  (entry?.previousChallan ?? 0) +
  (entry.currentChallan ?? 0) -
  (entry.challanDeduction ?? 0);
