import { PayrollDetailEntry } from "@/lib/db/services/payroll-summary/mappers";

/**
 * Calculates total allowances including trip and overtime.
 */
export const calculateTotalAllowances = (entry: PayrollDetailEntry) =>
  (entry.breakfastAllowance ?? 0) +
  (entry.otherAllowances ?? 0) +
  (entry.tripAllowance ?? 0) +
  (entry.overtimeAllowance ?? 0);

/**
 * Calculates total salary (Base Salary + Total Allowances).
 */
export const calculateTotalSalary = (entry: PayrollDetailEntry) => {
  return entry.totalSalary;
};

/**
 * Calculates net salary payable by subtracting deductions from total salary.
 */
export const calculateNetSalaryPayable = (entry: PayrollDetailEntry) =>
  (entry.totalSalary ?? 0) -
  (entry.loanDeduction ?? 0) -
  (entry.challanDeduction ?? 0);

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
