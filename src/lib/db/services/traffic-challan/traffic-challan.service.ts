/**
 * Traffic Challan Service
 * Business logic for traffic challan operations
 */

import { prisma } from "@/lib/db/prisma";
import type {
  CreateTrafficChallanData,
  UpdateTrafficChallanData,
  ListTrafficChallansParams,
  ListTrafficChallansResponse,
} from "./traffic-challan.dto";
import { convertDecimalToNumber } from "@/lib/db/utils";

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
};

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

    const description = data.description ?? "";

    const trafficChallan = await tx.trafficChallan.create({
      data: {
        employeeId: data.employeeId,
        date: new Date(data.date),
        type: data.type,
        amount: data.amount,
        description: description,
      },
      select: trafficChallanSelect,
    });

    // Determine amount type: CHALLAN = DEBIT, RETURN = CREDIT
    const amountType = data.type === "CHALLAN" ? "DEBIT" : "CREDIT";

    // Create ledger entry (balance will be updated manually)
    await tx.ledger.create({
      data: {
        employeeId: data.employeeId,
        date: new Date(data.date),
        type: "CHALLAN",
        amountType: amountType as "CREDIT" | "DEBIT",
        amount: data.amount,
        balance: 0, // Will be updated manually
        description: `Challan ${!!description ? `(${description})` : ""}`,
        trafficChallanId: trafficChallan.id,
      },
    });

    // Convert Decimal to number for client serialization
    return {
      ...trafficChallan,
      amount: convertDecimalToNumber(trafficChallan.amount),
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
    amount: convertDecimalToNumber(trafficChallan.amount),
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
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.type !== undefined) updateData.type = data.type;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.description !== undefined)
      updateData.description = data.description;

    const trafficChallan = await tx.trafficChallan.update({
      where: { id },
      data: updateData,
      select: trafficChallanSelect,
    });

    // Find and update the corresponding ledger entry
    const ledgerEntry = await tx.ledger.findFirst({
      where: { trafficChallanId: id },
      select: { id: true, createdAt: true, amount: true, amountType: true, balance: true },
    });

    if (ledgerEntry) {
      const employeeId = data.employeeId ?? existingTrafficChallan.employeeId;

      const description =
        updateData?.description ?? existingTrafficChallan?.description ?? "";

      // Determine amount type: CHALLAN = DEBIT, RETURN = CREDIT
      const challanType = data.type ?? existingTrafficChallan.type;
      const amountType = challanType === "CHALLAN" ? "DEBIT" : "CREDIT";

      // Update the current ledger entry (balance will be updated manually)
      await tx.ledger.update({
        where: { id: ledgerEntry.id },
        data: {
          employeeId: employeeId,
          date: data.date
            ? new Date(data.date)
            : new Date(existingTrafficChallan.date),
          type: "CHALLAN",
          amountType: amountType as "CREDIT" | "DEBIT",
          amount: data.amount ?? existingTrafficChallan.amount,
          description: `Challan ${!!description ? `(${description})` : ""}`,
        },
      });
    }

    // Convert Decimal to number for client serialization
    return {
      ...trafficChallan,
      amount: convertDecimalToNumber(trafficChallan.amount),
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

    // Find and delete the corresponding ledger entry
    const ledgerEntry = await tx.ledger.findFirst({
      where: { trafficChallanId: id },
      select: { id: true },
    });

    if (ledgerEntry) {
      await tx.ledger.delete({
        where: { id: ledgerEntry.id },
      });
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

  // Search filter (search in description)
  if (params.search) {
    where.description = { contains: params.search, mode: "insensitive" };
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
      where.date.gte = new Date(params.startDate);
    }
    if (params.endDate) {
      where.date.lte = new Date(params.endDate);
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
    amount: convertDecimalToNumber(challan.amount),
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
