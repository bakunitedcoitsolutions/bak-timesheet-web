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
  allowanceNotAvailableId: z.number().optional().nullable(),
});

export const RepostPayrollSchema = z.object({
  id: z.number(),
});

export const PostPayrollSchema = z.object({
  id: z.number().int().positive(),
});

export const RecalculatePayrollSummarySchema = z.object({
  id: z.number().int().positive(),
  statusId: z.number().int().optional(),
});

export type UpdateMonthlyPayrollValuesInput = z.infer<
  typeof UpdateMonthlyPayrollValuesSchema
>;

export type RunPayrollInput = z.infer<typeof RunPayrollSchema>;
export type RepostPayrollInput = z.infer<typeof RepostPayrollSchema>;
export type PostPayrollInput = z.infer<typeof PostPayrollSchema>;
export type RecalculatePayrollSummaryInput = z.infer<
  typeof RecalculatePayrollSummarySchema
>;

export const GetPayrollDetailsSchema = z
  .object({
    payrollId: z.number(),
    year: z.number().optional(),
    month: z.number().optional(),
    branchId: z.number().optional(),
    payrollSectionId: z.number().optional(),
    designationId: z.number().optional(),
    search: z.string().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  })
  .refine(
    (data) => data.designationId || data.payrollSectionId,
    "Either designationId or payrollSectionId must be provided"
  );
export type GetPayrollDetailsInput = z.infer<typeof GetPayrollDetailsSchema>;

export const GetPayrollDateSchema = z.object({
  id: z.number(),
});
export type GetPayrollDateInput = z.infer<typeof GetPayrollDateSchema>;

export const SavePayrollDetailsEntrySchema = z.object({
  id: z.number().int().positive(),
  loanDeduction: z.number().optional().nullable(),
  challanDeduction: z.number().optional().nullable(),
  cardSalary: z.number().optional().nullable(),
  cashSalary: z.number().optional().nullable(),
  remarks: z.string().optional().nullable(),
  paymentMethodId: z.number().optional().nullable(),
  payrollStatusId: z.number().optional().nullable(),
  netSalaryPayable: z.number().optional().nullable(),
  netLoan: z.number().optional().nullable(),
  netChallan: z.number().optional().nullable(),
});

export const SavePayrollDetailsBatchSchema = z.object({
  entries: z.array(SavePayrollDetailsEntrySchema),
});

export type SavePayrollDetailsBatchInput = z.infer<
  typeof SavePayrollDetailsBatchSchema
>;

export const RefreshPayrollDetailRowSchema = z.object({
  payrollDetailId: z.number().int().positive(),
});

export type RefreshPayrollDetailRowInput = z.infer<
  typeof RefreshPayrollDetailRowSchema
>;

export const GetSalarySlipDataSchema = z.object({
  payrollYear: z.number().int(),
  payrollMonth: z.number().int().min(1).max(12),
  designationId: z.number().int().optional().nullable(),
  payrollSectionId: z.number().int().optional().nullable(),
  employeeCodes: z.array(z.number().int()).optional().nullable(),
});

export type GetSalarySlipDataInput = z.infer<typeof GetSalarySlipDataSchema>;

export const GetPayrollReportSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
  payrollSectionIds: z.array(z.number().int()).optional().nullable(),
  designationId: z.number().int().optional().nullable(),
  employeeCodes: z.array(z.number().int()).optional().nullable(),
  paymentMethodId: z.number().int().optional().nullable(),
});
export type GetPayrollReportInput = z.infer<typeof GetPayrollReportSchema>;

export const GetPayrollSummaryByMonthYearSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
});
export type GetPayrollSummaryByMonthYearInput = z.infer<
  typeof GetPayrollSummaryByMonthYearSchema
>;
