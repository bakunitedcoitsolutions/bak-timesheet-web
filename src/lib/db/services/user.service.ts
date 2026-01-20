/**
 * User Service
 * Business logic for user operations
 */

import { hash } from "bcryptjs";

import { prisma } from "@/lib/db/prisma";
import type { UserPrivileges } from "@/utils/dummy";
import {
  invalidateUserSessions,
  updateUserActiveStatusCache,
} from "@/lib/auth/security";
import {
  determineBranchIdForUpdate,
  validateBranchManagerBranchId,
} from "@/utils/helpers/user-branch";

// Type helper for Prisma transaction client
// Extracts the transaction client type from Prisma's $transaction method
type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

// Reusable select object that excludes password
const userSelectWithoutPassword = {
  id: true,
  nameEn: true,
  nameAr: true,
  email: true,
  userRoleId: true,
  branchId: true,
  isActive: true,
  createdBy: true,
  updatedBy: true,
  createdAt: true,
  updatedAt: true,
};

// Select with relations (excluding password)
// Only include name fields for branch, creator, and updater relations
const userSelectWithRelations = {
  ...userSelectWithoutPassword,
  userRole: true,
  branch: {
    select: {
      id: true,
      nameEn: true,
    },
  },
  creator: {
    select: {
      nameEn: true,
    },
  },
  updater: {
    select: {
      nameEn: true,
    },
  },
  privileges: true,
};

export interface CreateUserData {
  nameEn: string;
  nameAr?: string;
  email: string;
  password: string;
  userRoleId: number;
  branchId?: number; // Required if userRoleId === 3 (Branch Manager)
  privileges?: UserPrivileges;
  isActive?: boolean;
  createdBy?: string; // ID of user who is creating this record
}

export interface UpdateUserData {
  nameEn?: string;
  nameAr?: string;
  email?: string;
  password?: string;
  userRoleId?: number;
  branchId?: number; // Required if userRoleId === 3 (Branch Manager)
  privileges?: UserPrivileges;
  isActive?: boolean;
  updatedBy?: string; // ID of user who is updating this record
}

export const userService = {
  /**
   * Create a new user
   */
  async create(data: CreateUserData) {
    const hashedPassword = await hash(data.password, 12);

    // Create user with transaction to handle related data
    const user = await prisma.$transaction(
      async (tx: PrismaTransactionClient) => {
        // Validate: Branch Manager (roleId: 3) must have branchId
        if (data.userRoleId === 3 && !data.branchId) {
          throw new Error("Branch Manager must be assigned to a branch");
        }

        // Validate: Email must be unique
        const existingUser = await tx.user.findUnique({
          where: { email: data.email },
          select: { id: true },
        });

        if (existingUser) {
          throw new Error("Email already exists");
        }

        // Create user (exclude password from response)
        // Only include branchId when userRoleId is 3 (Branch Manager)
        const userData: any = {
          nameEn: data.nameEn,
          nameAr: data.nameAr,
          email: data.email,
          password: hashedPassword,
          userRoleId: data.userRoleId,
        };

        // branchId is only available/set when userRoleId is 3 (Branch Manager)
        if (data.userRoleId === 3) {
          userData.branchId = data.branchId;
        }

        // Set createdBy if provided
        if (data.createdBy) {
          userData.createdBy = data.createdBy;
        }

        const newUser = await tx.user.create({
          data: userData,
          select: userSelectWithoutPassword,
        });

        // Create privileges if user has "User with Privileges" role (roleId: 4)
        if (data.userRoleId === 4 && data.privileges) {
          await tx.userPrivilege.create({
            data: {
              userId: newUser.id,
              privileges: data.privileges as any,
            },
          });
        }

        return newUser;
      }
    );

    return user;
  },

  /**
   * Get user by ID with relations (password excluded)
   */
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: userSelectWithRelations,
    });
  },

  /**
   * Get user by email (for authentication - includes password)
   * Use findById for regular queries
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        userRole: true,
        branch: true,
        privileges: true,
      },
      // Note: Password is included here for authentication purposes only
      // This method should only be used in auth flows
    });
  },

  /**
   * Get user by email without password (for public queries)
   */
  async findByEmailSafe(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: userSelectWithRelations,
    });
  },

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return prisma.$transaction(async (tx: PrismaTransactionClient) => {
      const updateData: any = {};
      // email cannot be changed

      if (data.nameEn !== undefined) updateData.nameEn = data.nameEn;
      if (data.nameAr !== undefined) updateData.nameAr = data.nameAr;
      if (data.userRoleId !== undefined)
        updateData.userRoleId = data.userRoleId;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      // Set updatedBy if provided
      if (data.updatedBy) {
        updateData.updatedBy = data.updatedBy;
      }

      // Hash password if provided
      if (data.password) {
        updateData.password = await hash(data.password, 12);
      }

      // Get current user data before update
      const currentUser = await tx.user.findUnique({
        where: { id },
        select: { userRoleId: true, branchId: true, isActive: true },
      });

      if (!currentUser) {
        throw new Error("User not found");
      }

      // Determine final role
      const finalRoleId =
        data.userRoleId !== undefined
          ? data.userRoleId
          : currentUser.userRoleId;

      // Handle branchId based on role changes using helper function
      const { branchIdToSet, finalBranchId } = determineBranchIdForUpdate(
        currentUser.userRoleId,
        data.userRoleId,
        currentUser.branchId,
        data.branchId
      );

      // Set branchId in updateData if determined by helper
      if (branchIdToSet !== undefined) {
        updateData.branchId = branchIdToSet;
      }

      // Validate: Branch Manager (roleId: 3) must have branchId
      validateBranchManagerBranchId(finalRoleId, finalBranchId);

      // Update user (exclude password from response)
      const updatedUser = await tx.user.update({
        where: { id },
        data: updateData,
        select: userSelectWithoutPassword,
      });

      // If active status changed, update cache and invalidate sessions
      if (
        data.isActive !== undefined &&
        currentUser &&
        currentUser.isActive !== updatedUser.isActive
      ) {
        if (!updatedUser.isActive) {
          // User deactivated - invalidate sessions
          await invalidateUserSessions(id);
        }
        // Update Redis cache immediately
        await updateUserActiveStatusCache(id, updatedUser.isActive);
      }

      // Update privileges if user has "User with Privileges" role (roleId: 4)
      const finalRoleIdForPrivileges =
        data.userRoleId !== undefined
          ? data.userRoleId
          : currentUser.userRoleId;

      if (finalRoleIdForPrivileges === 4 && data.privileges !== undefined) {
        await tx.userPrivilege.upsert({
          where: { userId: id },
          create: {
            userId: id,
            privileges: data.privileges as any,
          },
          update: {
            privileges: data.privileges as any,
          },
        });
      } else if (data.userRoleId !== undefined && data.userRoleId !== 4) {
        // Remove privileges if role changed to something other than "User with Privileges"
        await tx.userPrivilege.deleteMany({
          where: { userId: id },
        });
      }

      return updatedUser;
    });
  },

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  },

  /**
   * List users with pagination and sorting
   */
  async list(params: {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: number;
    branchId?: number;
    isActive?: boolean;
    sortOrder?: "asc" | "desc"; // Sort direction
    sortBy?: string; // Column name to sort by (e.g., "nameEn", "email", "createdAt", "userRole.nameEn", "branch.nameEn")
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { nameEn: { contains: params.search, mode: "insensitive" } },
        { nameAr: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.roleId) where.userRoleId = params.roleId;
    if (params.branchId) where.branchId = params.branchId;
    if (params.isActive !== undefined) where.isActive = params.isActive;

    // Determine sort order (default: desc)
    const sortOrder = params.sortOrder || "desc";

    // Build orderBy clause based on sortBy parameter
    // Only allow sorting by: nameEn, nameAr, isActive
    let orderBy: any = { createdAt: "desc" }; // Default sort

    if (params.sortBy) {
      const sortBy = params.sortBy.trim();
      const validFields = ["nameEn", "nameAr", "isActive"];

      // Only allow sorting by the specified valid fields
      if (validFields.includes(sortBy)) {
        orderBy = { [sortBy]: sortOrder };
      }
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          ...userSelectWithoutPassword,
          userRole: true,
          branch: { select: { nameEn: true } },
        },
        orderBy,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};
