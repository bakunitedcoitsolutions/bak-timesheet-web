import { z } from "zod";

export const GetPayrollSummaryByYearParamsSchema = z.object({
  year: z.number(),
  branchId: z.number().optional().nullable(),
});

export type GetPayrollSummaryByYearParamsInput = z.infer<
  typeof GetPayrollSummaryByYearParamsSchema
>;

export const UpdateMonthlyPayrollValuesSchema = z.object({
  payrollYear: z.number(),
  payrollMonth: z.number(),
  isPosted: z.boolean().optional().nullable(),
});

export type UpdateMonthlyPayrollValuesInput = z.infer<
  typeof UpdateMonthlyPayrollValuesSchema
>;
