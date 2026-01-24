/**
 * Branch Service
 * Business logic for branch operations
 */

import { prisma } from "@/lib/db/prisma";
import type {
  CreateBranchData,
  UpdateBranchData,
  ListBranchesParams,
  ListBranchesResponse,
} from "./branch.dto";

// Type helper for Prisma transaction client
// Extracts the transaction client type from Prisma's $transaction method
type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

// Reusable select object
const branchSelect = {
  id: true,
  nameEn: true,
  nameAr: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Create a new branch
 */
export const createBranch = async (data: CreateBranchData) => {
  // Validate: nameEn must be unique
  const existingBranch = await prisma.branch.findFirst({
    where: { nameEn: data.nameEn },
    select: { id: true },
  });

  if (existingBranch) {
    throw new Error("Branch name already exists");
  }

  const branch = await prisma.branch.create({
    data: {
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      isActive: data.isActive ?? true,
    },
    select: branchSelect,
  });

  return branch;
};

/**
 * Get branch by ID
 */
export const findBranchById = async (id: number) => {
  return prisma.branch.findUnique({
    where: { id },
    select: branchSelect,
  });
};

/**
 * Update branch
 */
export const updateBranch = async (id: number, data: UpdateBranchData) => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if branch exists
    const existingBranch = await tx.branch.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingBranch) {
      throw new Error("Branch not found");
    }

    // Validate: nameEn must be unique (if being updated)
    if (data.nameEn !== undefined) {
      const duplicateBranch = await tx.branch.findFirst({
        where: {
          nameEn: data.nameEn,
          NOT: { id },
        },
        select: { id: true },
      });

      if (duplicateBranch) {
        throw new Error("Branch name already exists");
      }
    }

    const updateData: any = {};

    if (data.nameEn !== undefined) updateData.nameEn = data.nameEn;
    if (data.nameAr !== undefined) updateData.nameAr = data.nameAr;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updatedBranch = await tx.branch.update({
      where: { id },
      data: updateData,
      select: branchSelect,
    });

    return updatedBranch;
  });
};

/**
 * Delete branch
 */
export const deleteBranch = async (id: number): Promise<void> => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if branch exists
    const existingBranch = await tx.branch.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingBranch) {
      throw new Error("Branch not found");
    }

    // Check if branch is being used by users
    const usersCount = await tx.user.count({
      where: { branchId: id },
    });

    if (usersCount > 0) {
      throw new Error(
        `Cannot delete branch: ${usersCount} user(s) are assigned to this branch`
      );
    }

    // Check if branch is being used by employees
    const employeesCount = await tx.employee.count({
      where: { branchId: id },
    });

    if (employeesCount > 0) {
      throw new Error(
        `Cannot delete branch: ${employeesCount} employee(s) are assigned to this branch`
      );
    }

    // Check if branch is being used by projects
    const projectsCount = await tx.project.count({
      where: { branchId: id },
    });

    if (projectsCount > 0) {
      throw new Error(
        `Cannot delete branch: ${projectsCount} project(s) are assigned to this branch`
      );
    }

    // Delete branch
    await tx.branch.delete({
      where: { id },
    });
  });
};

/**
 * List branches with pagination and sorting
 */
export const listBranches = async (
  params: ListBranchesParams
): Promise<ListBranchesResponse> => {
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
  // Only allow sorting by: nameEn, nameAr, isActive
  let orderBy: any = { createdAt: "desc" }; // Default sort

  if (params.sortBy) {
    const sortBy = params.sortBy;
    const validFields = ["nameEn", "nameAr", "isActive"] as const;

    // Only allow sorting by the specified valid fields
    if (validFields.includes(sortBy)) {
      orderBy = { [sortBy]: sortOrder };
    }
  }

  const [branches, total] = await Promise.all([
    prisma.branch.findMany({
      where,
      skip,
      take: limit,
      select: branchSelect,
      orderBy,
    }),
    prisma.branch.count({ where }),
  ]);

  return {
    branches,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
