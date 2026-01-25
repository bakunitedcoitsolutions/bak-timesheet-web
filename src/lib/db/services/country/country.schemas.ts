/**
 * Country Service Schemas (Client-Safe)
 * Zod schemas for frontend validation
 * This file contains ONLY schemas and types - no server-side imports
 */

import { z } from "zod";

export const CreateCountrySchema = z.object({
  nameEn: z.string().min(2, "Name is required"),
  nameAr: z.string().min(2, "Arabic name is required").optional(),
  isActive: z.boolean().default(true).optional(),
});

export const UpdateCountrySchema = z.object({
  id: z.number().int().positive(),
  nameEn: z.string().min(2, "Name is required").optional(),
  nameAr: z.string().min(2, "Arabic name is required").optional(),
  isActive: z.boolean().optional(),
});

export const ListCountriesParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  sortBy: z.enum(["nameEn", "nameAr", "isActive"]).optional(),
});

export const GetCountryByIdSchema = z.object({
  id: z.number().int().positive(),
});

export const DeleteCountrySchema = z.object({
  id: z.number().int().positive(),
});

export type CreateCountryInput = z.infer<typeof CreateCountrySchema>;
export type UpdateCountryInput = z.infer<typeof UpdateCountrySchema>;
export type ListCountriesParamsInput = z.infer<
  typeof ListCountriesParamsSchema
>;
export type GetCountryByIdInput = z.infer<typeof GetCountryByIdSchema>;
export type DeleteCountryInput = z.infer<typeof DeleteCountrySchema>;
