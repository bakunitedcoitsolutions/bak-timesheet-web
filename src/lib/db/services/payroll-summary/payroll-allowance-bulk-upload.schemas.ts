import { z } from "zod";

export const BulkUploadPayrollAllowanceRowSchema = z.object({
  employeeCode: z.number().int().positive(),
  tripAllowance: z.number().min(0).optional(),
  overtimeAllowance: z.number().min(0).optional(),
});

export const BulkUploadPayrollAllowanceSchema = z.object({
  payrollId: z.number().int().positive(),
  rows: z.array(BulkUploadPayrollAllowanceRowSchema).min(1),
});

export type BulkUploadPayrollAllowanceInput = z.infer<
  typeof BulkUploadPayrollAllowanceSchema
>;
