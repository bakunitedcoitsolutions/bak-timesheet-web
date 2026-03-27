/**
 * Payment Method Service Schemas (Client-Safe)
 * Zod schemas for frontend validation
 * This file contains ONLY schemas and types - no server-side imports
 */

import { z } from "zod";

export const CreatePaymentMethodSchema = z.object({
  nameEn: z.string().min(2, "Name is required"),
  nameAr: z.string().min(2, "Arabic name is required").optional(),
  isActive: z.boolean().default(true).optional(),
});

export const UpdatePaymentMethodSchema = z.object({
  id: z.number().int().positive(),
  nameEn: z.string().min(2, "Name is required").optional(),
  nameAr: z.string().min(2, "Arabic name is required").optional(),
  isActive: z.boolean().optional(),
});

export const ListPaymentMethodsParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  sortBy: z.enum(["nameEn", "nameAr", "isActive", "createdAt"]).optional(),
});

export const GetPaymentMethodByIdSchema = z.object({
  id: z.number().int().positive(),
});

export const DeletePaymentMethodSchema = z.object({
  id: z.number().int().positive(),
});

export type CreatePaymentMethodInput = z.infer<typeof CreatePaymentMethodSchema>;
export type UpdatePaymentMethodInput = z.infer<typeof UpdatePaymentMethodSchema>;
export type ListPaymentMethodsParamsInput = z.infer<
  typeof ListPaymentMethodsParamsSchema
>;
export type GetPaymentMethodByIdInput = z.infer<
  typeof GetPaymentMethodByIdSchema
>;
export type DeletePaymentMethodInput = z.infer<
  typeof DeletePaymentMethodSchema
>;
