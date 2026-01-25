/**
 * Payroll Section Service Schemas (Client-Safe)
 * Zod schemas for frontend validation
 * This file contains ONLY schemas and types - no server-side imports
 */

import { z } from "zod";

export const CreatePayrollSectionSchema = z.object({
  nameEn: z.string().min(2, "Name is required"),
  nameAr: z.string().min(2, "Arabic name is required").optional(),
  displayOrderKey: z.number().int().optional(),
  isActive: z.boolean().default(true).optional(),
});

export const UpdatePayrollSectionSchema = z.object({
  id: z.number().int().positive(),
  nameEn: z.string().min(2, "Name is required").optional(),
  nameAr: z.string().min(2, "Arabic name is required").optional(),
  displayOrderKey: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const ListPayrollSectionsParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  sortBy: z
    .enum(["nameEn", "nameAr", "isActive", "displayOrderKey"])
    .optional(),
});

export const GetPayrollSectionByIdSchema = z.object({
  id: z.number().int().positive(),
});

export const DeletePayrollSectionSchema = z.object({
  id: z.number().int().positive(),
});

export type CreatePayrollSectionInput = z.infer<
  typeof CreatePayrollSectionSchema
>;
export type UpdatePayrollSectionInput = z.infer<
  typeof UpdatePayrollSectionSchema
>;
export type ListPayrollSectionsParamsInput = z.infer<
  typeof ListPayrollSectionsParamsSchema
>;
export type GetPayrollSectionByIdInput = z.infer<
  typeof GetPayrollSectionByIdSchema
>;
export type DeletePayrollSectionInput = z.infer<
  typeof DeletePayrollSectionSchema
>;
