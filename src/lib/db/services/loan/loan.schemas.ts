/**
 * Loan Service Schemas (Client-Safe)
 * Zod schemas for frontend validation
 * This file contains ONLY schemas and types - no server-side imports
 */

import { z } from "zod";

export const CreateLoanSchema = z.object({
  employeeId: z.number().int().positive("Employee is required"),
  date: z.coerce.date(),
  type: z.enum(["LOAN", "RETURN"]),
  amount: z.number().positive("Amount must be greater than 0"),
  remarks: z.string().optional(),
});

export const UpdateLoanSchema = z.object({
  id: z.number().int().positive(),
  employeeId: z.number().int().positive().optional(),
  date: z.coerce.date().optional(),
  type: z.enum(["LOAN", "RETURN"]).optional(),
  amount: z.number().positive().optional(),
  remarks: z.string().optional(),
});

export const ListLoansParamsSchema = z.object({
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
  type: z.enum(["LOAN", "RETURN"]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const GetLoanByIdSchema = z.object({
  id: z.number().int().positive(),
});

export const DeleteLoanSchema = z.object({
  id: z.number().int().positive(),
});

// Type exports for use in actions
export type CreateLoanInput = z.infer<typeof CreateLoanSchema>;
export type UpdateLoanInput = z.infer<typeof UpdateLoanSchema>;
export type ListLoansParamsInput = z.infer<typeof ListLoansParamsSchema>;
export type GetLoanByIdInput = z.infer<typeof GetLoanByIdSchema>;
export type DeleteLoanInput = z.infer<typeof DeleteLoanSchema>;
