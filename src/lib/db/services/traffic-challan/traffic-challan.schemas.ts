/**
 * Traffic Challan Service Schemas (Client-Safe)
 * Zod schemas for frontend validation
 * This file contains ONLY schemas and types - no server-side imports
 */

import { z } from "zod";

export const CreateTrafficChallanSchema = z.object({
  employeeId: z.number().int().positive("Employee is required"),
  date: z.coerce.date(),
  type: z.enum(["CHALLAN", "RETURN"]),
  amount: z.number().positive("Amount must be greater than 0"),
  description: z.string().optional(),
});

export const UpdateTrafficChallanSchema = z.object({
  id: z.number().int().positive(),
  employeeId: z.number().int().positive().optional(),
  date: z.coerce.date().optional(),
  type: z.enum(["CHALLAN", "RETURN"]).optional(),
  amount: z.number().positive().optional(),
  description: z.string().optional(),
});

export const ListTrafficChallansParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  sortBy: z
    .enum([
      "date",
      "type",
      "amount",
      "createdAt",
    ])
    .optional(),
  employeeId: z.number().int().positive().optional(),
  type: z.enum(["CHALLAN", "RETURN"]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const GetTrafficChallanByIdSchema = z.object({
  id: z.number().int().positive(),
});

export const DeleteTrafficChallanSchema = z.object({
  id: z.number().int().positive(),
});

export const BulkUploadTrafficChallanRowSchema = z.object({
  employeeCode: z.number().int().positive("Employee code is required"),
  date: z.coerce.date(),
  type: z.enum(["CHALLAN", "RETURN"]),
  amount: z.number().positive("Amount must be greater than 0"),
  description: z.string().optional(),
});

export const BulkUploadTrafficChallanSchema = z.object({
  trafficChallans: z.array(BulkUploadTrafficChallanRowSchema).min(1, "At least one traffic challan is required"),
});

// Type exports for use in actions
export type CreateTrafficChallanInput = z.infer<
  typeof CreateTrafficChallanSchema
>;
export type UpdateTrafficChallanInput = z.infer<
  typeof UpdateTrafficChallanSchema
>;
export type ListTrafficChallansParamsInput = z.infer<
  typeof ListTrafficChallansParamsSchema
>;
export type GetTrafficChallanByIdInput = z.infer<
  typeof GetTrafficChallanByIdSchema
>;
export type DeleteTrafficChallanInput = z.infer<
  typeof DeleteTrafficChallanSchema
>;
export type BulkUploadTrafficChallanInput = z.infer<typeof BulkUploadTrafficChallanSchema>;
