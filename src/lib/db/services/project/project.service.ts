/**
 * Project Service
 * Business logic for project operations
 */

import { prisma } from "@/lib/db/prisma";
import type {
  CreateProjectData,
  UpdateProjectData,
  ListProjectsParams,
  ListProjectsResponse,
} from "./project.dto";

// Type helper for Prisma transaction client
type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

// Reusable select object
const projectSelect = {
  id: true,
  nameEn: true,
  nameAr: true,
  branchId: true,
  description: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Create a new project
 */
export const createProject = async (data: CreateProjectData) => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Validate: nameEn must be unique
    const existingProject = await tx.project.findFirst({
      where: { nameEn: data.nameEn },
      select: { id: true },
    });

    if (existingProject) {
      throw new Error("Project name already exists");
    }

    // Validate branchId if provided
    if (data.branchId !== undefined) {
      const branch = await tx.branch.findUnique({
        where: { id: data.branchId },
        select: { id: true },
      });

      if (!branch) {
        throw new Error(`Branch with ID ${data.branchId} does not exist`);
      }
    }

    const project = await tx.project.create({
      data: {
        nameEn: data.nameEn,
        nameAr: data.nameAr ?? null,
        branchId: data.branchId ?? null,
        description: data.description ?? null,
        isActive: data.isActive ?? true,
      },
      select: projectSelect,
    });

    return project;
  });
};

/**
 * Get project by ID
 */
export const findProjectById = async (id: number) => {
  const project = await prisma.project.findUnique({
    where: { id },
    select: projectSelect,
  });

  if (!project) {
    return null;
  }

  return project;
};

/**
 * Update project
 */
export const updateProject = async (id: number, data: UpdateProjectData) => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if project exists
    const existingProject = await tx.project.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingProject) {
      throw new Error("Project not found");
    }

    // Validate: nameEn must be unique (if being updated)
    if (data.nameEn !== undefined) {
      const duplicateProject = await tx.project.findFirst({
        where: {
          nameEn: data.nameEn,
          NOT: { id },
        },
        select: { id: true },
      });

      if (duplicateProject) {
        throw new Error("Project name already exists");
      }
    }

    // Validate branchId if provided
    if (data.branchId !== undefined && data.branchId !== null) {
      const branch = await tx.branch.findUnique({
        where: { id: data.branchId },
        select: { id: true },
      });

      if (!branch) {
        throw new Error(`Branch with ID ${data.branchId} does not exist`);
      }
    }

    const updateData: any = {};

    if (data.nameEn !== undefined) updateData.nameEn = data.nameEn;
    if (data.nameAr !== undefined) updateData.nameAr = data.nameAr ?? null;
    if (data.branchId !== undefined)
      updateData.branchId = data.branchId ?? null;
    if (data.description !== undefined)
      updateData.description = data.description ?? null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const project = await tx.project.update({
      where: { id },
      data: updateData,
      select: projectSelect,
    });

    return project;
  });
};

/**
 * Delete project
 */
export const deleteProject = async (id: number) => {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Check if project exists
    const existingProject = await tx.project.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingProject) {
      throw new Error("Project not found");
    }

    // Check if project is used in any timesheets
    const timesheetCount = await tx.timesheet.count({
      where: {
        OR: [{ project1Id: id }, { project2Id: id }],
      },
    });

    if (timesheetCount > 0) {
      throw new Error("Cannot delete project: It is being used in timesheets");
    }

    await tx.project.delete({
      where: { id },
    });

    return { success: true };
  });
};

/**
 * List projects with pagination, sorting, and search
 */
export const listProjects = async (
  params: ListProjectsParams
): Promise<ListProjectsResponse> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  // Search filter
  if (params.search) {
    where.OR = [
      { nameEn: { contains: params.search, mode: "insensitive" } },
      { nameAr: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }

  // Filter by branchId
  if (params.branchId !== undefined) {
    where.branchId = params.branchId;
  }

  // Filter by isActive
  if (params.isActive !== undefined) {
    where.isActive = params.isActive;
  }

  // Column filters
  if (params.nameEn) {
    where.nameEn = { contains: params.nameEn, mode: "insensitive" };
  }
  if (params.nameAr) {
    where.nameAr = { contains: params.nameAr, mode: "insensitive" };
  }
  if (params.description) {
    where.description = { contains: params.description, mode: "insensitive" };
  }

  // Build orderBy clause
  const orderBy: any = {};
  if (params.sortBy) {
    orderBy[params.sortBy] = params.sortOrder ?? "asc";
  } else {
    orderBy.createdAt = "desc"; // Default sort
  }

  // Get total count
  const total = await prisma.project.count({ where });

  // Get projects
  const projects = await prisma.project.findMany({
    where,
    skip,
    take: limit,
    select: projectSelect,
    orderBy,
  });

  return {
    projects,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
