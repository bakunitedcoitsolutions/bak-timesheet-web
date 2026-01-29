/**
 * Ledger Service
 * Business logic for ledger operations
 */

import { prisma } from "@/lib/db/prisma";
import type {
  GetLedgerByEmployeeCodeParams,
  GetLedgerByEmployeeCodeResponse,
} from "./ledger.dto";

/**
 * Helper function to convert Decimal to number for client serialization
 */
const convertDecimalToNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  // Handle Prisma.Decimal
  if (typeof value === "object" && "toNumber" in value) {
    return value.toNumber();
  }
  return Number(value);
};

/**
 * Get ledger entries by employee code
 * Returns all ledger entries for the employee (no pagination)
 */
export const getLedgerByEmployeeCode = async (
  params: GetLedgerByEmployeeCodeParams
): Promise<GetLedgerByEmployeeCodeResponse> => {
  // First, find the employee by employeeCode
  const employee = await prisma.employee.findUnique({
    where: { employeeCode: params.employeeCode },
    select: {
      id: true,
      employeeCode: true,
      nameEn: true,
      nameAr: true,
      designationId: true,
      idCardNo: true,
    },
  });

  if (!employee) {
    return {
      employee: null,
      ledgerEntries: [],
    };
  }

  // Get all ledger entries for this employee (no pagination)
  const ledgerEntries = await prisma.ledger.findMany({
    where: {
      employeeId: employee.id,
    },
    orderBy: [
      { createdAt: "asc" }, // Order by creation date ascending
    ],
    select: {
      id: true,
      employeeId: true,
      date: true,
      type: true,
      amountType: true,
      amount: true,
      balance: true,
      description: true,
      reference: true,
      createdAt: true,
      updatedAt: true,
      payrollId: true,
      loanId: true,
      trafficChallanId: true,
    },
  });

  // Convert Decimal fields to numbers for client serialization
  const transformedLedgerEntries = ledgerEntries.map((entry) => ({
    ...entry,
    amount: convertDecimalToNumber(entry.amount),
    balance: convertDecimalToNumber(entry.balance),
  }));

  return {
    employee: {
      id: employee.id,
      employeeCode: employee.employeeCode,
      nameEn: employee.nameEn,
      nameAr: employee.nameAr,
      designationId: employee.designationId,
      idCardNo: employee.idCardNo,
    },
    ledgerEntries: transformedLedgerEntries,
  };
};
