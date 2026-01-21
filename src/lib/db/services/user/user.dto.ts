/**
 * User Service DTOs
 * Type definitions for user service operations
 */

import { z } from "zod";

import type { BranchInterface } from "../branch";
import type { UserPrivileges } from "@/utils/dummy";

// ---------------------------------------------------------------------------
// Part 1: Types used by services (service layer contracts)
// ---------------------------------------------------------------------------

export interface CreateUserData {
  nameEn: string;
  nameAr?: string;
  email: string;
  password: string;
  userRoleId: number;
  branchId?: number; // Required if userRoleId === 3 (Branch Manager)
  privileges?: UserPrivileges;
  isActive?: boolean;
  createdBy?: number; // ID of user who is creating this record
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
  updatedBy?: number; // ID of user who is updating this record
}

export type ListUsersSortableField = "nameEn" | "nameAr" | "isActive";

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: number;
  branchId?: number;
  isActive?: boolean;
  sortOrder?: "asc" | "desc";
  sortBy?: ListUsersSortableField;
}

export interface UserRoleInterface {
  id: number;
  nameEn: string;
  nameAr: string;
  access: string;
  isActive: boolean;
  createdAt: Date | any;
  updatedAt: Date | any;
}

export interface UserPrivilegeInterface {
  id: number;
  userId: number;
  privileges: any;
  createdAt: Date | any;
  updatedAt: Date | any;
}

export interface UserWithoutPassword {
  id: number;
  nameEn: string;
  nameAr: string | null;
  email: string;
  userRoleId: number;
  branchId: number | null;
  isActive: boolean;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
  branch?: BranchInterface;
  userRole?: UserRoleInterface;
  privileges?: UserPrivilegeInterface;
}

export interface ListedUser extends Omit<
  UserWithoutPassword,
  "branch" | "userRole"
> {
  userRole: Omit<UserRoleInterface, "nameAr"> & { nameAr: string | null };
  branch: { nameEn: string } | null;
}

export interface ListUsersResponse {
  users: ListedUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ---------------------------------------------------------------------------
// Part 2: Schemas (frontend/backend validation) not required by services
// ---------------------------------------------------------------------------

export const CreateUserSchema = z.object({
  nameEn: z.string().min(2, "Name is required"),
  nameAr: z.string().min(2, "Arabic name is required").optional(),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  userRoleId: z.number().min(1, "User role is required"),
  branchId: z.number().optional(),
  privileges: z.any().optional(),
  isActive: z.boolean().default(true).optional(),
  createdBy: z.number().optional(),
});

export const UpdateUserSchema = z.object({
  nameEn: z.string().min(2, "Name is required").optional(),
  nameAr: z.string().min(2, "Arabic name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .optional(),
  userRoleId: z.number().min(1, "User role is required").optional(),
  branchId: z.number().optional(),
  privileges: z.any().optional(),
  isActive: z.boolean().optional(),
  updatedBy: z.number().optional(),
});

export const ListUsersParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  search: z.string().optional(),
  roleId: z.number().int().positive().optional(),
  branchId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  sortBy: z.enum(["nameEn", "nameAr", "isActive"]).optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type ListUsersParamsInput = z.infer<typeof ListUsersParamsSchema>;
