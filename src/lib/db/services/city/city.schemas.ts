/**
 * City Service Schemas (Client-Safe)
 * Zod schemas for frontend validation
 * This file contains ONLY schemas and types - no server-side imports
 */

import { z } from "zod";

export const CreateCitySchema = z.object({
  nameEn: z.string().min(2, "Name is required"),
  nameAr: z.string().min(2, "Arabic name is required").optional(),
  countryId: z.number().int().positive().optional(),
  isActive: z.boolean().default(true).optional(),
  showInPayroll: z.boolean().default(false).optional(),
});

export const UpdateCitySchema = z.object({
  id: z.number().int().positive(),
  nameEn: z.string().min(2, "Name is required").optional(),
  nameAr: z.string().min(2, "Arabic name is required").optional(),
  countryId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  showInPayroll: z.boolean().optional(),
});

export const ListCitiesParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  search: z.string().optional(),
  countryId: z.number().int().positive().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  sortBy: z.enum(["nameEn", "nameAr", "isActive", "showInPayroll"]).optional(),
});

export const GetCityByIdSchema = z.object({
  id: z.number().int().positive(),
});

export const DeleteCitySchema = z.object({
  id: z.number().int().positive(),
});

export type CreateCityInput = z.infer<typeof CreateCitySchema>;
export type UpdateCityInput = z.infer<typeof UpdateCitySchema>;
export type ListCitiesParamsInput = z.infer<typeof ListCitiesParamsSchema>;
export type GetCityByIdInput = z.infer<typeof GetCityByIdSchema>;
export type DeleteCityInput = z.infer<typeof DeleteCitySchema>;
