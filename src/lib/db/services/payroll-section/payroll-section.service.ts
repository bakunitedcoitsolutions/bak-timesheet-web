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
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Validate: nameEn must be unique
    const existingPayrollSection = await tx.payrollSection.findFirst({
      where: { nameEn: data.nameEn },
      select: { id: true },
    });

    if (existingPayrollSection) {
      throw new Error("Payroll Section name already exists");
    }

    let finalDisplayOrderKey = data.displayOrderKey ?? null;

    // If displayOrderKey is null or undefined, auto-assign the next number from the last
    if (finalDisplayOrderKey === null || finalDisplayOrderKey === undefined) {
      const lastRecord = await tx.payrollSection.findFirst({
        where: {
          displayOrderKey: {
            not: null,
          },
        },
        orderBy: {
          displayOrderKey: "desc",
        },
        select: {
          displayOrderKey: true,
        },
      });

      // If no records exist or all have null, start from 1
      finalDisplayOrderKey = lastRecord?.displayOrderKey
        ? lastRecord.displayOrderKey + 1
        : 1;
    } else {
      // Auto-adjust displayOrderKey: if the key exists, shift all records with >= key by 1
      const recordsToShift = await tx.payrollSection.findMany({
        where: {
          displayOrderKey: {
            gte: finalDisplayOrderKey,
          },
        },
        select: { id: true, displayOrderKey: true },
      });

      // Update each record to shift by 1
      for (const record of recordsToShift) {
        if (record.displayOrderKey !== null) {
          await tx.payrollSection.update({
            where: { id: record.id },
            data: {
              displayOrderKey: record.displayOrderKey + 1,
            },
          });
        }
      }
    }

    const payrollSection = await tx.payrollSection.create({
      data: {
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        displayOrderKey: finalDisplayOrderKey,
        isActive: data.isActive ?? true,
      },
      select: payrollSectionSelect,
    });

    return payrollSection;
  });
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
      select: { id: true, displayOrderKey: true },
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

    // Auto-adjust displayOrderKey if it's being updated
    if (data.displayOrderKey !== undefined) {
      const oldOrderKey = existingPayrollSection.displayOrderKey;
      const newOrderKey = data.displayOrderKey ?? null;

      if (newOrderKey !== null && oldOrderKey !== newOrderKey) {
        if (oldOrderKey === null) {
          // Moving from null to a specific key: shift records with >= newOrderKey by 1
          const recordsToShift = await tx.payrollSection.findMany({
            where: {
              displayOrderKey: {
                gte: newOrderKey,
              },
              NOT: { id },
            },
            select: { id: true, displayOrderKey: true },
          });

          for (const record of recordsToShift) {
            if (record.displayOrderKey !== null) {
              await tx.payrollSection.update({
                where: { id: record.id },
                data: {
                  displayOrderKey: record.displayOrderKey + 1,
                },
              });
            }
          }
        } else if (newOrderKey === null) {
          // Moving from a specific key to null: shift records with > oldOrderKey down by 1
          const recordsToShift = await tx.payrollSection.findMany({
            where: {
              displayOrderKey: {
                gt: oldOrderKey,
              },
              NOT: { id },
            },
            select: { id: true, displayOrderKey: true },
          });

          for (const record of recordsToShift) {
            if (record.displayOrderKey !== null) {
              await tx.payrollSection.update({
                where: { id: record.id },
                data: {
                  displayOrderKey: record.displayOrderKey - 1,
                },
              });
            }
          }
        } else {
          // Moving from one key to another
          if (newOrderKey > oldOrderKey) {
            // Moving down: shift records between old and new down by 1
            const recordsToShift = await tx.payrollSection.findMany({
              where: {
                displayOrderKey: {
                  gt: oldOrderKey,
                  lte: newOrderKey,
                },
                NOT: { id },
              },
              select: { id: true, displayOrderKey: true },
            });

            for (const record of recordsToShift) {
              if (record.displayOrderKey !== null) {
                await tx.payrollSection.update({
                  where: { id: record.id },
                  data: {
                    displayOrderKey: record.displayOrderKey - 1,
                  },
                });
              }
            }
          } else {
            // Moving up: shift records between new and old up by 1
            const recordsToShift = await tx.payrollSection.findMany({
              where: {
                displayOrderKey: {
                  gte: newOrderKey,
                  lt: oldOrderKey,
                },
                NOT: { id },
              },
              select: { id: true, displayOrderKey: true },
            });

            for (const record of recordsToShift) {
              if (record.displayOrderKey !== null) {
                await tx.payrollSection.update({
                  where: { id: record.id },
                  data: {
                    displayOrderKey: record.displayOrderKey + 1,
                  },
                });
              }
            }
          }
        }
      }
    }

    const updateData: any = {};

    if (data.nameEn !== undefined) updateData.nameEn = data.nameEn;
    if (data.nameAr !== undefined) updateData.nameAr = data.nameAr;
    if (data.displayOrderKey !== undefined)
      updateData.displayOrderKey = data.displayOrderKey ?? null;
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
    // Check if payroll section exists and get its displayOrderKey
    const existingPayrollSection = await tx.payrollSection.findUnique({
      where: { id },
      select: { id: true, displayOrderKey: true },
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

    // If the record has a displayOrderKey, shift down all records with higher keys
    if (existingPayrollSection.displayOrderKey !== null) {
      // Check if there are records with higher keys (if not, this is the last item - no need to shift)
      const hasRecordsAfter = await tx.payrollSection.findFirst({
        where: {
          displayOrderKey: {
            gt: existingPayrollSection.displayOrderKey,
          },
        },
        select: { id: true },
      });

      // Only shift if there are records with higher keys (not the last item)
      if (hasRecordsAfter) {
        const recordsToShift = await tx.payrollSection.findMany({
          where: {
            displayOrderKey: {
              gt: existingPayrollSection.displayOrderKey,
            },
          },
          select: { id: true, displayOrderKey: true },
        });

        // Shift each record down by 1
        for (const record of recordsToShift) {
          if (record.displayOrderKey !== null) {
            await tx.payrollSection.update({
              where: { id: record.id },
              data: {
                displayOrderKey: record.displayOrderKey - 1,
              },
            });
          }
        }
      }
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

  // Determine sort order (default: asc for displayOrderKey, desc for others)
  const sortOrder =
    params.sortOrder || (params.sortBy === "displayOrderKey" ? "asc" : "desc");

  // Build orderBy clause based on sortBy parameter
  // Default: sort by displayOrderKey ascending (nulls go last in ascending order), then by createdAt descending
  let orderBy: any = [{ displayOrderKey: "asc" }, { createdAt: "desc" }];

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
      if (sortBy === "displayOrderKey") {
        // For displayOrderKey, use array to maintain secondary sort by createdAt
        orderBy = [{ displayOrderKey: sortOrder }, { createdAt: "desc" }];
      } else {
        // For other fields, simple sort
        orderBy = { [sortBy]: sortOrder };
      }
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
