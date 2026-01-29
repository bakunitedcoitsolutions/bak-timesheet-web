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
  BulkUploadLoanData,
  BulkUploadLoanResult,
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
 * Internal reusable function to create a loan with ledger entry
 * This function handles the creation of both loan and ledger entry with balance calculation
 */
async function createLoanWithLedger(
  tx: PrismaTransactionClient,
  data: {
    employeeId: number;
    date: Date | string;
    type: "LOAN" | "RETURN";
    amount: number | any;
    remarks?: string;
  }
) {
  const remarks = data.remarks ?? "";

  // Create loan
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

  // Get the previous balance (balance of the entry just before this one, based on createdAt)
  const previousEntry = await tx.ledger.findFirst({
    where: {
      employeeId: data.employeeId,
    },
    orderBy: [{ createdAt: "desc" }],
    select: { balance: true },
  });

  // Calculate previous balance (0 if no previous entry)
  let previousBalance = 0;
  if (previousEntry) {
    previousBalance = Number(previousEntry.balance);
  }

  // Calculate new balance for current entry
  // CREDIT increases balance, DEBIT decreases balance
  const amountNum = Number(data.amount);
  let newBalance = previousBalance;
  if (amountType === "CREDIT") {
    newBalance = previousBalance + amountNum;
  } else if (amountType === "DEBIT") {
    newBalance = previousBalance - amountNum;
  }

  // Create ledger entry with calculated balance
  await tx.ledger.create({
    data: {
      employeeId: data.employeeId,
      date: new Date(data.date),
      type: "LOAN",
      amountType: amountType as "CREDIT" | "DEBIT",
      amount: data.amount,
      balance: newBalance,
      description: `Loan ${!!remarks ? `(${remarks})` : ""}`,
      loanId: loan.id,
    },
  });

  return loan;
}

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

    const loan = await createLoanWithLedger(tx, {
      employeeId: data.employeeId,
      date: data.date,
      type: data.type,
      amount: data.amount,
      remarks: data.remarks,
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
        date: true,
      },
    });

    if (ledgerEntry) {
      const employeeId = data.employeeId ?? existingLoan.employeeId;

      const remarks = updateData?.remarks ?? existingLoan?.remarks ?? "";

      // Determine amount type: LOAN = DEBIT, RETURN = CREDIT
      const loanType = data.type ?? existingLoan.type;
      const amountType = loanType === "LOAN" ? "DEBIT" : "CREDIT";

      const newAmount = data.amount ?? existingLoan.amount;
      const newDate = data.date
        ? new Date(data.date)
        : new Date(existingLoan.date);

      // Check if amount or amountType changed (date changes don't trigger balance recalculation)
      const oldAmount = Number(ledgerEntry.amount);
      const newAmountNum = Number(newAmount);
      const amountChanged = oldAmount !== newAmountNum;
      const amountTypeChanged = ledgerEntry.amountType !== amountType;

      // Only update balances if amount or amountType changed
      if (amountChanged || amountTypeChanged) {
        // Get the previous balance (balance of the entry just before this one, based on createdAt)
        const previousEntry = await tx.ledger.findFirst({
          where: {
            employeeId: employeeId,
            id: { not: ledgerEntry.id }, // Exclude current entry
            createdAt: { lt: ledgerEntry.createdAt },
          },
          orderBy: [{ createdAt: "desc" }],
          select: { balance: true },
        });

        // Calculate previous balance (0 if no previous entry)
        let previousBalance = 0;
        if (previousEntry) {
          previousBalance = Number(previousEntry.balance);
        }

        // Calculate new balance for current entry
        // CREDIT increases balance, DEBIT decreases balance
        let newBalance = previousBalance;
        if (amountType === "CREDIT") {
          newBalance = previousBalance + newAmountNum;
        } else if (amountType === "DEBIT") {
          newBalance = previousBalance - newAmountNum;
        }

        // Update the current ledger entry
        await tx.ledger.update({
          where: { id: ledgerEntry.id },
          data: {
            employeeId: employeeId,
            date: newDate,
            type: "LOAN",
            amountType: amountType as "CREDIT" | "DEBIT",
            amount: newAmount,
            balance: newBalance,
            description: `Loan ${!!remarks ? `(${remarks})` : ""}`,
          },
        });

        // Get all ledger entries after this one (based on createdAt)
        const subsequentEntries = await tx.ledger.findMany({
          where: {
            employeeId: employeeId,
            id: { not: ledgerEntry.id }, // Exclude current entry
            createdAt: { gt: ledgerEntry.createdAt },
          },
          orderBy: [{ createdAt: "asc" }],
          select: { id: true, amount: true, amountType: true, balance: true },
        });

        // Recalculate balances for all subsequent entries
        let currentBalance = newBalance;
        for (const entry of subsequentEntries) {
          const entryAmount = Number(entry.amount);
          if (entry.amountType === "CREDIT") {
            currentBalance = currentBalance + entryAmount;
          } else if (entry.amountType === "DEBIT") {
            currentBalance = currentBalance - entryAmount;
          }

          await tx.ledger.update({
            where: { id: entry.id },
            data: { balance: currentBalance },
          });
        }
      } else {
        // Amount and amountType didn't change, just update other fields
        await tx.ledger.update({
          where: { id: ledgerEntry.id },
          data: {
            employeeId: employeeId,
            date: newDate,
            type: "LOAN",
            amountType: amountType as "CREDIT" | "DEBIT",
            amount: newAmount,
            description: `Loan ${!!remarks ? `(${remarks})` : ""}`,
          },
        });
      }
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

/**
 * Bulk upload loans
 */
export const bulkUploadLoans = async (
  data: BulkUploadLoanData
): Promise<BulkUploadLoanResult> => {
  const result: BulkUploadLoanResult = {
    success: 0,
    failed: 0,
    errors: [],
  };

  // Process each loan in a transaction
  for (let i = 0; i < data.loans.length; i++) {
    const row = data.loans[i];
    const rowNumber = i + 1; // 1-indexed for user-friendly error messages

    try {
      await prisma.$transaction(async (tx: PrismaTransactionClient) => {
        // Resolve employeeId from employeeCode
        const employee = await tx.employee.findUnique({
          where: { employeeCode: row.employeeCode },
          select: { id: true },
        });

        if (!employee) {
          throw new Error(`Employee with code ${row.employeeCode} not found`);
        }

        // Create loan with ledger entry using reusable function
        await createLoanWithLedger(tx, {
          employeeId: employee.id,
          date: row.date,
          type: row.type,
          amount: row.amount,
          remarks: row.remarks,
        });
      });

      result.success++;
    } catch (error: any) {
      console.error(error);
      console.error(error.message);
      console.error(error.stack);
      console.error(error.cause);
      console.error(error.code);
      console.error(error.name);
      console.error(error.syscall);
      console.error(error.address);
      console.error(error.port);
      result.failed++;
      result.errors.push({
        row: rowNumber,
        data: row,
        error: error.message || "Unknown error",
      });
    }
  }

  return result;
};
