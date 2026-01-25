/**
 * Payroll Section Service
 * Business logic for payroll section operations
 */

import { prisma } from "@/lib/db/prisma";
import type {
  CreatePayrollSectionData,
  UpdatePayrollSectionData,
  ListPayrollSectionsParams,
  ListPayrollSectionsResponse,
} from "./payroll-section.dto";

// Type helper for Prisma transaction client
type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

// Reusable select object
const payrollSectionSelect = {
  id: true,
  nameEn: true,
  nameAr: true,
  displayOrderKey: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Create a new payroll section
 */
export const createPayrollSection = async (data: CreatePayrollSectionData) => {
  // Validate: nameEn must be unique
  const existingPayrollSection = await prisma.payrollSection.findFirst({
    where: { nameEn: data.nameEn },
    select: { id: true },
  });

  if (existingPayrollSection) {
    throw new Error("Payroll Section name already exists");
  }

  const payrollSection = await prisma.payrollSection.create({
    data: {
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      displayOrderKey: data.displayOrderKey || null,
      isActive: data.isActive ?? true,
    },
    select: payrollSectionSelect,
  });

  return payrollSection;
};

/**
 * Get payroll section by ID
 */
export const findPayrollSectionById = async (id: number) => {
  return prisma.payrollSection.findUnique({
    where: { id },
    select: payrollSectionSelect,
  });
};

/**
 * Update payroll section
 */
export const updatePayrollSection = async (
  id: number,
  data: UpdatePayrollSectionData
) => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if payroll section exists
    const existingPayrollSection = await tx.payrollSection.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingPayrollSection) {
      throw new Error("Payroll Section not found");
    }

    // Validate: nameEn must be unique (if being updated)
    if (data.nameEn !== undefined) {
      const duplicatePayrollSection = await tx.payrollSection.findFirst({
        where: {
          nameEn: data.nameEn,
          NOT: { id },
        },
        select: { id: true },
      });

      if (duplicatePayrollSection) {
        throw new Error("Payroll Section name already exists");
      }
    }

    const updateData: any = {};

    if (data.nameEn !== undefined) updateData.nameEn = data.nameEn;
    if (data.nameAr !== undefined) updateData.nameAr = data.nameAr;
    if (data.displayOrderKey !== undefined)
      updateData.displayOrderKey = data.displayOrderKey || null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updatedPayrollSection = await tx.payrollSection.update({
      where: { id },
      data: updateData,
      select: payrollSectionSelect,
    });

    return updatedPayrollSection;
  });
};

/**
 * Delete payroll section
 */
export const deletePayrollSection = async (id: number): Promise<void> => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if payroll section exists
    const existingPayrollSection = await tx.payrollSection.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingPayrollSection) {
      throw new Error("Payroll Section not found");
    }

    // Check if payroll section is being used by employees
    const employeesCount = await tx.employee.count({
      where: { payrollSectionId: id },
    });

    if (employeesCount > 0) {
      throw new Error(
        `Cannot delete payroll section: ${employeesCount} employee(s) are assigned to this payroll section`
      );
    }

    // Check if payroll section is being used by payrolls
    const payrollsCount = await tx.payroll.count({
      where: { sectionId: id },
    });

    if (payrollsCount > 0) {
      throw new Error(
        `Cannot delete payroll section: ${payrollsCount} payroll record(s) are using this payroll section`
      );
    }

    // Delete payroll section
    await tx.payrollSection.delete({
      where: { id },
    });
  });
};

/**
 * List payroll sections with pagination and sorting
 */
export const listPayrollSections = async (
  params: ListPayrollSectionsParams
): Promise<ListPayrollSectionsResponse> => {
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

  const [payrollSections, total] = await Promise.all([
    prisma.payrollSection.findMany({
      where,
      skip,
      take: limit,
      select: payrollSectionSelect,
      orderBy,
    }),
    prisma.payrollSection.count({ where }),
  ]);

  return {
    payrollSections,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
