/**
 * Exit Reentry Service
 * Business logic for exit reentry operations
 */

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

// Employee status name constants
const EMPLOYEE_STATUS_NAMES = {
  ACTIVE: "Active",
  VACATION: "Vacation",
} as const;

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
      select: { id: true },
    });

    if (!employee) {
      throw new Error(`Employee with ID ${data.employeeId} does not exist`);
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
        date: new Date(data.date),
        type: data.type,
        remarks: data.remarks ?? null,
      },
      select: exitReentrySelect,
    });

    // Update employee status and dates based on type
    const exitReentryDate = new Date(data.date);

    if (data.type === "EXIT") {
      // Find "Vacation" status
      const vacationStatus = await tx.employeeStatus.findFirst({
        where: { nameEn: EMPLOYEE_STATUS_NAMES.VACATION },
        select: { id: true },
      });

      if (vacationStatus) {
        await tx.employee.update({
          where: { id: data.employeeId },
          data: {
            statusId: vacationStatus.id,
            lastExitDate: exitReentryDate,
          },
        });
      } else {
        // Update lastExitDate even if status not found
        await tx.employee.update({
          where: { id: data.employeeId },
          data: { lastExitDate: exitReentryDate },
        });
      }
    } else if (data.type === "ENTRY") {
      // Find "Active" status
      const activeStatus = await tx.employeeStatus.findFirst({
        where: { nameEn: EMPLOYEE_STATUS_NAMES.ACTIVE },
        select: { id: true },
      });

      if (activeStatus) {
        await tx.employee.update({
          where: { id: data.employeeId },
          data: {
            statusId: activeStatus.id,
            lastEntryDate: exitReentryDate,
          },
        });
      } else {
        // Update lastEntryDate even if status not found
        await tx.employee.update({
          where: { id: data.employeeId },
          data: { lastEntryDate: exitReentryDate },
        });
      }
    }

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
      select: { id: true, employeeId: true, type: true, date: true },
    });

    if (!existingExitReentry) {
      throw new Error("Exit reentry not found");
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
    if (data.date !== undefined) updateData.date = new Date(data.date);
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
      ? new Date(data.date)
      : new Date(existingExitReentry.date);

    if (exitReentryType === "EXIT") {
      // Find "Vacation" status
      const vacationStatus = await tx.employeeStatus.findFirst({
        where: { nameEn: EMPLOYEE_STATUS_NAMES.VACATION },
        select: { id: true },
      });

      if (vacationStatus) {
        await tx.employee.update({
          where: { id: employeeId },
          data: {
            statusId: vacationStatus.id,
            lastExitDate: exitReentryDate,
          },
        });
      } else {
        // Update lastExitDate even if status not found
        await tx.employee.update({
          where: { id: employeeId },
          data: { lastExitDate: exitReentryDate },
        });
      }
    } else if (exitReentryType === "ENTRY") {
      // Find "Active" status
      const activeStatus = await tx.employeeStatus.findFirst({
        where: { nameEn: EMPLOYEE_STATUS_NAMES.ACTIVE },
        select: { id: true },
      });

      if (activeStatus) {
        await tx.employee.update({
          where: { id: employeeId },
          data: {
            statusId: activeStatus.id,
            lastEntryDate: exitReentryDate,
          },
        });
      } else {
        // Update lastEntryDate even if status not found
        await tx.employee.update({
          where: { id: employeeId },
          data: { lastEntryDate: exitReentryDate },
        });
      }
    }

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
