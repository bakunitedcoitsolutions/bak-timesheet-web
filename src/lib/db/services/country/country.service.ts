/**
 * Country Service
 * Business logic for country operations
 */

import { prisma } from "@/lib/db/prisma";
import type {
  CreateCountryData,
  UpdateCountryData,
  ListCountriesParams,
  ListCountriesResponse,
} from "./country.dto";

// Type helper for Prisma transaction client
type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

// Reusable select object
const countrySelect = {
  id: true,
  nameEn: true,
  nameAr: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Create a new country
 */
export const createCountry = async (data: CreateCountryData) => {
  // Validate: nameEn must be unique
  const existingCountry = await prisma.country.findFirst({
    where: { nameEn: data.nameEn },
    select: { id: true },
  });

  if (existingCountry) {
    throw new Error("Country name already exists");
  }

  const country = await prisma.country.create({
    data: {
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      isActive: data.isActive ?? true,
    },
    select: countrySelect,
  });

  return country;
};

/**
 * Get country by ID
 */
export const findCountryById = async (id: number) => {
  return prisma.country.findUnique({
    where: { id },
    select: countrySelect,
  });
};

/**
 * Update country
 */
export const updateCountry = async (id: number, data: UpdateCountryData) => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if country exists
    const existingCountry = await tx.country.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingCountry) {
      throw new Error("Country not found");
    }

    // Validate: nameEn must be unique (if being updated)
    if (data.nameEn !== undefined) {
      const duplicateCountry = await tx.country.findFirst({
        where: {
          nameEn: data.nameEn,
          NOT: { id },
        },
        select: { id: true },
      });

      if (duplicateCountry) {
        throw new Error("Country name already exists");
      }
    }

    const updateData: any = {};

    if (data.nameEn !== undefined) updateData.nameEn = data.nameEn;
    if (data.nameAr !== undefined) updateData.nameAr = data.nameAr;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updatedCountry = await tx.country.update({
      where: { id },
      data: updateData,
      select: countrySelect,
    });

    return updatedCountry;
  });
};

/**
 * Delete country
 */
export const deleteCountry = async (id: number): Promise<void> => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if country exists
    const existingCountry = await tx.country.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingCountry) {
      throw new Error("Country not found");
    }

    // Check if country is being used by cities
    const citiesCount = await tx.city.count({
      where: { countryId: id },
    });

    if (citiesCount > 0) {
      throw new Error(
        `Cannot delete country: ${citiesCount} city/cities are assigned to this country`
      );
    }

    // Check if country is being used by employees
    const employeesCount = await tx.employee.count({
      where: { countryId: id },
    });

    if (employeesCount > 0) {
      throw new Error(
        `Cannot delete country: ${employeesCount} employee(s) are assigned to this country`
      );
    }

    // Delete country
    await tx.country.delete({
      where: { id },
    });
  });
};

/**
 * List countries with pagination and sorting
 */
export const listCountries = async (
  params: ListCountriesParams
): Promise<ListCountriesResponse> => {
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

  const [countries, total] = await Promise.all([
    prisma.country.findMany({
      where,
      skip,
      take: limit,
      select: countrySelect,
      orderBy,
    }),
    prisma.country.count({ where }),
  ]);

  return {
    countries,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
