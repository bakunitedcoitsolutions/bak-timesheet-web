/**
 * Loan Service
 * Business logic for loan operations
 */

import { prisma } from "@/lib/db/prisma";
import type {
  CreateLoanData,
  UpdateLoanData,
  ListLoansParams,
  ListLoansResponse,
} from "./loan.dto";
import { convertDecimalToNumber } from "@/lib/db/utils";

// Type helper for Prisma transaction client
type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

// Reusable select object
const loanSelect = {
  id: true,
  employeeId: true,
  date: true,
  type: true,
  amount: true,
  remarks: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Create a new loan
 */
export const createLoan = async (data: CreateLoanData) => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Validate employee exists
    const employee = await tx.employee.findUnique({
      where: { id: data.employeeId },
      select: { id: true },
    });

    if (!employee) {
      throw new Error(`Employee with ID ${data.employeeId} does not exist`);
    }

    const remarks = data.remarks ?? "";

    const loan = await tx.loan.create({
      data: {
        employeeId: data.employeeId,
        date: new Date(data.date),
        type: data.type,
        amount: data.amount,
        remarks: remarks,
      },
      select: loanSelect,
    });

    // Determine amount type: LOAN = DEBIT, RETURN = CREDIT
    const amountType = data.type === "LOAN" ? "DEBIT" : "CREDIT";

    // Create ledger entry (balance will be updated manually)
    await tx.ledger.create({
      data: {
        employeeId: data.employeeId,
        date: new Date(data.date),
        type: "LOAN",
        amountType: amountType as "CREDIT" | "DEBIT",
        amount: data.amount,
        balance: 0, // Will be updated manually
        description: `Loan ${!!remarks ? `(${remarks})` : ""}`,
        loanId: loan.id,
      },
    });

    // Convert Decimal to number for client serialization
    return {
      ...loan,
      amount: convertDecimalToNumber(loan.amount),
    };
  });
};

/**
 * Get loan by ID
 */
export const findLoanById = async (id: number) => {
  const loan = await prisma.loan.findUnique({
    where: { id },
    select: loanSelect,
  });

  if (!loan) {
    return null;
  }

  // Convert Decimal to number for client serialization
  return {
    ...loan,
    amount: convertDecimalToNumber(loan.amount),
  };
};

/**
 * Update loan
 */
export const updateLoan = async (id: number, data: UpdateLoanData) => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if loan exists and get current data
    const existingLoan = await tx.loan.findUnique({
      where: { id },
      select: {
        id: true,
        employeeId: true,
        date: true,
        type: true,
        amount: true,
        remarks: true,
      },
    });

    if (!existingLoan) {
      throw new Error("Loan not found");
    }

    // Validate employee if provided
    if (data.employeeId !== undefined) {
      const employee = await tx.employee.findUnique({
        where: { id: data.employeeId },
        select: { id: true },
      });

      if (!employee) {
        throw new Error(`Employee with ID ${data.employeeId} does not exist`);
      }
    }

    const updateData: any = {};

    if (data.employeeId !== undefined) updateData.employeeId = data.employeeId;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.type !== undefined) updateData.type = data.type;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.remarks !== undefined) updateData.remarks = data.remarks ?? null;

    const loan = await tx.loan.update({
      where: { id },
      data: updateData,
      select: loanSelect,
    });

    // Find and update the corresponding ledger entry
    const ledgerEntry = await tx.ledger.findFirst({
      where: { loanId: id },
      select: {
        id: true,
        createdAt: true,
        amount: true,
        amountType: true,
        balance: true,
      },
    });

    if (ledgerEntry) {
      const employeeId = data.employeeId ?? existingLoan.employeeId;

      const remarks = updateData?.remarks ?? existingLoan?.remarks ?? "";

      // Determine amount type: LOAN = DEBIT, RETURN = CREDIT
      const loanType = data.type ?? existingLoan.type;
      const amountType = loanType === "LOAN" ? "DEBIT" : "CREDIT";

      // Update the current ledger entry (balance will be updated manually)
      await tx.ledger.update({
        where: { id: ledgerEntry.id },
        data: {
          employeeId: employeeId,
          date: data.date ? new Date(data.date) : new Date(existingLoan.date),
          type: "LOAN",
          amountType: amountType as "CREDIT" | "DEBIT",
          amount: data.amount ?? existingLoan.amount,
          description: `Loan ${!!remarks ? `(${remarks})` : ""}`,
        },
      });
    }

    // Convert Decimal to number for client serialization
    return {
      ...loan,
      amount: convertDecimalToNumber(loan.amount),
    };
  });
};

/**
 * Delete loan
 */
export const deleteLoan = async (id: number) => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if loan exists
    const existingLoan = await tx.loan.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingLoan) {
      throw new Error("Loan not found");
    }

    // Find and delete the corresponding ledger entry
    const ledgerEntry = await tx.ledger.findFirst({
      where: { loanId: id },
      select: { id: true },
    });

    if (ledgerEntry) {
      await tx.ledger.delete({
        where: { id: ledgerEntry.id },
      });
    }

    await tx.loan.delete({
      where: { id },
    });

    return { success: true };
  });
};

/**
 * List loans with pagination, sorting, and search
 */
export const listLoans = async (
  params: ListLoansParams
): Promise<ListLoansResponse> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  // Search filter (search in remarks)
  if (params.search) {
    where.remarks = { contains: params.search, mode: "insensitive" };
  }

  // Filter by employeeId
  if (params.employeeId !== undefined) {
    where.employeeId = params.employeeId;
  }

  // Filter by type
  if (params.type !== undefined) {
    where.type = params.type;
  }

  // Filter by date range
  if (params.startDate || params.endDate) {
    where.date = {};
    if (params.startDate) {
      where.date.gte = new Date(params.startDate);
    }
    if (params.endDate) {
      where.date.lte = new Date(params.endDate);
    }
  }

  // Build orderBy clause
  const orderBy: any = {};
  if (params.sortBy) {
    orderBy[params.sortBy] = params.sortOrder ?? "desc";
  } else {
    orderBy.createdAt = "desc"; // Default sort
  }

  // Get total count
  const total = await prisma.loan.count({ where });

  // Get loans
  const loans = await prisma.loan.findMany({
    where,
    skip,
    take: limit,
    select: loanSelect,
    orderBy,
  });

  // Convert Decimal to number for client serialization
  const transformedLoans = loans.map((loan) => ({
    ...loan,
    amount: convertDecimalToNumber(loan.amount),
  }));

  return {
    loans: transformedLoans,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
