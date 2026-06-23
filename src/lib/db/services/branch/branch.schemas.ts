/**
 * Branch Service Schemas (Client-Safe)
 * Zod schemas for frontend validation
 * This file contains ONLY schemas and types - no server-side imports
 */

import { z } from "zod";

export const CreateBranchSchema = z.object({
  nameEn: z.string().min(2, "Name is required"),
  nameAr: z.string().min(2, "Arabic name is required").optional(),
  isMain: z.boolean().default(true).optional(),
  parentBranchId: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true).optional(),
}).refine(data => {
  if (data.isMain === false && !data.parentBranchId) {
    return false;
  }
  return true;
}, {
  message: "Parent branch is required for sub branch",
  path: ["parentBranchId"],
});

export const UpdateBranchSchema = z.object({
  id: z.number().int().positive(),
  nameEn: z.string().min(2, "Name is required").optional(),
  nameAr: z.string().min(2, "Arabic name is required").optional(),
  isMain: z.boolean().optional(),
  parentBranchId: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
}).refine(data => {
  if (data.isMain === false && !data.parentBranchId) {
    return false;
  }
  return true;
}, {
  message: "Parent branch is required for sub branch",
  path: ["parentBranchId"],
});

export const ListBranchesParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  search: z.string().optional(),
  isMain: z.boolean().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  sortBy: z.enum(["nameEn", "nameAr", "isActive", "isMain"]).optional(),
});

export const GetBranchByIdSchema = z.object({
  id: z.number().int().positive(),
});

export const DeleteBranchSchema = z.object({
  id: z.number().int().positive(),
});

export type CreateBranchInput = z.infer<typeof CreateBranchSchema>;
export type UpdateBranchInput = z.infer<typeof UpdateBranchSchema>;
export type ListBranchesParamsInput = z.infer<typeof ListBranchesParamsSchema>;
export type GetBranchByIdInput = z.infer<typeof GetBranchByIdSchema>;
export type DeleteBranchInput = z.infer<typeof DeleteBranchSchema>;
