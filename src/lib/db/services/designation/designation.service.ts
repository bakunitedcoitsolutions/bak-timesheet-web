/**
 * Designation Service
 * Business logic for designation operations
 */

import { prisma } from "@/lib/db/prisma";
import type {
  CreateDesignationData,
  UpdateDesignationData,
  ListDesignationsParams,
  ListDesignationsResponse,
} from "./designation.dto";

// Type helper for Prisma transaction client
type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

// Reusable select object
const designationSelect = {
  id: true,
  nameEn: true,
  nameAr: true,
  hoursPerDay: true,
  displayOrderKey: true,
  color: true,
  breakfastAllowance: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Create a new designation
 */
export const createDesignation = async (data: CreateDesignationData) => {
  // Validate: nameEn must be unique
  const existingDesignation = await prisma.designation.findFirst({
    where: { nameEn: data.nameEn },
    select: { id: true },
  });

  if (existingDesignation) {
    throw new Error("Designation name already exists");
  }

  const designation = await prisma.designation.create({
    data: {
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      hoursPerDay: data.hoursPerDay ?? null,
      displayOrderKey: data.displayOrderKey ?? null,
      color: data.color ?? null,
      breakfastAllowance: data.breakfastAllowance ?? null,
      isActive: data.isActive ?? true,
    },
    select: designationSelect,
  });

  return designation;
};

/**
 * Get designation by ID
 */
export const findDesignationById = async (id: number) => {
  return prisma.designation.findUnique({
    where: { id },
    select: designationSelect,
  });
};

/**
 * Update designation
 */
export const updateDesignation = async (
  id: number,
  data: UpdateDesignationData
) => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if designation exists
    const existingDesignation = await tx.designation.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingDesignation) {
      throw new Error("Designation not found");
    }

    // Validate: nameEn must be unique (if being updated)
    if (data.nameEn !== undefined) {
      const duplicateDesignation = await tx.designation.findFirst({
        where: {
          nameEn: data.nameEn,
          NOT: { id },
        },
        select: { id: true },
      });

      if (duplicateDesignation) {
        throw new Error("Designation name already exists");
      }
    }

    const updateData: any = {};

    if (data.nameEn !== undefined) updateData.nameEn = data.nameEn;
    if (data.nameAr !== undefined) updateData.nameAr = data.nameAr;
    if (data.hoursPerDay !== undefined)
      updateData.hoursPerDay = data.hoursPerDay ?? null;
    if (data.displayOrderKey !== undefined)
      updateData.displayOrderKey = data.displayOrderKey ?? null;
    if (data.color !== undefined) updateData.color = data.color ?? null;
    if (data.breakfastAllowance !== undefined)
      updateData.breakfastAllowance = data.breakfastAllowance ?? null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updatedDesignation = await tx.designation.update({
      where: { id },
      data: updateData,
      select: designationSelect,
    });

    return updatedDesignation;
  });
};

/**
 * Delete designation
 */
export const deleteDesignation = async (id: number): Promise<void> => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if designation exists
    const existingDesignation = await tx.designation.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingDesignation) {
      throw new Error("Designation not found");
    }

    // Check if designation is being used by employees
    const employeesCount = await tx.employee.count({
      where: { designationId: id },
    });

    if (employeesCount > 0) {
      throw new Error(
        `Cannot delete designation: ${employeesCount} employee(s) are assigned to this designation`
      );
    }

    // Check if designation is being used by exit reentries
    const exitReentriesCount = await tx.exitReentry.count({
      where: { designationId: id },
    });

    if (exitReentriesCount > 0) {
      throw new Error(
        `Cannot delete designation: ${exitReentriesCount} exit/re-entry record(s) are using this designation`
      );
    }

    // Delete designation
    await tx.designation.delete({
      where: { id },
    });
  });
};

/**
 * List designations with pagination and sorting
 */
export const listDesignations = async (
  params: ListDesignationsParams
): Promise<ListDesignationsResponse> => {
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
    const validFields = [
      "nameEn",
      "nameAr",
      "isActive",
      "displayOrderKey",
    ] as const;

    // Only allow sorting by the specified valid fields
    if (validFields.includes(sortBy)) {
      orderBy = { [sortBy]: sortOrder };
    }
  }

  const [designations, total] = await Promise.all([
    prisma.designation.findMany({
      where,
      skip,
      take: limit,
      select: designationSelect,
      orderBy,
    }),
    prisma.designation.count({ where }),
  ]);

  return {
    designations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
