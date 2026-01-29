/**
 * Loan Service DTOs
 * Type definitions for loan service operations
 */

import type { Prisma } from "../../../../../prisma/generated/prisma/client";

export type LoanType = "LOAN" | "RETURN";

export interface CreateLoanData {
  employeeId: number;
  date: Date | string;
  type: LoanType;
  amount: number | Prisma.Decimal;
  remarks?: string;
}

export interface UpdateLoanData {
  employeeId?: number;
  date?: Date | string;
  type?: LoanType;
  amount?: number | Prisma.Decimal;
  remarks?: string;
}

export type ListLoansSortableField =
  | "date"
  | "type"
  | "amount"
  | "createdAt";

export interface ListLoansParams {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: "asc" | "desc";
  sortBy?: ListLoansSortableField;
  employeeId?: number;
  type?: LoanType;
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface LoanInterface {
  id: number;
  employeeId: number;
  date: Date | any;
  type: LoanType;
  amount: number | null; // Converted from Decimal for client serialization
  remarks: string | null;
  createdAt: Date | any;
  updatedAt: Date | any;
}

export interface ListedLoan extends LoanInterface {}

export interface ListLoansResponse {
  loans: ListedLoan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ---------------------------------------------------------------------------
// Bulk Upload
// ---------------------------------------------------------------------------

export interface BulkUploadLoanRow {
  employeeCode: number; // Employee code (required)
  date: Date | string;
  type: LoanType;
  amount: number | Prisma.Decimal;
  remarks?: string;
}

export interface BulkUploadLoanData {
  loans: BulkUploadLoanRow[];
}

export interface BulkUploadLoanResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    data: BulkUploadLoanRow;
    error: string;
  }>;
}
