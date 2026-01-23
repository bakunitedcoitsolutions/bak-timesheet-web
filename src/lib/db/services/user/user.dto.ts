/**
 * User Service DTOs
 * Type definitions for user service operations
 */

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

export type ListUsersSortableField =
  | "nameEn"
  | "nameAr"
  | "isActive"
  | "email"
  | "userRoleId"
  | "branchId";

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
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
