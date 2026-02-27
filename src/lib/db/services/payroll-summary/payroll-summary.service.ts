/**
 * Payroll Summary Service
 * Business logic for payroll summary operations
 */

import { prisma } from "@/lib/db/prisma";
import type {
  GetPayrollSummaryByYearParams,
  PayrollSummaryWithRelations,
} from "./payroll-summary.dto";
import { convertDecimalToNumber } from "@/lib/db/utils";

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
    totalSalary: convertDecimalToNumber(summary.totalSalary) || 0,
    totalBreakfastAllowance:
      convertDecimalToNumber(summary.totalBreakfastAllowance) || 0,
    totalOtherAllowances:
      convertDecimalToNumber(summary.totalOtherAllowances) || 0,
    totalPreviousAdvance:
      convertDecimalToNumber(summary.totalPreviousLoan) || 0,
    totalCurrentAdvance: convertDecimalToNumber(summary.totalCurrentLoan) || 0,
    totalDeduction: convertDecimalToNumber(summary.totalLoanDeduction) || 0,
    totalNetLoan: convertDecimalToNumber(summary.totalNetLoan) || 0,
    totalPreviousChallan:
      convertDecimalToNumber(summary.totalPreviousChallan) || 0,
    totalCurrentChallan:
      convertDecimalToNumber(summary.totalCurrentChallan) || 0,
    totalChallanDeduction:
      convertDecimalToNumber(summary.totalChallanDeduction) || 0,
    totalNetChallan: convertDecimalToNumber(summary.totalNetChallan) || 0,
    totalNetSalaryPayable:
      convertDecimalToNumber(summary.totalNetSalaryPayable) || 0,
    totalCardSalary: convertDecimalToNumber(summary.totalCardSalary) || 0,
    totalCashSalary: convertDecimalToNumber(summary.totalCashSalary) || 0,
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
): Promise<{ payrollMonth: number; payrollYear: number } | null> => {
  const payroll = await prisma.payrollSummary.findUnique({
    where: { id },
    select: {
      payrollMonth: true,
      payrollYear: true,
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
