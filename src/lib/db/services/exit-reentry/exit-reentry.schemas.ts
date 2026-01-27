/**
 * Exit Reentry Service Schemas (Client-Safe)
 * Zod schemas for frontend validation
 * This file contains ONLY schemas and types - no server-side imports
 */

import { z } from "zod";

export const CreateExitReentrySchema = z.object({
  employeeId: z.number().int().positive("Employee is required"),
  designationId: z.number().int().positive().optional(),
  date: z.coerce.date(),
  type: z.enum(["EXIT", "ENTRY"]),
  remarks: z.string().optional(),
});

export const UpdateExitReentrySchema = z.object({
  id: z.number().int().positive(),
  employeeId: z.number().int().positive().optional(),
  designationId: z.number().int().positive().optional(),
  date: z.coerce.date().optional(),
  type: z.enum(["EXIT", "ENTRY"]).optional(),
  remarks: z.string().optional(),
});

export const ListExitReentriesParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  sortBy: z
    .enum([
      "date",
      "type",
      "createdAt",
    ])
    .optional(),
  employeeId: z.number().int().positive().optional(),
  designationId: z.number().int().positive().optional(),
  type: z.enum(["EXIT", "ENTRY"]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const GetExitReentryByIdSchema = z.object({
  id: z.number().int().positive(),
});

export const DeleteExitReentrySchema = z.object({
  id: z.number().int().positive(),
});

// Type exports for use in actions
export type CreateExitReentryInput = z.infer<typeof CreateExitReentrySchema>;
export type UpdateExitReentryInput = z.infer<typeof UpdateExitReentrySchema>;
export type ListExitReentriesParamsInput = z.infer<
  typeof ListExitReentriesParamsSchema
>;
export type GetExitReentryByIdInput = z.infer<typeof GetExitReentryByIdSchema>;
export type DeleteExitReentryInput = z.infer<typeof DeleteExitReentrySchema>;
