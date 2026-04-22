/**
 * Traffic Challan Service
 * Business logic for traffic challan operations
 */

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import type {
  ListedTrafficChallan,
  CreateTrafficChallanData,
  UpdateTrafficChallanData,
  ListTrafficChallansParams,
  ListAllTrafficChallanParams,
  ListTrafficChallansResponse,
  BulkUploadTrafficChallanData,
  BulkUploadTrafficChallanResult,
} from "./traffic-challan.dto";
import dayjs from "@/lib/dayjs";
import { refreshPayrollForEmployeesIfActive } from "../payroll-summary/payroll-actions.service";

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
      branchId: true,
      designation: {
        select: {
          nameEn: true,
        },
      },
    },
  },
};

/**
 * Internal reusable function to create a traffic challan
 */
async function createTrafficChallanInternal(
  tx: PrismaTransactionClient,
  data: {
    employeeId: number;
    date: Date | string;
    type: "CHALLAN" | "RETURN";
    amount: number | any;
    description?: string;
    userId?: number;
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
      ...(data.userId && { createdBy: data.userId }),
    },
    select: trafficChallanSelect,
  });

  return trafficChallan;
}

/**
 * Create a new traffic challan
 */
export const createTrafficChallan = async (data: CreateTrafficChallanData) => {
  const user = await getCurrentUser();
  const userId = user?.id;

  const result = await prisma.$transaction(
    async (tx: PrismaTransactionClient) => {
      // Validate employee exists and check branch assignment
      const employee = await tx.employee.findUnique({
        where: { id: data.employeeId },
        select: { id: true, branchId: true },
      });

      if (!employee) {
        throw new Error(`Employee with ID ${data.employeeId} does not exist`);
      }

      // Security validation: verify branch assignment for branch-scoped users
      if (data.branchId && employee.branchId !== data.branchId) {
        throw new Error(
          "Access Denied: The selected employee belongs to another branch."
        );
      }

      const trafficChallan = await createTrafficChallanInternal(tx, {
        employeeId: data.employeeId,
        date: data.date,
        type: data.type,
        amount: data.amount,
        description: data.description,
        userId,
      });

      // Convert Decimal to number for client serialization
      return {
        ...trafficChallan,
        amount: Number(trafficChallan.amount),
      };
    }
  );

  // Trigger payroll refresh if active
  await refreshPayrollForEmployeesIfActive([data.employeeId], data.date);

  return result;
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
    amount: Number(trafficChallan.amount),
  };
};

/**
 * Update traffic challan
 */
export const updateTrafficChallan = async (
  id: number,
  data: UpdateTrafficChallanData
) => {
  const user = await getCurrentUser();
  const userId = user?.id;

  const result = await prisma.$transaction(
    async (tx: PrismaTransactionClient) => {
      // Check if traffic challan exists and get current data
      const existingTrafficChallan = await tx.trafficChallan.findUnique({
        where: { id },
        select: {
          id: true,
          employee: { select: { branchId: true } },
        },
      });

      if (!existingTrafficChallan) {
        throw new Error("Traffic challan not found");
      }

      // Security validation: verify branch assignment for branch-scoped users
      if (
        data.branchId &&
        existingTrafficChallan.employee?.branchId !== data.branchId
      ) {
        throw new Error(
          "Access Denied: Traffic violation belongs to another branch."
        );
      }

      // Validate employee if provided
      if (data.employeeId !== undefined) {
        const employee = await tx.employee.findUnique({
          where: { id: data.employeeId },
          select: { id: true, branchId: true },
        });

        if (!employee) {
          throw new Error(`Employee with ID ${data.employeeId} does not exist`);
        }

        // Security validation: verify branch assignment for new employee
        if (data.branchId && employee.branchId !== data.branchId) {
          throw new Error(
            "Access Denied: The selected employee belongs to another branch."
          );
        }
      }

      const updateData: any = {};

      if (data.employeeId !== undefined)
        updateData.employeeId = data.employeeId;
      if (data.date !== undefined) updateData.date = dayjs(data.date).toDate();
      if (data.type !== undefined) updateData.type = data.type;
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.description !== undefined)
        updateData.description = data.description;

      const trafficChallan = await tx.trafficChallan.update({
        where: { id },
        data: { ...updateData, ...(userId && { updatedBy: userId }) },
        select: trafficChallanSelect,
      });

      // Convert Decimal to number for client serialization
      return {
        ...trafficChallan,
        amount: Number(trafficChallan.amount),
      };
    }
  );

  // Trigger payroll refresh if active
  await refreshPayrollForEmployeesIfActive([result.employeeId], result.date);

  return result;
};

/**
 * Delete traffic challan
 */
export const deleteTrafficChallan = async (
  id: number,
  branchId?: number | null
) => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if traffic challan exists
    const existingTrafficChallan = await tx.trafficChallan.findUnique({
      where: { id },
      select: {
        id: true,
        employeeId: true,
        date: true,
        employee: { select: { branchId: true } },
      },
    });

    if (!existingTrafficChallan) {
      throw new Error("Traffic challan not found");
    }

    // Security validation: verify branch assignment for branch-scoped users
    if (branchId && existingTrafficChallan.employee?.branchId !== branchId) {
      throw new Error(
        "Access Denied: Traffic violation belongs to another branch."
      );
    }

    await tx.trafficChallan.delete({
      where: { id },
    });

    // Trigger payroll refresh if active
    await refreshPayrollForEmployeesIfActive(
      [existingTrafficChallan.employeeId],
      existingTrafficChallan.date
    );

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
      where.date.gt = dayjs(params.startDate).toDate();
    }
    if (params.endDate) {
      where.date.lte = dayjs(params.endDate).toDate();
    }
  }

  // Filter by branchId
  if (params.branchId !== undefined && params.branchId !== null) {
    where.employee = {
      ...where.employee,
      branchId: params.branchId,
    };
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
    amount: Number(challan.amount),
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
export const listAllTrafficChallans = async (
  params: ListAllTrafficChallanParams
): Promise<{ trafficChallans: ListedTrafficChallan[] }> => {
  // Build where clause
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
      where.date.gt = dayjs(params.startDate).toDate();
    }
    if (params.endDate) {
      where.date.lte = dayjs(params.endDate).toDate();
    }
  }

  // Filter by branchId
  if (params.branchId !== undefined && params.branchId !== null) {
    where.employee = {
      ...where.employee,
      branchId: params.branchId,
    };
  }

  const trafficChallans = await prisma.trafficChallan.findMany({
    where,
    select: trafficChallanSelect,
    orderBy: { date: "asc" },
  });

  return {
    trafficChallans: trafficChallans.map((trafficChallan) => ({
      ...trafficChallan,
      amount: Number(trafficChallan.amount),
    })),
  };
};

/**
 * Bulk upload traffic challans
 */
export const bulkUploadTrafficChallans = async (
  data: BulkUploadTrafficChallanData
): Promise<BulkUploadTrafficChallanResult> => {
  const user = await getCurrentUser();
  const userId = user?.id;

  const refreshDetails: Map<string, Set<number>> = new Map();
  const res: BulkUploadTrafficChallanResult = {
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
          select: { id: true, branchId: true },
        });

        if (!employee) {
          throw new Error(`Employee with code ${row.employeeCode} not found`);
        }

        // Security validation for bulk upload: verify branch assignment
        if (data.branchId && employee.branchId !== data.branchId) {
          throw new Error(
            `Access Denied: Employee ${row.employeeCode} belongs to another branch.`
          );
        }

        // Create traffic challan using reusable function
        await createTrafficChallanInternal(tx, {
          employeeId: employee.id,
          date: row.date,
          type: row.type,
          amount: row.amount,
          description: row.description,
          userId,
        });

        // Collect info for batch refresh
        const dateKey = dayjs(row.date).format("YYYY-MM");
        if (!refreshDetails.has(dateKey)) {
          refreshDetails.set(dateKey, new Set());
        }
        refreshDetails.get(dateKey)!.add(employee.id);
      });

      res.success++;
    } catch (error: any) {
      res.failed++;
      res.errors.push({
        row: rowNumber,
        data: row,
        error: error.message || "Unknown error",
      });
    }
  }

  // Trigger payroll refresh for all affected months/employees
  for (const [dateKey, employeeIds] of refreshDetails.entries()) {
    const [year, month] = dateKey.split("-").map(Number);
    const dateObj = dayjs()
      .year(year)
      .month(month - 1)
      .toDate();
    await refreshPayrollForEmployeesIfActive(Array.from(employeeIds), dateObj);
  }

  return res;
};
