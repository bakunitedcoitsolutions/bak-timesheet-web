/**
 * Payroll Summary Service
 * Business logic for payroll summary operations
 */

import { prisma } from "@/lib/db/prisma";
import type {
  GetPayrollSummaryByYearParams,
  PayrollSummaryWithRelations,
} from "./payroll-summary.dto";

// Reusable select object
const payrollSummarySelect = {
  id: true,
  payrollMonth: true,
  payrollYear: true,
  totalSalary: true,
  totalBreakfastAllowance: true,
  totalOtherAllowances: true,
  totalPreviousLoan: true, // Corrected from totalPreviousAdvance
  totalCurrentLoan: true, // Corrected from totalCurrentAdvance
  totalLoanDeduction: true, // Corrected from totalDeduction
  totalNetLoan: true,
  totalPreviousChallan: true,
  totalCurrentChallan: true,
  totalChallanDeduction: true,
  totalNetChallan: true,
  totalNetSalaryPayable: true,
  totalCardSalary: true,
  totalCashSalary: true,
  payrollStatusId: true,
  createdDate: true,
  createdBy: true,
  modifiedDate: true,
  modifiedBy: true,
  payrollStatus: {
    select: {
      id: true,
      nameEn: true,
    },
  },
};

/**
 * Get payroll summaries by year
 */
export const getPayrollSummariesByYear = async (
  params: GetPayrollSummaryByYearParams
): Promise<PayrollSummaryWithRelations[]> => {
  const { year, branchId } = params;

  const where: any = {
    payrollYear: year,
  };

  if (branchId) {
    where.branchId = branchId;
  }

  const summaries = await prisma.payrollSummary.findMany({
    where,
    orderBy: {
      payrollMonth: "asc",
    },
    select: payrollSummarySelect,
  });

  return summaries.map((summary) => ({
    id: summary.id,
    payrollMonth: summary.payrollMonth,
    payrollYear: summary.payrollYear,
    totalSalary: summary.totalSalary || 0,
    totalBreakfastAllowance:
      summary.totalBreakfastAllowance || 0,
    totalOtherAllowances:
      summary.totalOtherAllowances || 0,
    totalPreviousAdvance:
      summary.totalPreviousLoan || 0,
    totalCurrentAdvance: summary.totalCurrentLoan || 0,
    totalDeduction: summary.totalLoanDeduction || 0,
    totalNetLoan: summary.totalNetLoan || 0,
    totalPreviousChallan:
      summary.totalPreviousChallan || 0,
    totalCurrentChallan:
      summary.totalCurrentChallan || 0,
    totalChallanDeduction:
      summary.totalChallanDeduction || 0,
    totalNetChallan: summary.totalNetChallan || 0,
    totalNetSalaryPayable:
      summary.totalNetSalaryPayable || 0,
    totalCardSalary: summary.totalCardSalary || 0,
    totalCashSalary: summary.totalCashSalary || 0,
    payrollStatusId: summary.payrollStatusId,
    createdDate: summary.createdDate,
    createdBy: summary.createdBy,
    modifiedDate: summary.modifiedDate,
    modifiedBy: summary.modifiedBy,
    payrollStatus: summary.payrollStatus,
  }));
};

/**
 * Get payroll date by id
 */
export const getPayrollDate = async (
  id: number
): Promise<{
  payrollMonth: number;
  payrollYear: number;
  payrollStatusId: number | null;
} | null> => {
  const payroll = await prisma.payrollSummary.findUnique({
    where: { id },
    select: {
      payrollMonth: true,
      payrollYear: true,
      payrollStatusId: true,
    },
  });

  return payroll;
};

/**
 * Get payroll summary status for a specific month and year
 */
export const getPayrollSummaryStatusByMonthYear = async (
  month: number,
  year: number
): Promise<{
  id: number;
  payrollStatusId: number | null;
  payrollStatus: { id: number; nameEn: string } | null;
} | null> => {
  const summary = await prisma.payrollSummary.findFirst({
    where: { payrollMonth: month, payrollYear: year },
    select: {
      id: true,
      payrollStatusId: true,
      payrollStatus: { select: { id: true, nameEn: true } },
    },
  });
  return summary ?? null;
};
