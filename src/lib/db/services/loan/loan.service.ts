/**
 * Loan Service
 * Business logic for loan operations
 */

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import type {
  ListedLoan,
  CreateLoanData,
  UpdateLoanData,
  ListLoansParams,
  ListLoansResponse,
  BulkUploadLoanData,
  BulkUploadLoanResult,
} from "./loan.dto";
import dayjs from "@/lib/dayjs";
import { refreshPayrollForEmployeesIfActive } from "../payroll-summary/payroll-actions.service";

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
  employee: {
    select: {
      nameEn: true,
      employeeCode: true,
      branchId: true,
      designation: {
        select: {
          nameEn: true,
        },
      },
    },
  },
};

/**
 * Internal reusable function to create a loan with ledger entry
 * This function handles the creation of both loan and ledger entry with balance calculation
 */
async function createLoanHelper(
  tx: PrismaTransactionClient,
  data: {
    employeeId: number;
    date: Date | string;
    type: "LOAN" | "RETURN";
    amount: number | any;
    remarks?: string;
    userId?: number;
  }
) {
  const remarks = data.remarks ?? "";

  // Create loan
  const loan = await tx.loan.create({
    data: {
      employeeId: data.employeeId,
      date: dayjs(data.date).toDate(),
      type: data.type,
      amount: data.amount,
      remarks: remarks,
      ...(data.userId && {
        createdBy: data.userId,
      }),
    },
    select: loanSelect,
  });

  return loan;
}

/**
 * Create a new loan
 */
export const createLoan = async (data: CreateLoanData) => {
  const user = await getCurrentUser();
  const userId = user?.id;

  const result = await prisma.$transaction(
    async (tx: PrismaTransactionClient) => {
      // Validate employee exists
      const employee = await tx.employee.findUnique({
        where: { id: data.employeeId },
        select: { id: true },
      });

      if (!employee) {
        throw new Error(`Employee with ID ${data.employeeId} does not exist`);
      }

      // Validate Branch
      if (data.branchId) {
        const employeeWithBranch = await tx.employee.findUnique({
          where: { id: data.employeeId },
          select: { branchId: true },
        });
        if (employeeWithBranch?.branchId !== data.branchId) {
          throw new Error("Employee does not belong to your branch");
        }
      }

      const loan = await createLoanHelper(tx, {
        employeeId: data.employeeId,
        date: data.date,
        type: data.type,
        amount: data.amount,
        remarks: data.remarks,
        userId,
      });

      // Convert Decimal to number for client serialization
      return {
        ...loan,
        amount: loan.amount,
      };
    }
  );

  // Trigger payroll refresh if active
  await refreshPayrollForEmployeesIfActive([data.employeeId], data.date);

  return result;
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
    amount: loan.amount,
  };
};

/**
 * Update loan
 */
export const updateLoan = async (id: number, data: UpdateLoanData) => {
  const user = await getCurrentUser();
  const userId = user?.id;

  const result = await prisma.$transaction(
    async (tx: PrismaTransactionClient) => {
      // Check if loan exists and get current data
      const existingLoan = await tx.loan.findUnique({
        where: { id },
        select: {
          id: true,
          employee: { select: { branchId: true } },
        },
      });

      if (!existingLoan) {
        throw new Error("Loan not found");
      }

      // Security validation: verify branch assignment for branch-scoped users
      if (data.branchId && existingLoan.employee?.branchId !== data.branchId) {
        throw new Error("Access Denied: Loan belongs to another branch.");
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

      if (data.employeeId !== undefined)
        updateData.employeeId = data.employeeId;
      if (data.date !== undefined) updateData.date = dayjs(data.date).toDate();
      if (data.type !== undefined) updateData.type = data.type;
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.remarks !== undefined) updateData.remarks = data.remarks ?? null;

      const loan = await tx.loan.update({
        where: { id },
        data: {
          ...updateData,
          ...(userId && { updatedBy: userId }),
        },
        select: loanSelect,
      });

      // Convert Decimal to number for client serialization
      return {
        ...loan,
        amount: loan.amount,
      };
    }
  );

  // Trigger payroll refresh if active
  await refreshPayrollForEmployeesIfActive([result.employeeId], result.date);

  return result;
};

/**
 * Delete loan
 */
export const deleteLoan = async (id: number, branchId?: number) => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if loan exists
    const existingLoan = await tx.loan.findUnique({
      where: { id },
      select: {
        id: true,
        employeeId: true,
        date: true,
        employee: { select: { branchId: true } },
      },
    });

    if (!existingLoan) {
      throw new Error("Loan not found");
    }

    // Security validation: verify branch assignment for branch-scoped users
    if (branchId && existingLoan.employee?.branchId !== branchId) {
      throw new Error("Access Denied: Loan belongs to another branch.");
    }

    await tx.loan.delete({
      where: { id },
    });

    // Trigger payroll refresh if active
    await refreshPayrollForEmployeesIfActive(
      [existingLoan.employeeId],
      existingLoan.date
    );

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

  // Search filter (search in remarks, employee name, employee code)
  if (params.search) {
    const search = params.search;
    const searchAsNumber = Number(search);
    const isNumber = !isNaN(searchAsNumber);

    where.OR = [
      { remarks: { contains: search, mode: "insensitive" } },
      { employee: { nameEn: { contains: search, mode: "insensitive" } } },
      { employee: { nameAr: { contains: search, mode: "insensitive" } } },
    ];

    if (isNumber) {
      where.OR.push({ employee: { employeeCode: searchAsNumber } });
    }
  }

  // Filter by employeeId
  if (params.employeeId !== undefined) {
    where.employeeId = params.employeeId;
  }

  // Filter by branchId via employee relation
  if (params.branchId) {
    where.employee = {
      ...(where.employee || {}),
      branchId: params.branchId,
    };
  }

  // Filter by type
  if (params.type !== undefined) {
    where.type = params.type;
  }

  // Filter by date range
  if (params.startDate || params.endDate) {
    where.date = {};
    if (params.startDate) {
      where.date.gt = dayjs(params.startDate).toDate();
    }
    if (params.endDate) {
      where.date.lte = dayjs(params.endDate).toDate();
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
    amount: loan.amount,
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
 * List ALL loans (no pagination) — used for exports
 */
export interface ListAllLoansParams {
  search?: string;
  employeeId?: number;
  branchId?: number | null;
  type?: "LOAN" | "RETURN";
  startDate?: Date | string;
  endDate?: Date | string;
}

export const listAllLoans = async (
  params: ListAllLoansParams
): Promise<{ loans: ListedLoan[] }> => {
  // Build where clause (same logic as listLoans, minus pagination)
  const where: any = {};

  if (params.search) {
    const search = params.search;
    const searchAsNumber = Number(search);
    const isNumber = !isNaN(searchAsNumber);

    where.OR = [
      { remarks: { contains: search, mode: "insensitive" } },
      { employee: { nameEn: { contains: search, mode: "insensitive" } } },
      { employee: { nameAr: { contains: search, mode: "insensitive" } } },
    ];

    if (isNumber) {
      where.OR.push({ employee: { employeeCode: searchAsNumber } });
    }
  }

  if (params.employeeId !== undefined) {
    where.employeeId = params.employeeId;
  }

  // Filter by branchId via employee relation
  if (params.branchId) {
    where.employee = {
      ...(where.employee || {}),
      branchId: params.branchId,
    };
  }

  if (params.type !== undefined) {
    where.type = params.type;
  }

  if (params.startDate || params.endDate) {
    where.date = {};
    if (params.startDate) {
      where.date.gt = dayjs(params.startDate).toDate();
    }
    if (params.endDate) {
      where.date.lte = dayjs(params.endDate).toDate();
    }
  }

  const loans = await prisma.loan.findMany({
    where,
    select: loanSelect,
    orderBy: { date: "asc" },
  });

  return {
    loans: loans.map((loan) => ({ ...loan, amount: loan.amount })),
  };
};

/**
 * Bulk upload loans
 */
export const bulkUploadLoans = async (
  data: BulkUploadLoanData
): Promise<BulkUploadLoanResult> => {
  const user = await getCurrentUser();
  const userId = user?.id;

  const refreshDetails: Map<string, Set<number>> = new Map();
  const res: BulkUploadLoanResult = {
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

        // Validate Branch for branch user
        if (data.branchId) {
          const employeeWithBranch = await tx.employee.findUnique({
            where: { id: employee.id },
            select: { branchId: true },
          });
          if (employeeWithBranch?.branchId !== data.branchId) {
            throw new Error(
              `Employee ${row.employeeCode} does not belong to your branch`
            );
          }
        }

        // Create loan with ledger entry using reusable function
        await createLoanHelper(tx, {
          employeeId: employee.id,
          date: row.date,
          type: row.type,
          amount: row.amount,
          remarks: row.remarks,
          userId,
        });

        // Collect info for batch refresh
        const dateKey = dayjs(row.date).format("YYYY-MM");
        if (!refreshDetails.has(dateKey)) {
          refreshDetails.set(dateKey, new Set());
        }
        refreshDetails.get(dateKey)!.add(employee.id);
      });

      res.success++;
    } catch (error: any) {
      console.error(error);
      res.failed++;
      res.errors.push({
        row: rowNumber,
        data: row,
        error: error.message || "Unknown error",
      });
    }
  }

  // Trigger payroll refresh for all affected months/employees
  for (const [dateKey, employeeIds] of refreshDetails.entries()) {
    const [year, month] = dateKey.split("-").map(Number);
    const dateObj = dayjs()
      .year(year)
      .month(month - 1)
      .toDate();
    await refreshPayrollForEmployeesIfActive(Array.from(employeeIds), dateObj);
  }

  return res;
};
