/**
 * Project Service Schemas (Client-Safe)
 * Zod schemas for frontend validation
 * This file contains ONLY schemas and types - no server-side imports
 */

import { z } from "zod";

export const CreateProjectSchema = z.object({
  nameEn: z.string().min(1, "Name is required"),
  nameAr: z.string().optional(),
  branchId: z.number().int().positive().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true).optional(),
});

export const UpdateProjectSchema = z.object({
  id: z.number().int().positive(),
  nameEn: z.string().min(1, "Name is required").optional(),
  nameAr: z.string().optional(),
  branchId: z.number().int().positive().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const ListProjectsParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  sortBy: z
    .enum([
      "nameEn",
      "nameAr",
      "isActive",
      "createdAt",
    ])
    .optional(),
  branchId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export const GetProjectByIdSchema = z.object({
  id: z.number().int().positive(),
});

export const DeleteProjectSchema = z.object({
  id: z.number().int().positive(),
});

// Type exports for use in actions
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type ListProjectsParamsInput = z.infer<
  typeof ListProjectsParamsSchema
>;
export type GetProjectByIdInput = z.infer<typeof GetProjectByIdSchema>;
export type DeleteProjectInput = z.infer<typeof DeleteProjectSchema>;
