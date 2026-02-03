/**
 * Allowance Exclusion Service Schemas (Client-Safe)
 * Zod schemas for frontend validation
 * This file contains ONLY schemas and types - no server-side imports
 */

import { z } from "zod";

export const CreateAllowanceExclusionSchema = z.object({
  nameEn: z.string().min(2, "Name (English) is required"),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  startDate: z.union([z.date(), z.string()]),
  endDate: z.union([z.date(), z.string()]),
  type: z.enum(["BREAKFAST", "FOOD", "MOBILE", "OTHER"]),
  isActive: z.boolean().default(true).optional(),
});

export const UpdateAllowanceExclusionSchema = z.object({
  id: z.number().int().positive(),
  nameEn: z.string().min(2, "Name (English) is required").optional(),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  startDate: z.union([z.date(), z.string()]).optional(),
  endDate: z.union([z.date(), z.string()]).optional(),
  type: z.enum(["BREAKFAST", "FOOD", "MOBILE", "OTHER"]).optional(),
  isActive: z.boolean().optional(),
});

export const ListAllowanceExclusionsParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  sortBy: z
    .enum(["nameEn", "nameAr", "startDate", "endDate", "type", "isActive"])
    .optional(),
  type: z.enum(["BREAKFAST", "FOOD", "MOBILE", "OTHER"]).optional(),
  isActive: z.boolean().optional(),
});

export const GetAllowanceExclusionByIdSchema = z.object({
  id: z.number().int().positive(),
});

export const DeleteAllowanceExclusionSchema = z.object({
  id: z.number().int().positive(),
});

// Type Exports
export type CreateAllowanceExclusionInput = z.infer<
  typeof CreateAllowanceExclusionSchema
>;
export type UpdateAllowanceExclusionInput = z.infer<
  typeof UpdateAllowanceExclusionSchema
>;
export type ListAllowanceExclusionsParamsInput = z.infer<
  typeof ListAllowanceExclusionsParamsSchema
>;
export type GetAllowanceExclusionByIdInput = z.infer<
  typeof GetAllowanceExclusionByIdSchema
>;
export type DeleteAllowanceExclusionInput = z.infer<
  typeof DeleteAllowanceExclusionSchema
>;
