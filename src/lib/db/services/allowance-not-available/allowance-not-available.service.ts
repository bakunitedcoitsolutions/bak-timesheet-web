/**
 * Allowance Not Allowed Service
 * Business logic for allowance not allowed operations
 */

import dayjs from "@/lib/dayjs";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { AllowanceType } from "../../../../../prisma/generated/prisma/enums";
import {
  CreateAllowanceNotAvailableData,
  UpdateAllowanceNotAvailableData,
  ListAllowanceNotAvailableParams,
  ListAllowanceNotAvailableResponse,
} from "./allowance-not-available.dto";

// Reusable select object
const allowanceNotAvailableSelect = {
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
  return dayjs(date).toDate();
};

/**
 * Create a new allowance not available record
 */
export const createAllowanceNotAvailable = async (
  data: CreateAllowanceNotAvailableData
) => {
  const user = await getCurrentUser();
  const userId = user?.id;
  // Validate date range
  const startDate = normalizeDate(data.startDate);
  const endDate = normalizeDate(data.endDate);

  if (startDate && endDate && startDate > endDate) {
    throw new Error("Start date must be before or equal to end date");
  }

  const allowanceNotAvailable = await prisma.allowanceNotAvailable.create({
    data: {
      nameEn: data.nameEn,
      nameAr: data.nameAr ?? null,
      description: data.description ?? null,
      startDate: startDate!,
      endDate: endDate!,
      type: data.type as AllowanceType,
      isActive: data.isActive ?? true,
      ...(userId && { createdBy: userId }),
    },
    select: allowanceNotAvailableSelect,
  });

  return allowanceNotAvailable;
};

/**
 * Update an allowance not available record
 */
export const updateAllowanceNotAvailable = async (
  id: number,
  data: UpdateAllowanceNotAvailableData
) => {
  const user = await getCurrentUser();
  const userId = user?.id;
  // Validate allowance not available exists
  const existingAllowanceNotAvailable =
    await prisma.allowanceNotAvailable.findUnique({
      where: { id },
      select: { id: true, startDate: true, endDate: true },
    });

  if (!existingAllowanceNotAvailable) {
    throw new Error("Allowance not available record not found");
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
  if (data.type !== undefined) updateData.type = data.type as AllowanceType;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  // Validate date range if dates are being updated
  const finalStartDate =
    updateData.startDate ?? existingAllowanceNotAvailable.startDate;
  const finalEndDate =
    updateData.endDate ?? existingAllowanceNotAvailable.endDate;

  if (finalStartDate && finalEndDate && finalStartDate > finalEndDate) {
    throw new Error("Start date must be before or equal to end date");
  }

  const updatedAllowanceNotAvailable =
    await prisma.allowanceNotAvailable.update({
      where: { id },
      data: { ...updateData, ...(userId && { updatedBy: userId }) },
      select: allowanceNotAvailableSelect,
    });

  return updatedAllowanceNotAvailable;
};

/**
 * Find allowance not available by ID
 */
export const findAllowanceNotAvailableById = async (id: number) => {
  const allowanceNotAvailable = await prisma.allowanceNotAvailable.findUnique({
    where: { id },
    select: allowanceNotAvailableSelect,
  });

  if (!allowanceNotAvailable) {
    throw new Error("Allowance not available record not found");
  }

  return allowanceNotAvailable;
};

/**
 * List allowance not available records with pagination, sorting, and search
 */
export const listAllowanceNotAvailable = async (
  params: ListAllowanceNotAvailableParams
): Promise<ListAllowanceNotAvailableResponse> => {
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
  if (params.type) {
    where.type = params.type as AllowanceType;
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

  // Get allowance not available records
  const allowanceNotAvailables = await prisma.allowanceNotAvailable.findMany({
    where,
    orderBy,
    skip,
    take: limit,
    select: allowanceNotAvailableSelect,
  });

  return {
    allowanceNotAvailables,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Delete an allowance not available record
 */
export const deleteAllowanceNotAvailable = async (id: number) => {
  // Validate allowance not available exists
  const existingAllowanceNotAvailable =
    await prisma.allowanceNotAvailable.findUnique({
      where: { id },
      select: { id: true },
    });

  if (!existingAllowanceNotAvailable) {
    throw new Error("Allowance not available record not found");
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
  type: AllowanceType
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
  type?: AllowanceType
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
    select: allowanceNotAvailableSelect,
    orderBy: { startDate: "asc" },
  });

  return exclusions;
};
