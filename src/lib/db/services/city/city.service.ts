/**
 * City Service
 * Business logic for city operations
 */

import { prisma } from "@/lib/db/prisma";
import type {
  CreateCityData,
  UpdateCityData,
  ListCitiesParams,
  ListCitiesResponse,
} from "./city.dto";

// Type helper for Prisma transaction client
type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

// Reusable select object
const citySelect = {
  id: true,
  nameEn: true,
  nameAr: true,
  countryId: true,
  isActive: true,

  createdAt: true,
  updatedAt: true,
};

/**
 * Create a new city
 */
export const createCity = async (data: CreateCityData) => {
  // Validate: nameEn must be unique
  const existingCity = await prisma.city.findFirst({
    where: { nameEn: data.nameEn },
    select: { id: true },
  });

  if (existingCity) {
    throw new Error("City name already exists");
  }

  // Validate countryId if provided
  if (data.countryId !== undefined && data.countryId !== null) {
    const countryExists = await prisma.country.findUnique({
      where: { id: data.countryId },
      select: { id: true },
    });

    if (!countryExists) {
      throw new Error(`Country with ID ${data.countryId} does not exist`);
    }
  }

  const city = await prisma.city.create({
    data: {
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      countryId: data.countryId || null,
      isActive: data.isActive ?? true,
    },
    select: citySelect,
  });

  return city;
};

/**
 * Get city by ID
 */
export const findCityById = async (id: number) => {
  return prisma.city.findUnique({
    where: { id },
    select: {
      ...citySelect,
      country: {
        select: {
          id: true,
          nameEn: true,
        },
      },
    },
  });
};

/**
 * Update city
 */
export const updateCity = async (id: number, data: UpdateCityData) => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if city exists
    const existingCity = await tx.city.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingCity) {
      throw new Error("City not found");
    }

    // Validate: nameEn must be unique (if being updated)
    if (data.nameEn !== undefined) {
      const duplicateCity = await tx.city.findFirst({
        where: {
          nameEn: data.nameEn,
          NOT: { id },
        },
        select: { id: true },
      });

      if (duplicateCity) {
        throw new Error("City name already exists");
      }
    }

    // Validate countryId if provided
    if (data.countryId !== undefined && data.countryId !== null) {
      const countryExists = await tx.country.findUnique({
        where: { id: data.countryId },
        select: { id: true },
      });

      if (!countryExists) {
        throw new Error(`Country with ID ${data.countryId} does not exist`);
      }
    }

    const updateData: any = {};

    if (data.nameEn !== undefined) updateData.nameEn = data.nameEn;
    if (data.nameAr !== undefined) updateData.nameAr = data.nameAr;
    if (data.countryId !== undefined)
      updateData.countryId = data.countryId || null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updatedCity = await tx.city.update({
      where: { id },
      data: updateData,
      select: citySelect,
    });

    return updatedCity;
  });
};

/**
 * Delete city
 */
export const deleteCity = async (id: number): Promise<void> => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if city exists
    const existingCity = await tx.city.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingCity) {
      throw new Error("City not found");
    }

    // Check if city is being used by employees
    const employeesCount = await tx.employee.count({
      where: { cityId: id },
    });

    if (employeesCount > 0) {
      throw new Error(
        `Cannot delete city: ${employeesCount} employee(s) are assigned to this city`
      );
    }

    // Delete city
    await tx.city.delete({
      where: { id },
    });
  });
};

/**
 * List cities with pagination and sorting
 */
export const listCities = async (
  params: ListCitiesParams
): Promise<ListCitiesResponse> => {
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

  // Filter by countryId if provided
  if (params.countryId !== undefined) {
    where.countryId = params.countryId;
  }

  // Determine sort order (default: desc)
  const sortOrder = params.sortOrder || "desc";

  // Build orderBy clause based on sortBy parameter
  let orderBy: any = { createdAt: "desc" }; // Default sort

  if (params.sortBy) {
    const sortBy = params.sortBy;
    const validFields = ["nameEn", "nameAr", "isActive", "isActive"] as const;

    // Only allow sorting by the specified valid fields
    if (validFields.includes(sortBy)) {
      orderBy = { [sortBy]: sortOrder };
    }
  }

  const [cities, total] = await Promise.all([
    prisma.city.findMany({
      where,
      skip,
      take: limit,
      select: {
        ...citySelect,
        country: {
          select: {
            id: true,
            nameEn: true,
          },
        },
      },
      orderBy,
    }),
    prisma.city.count({ where }),
  ]);

  return {
    cities,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
