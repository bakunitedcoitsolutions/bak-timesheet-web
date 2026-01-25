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
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Validate: nameEn must be unique
    const existingDesignation = await tx.designation.findFirst({
      where: { nameEn: data.nameEn },
      select: { id: true },
    });

    if (existingDesignation) {
      throw new Error("Designation name already exists");
    }

    let finalDisplayOrderKey = data.displayOrderKey ?? null;

    // If displayOrderKey is null or undefined, auto-assign the next number from the last
    if (finalDisplayOrderKey === null || finalDisplayOrderKey === undefined) {
      const lastRecord = await tx.designation.findFirst({
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
      const recordsToShift = await tx.designation.findMany({
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
          await tx.designation.update({
            where: { id: record.id },
            data: {
              displayOrderKey: record.displayOrderKey + 1,
            },
          });
        }
      }
    }

    const designation = await tx.designation.create({
      data: {
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        hoursPerDay: data.hoursPerDay ?? null,
        displayOrderKey: finalDisplayOrderKey,
        color: data.color ?? "#FFFFFF", // Default to white
        breakfastAllowance: data.breakfastAllowance ?? null,
        isActive: data.isActive ?? true,
      },
      select: designationSelect,
    });

    // Convert Decimal to number for client serialization
    return {
      ...designation,
      breakfastAllowance: designation.breakfastAllowance
        ? Number(designation.breakfastAllowance)
        : null,
    };
  });
};

/**
 * Get designation by ID
 */
export const findDesignationById = async (id: number) => {
  const designation = await prisma.designation.findUnique({
    where: { id },
    select: designationSelect,
  });

  if (!designation) {
    return null;
  }

  // Convert Decimal to number for client serialization
  return {
    ...designation,
    breakfastAllowance: designation.breakfastAllowance
      ? Number(designation.breakfastAllowance)
      : null,
  };
};

/**
 * Update designation
 */
export const updateDesignation = async (
  id: number,
  data: UpdateDesignationData
) => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if designation exists and get its displayOrderKey
    const existingDesignation = await tx.designation.findUnique({
      where: { id },
      select: { id: true, displayOrderKey: true },
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

    // Auto-adjust displayOrderKey if it's being updated
    if (data.displayOrderKey !== undefined) {
      const oldOrderKey = existingDesignation.displayOrderKey;
      const newOrderKey = data.displayOrderKey ?? null;

      if (newOrderKey !== null && oldOrderKey !== newOrderKey) {
        if (oldOrderKey === null) {
          // Moving from null to a specific key: shift records with >= newOrderKey by 1
          const recordsToShift = await tx.designation.findMany({
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
              await tx.designation.update({
                where: { id: record.id },
                data: {
                  displayOrderKey: record.displayOrderKey + 1,
                },
              });
            }
          }
        } else if (newOrderKey === null) {
          // Moving from a specific key to null: shift records with > oldOrderKey down by 1
          const recordsToShift = await tx.designation.findMany({
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
              await tx.designation.update({
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
            const recordsToShift = await tx.designation.findMany({
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
                await tx.designation.update({
                  where: { id: record.id },
                  data: {
                    displayOrderKey: record.displayOrderKey - 1,
                  },
                });
              }
            }
          } else {
            // Moving up: shift records between new and old up by 1
            const recordsToShift = await tx.designation.findMany({
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
                await tx.designation.update({
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

    // Convert Decimal to number for client serialization
    return {
      ...updatedDesignation,
      breakfastAllowance: updatedDesignation.breakfastAllowance
        ? Number(updatedDesignation.breakfastAllowance)
        : null,
    };
  });
};

/**
 * Delete designation
 */
export const deleteDesignation = async (id: number): Promise<void> => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if designation exists and get its displayOrderKey
    const existingDesignation = await tx.designation.findUnique({
      where: { id },
      select: { id: true, displayOrderKey: true },
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

    // If the record has a displayOrderKey, shift down all records with higher keys
    if (existingDesignation.displayOrderKey !== null) {
      // Check if there are records with higher keys (if not, this is the last item - no need to shift)
      const hasRecordsAfter = await tx.designation.findFirst({
        where: {
          displayOrderKey: {
            gt: existingDesignation.displayOrderKey,
          },
        },
        select: { id: true },
      });

      // Only shift if there are records with higher keys (not the last item)
      if (hasRecordsAfter) {
        const recordsToShift = await tx.designation.findMany({
          where: {
            displayOrderKey: {
              gt: existingDesignation.displayOrderKey,
            },
          },
          select: { id: true, displayOrderKey: true },
        });

        // Shift each record down by 1
        for (const record of recordsToShift) {
          if (record.displayOrderKey !== null) {
            await tx.designation.update({
              where: { id: record.id },
              data: {
                displayOrderKey: record.displayOrderKey - 1,
              },
            });
          }
        }
      }
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
      "hoursPerDay",
      "breakfastAllowance",
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

  // Convert Decimal to number for client serialization
  const transformedDesignations = designations.map((designation) => ({
    ...designation,
    breakfastAllowance: designation.breakfastAllowance
      ? Number(designation.breakfastAllowance)
      : null,
  }));

  return {
    designations: transformedDesignations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
