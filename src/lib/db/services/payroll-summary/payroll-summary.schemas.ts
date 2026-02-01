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
  isPosted: z.boolean(),
});

export const RunPayrollSchema = z.object({
  payrollYear: z.number(),
  payrollMonth: z.number(),
});

export const RepostPayrollSchema = z.object({
  id: z.number(),
});

export type UpdateMonthlyPayrollValuesInput = z.infer<
  typeof UpdateMonthlyPayrollValuesSchema
>;

export type RunPayrollInput = z.infer<typeof RunPayrollSchema>;
export type RepostPayrollInput = z.infer<typeof RepostPayrollSchema>;
