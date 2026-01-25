/**
 * Employee Status Service Schemas (Client-Safe)
 * Zod schemas for frontend validation
 * This file contains ONLY schemas and types - no server-side imports
 */

import { z } from "zod";

export const CreateEmployeeStatusSchema = z.object({
  nameEn: z.string().min(2, "Name is required"),
  nameAr: z.string().min(2, "Arabic name is required").optional(),
  isActive: z.boolean().default(true).optional(),
});

export const UpdateEmployeeStatusSchema = z.object({
  id: z.number().int().positive(),
  nameEn: z.string().min(2, "Name is required").optional(),
  nameAr: z.string().min(2, "Arabic name is required").optional(),
  isActive: z.boolean().optional(),
});

export const ListEmployeeStatusesParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  sortBy: z.enum(["nameEn", "nameAr", "isActive"]).optional(),
});

export const GetEmployeeStatusByIdSchema = z.object({
  id: z.number().int().positive(),
});

export const DeleteEmployeeStatusSchema = z.object({
  id: z.number().int().positive(),
});

export type CreateEmployeeStatusInput = z.infer<
  typeof CreateEmployeeStatusSchema
>;
export type UpdateEmployeeStatusInput = z.infer<
  typeof UpdateEmployeeStatusSchema
>;
export type ListEmployeeStatusesParamsInput = z.infer<
  typeof ListEmployeeStatusesParamsSchema
>;
export type GetEmployeeStatusByIdInput = z.infer<
  typeof GetEmployeeStatusByIdSchema
>;
export type DeleteEmployeeStatusInput = z.infer<
  typeof DeleteEmployeeStatusSchema
>;
