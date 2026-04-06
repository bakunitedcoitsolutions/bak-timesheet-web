/**
 * Exit Reentry Service
 * Business logic for exit reentry operations
 */

import dayjs from "@/lib/dayjs";
import { prisma } from "@/lib/db/prisma";
import type {
  CreateExitReentryData,
  UpdateExitReentryData,
  ListExitReentriesParams,
  ListExitReentriesResponse,
} from "./exit-reentry.dto";

// Type helper for Prisma transaction client
type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

// Reusable select object
const exitReentrySelect = {
  id: true,
  employeeId: true,
  designationId: true,
  date: true,
  type: true,
  remarks: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Create a new exit reentry
 */
export const createExitReentry = async (data: CreateExitReentryData) => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Validate employee exists
    const employee = await tx.employee.findUnique({
      where: { id: data.employeeId },
      select: { id: true, branchId: true },
    });

    if (!employee) {
      throw new Error(`Employee with ID ${data.employeeId} does not exist`);
    }

    // Security validation: verify branch assignment for branch-scoped users
    if (data.branchId && employee?.branchId !== data.branchId) {
      throw new Error("Employee does not belong to your branch");
    }

    // Validate designation if provided
    if (data.designationId !== undefined) {
      const designation = await tx.designation.findUnique({
        where: { id: data.designationId },
        select: { id: true },
      });

      if (!designation) {
        throw new Error(
          `Designation with ID ${data.designationId} does not exist`
        );
      }
    }

    const exitReentry = await tx.exitReentry.create({
      data: {
        employeeId: data.employeeId,
        designationId: data.designationId ?? null,
        date: dayjs(data.date).toDate(),
        type: data.type,
        remarks: data.remarks ?? null,
      },
      select: exitReentrySelect,
    });

    // Update employee status and dates based on type
    const exitReentryDate = dayjs(data.date).toDate();

    await tx.employee.update({
      where: { id: data.employeeId },
      data:
        data.type === "EXIT"
          ? // 4 is vacation status
            { statusId: 4, lastExitDate: exitReentryDate }
          : // 1 is active status
            { statusId: 1, lastEntryDate: exitReentryDate },
    });

    return exitReentry;
  });
};

/**
 * Get exit reentry by ID
 */
export const findExitReentryById = async (id: number) => {
  const exitReentry = await prisma.exitReentry.findUnique({
    where: { id },
    select: exitReentrySelect,
  });

  if (!exitReentry) {
    return null;
  }

  return exitReentry;
};

/**
 * Update exit reentry
 */
export const updateExitReentry = async (
  id: number,
  data: UpdateExitReentryData
) => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if exit reentry exists and get current data
    const existingExitReentry = await tx.exitReentry.findUnique({
      where: { id },
      select: {
        id: true,
        employeeId: true,
        type: true,
        date: true,
        employee: { select: { branchId: true } },
      },
    });

    if (!existingExitReentry) {
      throw new Error("Exit reentry not found");
    }

    // Security validation: verify branch assignment for branch-scoped users
    if (
      data.branchId &&
      existingExitReentry.employee?.branchId !== data.branchId
    ) {
      throw new Error(
        "Access Denied: Exit/Re-entry belongs to another branch."
      );
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

    // Validate designation if provided
    if (data.designationId !== undefined && data.designationId !== null) {
      const designation = await tx.designation.findUnique({
        where: { id: data.designationId },
        select: { id: true },
      });

      if (!designation) {
        throw new Error(
          `Designation with ID ${data.designationId} does not exist`
        );
      }
    }

    const updateData: any = {};

    if (data.employeeId !== undefined) updateData.employeeId = data.employeeId;
    if (data.designationId !== undefined)
      updateData.designationId = data.designationId ?? null;
    if (data.date !== undefined) updateData.date = dayjs(data.date).toDate();
    if (data.type !== undefined) updateData.type = data.type;
    if (data.remarks !== undefined) updateData.remarks = data.remarks ?? null;

    const exitReentry = await tx.exitReentry.update({
      where: { id },
      data: updateData,
      select: exitReentrySelect,
    });

    // Update employee status and dates based on type
    const exitReentryType = data.type ?? existingExitReentry.type;
    const employeeId = data.employeeId ?? existingExitReentry.employeeId;
    const exitReentryDate = data.date
      ? dayjs(data.date).toDate()
      : dayjs(existingExitReentry.date).toDate();
    await tx.employee.update({
      where: { id: employeeId },
      data:
        exitReentryType === "EXIT"
          ? // 4 is vacation status
            { statusId: 4, lastExitDate: exitReentryDate }
          : // 1 is active status
            { statusId: 1, lastEntryDate: exitReentryDate },
    });

    return exitReentry;
  });
};

/**
 * Delete exit reentry
 */
export const deleteExitReentry = async (id: number) => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if exit reentry exists
    const existingExitReentry = await tx.exitReentry.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingExitReentry) {
      throw new Error("Exit reentry not found");
    }

    await tx.exitReentry.delete({
      where: { id },
    });

    return { success: true };
  });
};

/**
 * List exit reentries with pagination, sorting, and search
 */
export const listExitReentries = async (
  params: ListExitReentriesParams
): Promise<ListExitReentriesResponse> => {
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

  // Filter by designationId
  if (params.designationId !== undefined) {
    where.designationId = params.designationId;
  }

  // Filter by type
  if (params.type !== undefined) {
    where.type = params.type;
  }

  // Filter by date range
  if (params.startDate || params.endDate) {
    where.date = {};
    if (params.startDate) {
      where.date.gte = dayjs(params.startDate).toDate();
    }
    if (params.endDate) {
      where.date.lte = dayjs(params.endDate).toDate();
    }
  }

  // Filter by branchId via employee relation
  if (params.branchId) {
    where.employee = {
      ...(where?.employee || {}),
      branchId: params.branchId,
    };
  }

  // Build orderBy clause
  const orderBy: any = {};
  if (params.sortBy) {
    orderBy[params.sortBy] = params.sortOrder ?? "desc";
  } else {
    orderBy.createdAt = "desc"; // Default sort
  }

  // Get total count
  const total = await prisma.exitReentry.count({ where });

  // Get exit reentries
  const exitReentries = await prisma.exitReentry.findMany({
    where,
    skip,
    take: limit,
    select: exitReentrySelect,
    orderBy,
  });

  return {
    exitReentries,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
