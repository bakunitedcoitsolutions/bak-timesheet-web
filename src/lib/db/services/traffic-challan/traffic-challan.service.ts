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
  BulkUploadTrafficChallanData,
  BulkUploadTrafficChallanResult,
  BulkUploadTrafficChallanRow,
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
      date: new Date(data.date),
      type: data.type,
      amount: data.amount,
      description: description,
    },
    select: trafficChallanSelect,
  });

  // Determine amount type: CHALLAN = DEBIT, RETURN = CREDIT
  const amountType = data.type === "CHALLAN" ? "DEBIT" : "CREDIT";

  // Get the previous balance (balance of the entry just before this one, based on createdAt)
  const previousEntry = await tx.ledger.findFirst({
    where: {
      employeeId: data.employeeId,
    },
    orderBy: [
      { createdAt: "desc" },
    ],
    select: { balance: true },
  });

  // Calculate previous balance (0 if no previous entry)
  let previousBalance = 0;
  if (previousEntry) {
    previousBalance = Number(previousEntry.balance);
  }

  // Calculate new balance for current entry
  // CREDIT increases balance, DEBIT decreases balance
  const amountNum = Number(data.amount);
  let newBalance = previousBalance;
  if (amountType === "CREDIT") {
    newBalance = previousBalance + amountNum;
  } else if (amountType === "DEBIT") {
    newBalance = previousBalance - amountNum;
  }

  // Create ledger entry with calculated balance
  await tx.ledger.create({
    data: {
      employeeId: data.employeeId,
      date: new Date(data.date),
      type: "CHALLAN",
      amountType: amountType as "CREDIT" | "DEBIT",
      amount: data.amount,
      balance: newBalance,
      description: `Challan ${!!description ? `(${description})` : ""}`,
      trafficChallanId: trafficChallan.id,
    },
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
      select: { id: true, createdAt: true, amount: true, amountType: true, balance: true, date: true },
    });

    if (ledgerEntry) {
      const employeeId = data.employeeId ?? existingTrafficChallan.employeeId;

      const description =
        updateData?.description ?? existingTrafficChallan?.description ?? "";

      // Determine amount type: CHALLAN = DEBIT, RETURN = CREDIT
      // Note: DEBIT means Return amount, CREDIT means challan amount (per user clarification)
      const challanType = data.type ?? existingTrafficChallan.type;
      const amountType = challanType === "CHALLAN" ? "DEBIT" : "CREDIT";

      const newAmount = data.amount ?? existingTrafficChallan.amount;
      const newDate = data.date
        ? new Date(data.date)
        : new Date(existingTrafficChallan.date);

      // Check if amount or amountType changed (date changes don't trigger balance recalculation)
      const oldAmount = Number(ledgerEntry.amount);
      const newAmountNum = Number(newAmount);
      const amountChanged = oldAmount !== newAmountNum;
      const amountTypeChanged = ledgerEntry.amountType !== amountType;

      // Only update balances if amount or amountType changed
      if (amountChanged || amountTypeChanged) {
        // Get the previous balance (balance of the entry just before this one, based on createdAt)
        const previousEntry = await tx.ledger.findFirst({
          where: {
            employeeId: employeeId,
            id: { not: ledgerEntry.id }, // Exclude current entry
            createdAt: { lt: ledgerEntry.createdAt },
          },
          orderBy: [
            { createdAt: "desc" },
          ],
          select: { balance: true },
        });

        // Calculate previous balance (0 if no previous entry)
        let previousBalance = 0;
        if (previousEntry) {
          previousBalance = Number(previousEntry.balance);
        }

        // Calculate new balance for current entry
        // CREDIT increases balance, DEBIT decreases balance
        let newBalance = previousBalance;
        if (amountType === "CREDIT") {
          newBalance = previousBalance + newAmountNum;
        } else if (amountType === "DEBIT") {
          newBalance = previousBalance - newAmountNum;
        }

        // Update the current ledger entry
        await tx.ledger.update({
          where: { id: ledgerEntry.id },
          data: {
            employeeId: employeeId,
            date: newDate,
            type: "CHALLAN",
            amountType: amountType as "CREDIT" | "DEBIT",
            amount: newAmount,
            balance: newBalance,
            description: `Challan ${!!description ? `(${description})` : ""}`,
          },
        });

        // Get all ledger entries after this one (based on createdAt)
        const subsequentEntries = await tx.ledger.findMany({
          where: {
            employeeId: employeeId,
            id: { not: ledgerEntry.id }, // Exclude current entry
            createdAt: { gt: ledgerEntry.createdAt },
          },
          orderBy: [
            { createdAt: "asc" },
          ],
          select: { id: true, amount: true, amountType: true, balance: true },
        });

        // Recalculate balances for all subsequent entries
        let currentBalance = newBalance;
        for (const entry of subsequentEntries) {
          const entryAmount = Number(entry.amount);
          if (entry.amountType === "CREDIT") {
            currentBalance = currentBalance + entryAmount;
          } else if (entry.amountType === "DEBIT") {
            currentBalance = currentBalance - entryAmount;
          }

          await tx.ledger.update({
            where: { id: entry.id },
            data: { balance: currentBalance },
          });
        }
      } else {
        // Amount and amountType didn't change, just update other fields
        await tx.ledger.update({
          where: { id: ledgerEntry.id },
          data: {
            employeeId: employeeId,
            date: newDate,
            type: "CHALLAN",
            amountType: amountType as "CREDIT" | "DEBIT",
            amount: newAmount,
            description: `Challan ${!!description ? `(${description})` : ""}`,
          },
        });
      }
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
          throw new Error(
            `Employee with code ${row.employeeCode} not found`
          );
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
