/**
 * User Service Schemas (Client-Safe)
 * Zod schemas for frontend validation
 * This file contains ONLY schemas and types - no server-side imports
 */

import { z } from "zod";

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
