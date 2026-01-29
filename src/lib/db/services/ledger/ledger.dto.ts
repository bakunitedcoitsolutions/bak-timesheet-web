/**
 * Ledger Service DTOs
 * Type definitions for ledger service operations
 */

export type LedgerType = "SALARY" | "LOAN" | "CHALLAN";
export type AmountType = "CREDIT" | "DEBIT";

export interface GetLedgerByEmployeeCodeParams {
  employeeCode: number;
}

export interface LedgerEntryInterface {
  id: number;
  employeeId: number | null;
  date: Date | any;
  type: LedgerType;
  amountType: AmountType;
  amount: number; // Converted from Decimal
  balance: number; // Converted from Decimal
  description: string;
  reference: string | null;
  createdAt: Date | any;
  updatedAt: Date | any;
  payrollId: number | null;
  loanId: number | null;
  trafficChallanId: number | null;
}

export interface EmployeeInfo {
  id: number;
  employeeCode: number;
  nameEn: string;
  nameAr: string | null;
  designationId: number | null;
  idCardNo: string | null;
}

export interface GetLedgerByEmployeeCodeResponse {
  employee: EmployeeInfo | null;
  ledgerEntries: LedgerEntryInterface[];
}
