/**
 * Payroll Summary Service
 * Business logic for payroll summary operations
 */

import { prisma } from "@/lib/db/prisma";
import type {
  GetPayrollSummaryByYearParams,
  PayrollSummaryWithRelations,
} from "./payroll-summary.dto";
import { UpdateMonthlyPayrollValuesInput } from "./payroll-summary.schemas";
import { convertDecimalToNumber } from "@/lib/db/utils";

// Reusable select object
const payrollSummarySelect = {
  id: true,
  payrollMonth: true,
  payrollYear: true,
  totalSalary: true,
  totalPreviousAdvance: true,
  totalCurrentAdvance: true,
  totalDeduction: true,
  totalNetLoan: true,
  totalNetSalaryPayable: true,
  totalCardSalary: true,
  totalCashSalary: true,
  remarks: true,
  payrollStatusId: true,
  branchId: true,
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
  branch: {
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
    ...summary,
    totalSalary: convertDecimalToNumber(summary.totalSalary) || 0,
    totalPreviousAdvance:
      convertDecimalToNumber(summary.totalPreviousAdvance) || 0,
    totalCurrentAdvance:
      convertDecimalToNumber(summary.totalCurrentAdvance) || 0,
    totalDeduction: convertDecimalToNumber(summary.totalDeduction) || 0,
    totalNetLoan: convertDecimalToNumber(summary.totalNetLoan) || 0,
    totalNetSalaryPayable:
      convertDecimalToNumber(summary.totalNetSalaryPayable) || 0,
    totalCardSalary: convertDecimalToNumber(summary.totalCardSalary) || 0,
    totalCashSalary: convertDecimalToNumber(summary.totalCashSalary) || 0,
  }));
};

/**
 * Update monthly payroll values (Recalculate / Post)
 */
export const updateMonthlyPayrollValues = async (
  input: UpdateMonthlyPayrollValuesInput
): Promise<void> => {
  const { payrollYear, payrollMonth, isPosted } = input;

  // 1. Fetch all details for the month/year
  const payrollDetails = await prisma.payrollDetails.findMany({
    where: {
      payrollYear,
      payrollMonth,
    },
  });

  // 2. Calculate sums
  const totalSalary = payrollDetails.reduce(
    (sum, d) => sum + (Number(d.salary) || 0),
    0
  );
  const totalPreviousAdvance = payrollDetails.reduce(
    (sum, d) => sum + (Number(d.previousLoan) || 0),
    0
  );

  const totalCurrentAdvance = payrollDetails.reduce(
    (sum, d) => sum + (Number(d.currentLoan) || 0),
    0
  );
  const totalDeduction = payrollDetails.reduce(
    (sum, d) => sum + (Number(d.deductionLoan) || 0),
    0
  );
  const totalNetLoan = payrollDetails.reduce(
    (sum, d) => sum + (Number(d.netLoan) || 0),
    0
  );
  const totalNetSalaryPayable = payrollDetails.reduce(
    (sum, d) => sum + (Number(d.netSalaryPayable) || 0),
    0
  );
  const totalCardSalary = payrollDetails.reduce(
    (sum, d) => sum + (Number(d.cardSalary) || 0),
    0
  );
  const totalCashSalary = payrollDetails.reduce(
    (sum, d) => sum + (Number(d.cashSalary) || 0),
    0
  );

  // 3. Find summary
  const summary = await prisma.payrollSummary.findFirst({
    where: {
      payrollYear,
      payrollMonth,
    },
  });

  if (!summary) {
    throw new Error("Payroll summary not found");
  }

  // 4. Update summary
  await prisma.payrollSummary.update({
    where: {
      id: summary.id,
    },
    data: {
      totalSalary,
      totalPreviousAdvance,
      totalCurrentAdvance,
      totalDeduction,
      totalNetLoan,
      totalNetSalaryPayable,
      totalCardSalary,
      totalCashSalary,
      ...(isPosted ? { payrollStatusId: 3 } : {}),
    },
  });
};
