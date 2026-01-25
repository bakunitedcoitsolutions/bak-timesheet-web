/**
 * GOSI City Service Schemas (Client-Safe)
 * Zod schemas for frontend validation
 * This file contains ONLY schemas and types - no server-side imports
 */

import { z } from "zod";

export const CreateGosiCitySchema = z.object({
  nameEn: z.string().min(2, "Name is required"),
  nameAr: z.string().min(2, "Arabic name is required").optional(),
  isActive: z.boolean().default(true).optional(),
});

export const UpdateGosiCitySchema = z.object({
  id: z.number().int().positive(),
  nameEn: z.string().min(2, "Name is required").optional(),
  nameAr: z.string().min(2, "Arabic name is required").optional(),
  isActive: z.boolean().optional(),
});

export const ListGosiCitiesParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  sortBy: z.enum(["nameEn", "nameAr", "isActive"]).optional(),
});

export const GetGosiCityByIdSchema = z.object({
  id: z.number().int().positive(),
});

export const DeleteGosiCitySchema = z.object({
  id: z.number().int().positive(),
});

export type CreateGosiCityInput = z.infer<typeof CreateGosiCitySchema>;
export type UpdateGosiCityInput = z.infer<typeof UpdateGosiCitySchema>;
export type ListGosiCitiesParamsInput = z.infer<
  typeof ListGosiCitiesParamsSchema
>;
export type GetGosiCityByIdInput = z.infer<typeof GetGosiCityByIdSchema>;
export type DeleteGosiCityInput = z.infer<typeof DeleteGosiCitySchema>;
