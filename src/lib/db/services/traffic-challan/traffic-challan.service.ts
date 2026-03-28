/**
 * Traffic Challan Service
 * Business logic for traffic challan operations
 */

import dayjs from "dayjs";
import { prisma } from "@/lib/db/prisma";
import type {
  CreateTrafficChallanData,
  UpdateTrafficChallanData,
  ListTrafficChallansParams,
  ListTrafficChallansResponse,
  BulkUploadTrafficChallanData,
  BulkUploadTrafficChallanResult,
  ListedTrafficChallan,
} from "./traffic-challan.dto";

// Type helper for Prisma transaction client
type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

// Reusable select object
const trafficChallanSelect = {
  id: true,
  employeeId: true,
  date: true,
  type: true,
  amount: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  employee: {
    select: {
      nameEn: true,
      employeeCode: true,
      designation: {
        select: {
          nameEn: true,
        },
      },
    },
  },
};

/**
 * Internal reusable function to create a traffic challan with ledger entry
 * This function handles the creation of both traffic challan and ledger entry with balance calculation
 */
async function createTrafficChallanWithLedger(
  tx: PrismaTransactionClient,
  data: {
    employeeId: number;
    date: Date | string;
    type: "CHALLAN" | "RETURN";
    amount: number | any;
    description?: string;
  }
) {
  const description = data.description ?? "";

  // Create traffic challan
  const trafficChallan = await tx.trafficChallan.create({
    data: {
      employeeId: data.employeeId,
      date: dayjs(data.date).toDate(),
      type: data.type,
      amount: data.amount,
      description: description,
    },
    select: trafficChallanSelect,
  });

  return trafficChallan;
}

/**
 * Create a new traffic challan
 */
export const createTrafficChallan = async (data: CreateTrafficChallanData) => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Validate employee exists
    const employee = await tx.employee.findUnique({
      where: { id: data.employeeId },
      select: { id: true },
    });

    if (!employee) {
      throw new Error(`Employee with ID ${data.employeeId} does not exist`);
    }

    const trafficChallan = await createTrafficChallanWithLedger(tx, {
      employeeId: data.employeeId,
      date: data.date,
      type: data.type,
      amount: data.amount,
      description: data.description,
    });

    // Convert Decimal to number for client serialization
    return {
      ...trafficChallan,
      amount: trafficChallan.amount,
    };
  });
};

/**
 * Get traffic challan by ID
 */
export const findTrafficChallanById = async (id: number) => {
  const trafficChallan = await prisma.trafficChallan.findUnique({
    where: { id },
    select: trafficChallanSelect,
  });

  if (!trafficChallan) {
    return null;
  }

  // Convert Decimal to number for client serialization
  return {
    ...trafficChallan,
    amount: trafficChallan.amount,
  };
};

/**
 * Update traffic challan
 */
export const updateTrafficChallan = async (
  id: number,
  data: UpdateTrafficChallanData
) => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if traffic challan exists and get current data
    const existingTrafficChallan = await tx.trafficChallan.findUnique({
      where: { id },
      select: {
        id: true,
        employeeId: true,
        date: true,
        type: true,
        amount: true,
        description: true,
      },
    });

    if (!existingTrafficChallan) {
      throw new Error("Traffic challan not found");
    }

    // Validate employee if provided
    if (data.employeeId !== undefined) {
      const employee = await tx.employee.findUnique({
        where: { id: data.employeeId },
        select: { id: true },
      });

      if (!employee) {
        throw new Error(`Employee with ID ${data.employeeId} does not exist`);
      }
    }

    const updateData: any = {};

    if (data.employeeId !== undefined) updateData.employeeId = data.employeeId;
    if (data.date !== undefined) updateData.date = dayjs(data.date).toDate();
    if (data.type !== undefined) updateData.type = data.type;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.description !== undefined)
      updateData.description = data.description;

    const trafficChallan = await tx.trafficChallan.update({
      where: { id },
      data: updateData,
      select: trafficChallanSelect,
    });

    // Convert Decimal to number for client serialization
    return {
      ...trafficChallan,
      amount: trafficChallan.amount,
    };
  });
};

/**
 * Delete traffic challan
 */
export const deleteTrafficChallan = async (id: number) => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if traffic challan exists
    const existingTrafficChallan = await tx.trafficChallan.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingTrafficChallan) {
      throw new Error("Traffic challan not found");
    }

    await tx.trafficChallan.delete({
      where: { id },
    });

    return { success: true };
  });
};

/**
 * List traffic challans with pagination, sorting, and search
 */
export const listTrafficChallans = async (
  params: ListTrafficChallansParams
): Promise<ListTrafficChallansResponse> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  // Search filter (search in description, employee name, employee code)
  if (params.search) {
    const search = params.search;
    const searchAsNumber = Number(search);
    const isNumber = !isNaN(searchAsNumber);

    where.OR = [
      { description: { contains: search, mode: "insensitive" } },
      { employee: { nameEn: { contains: search, mode: "insensitive" } } },
      { employee: { nameAr: { contains: search, mode: "insensitive" } } },
    ];

    if (isNumber) {
      where.OR.push({ employee: { employeeCode: searchAsNumber } });
    }
  }

  // Filter by employeeId
  if (params.employeeId !== undefined) {
    where.employeeId = params.employeeId;
  }

  // Filter by type
  if (params.type !== undefined) {
    where.type = params.type;
  }

  // Filter by date range
  if (params.startDate || params.endDate) {
    where.date = {};
    if (params.startDate) {
      where.date.gte = dayjs(params.startDate).toDate();
    }
    if (params.endDate) {
      where.date.lte = dayjs(params.endDate).toDate();
    }
  }

  // Build orderBy clause
  const orderBy: any = {};
  if (params.sortBy) {
    orderBy[params.sortBy] = params.sortOrder ?? "desc";
  } else {
    orderBy.createdAt = "desc"; // Default sort
  }

  // Get total count
  const total = await prisma.trafficChallan.count({ where });

  // Get traffic challans
  const trafficChallans = await prisma.trafficChallan.findMany({
    where,
    skip,
    take: limit,
    select: trafficChallanSelect,
    orderBy,
  });

  // Convert Decimal to number for client serialization
  const transformedTrafficChallans = trafficChallans.map((challan) => ({
    ...challan,
    amount: challan.amount,
  }));

  return {
    trafficChallans: transformedTrafficChallans,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * List ALL traffic challans (no pagination) — used for exports
 */
export interface ListAllTrafficChallanParams {
  search?: string;
  employeeId?: number;
  type?: "CHALLAN" | "RETURN";
  startDate?: Date | string;
  endDate?: Date | string;
}

export const listAllTrafficChallans = async (
  params: ListAllTrafficChallanParams
): Promise<{ trafficChallans: ListedTrafficChallan[] }> => {
  // Build where clause (same logic as listLoans, minus pagination)
  const where: any = {};

  if (params.search) {
    const search = params.search;
    const searchAsNumber = Number(search);
    const isNumber = !isNaN(searchAsNumber);

    where.OR = [
      { description: { contains: search, mode: "insensitive" } },
      { employee: { nameEn: { contains: search, mode: "insensitive" } } },
      { employee: { nameAr: { contains: search, mode: "insensitive" } } },
    ];

    if (isNumber) {
      where.OR.push({ employee: { employeeCode: searchAsNumber } });
    }
  }

  if (params.employeeId !== undefined) {
    where.employeeId = params.employeeId;
  }

  if (params.type !== undefined) {
    where.type = params.type;
  }

  if (params.startDate || params.endDate) {
    where.date = {};
    if (params.startDate) {
      where.date.gte = dayjs(params.startDate).toDate();
    }
    if (params.endDate) {
      where.date.lte = dayjs(params.endDate).toDate();
    }
  }

  const trafficChallans = await prisma.trafficChallan.findMany({
    where,
    select: trafficChallanSelect,
    orderBy: { date: "asc" },
  });

  return {
    trafficChallans: trafficChallans.map((trafficChallan) => ({
      ...trafficChallan,
      amount: trafficChallan.amount,
    })),
  };
};

/**
 * Bulk upload traffic challans
 */
export const bulkUploadTrafficChallans = async (
  data: BulkUploadTrafficChallanData
): Promise<BulkUploadTrafficChallanResult> => {
  const result: BulkUploadTrafficChallanResult = {
    success: 0,
    failed: 0,
    errors: [],
  };

  // Process each traffic challan in a transaction
  for (let i = 0; i < data.trafficChallans.length; i++) {
    const row = data.trafficChallans[i];
    const rowNumber = i + 1; // 1-indexed for user-friendly error messages

    try {
      await prisma.$transaction(async (tx: PrismaTransactionClient) => {
        // Resolve employeeId from employeeCode
        const employee = await tx.employee.findUnique({
          where: { employeeCode: row.employeeCode },
          select: { id: true },
        });

        if (!employee) {
          throw new Error(`Employee with code ${row.employeeCode} not found`);
        }

        // Create traffic challan with ledger entry using reusable function
        await createTrafficChallanWithLedger(tx, {
          employeeId: employee.id,
          date: row.date,
          type: row.type,
          amount: row.amount,
          description: row.description,
        });
      });

      result.success++;
    } catch (error: any) {
      console.error(error);
      console.error(error.message);
      console.error(error.stack);
      console.error(error.cause);
      console.error(error.code);
      console.error(error.name);
      console.error(error.syscall);
      console.error(error.address);
      console.error(error.port);
      result.failed++;
      result.errors.push({
        row: rowNumber,
        data: row,
        error: error.message || "Unknown error",
      });
    }
  }

  return result;
};
