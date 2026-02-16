import { z } from "zod";

export const CreateAllowanceNotAvailableSchema = z.object({
  nameEn: z.string().min(1, "Name is required"),
  nameAr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  type: z.enum(["BREAKFAST", "FOOD", "MOBILE", "OTHER"]),
  isActive: z.boolean().optional().default(true),
});

export const UpdateAllowanceNotAvailableSchema =
  CreateAllowanceNotAvailableSchema.partial().extend({
    id: z.number(),
  });

export const ListAllowanceNotAvailableParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  type: z.enum(["BREAKFAST", "FOOD", "MOBILE", "OTHER"]).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const GetAllowanceNotAvailableByIdSchema = z.object({
  id: z.number(),
});

export const DeleteAllowanceNotAvailableSchema = z.object({
  id: z.number(),
});

export type CreateAllowanceNotAvailableInput = z.infer<
  typeof CreateAllowanceNotAvailableSchema
>;
export type UpdateAllowanceNotAvailableInput = z.infer<
  typeof UpdateAllowanceNotAvailableSchema
>;
export type ListAllowanceNotAvailableParamsInput = z.infer<
  typeof ListAllowanceNotAvailableParamsSchema
>;
export type GetAllowanceNotAvailableByIdInput = z.infer<
  typeof GetAllowanceNotAvailableByIdSchema
>;
export type DeleteAllowanceNotAvailableInput = z.infer<
  typeof DeleteAllowanceNotAvailableSchema
>;
