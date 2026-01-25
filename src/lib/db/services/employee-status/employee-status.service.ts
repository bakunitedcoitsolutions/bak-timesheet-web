/**
 * Employee Status Service
 * Business logic for employee status operations
 */

import { prisma } from "@/lib/db/prisma";
import type {
  CreateEmployeeStatusData,
  UpdateEmployeeStatusData,
  ListEmployeeStatusesParams,
  ListEmployeeStatusesResponse,
} from "./employee-status.dto";

// Type helper for Prisma transaction client
type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

// Reusable select object
const employeeStatusSelect = {
  id: true,
  nameEn: true,
  nameAr: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Create a new employee status
 */
export const createEmployeeStatus = async (data: CreateEmployeeStatusData) => {
  // Validate: nameEn must be unique
  const existingEmployeeStatus = await prisma.employeeStatus.findFirst({
    where: { nameEn: data.nameEn },
    select: { id: true },
  });

  if (existingEmployeeStatus) {
    throw new Error("Employee Status name already exists");
  }

  const employeeStatus = await prisma.employeeStatus.create({
    data: {
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      isActive: data.isActive ?? true,
    },
    select: employeeStatusSelect,
  });

  return employeeStatus;
};

/**
 * Get employee status by ID
 */
export const findEmployeeStatusById = async (id: number) => {
  return prisma.employeeStatus.findUnique({
    where: { id },
    select: employeeStatusSelect,
  });
};

/**
 * Update employee status
 */
export const updateEmployeeStatus = async (id: number, data: UpdateEmployeeStatusData) => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if employee status exists
    const existingEmployeeStatus = await tx.employeeStatus.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingEmployeeStatus) {
      throw new Error("Employee Status not found");
    }

    // Validate: nameEn must be unique (if being updated)
    if (data.nameEn !== undefined) {
      const duplicateEmployeeStatus = await tx.employeeStatus.findFirst({
        where: {
          nameEn: data.nameEn,
          NOT: { id },
        },
        select: { id: true },
      });

      if (duplicateEmployeeStatus) {
        throw new Error("Employee Status name already exists");
      }
    }

    const updateData: any = {};

    if (data.nameEn !== undefined) updateData.nameEn = data.nameEn;
    if (data.nameAr !== undefined) updateData.nameAr = data.nameAr;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updatedEmployeeStatus = await tx.employeeStatus.update({
      where: { id },
      data: updateData,
      select: employeeStatusSelect,
    });

    return updatedEmployeeStatus;
  });
};

/**
 * Delete employee status
 */
export const deleteEmployeeStatus = async (id: number): Promise<void> => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if employee status exists
    const existingEmployeeStatus = await tx.employeeStatus.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingEmployeeStatus) {
      throw new Error("Employee Status not found");
    }

    // Check if employee status is being used by employees
    const employeesCount = await tx.employee.count({
      where: { statusId: id },
    });

    if (employeesCount > 0) {
      throw new Error(
        `Cannot delete employee status: ${employeesCount} employee(s) are assigned to this status`
      );
    }

    // Delete employee status
    await tx.employeeStatus.delete({
      where: { id },
    });
  });
};

/**
 * List employee statuses with pagination and sorting
 */
export const listEmployeeStatuses = async (
  params: ListEmployeeStatusesParams
): Promise<ListEmployeeStatusesResponse> => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params.search) {
    where.OR = [
      { nameEn: { contains: params.search, mode: "insensitive" } },
      { nameAr: { contains: params.search, mode: "insensitive" } },
    ];
  }

  // Determine sort order (default: desc)
  const sortOrder = params.sortOrder || "desc";

  // Build orderBy clause based on sortBy parameter
  let orderBy: any = { createdAt: "desc" }; // Default sort

  if (params.sortBy) {
    const sortBy = params.sortBy;
    const validFields = ["nameEn", "nameAr", "isActive"] as const;

    // Only allow sorting by the specified valid fields
    if (validFields.includes(sortBy)) {
      orderBy = { [sortBy]: sortOrder };
    }
  }

  const [employeeStatuses, total] = await Promise.all([
    prisma.employeeStatus.findMany({
      where,
      skip,
      take: limit,
      select: employeeStatusSelect,
      orderBy,
    }),
    prisma.employeeStatus.count({ where }),
  ]);

  return {
    employeeStatuses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
