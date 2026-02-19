export interface PayrollEntry {
  id: number;
  period: string; // "JAN 2025" format
  salary: number;
  breakfastAllowance: number;
  otherAllowances: number;
  previousAdvance: number;
  currentAdvance: number;
  deduction: number;
  netLoan: number; // can be negative
  previousChallan: number;
  currentChallan: number;
  challanDeduction: number;
  netChallan: number;
  netSalaryPayable: number;
  cardSalary: number;
  cashSalary: number;
  remarks: string | null;
  status: "Posted" | "Pending";
}
