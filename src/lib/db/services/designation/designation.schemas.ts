/**
 * Designation Service Schemas (Client-Safe)
 * Zod schemas for frontend validation
 * This file contains ONLY schemas and types - no server-side imports
 */

import { z } from "zod";

export const CreateDesignationSchema = z.object({
  nameEn: z.string().min(2, "Name is required"),
  nameAr: z.string().min(2, "Arabic name is required").optional(),
  hoursPerDay: z.number().int().positive().optional(),
  displayOrderKey: z.number().int().optional(),
  color: z.string().optional(),
  isActive: z.boolean().default(true).optional(),
});

export const UpdateDesignationSchema = z.object({
  id: z.number().int().positive(),
  nameEn: z.string().min(2, "Name is required").optional(),
  nameAr: z.string().min(2, "Arabic name is required").optional(),
  hoursPerDay: z.number().int().positive().optional(),
  displayOrderKey: z.number().int().optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const ListDesignationsParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  sortBy: z
    .enum(["nameEn", "nameAr", "isActive", "displayOrderKey", "hoursPerDay"])
    .optional(),
});

export const GetDesignationByIdSchema = z.object({
  id: z.number().int().positive(),
});

export const DeleteDesignationSchema = z.object({
  id: z.number().int().positive(),
});

export type CreateDesignationInput = z.infer<typeof CreateDesignationSchema>;
export type UpdateDesignationInput = z.infer<typeof UpdateDesignationSchema>;
export type ListDesignationsParamsInput = z.infer<
  typeof ListDesignationsParamsSchema
>;
export type GetDesignationByIdInput = z.infer<typeof GetDesignationByIdSchema>;
export type DeleteDesignationInput = z.infer<typeof DeleteDesignationSchema>;
