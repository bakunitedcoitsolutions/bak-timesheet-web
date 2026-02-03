/**
 * Allowance Exclusion Service
 * Business logic for allowance exclusion operations
 */

import { prisma } from "@/lib/db/prisma";
import type {
  CreateAllowanceExclusionData,
  UpdateAllowanceExclusionData,
  ListAllowanceExclusionsParams,
  ListAllowanceExclusionsResponse,
} from "./allowance-exclusion.dto";

// Reusable select object
const allowanceExclusionSelect = {
  id: true,
  nameEn: true,
  nameAr: true,
  description: true,
  startDate: true,
  endDate: true,
  type: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Helper function to normalize date strings to Date objects
 */
const normalizeDate = (date: Date | string | undefined): Date | null => {
  if (!date) return null;
  if (date instanceof Date) return date;
  return new Date(date);
};

/**
 * Create a new allowance exclusion
 */
export const createAllowanceExclusion = async (
  data: CreateAllowanceExclusionData
) => {
  // Validate date range
  const startDate = normalizeDate(data.startDate);
  const endDate = normalizeDate(data.endDate);

  if (startDate && endDate && startDate > endDate) {
    throw new Error("Start date must be before or equal to end date");
  }

  const allowanceExclusion = await prisma.allowanceNotAvailable.create({
    data: {
      nameEn: data.nameEn,
      nameAr: data.nameAr ?? null,
      description: data.description ?? null,
      startDate: startDate!,
      endDate: endDate!,
      type: data.type,
      isActive: data.isActive ?? true,
    },
    select: allowanceExclusionSelect,
  });

  return allowanceExclusion;
};

/**
 * Update an allowance exclusion
 */
export const updateAllowanceExclusion = async (
  id: number,
  data: UpdateAllowanceExclusionData
) => {
  // Validate allowance exclusion exists
  const existingAllowanceExclusion =
    await prisma.allowanceNotAvailable.findUnique({
      where: { id },
      select: { id: true, startDate: true, endDate: true },
    });

  if (!existingAllowanceExclusion) {
    throw new Error("Allowance exclusion not found");
  }

  const updateData: any = {};

  if (data.nameEn !== undefined) updateData.nameEn = data.nameEn;
  if (data.nameAr !== undefined) updateData.nameAr = data.nameAr ?? null;
  if (data.description !== undefined)
    updateData.description = data.description ?? null;
  if (data.startDate !== undefined)
    updateData.startDate = normalizeDate(data.startDate);
  if (data.endDate !== undefined)
    updateData.endDate = normalizeDate(data.endDate);
  if (data.type !== undefined) updateData.type = data.type;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  // Validate date range if dates are being updated
  const finalStartDate =
    updateData.startDate ?? existingAllowanceExclusion.startDate;
  const finalEndDate = updateData.endDate ?? existingAllowanceExclusion.endDate;

  if (finalStartDate && finalEndDate && finalStartDate > finalEndDate) {
    throw new Error("Start date must be before or equal to end date");
  }

  const updatedAllowanceExclusion = await prisma.allowanceNotAvailable.update({
    where: { id },
    data: updateData,
    select: allowanceExclusionSelect,
  });

  return updatedAllowanceExclusion;
};

/**
 * Find allowance exclusion by ID
 */
export const findAllowanceExclusionById = async (id: number) => {
  const allowanceExclusion = await prisma.allowanceNotAvailable.findUnique({
    where: { id },
    select: allowanceExclusionSelect,
  });

  if (!allowanceExclusion) {
    throw new Error("Allowance exclusion not found");
  }

  return allowanceExclusion;
};

/**
 * List allowance exclusions with pagination, sorting, and search
 */
export const listAllowanceExclusions = async (
  params: ListAllowanceExclusionsParams
): Promise<ListAllowanceExclusionsResponse> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  // Search filter
  if (params.search) {
    where.OR = [
      { nameEn: { contains: params.search, mode: "insensitive" } },
      { nameAr: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }

  // Filter by type
  if (params.type !== undefined) {
    where.type = params.type;
  }

  // Filter by isActive
  if (params.isActive !== undefined) {
    where.isActive = params.isActive;
  }

  // Build orderBy clause
  const orderBy: any = {};
  if (params.sortBy) {
    orderBy[params.sortBy] = params.sortOrder ?? "asc";
  } else {
    orderBy.startDate = "desc"; // Default sort by start date descending
  }

  // Get total count
  const total = await prisma.allowanceNotAvailable.count({ where });

  // Get allowance exclusions
  const allowanceExclusions = await prisma.allowanceNotAvailable.findMany({
    where,
    orderBy,
    skip,
    take: limit,
    select: allowanceExclusionSelect,
  });

  return {
    allowanceExclusions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Delete an allowance exclusion
 */
export const deleteAllowanceExclusion = async (id: number) => {
  // Validate allowance exclusion exists
  const existingAllowanceExclusion =
    await prisma.allowanceNotAvailable.findUnique({
      where: { id },
      select: { id: true },
    });

  if (!existingAllowanceExclusion) {
    throw new Error("Allowance exclusion not found");
  }

  await prisma.allowanceNotAvailable.delete({
    where: { id },
  });

  return { success: true };
};

/**
 * Check if a specific date falls within any active exclusion period
 * Useful for payroll calculations
 */
export const isDateExcluded = async (
  date: Date | string,
  type: "BREAKFAST" | "FOOD" | "MOBILE" | "OTHER"
): Promise<boolean> => {
  const checkDate = normalizeDate(date);
  if (!checkDate) return false;

  const exclusion = await prisma.allowanceNotAvailable.findFirst({
    where: {
      type,
      isActive: true,
      startDate: { lte: checkDate },
      endDate: { gte: checkDate },
    },
  });

  return !!exclusion;
};

/**
 * Get all active exclusions for a date range
 * Useful for bulk payroll processing
 */
export const getActiveExclusionsForDateRange = async (
  startDate: Date | string,
  endDate: Date | string,
  type?: "BREAKFAST" | "FOOD" | "MOBILE" | "OTHER"
) => {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);

  if (!start || !end) {
    throw new Error("Invalid date range");
  }

  const where: any = {
    isActive: true,
    OR: [
      // Exclusion starts within the range
      {
        startDate: { gte: start, lte: end },
      },
      // Exclusion ends within the range
      {
        endDate: { gte: start, lte: end },
      },
      // Exclusion spans the entire range
      {
        startDate: { lte: start },
        endDate: { gte: end },
      },
    ],
  };

  if (type) {
    where.type = type;
  }

  const exclusions = await prisma.allowanceNotAvailable.findMany({
    where,
    select: allowanceExclusionSelect,
    orderBy: { startDate: "asc" },
  });

  return exclusions;
};
