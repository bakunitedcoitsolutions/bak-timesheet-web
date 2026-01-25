/**
 * GOSI City Service
 * Business logic for GOSI city operations
 */

import { prisma } from "@/lib/db/prisma";
import type {
  CreateGosiCityData,
  UpdateGosiCityData,
  ListGosiCitiesParams,
  ListGosiCitiesResponse,
} from "./gosi-city.dto";

// Type helper for Prisma transaction client
type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

// Reusable select object
const gosiCitySelect = {
  id: true,
  nameEn: true,
  nameAr: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Create a new GOSI city
 */
export const createGosiCity = async (data: CreateGosiCityData) => {
  // Validate: nameEn must be unique
  const existingGosiCity = await prisma.gosiCity.findFirst({
    where: { nameEn: data.nameEn },
    select: { id: true },
  });

  if (existingGosiCity) {
    throw new Error("GOSI City name already exists");
  }

  const gosiCity = await prisma.gosiCity.create({
    data: {
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      isActive: data.isActive ?? true,
    },
    select: gosiCitySelect,
  });

  return gosiCity;
};

/**
 * Get GOSI city by ID
 */
export const findGosiCityById = async (id: number) => {
  return prisma.gosiCity.findUnique({
    where: { id },
    select: gosiCitySelect,
  });
};

/**
 * Update GOSI city
 */
export const updateGosiCity = async (id: number, data: UpdateGosiCityData) => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if GOSI city exists
    const existingGosiCity = await tx.gosiCity.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingGosiCity) {
      throw new Error("GOSI City not found");
    }

    // Validate: nameEn must be unique (if being updated)
    if (data.nameEn !== undefined) {
      const duplicateGosiCity = await tx.gosiCity.findFirst({
        where: {
          nameEn: data.nameEn,
          NOT: { id },
        },
        select: { id: true },
      });

      if (duplicateGosiCity) {
        throw new Error("GOSI City name already exists");
      }
    }

    const updateData: any = {};

    if (data.nameEn !== undefined) updateData.nameEn = data.nameEn;
    if (data.nameAr !== undefined) updateData.nameAr = data.nameAr;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updatedGosiCity = await tx.gosiCity.update({
      where: { id },
      data: updateData,
      select: gosiCitySelect,
    });

    return updatedGosiCity;
  });
};

/**
 * Delete GOSI city
 */
export const deleteGosiCity = async (id: number): Promise<void> => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if GOSI city exists
    const existingGosiCity = await tx.gosiCity.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingGosiCity) {
      throw new Error("GOSI City not found");
    }

    // Check if GOSI city is being used by employees
    const employeesCount = await tx.employee.count({
      where: { gosiCityId: id },
    });

    if (employeesCount > 0) {
      throw new Error(
        `Cannot delete GOSI City: ${employeesCount} employee(s) are assigned to this GOSI City`
      );
    }

    // Delete GOSI city
    await tx.gosiCity.delete({
      where: { id },
    });
  });
};

/**
 * List GOSI cities with pagination and sorting
 */
export const listGosiCities = async (
  params: ListGosiCitiesParams
): Promise<ListGosiCitiesResponse> => {
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

  const [gosiCities, total] = await Promise.all([
    prisma.gosiCity.findMany({
      where,
      skip,
      take: limit,
      select: gosiCitySelect,
      orderBy,
    }),
    prisma.gosiCity.count({ where }),
  ]);

  return {
    gosiCities,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
