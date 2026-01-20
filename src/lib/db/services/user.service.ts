/**
 * User Service
 * Business logic for user operations
 */

import { prisma } from "@/lib/db/prisma";
import { hash } from "bcryptjs";
import type { UserPrivileges } from "@/utils/dummy";
import {
  invalidateUserSessions,
  updateUserActiveStatusCache,
} from "@/lib/auth/security";

// Reusable select object that excludes password
const userSelectWithoutPassword = {
  id: true,
  nameEn: true,
  nameAr: true,
  email: true,
  image: true,
  userRoleId: true,
  branchId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

// Select with relations (excluding password)
const userSelectWithRelations = {
  ...userSelectWithoutPassword,
  userRole: true,
  branch: true,
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
}

export const userService = {
  /**
   * Create a new user
   */
  async create(data: CreateUserData) {
    const hashedPassword = await hash(data.password, 12);

    // Create user with transaction to handle related data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await prisma.$transaction(async (tx: any) => {
      // Validate: Branch Manager (roleId: 3) must have branchId
      if (data.userRoleId === 3 && !data.branchId) {
        throw new Error("Branch Manager must be assigned to a branch");
      }

      // Create user (exclude password from response)
      const newUser = await tx.user.create({
        data: {
          nameEn: data.nameEn,
          nameAr: data.nameAr,
          email: data.email,
          password: hashedPassword,
          userRoleId: data.userRoleId,
          branchId: data.branchId,
        },
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
    });

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
    return prisma.$transaction(async (tx: any) => {
      const updateData: any = {};

      if (data.nameEn !== undefined) updateData.nameEn = data.nameEn;
      if (data.nameAr !== undefined) updateData.nameAr = data.nameAr;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.userRoleId !== undefined)
        updateData.userRoleId = data.userRoleId;
      if (data.branchId !== undefined) updateData.branchId = data.branchId;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      // Hash password if provided
      if (data.password) {
        updateData.password = await hash(data.password, 12);
      }

      // Get current user data before update
      const currentUser = await tx.user.findUnique({
        where: { id },
        select: { userRoleId: true, branchId: true, isActive: true },
      });

      // Validate: Branch Manager (roleId: 3) must have branchId
      const finalRoleId =
        data.userRoleId !== undefined
          ? data.userRoleId
          : currentUser?.userRoleId;
      const finalBranchId =
        data.branchId !== undefined ? data.branchId : currentUser?.branchId;
      if (finalRoleId === 3 && !finalBranchId) {
        throw new Error("Branch Manager must be assigned to a branch");
      }

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

      // Update privileges if user has "User with Privileges" role
      if (data.userRoleId === 4 && data.privileges !== undefined) {
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
      } else if (data.privileges !== undefined) {
        // Remove privileges if role changed
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
   * List users with pagination
   */
  async list(params: {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: number;
    branchId?: number;
    isActive?: boolean;
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

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          ...userSelectWithoutPassword,
          userRole: true,
          branch: true,
        },
        orderBy: { createdAt: "desc" },
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
